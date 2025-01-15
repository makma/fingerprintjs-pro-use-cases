import { Op } from 'sequelize';
import { NextResponse } from 'next/server';
import { env } from 'process';
import { Severity, getAndValidateFingerprintResult } from '../../../../server/checks';
import { CREDENTIAL_STUFFING_COPY } from './copy';
import { LoginAttemptResult, LoginAttemptDbModel } from './database';
import { sequelize } from '../../../../server/sequelize';

export type LoginPayload = {
  username: string;
  password: string;
  requestId: string;
  visitorId: string;
};

export type LoginResponse = {
  message: string;
  severity: Severity;
};

// Mocked user with leaked credentials associated with visitorIds.
const mockedUser = {
  userName: 'user',
  password: 'password',
  knownVisitorIds: getKnownVisitorIds(),
};

function getKnownVisitorIds() {
  // cspell:disable-next-line
  const defaultVisitorIds = ['bXbwuhCBRB9lLTK692vw', 'ABvLgKyH3fAr6uAjn0vq', 'BNvLgKyHefAr9iOjn0ul'];
  const visitorIdsFromEnv = env.KNOWN_VISITOR_IDS?.split(',');
  console.info(`Extracted ${visitorIdsFromEnv?.length ?? 0} visitorIds from env.`);
  return visitorIdsFromEnv ? [...defaultVisitorIds, ...visitorIdsFromEnv] : defaultVisitorIds;
}

export async function POST(req: Request): Promise<NextResponse<LoginResponse>> {
  const { requestId, username, password, visitorId: clientVisitorId } = (await req.json()) as LoginPayload;

  // Get the full Identification result from Fingerprint Server API and validate its authenticity
  const fingerprintResult = await getAndValidateFingerprintResult({ requestId, req });
  if (!fingerprintResult.okay) {
    logLoginAttempt(clientVisitorId, username, 'RequestIdValidationFailed');
    return NextResponse.json({ message: fingerprintResult.error, severity: 'error' }, { status: 403 });
  }

  // Get visitorId from the Server API Identification event
  const visitorId = fingerprintResult.data.products.identification?.data?.visitorId;
  if (!visitorId) {
    logLoginAttempt(clientVisitorId, username, 'RequestIdValidationFailed');
    return NextResponse.json({ message: 'Visitor ID not found.', severity: 'error' }, { status: 403 });
  }

  // If the visitor ID performed 5 unsuccessful login attempts during the last 24 hours we do not perform the login.
  const failedLoginTypes: LoginAttemptResult[] = ['IncorrectCredentials', 'RequestIdValidationFailed'];
  const failedLoginsToday = await LoginAttemptDbModel.findAndCountAll({
    where: {
      visitorId,
      timestamp: {
        [Op.gt]: new Date().getTime() - 24 * 60 * 1000,
      },
      loginAttemptResult: {
        [Op.or]: [failedLoginTypes],
      },
    },
  });
  if (failedLoginsToday.count >= 5) {
    logLoginAttempt(visitorId, username, 'TooManyLoginAttempts');
    return NextResponse.json({ message: CREDENTIAL_STUFFING_COPY.tooManyAttempts, severity: 'error' }, { status: 403 });
  }

  // If the provided credentials are incorrect, we return an error.
  if (!credentialsAreCorrect(username, password)) {
    logLoginAttempt(visitorId, username, 'IncorrectCredentials');
    return NextResponse.json(
      { message: CREDENTIAL_STUFFING_COPY.invalidCredentials, severity: 'error' },
      { status: 403 },
    );
  }

  // If the provided credentials are correct but the user never logged in using this browser,
  // we force the user to use multi-factor authentication (text message, email, authenticator app, etc.)
  if (!mockedUser.knownVisitorIds.includes(visitorId)) {
    logLoginAttempt(visitorId, username, 'UnknownBrowserEnforceMFA');
    return NextResponse.json(
      { message: CREDENTIAL_STUFFING_COPY.differentVisitorIdUseMFA, severity: 'warning' },
      { status: 403 },
    );
  }

  // If the provided credentials are correct and we recognize the browser, we log the user in
  logLoginAttempt(visitorId, username, 'Success');
  return NextResponse.json({ message: CREDENTIAL_STUFFING_COPY.success, severity: 'success' });
}

// Dummy action simulating authentication.
function credentialsAreCorrect(name: string, password: string): boolean {
  return name === mockedUser.userName && password === mockedUser.password;
}

// Persists login attempt to the database.
async function logLoginAttempt(visitorId: string, username: string, loginAttemptResult: LoginAttemptResult) {
  await LoginAttemptDbModel.create({
    visitorId,
    username,
    loginAttemptResult,
    timestamp: new Date(),
  });
  await sequelize.sync();
}
