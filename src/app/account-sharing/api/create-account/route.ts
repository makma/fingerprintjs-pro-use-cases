import { NextResponse } from 'next/server';
import { getAndValidateFingerprintResult } from '../../../../server/checks';
import { DeviceDbModel, UserDbModel } from '../database';
import { hashString } from '../../../../server/server-utils';
import { getLocationName } from '../../../../utils/locationUtils';

export type CreateAccountPayload = {
  requestId: string;
  username: string;
  password: string;
};

export type CreateAccountResponse = {
  message: string;
  severity: 'success' | 'error';
};

export async function POST(req: Request): Promise<NextResponse<CreateAccountResponse>> {
  const { requestId, username, password } = (await req.json()) as CreateAccountPayload;

  // Get the full Identification result from Fingerprint Server API and validate its authenticity
  const fingerprintResult = await getAndValidateFingerprintResult({ requestId, req });
  if (!fingerprintResult.okay) {
    return NextResponse.json({ message: fingerprintResult.error, severity: 'error' }, { status: 403 });
  }

  // Get visitorId from the Server API Identification event
  const visitorId = fingerprintResult.data.products.identification?.data?.visitorId;
  if (!visitorId) {
    return NextResponse.json({ message: 'Visitor ID not found.', severity: 'error' }, { status: 403 });
  }

  const existingUser = await UserDbModel.findOne({ where: { username } });
  if (existingUser) {
    return NextResponse.json(
      { message: 'Username already exists. Log in instead?', severity: 'error' },
      { status: 403 },
    );
  }

  // Create the user
  UserDbModel.create({
    username,
    passwordHash: hashString(password),
    createdWithVisitorId: visitorId,
  });

  // Set the device as current device
  await DeviceDbModel.create({
    visitorId,
    username,
    deviceName: fingerprintResult.data.products.identification?.data?.browserDetails.browserName ?? 'the other device',
    deviceLocation: getLocationName(fingerprintResult.data.products.ipInfo?.data?.v4?.geolocation, false),
  });
  // If the provided credentials are correct and we recognize the browser, we log the user in
  return NextResponse.json({ message: 'Account created successfully', severity: 'success' });
}
