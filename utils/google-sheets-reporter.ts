import type {
  FullResult,
  Reporter,
  TestCase,
  TestResult,
} from '@playwright/test/reporter';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

interface TestRow {
  testcaseId: string;
  testName: string;
  description: string;
  updateDateTime: string;
  status: string;
  reason: string;
  comment: string;
}

class GoogleSheetsReporter implements Reporter {
  private results: TestRow[] = [];
  private appsScriptUrl: string;

  constructor() {
    this.appsScriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL || '';
  }

  onTestEnd(test: TestCase, result: TestResult) {
    // Skip the auth setup test
    if (test.title === 'authenticate') return;

    // Extract TC ID and name from title like "TC_DASH_01 - Verify dashboard heading..."
    const titleMatch = test.title.match(/^(TC_\w+_\d+)\s*-\s*(.+)$/);
    const testcaseId = titleMatch ? titleMatch[1] : test.title;
    const testName = titleMatch ? titleMatch[2].trim() : test.title;

    // Build description from the test's parent suite + test name
    const suiteName = test.parent?.title || '';
    const description = `[${suiteName}] ${testName}`;

    // Format date/time: Feb 19, 2026 2:30 PM
    const now = new Date();
    const updateDateTime = now.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    // Status
    const status = result.status === 'passed' ? 'PASS' : result.status === 'skipped' ? 'SKIP' : 'FAIL';

    // Reason — layman-friendly error message for failures
    let reason = '';
    if (status === 'FAIL' && result.errors?.length > 0) {
      const rawError = result.errors[0]?.message || 'Unknown error';
      reason = this.simplifyError(rawError);
    }

    // Comment(proof) — screenshot path for failures
    let comment = '';
    if (status === 'PASS') {
      comment = 'Test passed successfully';
    } else if (status === 'FAIL') {
      const screenshot = result.attachments?.find(a => a.name === 'screenshot');
      if (screenshot?.path) {
        comment = `Screenshot: ${path.basename(screenshot.path)}`;
      } else {
        comment = 'No screenshot captured';
      }
    } else if (status === 'SKIP') {
      comment = 'Test was skipped';
    }

    this.results.push({
      testcaseId,
      testName,
      description,
      updateDateTime,
      status,
      reason,
      comment,
    });
  }

  async onEnd(_result: FullResult) {
    if (!this.appsScriptUrl) {
      console.log('\n⚠️  GOOGLE_APPS_SCRIPT_URL not set in .env — skipping Google Sheets update');
      console.log('   Deploy the Apps Script and add the URL to .env to enable reporting\n');
      this.printConsoleTable();
      return;
    }

    try {
      await this.pushToGoogleSheets();
      console.log(`\n✅ Google Sheets updated — ${this.results.length} test results pushed`);
    } catch (error: any) {
      console.error('\n❌ Failed to update Google Sheets:', error.message);
      this.printConsoleTable();
    }
  }

  private async pushToGoogleSheets() {
    const payload = JSON.stringify({ results: this.results });

    // Google Apps Script redirects POST → 302 → GET; handle manually
    const postResponse = await fetch(this.appsScriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: payload,
      redirect: 'follow',
    });

    // If we got redirected and the final response is OK, read it
    if (postResponse.ok) {
      const body = await postResponse.json() as { status: string; message?: string };
      if (body.status !== 'success') {
        throw new Error(body.message || 'Apps Script returned an error');
      }
      return;
    }

    // If redirect: 'follow' didn't work, try manual redirect
    if (postResponse.status >= 300 && postResponse.status < 400) {
      const redirectUrl = postResponse.headers.get('location');
      if (redirectUrl) {
        const getResponse = await fetch(redirectUrl);
        if (!getResponse.ok) {
          throw new Error(`HTTP ${getResponse.status}: ${getResponse.statusText}`);
        }
        const body = await getResponse.json() as { status: string; message?: string };
        if (body.status !== 'success') {
          throw new Error(body.message || 'Apps Script returned an error');
        }
        return;
      }
    }

    throw new Error(`HTTP ${postResponse.status}: ${postResponse.statusText}`);
  }

  private simplifyError(rawError: string): string {
    if (rawError.includes('toBeVisible') && rawError.includes('not found')) {
      const locatorMatch = rawError.match(/Locator: (.+)/);
      const element = locatorMatch ? locatorMatch[1].trim() : 'an element';
      return `Expected element was not visible on the page: ${element}`;
    }
    if (rawError.includes('toHaveURL')) {
      return 'Page did not navigate to the expected URL';
    }
    if (rawError.includes('Timeout')) {
      return 'Page or element took too long to load (timeout)';
    }
    if (rawError.includes('toContainText') || rawError.includes('toHaveText')) {
      return 'Text content on the page did not match expected value';
    }
    if (rawError.includes('toBeEnabled')) {
      return 'A button or input was disabled when it should have been enabled';
    }
    if (rawError.includes('net::ERR') || rawError.includes('Navigation')) {
      return 'Network error — page failed to load';
    }
    const firstLine = rawError.split('\n')[0].replace(/\[2m|\[22m|\[31m|\[39m/g, '').trim();
    return firstLine.length > 150 ? firstLine.substring(0, 150) + '...' : firstLine;
  }

  private printConsoleTable() {
    console.log('\n📋 Test Results Summary:');
    console.log('─'.repeat(90));
    console.log(
      'ID'.padEnd(14) +
      'Status'.padEnd(8) +
      'Test Name'.padEnd(60) +
      'Reason'
    );
    console.log('─'.repeat(90));
    for (const r of this.results) {
      const icon = r.status === 'PASS' ? '✅' : r.status === 'FAIL' ? '❌' : '⏭️';
      console.log(
        r.testcaseId.padEnd(14) +
        `${icon} ${r.status}`.padEnd(10) +
        r.testName.substring(0, 58).padEnd(60) +
        (r.reason || '-')
      );
    }
    console.log('─'.repeat(90));
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const skipped = this.results.filter(r => r.status === 'SKIP').length;
    console.log(`Total: ${this.results.length} | ✅ ${passed} passed | ❌ ${failed} failed | ⏭️ ${skipped} skipped\n`);
  }
}

export default GoogleSheetsReporter;
