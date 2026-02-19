import { test as setup } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { TEST_CONFIG } from '../utils/testData';
import * as path from 'path';

const authFile = path.join(__dirname, '../playwright/.auth/user.json');

setup('authenticate', async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.login(TEST_CONFIG.credentials.email, TEST_CONFIG.credentials.password);
  await loginPage.assertLoggedIn();

  // Save signed-in state for all subsequent tests
  await page.context().storageState({ path: authFile });
  console.log('✅ Authentication state saved to:', authFile);
});
