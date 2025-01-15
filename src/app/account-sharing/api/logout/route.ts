import { NextResponse } from 'next/server';
import { DeviceDbModel, UserDbModel } from '../database';
import { getAndValidateFingerprintResult } from '../../../../server/checks';

export type LogoutPayload = {
  username: string;
  requestId: string;
};

export type LogoutResponse = {
  message: string;
  severity: 'success' | 'error';
};

export async function POST(req: Request): Promise<NextResponse<LogoutResponse>> {
  const { username, requestId } = (await req.json()) as LogoutPayload;

  // Get the full Identification result from Fingerprint Server API and validate its authenticity
  const fingerprintResult = await getAndValidateFingerprintResult({
    requestId,
    req,
    options: { disableFreshnessCheck: true },
  });
  if (!fingerprintResult.okay) {
    return NextResponse.json({ message: fingerprintResult.error, severity: 'error' }, { status: 403 });
  }

  // Get visitorId from the Server API Identification event
  const visitorId = fingerprintResult.data.products.identification?.data?.visitorId;
  if (!visitorId) {
    return NextResponse.json({ message: 'Visitor ID not found.', severity: 'error' }, { status: 403 });
  }

  const account = await UserDbModel.findOne({ where: { username } });
  if (!account) {
    return NextResponse.json({ message: 'User not found.', severity: 'error' }, { status: 401 });
  }

  // Check if the user is logged in on this device
  // const isLoggedIn = await DeviceDbModel.findOne({ where: { username, visitorId } });
  // if (!isLoggedIn) {
  //   return NextResponse.json({ message: 'You are not logged in.', severity: 'error' }, { status: 401 });
  // }

  // Log out the user
  await DeviceDbModel.destroy({ where: { username, visitorId } });
  return NextResponse.json({ message: 'Logged out successfully', severity: 'success' }, { status: 200 });
}
