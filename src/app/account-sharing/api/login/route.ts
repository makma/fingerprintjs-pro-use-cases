import { NextResponse } from 'next/server';
import { DeviceDbModel, UserDbModel } from '../database';
import { hashString } from '../../../../server/server-utils';
import { getAndValidateFingerprintResult } from '../../../../server/checks';
import { getLocationName } from '../../../../utils/locationUtils';
import { ACCOUNT_SHARING_COPY } from '../../const';

export type LoginPayload = {
  username: string;
  password: string;
  requestId: string;
  force?: boolean;
};

export type LoginResponse = {
  message: string;
  severity: 'success' | 'error';
  otherDevice?: {
    deviceName: string;
    deviceLocation: string;
  };
};

export async function POST(req: Request): Promise<NextResponse<LoginResponse>> {
  const { username, password, requestId, force } = (await req.json()) as LoginPayload;

  // Get the full Identification result from Fingerprint Server API and validate its authenticity
  const fingerprintResult = await getAndValidateFingerprintResult({
    requestId,
    req,
    options: { minConfidenceScore: 0.5 },
  });
  if (!fingerprintResult.okay) {
    return NextResponse.json({ message: fingerprintResult.error, severity: 'error' }, { status: 403 });
  }

  // Get visitorId from the Server API Identification event
  const visitorId = fingerprintResult.data.products.identification?.data?.visitorId;
  if (!visitorId) {
    return NextResponse.json({ message: ACCOUNT_SHARING_COPY.visitorIdNotFound, severity: 'error' }, { status: 403 });
  }

  const account = await UserDbModel.findOne({ where: { username } });
  if (!account) {
    // Note: More secure practice is to return a generic message like `Invalid username or password.`
    // to not give away any information. But here we are optimizing for ease of use for people trying the demo.
    return NextResponse.json({ message: ACCOUNT_SHARING_COPY.userNotFound, severity: 'error' }, { status: 401 });
  }

  // Check if the password is correct
  const isPasswordValid = hashString(password) === account.passwordHash;
  if (!isPasswordValid) {
    return NextResponse.json({ message: ACCOUNT_SHARING_COPY.incorrectPassword, severity: 'error' }, { status: 401 });
  }

  // Check if the user is already logged in on another device
  const loggedInDevices = await DeviceDbModel.findAll({ where: { username } });
  const anotherDevice = loggedInDevices[0];
  const alreadyLoggedInAnotherDevice = loggedInDevices.length >= 1 && anotherDevice.visitorId !== visitorId;
  if (alreadyLoggedInAnotherDevice && !force) {
    return NextResponse.json(
      {
        message: `${ACCOUNT_SHARING_COPY.alreadyLoggedIn}
            \n\n 
            Logging in here will log you out of ${anotherDevice.deviceName} in ${anotherDevice.deviceLocation}. 
            Log in anyway?`,
        severity: 'error',
        otherDevice: {
          deviceName: anotherDevice.deviceName,
          deviceLocation: anotherDevice.deviceLocation,
        },
      },
      { status: 409 },
    );
  }

  // No devices currently logged in or force is true
  await DeviceDbModel.destroy({ where: { username } });
  await DeviceDbModel.create({
    visitorId,
    username,
    deviceName: fingerprintResult.data.products.identification?.data?.browserDetails.browserName ?? 'the other device',
    deviceLocation: getLocationName(fingerprintResult.data.products.ipInfo?.data?.v4?.geolocation, false),
  });

  return NextResponse.json({ message: 'Login successful', severity: 'success' }, { status: 200 });
}
