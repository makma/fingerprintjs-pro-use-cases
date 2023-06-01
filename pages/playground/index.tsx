import { useVisitorData } from '@fingerprintjs/fingerprintjs-pro-react';
import { UseCaseWrapper } from '../../client/components/use-case-wrapper';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/material';
import { useQuery } from 'react-query';
import { useState } from 'react';
import { CodeSnippet } from '../../client/components/CodeSnippet';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { green, red } from '@mui/material/colors';
import { lightGreen } from '@mui/material/colors';
import { blueGrey } from '@mui/material/colors';
import dynamic from 'next/dynamic';
import { useUserPreferences } from '../../client/api/personalization/use-user-preferences';
import MyTable, { TableCellData } from '../../client/components/playground/MyTable';
import { EventResponse } from '@fingerprintjs/fingerprintjs-pro-server-api';
import BotDetectionResult from '../../client/components/playground/BotDetectionResult';
import Info from '../../client/components/playground/InfoIcon';
import RefreshButton from '../../client/components/playground/RefreshButton';

// Map cannot be server-side rendered
const Map = dynamic(() => import('../../client/components/playground/Map'), { ssr: false });

function Playground() {
  const {
    data: agentResponse,
    isLoading: isLoadingAgentResponse,
    getData: getAgentData,
    error: agentError,
  } = useVisitorData({ extendedResult: true, ignoreCache: true }, { immediate: true });

  const requestId = agentResponse?.requestId;

  /** Temporary fix to store previous because ReactQuery sets data to undefined before the fresh data is available when I make a new query and it makes everything flash */
  const [cachedEvent, setCachedEvent] = useState<EventResponse | undefined>(undefined);

  const {
    data: identificationEvent,
    isLoading: isLoadingServerResponse,
    error: serverError,
  } = useQuery<EventResponse | undefined>(
    [requestId],
    () =>
      fetch(`/api/event/${agentResponse?.requestId}`).then((res) => {
        if (res.status !== 200) {
          throw new Error(`${res.statusText}`);
        }
        return res.json();
      }),
    { enabled: Boolean(agentResponse), retry: false, onSuccess: (data) => setCachedEvent(data) }
  );

  const { hasDarkMode } = useUserPreferences();

  if (agentError) {
    return <Alert severity={'error'}>JavaScript Agent Error: {agentError.message}.</Alert>;
  }

  if (serverError) {
    return <Alert severity={'error'}>Server API Request {serverError.toString()}.</Alert>;
  }

  if (!cachedEvent) {
    return (
      <Stack alignItems={'center'} gap={5}>
        <CircularProgress />
        <Typography variant="h2" textAlign={'center'}>
          Running device intelligence...
        </Typography>
      </Stack>
    );
  }

  const usedIdentificationEvent = identificationEvent ?? cachedEvent;
  const { latitude, longitude } = agentResponse?.ipLocation ?? {};

  const RED = hasDarkMode ? red[900] : red[100];
  const GREEN = hasDarkMode ? green[900] : lightGreen[50];
  const GRAY = hasDarkMode ? blueGrey[900] : blueGrey[50];

  const baseSignals: TableCellData[][] = [
    [
      {
        content: ['Visitor ID', <Info key="info">A unique and stable identifier of your browser.</Info>],
      },
      { content: agentResponse?.visitorId },
    ],
    [{ content: 'Browser' }, { content: `${agentResponse?.browserName} ${agentResponse?.browserVersion}` }],
    [{ content: 'Operating System' }, { content: `${agentResponse?.os} ${agentResponse?.osVersion}` }],
  ];

  const smartSignals: TableCellData[][] = [
    [
      {
        content: ['Geolocation', <Info key="info">Your geographic location based on your IP address.</Info>],
      },
      {
        content: (
          <>
            <div>
              {agentResponse?.ipLocation?.city?.name}, {agentResponse?.ipLocation?.country?.name}
            </div>
            {latitude && longitude && (
              <div>
                <Map key={[latitude, longitude].toString()} position={[latitude, longitude]} height="80px" />
              </div>
            )}
          </>
        ),
        cellStyle: { paddingLeft: 0, paddingRight: 0, paddingBottom: 0 },
      },
    ],
    [
      { content: 'Incognito Mode' },
      {
        content: agentResponse?.incognito ? 'You are incognito 🕶' : 'Not detected',
        cellStyle: {
          backgroundColor: agentResponse?.incognito ? RED : GREEN,
        },
      },
    ],
    [
      {
        content: [
          'Bot',
          <Info key="info">
            Fingerprint detects if the browser is driven by a human, a browser automation tool like Selenium or headless
            Chrome (bad bot) or search engine crawler (good bot).
          </Info>,
        ],
      },
      {
        content: <BotDetectionResult key="botDetectionResult" event={usedIdentificationEvent} />,
        cellStyle: {
          backgroundColor: usedIdentificationEvent?.products?.botd?.data?.bot?.result === 'bad' ? RED : GREEN,
        },
      },
    ],
    [
      {
        content: [
          'IP Blocklist',
          <Info key="info">
            IP address was part of a known email (SMTP) spam attack or network (SSH/HTTP) attack.{' '}
          </Info>,
        ],
      },
      {
        content:
          usedIdentificationEvent?.products?.ipBlocklist?.data?.result === true
            ? 'Your IP is on a blocklist 🚫'
            : 'Not detected',
        cellStyle: {
          backgroundColor: usedIdentificationEvent?.products?.ipBlocklist?.data?.result === true ? RED : GREEN,
        },
      },
    ],
    [
      {
        content: [
          'VPN',
          <Info key="info">
            The visitor is using a VPN (browser timezone does not match or IP address is owned by a public VPN service
            provider).
          </Info>,
        ],
      },
      {
        content:
          usedIdentificationEvent?.products?.vpn?.data?.result === true ? 'You are using a VPN 🌐' : 'Not detected',
        cellStyle: { backgroundColor: usedIdentificationEvent?.products?.vpn?.data?.result === true ? RED : GREEN },
      },
    ],
    [
      {
        content: ['Proxy', <Info key="info">The request IP address is used by a public proxy provider.</Info>],
      },
      {
        content:
          usedIdentificationEvent?.products?.proxy?.data?.result === true ? 'You are using a proxy 🔄' : 'Not detected',
        cellStyle: { backgroundColor: usedIdentificationEvent?.products?.proxy?.data?.result === true ? RED : GREEN },
      },
    ],
    [
      {
        content: ['Tor Network', <Info key="info">The request IP address is a known Tor network exit node.</Info>],
      },
      {
        content:
          usedIdentificationEvent?.products?.tor?.data?.result === true ? 'You are using Tor 🧅' : 'Not detected',
        cellStyle: { backgroundColor: usedIdentificationEvent?.products?.tor?.data?.result === true ? RED : GREEN },
      },
    ],
    [
      {
        content: [
          'Browser Tampering',
          <Info key="info">
            Flag indicating whether browser tampering was detected according to our internal thresholds. For example, if
            the reported user agent is not consistent with other browser attributes.
          </Info>,
        ],
      },
      {
        content: usedIdentificationEvent?.products?.tampering?.data?.result === true ? 'Yes 🖥️🔧' : 'Not detected',
        cellStyle: {
          backgroundColor: usedIdentificationEvent?.products?.tampering?.data?.result === true ? RED : GREEN,
        },
      },
    ],
    [
      {
        content: ['Android Emulator', <Info key="info">Android specific emulator detection.</Info>],
      },
      { content: 'Not applicable to browsers', cellStyle: { backgroundColor: GRAY } },
    ],
    [
      {
        content: [
          'Android Tampering',
          <Info key="info">Android specific root management apps detection, for example, Magisk.</Info>,
        ],
      },
      { content: 'Not applicable to browsers', cellStyle: { backgroundColor: GRAY } },
    ],
  ];

  return (
    <div>
      <Typography variant="h2" textAlign={'center'}>
        Welcome, your visitor ID is{' '}
        <Box sx={{ display: 'inline', color: (t) => t.palette.primary.main, fontWeight: 'bold' }}>
          {agentResponse?.visitorId}
        </Box>
        .
      </Typography>

      <RefreshButton loading={isLoadingAgentResponse || isLoadingServerResponse} getAgentData={getAgentData} />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            md: 'repeat(2, minmax(0, 400px))',
          },
          justifyContent: 'center',
          gap: 3,
        }}
      >
        <Box>
          <Typography variant="h3">Base signals (Pro plan)</Typography>
          <MyTable data={baseSignals} />
        </Box>
        <Box>
          <Typography variant="h3">Smart signals (Pro Plus plan)</Typography>
          <MyTable data={smartSignals} />
        </Box>
      </Box>

      <RefreshButton loading={isLoadingAgentResponse || isLoadingServerResponse} getAgentData={getAgentData} />

      <Box
        sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0,1fr)', lg: 'repeat(2, minmax(0, 1fr))' }, gap: 3 }}
      >
        <Box>
          <Accordion defaultExpanded elevation={3}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="agent-response-content"
              id="agent-response-header"
            >
              <Typography width={'100%'}>JavaScript Agent Response</Typography>
              {isLoadingAgentResponse && (
                <CircularProgress size={'1.2rem'} thickness={5} sx={{ mr: (t) => t.spacing(2) }} />
              )}
            </AccordionSummary>
            <AccordionDetails>
              <CodeSnippet language="json">{JSON.stringify(agentResponse, null, 2)}</CodeSnippet>
            </AccordionDetails>
          </Accordion>
        </Box>
        <Box>
          <Accordion defaultExpanded elevation={3}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="server-event-content"
              id="server-event-header"
            >
              <Typography width={'100%'}>Server API Response</Typography>
              {isLoadingServerResponse && (
                <CircularProgress size={'1.2rem'} thickness={5} sx={{ mr: (t) => t.spacing(2) }} />
              )}
            </AccordionSummary>
            <AccordionDetails>
              <CodeSnippet language="json">{JSON.stringify(usedIdentificationEvent, null, 2)}</CodeSnippet>
            </AccordionDetails>
          </Accordion>
        </Box>
      </Box>
    </div>
  );
}

export default function PlaygroundPage() {
  return (
    <UseCaseWrapper
      title="Fingerprint Pro Playground"
      description={<p>Analyze your browser with Fingerprint Pro and see all the available signals.</p>}
      showAdminLink={false}
      hideSrcListItem={true}
      contentSx={{ boxShadow: 'none', maxWidth: '1200px' }}
    >
      <Playground />
    </UseCaseWrapper>
  );
}