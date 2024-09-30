import { UserSearchHistoryDbModel } from '../../../../server/personalization/database';
import { Op } from 'sequelize';
import { NextRequest, NextResponse } from 'next/server';
import { getAndValidateFingerprintResult, Severity } from '../../../../server/checks';

type SearchHistoryPayload = {
  requestId: string;
};

type SearchHistoryResponse = {
  severity: Severity;
  message?: string;
  data?: any;
  size?: number;
};

export async function POST(req: NextRequest): Promise<NextResponse<SearchHistoryResponse>> {
  const { requestId } = (await req.json()) as SearchHistoryPayload;

  // Get the full Identification result from Fingerprint Server API and validate its authenticity
  const fingerprintResult = await getAndValidateFingerprintResult({
    requestId,
    req,
    options: { minConfidenceScore: 0.3 },
  });
  if (!fingerprintResult.okay) {
    return NextResponse.json({ severity: 'error', message: fingerprintResult.error }, { status: 403 });
  }

  // Get visitorId from the Server API Identification event
  const visitorId = fingerprintResult.data.products?.identification?.data?.visitorId;
  if (!visitorId) {
    return NextResponse.json({ severity: 'error', message: 'Visitor ID not found.' }, { status: 403 });
  }

  const history = await UserSearchHistoryDbModel.findAll({
    order: [['timestamp', 'DESC']],
    where: {
      visitorId: {
        [Op.eq]: visitorId,
      },
    },
  });

  return NextResponse.json({
    severity: 'success',
    data: history,
    size: history.length,
  });
}