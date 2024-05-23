'use client';

import { FunctionComponent } from 'react';
import { CodeSnippet } from '../../client/components/CodeSnippet';
import dynamic from 'next/dynamic';
import SignalTable, { TableCellData } from './components/SignalTable';
import BotDetectionResult from './components/BotDetectionResult';
import RefreshButton from './components/RefreshButton';
import IpBlocklistResult from './components/IpBlocklistResult';
import VpnDetectionResult from './components/VpnDetectionResult';
import { FormatIpAddress } from './components/ipFormatUtils';
import { usePlaygroundSignals } from './hooks/usePlaygroundSignals';
import { getLocationName } from '../../shared/utils/locationUtils';
import { FP_LOAD_OPTIONS } from '../../pages/_app';
import Link from 'next/link';
import externalLinkArrow from '../../client/img/externalLinkArrow.svg';
import Image from 'next/image';
import styles from './playground.module.scss';
import { Spinner } from '../../client/components/common/Spinner/Spinner';
import { Alert } from '../../client/components/common/Alert/Alert';
import { timeAgoLabel } from '../../shared/timeUtils';
import { FpjsProvider } from '@fingerprintjs/fingerprintjs-pro-react';
import Container from '../../client/components/common/Container';
import { TEST_IDS } from '../../client/testIDs';
import tableStyles from './components/SignalTable.module.scss';

const PLAYGROUND_COPY = {
  androidOnly: 'Applicable only to Android devices',
  iosOnly: 'Applicable only to iOS devices',
  mobileOnly: 'Applicable only to iOS and Android devices',
} as const;

// Nothing magic about `8` here, each customer must define their own use-case specific threshold
const SUSPECT_SCORE_RED_THRESHOLD = 8;

const DocsLink: FunctionComponent<{ children: string; href: string; style?: React.CSSProperties }> = ({
  children,
  href,
  style,
}) => {
  const lastWord = children.split(' ').pop();
  const leadingWords = children.split(' ').slice(0, -1).join(' ');
  return (
    <Link href={href} target='_blank' className={styles.docsLink} style={style}>
      {leadingWords}{' '}
      <span style={{ whiteSpace: 'nowrap' }}>
        {lastWord}
        <Image src={externalLinkArrow} alt='' />
      </span>
    </Link>
  );
};

// Map cannot be server-side rendered
const Map = dynamic(() => import('./components/Map'), { ssr: false });

function Playground() {
  const {
    agentResponse,
    isLoadingAgentResponse,
    getAgentData,
    agentError,
    cachedEvent,
    identificationEvent,
    isLoadingServerResponse,
    serverError,
  } = usePlaygroundSignals();

  if (agentError) {
    return <Alert severity={'error'}>JavaScript Agent Error: {agentError.message}.</Alert>;
  }

  if (serverError) {
    return <Alert severity={'error'}>Server API Request {serverError.toString()}.</Alert>;
  }

  const usedIdentificationEvent = identificationEvent ?? cachedEvent;
  const ipLocation = usedIdentificationEvent?.products?.ipInfo?.data?.v4?.geolocation;
  const { latitude, longitude } = ipLocation ?? {};

  const identificationSignals: TableCellData[][] = [
    [
      { content: 'Browser' },
      { content: `${agentResponse?.browserName} ${agentResponse?.browserVersion}`, className: tableStyles.neutral },
    ],
    [
      { content: 'Operating System' },
      { content: `${agentResponse?.os} ${agentResponse?.osVersion}`, className: tableStyles.neutral },
    ],
    [
      { content: 'IP Address' },
      { content: <FormatIpAddress ipAddress={agentResponse?.ip} />, className: tableStyles.neutral },
    ],
    [
      {
        content: <DocsLink href='https://dev.fingerprint.com/docs/useful-timestamps#definitions'>Last seen</DocsLink>,
      },
      {
        content: agentResponse?.lastSeenAt.global ? timeAgoLabel(agentResponse?.lastSeenAt.global) : 'Unknown',
        className: tableStyles.neutral,
      },
    ],
    [
      {
        content: [
          <DocsLink href='https://dev.fingerprint.com/docs/understanding-your-confidence-score' key='confidence'>
            Confidence Score
          </DocsLink>,
        ],
      },
      {
        content: agentResponse?.confidence.score ? Math.trunc(agentResponse.confidence.score * 100) / 100 : 'N/A',
        className: agentResponse && agentResponse.confidence.score >= 0.7 ? tableStyles.green : tableStyles.red,
      },
    ],
  ];

  const smartSignals: TableCellData[][] = [
    [
      {
        content: (
          <DocsLink href='https://dev.fingerprint.com/docs/smart-signals-overview#ip-geolocation'>Geolocation</DocsLink>
        ),
      },
      {
        content: (
          <>
            <div>{getLocationName(ipLocation)}</div>
            {latitude && longitude && (
              <div>
                <Map key={[latitude, longitude].toString()} position={[latitude, longitude]} height='80px' />
              </div>
            )}
          </>
        ),
        className: tableStyles.map,
      },
    ],
    [
      {
        content: (
          <DocsLink href='https://dev.fingerprint.com/docs/smart-signals-overview#browser-incognito-detection'>
            Incognito Mode
          </DocsLink>
        ),
      },
      {
        content: usedIdentificationEvent?.products?.incognito?.data?.result ? 'You are incognito 🕶' : 'Not detected',
        className: usedIdentificationEvent?.products?.incognito?.data?.result ? tableStyles.red : tableStyles.green,
      },
    ],
    [
      {
        content: [
          <DocsLink href='https://dev.fingerprint.com/docs/smart-signals-overview#browser-bot-detection' key='bot'>
            Bot
          </DocsLink>,
        ],
      },
      {
        content: <BotDetectionResult key='botDetectionResult' event={usedIdentificationEvent} />,
        className:
          usedIdentificationEvent?.products?.botd?.data?.bot?.result === 'bad' ? tableStyles.red : tableStyles.green,
      },
    ],
    [
      {
        content: [
          <DocsLink href='https://dev.fingerprint.com/docs/smart-signals-overview#vpn-detection' key='vpn'>
            VPN
          </DocsLink>,
        ],
      },
      {
        content: <VpnDetectionResult event={usedIdentificationEvent} />,
        className: usedIdentificationEvent?.products?.vpn?.data?.result === true ? tableStyles.red : tableStyles.green,
      },
    ],
    [
      {
        content: [
          <DocsLink
            href='https://dev.fingerprint.com/docs/smart-signals-overview#browser-tamper-detection'
            key='tamper'
          >
            Browser Tampering
          </DocsLink>,
        ],
      },
      {
        content: usedIdentificationEvent?.products?.tampering?.data?.result === true ? 'Yes 🖥️🔧' : 'Not detected',
        className:
          usedIdentificationEvent?.products?.tampering?.data?.result === true ? tableStyles.red : tableStyles.green,
      },
    ],
    [
      {
        content: (
          <DocsLink href='https://dev.fingerprint.com/docs/smart-signals-overview#virtual-machine-detection'>
            Virtual Machine
          </DocsLink>
        ),
      },
      {
        content: usedIdentificationEvent?.products?.virtualMachine?.data?.result === true ? 'Yes ☁️💻' : 'Not detected',
        className:
          usedIdentificationEvent?.products?.virtualMachine?.data?.result === true
            ? tableStyles.red
            : tableStyles.green,
      },
    ],
    [
      {
        content: (
          <DocsLink href='https://dev.fingerprint.com/docs/smart-signals-overview#privacy-focused-settings'>
            Privacy Settings
          </DocsLink>
        ),
      },
      {
        content:
          usedIdentificationEvent?.products?.privacySettings?.data?.result === true ? 'Yes 🙈💻' : 'Not detected',
        className:
          usedIdentificationEvent?.products?.privacySettings?.data?.result === true
            ? tableStyles.red
            : tableStyles.green,
      },
    ],
    [
      {
        content: [
          <DocsLink
            href='https://dev.fingerprint.com/docs/smart-signals-overview#ip-blocklist-matching'
            key='blocklist'
          >
            IP Blocklist
          </DocsLink>,
        ],
      },
      {
        content: <IpBlocklistResult event={usedIdentificationEvent} />,
        className:
          usedIdentificationEvent?.products?.ipBlocklist?.data?.result ||
          usedIdentificationEvent?.products?.proxy?.data?.result ||
          usedIdentificationEvent?.products?.tor?.data?.result
            ? tableStyles.red
            : tableStyles.green,
      },
    ],
    [
      {
        content: [
          <DocsLink
            href='https://dev.fingerprint.com/docs/smart-signals-overview#high-activity-device'
            key='high-activity'
          >
            High-Activity Device
          </DocsLink>,
        ],
      },
      {
        content: usedIdentificationEvent?.products?.highActivity?.data?.result === true ? 'Yes 🔥' : 'Not detected',
        className:
          usedIdentificationEvent?.products?.highActivity?.data?.result === true ? tableStyles.red : tableStyles.green,
      },
    ],
    [
      {
        content: [
          <DocsLink href='https://dev.fingerprint.com/docs/smart-signals-overview#suspect-score' key='suspect-score'>
            Suspect Score
          </DocsLink>,
        ],
      },
      {
        // @ts-expect-error suspectScore not yet available in Node SDK, TODO: remove this once it's available
        content: usedIdentificationEvent?.products?.suspectScore?.data?.result,
        className:
          // @ts-expect-error suspectScore not yet available in Node SDK, TODO: remove this once it's available
          usedIdentificationEvent?.products?.suspectScore?.data?.result > SUSPECT_SCORE_RED_THRESHOLD
            ? tableStyles.red
            : tableStyles.green,
      },
    ],
    [
      {
        content: [
          <DocsLink href='https://dev.fingerprint.com/docs/smart-signals-overview#raw-device-attributes' key='raw'>
            Raw device attributes
          </DocsLink>,
        ],
      },
      { content: 'See the JSON below', className: tableStyles.green },
    ],
  ];

  const mobileSmartSignals: TableCellData[][] = [
    [
      {
        content: [
          <DocsLink href='https://dev.fingerprint.com/docs/smart-signals-overview#frida-detection' key='frida'>
            App is instrumented by Frida
          </DocsLink>,
        ],
      },
      { content: PLAYGROUND_COPY.mobileOnly, className: tableStyles.neutral },
    ],
    [
      {
        content: [
          <DocsLink href='https://dev.fingerprint.com/docs/smart-signals-overview#factory-reset-detection' key='reset'>
            Factory Reset Timestamp
          </DocsLink>,
        ],
      },
      { content: PLAYGROUND_COPY.mobileOnly, className: tableStyles.neutral },
    ],
    [
      {
        content: [
          <DocsLink
            href='https://dev.fingerprint.com/docs/smart-signals-overview#geolocation-spoofing-detection'
            key='spoof'
          >
            Location spoofing
          </DocsLink>,
        ],
      },
      { content: PLAYGROUND_COPY.mobileOnly, className: tableStyles.neutral },
    ],
    [
      {
        content: [
          <DocsLink href='https://dev.fingerprint.com/docs/smart-signals-overview#cloned-app-detection' key='cloned'>
            Cloned App
          </DocsLink>,
        ],
      },
      { content: PLAYGROUND_COPY.androidOnly, className: tableStyles.neutral },
    ],
    [
      {
        content: [
          <DocsLink
            href='https://dev.fingerprint.com/docs/smart-signals-overview#android-emulator-detection'
            key='emulator'
          >
            Emulator
          </DocsLink>,
        ],
      },
      { content: PLAYGROUND_COPY.androidOnly, className: tableStyles.neutral },
    ],
    [
      {
        content: [
          <DocsLink
            href='https://dev.fingerprint.com/docs/smart-signals-overview#android-tamper-detection'
            key='tamper'
          >
            Rooted device
          </DocsLink>,
        ],
      },
      { content: PLAYGROUND_COPY.androidOnly, className: tableStyles.neutral },
    ],

    [
      {
        content: [
          <DocsLink
            href='https://dev.fingerprint.com/docs/smart-signals-overview#jailbroken-device-detection'
            key='jailbroken'
          >
            Jailbroken device
          </DocsLink>,
        ],
      },
      { content: PLAYGROUND_COPY.iosOnly, className: tableStyles.neutral },
    ],
  ];

  return (
    <Container size='large'>
      <div className={styles.hero}>
        <h1>
          <span>Fingerprint Pro</span> Playground
        </h1>
        <p>Analyze your browser with Fingerprint Pro and see all the available signals.</p>
      </div>
      {agentResponse && (
        <div className={styles.visitorIdBox}>
          <p>Welcome, this is your visitor ID</p>
          <h2 className={styles.visitorId}>{agentResponse?.visitorId}</h2>
        </div>
      )}
      {!cachedEvent ? (
        <div className={styles.runningIntelligence}>
          <Spinner size='40px' thickness={3} />
          <h2>Running device intelligence...</h2>
        </div>
      ) : (
        <>
          <div className={styles.tablesContainer}>
            <div>
              <h3 className={styles.tableTitle}>Identification</h3>
              <SignalTable data={identificationSignals} />
            </div>
            <div>
              <h3 className={styles.tableTitle}>Smart signals</h3>
              <SignalTable data={smartSignals} />
            </div>
            <div>
              <h3 className={styles.tableTitle}>Mobile Smart signals</h3>
              <SignalTable data={mobileSmartSignals} />
            </div>
          </div>

          <RefreshButton
            loading={isLoadingAgentResponse || isLoadingServerResponse}
            getAgentData={getAgentData}
            className={styles.reloadButton}
          />

          <div className={styles.jsonContainer}>
            <div>
              <h4 className={styles.jsonTitle}>JavaScript Agent Response {isLoadingAgentResponse && <Spinner />}</h4>

              <CodeSnippet language='json' dataTestId={TEST_IDS.playground.agentResponseJSON}>
                {JSON.stringify(agentResponse, null, 2)}
              </CodeSnippet>
            </div>
            <div>
              <h4 className={styles.jsonTitle}>Server API Response {isLoadingServerResponse && <Spinner />}</h4>

              <CodeSnippet language='json' dataTestId={TEST_IDS.playground.serverResponseJSON}>
                {JSON.stringify(usedIdentificationEvent, null, 2)}
              </CodeSnippet>
            </div>
          </div>
        </>
      )}
    </Container>
  );
}

export default function PlaygroundPage() {
  return (
    <FpjsProvider loadOptions={FP_LOAD_OPTIONS}>
      <Playground />
    </FpjsProvider>
  );
}