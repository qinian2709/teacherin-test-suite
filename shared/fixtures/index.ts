import { test as base, expect } from '@playwright/test';
import {
  env,
  accounts,
  hasApiCredential,
  hasAdminCredential,
  sessionCookieHeader,
  API_MAX_RESPONSE_MS,
} from '../../config/index.js';
import { resolveAuthTokens } from '../auth/login.js';
import { DataRegistry } from '../data/cleanup.js';
import { browserHeaders, authHeader } from '../http/browser-headers.js';
import { ApiHelper } from './api-helper.js';

export interface ApiWorkerFixtures {
  workerToken: string;
  workerAdminToken: string;
  bootstrapAuth: void;
}

export interface ApiFixtures {
  env: typeof env;
  token: string;
  adminToken: string;
  anonApi: ApiHelper;
  api: ApiHelper;
  adminApi: ApiHelper;
  data: DataRegistry;
}

export const test = base.extend<ApiFixtures, ApiWorkerFixtures>({
  workerToken: [
    async ({}, use) => {
      await resolveAuthTokens();
      await use(accounts.token);
    },
    { scope: 'worker' },
  ],

  workerAdminToken: [
    async ({}, use) => {
      await resolveAuthTokens();
      await use(accounts.adminToken);
    },
    { scope: 'worker' },
  ],

  bootstrapAuth: [
    async ({}, use) => {
      await resolveAuthTokens();
      await use(undefined);
    },
    { scope: 'worker', auto: true },
  ],

  env: async ({}, use) => {
    await use(env);
  },

  token: async ({ workerToken }, use) => {
    if (!hasApiCredential() && !workerToken) {
      test.skip(true, '未配置 TEST_ACCOUNT（白名单换 cookie）或 API_TOKEN，跳过需登录用例');
    }
    await use(workerToken);
  },

  adminToken: async ({ workerAdminToken }, use) => {
    if (!hasAdminCredential() && !workerAdminToken) {
      test.skip(true, '未配置管理后台鉴权凭据（ADMIN_API_TOKEN / API_TOKEN），跳过需登录用例');
    }
    await use(workerAdminToken);
  },

  anonApi: async ({}, use) => {
    const helper = new ApiHelper(
      env.apiBaseURL,
      browserHeaders(),
      { maxResponseMs: API_MAX_RESPONSE_MS },
    );
    await use(helper);
  },

  api: async ({ workerToken }, use) => {
    if (!hasApiCredential() && !workerToken) {
      test.skip(true, '未配置 TEST_ACCOUNT（白名单换 cookie）或 API_TOKEN，跳过需登录用例');
    }
    const helper = new ApiHelper(
      env.apiBaseURL,
      {
        ...browserHeaders(),
        ...authHeader(workerToken),
        ...sessionCookieHeader(),
      },
      { maxResponseMs: API_MAX_RESPONSE_MS },
    );
    await use(helper);
  },

  adminApi: async ({ workerAdminToken }, use) => {
    if (!hasAdminCredential() && !workerAdminToken) {
      test.skip(true, '未配置管理后台鉴权凭据（ADMIN_API_TOKEN / API_TOKEN），跳过需登录用例');
    }
    const helper = new ApiHelper(
      env.adminApiBaseURL,
      {
        ...browserHeaders(env.adminBaseURL),
        ...authHeader(workerAdminToken),
      },
      { maxResponseMs: API_MAX_RESPONSE_MS },
    );
    await use(helper);
  },

  data: async ({}, use) => {
    const registry = new DataRegistry();
    await use(registry);
    await registry.runAll();
  },
});

export { expect, accounts, env, ApiHelper };
