import { Page } from "@playwright/test";

export class OnboardingPage {
  constructor(private page: Page) {}

  dialog = () => this.page.locator("[data-test=user-onboarding-dialog]");
  dialogTitle = () => this.page.locator("[data-test=user-onboarding-dialog-title]");
  dialogContent = () => this.page.locator("[data-test=user-onboarding-dialog-content]");
  nextButton = () => this.page.locator("[data-test=user-onboarding-next]");
  bankNameInput = () => this.page.locator("[data-test*=bankName-input] input");
  accountNumberInput = () => this.page.locator("[data-test*=accountNumber-input] input");
  routingNumberInput = () => this.page.locator("[data-test*=routingNumber-input] input");
  submitButton = () => this.page.locator("[data-test*=submit]");

  async createBankAccount(bankName: string, accountNumber: string, routingNumber: string) {
    await this.bankNameInput().fill(bankName);
    await this.accountNumberInput().fill(accountNumber);
    await this.routingNumberInput().fill(routingNumber);
    await this.submitButton().click();
  }
}
