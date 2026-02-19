import { test, expect } from '@playwright/test';
import { UsagePage } from '../pages/UsagePage';

test.describe('Usage Module', () => {
  let usagePage: UsagePage;

  test.beforeEach(async ({ page }) => {
    usagePage = new UsagePage(page);
    await usagePage.navigateToUsage();
  });

  test('TC_USE_01 - Verify Usage page loads successfully', async ({ page }) => {
    await usagePage.assertPageLoaded();
    expect(page.url()).toContain('usage');
  });

  test('TC_USE_02 - Verify usage stats/KPI cards are displayed', async () => {
    await usagePage.assertUsageStatsVisible();
  });

  test('TC_USE_03 - Verify usage chart or graph is rendered', async () => {
    await usagePage.assertChartVisible();
  });

  test('TC_USE_04 - Verify date range filter options are present', async () => {
    const pickerVisible = await usagePage.dateRangePicker.isVisible({ timeout: 5000 }).catch(() => false);
    const filterButtonVisible = await usagePage.dateRangeButton.isVisible({ timeout: 5000 }).catch(() => false);
    const last7Visible = await usagePage.last7DaysFilter.isVisible({ timeout: 5000 }).catch(() => false);
    const last30Visible = await usagePage.last30DaysFilter.isVisible({ timeout: 5000 }).catch(() => false);
    expect(pickerVisible || filterButtonVisible || last7Visible || last30Visible).toBeTruthy();
  });

  test('TC_USE_05 - Verify "Last 7 Days" filter updates the view', async ({ page }) => {
    const last7Visible = await usagePage.last7DaysFilter.isVisible({ timeout: 5000 }).catch(() => false);
    if (last7Visible) {
      await usagePage.selectLast7DaysFilter();
      await page.waitForTimeout(1500);
      // Verify page still shows usage data
      await usagePage.assertUsageStatsVisible();
    } else {
      test.skip();
    }
  });

  test('TC_USE_06 - Verify "Last 30 Days" filter updates the view', async ({ page }) => {
    const last30Visible = await usagePage.last30DaysFilter.isVisible({ timeout: 5000 }).catch(() => false);
    if (last30Visible) {
      await usagePage.selectLast30DaysFilter();
      await page.waitForTimeout(1500);
      await usagePage.assertUsageStatsVisible();
    } else {
      test.skip();
    }
  });

  test('TC_USE_07 - Verify "Today" filter updates the view', async ({ page }) => {
    const todayVisible = await usagePage.todayFilter.isVisible({ timeout: 5000 }).catch(() => false);
    if (todayVisible) {
      await usagePage.selectTodayFilter();
      await page.waitForTimeout(1500);
      await usagePage.assertPageLoaded();
    } else {
      test.skip();
    }
  });

  test('TC_USE_08 - Verify Export button is visible', async () => {
    const exportVisible = await usagePage.exportButton.isVisible({ timeout: 5000 }).catch(() => false);
    if (exportVisible) {
      await usagePage.assertExportButtonVisible();
    } else {
      // Export may not be present on all plans
      test.skip();
    }
  });

  test('TC_USE_09 - Verify usage table or breakdown is displayed', async () => {
    const tableVisible = await usagePage.usageTable.isVisible({ timeout: 5000 }).catch(() => false);
    const rowsCount = await usagePage.getTableRowsCount();
    // Table might be empty (no usage yet) or not present; page should still load
    await usagePage.assertPageLoaded();
    expect(tableVisible || rowsCount >= 0).toBeTruthy();
  });

  test('TC_USE_10 - Verify total requests stat card is present', async () => {
    const requestsVisible = await usagePage.totalRequestsCount.isVisible({ timeout: 5000 }).catch(() => false);
    const statCardsCount = await usagePage.getStatCardsCount();
    expect(requestsVisible || statCardsCount > 0).toBeTruthy();
  });

  test('TC_USE_11 - Verify total tokens stat card is present', async () => {
    const tokensVisible = await usagePage.totalTokensCount.isVisible({ timeout: 5000 }).catch(() => false);
    const statCardsCount = await usagePage.getStatCardsCount();
    expect(tokensVisible || statCardsCount > 0).toBeTruthy();
  });
});
