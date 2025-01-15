import { Severity, getAndValidateFingerprintResult } from '../../../../server/checks';
import { ONE_DAY_MS, FIVE_MINUTES_MS, ONE_HOUR_MS } from '../../../../utils/timeUtils';
import { NextRequest, NextResponse } from 'next/server';
import { AIRPORTS } from '../../data/airports';
import { Flight } from '../../components/FlightCard';
import { saveBotVisit } from '../../../bot-firewall/api/get-bot-visits/botVisitDatabase';

const roundToFiveMinutes = (time: number) => Math.round(time / FIVE_MINUTES_MS) * FIVE_MINUTES_MS;

export type FlightQuery = {
  from: string;
  to: string;
  requestId: string;
  disableBotDetection: boolean;
};

export type FlightsResponse = {
  message: string;
  severity: Severity;
  data?: Flight[];
};

export async function POST(req: NextRequest): Promise<NextResponse<FlightsResponse>> {
  const { from, to, requestId, disableBotDetection } = (await req.json()) as FlightQuery;

  // Get the full Identification and Bot Detection result from Fingerprint Server API and validate its authenticity
  const fingerprintResult = await getAndValidateFingerprintResult({
    requestId,
    req,
    options: { minConfidenceScore: 0.5 },
  });
  if (!fingerprintResult.okay) {
    return NextResponse.json({ severity: 'error', message: fingerprintResult.error }, { status: 403 });
  }

  const identification = fingerprintResult.data.products.identification?.data;
  const botData = fingerprintResult.data.products.botd?.data;

  // Backdoor for demo and testing purposes
  // If bot detection is disabled, just send the result
  if (!botData || disableBotDetection) {
    return NextResponse.json({
      severity: 'success',
      message: 'Bot detection is disabled.',
      data: getFlightResults(from, to),
    });
  }

  // If a bot is detected, return an error
  if (botData.bot.result === 'bad') {
    // Optionally, here you could also save the bot's IP address to a blocklist in your database
    // and block all requests from this IP address in the future at a web server/firewall level.
    saveBotVisit(botData, identification?.visitorId ?? 'N/A');
    return NextResponse.json(
      { severity: 'error', message: '🤖 Malicious bot detected, access denied.' },
      { status: 403 },
    );
  }

  // Check for unexpected bot detection value, just in case
  if (!['notDetected', 'good'].includes(botData.bot.result)) {
    return NextResponse.json(
      { severity: 'error', message: 'Server error, unexpected bot detection value.' },
      { status: 500 },
    );
  }

  // All checks passed, allow access
  return NextResponse.json({
    severity: 'success',
    message: 'No malicious bot nor spoofing detected, access allowed.',
    data: getFlightResults(from, to),
  });
}

/**
 * Randomly generates flight results for given airport codes
 * to simulate the expensive query you are trying to protect from web scraping.
 */
function getFlightResults(fromCode: string, toCode: string): Flight[] {
  if (!AIRPORTS.find((airport) => airport.code === fromCode) || !AIRPORTS.find((airport) => airport.code === toCode)) {
    return [];
  }
  const results: Flight[] = [];
  const airlines = ['United', 'Delta', 'American', 'Southwest', 'Alaska', 'JetBlue'];
  for (const airline of airlines.slice(0, 2 + Math.floor(Math.random() * 4))) {
    const now = Date.now();
    const departureTime = roundToFiveMinutes(now + Math.random() * ONE_DAY_MS);
    const arrivalTime = roundToFiveMinutes(departureTime + 3 * ONE_HOUR_MS + Math.random() * (ONE_DAY_MS / 2));
    const tripLength = roundToFiveMinutes(3 * ONE_DAY_MS + Math.random() * ONE_DAY_MS);
    const returnDepartureTime = departureTime + tripLength;
    const returnArrivalTime = arrivalTime + tripLength;
    const price = 50 + Math.floor(Math.random() * 400) * 2;
    const flightNumber = `${airline.slice(0, 2).toUpperCase()}${Math.floor(Math.random() * 1000)}`;

    results.push({
      fromCode,
      toCode,
      fromCity: AIRPORTS.find((airport) => airport.code === fromCode)?.city ?? 'City not found',
      toCity: AIRPORTS.find((airport) => airport.code === toCode)?.city ?? 'City not found',
      departureTime,
      arrivalTime,
      returnDepartureTime,
      returnArrivalTime,
      price,
      airline,
      flightNumber,
    });
  }

  return results;
}
