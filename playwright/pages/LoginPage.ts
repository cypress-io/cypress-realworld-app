import { expect, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  // Selectors
  readonly usernameInput:Locator;
  readonly passwordInput:Locator;
  readonly loginButton:Locator;
  readonly rememberMeCheckbox:Locator;
  readonly errorMessage:Locator;
  readonly usernameHelperText:Locator;
  readonly passwordHelperText:Locator;

  constructor(page: any) {
    super(page);
    this.usernameInput = this.page.locator('#username');
    this.passwordInput = this.page.locator('#password');
    this.loginButton = this.page.getByTestId('signin-submit');
    this.rememberMeCheckbox = this.page.getByTestId('signin-remember-me');
    this.errorMessage = this.page.getByTestId('signin-error');
    this.usernameHelperText = this.page.locator('#username-helper-text');
    this.passwordHelperText = this.page.locator('#password-helper-text');
  }

  /**
   * Navigate to the login page
   */
  async navigate() {
    await this.goto('/signin');
  }

  /**
   * Perform complete login flow
   */
  async login(username: string, password: string, rememberMe: boolean = false) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    
    if (rememberMe) {
      await this.rememberMeCheckbox.check();
    }
    
    await this.loginButton.click();
    await this.page.waitForURL('http://localhost:3000/');
  }


  /**
   * Fill username field (for individual field testing)
   */
  async fillUsername(username: string) {
    await this.usernameInput.fill(username);
  }

  /**
   * Clear username field (for validation testing)
   */
  async clearUsername() {
    await this.usernameInput.clear();
  }

  /**
   * Fill password field (for individual field testing)
   */
  async fillPassword(password: string) {
    await this.passwordInput.fill(password);
  }

  /**
   * Blur the username field (triggers validation)
   */
  async blurUsername() {
    await this.usernameInput.blur();
  }

  /**
   * Blur the password field (triggers validation)
   */
  async blurPassword() {
    await this.passwordInput.blur();
  }

  /**
   * Attempt login with invalid credentials
   */
  async loginWithInvalidCredentials(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  /**
   * Assert that error message is visible and contains specific text
   */
  async expectErrorMessageToBeVisible(expectedText?: string) {
    await expect(this.errorMessage).toBeVisible();
    if (expectedText) {
      await expect(this.errorMessage).toContainText(expectedText);
    }
  }

  /**
   * Assert that username helper text is visible and contains specific text
   */
  async expectUsernameHelperTextToBeVisible(expectedText?: string) {
    await expect(this.usernameHelperText).toBeVisible();
    if (expectedText) {
      await expect(this.usernameHelperText).toContainText(expectedText);
    }
  }

  /**
   * Assert that password helper text is visible and contains specific text
   */
  async expectPasswordHelperTextToBeVisible(expectedText?: string) {
    await expect(this.passwordHelperText).toBeVisible();
    if (expectedText) {
      await expect(this.passwordHelperText).toContainText(expectedText);
    }
  }

  /**
   * Assert that login button is disabled
   */
  async expectLoginButtonToBeDisabled() {
    await expect(this.loginButton).toBeDisabled();
  }

}
