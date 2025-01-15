import { USE_CASES } from '../../client/content';
import { generateUseCaseMetadata } from '../../client/seo';
import { CouponFraudUseCase } from './CouponFraud';

export const metadata = generateUseCaseMetadata(USE_CASES.couponFraud);

export default function CouponFraudPage() {
  return <CouponFraudUseCase />;
}
