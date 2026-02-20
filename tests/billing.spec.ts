import { test, expect } from '@playwright/test';
import { BillingPage } from '../pages/BillingPage';

test.describe('Billing & Plans Module', () => {
  let billingPage: BillingPage;

  test.beforeEach(async ({ page }) => {
    billingPage = new BillingPage(page);
    await billingPage.navigateToBilling();
  });

  // ──────── Page Load ────────

  test('TC_BILL_01 - Verify Billing Overview page loads from dashboard', async () => {
    await billingPage.assertPageLoaded();
  });

  // ──────── Your Plan Section ────────

  test('TC_BILL_02 - Verify Your Plan section shows Pay as you go with upgrade text', async () => {
    await billingPage.assertYourPlanSectionVisible();
  });

  // ──────── Plans Section ────────

  test('TC_BILL_03 - Verify Plans heading is visible', async () => {
    await billingPage.assertPlansHeadingVisible();
  });

  // ──────── Plan Card: Pay as you go ────────

  test('TC_BILL_04 - Verify Pay as you go plan card with Active badge and features', async () => {
    await billingPage.assertPayAsYouGoPlanVisible();
  });

  // ──────── Plan Card: Volume ────────

  test('TC_BILL_05 - Verify Volume plan card with $500 price and features', async () => {
    await billingPage.assertVolumePlanVisible();
  });

  // ──────── Plan Card: Enterprise ────────

  test('TC_BILL_06 - Verify Enterprise plan card with custom pricing and all features', async () => {
    await billingPage.assertEnterprisePlanVisible();
  });

  // ──────── Transaction History ────────

  test('TC_BILL_07 - Verify Transaction History section is visible', async () => {
    await billingPage.assertTransactionHistoryVisible();
  });

  // ──────── View Detailed Pricing (popup) ────────

  test('TC_BILL_08 - Verify View detailed pricing link opens Shunya Labs Plans page in new tab', async () => {
    const popup = await billingPage.clickViewDetailedPricing();
    await expect(billingPage.pricingPageHeading(popup)).toBeVisible({ timeout: 15000 });
    await popup.close();
  });

  // ──────── View Payment History (Stripe popup) ────────

  test('TC_BILL_09 - Verify View payment history opens Stripe billing portal in new tab', async () => {
    const popup = await billingPage.clickViewPaymentHistory();
    await expect(billingPage.stripePortalLink(popup)).toBeVisible({ timeout: 30000 });
    await popup.close();
  });

});
