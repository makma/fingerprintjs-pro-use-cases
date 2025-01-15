/**
 * This file and folder just contains code for third-party tools that help us provide user assistance and see trends
 * in how people use demo.fingerprint.com.
 * It is only deployed for production builds (`next build`) and when the expected environment variables are set.
 * It is not part of the reference implementation for any of the use cases, feel free to ignore it.
 **/
'use client';

import { env } from '../../env';

import { GoogleTagManager } from './Gtm';
import { Amplitude } from './Amplitude';
import { useEffect } from 'react';
import { InkeepChatButton } from './Inkeep';

// GTM API requires dataLayer access through global window variable
declare global {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface Window {
    // eslint-disable-next-line @typescript-eslint/ban-types
    dataLayer?: object[];
  }
}

const enableAnalytics = () => {
  // Required for development since without SSR sendEvent will be called before Helmet has a chance to inject the script that initializes dataLayer.
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ event: 'event.enableAnalytics' }, { enableAnalytics: true });
};

const GTM_ID = env.NEXT_PUBLIC_GTM_ID;
const AMPLITUDE_API_KEY = env.NEXT_PUBLIC_AMPLITUDE_API_KEY;

export const ThirdPartyIntegrations = () => {
  useEffect(() => {
    enableAnalytics();
  }, []);

  return (
    <>
      {GTM_ID ? <GoogleTagManager gtmId={GTM_ID} /> : null}
      {AMPLITUDE_API_KEY ? <Amplitude apiKey={AMPLITUDE_API_KEY} /> : null}
      <InkeepChatButton />
    </>
  );
};
