import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class UsagePage extends BasePage {
  // Page heading
  readonly pageHeading = this.page.locator('h1:has-text("Usage"), h2:has-text("Usage"), [data-testid="usage-heading"]');

  // Date range / filter
  readonly dateRangePicker = this.page.locator('[class*="date-picker"], [class*="date-range"], [data-testid="date-range"]');
  readonly dateRangeButton = this.page.locator('button:has-text("Today"), button:has-text("Last 7"), button:has-text("Last 30"), [class*="date-filter"]');
  readonly todayFilter = this.page.locator('button:has-text("Today"), [data-value="today"]');
  readonly last7DaysFilter = this.page.locator('button:has-text("7 days"), button:has-text("Last 7"), [data-value="7d"]');
  readonly last30DaysFilter = this.page.locator('button:has-text("30 days"), button:has-text("Last 30"), [data-value="30d"]');
  readonly customDateFilter = this.page.locator('button:has-text("Custom"), [data-value="custom"]');

  // Usage stats
  readonly totalRequestsCount = this.page.locator('[data-testid="total-requests"], [class*="total-requests"], [class*="stat"]:has-text("request")');
  readonly totalTokensCount = this.page.locator('[data-testid="total-tokens"], [class*="total-tokens"], [class*="stat"]:has-text("token")');
  readonly statCards = this.page.locator('[class*="stat-card"], [class*="usage-card"], [data-testid*="usage-stat"]');

  // Chart / Graph
  readonly usageChart = this.page.locator('[class*="chart"], canvas, [data-testid="usage-chart"], svg[class*="chart"]');
  readonly chartLegend = this.page.locator('[class*="legend"], [data-testid="chart-legend"]');

  // Table / breakdown
  readonly usageTable = this.page.locator('table, [class*="usage-table"], [data-testid="usage-table"]');
  readonly tableRows = this.page.locator('table tbody tr, [class*="usage-row"]');

  // Export
  readonly exportButton = this.page.locator('button:has-text("Export"), button:has-text("Download"), a:has-text("Export CSV")');

  // Model breakdown
  readonly modelBreakdown = this.page.locator('[class*="model-breakdown"], [data-testid="model-usage"]');

  constructor(page: Page) {
    super(page);
  }

  async navigateToUsage() {
    await this.page.goto('/usage');
    await this.waitForPageLoad();
  }

  async selectTodayFilter() {
    await this.clickElement(this.todayFilter);
    await this.page.waitForTimeout(1000);
  }

  async selectLast7DaysFilter() {
    await this.clickElement(this.last7DaysFilter);
    await this.page.waitForTimeout(1000);
  }

  async selectLast30DaysFilter() {
    await this.clickElement(this.last30DaysFilter);
    await this.page.waitForTimeout(1000);
  }

  async openDateRangePicker() {
    const pickerVisible = await this.dateRangePicker.isVisible({ timeout: 2000 }).catch(() => false);
    if (pickerVisible) {
      await this.clickElement(this.dateRangePicker);
    } else {
      await this.clickElement(this.dateRangeButton);
    }
  }

  async exportUsageData() {
    const downloadPromise = this.page.waitForEvent('download');
    await this.clickElement(this.exportButton);
    return await downloadPromise;
  }

  async getStatCardsCount(): Promise<number> {
    return await this.statCards.count();
  }

  async getTableRowsCount(): Promise<number> {
    return await this.tableRows.count();
  }

  async assertPageLoaded() {
    await this.assertVisible(this.pageHeading);
  }

  async assertUsageStatsVisible() {
    await expect(this.statCards.first().or(this.totalRequestsCount)).toBeVisible();
  }

  async assertChartVisible() {
    const chartVisible = await this.usageChart.isVisible({ timeout: 5000 }).catch(() => false);
    expect(chartVisible).toBeTruthy();
  }

  async assertExportButtonVisible() {
    await this.assertVisible(this.exportButton);
  }
}
