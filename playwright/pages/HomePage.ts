import { expect, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class HomePage extends BasePage {
  readonly signOutButton: Locator;
  readonly notificationsCount: Locator;
  readonly userOnboardingDialog: Locator;
  readonly userOnboardingNext: Locator;
  readonly userOnboardingDialogTitle: Locator;
  readonly userOnboardingDialogContent: Locator;
  readonly listSkeleton: Locator;
  readonly transactionList: Locator;
  readonly bankNameInput: Locator;
  readonly routingNumberInput: Locator;
  readonly accountNumberInput: Locator;
  readonly bankAccountSubmit: Locator;

  constructor(page: any) {
    super(page);
    this.signOutButton = this.page.getByTestId('sidenav-signout');
    this.notificationsCount = this.page.getByTestId('nav-top-notifications-count');
    this.userOnboardingDialog = this.page.getByTestId('user-onboarding-dialog');
    this.userOnboardingNext = this.page.getByTestId('user-onboarding-next');
    this.userOnboardingDialogTitle = this.page.getByTestId('user-onboarding-dialog-title');
    this.userOnboardingDialogContent = this.page.getByTestId('user-onboarding-dialog-content');
    this.listSkeleton = this.page.getByTestId('list-skeleton');
    this.transactionList = this.page.getByTestId('transaction-list');
    this.bankNameInput = this.page.locator('#bankaccount-bankName-input');
    this.routingNumberInput = this.page.locator('#bankaccount-routingNumber-input');
    this.accountNumberInput = this.page.locator('#bankaccount-accountNumber-input');
    this.bankAccountSubmit = this.page.getByTestId('bankaccount-submit');
  }


  /**
   * Navigate to personal transactions page
   */
  async navigateToPersonal() {
    await this.goto('/personal');
  }


  /**
   * Perform logout action
   */
  async logout() {
    await this.signOutButton.click();
    await this.expectToHaveUrl(/.*signin/);
  }


  /**
   * Click the user onboarding next button
   */
  async clickUserOnboardingNext() {
    await this.userOnboardingNext.click();
  }

  /**
   * Complete bank account creation
   */
  async createBankAccount(bankName: string, routingNumber: string, accountNumber: string) {
    await this.bankNameInput.fill(bankName);
    await this.routingNumberInput.fill(routingNumber);
    await this.accountNumberInput.fill(accountNumber);
    await this.bankAccountSubmit.click();
  }


  /**
   * Assert that user onboarding dialog is visible
   */
  async expectUserOnboardingDialogToBeVisible() {
    await expect(this.userOnboardingDialog).toBeVisible();
  }

  /**
   * Assert that list skeleton is not visible
   */
  async expectListSkeletonToNotBeVisible() {
    await expect(this.listSkeleton).not.toBeVisible();
  }

  /**
   * Assert that nav top notifications count is visible
   */
  async expectNavTopNotificationsCountToBeVisible() {
    await expect(this.notificationsCount).toBeVisible();
  }

  /**
   * Assert that transaction list is visible
   */
  async expectTransactionListToBeVisible() {
    await expect(this.transactionList).toBeVisible();
  }

  /**
   * Assert that user onboarding dialog title contains specific text
   */
  async expectUserOnboardingDialogTitleToContainText(expectedText: string) {
    await expect(this.userOnboardingDialogTitle).toContainText(expectedText);
  }

  /**
   * Assert that user onboarding dialog content contains specific text
   */
  async expectUserOnboardingDialogContentToContainText(expectedText: string) {
    await expect(this.userOnboardingDialogContent).toContainText(expectedText);
  }


  /**
   * Assert that we are redirected to signin page (for unauthenticated users)
   */
  async expectToBeRedirectedToSignin() {
    await this.expectToHaveUrl(/.*signin/);
  }
  async navigateToNotifications() {
    await this.goto('/notifications');
  }
  async navigateToContacts() {
    await this.goto('/contacts');
  }
  async navigateToUserSettings() {
    await this.goto('/user-settings');
  }
  async navigateToCreateTransaction() {
    await this.goto('/create-transaction');
  }
}
