'use client';

import { UseCaseWrapper } from '../../client/components/UseCaseWrapper/UseCaseWrapper';
import { FunctionComponent, useState } from 'react';
import { USE_CASES } from '../../client/content';
import styles from './vpnDetection.module.scss';
import formStyles from '../../client/styles/forms.module.scss';
import classNames from 'classnames';
import { Alert } from '../../client/components/Alert/Alert';
import Button from '../../client/components/Button/Button';
import { Cart } from '../../client/components/Cart/Cart';
import { FingerprintJSPro, FpjsProvider, useVisitorData } from '@fingerprintjs/fingerprintjs-pro-react';
import { useMutation } from 'react-query';
import { ActivateRegionalPricingPayload, ActivateRegionalPricingResponse } from './api/activate-ppp/route';
import { useUnsealedResult } from '../../client/hooks/useUnsealedResult';
import { getFlagEmoji, getIpLocation } from '../../utils/locationUtils';
import { getRegionalDiscount } from './data/getDiscountByCountry';
import courseLogo from './fingerprintLogoLowOpacitySquareBordered.svg';
import { env } from '../../env';
import { TEST_IDS } from '../../client/testIDs';
import { VPN_DETECTION_COPY } from './copy';
import { FPJS_CLIENT_TIMEOUT } from '../../const';

const COURSE_PRICE = 100;
const TAXES = 15;

const VpnDetectionUseCase: FunctionComponent = () => {
  const { getData: getVisitorData, data: visitorData } = useVisitorData({
    ignoreCache: true,
    timeout: FPJS_CLIENT_TIMEOUT,
  });
  const { data: unsealedVisitorData } = useUnsealedResult(visitorData?.sealedResult);
  const visitorIpCountry = getIpLocation(unsealedVisitorData)?.country;
  const potentialDiscount = getRegionalDiscount(visitorIpCountry?.code);

  const {
    mutate: activateRegionalPricing,
    isLoading,
    data: activateResponse,
    error: activateError,
  } = useMutation({
    mutationKey: ['activate regional pricing'],
    mutationFn: async () => {
      const { requestId, sealedResult } = await getVisitorData({ ignoreCache: true });
      const response = await fetch('/vpn-detection/api/activate-ppp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ requestId, sealedResult } satisfies ActivateRegionalPricingPayload),
      });
      return await response.json();
    },
    onSuccess: (data: ActivateRegionalPricingResponse) => {
      if (data.severity === 'success') {
        setDiscount(data.data.discount);
      } else {
        setDiscount(0);
      }
    },
  });

  const [courseCount, setCourseCount] = useState(1);
  const [discount, setDiscount] = useState(0);

  const cartItems = [
    {
      id: 0,
      name: 'Fight Online Fraud Course',
      subheadline: 'Fingerprint Inc.',
      price: COURSE_PRICE,
      image: courseLogo,
      count: courseCount,
      increaseCount: () => setCourseCount(courseCount + 1),
      decreaseCount: () => setCourseCount(Math.max(1, courseCount - 1)),
    },
  ];

  return (
    <div className={classNames(styles.wrapper, formStyles.wrapper)}>
      <Cart
        items={cartItems}
        discount={discount}
        taxPerItem={TAXES}
        discountLabel={VPN_DETECTION_COPY.discountName}
      ></Cart>
      <div className={styles.innerWrapper}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            activateRegionalPricing();
          }}
          className={classNames(formStyles.useCaseForm, styles.regionalPricingForm)}
        >
          <p data-testid={TEST_IDS.vpnDetection.callout}>
            {visitorIpCountry && (
              <>
                {VPN_DETECTION_COPY.personalizedCallout} {getFlagEmoji(visitorIpCountry.code)} {visitorIpCountry.name}!
                👋{' '}
              </>
            )}
            We are offering purchasing power parity pricing.
          </p>
          {Boolean(activateError) && <Alert severity='error'>{String(activateError)}</Alert>}
          {activateResponse?.message && (
            <div>
              <Alert severity={activateResponse.severity}>{activateResponse.message}</Alert>
            </div>
          )}
          <div className={styles.regionalPricingContainer}>
            <Button
              disabled={isLoading}
              size='medium'
              data-testid={TEST_IDS.vpnDetection.activateRegionalPricing}
              type='submit'
            >
              {isLoading
                ? 'Verifying location...'
                : `Activate ${potentialDiscount ? potentialDiscount + '% off with ' : ''} regional pricing`}
            </Button>
          </div>
        </form>
      </div>
      <Button variant='white' type='button' size='small' disabled={true} className={styles.confirmOrderButton}>
        Confirm order
      </Button>
    </div>
  );
};

export const VpnDetectionUseCaseWrapped: FunctionComponent = () => {
  return (
    <FpjsProvider
      loadOptions={{
        apiKey: env.NEXT_PUBLIC_SEALED_RESULTS_PUBLIC_API_KEY,
        scriptUrlPattern: [env.NEXT_PUBLIC_SEALED_RESULTS_SCRIPT_URL, FingerprintJSPro.defaultScriptUrlPattern],
        endpoint: [env.NEXT_PUBLIC_SEALED_RESULTS_ENDPOINT, FingerprintJSPro.defaultEndpoint],
      }}
    >
      <UseCaseWrapper useCase={USE_CASES.vpnDetection}>
        <VpnDetectionUseCase />
      </UseCaseWrapper>
    </FpjsProvider>
  );
};
