import { test, expect } from '@playwright/test';

test('移动端 H5 首页可访问', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('body')).toBeVisible();
});
