import { Page } from "@playwright/test";

export class SignInPage {
  constructor(private page: Page) {}

  usernameInput = () => this.page.locator("[data-test=signin-username] input");
  passwordInput = () => this.page.locator("[data-test=signin-password] input");
  rememberMeCheckbox = () => this.page.locator("[data-test=signin-remember-me] input");
  submitButton = () => this.page.locator("[data-test=signin-submit]");
  errorMessage = () => this.page.locator("[data-test=signin-error]");
  usernameHelperText = () => this.page.locator("#username-helper-text");
  passwordHelperText = () => this.page.locator("#password-helper-text");
  signUpLink = () => this.page.locator("[data-test=signup]");

  async goto() {
    await this.page.goto("/signin");
  }

  async login(username: string, password: string, { rememberUser = false } = {}) {
    await this.goto();
    await this.usernameInput().fill(username);
    await this.passwordInput().fill(password);
    if (rememberUser) {
      await this.rememberMeCheckbox().check();
    }
    await this.submitButton().click();
  }
}
