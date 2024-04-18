import { FingerprintJsServerApiClient, AuthenticationMode } from '@fingerprintjs/fingerprintjs-pro-server-api';
import { ENV } from '../env';

import { Region } from '@fingerprintjs/fingerprintjs-pro-server-api';

const backendRegionMap = {
  eu: Region.EU,
  ap: Region.AP,
  us: Region.Global,
};

export const getServerRegion = (region: 'eu' | 'ap' | 'us') => backendRegionMap[region];

export const fingerprintServerApiClient = new FingerprintJsServerApiClient({
  apiKey: ENV.SERVER_API_KEY,
  region: getServerRegion(ENV.NEXT_PUBLIC_REGION),
  // Temporary fix for StackBlitz, remove once Server API supports CORS
  authenticationMode: AuthenticationMode.QueryParameter,
});
