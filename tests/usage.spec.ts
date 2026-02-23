import { test, expect } from '@playwright/test';
import { UsagePage } from '../pages/UsagePage';

test.describe('Usage Module — Analytics, Logs & Billing Verification', () => {
  let usagePage: UsagePage;

  test.beforeEach(async ({ page }) => {
    usagePage = new UsagePage(page);
  });

  // ──────── Page Load ────────

  test('TC_USE_01 - Verify Usage Analytics page loads from dashboard', async () => {
    await usagePage.navigateToUsageOverview();
    await usagePage.assertUsageOverviewLoaded();
  });

  test('TC_USE_02 - Verify date range and metric filters are visible', async () => {
    await usagePage.navigateToUsageOverview();
    await usagePage.assertFiltersVisible();
  });

  test('TC_USE_03 - Verify Usage Logs page loads', async () => {
    await usagePage.navigateToUsageLogs();
    await usagePage.assertUsageLogsLoaded();
  });

  // ──────── E2E: Full Usage Verification Flow ────────

  test('TC_USE_04 - E2E: Check balance, run analysis, verify balance update, usage count, logs, and billing deduction', async () => {
    test.setTimeout(180000); // 3 minutes for this complex flow

    // ── Step 1: Navigate to Dashboard and capture initial balance ──
    await usagePage.navigateToDashboard();
    const initialBalance = await usagePage.getBalance();

    // ── Step 2: Navigate to Logs and capture initial log count for today ──
    await usagePage.navigateToUsageLogs();
    const initialLogCount = await usagePage.getLogEntriesCountForToday();

    // ── Step 3: Open Playground and run Customer Support Call analysis ──
    await usagePage.navigateToUsageOverview();
    const popup = await usagePage.openPlayground();
    await usagePage.runCustomerSupportAnalysis(popup);
    await popup.close();

    // ── Step 4: Poll Dashboard balance until it decreases (backend processing) ──
    await expect.poll(
      async () => await usagePage.getBalanceWithReload(),
      { message: `Expected balance to decrease from $${initialBalance}`, timeout: 30000, intervals: [3000, 5000, 5000, 5000, 5000] }
    ).toBeLessThan(initialBalance);

    // ── Step 5: Navigate to Usage Overview and verify chart has data ──
    await usagePage.navigateToUsageOverview();
    // Wait for chart line to render with data
    await expect.poll(
      async () => await usagePage.isChartRendered(),
      { message: 'Expected usage chart to render with data', timeout: 20000, intervals: [2000, 3000, 5000, 5000] }
    ).toBeTruthy();

    // ── Step 6: Navigate to Logs and verify new entry with today's date ──
    // Poll logs page until a new entry appears (backend processing delay)
    await expect.poll(
      async () => await usagePage.getLogEntriesCountWithReload(),
      { message: `Expected log count to increase from ${initialLogCount}`, timeout: 30000, intervals: [3000, 5000, 5000, 5000, 5000] }
    ).toBeGreaterThan(initialLogCount);

    // ── Step 7: Capture the cost from logs ──
    const logCost = await usagePage.getLatestLogCost();
    expect(logCost).toBeGreaterThan(0);

    // ── Step 8: Navigate to Billing and verify deduction transaction ──
    await usagePage.navigateToBilling();
    await usagePage.assertBillingDeductionForToday();

    // ── Step 9: Verify billing deduction amount exists ──
    const billingAmount = await usagePage.getBillingDeductionAmount();
    expect(billingAmount).toBeGreaterThan(0);
  });
});
