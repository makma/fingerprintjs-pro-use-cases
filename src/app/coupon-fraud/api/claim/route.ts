import { Op } from 'sequelize';
import { COUPON_CODES, CouponClaimDbModel, CouponCodeString } from './database';
import { Severity, getAndValidateFingerprintResult } from '../../../../server/checks';
import { COUPON_FRAUD_COPY } from './copy';
import { NextResponse } from 'next/server';

export type CouponClaimPayload = {
  couponCode: string;
  requestId: string;
};

export type CouponClaimResponse = {
  message: string;
  severity: Severity;
};

const isCouponCode = (couponCode: string): couponCode is CouponCodeString => {
  return COUPON_CODES.includes(couponCode as CouponCodeString);
};

export async function POST(req: Request): Promise<NextResponse<CouponClaimResponse>> {
  const { couponCode, requestId } = (await req.json()) as CouponClaimPayload;

  // Get the full Identification result from Fingerprint Server API and validate its authenticity
  const fingerprintResult = await getAndValidateFingerprintResult({ requestId, req });
  if (!fingerprintResult.okay) {
    return NextResponse.json({ severity: 'error', message: fingerprintResult.error }, { status: 403 });
  }

  // Get visitorId from the Server API Identification event
  const visitorId = fingerprintResult.data.products.identification?.data?.visitorId;
  if (!visitorId) {
    return NextResponse.json({ severity: 'error', message: 'Visitor ID not found.' }, { status: 403 });
  }

  // Check if Coupon exists
  if (!isCouponCode(couponCode)) {
    return NextResponse.json({ severity: 'error', message: COUPON_FRAUD_COPY.doesNotExist }, { status: 403 });
  }

  // Check if visitor used this coupon before
  const usedBefore = await CouponClaimDbModel.findOne({
    where: { visitorId, couponCode },
  });
  if (usedBefore) {
    return NextResponse.json({ severity: 'error', message: COUPON_FRAUD_COPY.usedBefore }, { status: 403 });
  }

  // Check if visitor claimed another coupon recently
  const oneHourBefore = new Date();
  oneHourBefore.setHours(oneHourBefore.getHours() - 1);
  const usedAnotherCouponRecently = await CouponClaimDbModel.findOne({
    where: {
      visitorId,
      timestamp: {
        [Op.between]: [oneHourBefore, new Date()],
      },
    },
  });
  if (usedAnotherCouponRecently) {
    return NextResponse.json(
      { severity: 'error', message: COUPON_FRAUD_COPY.usedAnotherCouponRecently },
      {
        status: 403,
      },
    );
  }

  // If all checks passed, claim coupon
  await CouponClaimDbModel.create({
    couponCode,
    visitorId,
    timestamp: new Date(),
  });
  return NextResponse.json({ severity: 'success', message: COUPON_FRAUD_COPY.success });
}
