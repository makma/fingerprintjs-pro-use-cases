import { NextApiRequest, NextApiResponse } from 'next';
import { Severity, getAndValidateFingerprintResult } from '../../../server/checks';
import { isValidPostRequest } from '../../../server/server';
import { RealSmsPerVisitorModel, SmsVerificationDatabaseModel } from '../../../server/sms-pumping/database';
import { ONE_SECOND_MS, readableMilliseconds } from '../../../shared/timeUtils';
import { Op } from 'sequelize';
import { pluralize } from '../../../shared/utils';
import Twilio from 'twilio';
import { hashString } from '../../../server/server-utils';
import {
  SMS_ATTEMPT_TIMEOUT_MAP,
  MAX_SMS_ATTEMPTS,
  REAL_SMS_LIMIT_PER_VISITOR,
  SMS_FRAUD_COPY,
  TEST_PHONE_NUMBER,
} from '../../../server/sms-pumping/smsPumpingConst';

export type SendSMSPayload = {
  requestId: string;
  phoneNumber: string;
  email: string;
  disableBotDetection?: boolean;
};

export type SendSMSResponse = {
  message: string;
  severity: Severity;
  data?: {
    remainingAttempts?: number;
    verificationCode?: number;
  };
};

// To avoid saying "Wait 0 seconds to send another message"
const TIMEOUT_TOLERANCE_MS = ONE_SECOND_MS;
const millisecondsToSeconds = (milliseconds: number) => Math.floor(milliseconds / 1000);
const midnightToday = () => new Date(new Date().setHours(0, 0, 0, 0));

const generateRandomSixDigitCode = () => Math.floor(100000 + Math.random() * 900000);
const sendSms = async (phone: string, body: string, visitorId: string) => {
  if (phone === TEST_PHONE_NUMBER) {
    console.log('Test phone number detected, simulated message sent: ', body);
    return;
  }

  // Track real messages count per visitor that cannot be reset
  await RealSmsPerVisitorModel.findOrCreate({ where: { visitorId } });
  await RealSmsPerVisitorModel.increment('realMessagesCount', {
    where: {
      visitorId,
    },
  });

  const apiKeySid = process.env.TWILIO_API_KEY_SID;
  const apiKeySecret = process.env.TWILIO_API_KEY_SECRET;
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const fromNumber = process.env.TWILIO_FROM_NUMBER;

  if (!apiKeySid) {
    throw new Error('Twilio API key SID not found.');
  }

  if (!apiKeySecret) {
    throw new Error('Twilio API key secret not found.');
  }

  if (!accountSid) {
    throw new Error('Twilio account SID not found.');
  }

  if (!fromNumber) {
    throw new Error('Twilio FROM number not found.');
  }

  const client = Twilio(apiKeySid, apiKeySecret, { accountSid });

  const message = await client.messages.create({
    body,
    from: fromNumber,
    to: phone,
  });

  console.log('Message sent: ', message.sid);
};

export default async function sendVerificationSMS(req: NextApiRequest, res: NextApiResponse<SendSMSResponse>) {
  // This API route accepts only POST requests.
  const reqValidation = isValidPostRequest(req);
  if (!reqValidation.okay) {
    res.status(405).send({ severity: 'error', message: reqValidation.error });
    return;
  }

  const { phoneNumber: phone, email, requestId, disableBotDetection } = req.body as SendSMSPayload;

  // Get the full identification Fingerprint Server API, check it authenticity and filter away Bot and Tor requests
  const fingerprintResult = await getAndValidateFingerprintResult({
    requestId,
    req,
    options: {
      blockBots: !disableBotDetection,
      blockTor: true,
    },
  });
  if (!fingerprintResult.okay) {
    res.status(403).send({ severity: 'error', message: fingerprintResult.error });
    return;
  }

  // If identification data is missing, return an error
  const visitorId = fingerprintResult.data.products?.identification?.data?.visitorId;
  if (!visitorId) {
    res.status(403).send({ severity: 'error', message: 'Identification data not found.' });
    return;
  }

  // Retrieve SMS verification requests made by the same browser today from the database, most recent first
  const smsVerificationRequests = await SmsVerificationDatabaseModel.findAll({
    where: {
      visitorId,
      timestamp: {
        [Op.gte]: midnightToday(),
      },
    },
    order: [['timestamp', 'DESC']],
  });
  const requestsToday = smsVerificationRequests.length;

  // If there have been too many requests, shut the visitor down for the day
  if (requestsToday >= MAX_SMS_ATTEMPTS) {
    res.status(403).send({
      severity: 'error',
      message: SMS_FRAUD_COPY.blockedForToday({ requestsToday }),
      data: {
        remainingAttempts: 0,
      },
    });
    return;
  }

  // If the visitor already sent some requests recently, apply the appropriate cool-down period
  if (requestsToday > 0) {
    const lastRequestTimeAgoMs = new Date().getTime() - smsVerificationRequests[0].timestamp.getTime();
    const timeOut = SMS_ATTEMPT_TIMEOUT_MAP[requestsToday].timeout;
    if (millisecondsToSeconds(lastRequestTimeAgoMs) < millisecondsToSeconds(timeOut - TIMEOUT_TOLERANCE_MS)) {
      const waitFor = timeOut - lastRequestTimeAgoMs;
      res.status(403).send({
        severity: 'error',
        message: `${SMS_FRAUD_COPY.needToWait({ requestsToday })} Max allowed is ${MAX_SMS_ATTEMPTS}. Please wait ${readableMilliseconds(waitFor)} to send another one.`,
      });
      return;
    }
  }

  // Apply a hard limit on the number of real SMS messages that cannot be reset to prevent people from abusing the demo
  const realSmsCount = (await RealSmsPerVisitorModel.findOne({ where: { visitorId } }))?.realMessagesCount ?? 0;
  if (phone !== TEST_PHONE_NUMBER && realSmsCount >= REAL_SMS_LIMIT_PER_VISITOR) {
    res.status(403).send({
      severity: 'error',
      message: `You hit the hard demo limit of ${pluralize(REAL_SMS_LIMIT_PER_VISITOR, 'real SMS messages')} per visitor ID, thanks for testing! This cannot be reset. Please use the simulated phone number ${TEST_PHONE_NUMBER} to continue exploring the demo.`,
    });
    return;
  }

  const verificationCode = generateRandomSixDigitCode();

  /**
   * If this is the visitor's first request, or the cool-down period has passed,
   * send the SMS verification code and save the request to the database.
   * The phone number is saved as a hash to preserve privacy.
   */
  try {
    await sendSms(
      phone,
      `Your verification code for demo.fingerprint.com/sms-pumping is ${verificationCode}.`,
      visitorId,
    );

    await SmsVerificationDatabaseModel.create({
      visitorId: visitorId,
      phoneNumberHash: hashString(phone),
      email,
      timestamp: new Date(),
      code: verificationCode,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send({ severity: 'error', message: `An error occurred while sending the verification SMS message: ${error}` });
    return;
  }

  res.status(200).send({
    severity: 'success',
    message: SMS_FRAUD_COPY.messageSent({ phone, messagesLeft: MAX_SMS_ATTEMPTS - requestsToday - 1 }),
    data: {
      verificationCode,
    },
  });
}
