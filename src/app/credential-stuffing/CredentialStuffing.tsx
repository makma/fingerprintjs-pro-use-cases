'use client';

import { useState } from 'react';
import { UseCaseWrapper } from '../../client/components/UseCaseWrapper/UseCaseWrapper';
import React from 'react';
import { USE_CASES } from '../../client/content';
import { Alert } from '../../client/components/Alert/Alert';
import Button from '../../client/components/Button/Button';
import styles from './credentialStuffing.module.scss';
import formStyles from '../../client/styles/forms.module.scss';
import classNames from 'classnames';
import hiddenIcon from '../../client/img/iconHidden.svg';
import shownIcon from '../../client/img/iconShown.svg';
import Image from 'next/image';
import { useVisitorData } from '@fingerprintjs/fingerprintjs-pro-react';
import { TEST_IDS } from '../../client/testIDs';
import { useMutation } from 'react-query';
import { LoginPayload, LoginResponse } from './api/authenticate/route';
import { FPJS_CLIENT_TIMEOUT } from '../../const';

export function CredentialStuffing() {
  const { getData: getVisitorData } = useVisitorData(
    { ignoreCache: true, timeout: FPJS_CLIENT_TIMEOUT },
    {
      immediate: false,
    },
  );

  const {
    mutate: tryToLogIn,
    isLoading,
    data: loginResponse,
    error: loginNetworkError,
  } = useMutation<LoginResponse, Error, Omit<LoginPayload, 'requestId' | 'visitorId'>>({
    mutationKey: ['login attempt'],
    mutationFn: async ({ username, password }) => {
      const { requestId, visitorId } = await getVisitorData({ ignoreCache: true });
      const response = await fetch('/credential-stuffing/api/authenticate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, visitorId, requestId } satisfies LoginPayload),
      });
      return await response.json();
    },
  });

  // Default mocked user data
  const [username, setUsername] = useState('user');
  const [password, setPassword] = useState('password');
  const [showPassword, setShowPassword] = useState(false);

  return (
    <UseCaseWrapper useCase={USE_CASES.credentialStuffing}>
      <div className={formStyles.wrapper}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            tryToLogIn({ username, password });
          }}
          className={classNames(formStyles.useCaseForm, styles.credentialStuffingForm)}
        >
          <label>Username</label>
          <input
            type='text'
            name='username'
            placeholder='Username'
            defaultValue={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <label>Password</label>
          <input
            name='password'
            placeholder='Password'
            className={styles.password}
            type={showPassword ? 'text' : 'password'}
            defaultValue={password}
            data-testid={TEST_IDS.credentialStuffing.password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className={styles.showHideIcon} type='button' onClick={() => setShowPassword(!showPassword)}>
            <Image src={showPassword ? shownIcon : hiddenIcon} alt={showPassword ? 'Hide password' : 'Show password'} />
          </button>
          {loginNetworkError && <Alert severity='error'>{loginNetworkError.message}</Alert>}
          {loginResponse?.message && (
            <Alert severity={loginResponse.severity} className={styles.alert}>
              {loginResponse.message}
            </Alert>
          )}
          <Button disabled={isLoading} type='submit' data-testid={TEST_IDS.credentialStuffing.login}>
            {isLoading ? 'Hold on, doing magic...' : 'Log In'}
          </Button>
        </form>
      </div>
    </UseCaseWrapper>
  );
}
