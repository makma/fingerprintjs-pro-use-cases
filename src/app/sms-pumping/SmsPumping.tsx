'use client';

import { FunctionComponent, Suspense, useState } from 'react';
import { UseCaseWrapper } from '../../client/components/UseCaseWrapper/UseCaseWrapper';
import React from 'react';
import { USE_CASES } from '../../client/content';
import Button from '../../client/components/Button/Button';
import formStyles from '../../client/styles/forms.module.scss';
import { TEST_IDS } from '../../client/testIDs';
import { CloseSnackbarButton } from '../../client/components/Alert/Alert';
import { enqueueSnackbar } from 'notistack';
import { useCopyToClipboard } from 'react-use';
import { BackArrow } from '../../client/components/BackArrow/BackArrow';
import { GetServerSideProps } from 'next';
import { SubmitCodeForm } from './components/SubmitCodeForm';
import { PhoneNumberForm } from './components/PhoneNumberForm';
import { useVisitorData } from '@fingerprintjs/fingerprintjs-pro-react';
import { useMutation } from 'react-query';
import { useSearchParams } from 'next/navigation';
import { SendSMSPayload, SendSMSResponse } from './api/send-verification-sms/route';
import { TEST_PHONE_NUMBER } from './api/smsPumpingConst';
import { FPJS_CLIENT_TIMEOUT } from '../../const';

type FormStep = 'Send SMS' | 'Submit code';
type QueryAsProps = {
  disableBotDetection: boolean;
};

// Make URL query object available as props to the page on first render
// to read the `disableBotDetection` param for testing and demo purposes
export const getServerSideProps: GetServerSideProps<QueryAsProps> = async ({ query }) => {
  const { disableBotDetection } = query;
  return {
    props: {
      disableBotDetection: disableBotDetection === '1' || disableBotDetection === 'true',
    },
  };
};

type SendMessageMutationArgs = {
  onSuccess?: (data: SendSMSResponse) => void;
  disableBotDetection?: boolean;
};

export type SendMessageMutation = ReturnType<typeof useSendMessage>;
export const useSendMessage = ({ onSuccess, disableBotDetection = false }: SendMessageMutationArgs) => {
  const { getData } = useVisitorData(
    { ignoreCache: true, timeout: FPJS_CLIENT_TIMEOUT },
    {
      immediate: false,
    },
  );
  return useMutation<SendSMSResponse, Error, { phoneNumber: string; email: string }>({
    mutationKey: 'sendSms',
    mutationFn: async ({ phoneNumber, email }) => {
      const { requestId } = await getData();
      const response = await fetch(`/sms-pumping/api/send-verification-sms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber,
          requestId,
          email,
          disableBotDetection,
        } satisfies SendSMSPayload),
      });
      if (response.status < 500) {
        return await response.json();
      } else {
        throw new Error('Failed to send verification SMS: ' + response.statusText);
      }
    },
    onSuccess: (data: SendSMSResponse) => {
      if (data.severity === 'success') {
        onSuccess?.(data);
      }
    },
  });
};

const SmsFraud: FunctionComponent = () => {
  // Default mocked user data
  const [phoneNumber, setPhoneNumber] = useState(TEST_PHONE_NUMBER);
  const [email, setEmail] = useState('user@company.com');
  const [formStep, setFormStep] = useState<FormStep>('Send SMS');

  const searchParams = useSearchParams();
  const disableBotDetection =
    searchParams.get('disableBotDetection') === '1' || searchParams.get('disableBotDetection') === 'true';

  const [, copyToClipboard] = useCopyToClipboard();
  const sendMessageMutation = useSendMessage({
    onSuccess: (data) => {
      setFormStep('Submit code');
      enqueueSnackbar(
        <>
          📱 Simulated SMS message: Your verification code is{' '}
          <b data-testid={TEST_IDS.smsFraud.codeInsideSnackbar}>{data.data?.verificationCode}</b>{' '}
        </>,
        {
          variant: 'info',
          autoHideDuration: 10000,
          action: (snackbarId) => (
            <>
              <Button
                variant='info'
                size='small'
                data-testid={TEST_IDS.smsFraud.copyCodeButton}
                onClick={() => {
                  copyToClipboard(String(data.data?.verificationCode) || '');
                }}
              >
                Copy code
              </Button>
              <CloseSnackbarButton snackbarId={snackbarId} />
            </>
          ),
        },
      );
    },
    disableBotDetection,
  });

  return (
    <UseCaseWrapper useCase={USE_CASES.smsPumping}>
      <div className={formStyles.wrapper}>
        {formStep === 'Send SMS' && (
          <PhoneNumberForm
            phoneNumber={phoneNumber}
            setPhoneNumber={setPhoneNumber}
            sendMessageMutation={sendMessageMutation}
            email={email}
            setEmail={setEmail}
          />
        )}
        {formStep === 'Submit code' && (
          <>
            <BackArrow as='button' label='Back' onClick={() => setFormStep('Send SMS')} />
            <SubmitCodeForm phoneNumber={phoneNumber} email={email} sendMessageMutation={sendMessageMutation} />
          </>
        )}
      </div>
    </UseCaseWrapper>
  );
};

export const SmsPumpingUseCase = () => {
  // Suspense required due to useSearchParams() https://nextjs.org/docs/messages/missing-suspense-with-csr-bailout
  return (
    <Suspense>
      <SmsFraud />
    </Suspense>
  );
};
