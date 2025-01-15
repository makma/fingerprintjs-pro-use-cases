import { Page, expect, test } from '@playwright/test';
import { blockGoogleTagManager } from './e2eTestUtils';
import { TEST_IDS } from '../src/client/testIDs';

const TEST_ID = TEST_IDS.playground;

const getAgentResponse = async (page: Page) => {
  const agentResponse = await page.getByTestId(TEST_ID.agentResponseJSON);
  const agentResponseText = await agentResponse.textContent();
  return agentResponseText ?? 'Agent response not found';
};

const getServerResponse = async (page: Page) => {
  const serverResponse = await page.getByTestId(TEST_ID.serverResponseJSON);
  const serverResponseText = await serverResponse.textContent();
  return serverResponseText ?? 'Server response not found';
};

function parseRequestId(inputString: string) {
  const regex = /requestId:\s*"([^"]+)"/;
  const match = inputString.match(regex);

  if (match && match[1]) {
    return match[1];
  }
  return null;
}

const clickPlaygroundRefreshButton = async (page: Page) => {
  await page.getByTestId(TEST_ID.refreshButton).first().click();
  // Artificial wait necessary to make sure you get the updated response every time
  await page.waitForTimeout(3000);
};

test.beforeEach(async ({ page }) => {
  await blockGoogleTagManager(page);
  await page.goto('/playground');
});

test.describe('Playground page', () => {
  test('Page renders basic skeleton elements', async ({ page }) => {
    await page.getByText('Fingerprint Pro Playground', { exact: true }).waitFor();
    await page.getByText('Your Visitor ID is').waitFor();
    await page.getByTestId(TEST_ID.refreshButton).first().waitFor();

    await page.getByText('Identification', { exact: true }).waitFor();
    await page.getByText('Smart signals', { exact: true }).waitFor();
    await page.getByText('Mobile Smart signals', { exact: true }).waitFor();

    await page.getByText('JavaScript Agent Response', { exact: true }).waitFor();
    await page.getByText('Server API Response', { exact: true }).waitFor();
  });

  test('Page renders signal tables', async ({ page }) => {
    await page.getByText('Last Seen', { exact: true }).waitFor();
    await page.getByText('Confidence Score', { exact: true }).waitFor();

    await page.getByText('Geolocation', { exact: true }).waitFor();
    await page.getByText('VPN', { exact: true }).waitFor();

    await page.getByText('IP Blocklist', { exact: true }).waitFor();
    await page.getByText('Emulator', { exact: true }).waitFor();
  });

  test('Page renders agent response', async ({ page }) => {
    const agentResponse = await getAgentResponse(page);
    expect(agentResponse).toContain('requestId');
    expect(agentResponse).toContain('browserName');
    expect(agentResponse).toContain('browserVersion');
    expect(agentResponse).toContain('visitorId');
  });

  test('Page renders server response', async ({ page }) => {
    const serverResponse = await getServerResponse(page);

    expect(serverResponse).toContain('requestId');
    expect(serverResponse).toContain('visitorId');
    expect(serverResponse).toContain('incognito');
    expect(serverResponse).toContain('botd');
    expect(serverResponse).toContain('vpn');
    expect(serverResponse).toContain('privacySettings');
  });

  test('Reload button updates agent response', async ({ page }) => {
    const oldRequestId = parseRequestId(await getAgentResponse(page));
    await clickPlaygroundRefreshButton(page);
    const requestId = parseRequestId(await getAgentResponse(page));

    expect(oldRequestId).toHaveLength(20);
    expect(requestId).toHaveLength(20);
    expect(requestId).not.toEqual(oldRequestId);
  });

  test('Reload button updates server response', async ({ page }) => {
    const oldRequestId = parseRequestId(await getServerResponse(page));
    await clickPlaygroundRefreshButton(page);
    const requestId = parseRequestId(await getServerResponse(page));

    expect(oldRequestId).toHaveLength(20);
    expect(requestId).toHaveLength(20);
    expect(requestId).not.toEqual(oldRequestId);
  });

  test('Clicking JSON link scrolls to appropriate JSON property', async ({ page }) => {
    await page.getByText('See the JSON below').click({ force: true });
    await expect(page.locator('span.json-view--property:text("rawDeviceAttributes")')).toBeInViewport();
  });
});

test.describe('Proxy integration', () => {
  const proxyIntegrations = [
    'https://metrics.fingerprinthub.com',
    'https://demo.fingerprint.com/DBqbMN7zXxwl4Ei8',
    process.env.NEXT_PUBLIC_ENDPOINT ?? 'NO_CUSTOM_PROXY_IN_ENV',
  ];

  /**
   * If any JS agent network request fails, fail the test.
   * This captures proxy integration failures that would otherwise go unnoticed thanks to default endpoint fallbacks.
   */
  test('Proxy integration works on Playground, no network errors', async ({ page }) => {
    page.on('requestfailed', (request) => {
      const url = request.url();
      const failure = request.failure()?.errorText;

      proxyIntegrations.forEach((proxy) => {
        if (url.includes(proxy)) {
          // This fails the test and prints the relevant info in test result
          expect(url + ' ' + failure).toBeUndefined();
        }
      });
    });

    await clickPlaygroundRefreshButton(page);
  });
});
