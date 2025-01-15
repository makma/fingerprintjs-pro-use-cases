import { ProductDbModel, UserCartItemAttributes, UserCartItemDbModel } from '../../database';
import { Op } from 'sequelize';
import { NextRequest, NextResponse } from 'next/server';
import { getAndValidateFingerprintResult, Severity } from '../../../../../server/checks';

export type AddCartItemPayload = {
  requestId: string;
  productId: number;
};

export type AddCartItemResponse = {
  severity: Severity;
  message: string;
  data?: UserCartItemAttributes;
};

export async function POST(req: NextRequest): Promise<NextResponse<AddCartItemResponse>> {
  const { requestId, productId } = (await req.json()) as AddCartItemPayload;

  // Get the full Identification result from Fingerprint Server API and validate its authenticity
  const fingerprintResult = await getAndValidateFingerprintResult({
    requestId,
    req,
    options: { minConfidenceScore: 0.3, disableFreshnessCheck: true },
  });
  if (!fingerprintResult.okay) {
    return NextResponse.json({ severity: 'error', message: fingerprintResult.error }, { status: 403 });
  }

  // Get visitorId from the Server API Identification event
  const visitorId = fingerprintResult.data.products.identification?.data?.visitorId;
  if (!visitorId) {
    return NextResponse.json({ severity: 'error', message: 'Visitor ID not found.' }, { status: 403 });
  }

  const product = await ProductDbModel.findOne({
    where: {
      id: {
        [Op.eq]: productId,
      },
    },
  });

  if (!product) {
    return NextResponse.json({ severity: 'error', message: 'Product not found' }, { status: 500 });
  }

  const [cartItem, created] = await UserCartItemDbModel.findOrCreate({
    where: {
      visitorId: {
        [Op.eq]: visitorId,
      },
      productId: {
        [Op.eq]: productId,
      },
    },
    defaults: {
      visitorId: visitorId,
      count: 1,
      timestamp: new Date(),
      productId,
    },
  });

  if (!created) {
    cartItem.count++;
    await cartItem.save();
  }

  return NextResponse.json({
    severity: 'success',
    message: 'Item added',
    data: cartItem,
  });
}
