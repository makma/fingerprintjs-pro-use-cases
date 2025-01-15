import { Suspense } from 'react';
import { USE_CASES } from '../../client/content';
import { generateUseCaseMetadata } from '../../client/seo';
import { AccountSharing } from './AccountSharing';

export const metadata = generateUseCaseMetadata(USE_CASES.accountSharing);

export default function AccountSharingPage() {
  return (
    <Suspense>
      <AccountSharing />
    </Suspense>
  );
}
