import { expect, test } from '@playwright/test';
import { pauseForDemo } from './utils/demo-helpers';

test.describe('Authentication flow', () => {
  test('manager can log in and gets redirected to manager dashboard', async ({ page }) => {
    await page.goto('/login');

    await expect(page.getByRole('heading', { name: 'Đăng nhập hệ thống Week seven demo' })).toBeVisible();

    await page.locator('input[type="text"]').first().fill('admin-manager');
    await page.locator('input[type="password"]').first().fill('Admin@123456');
    await page.getByRole('button', { name: 'Đăng nhập' }).click();

    await expect(page).toHaveURL(/\/manager\/dashboard$/);
    await pauseForDemo(page);
  });
});
