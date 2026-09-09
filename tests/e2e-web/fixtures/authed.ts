import { test as base, expect } from '@playwright/test';
import { accounts } from '@config';
import { resolveAuthTokens } from '../../../shared/auth/login.js';
import { installAuth } from '../helpers/auth.js';
import { attachFailureScreenshot } from '../helpers/screenshots.js';
import { HomePage } from '../pages/HomePage.js';

interface AuthedFixtures {
  authedHome: HomePage;
}

export const test = base.extend<AuthedFixtures>({
  authedHome: async ({ page }, use, testInfo) => {
    await resolveAuthTokens();
    test.skip(!accounts.token, '未配置主站鉴权凭据（API_TOKEN / TEST_TOKEN），跳过需登录态注入的用例');

    await installAuth(page, accounts.token);
    const home = new HomePage(page);
    await home.goto();

    await use(home);
    await attachFailureScreenshot(page, testInfo);
  },
});

export { expect };
