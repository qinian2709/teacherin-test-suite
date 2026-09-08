import { test, expect } from '@playwright/test';

test('Web 主站首页可访问', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/TeacherIn|教师|共建/);
});
