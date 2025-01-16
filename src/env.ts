import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

/**
 * In this file we manage environment variables using [t3-env](https://env.t3.gg/docs/introduction).
 * This is basically the same as just importing them like `process.env.VARIABLE` but:
 * - It provides a strongly typed `ENV` object so typos will result in TypeScript errors
 * - If a required environment variable is missing, it will throw an error at build time instead of runtime
 * - Plus other useful features like Zod validation and transformations, defaults, server vs client checks....
 **/
export const env = createEnv({
  /*
   * Server-side Environment variables, not available on the client.
   * Will throw error if you access these variables on the client.
   *
   * Some default values are defined here to provide users with a "git-clone-and-it-just-works" experience when trying the demo,
   * with other protections in place to prevent abuse. This only makes sense in an education demo project like this one.
   * DO NOT expose your server-side secrets in your source code!
   */
  server: {
    // Main Fingerprint configuration
    SERVER_API_KEY: z.string().min(1).default('fMUtVoWHKddpfOheQww2'),
    // Lower confidence score limit for e2e tests
    MIN_CONFIDENCE_SCORE: z.coerce.number().min(0.0).max(1.0).default(0.85),

    // Credential stuffing demo
    KNOWN_VISITOR_IDS: z.string().min(1).default('').optional(),

    // Bot firewall use case Cloudflare settings
    CLOUDFLARE_API_TOKEN: z.string().min(1).optional(),
    CLOUDFLARE_ZONE_ID: z.string().min(1).optional(),
    CLOUDFLARE_RULESET_ID: z.string().min(1).optional(),

    // SMS Pumping use case
    TWILIO_API_KEY_SID: z.string().min(1).optional(),
    TWILIO_API_KEY_SECRET: z.string().min(1).optional(),
    TWILIO_ACCOUNT_SID: z.string().min(1).optional(),
    TWILIO_FROM_NUMBER: z.string().min(1).optional(),

    // VPN Detection demo feat. Sealed client results
    SEALED_RESULTS_DECRYPTION_KEY: z.string().min(1).default('nAEUm/yALfMwWGWzUEXjXplocr8ouYjAhEJgRnBNRwA='),
    SEALED_RESULTS_SERVER_API_KEY: z.string().min(1).default('cRg3axMS26qfkjcS7OFh'),
  },
  /*
   * Environment variables available on the client (and server).
   * 💡 You'll get type errors if these are not prefixed with NEXT_PUBLIC_.
   */
  client: {
    // Main Fingerprint configuration
    NEXT_PUBLIC_API_KEY: z.string().min(1).default('lwIgYR2dpSJfW830B24h'),
    NEXT_PUBLIC_REGION: z.enum(['eu', 'us', 'ap']).default('us'),
    NEXT_PUBLIC_SCRIPT_URL_PATTERN: z
      .string()
      .min(1)
      .default('https://metrics.fingerprinthub.com/web/v<version>/<apiKey>/loader_v<loaderVersion>.js'),
    NEXT_PUBLIC_ENDPOINT: z.string().min(1).default('https://metrics.fingerprinthub.com'),

    // Playground
    NEXT_PUBLIC_MAPBOX_API_TOKEN: z.string().min(1).optional(),

    // Fingerprint configuration for VPN Detection demo feat. Sealed client results
    NEXT_PUBLIC_SEALED_RESULTS_PUBLIC_API_KEY: z.string().min(1).default('2lFEzpuyfqkfQ9KJgiqv'),
    NEXT_PUBLIC_SEALED_RESULTS_SCRIPT_URL: z
      .string()
      .min(1)
      .default(
        'https://staging.fingerprinthub.com/fp-sealed/agent?apiKey=<apiKey>&version=<version>&loaderVersion=<loaderVersion>',
      ),
    NEXT_PUBLIC_SEALED_RESULTS_ENDPOINT: z
      .string()
      .min(1)
      .default('https://staging.fingerprinthub.com/fp-sealed/result?region=us'),
    // Analytics
    NEXT_PUBLIC_GTM_ID: z.string().min(1).optional(),
    NEXT_PUBLIC_AMPLITUDE_API_KEY: z.string().min(1).optional(),
    // Inkeep
    NEXT_PUBLIC_INKEEP_API_KEY: z.string().min(1).default('b0537306817fb8a0daea377df2b273d1b00ac709182d1dc7'),
    NEXT_PUBLIC_INKEEP_INTEGRATION_ID: z.string().min(1).default('cm366b5qy000412p946i586tu'),
    NEXT_PUBLIC_INKEEP_ORG_ID: z.string().min(1).default('org_d0VDri411QUR4Xi7'),
  },
  /*
   * Due to how Next.js bundles environment variables on Edge and Client,
   * we need to manually destructure them to make sure all are included in bundle.
   * 💡 You'll get type errors if not all variables from `server` & `client` are included here.
   */
  runtimeEnv: {
    // Main Fingerprint configuration values (used for most use cases)
    NEXT_PUBLIC_API_KEY: process.env.NEXT_PUBLIC_API_KEY,
    NEXT_PUBLIC_SCRIPT_URL_PATTERN: process.env.NEXT_PUBLIC_SCRIPT_URL_PATTERN,
    NEXT_PUBLIC_ENDPOINT: process.env.NEXT_PUBLIC_ENDPOINT,
    NEXT_PUBLIC_REGION: process.env.NEXT_PUBLIC_REGION,
    SERVER_API_KEY: process.env.SERVER_API_KEY,

    // Playground
    NEXT_PUBLIC_MAPBOX_API_TOKEN: process.env.NEXT_PUBLIC_MAPBOX_API_TOKEN,

    // E2E tests
    MIN_CONFIDENCE_SCORE: process.env.MIN_CONFIDENCE_SCORE,

    // Credential stuffing demo
    KNOWN_VISITOR_IDS: process.env.KNOWN_VISITOR_IDS,

    // Bot firewall use case Cloudflare settings
    CLOUDFLARE_API_TOKEN: process.env.CLOUDFLARE_API_TOKEN,
    CLOUDFLARE_ZONE_ID: process.env.CLOUDFLARE_ZONE_ID,
    CLOUDFLARE_RULESET_ID: process.env.CLOUDFLARE_RULESET_ID,

    // SMS Pumping use case
    TWILIO_API_KEY_SID: process.env.TWILIO_API_KEY_SID,
    TWILIO_API_KEY_SECRET: process.env.TWILIO_API_KEY_SECRET,
    TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
    TWILIO_FROM_NUMBER: process.env.TWILIO_FROM_NUMBER,

    // VPN Detection demo feat. Sealed client results
    SEALED_RESULTS_DECRYPTION_KEY: process.env.SEALED_RESULTS_DECRYPTION_KEY,
    SEALED_RESULTS_SERVER_API_KEY: process.env.SEALED_RESULTS_SERVER_API_KEY,
    NEXT_PUBLIC_SEALED_RESULTS_PUBLIC_API_KEY: process.env.NEXT_PUBLIC_SEALED_RESULTS_PUBLIC_API_KEY,
    NEXT_PUBLIC_SEALED_RESULTS_SCRIPT_URL: process.env.NEXT_PUBLIC_SEALED_RESULTS_SCRIPT_URL,
    NEXT_PUBLIC_SEALED_RESULTS_ENDPOINT: process.env.NEXT_PUBLIC_SEALED_RESULTS_ENDPOINT,

    // Analytics
    NEXT_PUBLIC_GTM_ID: process.env.NEXT_PUBLIC_GTM_ID,
    NEXT_PUBLIC_AMPLITUDE_API_KEY: process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY,

    // Inkeep
    NEXT_PUBLIC_INKEEP_API_KEY: process.env.NEXT_PUBLIC_INKEEP_API_KEY,
    NEXT_PUBLIC_INKEEP_INTEGRATION_ID: process.env.NEXT_PUBLIC_INKEEP_INTEGRATION_ID,
    NEXT_PUBLIC_INKEEP_ORG_ID: process.env.NEXT_PUBLIC_INKEEP_ORG_ID,
  },
  // Comprehensive server check
  // https://github.com/t3-oss/t3-env/issues/154
  isServer: Boolean(
    typeof window === 'undefined' ||
      'Deno' in window ||
      process.env['NODE_ENV'] === 'test' ||
      process.env['JEST_WORKER_ID'] ||
      process.env['VITEST_WORKER_ID'],
  ),
});
