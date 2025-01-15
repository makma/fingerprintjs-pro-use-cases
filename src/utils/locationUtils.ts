import { EventResponse } from '@fingerprintjs/fingerprintjs-pro-server-api';
import { EventResponseIpInfoV4Geolocation } from './types';

export const UNKNOWN_LOCATION = 'Unknown';
export function getLocationName(ipLocation?: EventResponseIpInfoV4Geolocation, includeSubdivision = true) {
  const addressParts: string[] = [];
  if (!ipLocation) {
    return UNKNOWN_LOCATION;
  }
  const { city, country, subdivisions } = ipLocation;
  if (city?.name && ipLocation.accuracyRadius && ipLocation.accuracyRadius <= 50) {
    addressParts.push(city.name);
  }

  if (subdivisions?.[0]?.name && ipLocation.accuracyRadius && ipLocation.accuracyRadius <= 100 && includeSubdivision) {
    addressParts.push(subdivisions[0].name);
  }

  if (country) {
    addressParts.push(country.name);
  }

  if (addressParts.length === 0) {
    return UNKNOWN_LOCATION;
  }

  return addressParts.join(', ');
}

export const getIpLocation = (eventResponse?: EventResponse): EventResponseIpInfoV4Geolocation | undefined => {
  return eventResponse?.products.ipInfo?.data?.v4?.geolocation;
};

// Courtesy of https://dev.to/jorik/country-code-to-flag-emoji-a21
export const getFlagEmoji = (countryCode?: string) => {
  if (!countryCode) {
    return '';
  }
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};

export const getZoomLevel = (accuracyRadius?: number) => {
  if (!accuracyRadius || accuracyRadius > 500) {
    // Continent level zoon
    return 2;
  }
  if (accuracyRadius > 100) {
    // Country level zoom
    return 5;
  }
  // City level zoom
  return 10;
};
