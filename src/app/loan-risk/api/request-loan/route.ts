import { Op } from 'sequelize';
import { Severity, getAndValidateFingerprintResult } from '../../../../server/checks';
import { NextResponse } from 'next/server';
import { LoanRequestDbModel } from './database';
import { LOAN_RISK_COPY } from './copy';
import { evaluateLoanRequest, LoanResult } from './evaluateLoanRequest';

export type LoanRequestData = {
  firstName: string;
  lastName: string;
  loanDuration: number;
  loanValue: number;
  monthlyIncome: number;
};

export type LoanRequestPayload = LoanRequestData & {
  requestId: string;
};

export type LoanRequestResponse = {
  message: string;
  severity: Severity;
  loanResult?: LoanResult;
};

export async function POST(req: Request): Promise<NextResponse<LoanRequestResponse>> {
  const { loanValue, monthlyIncome, loanDuration, firstName, lastName, requestId } =
    (await req.json()) as LoanRequestPayload;

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

  // Check if this visitor ID has already requested a loan today
  const previousLoanRequests = await LoanRequestDbModel.findAll({
    where: {
      visitorId: { [Op.eq]: visitorId },
      timestamp: { [Op.between]: [new Date().setHours(0, 0, 0, 0), new Date().setHours(23, 59, 59, 59)] },
    },
  });

  // If so, check monthly income, first name, and last name are the same as in previous loan requests.
  if (previousLoanRequests.length) {
    const requestIsConsistent = previousLoanRequests.every(
      (loanRequest) =>
        loanRequest.monthlyIncome === monthlyIncome &&
        loanRequest.firstName === firstName &&
        loanRequest.lastName === lastName,
    );

    // If the provided information is not consistent, potentially mark this user in your database as fraudulent, or perform some other actions.
    // In our case, we just return a warning instead of processing the request.
    if (!requestIsConsistent) {
      return NextResponse.json(
        { severity: 'warning', message: LOAN_RISK_COPY.inconsistentApplicationChallenged },
        {
          status: 403,
        },
      );
    }
  }

  // Save the loan request to the database
  await LoanRequestDbModel.create({
    visitorId,
    timestamp: new Date(),
    monthlyIncome,
    loanDuration,
    loanValue,
    firstName,
    lastName,
  });

  // Evaluate the loan request
  const loanResult = evaluateLoanRequest({ loanValue, monthlyIncome, loanDuration });

  // If the income is too low, reject the loan
  if (!loanResult.approved) {
    return NextResponse.json({ severity: 'warning', message: LOAN_RISK_COPY.incomeLow, loanResult }, { status: 403 });
  }

  return NextResponse.json({ severity: 'success', message: LOAN_RISK_COPY.approved, loanResult });
}
