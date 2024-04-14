import pppByCountry from './ppp-by-country.json';

export const roundToPlaces = (num: number, places: number) => {
  const factor = Math.pow(10, places);
  return Math.round(num * factor) / factor;
};

export const getRegionalDiscount = (countryCode: string) => {
  const ppp = (pppByCountry as Record<string, number>)[countryCode] ?? 0.8;
  return roundToPlaces((1 - ppp) * 100, 2);
};
