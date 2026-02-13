import { test, expect } from "@playwright/test";
import { seedDatabase, findUser } from "../helpers/database";
import { login } from "../helpers/auth";
import { isMobile } from "../helpers/utils";
import { LoginPage } from "../pages/LoginPage";
// User type is imported from models but not directly used in this file

test.describe("User Login", () => {
  test.beforeEach(async () => {
    // Seed database before each test
    await seedDatabase();
  });

  test("should redirect unauthenticated user to signin page", async ({ page }) => {
    await page.goto("http://localhost:3000/personal");
    // Redirect is async (auth state must be resolved); wait up to 10s
    await expect(page).toHaveURL(/.*\/signin/, { timeout: 10000 });
  });

  test("should redirect to the home page after login", async ({ page }) => {
    const user = await findUser({});
    await login(page, user.username, "s3cret", { rememberUser: true });
    await expect(page).toHaveURL(/.*\/$/);
  });

  test("should remember a user for 30 days after login", async ({ page }) => {
    const user = await findUser({});
    await login(page, user.username, "s3cret", { rememberUser: true });

    // Verify Session Cookie has expiry property
    const cookies = await page.context().cookies();
    const sessionCookie = cookies.find((cookie) => cookie.name === "connect.sid");
    expect(sessionCookie).toBeDefined();
    expect(sessionCookie?.expires).toBeDefined();
    expect(sessionCookie?.expires).toBeGreaterThan(Date.now() / 1000);

    // Logout User
    if (isMobile(page)) {
      await page.getByTestId("sidenav-toggle").click();
    }
    await page.locator('[data-test="sidenav-signout"]').click();
    await expect(page).toHaveURL(/.*\/signin/);
  });

  test("should display login errors", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    // Test username required error
    await loginPage.usernameInput.type("User");
    await loginPage.usernameInput.clear();
    await loginPage.usernameInput.blur();
    await loginPage.assertUsernameRequiredError();

    // Test password min length error
    await loginPage.passwordInput.type("abc");
    await loginPage.passwordInput.blur();
    await loginPage.assertPasswordMinLengthError();

    // Verify submit button is disabled
    await expect(loginPage.submitButton).toBeDisabled();
  });

  test("should error for an invalid user", async ({ page }) => {
    await login(page, "invalidUserName", "invalidPa$$word");
    const loginPage = new LoginPage(page);
    await loginPage.assertInvalidCredentialsError();
  });

  test("should error for an invalid password for existing user", async ({ page }) => {
    const user = await findUser({});
    await login(page, user.username, "INVALID");
    const loginPage = new LoginPage(page);
    await loginPage.assertInvalidCredentialsError();
  });
});
