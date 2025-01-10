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

export default function AccountSharingHome({ params }: { params: { username: string } }) {
  const username = params.username;
  const { data: visitorData, isLoading: isLoadingVisitorData } = useVisitorData({ timeout: FPJS_CLIENT_TIMEOUT });
  const router = useRouter();

  const youHaveBeenLoggedOut = (otherDevice?: string) => {
    const searchParams = new URLSearchParams();
    searchParams.set('mode', 'login');
    searchParams.set('justLoggedOut', 'true');
    if (otherDevice) {
      searchParams.set('otherDevice', otherDevice);
    }
    router.push(`/account-sharing?${searchParams.toString()}`, { scroll: false });
  };

  const { data: loginData, isLoading: isLoadingLoggedIn } = useQuery<IsLoggedInResponse, Error, IsLoggedInResponse>({
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

  return (
    <UseCaseWrapper useCase={USE_CASES.accountSharing} noInnerPadding={true}>
      <div className={styles.header}>
        <h1>Fraudflix</h1>
        <div className={styles.headerRight}>
          <div>{username}</div>
          <Button onClick={() => logout()}>{isLoadingLogout ? 'Logging out...' : 'Logout'}</Button>
        </div>
      </div>
      {logoutError && <div>{logoutError.message}</div>}
      {logoutData?.message && logoutData.severity !== 'success' && (
        <Alert severity={logoutData.severity} className={styles.alert}>
          {logoutData.message}
        </Alert>
      )}

      {isLoadingVisitorData || (isLoadingLoggedIn && <div>Loading...</div>)}
      {loginData?.message && <div>{loginData.message}</div>}
      {loginData?.severity === 'success' && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '1rem',
            padding: '2rem',
          }}
        >
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              style={{
                aspectRatio: '16/9',
                backgroundColor: '#2F2F2F',
                borderRadius: '4px',
                transition: 'transform 0.2s',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            />
          ))}
        </div>
      )}
    </UseCaseWrapper>
  );
}
