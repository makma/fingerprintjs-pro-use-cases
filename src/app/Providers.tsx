'use client';

import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { SnackbarProvider } from 'notistack';
import { PropsWithChildren } from 'react';
import { FingerprintJSPro, FpjsProvider } from '@fingerprintjs/fingerprintjs-pro-react';
import { env } from '../env';
import { CloseSnackbarButton, CustomSnackbar } from '../client/components/Alert/Alert';
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

export const FP_LOAD_OPTIONS: FingerprintJSPro.LoadOptions = {
  apiKey: env.NEXT_PUBLIC_API_KEY,
  scriptUrlPattern: [env.NEXT_PUBLIC_SCRIPT_URL_PATTERN, FingerprintJSPro.defaultScriptUrlPattern],
  endpoint: [env.NEXT_PUBLIC_ENDPOINT, FingerprintJSPro.defaultEndpoint],
  region: env.NEXT_PUBLIC_REGION,
  remoteControlDetection: true,
};

function Providers({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={false} />
      <SnackbarProvider
        action={(snackbarId) => <CloseSnackbarButton snackbarId={snackbarId} />}
        maxSnack={4}
        autoHideDuration={5000}
        anchorOrigin={{
          horizontal: 'left',
          vertical: 'bottom',
        }}
        Components={{
          default: CustomSnackbar,
          success: CustomSnackbar,
          error: CustomSnackbar,
          warning: CustomSnackbar,
          info: CustomSnackbar,
        }}
      >
        <FpjsProvider loadOptions={FP_LOAD_OPTIONS}>{children}</FpjsProvider>
      </SnackbarProvider>
    </QueryClientProvider>
  );
}

export default Providers;
