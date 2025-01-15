import { describe, it, expect } from 'vitest';
import { getFlagEmoji, getLocationName, UNKNOWN_LOCATION } from './locationUtils';

describe('getLocationName test', () => {
  it('Should return Unknown in case of undefined ipLocation', () => {
    expect(getLocationName()).toBe(UNKNOWN_LOCATION);
  });

  it('Should return Unknown in case of empty ipLocation', () => {
    expect(getLocationName({})).toBe(UNKNOWN_LOCATION);
  });

  it('Should return only country in case of high accuracyRadius', () => {
    expect(
      getLocationName({
        city: { name: 'Columbus' },
        country: { code: 'US', name: 'United States' },
        accuracyRadius: 1000,
      }),
    ).toBe('United States');
  });

  it('Should return only subdivision in case of medium accuracyRadius', () => {
    expect(
      getLocationName({
        accuracyRadius: 100,
        city: {
          name: 'Nova',
        },
        country: {
          code: 'PT',
          name: 'Portugal',
        },
        continent: {
          code: 'EU',
          name: 'Europe',
        },
        subdivisions: [
          {
            isoCode: '13',
            name: 'Porto',
          },
        ],
      }),
    ).toBe('Porto, Portugal');
  });

  it('Should return only city in case of other empty params', () => {
    expect(getLocationName({ city: { name: 'Berlin' }, accuracyRadius: 20 })).toBe('Berlin');
  });

  it('Should return city and country in case of empty subdivisions', () => {
    expect(
      getLocationName({
        city: { name: 'Columbus' },
        country: { code: 'US', name: 'United States' },
        accuracyRadius: 20,
      }),
    ).toBe('Columbus, United States');
  });

  it('Should return city, country and subdivision', () => {
    expect(
      getLocationName({
        city: { name: 'Columbus' },
        country: { code: 'US', name: 'United States' },
        subdivisions: [{ isoCode: 'OH', name: 'Ohio' }],
        accuracyRadius: 20,
      }),
    ).toBe('Columbus, Ohio, United States');
  });

  it('Should return city, country and only first subdivision', () => {
    expect(
      getLocationName({
        city: { name: 'Columbus' },
        country: { code: 'US', name: 'United States' },
        accuracyRadius: 20,
        subdivisions: [
          { isoCode: 'OH', name: 'Ohio' },
          // @ts-ignore Mock test object
          { isoCode: 'FK', name: 'Fake additional subdivision' },
        ],
      }),
    ).toBe('Columbus, Ohio, United States');
  });
});

describe('getFlagEmoji test', () => {
  const testCases = {
    SK: '🇸🇰',
    CZ: '🇨🇿',
    US: '🇺🇸',
    CA: '🇨🇦',
    GB: '🇬🇧',
    DE: '🇩🇪',
    FR: '🇫🇷',
    JP: '🇯🇵',
    BR: '🇧🇷',
    IN: '🇮🇳',
  };
  Object.entries(testCases).forEach(([key, value]) => {
    it(`Should return ${value} for ${key}`, () => {
      expect(getFlagEmoji(key)).toBe(value);
    });
  });
});
