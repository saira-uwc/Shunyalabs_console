import { test, expect } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';

test.describe('Logout — Session Cleanup', () => {
  test('TC_LOGOUT_01 - Verify user can log out and is redirected to sign-in', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.navigateToDashboard();
    await dashboardPage.logout();
    await expect(page).toHaveURL(/auth\/sign-in/);
  });
});
