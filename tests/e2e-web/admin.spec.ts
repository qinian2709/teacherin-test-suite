import { test, expect } from '@playwright/test';
import { loadEnv } from '../../config/env';

test('管理后台首页可访问（zxjs）', async ({ page }) => {
  const env = loadEnv();
  await page.goto(env.adminBaseURL);
  await expect(page.locator('body')).toBeVisible();
});
