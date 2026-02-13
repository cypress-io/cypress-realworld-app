import { Page, Locator, expect } from "@playwright/test";

export class LoginPage {
  readonly page: Page;

  readonly usernameContainer: Locator;
  readonly usernameInput: Locator;
  readonly passwordContainer: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly rememberMeCheckbox: Locator;
  readonly usernameError: Locator;
  readonly passwordError: Locator;
  readonly signinError: Locator;

  constructor(page: Page) {
    this.page = page;

    // Containers use data-test selectors, input is nested inside
    this.usernameInput = page.locator("#username");

    this.passwordInput = page.locator("#password");

    this.submitButton = page.locator('[data-test="signin-submit"]');

    // The remember-me checkbox uses data-test="signin-remember-me" selector
    this.rememberMeCheckbox = page.getByRole("checkbox");

    // Helper text and error message selectors are based on the Cypress tests
    this.usernameError = page.locator("#username-helper-text");
    this.passwordError = page.locator("#password-helper-text");
    this.signinError = page.getByTestId("signin-error");
  }

  async goto() {
    // Use absolute URL so navigation works even if Playwright baseURL is not applied
    await this.page.goto("http://localhost:3000/signin");
  }

  async login(username: string, password: string, options?: { rememberMe?: boolean }) {
    // Navigate to signin if not already there (matching Cypress cy.login behavior)
    const currentPath = new URL(this.page.url()).pathname;
    if (currentPath !== "/signin") {
      await this.goto();
    }

    // Wait for the signin form to be visible before filling (avoids timeout on slow load)
    await this.usernameInput.waitFor({ state: "visible", timeout: 30000 });
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);

    if (options?.rememberMe !== undefined) {
      const checked = await this.rememberMeCheckbox.isChecked();
      if (checked !== options.rememberMe) {
        await this.rememberMeCheckbox.click();
      }
    }

    await this.submitButton.click();
  }

  async assertUsernameRequiredError() {
    await expect(this.usernameError).toBeVisible();
    await expect(this.usernameError).toContainText("Username is required");
  }

  async assertPasswordMinLengthError() {
    await expect(this.passwordError).toBeVisible();
    await expect(this.passwordError).toContainText("Password must contain at least 4 characters");
  }

  async assertInvalidCredentialsError() {
    await expect(this.signinError).toBeVisible();
    await expect(this.signinError).toHaveText("Username or password is invalid");
  }
}

