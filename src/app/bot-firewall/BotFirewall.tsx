'use client';

import { INSTRUCTION_ANCHOR_ID, UseCaseWrapper } from '../../client/components/UseCaseWrapper/UseCaseWrapper';
import { USE_CASES } from '../../client/content';
import { useMutation, useQuery } from 'react-query';
import Button from '../../client/components/Button/Button';
import { BlockIpPayload, BlockIpResponse } from './api/block-ip/route';
import styles from './components/botFirewallComponents.module.scss';
import { VisitorQueryContext, useVisitorData } from '@fingerprintjs/fingerprintjs-pro-react';
import { OptionsObject as SnackbarOptions, enqueueSnackbar } from 'notistack';
import ChevronIcon from '../../client/img/chevronBlack.svg';
import Image from 'next/image';
import Link from 'next/link';
import { FunctionComponent, useState } from 'react';
import { wait } from '../../utils/timeUtils';
import { Spinner } from '../../client/components/Spinner/Spinner';
import { Alert } from '../../client/components/Alert/Alert';
import { BotVisit } from './api/get-bot-visits/botVisitDatabase';
import { BotTypeInfo, BotVisitAction, InstructionPrompt } from './components/botFirewallComponents';
import { FPJS_CLIENT_TIMEOUT } from '../../const';

const DEFAULT_DISPLAYED_VISITS = 10;
const DISPLAYED_VISITS_INCREMENT = 10;
const BOT_VISITS_FETCH_LIMIT = 200;

/** Format date */
const formatDate = (date: string) => {
  const d = new Date(date);
  return `${d.toLocaleDateString('en-Us', {
    month: 'short',
    day: 'numeric',
  })} ${d.toLocaleTimeString('gb', { hour: '2-digit', minute: '2-digit' })}`;
};

const snackbarOptions: SnackbarOptions = {
  autoHideDuration: 3000,
  anchorOrigin: { horizontal: 'right', vertical: 'bottom' },
};

/** Query to retrieve all bot visits */
const useBotVisits = () => {
  const {
    data: botVisits,
    refetch: refetchBotVisits,
    isFetching: isFetchingBotVisits,
    status: botVisitsQueryStatus,
  } = useQuery({
    queryKey: ['get bot visits'],
    queryFn: (): Promise<BotVisit[]> => {
      return fetch(`/bot-firewall/api/get-bot-visits?limit=${BOT_VISITS_FETCH_LIMIT}`).then((res) => res.json());
    },
  });
  return { botVisits, refetchBotVisits, isFetchingBotVisits, botVisitsQueryStatus };
};

/** Query to retrieve blocked IP addresses */
const useBlockedIps = () => {
  const {
    data: blockedIps,
    refetch: refetchBlockedIps,
    isFetching: isFetchingBlockedIps,
  } = useQuery({
    queryKey: ['get blocked IPs'],
    queryFn: (): Promise<string[]> => {
      return fetch('/bot-firewall/api/get-blocked-ips').then((res) => res.json());
    },
  });
  return { blockedIps, refetchBlockedIps, isFetchingBlockedIps };
};

/** Mutation (POST request) to block/unblock an IP */
const useBlockUnblockIpAddress = (
  getVisitorData: VisitorQueryContext<true>['getData'],
  refetchBlockedIps: () => void,
) => {
  const { mutate: blockIp, isLoading: isLoadingBlockIp } = useMutation({
    mutationKey: ['block IP'],
    mutationFn: async ({ ip, blocked }: Omit<BlockIpPayload, 'requestId'>) => {
      const { requestId } = await getVisitorData({ ignoreCache: true });
      const response = await fetch('/bot-firewall/api/block-ip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ip, blocked, requestId } satisfies BlockIpPayload),
      });
      if (!response.ok) {
        throw new Error('Failed to update firewall: ' + ((await response.json()).message ?? response.statusText));
      }
      return await response.json();
    },
    onSuccess: async (data: BlockIpResponse) => {
      refetchBlockedIps();
      enqueueSnackbar(
        <div>
          IP address <b>&nbsp;{data.data?.ip}&nbsp;</b> was{' '}
          <b>&nbsp;{data.data?.blocked ? 'blocked' : 'unblocked'}&nbsp;</b> in the application firewall.{' '}
        </div>,
        { ...snackbarOptions, variant: 'success' },
      );
    },
    onError: (error: Error) => {
      enqueueSnackbar(error.message, {
        ...snackbarOptions,
        variant: 'error',
      });
    },
  });

  return { blockIp, isLoadingBlockIp };
};

/**
 * Bot Firewall Page Component
 */
export const BotFirewall: FunctionComponent = () => {
  // Get visitor data from Fingerprint (just used for the visitor's IP address)
  const {
    getData: getVisitorData,
    data: visitorData,
    isLoading: isLoadingVisitorData,
  } = useVisitorData({
    extendedResult: true,
    timeout: FPJS_CLIENT_TIMEOUT,
  });

  // Get a list of bot visits
  const { botVisits, refetchBotVisits, isFetchingBotVisits: isLoadingBotVisits, botVisitsQueryStatus } = useBotVisits();

  // Get a list of currently blocked IP addresses
  const { blockedIps, refetchBlockedIps, isFetchingBlockedIps: isLoadingBlockedIps } = useBlockedIps();

  // Post request mutation to block/unblock IP addresses
  const { blockIp, isLoadingBlockIp } = useBlockUnblockIpAddress(getVisitorData, refetchBlockedIps);

  const [displayedVisits, setDisplayedVisits] = useState(DEFAULT_DISPLAYED_VISITS);

  // Loading bot visits is usually really fast, use a minimum loading time to prevent UI flashing
  const [isArtificiallyLoading, setIsArtificiallyLoading] = useState(false);
  const isLoading = isLoadingVisitorData || isLoadingBotVisits || isLoadingBlockedIps || isArtificiallyLoading;

  const isIpBlocked = (ip: string): boolean => {
    return Boolean(blockedIps?.find((blockedIp) => blockedIp === ip));
  };

  let content = <Spinner size={40} />;
  if (botVisitsQueryStatus === 'error') {
    content = <Alert severity='error'>Error fetching bot visits.</Alert>;
  }
  if (botVisitsQueryStatus === 'success' && botVisits?.length === 0) {
    content = (
      <Alert severity='success'>No bot visits detected yet. See the instructions above to generate some!</Alert>
    );
  }
  if (botVisitsQueryStatus === 'success' && botVisits && botVisits.length > 0) {
    content = (
      <>
        {/* Display bot visits as a **TABLE** only on large screens */}
        <table className={styles.botVisitsTable}>
          <thead>
            <tr>
              <th>
                Timestamp <Image src={ChevronIcon} alt='' />
              </th>
              <th>Request ID</th>
              <th>
                Bot Type <BotTypeInfo />
              </th>
              <th>IP Address</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {botVisits.slice(0, displayedVisits).map((botVisit) => {
              return (
                <tr key={botVisit.requestId}>
                  <td>{formatDate(botVisit.timestamp)}</td>
                  <td>{botVisit.requestId}</td>
                  <td>
                    {botVisit.botResult} ({botVisit.botType})
                  </td>
                  <td className={styles.wrapAndBreakTableCell}>{botVisit.ip}</td>
                  <td>
                    <BotVisitAction
                      ip={botVisit.ip}
                      isBlockedNow={isIpBlocked(botVisit.ip)}
                      blockIp={blockIp}
                      isLoadingBlockIp={isLoadingBlockIp}
                      isVisitorsIp={botVisit.ip === visitorData?.ip}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Display bot visits as **CARDS** only on small screens */}
        <div className={styles.cards}>
          {botVisits.slice(0, displayedVisits).map((botVisit) => {
            return (
              <div key={botVisit.requestId} className={styles.card}>
                <div className={styles.cardContent}>
                  <div>Timestamp</div>
                  <div>{formatDate(botVisit.timestamp)}</div>

                  <div>Request ID</div>
                  <div>{botVisit.requestId}</div>

                  <div>
                    Bot Type <BotTypeInfo />
                  </div>
                  <div>
                    {botVisit.botResult} ({botVisit.botType})
                  </div>

                  <div>IP Address</div>
                  <div>{botVisit.ip}</div>
                </div>
                <BotVisitAction
                  ip={botVisit.ip}
                  isBlockedNow={isIpBlocked(botVisit.ip)}
                  blockIp={blockIp}
                  isLoadingBlockIp={isLoadingBlockIp}
                  isVisitorsIp={botVisit.ip === visitorData?.ip}
                />
              </div>
            );
          })}
        </div>
      </>
    );
  }

  return (
    <>
      <UseCaseWrapper
        useCase={USE_CASES.botFirewall}
        instructionsNote={`For the purposes of this demo, you can only block/unblock your own IP address (${visitorData?.ip}). The block expires after one hour. The database of bot visits is cleared on every website update.`}
      >
        <div className={styles.container}>
          <div className={styles.header}>
            <h2 className={styles.title}>
              Bots detected on{' '}
              <Link href='/web-scraping' target='_blank'>
                Web scraping demo
              </Link>
            </h2>
            <Button
              size='small'
              outlined
              onClick={async () => {
                // Loading bot visits is usually really fast, use a minimum loading time to prevent UI flashing
                setIsArtificiallyLoading(true);
                await Promise.all([refetchBotVisits(), refetchBlockedIps(), wait(500)]);
                setIsArtificiallyLoading(false);
              }}
              className={styles.reloadButton}
              disabled={isLoading}
            >
              {isLoading ? 'Loading ⏳' : 'Reload bot visits'}
            </Button>
            <InstructionPrompt>
              We recommend reading the <Link href={`#${INSTRUCTION_ANCHOR_ID}`}>instructions</Link> before trying the
              demo!
            </InstructionPrompt>
          </div>

          {content}
          {/* Display load older bot visits button if necessary */}
          {botVisits && botVisits.length > DEFAULT_DISPLAYED_VISITS ? (
            <Button
              size='medium'
              className={styles.loadMore}
              outlined
              onClick={() => setDisplayedVisits(displayedVisits + DISPLAYED_VISITS_INCREMENT)}
              disabled={displayedVisits >= botVisits.length}
            >
              Show older bot visits
            </Button>
          ) : null}
        </div>
      </UseCaseWrapper>
    </>
  );
};

export default BotFirewall;
