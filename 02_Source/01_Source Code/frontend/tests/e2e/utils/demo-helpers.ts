import { expect, Page } from '@playwright/test';

const runtimeEnv =
  (globalThis as { process?: { env?: Record<string, string | undefined> } })
    .process?.env ?? {};

const postTestPauseMs = Number(runtimeEnv.DEMO_POST_TEST_PAUSE_MS ?? '3000');

export async function loginAsOperator(page: Page): Promise<void> {
  await page.goto('/login', { waitUntil: 'domcontentloaded' });

  const loginHeading = page.getByRole('heading', {
    name: 'Đăng nhập hệ thống Week seven demo',
  });

  try {
    await expect(loginHeading).toBeVisible({ timeout: 15000 });
  } catch {
    // In headed demo runs, Vite can occasionally render a blank page on first paint.
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(loginHeading).toBeVisible({ timeout: 15000 });
  }

  const usernameInput = page
    .locator('label', { hasText: /^Tên đăng nhập$/ })
    .locator('xpath=following::input[1]');
  const passwordInput = page
    .locator('label', { hasText: /^Mật khẩu$/ })
    .locator('xpath=following::input[1]');

  await expect(usernameInput).toBeVisible({ timeout: 15000 });
  await expect(passwordInput).toBeVisible({ timeout: 15000 });

  await usernameInput.fill('admin-operator');
  await passwordInput.fill('Admin@123456');
  await page.getByRole('button', { name: 'Đăng nhập' }).click();

  await expect(page).toHaveURL(/\/operator\/dashboard$/);
}

export async function pauseForDemo(page: Page): Promise<void> {
  if (runtimeEnv.CI) {
    return;
  }

  await page.waitForTimeout(postTestPauseMs);
}
