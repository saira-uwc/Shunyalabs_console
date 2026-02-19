import { Page, expect } from '@playwright/test';

/**
 * Wait for a toast/notification to appear and disappear
 */
export async function waitForToast(page: Page, text?: string, timeout: number = 5000): Promise<boolean> {
  const toastSelector = '[class*="toast"], [role="status"], [role="alert"], [class*="notification"]';
  try {
    const toast = text
      ? page.locator(`${toastSelector}:has-text("${text}")`)
      : page.locator(toastSelector);
    await toast.waitFor({ state: 'visible', timeout });
    return true;
  } catch {
    return false;
  }
}

/**
 * Generate a unique name with a timestamp suffix
 */
export function generateUniqueName(prefix: string): string {
  return `${prefix}-${Date.now()}`;
}

/**
 * Dismiss any modal/dialog if present
 */
export async function dismissModalIfPresent(page: Page): Promise<void> {
  const closeButton = page.locator('[aria-label="Close"], button:has-text("Close"), button:has-text("Cancel")').first();
  const isVisible = await closeButton.isVisible({ timeout: 2000 }).catch(() => false);
  if (isVisible) {
    await closeButton.click();
    await page.waitForTimeout(500);
  }
}

/**
 * Wait for network to be idle after an action
 */
export async function waitForNetworkIdle(page: Page, timeout: number = 5000): Promise<void> {
  await page.waitForLoadState('networkidle', { timeout });
}

/**
 * Check if an element exists in the DOM (even if hidden)
 */
export async function elementExists(page: Page, selector: string): Promise<boolean> {
  const count = await page.locator(selector).count();
  return count > 0;
}

/**
 * Scroll element into view and click
 */
export async function scrollAndClick(page: Page, selector: string): Promise<void> {
  const element = page.locator(selector);
  await element.scrollIntoViewIfNeeded();
  await element.click();
}

/**
 * Wait for a URL change (useful after form submissions)
 */
export async function waitForURLChange(page: Page, previousURL: string, timeout: number = 10000): Promise<void> {
  await expect(page).not.toHaveURL(previousURL, { timeout });
}

/**
 * Retry an async action up to N times
 */
export async function retry<T>(fn: () => Promise<T>, retries: number = 3, delay: number = 1000): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('Max retries reached');
}

/**
 * Format a date for usage in date pickers
 */
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Get date N days ago
 */
export function daysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}
