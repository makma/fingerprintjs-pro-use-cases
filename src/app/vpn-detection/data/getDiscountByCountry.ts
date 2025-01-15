import pppByCountry from './ppp-by-country.json';

export const roundToPlaces = (num: number, places: number) => {
  const factor = Math.pow(10, places);
  return Math.round(num * factor) / factor;
};

const FALLBACK_DISCOUNT = 20;

export const getRegionalDiscount = (countryCode?: string) => {
  if (!countryCode) {
    return FALLBACK_DISCOUNT;
  }
  const ppp = (pppByCountry as Record<string, number | undefined>)[countryCode] ?? 0.8;
  return roundToPlaces((1 - ppp) * 100, 2);
};
