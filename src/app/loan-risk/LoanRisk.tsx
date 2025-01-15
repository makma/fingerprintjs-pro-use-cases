'use client';

import { UseCaseWrapper } from '../../client/components/UseCaseWrapper/UseCaseWrapper';
import { FunctionComponent, useMemo, useState } from 'react';
import { calculateMonthInstallment } from './api/request-loan/calculate-month-installment';
import React from 'react';
import { USE_CASES } from '../../client/content';
import Button from '../../client/components/Button/Button';
import { Alert } from '../../client/components/Alert/Alert';
import formStyles from '../../client/styles/forms.module.scss';
import { Slider } from '../../client/components/Slider/Slider';
import { NumberInputWithUnits } from '../../client/components/InputNumberWithUnits/InputNumberWithUnits';
import styles from './loanRisk.module.scss';
import classNames from 'classnames';
import { TEST_IDS } from '../../client/testIDs';
import { useVisitorData } from '@fingerprintjs/fingerprintjs-pro-react';
import { useMutation } from 'react-query';
import { LoanRequestData, LoanRequestPayload, LoanRequestResponse } from './api/request-loan/route';
import { FPJS_CLIENT_TIMEOUT } from '../../const';

type SliderFieldProps = {
  label: string;
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  prefix?: string;
  suffix?: string;
  name?: string;
  dataTestId?: string;
};

const SliderField: FunctionComponent<SliderFieldProps> = ({
  label,
  min,
  max,
  value,
  onChange,
  prefix,
  suffix,
  name,
  dataTestId,
}) => {
  return (
    <div>
      <label>{label}</label>
      <div className={styles.sliderFieldWrapper}>
        <div className={styles.sliderWrapper}>
          {prefix && prefix}
          <Slider min={min} max={max} value={value} onChange={(value: number) => onChange(value)} />
        </div>
        <NumberInputWithUnits
          value={value}
          onChange={(value: number) => onChange(value)}
          suffix={suffix}
          prefix={prefix}
          name={name}
          dataTestId={dataTestId}
        />
      </div>
    </div>
  );
};

const loanValueValidation = {
  min: 1000,
  max: 1_0_000,
};

const monthlyIncomeValidation = {
  min: 500,
  max: 3_0_000,
};

const loanDurationValidation = {
  min: 2,
  max: 48,
};

export function LoanRisk() {
  const { getData: getVisitorData, isLoading: isVisitorDataLoading } = useVisitorData(
    { ignoreCache: true, timeout: FPJS_CLIENT_TIMEOUT },
    { immediate: false },
  );

  const {
    mutate: requestLoan,
    isLoading: isLoanRequestLoading,
    data: loanRequestResponse,
    error: loanRequestNetworkError,
  } = useMutation<LoanRequestResponse, Error, LoanRequestData, unknown>({
    mutationKey: ['request loan'],
    mutationFn: async (loanRequest: LoanRequestData) => {
      const { requestId } = await getVisitorData({ ignoreCache: true });
      const response = await fetch('/loan-risk/api/request-loan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...loanRequest,
          requestId,
        } satisfies LoanRequestPayload),
      });
      return await response.json();
    },
  });

  const [firstName, setFirstName] = useState('John');
  const [lastName, setLastName] = useState('Doe');
  const [loanValue, setLoanValue] = useState(loanValueValidation.min);
  const [monthlyIncome, setMonthlyIncome] = useState(10000);
  const [loanDuration, setLoanDuration] = useState(loanDurationValidation.min);

  const monthlyInstallment = useMemo(
    () =>
      calculateMonthInstallment({
        loanValue,
        loanDuration,
      }),
    [loanDuration, loanValue],
  );
  const isLoading = isVisitorDataLoading || isLoanRequestLoading;

  return (
    <UseCaseWrapper useCase={USE_CASES.loanRisk}>
      <div className={classNames(formStyles.wrapper, styles.formWrapper)}>
        <form
          onSubmit={async (event) => {
            event.preventDefault();
            await requestLoan({
              firstName,
              lastName,
              loanValue,
              monthlyIncome,
              loanDuration,
            });
          }}
          className={formStyles.useCaseForm}
        >
          <div className={styles.nameWrapper}>
            <label>Name</label>
            <input
              type='text'
              name='firstName'
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              required
              data-testid={TEST_IDS.loanRisk.name}
            />
            <label>Surname</label>
            <input
              type='text'
              name='lastName'
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              required
              data-testid={TEST_IDS.loanRisk.surname}
            />
          </div>
          <div className={styles.loanWrapper}>
            <div className={styles.sliders}>
              <SliderField
                name='loanValue'
                prefix='$'
                min={loanValueValidation.min}
                max={loanValueValidation.max}
                label='How much money do you need?'
                value={loanValue}
                onChange={setLoanValue}
                dataTestId={TEST_IDS.loanRisk.loanValue}
              />
              <SliderField
                name='monthlyIncome'
                prefix='$'
                min={monthlyIncomeValidation.min}
                max={monthlyIncomeValidation.max}
                label='How much do you make per month?'
                value={monthlyIncome}
                onChange={setMonthlyIncome}
                dataTestId={TEST_IDS.loanRisk.monthlyIncome}
              />
              <SliderField
                name='loanDuration'
                suffix='Months'
                min={loanDurationValidation.min}
                max={loanDurationValidation.max}
                label='Loan term (months)'
                value={loanDuration}
                onChange={setLoanDuration}
                dataTestId={TEST_IDS.loanRisk.loanTerm}
              />
              <div className={styles.summary}>
                <span>Your monthly installment is: </span>
                <div className={styles.monthlyPayment} data-testid={TEST_IDS.loanRisk.monthlyInstallmentValue}>
                  $ {monthlyInstallment.toFixed(0)}
                </div>
              </div>
            </div>
            {loanRequestNetworkError && <Alert severity='error'>{loanRequestNetworkError.message}</Alert>}
            {loanRequestResponse?.message && (
              <Alert severity={loanRequestResponse.severity}>{loanRequestResponse.message}</Alert>
            )}
            <Button
              type='submit'
              disabled={isLoading}
              className={styles.requestLoanButton}
              data-testid={TEST_IDS.loanRisk.submitApplication}
            >
              {isLoading ? 'Hold on, doing magic...' : 'Request loan'}
            </Button>
          </div>
        </form>
      </div>
    </UseCaseWrapper>
  );
}
