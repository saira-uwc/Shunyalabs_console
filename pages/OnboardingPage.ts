import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class OnboardingPage extends BasePage {
  // Onboarding step locators
  readonly onboardingContainer = this.page.locator('[data-testid="onboarding"], .onboarding, [class*="onboarding"]');
  readonly nextButton = this.page.locator('button:has-text("Next"), button:has-text("Continue"), button:has-text("Get Started")');
  readonly skipButton = this.page.locator('button:has-text("Skip"), a:has-text("Skip")');
  readonly finishButton = this.page.locator('button:has-text("Finish"), button:has-text("Done"), button:has-text("Complete")');
  readonly progressIndicator = this.page.locator('[class*="progress"], [data-testid="progress"]');
  readonly stepTitle = this.page.locator('h1, h2, [class*="step-title"], [class*="onboarding-title"]');

  // Workspace / Organization name step
  readonly workspaceNameInput = this.page.locator('input[name="name"], input[placeholder*="workspace"], input[placeholder*="organization"]');

  // Role selection
  readonly roleOptions = this.page.locator('[class*="role-option"], [data-testid*="role"]');

  // Use case selection
  readonly useCaseOptions = this.page.locator('[class*="use-case"], [data-testid*="usecase"]');

  constructor(page: Page) {
    super(page);
  }

  async navigateToOnboarding() {
    await this.page.goto('/onboarding');
    await this.waitForPageLoad();
  }

  async isOnboardingPresent(): Promise<boolean> {
    return await this.onboardingContainer.isVisible({ timeout: 5000 }).catch(() => false);
  }

  async clickNext() {
    await this.clickElement(this.nextButton);
    await this.page.waitForTimeout(500);
  }

  async clickSkip() {
    await this.clickElement(this.skipButton);
    await this.page.waitForTimeout(500);
  }

  async clickFinish() {
    await this.clickElement(this.finishButton);
    await this.waitForPageLoad();
  }

  async fillWorkspaceName(name: string) {
    await this.fillInput(this.workspaceNameInput, name);
  }

  async selectRole(roleIndex: number = 0) {
    const options = await this.roleOptions.all();
    if (options.length > roleIndex) {
      await options[roleIndex].click();
    }
  }

  async selectUseCase(useCaseIndex: number = 0) {
    const options = await this.useCaseOptions.all();
    if (options.length > useCaseIndex) {
      await options[useCaseIndex].click();
    }
  }

  async completeOnboarding(workspaceName: string = 'Test Workspace') {
    if (await this.workspaceNameInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await this.fillWorkspaceName(workspaceName);
    }

    let maxSteps = 10;
    while (maxSteps > 0) {
      const nextVisible = await this.nextButton.isVisible({ timeout: 2000 }).catch(() => false);
      const finishVisible = await this.finishButton.isVisible({ timeout: 2000 }).catch(() => false);

      if (finishVisible) {
        await this.clickFinish();
        break;
      } else if (nextVisible) {
        await this.clickNext();
      } else {
        break;
      }
      maxSteps--;
    }
  }

  async skipOnboarding() {
    const skipVisible = await this.skipButton.isVisible({ timeout: 3000 }).catch(() => false);
    if (skipVisible) {
      await this.clickSkip();
    }
  }

  async assertOnboardingVisible() {
    await this.assertVisible(this.onboardingContainer);
  }

  async assertOnboardingCompleted() {
    await expect(this.page).not.toHaveURL(/onboarding/);
  }

  async getStepTitle(): Promise<string> {
    return await this.getText(this.stepTitle);
  }
}
