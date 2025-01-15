'use client';

import { useState } from 'react';
import { UseCaseWrapper } from '../../client/components/UseCaseWrapper/UseCaseWrapper';
import React from 'react';
import { USE_CASES } from '../../client/content';
import styles from './accountSharing.module.scss';
import formStyles from '../../client/styles/forms.module.scss';
import classNames from 'classnames';
import hiddenIcon from '../../client/img/iconHidden.svg';
import shownIcon from '../../client/img/iconShown.svg';
import Image from 'next/image';
import { TEST_IDS } from '../../client/testIDs';
import Button from '../../client/components/Button/Button';
import { FPJS_CLIENT_TIMEOUT } from '../../const';
import { useMutation } from 'react-query';
import { useVisitorData } from '@fingerprintjs/fingerprintjs-pro-react';
import { CreateAccountPayload, CreateAccountResponse } from './api/create-account/route';
import { Alert } from '../../client/components/Alert/Alert';
import { LoginPayload, LoginResponse } from './api/login/route';
import { BackArrow } from '../../client/components/BackArrow/BackArrow';
import { useRouter } from 'next/navigation';
import { useQueryState, parseAsBoolean, parseAsStringEnum, parseAsString } from 'next-usequerystate';
import { defaultUser } from './const';
import { useSessionStorage } from 'react-use';

const TEST_ID = TEST_IDS.accountSharing;

export function AccountSharing() {
  // Default mocked user data
  const [username, setUsername] = useSessionStorage('username', defaultUser.username);
  const [password, setPassword] = useSessionStorage('password', defaultUser.password);
  const [showPassword, setShowPassword] = useSessionStorage('showPassword', false);
  const [mode, setMode] = useQueryState<'signup' | 'login'>(
    'mode',
    parseAsStringEnum(['signup', 'login']).withDefault('signup'),
  );

  const [justLoggedOut, setJustLoggedOut] = useQueryState('justLoggedOut', parseAsBoolean);
  const [otherDevice, setOtherDevice] = useQueryState('otherDevice', parseAsString);
  // We need to store the current login response to be able to keep displaying it while new request is in progr
  const [currentLoginResponse, setCurrentLoginResponse] = useState<LoginResponse | null>(null);

  const router = useRouter();

  const { getData: getVisitorData } = useVisitorData(
    { ignoreCache: true, timeout: FPJS_CLIENT_TIMEOUT },
    {
      immediate: false,
    },
  );

  const {
    mutate: createAccount,
    isLoading: isLoadingCreateAccount,
    data: createAccountResponse,
    error: createAccountError,
  } = useMutation<CreateAccountResponse, Error, Omit<CreateAccountPayload, 'requestId' | 'visitorId'>>({
    mutationKey: ['login attempt'],
    mutationFn: async ({ username, password }) => {
      const { requestId } = await getVisitorData({ ignoreCache: true });
      const response = await fetch('/account-sharing/api/create-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, requestId } satisfies CreateAccountPayload),
      });
      return await response.json();
    },
    onSuccess: (data) => {
      if (data.severity === 'success') {
        router.push(`/account-sharing/home/${username}`, { scroll: false });
      }
    },
  });

  const {
    mutate: login,
    isLoading: isLoadingLogin,
    data: loginResponse,
    error: loginError,
    reset: resetLoginMutation,
  } = useMutation<LoginResponse, Error, Omit<LoginPayload, 'requestId' | 'visitorId'>>({
    mutationKey: ['login attempt'],
    mutationFn: async ({ username, password, force }) => {
      setJustLoggedOut(null);
      setOtherDevice(null);
      const { requestId } = await getVisitorData({ ignoreCache: true });
      const response = await fetch('/account-sharing/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, requestId, force } satisfies LoginPayload),
      });
      return await response.json();
    },
    onSuccess: (data) => {
      setCurrentLoginResponse(data);
      if (data.severity === 'success') {
        router.push(`/account-sharing/home/${username}`, { scroll: false });
      }
    },
  });

  const formMarkup = (
    <>
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
        data-testid={TEST_ID.password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button className={styles.showHideIcon} type='button' onClick={() => setShowPassword(!showPassword)}>
        <Image src={showPassword ? shownIcon : hiddenIcon} alt={showPassword ? 'Hide password' : 'Show password'} />
      </button>
    </>
  );

  const signUpMarkup = (
    <>
      {formMarkup}
      <Button
        disabled={isLoadingCreateAccount}
        type='submit'
        data-testid={TEST_ID.login}
        onClick={() => createAccount({ username, password })}
      >
        {isLoadingCreateAccount ? 'One moment...' : 'Sign up'}
      </Button>
      {createAccountError && <Alert severity='error'>{createAccountError.message}</Alert>}
      {createAccountResponse?.message && (
        <Alert severity={createAccountResponse.severity} className={styles.alert}>
          {createAccountResponse.message}
        </Alert>
      )}
      <p className={styles.switchMode}>
        Already have an account? <button onClick={() => setMode('login')}>Log in</button>
      </p>
    </>
  );

  const loginMarkup = (
    <>
      {formMarkup}
      <Button
        disabled={isLoadingLogin}
        type='submit'
        data-testid={TEST_ID.login}
        onClick={() => login({ username, password })}
      >
        {isLoadingLogin || loginResponse?.severity === 'success' ? 'One moment...' : 'Log in'}
      </Button>
      {loginError && <Alert severity='error'>{loginError.message}</Alert>}
      {loginResponse?.message && loginResponse.severity !== 'success' && (
        <Alert severity={loginResponse.severity} className={styles.alert}>
          {loginResponse.message}
        </Alert>
      )}
      <p className={styles.switchMode}>
        Don't have an account yet?{' '}
        <button
          onClick={() => {
            setMode('signup');
            setJustLoggedOut(null);
          }}
        >
          Sign up first
        </button>
      </p>
    </>
  );

  const challengeMarkup = (
    <>
      {currentLoginResponse?.message && (
        <>
          <Alert severity={currentLoginResponse.severity} className={styles.alert}>
            {currentLoginResponse.message}
          </Alert>
          <div className={styles.challengeButtons}>
            <Button variant='primary' size='medium' onClick={() => login({ username, password, force: true })}>
              {isLoadingLogin || loginResponse?.severity === 'success' ? 'One moment...' : 'Log in here, log out there'}
            </Button>
            <Button variant='green' size='medium' disabled>
              Upgrade account
            </Button>
          </div>
          <BackArrow
            as='button'
            className={styles.backArrow}
            onClick={async () => {
              // Reset login mutation
              resetLoginMutation();
              setCurrentLoginResponse(null);
              setMode('login');
            }}
            label='Go back'
          />
        </>
      )}
    </>
  );

  let loggedOutAlert = null;
  if (mode === 'login' && justLoggedOut) {
    if (otherDevice) {
      loggedOutAlert = (
        <Alert
          severity='warning'
          className={styles.loggedOutAlert}
          onClose={() => {
            setJustLoggedOut(null);
            setOtherDevice(null);
          }}
        >
          <div className={styles.loggedOutAlertTitle}>You have been logged out</div>
          You are logged in on {otherDevice}. You current plan allows you to use FraudFlix on one device at a time.
          Consider <span style={{ textDecoration: 'underline' }}> upgrading your plan</span> to enjoy fraud content on
          multiple devices.
        </Alert>
      );
    } else {
      loggedOutAlert = (
        <Alert severity='success' className={styles.loggedOutAlert} onClose={() => setJustLoggedOut(null)}>
          You have logged out.
        </Alert>
      );
    }
  }

  return (
    <UseCaseWrapper useCase={USE_CASES.accountSharing}>
      <div className={formStyles.wrapper}>
        {loggedOutAlert}
        <h3 className={styles.formTitle}>{mode === 'signup' ? 'Sign up for FraudFlix' : 'Log in to FraudFlix'}</h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
          }}
          className={classNames(formStyles.useCaseForm, styles.accountSharingForm)}
        >
          {currentLoginResponse?.otherDevice ? challengeMarkup : mode === 'signup' ? signUpMarkup : loginMarkup}
        </form>
      </div>
    </UseCaseWrapper>
  );
}
