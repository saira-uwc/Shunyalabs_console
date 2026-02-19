import { test, expect } from '@playwright/test';
import { SettingsPage } from '../pages/SettingsPage';

test.describe('Settings Module — Profile Update & Restore', () => {
  let settingsPage: SettingsPage;

  // Original values
  const ORIGINAL_FIRST = 'Saira';
  const ORIGINAL_LAST = 'Automation';
  const ORIGINAL_DISPLAY = `${ORIGINAL_FIRST} ${ORIGINAL_LAST}`;

  // Test values
  const TEST_FIRST = 'Saira-test';
  const TEST_LAST = 'Automation-test';
  const TEST_DISPLAY = `${TEST_FIRST} ${TEST_LAST}`;

  test.beforeEach(async ({ page }) => {
    settingsPage = new SettingsPage(page);
  });

  // ──────── Page Load ────────

  test('TC_SET_01 - Verify Settings page loads from dashboard with profile fields', async () => {
    await settingsPage.navigateToSettings();
    await settingsPage.assertProfileFieldsVisible();
  });

  test('TC_SET_02 - Verify Save Changes button is visible', async () => {
    await settingsPage.navigateToSettings();
    await settingsPage.assertSaveButtonVisible();
  });

  // ──────── E2E: Update → Verify → Restore → Verify → Logout ────────

  test('TC_SET_03 - E2E: Update profile, verify on dashboard, restore original, logout', async ({ page }) => {
    // Step 1: Navigate to Settings
    await settingsPage.navigateToSettings();

    // Step 2: Update first name and last name to test values
    await settingsPage.updateProfile(TEST_FIRST, TEST_LAST);

    // Step 3: Verify success toast
    await settingsPage.assertSuccessToastVisible();

    // Step 4: Navigate to Dashboard and verify heading reflects new name
    await settingsPage.navigateToDashboard();
    await settingsPage.assertDashboardHeading(TEST_FIRST);

    // Step 5: Navigate back to Settings via user menu (name changed)
    await settingsPage.navigateToSettingsViaUserMenu(TEST_DISPLAY);

    // Step 6: Restore original first name and last name
    await settingsPage.updateProfile(ORIGINAL_FIRST, ORIGINAL_LAST);

    // Step 7: Verify success toast again
    await settingsPage.assertSuccessToastVisible();

    // Step 8: Logout (user menu shows original name now)
    await settingsPage.logout(ORIGINAL_DISPLAY);
    await expect(page).toHaveURL(/auth\/sign-in/);
  });
});
