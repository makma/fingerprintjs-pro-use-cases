import { NextResponse } from 'next/server';
import { getAndValidateFingerprintResult, Severity } from '../../../../server/checks';
import { PaymentAttemptData, PaymentAttemptDbModel } from './database';
import { PAYMENT_FRAUD_COPY } from './copy';
import { Op } from 'sequelize';
import { sequelize } from '../../../../server/sequelize';

type Card = {
  number: string;
  expiration: string;
  cvv: string;
};

// Mocked credit card details.
const mockedCard: Card = {
  number: '4242 4242 4242 4242',
  expiration: '04/28',
  cvv: '123',
};

function areCardDetailsCorrect(card: Card) {
  return card.number === mockedCard.number && card.expiration === mockedCard.expiration && card.cvv === mockedCard.cvv;
}

async function savePaymentAttempt(paymentAttempt: PaymentAttemptData) {
  await PaymentAttemptDbModel.create({
    ...paymentAttempt,
    timestamp: new Date().getTime(),
  });
  await sequelize.sync();
}

export type PaymentPayload = {
  requestId: string;
  filedChargeback: boolean;
  usingStolenCard: boolean;
  card: Card;
};

export type PaymentResponse = {
  message: string;
  severity: Severity;
};

export async function POST(req: Request): Promise<NextResponse<PaymentResponse>> {
  const { requestId, filedChargeback, usingStolenCard, card } = (await req.json()) as PaymentPayload;

  // Get the full Identification result from Fingerprint Server API and validate its authenticity
  const fingerprintResult = await getAndValidateFingerprintResult({
    requestId,
    req,
    options: { minConfidenceScore: 0.2 },
  });
  if (!fingerprintResult.okay) {
    return NextResponse.json({ severity: 'error', message: fingerprintResult.error }, { status: 403 });
  }

  // Get visitorId from the Server API Identification event
  const visitorId = fingerprintResult.data.products.identification?.data?.visitorId;
  if (!visitorId) {
    return NextResponse.json({ severity: 'error', message: 'Visitor ID not found.' }, { status: 403 });
  }

  // If this visitor ID ever paid with a stolen credit card, do not process the payment
  const usedStolenCreditCard = await PaymentAttemptDbModel.findOne({ where: { visitorId, usingStolenCard: true } });
  if (usedStolenCreditCard) {
    return NextResponse.json({ severity: 'error', message: PAYMENT_FRAUD_COPY.stolenCard }, { status: 403 });
  }

  // If the visitor ID filed more than 1 chargeback in the last year, do not process the payment.
  // (Adjust the numbers for you use case)
  const chargebacksFiledPastYear = await PaymentAttemptDbModel.findAndCountAll({
    where: { visitorId, filedChargeback: true, timestamp: { [Op.gt]: new Date().getTime() - 365 * 24 * 60 * 1000 } },
  });
  if (chargebacksFiledPastYear.count > 1) {
    return NextResponse.json({ severity: 'error', message: PAYMENT_FRAUD_COPY.previousChargeback }, { status: 403 });
  }

  // If the visitor ID performed 3 or more unsuccessful payments in the past year, do not process the payment
  const invalidPaymentsPastYear = await PaymentAttemptDbModel.findAndCountAll({
    where: {
      visitorId,
      timestamp: { [Op.gt]: new Date().getTime() - 365 * 24 * 60 * 1000 },
      wasSuccessful: false,
    },
  });
  if (invalidPaymentsPastYear.count > 2) {
    return NextResponse.json(
      { severity: 'error', message: PAYMENT_FRAUD_COPY.tooManyUnsuccessfulPayments },
      { status: 403 },
    );
  }

  // Check the card details and perform payment if they are correct, log the payment attempt in either case
  if (!areCardDetailsCorrect(card)) {
    savePaymentAttempt({ visitorId, filedChargeback, usingStolenCard, wasSuccessful: false });
    return NextResponse.json({ severity: 'error', message: PAYMENT_FRAUD_COPY.incorrectCardDetails }, { status: 403 });
  } else {
    savePaymentAttempt({ visitorId, filedChargeback, usingStolenCard, wasSuccessful: true });
    return NextResponse.json({ severity: 'success', message: PAYMENT_FRAUD_COPY.successfulPayment }, { status: 200 });
  }
}
