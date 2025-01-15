'use client';

import { useVisitorData } from '@fingerprintjs/fingerprintjs-pro-react';
import { UseCaseWrapper } from '../../../../client/components/UseCaseWrapper/UseCaseWrapper';
import { USE_CASES } from '../../../../client/content';
import { FPJS_CLIENT_TIMEOUT } from '../../../../const';
import { useMutation, useQuery } from 'react-query';
import { IsLoggedInPayload, IsLoggedInResponse } from '../../api/is-logged-in/route';
import Button from '../../../../client/components/Button/Button';
import styles from '../../accountSharing.module.scss';
import { LogoutResponse } from '../../api/logout/route';
import { Alert } from '../../../../client/components/Alert/Alert';
import { useRouter } from 'next/navigation';
import { FunctionComponent, useState, useRef } from 'react';
import Link from 'next/link';
import { GoChevronLeft } from 'react-icons/go';
import { GoChevronRight } from 'react-icons/go';
type Card = {
  title: string;
  backgroundImage: string;
  url?: string;
};

const CardRow: FunctionComponent<{ cards: Card[]; scrollContainerRef?: React.RefObject<HTMLDivElement> }> = ({
  cards,
  scrollContainerRef,
}) => {
  return (
    <div className={styles.cardsRow} ref={scrollContainerRef}>
      {cards.map((card, index) => (
        <Link
          href={card.url ?? ''}
          key={index}
          className={styles.card}
          target='_blank'
          style={{ backgroundImage: `url(${card.backgroundImage})` }}
        >
          <span className={styles.cardTitle}>{card.title}</span>
        </Link>
      ))}
    </div>
  );
};

const ContentCategory: FunctionComponent<{ title: string; cards: Card[] }> = ({ title, cards }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = 266;
    const newScrollPosition = container.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);

    container.scrollTo({
      left: newScrollPosition,
      behavior: 'smooth',
    });
  };
  return (
    <>
      <div className={styles.homeContent}>
        <h3 className={styles.categoryTitle}>
          <div>{title}</div>
          <button className={styles.scrollButton} onClick={() => scroll('left')}>
            <GoChevronLeft />
          </button>
          <button className={styles.scrollButton} onClick={() => scroll('right')}>
            <GoChevronRight />
          </button>
        </h3>
      </div>
      <CardRow cards={cards} scrollContainerRef={scrollContainerRef} />
    </>
  );
};

export default function AccountSharingHome({ params }: { params: { username: string } }) {
  const username = params.username;
  const { data: visitorData, isLoading: isLoadingVisitorData } = useVisitorData({ timeout: FPJS_CLIENT_TIMEOUT });
  // To display the loading state even before Fingerprint JavaScript agent is loaded
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const router = useRouter();

  const {
    data: loggedInData,
    isLoading: isLoadingLoggedIn,
    error: loggedInError,
  } = useQuery<IsLoggedInResponse, Error, IsLoggedInResponse>({
    queryKey: ['isLoggedIn', params.username, visitorData?.requestId],
    queryFn: async () => {
      const response = await fetch(`/account-sharing/api/is-logged-in`, {
        method: 'POST',
        body: JSON.stringify({
          username: params.username,
          requestId: visitorData?.requestId ?? '',
        } satisfies IsLoggedInPayload),
      });
      return await response.json();
    },
    enabled: Boolean(visitorData?.requestId),
    /**
     * To keep the demo simple, we are using polling to check if the user has been logged out from this device.
     * In a real-world application, you might opt to use a server-sent events (SSE) or web sockets to get real-time updates.
     */
    refetchInterval: 2000,
    onSuccess: (data) => {
      if (data.severity === 'error') {
        youHaveBeenLoggedOut(
          data.otherDevice ? `${data.otherDevice.deviceName} (${data.otherDevice.deviceLocation})` : undefined,
        );
      }
    },
    onSettled: () => {
      setIsInitialLoading(false);
    },
  });

  const {
    mutate: logout,
    isLoading: isLoadingLogout,
    data: logoutData,
    error: logoutError,
  } = useMutation<LogoutResponse, Error>({
    mutationFn: async () => {
      const response = await fetch(`/account-sharing/api/logout`, {
        method: 'POST',
        body: JSON.stringify({ username, requestId: visitorData?.requestId ?? '' }),
      });
      return await response.json();
    },
    onSuccess: (data) => {
      if (data.severity === 'success') {
        youHaveBeenLoggedOut();
      }
    },
  });

  const youHaveBeenLoggedOut = (otherDevice?: string) => {
    const searchParams = new URLSearchParams();
    searchParams.set('mode', 'login');
    searchParams.set('justLoggedOut', 'true');
    if (otherDevice) {
      searchParams.set('otherDevice', otherDevice);
    }
    router.push(`/account-sharing?${searchParams.toString()}`, { scroll: false });
  };

  return (
    <UseCaseWrapper useCase={USE_CASES.accountSharing} noInnerPadding={true}>
      <div className={styles.homeContainer}>
        <div className={styles.header}>
          <h1>FraudFlix</h1>
          <div className={styles.headerRight}>
            <Button size='medium' onClick={() => logout()}>
              {isLoadingLogout || logoutData?.severity === 'success' ? 'Logging out...' : 'Log out'}
            </Button>
          </div>
        </div>

        <div className={styles.homeContent}>
          {logoutError && (
            <Alert severity='error' className={styles.alert}>
              {logoutError.message}
            </Alert>
          )}
          {logoutData?.message && logoutData.severity !== 'success' && (
            <Alert severity={logoutData.severity} className={styles.alert}>
              {logoutData.message}
            </Alert>
          )}
          {isInitialLoading || isLoadingVisitorData || isLoadingLoggedIn ? (
            <div className={styles.loading}>Loading your content library...</div>
          ) : null}
          {loggedInError && (
            <Alert severity='error' className={styles.alert}>
              {loggedInError.message}
            </Alert>
          )}
          {loggedInData?.message && (
            <Alert severity={loggedInData.severity} className={styles.alert}>
              {loggedInData.message}
            </Alert>
          )}
        </div>
        {loggedInData?.severity === 'success' && (
          <>
            <ContentCategory
              title='Shorts'
              cards={[
                {
                  title: `A Tale of a False Positive Flamingo`,
                  backgroundImage: '/account-sharing/img/airport.jpg',
                  url: 'https://www.youtube.com/watch?v=8TJxUGlpTDE',
                },
                {
                  title: 'A Fraud Sommelier',
                  backgroundImage: '/account-sharing/img/sommelier.jpg',
                  url: 'https://www.youtube.com/watch?v=mll2Bm5Qi2A',
                },
                {
                  title: 'Catfished',
                  backgroundImage: '/account-sharing/img/catfished.jpg',
                  url: 'https://www.youtube.com/watch?v=oJolDByP9II',
                },
                {
                  title: 'Introduction to Fingerprint',
                  url: 'https://www.youtube.com/watch?v=cV2KbL9ALPw',
                  backgroundImage: '/account-sharing/img/keshia-intro.jpg',
                },
                {
                  title: 'Device Reputation Network for Android',
                  url: 'https://www.youtube.com/watch?v=rU_yd8MrZNY',
                  backgroundImage: '/account-sharing/img/drn.jpg',
                },
                {
                  title: 'Protect Android apps from cloning',
                  url: 'https://www.youtube.com/watch?v=9ORRUQK4Kgk',
                  backgroundImage: '/account-sharing/img/android-cloning.jpg',
                },
              ]}
            />
            <ContentCategory
              title='Webinars'
              cards={[
                {
                  title: 'Fingerprint  101',
                  url: 'https://www.youtube.com/watch?v=YTRmWUeQWyY&list=PLjhozvP52rLMYFiBLs6wm6E1b2TSbk0yt',
                  backgroundImage: '/account-sharing/img/back-to-school.jpg',
                },
                {
                  title: 'Smart signals introduction',
                  url: 'https://www.youtube.com/watch?v=sf8KM8UgtYY',
                  backgroundImage: '/account-sharing/img/smart-signals.jpg',
                },
                {
                  title: 'Device Intelligence for Fintech',
                  url: 'https://www.youtube.com/watch?v=9UrNabnA9uY',
                  backgroundImage: '/account-sharing/img/fintech.jpg',
                },
                {
                  title: 'Why accuracy is everything',
                  url: 'https://www.youtube.com/watch?v=rTBXQpsioUo&t',
                  backgroundImage: '/account-sharing/img/accuracy.jpg',
                },
                {
                  title: 'Apple and Google privacy changes',
                  url: 'https://www.youtube.com/watch?v=3ebVmdnVw_E',
                  backgroundImage: '/account-sharing/img/privacy.jpg',
                },
                {
                  title: 'State of Payment Fraud',
                  url: 'https://www.youtube.com/watch?v=cV2KbL9ALPw',
                  backgroundImage: '/account-sharing/img/payment-fraud.jpg',
                },
              ]}
            />
            <ContentCategory
              title='Podcasts'
              cards={[
                {
                  title: 'CEO Dan Pinto on State of Identity podcast',
                  url: 'https://liminal.co/podcast/fingerprintjs-fraud-at-the-source/',
                  backgroundImage: '/account-sharing/img/state-of-identity-podcast.webp',
                },
                {
                  title: 'CTO Valentin Vasilyev on Modern CTO podcast',
                  url: 'https://moderncto.io/valentin-vasilyev/',
                  backgroundImage: '/account-sharing/img/modern-cto.jpg',
                },
                {
                  title: 'CEO Dan Pinto on PayPod',
                  url: 'https://open.spotify.com/episode/7uUMq1GYFfKgiZ3WiX21Lc',
                  backgroundImage: '/account-sharing/img/paypod.webp',
                },
                {
                  title: 'CTO Valentin Vasilyev on Code Story podcast',
                  url: 'https://codestory.co/podcast/bonus-valentin-vasilyev-fingerprint-com-device-identity/',
                  backgroundImage: '/account-sharing/img/code-story.webp',
                },
                {
                  title: 'CEO Dan Pinto on Leaders in Payments podcast',
                  url: 'https://www.youtube.com/watch?v=5xSmfi_mMyM',
                  backgroundImage: '/account-sharing/img/leaders-in-payments.webp',
                },
                {
                  title: 'CTO Valentin Vasilyev on Journey Into Fraud Prevention',
                  url: 'https://podcasts.apple.com/gb/podcast/a-journey-into-fraud-prevention/id1696704281',
                  backgroundImage: '/account-sharing/img/journey-into-fraud-prevention.webp',
                },
              ]}
            />
            <div className={styles.spacer} />
          </>
        )}
      </div>
    </UseCaseWrapper>
  );
}
