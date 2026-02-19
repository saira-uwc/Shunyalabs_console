import { test, expect } from '@playwright/test';
import { ApiKeysPage } from '../pages/ApiKeysPage';
import { generateUniqueName } from '../utils/helpers';

test.describe('API Keys Module — Create, Verify & Deactivate', () => {
  let apiKeysPage: ApiKeysPage;

  test.beforeEach(async ({ page }) => {
    apiKeysPage = new ApiKeysPage(page);
  });

  // ──────── Page Load ────────

  test('TC_API_01 - Verify API Keys page loads from dashboard', async () => {
    await apiKeysPage.navigateToApiKeys();
    await apiKeysPage.assertPageLoaded();
  });

  test('TC_API_02 - Verify Create a new API key button is visible', async () => {
    await apiKeysPage.navigateToApiKeys();
    await expect(apiKeysPage.createKeyButton).toBeVisible();
  });

  test('TC_API_03 - Verify clicking Create opens key name form', async () => {
    await apiKeysPage.navigateToApiKeys();
    await apiKeysPage.clickCreateKey();
    await expect(apiKeysPage.keyNameInput).toBeVisible();
  });

  // ──────── Single E2E: Create → Copy → Verify → Deactivate → Verify ────────

  test('TC_API_04 - E2E: Create key, copy, verify with date, deactivate, verify deactivated', async () => {
    const keyName = generateUniqueName('auto_key');

    // Step 1: Navigate to API Keys
    await apiKeysPage.navigateToApiKeys();

    // Step 2: Create a new API key with unique name
    await apiKeysPage.clickCreateKey();
    await apiKeysPage.fillKeyName(keyName);
    await apiKeysPage.submitCreateKey();

    // Step 3: Verify "Your New API Key" dialog is shown
    await apiKeysPage.assertNewKeyDialogVisible();

    // Step 4: Acknowledge, copy key, and close dialog
    await apiKeysPage.acknowledgeAndCopyKey();

    // Step 5: Verify key appears in active list
    await apiKeysPage.assertKeyInActiveList(keyName);

    // Step 6: Verify created date shows today's date
    await apiKeysPage.assertCreatedDateVisible();

    // Step 7: Revoke / deactivate the created key
    await apiKeysPage.revokeKey(keyName);

    // Step 8: Switch to Deactivated tab and verify key is there
    await apiKeysPage.assertKeyInDeactivatedTab(keyName);

    // Step 9: Verify "Deactivated on" column is visible
    await apiKeysPage.assertDeactivatedOnColumnVisible();

    // Step 10: Verify deactivation date shows today's date
    await apiKeysPage.assertDeactivatedDateVisible();
  });

  // ──────── Logout ────────

  test('TC_API_05 - Verify logout from API Keys page redirects to sign-in', async ({ page }) => {
    await apiKeysPage.navigateToApiKeys();
    await apiKeysPage.logout();
    await expect(page).toHaveURL(/auth\/sign-in/);
  });
});
