import { test, expect } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';

test.describe('Dashboard Module — Navigation & Section Verification', () => {
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ page }) => {
    dashboardPage = new DashboardPage(page);
    await dashboardPage.navigateToDashboard();
  });

  // ──────── Dashboard Load ────────

  test('TC_DASH_01 - Verify dashboard heading and subtitle are visible', async () => {
    await dashboardPage.assertDashboardLoaded();
  });

  // ──────── Dashboard Sections ────────

  test('TC_DASH_02 - Verify API Keys section is displayed on dashboard', async () => {
    await dashboardPage.assertApiKeysSectionVisible();
  });

  test('TC_DASH_03 - Verify Your Plan section is displayed on dashboard', async () => {
    await dashboardPage.assertYourPlanSectionVisible();
  });

  test('TC_DASH_04 - Verify Explore Playground section is visible', async () => {
    await dashboardPage.assertExplorePlaygroundVisible();
  });

  test('TC_DASH_05 - Verify Documentation section is visible', async () => {
    await dashboardPage.assertDocumentationSectionVisible();
  });

  test('TC_DASH_06 - Verify Usage section is visible', async () => {
    await dashboardPage.assertUsageSectionVisible();
  });

  // ──────── Popup Links (open in new tab) ────────

  test('TC_DASH_07 - Verify Speech to Text link opens API Playground in new tab', async () => {
    const popup = await dashboardPage.clickSpeechToText();
    await expect(dashboardPage.playgroundHeading(popup)).toBeVisible({ timeout: 15000 });
    await popup.close();
  });

  test('TC_DASH_08 - Verify Transcribe audio link opens Docs Quickstart in new tab', async () => {
    const popup = await dashboardPage.clickTranscribeAudio();
    await expect(dashboardPage.docsQuickstartHeading(popup)).toBeVisible({ timeout: 15000 });
    await popup.close();
  });

  test('TC_DASH_09 - Verify See Features link opens Speech Intelligence Features in new tab', async () => {
    const popup = await dashboardPage.clickSeeFeatures();
    await expect(dashboardPage.speechFeaturesHeading(popup)).toBeVisible({ timeout: 15000 });
    await popup.close();
  });

  // ──────── In-App Navigation ────────

  test('TC_DASH_10 - Verify Usage Overview link navigates to Usage Analytics page', async ({ page }) => {
    await dashboardPage.clickUsageOverview();
    await expect(page.getByRole('heading', { name: 'Usage Analytics' })).toBeVisible();
  });

  test('TC_DASH_11 - Verify Dashboard link navigates back from Usage', async ({ page }) => {
    await dashboardPage.clickUsageOverview();
    await dashboardPage.clickNavDashboard();
    await dashboardPage.assertDashboardLoaded();
  });

  test('TC_DASH_12 - Verify Logs link navigates to Usage Logs page', async ({ page }) => {
    await dashboardPage.clickNavLogs();
    await expect(page.getByRole('heading', { name: 'Usage Logs' })).toBeVisible();
  });

  // ──────── Nav Bar Popup Links ────────

  test('TC_DASH_13 - Verify Playground nav link opens API Playground in new tab', async () => {
    const popup = await dashboardPage.clickNavPlayground();
    await expect(dashboardPage.playgroundHeading(popup)).toBeVisible({ timeout: 15000 });
    await popup.close();
  });

  test('TC_DASH_14 - Verify Docs nav link opens Shunya Labs Docs in new tab', async () => {
    const popup = await dashboardPage.clickNavDocs();
    await expect(dashboardPage.docsWelcomeHeading(popup)).toBeVisible({ timeout: 15000 });
    await popup.close();
  });

  // ──────── User Menu → Settings ────────

  test('TC_DASH_15 - Verify user menu opens and navigates to Settings', async ({ page }) => {
    await dashboardPage.navigateToSettings();
    await expect(page.getByRole('heading', { name: 'Profile' })).toBeVisible();
  });

  test('TC_DASH_16 - Verify Settings page shows Personal Information section', async ({ page }) => {
    await dashboardPage.navigateToSettings();
    await expect(page.getByText('Personal InformationYour basic account detailsFirst nameLast nameEmailSave')).toBeVisible();
  });

  test('TC_DASH_17 - Verify Settings page shows Current Plan section', async ({ page }) => {
    await dashboardPage.navigateToSettings();
    await expect(page.getByText('Current PlanYour subscription and billing detailsPay as you goView plans')).toBeVisible();
  });

  // ──────── Logout ────────

  test('TC_DASH_18 - Verify user can log out and is redirected to sign-in', async ({ page }) => {
    await dashboardPage.logout();
    await expect(page).toHaveURL(/auth\/sign-in/);
    const loginPage = new LoginPage(page);
    await loginPage.assertLoginPageVisible();
  });
});
