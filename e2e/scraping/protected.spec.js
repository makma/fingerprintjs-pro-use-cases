// @ts-check
import { expect, test } from '@playwright/test';
import { isDebugMode } from '../utils';

test.describe('Scraping flights', () => {
  test('is not possible with Bot detection on', async ({ page }) => {
    await page.goto('/web-scraping');
    await page.click('button:has-text("Search flights")');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('.message')).toContainText('Malicious bot detected');
    // if in debug mode, pause script execution
    if (isDebugMode()) {
      await page.pause();
    }
  });
});