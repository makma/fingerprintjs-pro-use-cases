// Source https://data.worldbank.org/indicator/NY.GDP.PCAP.PP.CD?end=2022
// Surprisingly I couldn't find any publicly available industry-standard PPP data
// Obviously GDP is just an imperfect heuristic for purchasing power, but good enough for our purposes here
import gdpData from './gdp-capita-by-country.json';
import fs from 'fs';

// Use USA GDP as a reference point
const usaGdp = gdpData.find((country) => country.countryCode === 'US')?.gdpPerCapita as number;
if (!usaGdp) {
  throw new Error('USA GDP not found');
}

const MIN_PPP = 0.3;

const pppMap: Record<string, number> = {};

gdpData.forEach((country) => {
  // Countries with no GDP data get a placeholder PPP of 80%
  if (country.gdpPerCapita === null) {
    pppMap[country.countryCode] = 0.8;
  }
  // Even rich countries get a small discount for demo purposes
  else if (country.gdpPerCapita >= usaGdp) {
    pppMap[country.countryCode] = 0.95;
  }
  // Other countries get a PPP proportional to their GDP, but min 30%
  else {
    const ppp = Math.max(country.gdpPerCapita / usaGdp, MIN_PPP);
    pppMap[country.countryCode] = Math.round(ppp * 100) / 100;
  }
});

console.log(pppMap);
fs.writeFileSync('./src/app/vpn-detection/data/ppp-by-country.json', JSON.stringify(pppMap));
