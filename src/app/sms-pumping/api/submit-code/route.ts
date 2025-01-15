import { Severity, getAndValidateFingerprintResult } from '../../../../server/checks';
import { Op } from 'sequelize';
import { hashString } from '../../../../server/server-utils';
import { NextRequest, NextResponse } from 'next/server';
import { SmsVerificationDatabaseModel } from '../database';
import { SMS_FRAUD_COPY } from '../smsPumpingConst';

export type SubmitCodePayload = {
  requestId: string;
  phoneNumber: string;
  code: number;
};

export type SubmitCodeResponse = {
  message: string;
  severity: Severity;
};

export async function POST(req: NextRequest): Promise<NextResponse<SubmitCodeResponse>> {
  const { phoneNumber, code, requestId } = (await req.json()) as SubmitCodePayload;

  // Get the full identification result from Fingerprint Server API and validate its authenticity
  const fingerprintResult = await getAndValidateFingerprintResult({ requestId, req });
  if (!fingerprintResult.okay) {
    return NextResponse.json({ severity: 'error', message: fingerprintResult.error }, { status: 403 });
  }

  // If identification data is missing, return an error
  const identification = fingerprintResult.data.products.identification?.data;
  if (!identification) {
    return NextResponse.json({ severity: 'error', message: 'Identification data not found.' }, { status: 403 });
  }

  // Retrieve SMS verification requests made by this browser to this phone number
  const latestSmsVerificationRequest = await SmsVerificationDatabaseModel.findOne({
    where: {
      visitorId: identification.visitorId,
      phoneNumberHash: hashString(phoneNumber),
      timestamp: {
        [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0)),
      },
    },
    order: [['timestamp', 'DESC']],
  });

  // If there are no SMS verification requests, return an error
  if (!latestSmsVerificationRequest) {
    return NextResponse.json({ severity: 'error', message: 'No SMS verification requests found.' }, { status: 403 });
  }

  // If the code is incorrect, return an error
  if (latestSmsVerificationRequest.code !== code) {
    return NextResponse.json({ severity: 'error', message: SMS_FRAUD_COPY.incorrectCode }, { status: 403 });
  }

  // If the code is correct, return a success message
  return NextResponse.json({ severity: 'success', message: SMS_FRAUD_COPY.accountCreated });
}
