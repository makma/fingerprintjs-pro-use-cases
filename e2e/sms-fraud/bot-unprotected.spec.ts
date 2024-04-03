import { expect, test } from '@playwright/test';
import { TEST_ATTRIBUTES, TEST_IDS } from '../../src/client/testIDs';
import { SMS_FRAUD_COPY } from '../../src/server/sms-fraud/smsFraudCopy';
import { TEST_PHONE_NUMBER } from '../../src/pages/api/sms-fraud/send-verification-sms';
import { resetScenarios } from '../resetHelper';

const TEST_ID = TEST_IDS.smsFraud;

// This test includes waiting for the SMS cool-down period, so it will take longer
test.setTimeout(60000);

test.describe('Sending verification SMS messages', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/sms-fraud');
    await resetScenarios(page);
  });

  test('is possible with Bot detection off, with cool down periods', async ({ page }) => {
    await page.goto('/sms-fraud?disableBotDetection=1');
    const sendButton = await page.getByTestId(TEST_ID.sendMessage);

    await sendButton.click();
    const alert = await page.getByTestId(TEST_IDS.common.alert);
    await expect(alert).toHaveAttribute(TEST_ATTRIBUTES.severity, 'success');
    await expect(alert).toContainText(SMS_FRAUD_COPY.messageSent(TEST_PHONE_NUMBER, 2));

    await sendButton.click();
    await expect(alert).toHaveAttribute(TEST_ATTRIBUTES.severity, 'error');
    await expect(alert).toContainText(SMS_FRAUD_COPY.needToWait(1), {});

    await page.waitForTimeout(30000);
    await sendButton.click();
    await expect(alert).toHaveAttribute(TEST_ATTRIBUTES.severity, 'success');
    await expect(alert).toContainText(SMS_FRAUD_COPY.messageSent(TEST_PHONE_NUMBER, 1), {});

    await sendButton.click();
    await expect(alert).toHaveAttribute(TEST_ATTRIBUTES.severity, 'error');
    await expect(alert).toContainText(SMS_FRAUD_COPY.needToWait(2), {});
  });
});