import { chromium, firefox, Page } from '@playwright/test';
import { UserDbModel, DeviceDbModel } from '../../src/app/account-sharing/api/database';
import { ACCOUNT_SHARING_COPY } from '../../src/app/account-sharing/const';
import { hashString } from '../../src/server/server-utils';
import { assertAlert } from '../e2eTestUtils';
import { TEST_IDS } from '../../src/client/testIDs';

const TEST_ID = TEST_IDS.accountSharing;

export const TEST_USER = {
  username: 'e2eTestUser',
  password: 'e2eTestPassword',
};

export const ensureTestUserExists = async () => {
  const { username, password } = TEST_USER;
  await UserDbModel.findOrCreate({
    where: { username },
    defaults: { username, passwordHash: hashString(password), createdWithVisitorId: '' },
  });
};

export const deleteTestUser = async () => {
  await UserDbModel.destroy({ where: { username: TEST_USER.username } });
};

export const ensureTestUserNotLoggedInAnywhere = async () => {
  await DeviceDbModel.destroy({ where: { username: TEST_USER.username } });
};

export const fillForm = async (page: Page, username: string, password: string) => {
  await page.getByTestId(TEST_ID.usernameInput).fill(username);
  await page.getByTestId(TEST_ID.passwordInput).fill(password);
};

export const logInAndAssertSuccess = async (page: Page) => {
  const { username, password } = TEST_USER;
  await page.getByTestId(TEST_ID.switchToLoginButton).click();
  await fillForm(page, username, password);
  await page.getByTestId(TEST_ID.loginButton).click();

  await page.waitForURL(`/account-sharing/home/${username}`);
  await assertAlert({
    page,
    severity: 'success',
    text: ACCOUNT_SHARING_COPY.loginSuccess(username),
  });
};

export const logInAndAssertChallenge = async (page: Page) => {
  const { username, password } = TEST_USER;
  await page.getByTestId(TEST_ID.switchToLoginButton).click();
  await fillForm(page, username, password);
  await page.getByTestId(TEST_ID.loginButton).click();

  await assertAlert({
    page,
    severity: 'error',
    text: ACCOUNT_SHARING_COPY.alreadyLoggedIn,
  });
};

export const getTwoBrowsers = async () => {
  const chromeBrowser = await chromium.launch();
  const firefoxBrowser = await firefox.launch();

  const chromeContext = await chromeBrowser.newContext();
  const firefoxContext = await firefoxBrowser.newContext({
    permissions: [],
  });

  const chromePage = await chromeContext.newPage();
  const firefoxPage = await firefoxContext.newPage();

  return {
    chromePage,
    firefoxPage,
    cleanUp: async () => {
      await chromeBrowser.close();
      await firefoxBrowser.close();
    },
  };
};
