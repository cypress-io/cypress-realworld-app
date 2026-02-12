import { Page } from "@playwright/test";

export class SignUpPage {
  constructor(private page: Page) {}

  title = () => this.page.locator("[data-test=signup-title]");
  firstNameInput = () => this.page.locator("[data-test=signup-first-name] input");
  lastNameInput = () => this.page.locator("[data-test=signup-last-name] input");
  usernameInput = () => this.page.locator("[data-test=signup-username] input");
  passwordInput = () => this.page.locator("[data-test=signup-password] input");
  confirmPasswordInput = () => this.page.locator("[data-test=signup-confirmPassword] input");
  submitButton = () => this.page.locator("[data-test=signup-submit]");
  firstNameHelperText = () => this.page.locator("#firstName-helper-text");
  lastNameHelperText = () => this.page.locator("#lastName-helper-text");
  usernameHelperText = () => this.page.locator("#username-helper-text");
  passwordHelperText = () => this.page.locator("#password-helper-text");
  confirmPasswordHelperText = () => this.page.locator("#confirmPassword-helper-text");

  async goto() {
    await this.page.goto("/signup");
  }

  async signUp(firstName: string, lastName: string, username: string, password: string) {
    await this.firstNameInput().fill(firstName);
    await this.lastNameInput().fill(lastName);
    await this.usernameInput().fill(username);
    await this.passwordInput().fill(password);
    await this.confirmPasswordInput().fill(password);
    await this.submitButton().click();
  }
}
