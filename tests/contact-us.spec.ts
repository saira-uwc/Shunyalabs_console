import { test, expect } from '@playwright/test';
import { ContactUsPage } from '../pages/ContactUsPage';

test.describe('Contact Us Module', () => {
  let contactUsPage: ContactUsPage;

  test.beforeEach(async ({ page }) => {
    contactUsPage = new ContactUsPage(page);
    await contactUsPage.navigateToContactUs();
  });

  // ──────── Page Load ────────

  test('TC_CONT_01 - Verify Contact Us page loads from dashboard', async () => {
    await contactUsPage.assertPageLoaded();
  });

  // ──────── Form Elements ────────

  test('TC_CONT_02 - Verify Message field is visible', async () => {
    await contactUsPage.assertMessageFieldVisible();
  });

  test('TC_CONT_03 - Verify Submit button is visible', async () => {
    await contactUsPage.assertSubmitButtonVisible();
  });

  // ──────── E2E: Fill & Submit Feedback ────────

  test('TC_CONT_04 - E2E: Fill message, submit, and verify success notification', async () => {
    // Step 1: Fill the message field
    await contactUsPage.fillMessage('automation-test feedback');

    // Step 2: Click Submit
    await contactUsPage.clickSubmit();

    // Step 3: Verify success notification appears
    await contactUsPage.assertSuccessNotificationVisible();
  });

  // ──────── Logout ────────

  test('TC_CONT_05 - Verify logout from Contact Us page redirects to sign-in', async ({ page }) => {
    await contactUsPage.logout();
    await expect(page).toHaveURL(/auth\/sign-in/);
  });
});
