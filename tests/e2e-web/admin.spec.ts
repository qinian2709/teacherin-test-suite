import { test, expect } from '@playwright/test';
import { env } from '@config';
import { AdminHomePage } from './pages/AdminHomePage.js';

test('管理后台首页可访问（zxjs）', async ({ page }) => {
  await page.goto(env.adminBaseURL);
  const admin = new AdminHomePage(page);
  await admin.waitForReady();
  await expect(page.locator('body')).toBeVisible();
});
