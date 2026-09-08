import { defineConfig } from '@playwright/test';
import { loadEnv } from './config/env';

const env = loadEnv();

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: env.baseURL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'api',
      testMatch: /tests\/api\/.*\.spec\.ts/,
      use: { baseURL: env.baseURL },
    },
    {
      name: 'e2e-web',
      testMatch: /tests\/e2e-web\/.*\.spec\.ts/,
      use: { ...env.browserUse },
    },
    {
      name: 'e2e-mobile',
      testMatch: /tests\/e2e-mobile\/.*\.spec\.ts/,
      use: {
        ...env.browserUse,
        viewport: { width: 390, height: 844 },
      },
    },
    {
      name: 'miniprogram',
      testMatch: /tests\/miniprogram\/.*\.spec\.ts/,
    },
  ],
});
