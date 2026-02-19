import * as dotenv from 'dotenv';
dotenv.config();

export const TEST_CONFIG = {
  baseURL: process.env.BASE_URL || 'https://console.shunyalabs.ai',
  loginURL: process.env.LOGIN_URL || 'https://console.shunyalabs.ai/auth/sign-in',
  credentials: {
    email: process.env.TEST_EMAIL || 'sairaqc+clerk_test@tmail.com',
    password: process.env.TEST_PASSWORD || 'Sairaqc@12345',
  },
};

export const API_KEY_DATA = {
  validKeyName: 'Test-API-Key',
  duplicateKeyName: 'Test-API-Key',
  longKeyName: 'A'.repeat(100),
  specialCharsKeyName: 'test-key_123',
  emptyKeyName: '',
};

export const CONTACT_FORM_DATA = {
  valid: {
    name: 'Test User',
    email: 'sairaqc+clerk_test@tmail.com',
    subject: 'Automation Test Query',
    message: 'This is an automated test message sent via Playwright automation suite.',
  },
  invalid: {
    name: '',
    email: 'invalid-email',
    message: '',
  },
  longMessage: {
    name: 'Test User',
    email: 'sairaqc+clerk_test@tmail.com',
    message: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(20),
  },
};

export const SETTINGS_DATA = {
  profile: {
    firstName: 'Test',
    lastName: 'User',
    displayName: 'Test Automation User',
  },
  organization: {
    name: 'Shunya Labs Test Org',
  },
  team: {
    inviteEmail: 'invite+test@tmail.com',
  },
};

export const ONBOARDING_DATA = {
  workspaceName: 'Automation Workspace',
};

export const ROUTES = {
  home: '/',
  login: '/auth/sign-in',
  onboarding: '/onboarding',
  dashboard: '/dashboard',
  apiKeys: '/api-keys',
  billing: '/billing',
  contactUs: '/contact',
  settings: '/settings',
  usage: '/usage/overview',
  usageLogs: '/usage/logs',
};
