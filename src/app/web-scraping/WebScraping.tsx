'use client';

import { UseCaseWrapper } from '../../client/components/UseCaseWrapper/UseCaseWrapper';
import { useVisitorData } from '@fingerprintjs/fingerprintjs-pro-react';
import { useQueryState } from 'next-usequerystate';
import { useQuery, UseQueryResult } from 'react-query';
import { USE_CASES } from '../../client/content';
import { Select, SelectItem } from '../../client/components/Select/Select';
import ArrowIcon from '../../client/img/arrowRight.svg';
import Image from 'next/image';
import styles from './webScraping.module.scss';
import Button from '../../client/components/Button/Button';
import { Alert } from '../../client/components/Alert/Alert';
import { Spinner } from '../../client/components/Spinner/Spinner';
import { FlightQuery } from './api/flights/route';
import { FunctionComponent, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AIRPORTS } from './data/airports';
import { Flight, FlightCard } from './components/FlightCard';
import { Severity } from '../../server/checks';
import { FPJS_CLIENT_TIMEOUT } from '../../const';

type FlightQueryResult = {
  message: string;
  severity: Severity;
  type: string;
  data?: Flight[];
};

const WebScraping: FunctionComponent = () => {
  const searchParams = useSearchParams();
  const [fromCode, setFromCode] = useQueryState('from', {
    defaultValue: searchParams.get('from')?.toUpperCase() ?? AIRPORTS[0].code,
  });
  const [toCode, setToCode] = useQueryState('to', {
    defaultValue: searchParams.get('to')?.toUpperCase() ?? AIRPORTS[1].code,
  });

  /**
   * We use the Fingerprint Pro React SDK hook to get visitor data (https://github.com/fingerprintjs/fingerprintjs-pro-react)
   * For Vue, Angular, Svelte, and other frameworks, see https://dev.fingerprint.com/docs/frontend-libraries
   * See '/client/use-visitor-data.js' for an example implementation of similar functionality without the SDK
   */
  const { getData: getVisitorData } = useVisitorData(
    {
      // Don't use a cached fingerprint, it must be fresh to avoid replay attacks
      ignoreCache: true,
      timeout: FPJS_CLIENT_TIMEOUT,
    },
    // Don't fingerprint the visitor on mount, but when they click "Search flights", the fingerprint must be fresh
    { immediate: false },
  );

  /**
   * We use React Query to easily keep track of the state of the flights request (https://react-query-v3.tanstack.com/)
   * But you can achieve the same result with plain old `fetch` and `useState`
   */
  const getFlightsQuery = useQuery<FlightQueryResult, Error>(
    ['getFlights'],
    async () => {
      const { requestId } = await getVisitorData();
      const response = await fetch(`/web-scraping/api/flights`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromCode,
          to: toCode,
          requestId,
          disableBotDetection: Boolean(searchParams.get('disableBotDetection')),
        } satisfies FlightQuery),
      });
      if (response.status < 500) {
        return await response.json();
      } else {
        throw new Error('Failed to fetch flights: ' + response.statusText);
      }
    },
    {
      refetchOnMount: 'always',
      retry: false,
    },
  );

  const { isFetching } = getFlightsQuery;

  return (
    <>
      <UseCaseWrapper useCase={USE_CASES.webScraping}>
        <h2 className={styles.searchTitle}>Search for today&apos;s flights</h2>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            getFlightsQuery.refetch();
          }}
          className={styles.form}
        >
          <div className={styles.formInput}>
            <div>
              <div className={styles.locationLabel}>From</div>
              <Select value={fromCode} onValueChange={(value: string) => setFromCode(value)} fullWidth>
                {AIRPORTS.filter((airport) => airport.code !== toCode).map((airport) => (
                  <SelectItem key={airport.code} value={airport.code}>
                    {airport.city} ({airport.code})
                  </SelectItem>
                ))}
              </Select>
            </div>
            <Image src={ArrowIcon} alt='' className={styles.arrowIcon} />
            <div>
              <div className={styles.locationLabel}>To</div>
              <Select value={toCode} onValueChange={(value: string) => setToCode(value)} fullWidth>
                {AIRPORTS.filter((airport) => airport.code !== fromCode).map((airport) => (
                  <SelectItem key={airport.code} value={airport.code}>
                    {airport.city} ({airport.code})
                  </SelectItem>
                ))}
              </Select>
            </div>
            <Button
              type='submit'
              size='medium'
              variant='primary'
              className={styles.searchButton}
              disabled={!toCode || !fromCode || isFetching}
            >
              Search
            </Button>
          </div>
        </form>
        <Results {...getFlightsQuery} />
      </UseCaseWrapper>
    </>
  );
};

export const WebScrapingUseCase = () => {
  // Suspense required due to useSearchParams() https://nextjs.org/docs/messages/missing-suspense-with-csr-bailout
  return (
    <Suspense>
      <WebScraping />
    </Suspense>
  );
};

const Results = ({ data, isFetching, error }: UseQueryResult<FlightQueryResult, Error>) => {
  const { data: flights, message, severity } = data ?? {};

  if (isFetching) {
    return (
      <div className={styles.loaderContainer}>
        <Spinner size={40} />
      </div>
    );
  }

  if (error) {
    return <Alert severity='error'>{error.message}</Alert>;
  }

  if (message && severity !== 'success') {
    return <Alert severity={severity ?? 'warning'}>{message}</Alert>;
  }

  if (!flights) {
    return null;
  }
  return (
    <div className={styles.flightCardsContainer}>
      {flights.map((flight) => (
        <FlightCard key={flight.flightNumber} flight={flight} />
      ))}
    </div>
  );
};
