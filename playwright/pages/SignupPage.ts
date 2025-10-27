import { expect, Locator } from '@playwright/test';
import { BasePage } from './BasePage';


export class SignupPage extends BasePage {
  // Selectors
  readonly firstNameInput:Locator   ;
  readonly lastNameInput:Locator;
  readonly usernameInput:Locator;
  readonly passwordInput:Locator;
  readonly confirmPasswordInput:Locator;
  readonly signupButton:Locator;
  readonly firstNameHelperText:Locator;
  readonly lastNameHelperText:Locator;
  readonly usernameHelperText:Locator;
  readonly passwordHelperText:Locator;
  readonly confirmPasswordHelperText:Locator;

  constructor(page: any) {
    super(page);
    this.firstNameInput = this.page.locator('#firstName');
    this.lastNameInput = this.page.locator('#lastName');
    this.usernameInput = this.page.locator('#username');
    this.passwordInput = this.page.locator('#password');
    this.confirmPasswordInput = this.page.locator('#confirmPassword');
    this.signupButton = this.page.getByTestId('signup-submit');
    this.firstNameHelperText = this.page.locator('#firstName-helper-text');
    this.lastNameHelperText = this.page.locator('#lastName-helper-text');
    this.usernameHelperText = this.page.locator('#username-helper-text');
    this.passwordHelperText = this.page.locator('#password-helper-text');
    this.confirmPasswordHelperText = this.page.locator('#confirmPassword-helper-text');
  }

  /**
   * Navigate to the signup page
   */
  async navigate() {
    await this.goto('/signup');
  }

  /**
   * Fill in the first name field
   */
  async fillFirstName(firstName: string) {
    await this.firstNameInput.fill(firstName);
  }

  /**
   * Fill in the last name field
   */
  async fillLastName(lastName: string) {
    await this.lastNameInput.fill(lastName);
  }

  /**
   * Fill in the username field
   */
  async fillUsername(username: string) {
    await this.usernameInput.fill(username);
  }

  /**
   * Fill in the password field
   */
  async fillPassword(password: string) {
    await this.passwordInput.fill(password);
  }

  /**
   * Fill in the confirm password field
   */
  async fillConfirmPassword(password: string) {
    await this.confirmPasswordInput.fill(password);
  }


  /**
   * Clear the first name field
   */
  async clearFirstName() {
    await this.firstNameInput.clear();
  }

  /**
   * Clear the last name field
   */
  async clearLastName() {
    await this.lastNameInput.clear();
  }

  /**
   * Clear the username field
   */
  async clearUsername() {
    await this.usernameInput.clear();
  }

  /**
   * Clear the password field
   */
  async clearPassword() {
    await this.passwordInput.clear();
  }

  /**
   * Clear the confirm password field
   */
  async clearConfirmPassword() {
    await this.confirmPasswordInput.clear();
  }

  /**
   * Blur the first name field (triggers validation)
   */
  async blurFirstName() {
    await this.firstNameInput.blur();
  }

  /**
   * Blur the last name field (triggers validation)
   */
  async blurLastName() {
    await this.lastNameInput.blur();
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
   * Blur the confirm password field (triggers validation)
   */
  async blurConfirmPassword() {
    await this.confirmPasswordInput.blur();
  }

  /**
   * Perform complete signup action
   */
  async signup(firstName: string, lastName: string, username: string, password: string) {
    await this.fillFirstName(firstName);
    await this.fillLastName(lastName);
    await this.fillUsername(username);
    await this.fillPassword(password);
    await this.fillConfirmPassword(password);
    await this.signupButton.click();
  }

  /**
   * Assert that first name helper text is visible and contains specific text
   */
  async expectFirstNameHelperTextToBeVisible(expectedText?: string) {
    await expect(this.firstNameHelperText).toBeVisible();
    if (expectedText) {
      await expect(this.firstNameHelperText).toContainText(expectedText);
    }
  }

  /**
   * Assert that last name helper text is visible and contains specific text
   */
  async expectLastNameHelperTextToBeVisible(expectedText?: string) {
    await expect(this.lastNameHelperText).toBeVisible();
    if (expectedText) {
      await expect(this.lastNameHelperText).toContainText(expectedText);
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
   * Assert that confirm password helper text is visible and contains specific text
   */
  async expectConfirmPasswordHelperTextToBeVisible(expectedText?: string) {
    await expect(this.confirmPasswordHelperText).toBeVisible();
    if (expectedText) {
      await expect(this.confirmPasswordHelperText).toContainText(expectedText);
    }
  }

  /**
   * Assert that signup button is disabled
   */
  async expectSignupButtonToBeDisabled() {
    await expect(this.signupButton).toBeDisabled();
  }


  /**
   * Assert that we are on the signin page (after successful signup)
   */
  async expectToBeOnSigninPage() {
    await this.expectToHaveUrl(/.*signin/);
  }
}
