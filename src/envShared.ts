/**
 * Env variables shared between Next.js and Playwright
 * Playwright cannot import ESM-only packages like `t3-env`.
 * We have to access environment variables for Playwright tests manually 😔.
 * https://github.com/microsoft/playwright/issues/23662
 */
export const TEST_BUILD = Boolean(process.env.TEST_BUILD);
export const IS_PRODUCTION = Boolean(process.env.NODE_ENV === 'production');
export const IS_DEVELOPMENT = Boolean(process.env.NODE_ENV === 'development');
export const HASH_SALT = process.env.HASH_SALT || 'defaultSalt';
