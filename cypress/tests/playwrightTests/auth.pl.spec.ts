import { test, expect } from "@playwright/test";
import LoginPage from "../../../src/pages/login_page";
import BasePage from "../../../src/pages/base_page";
import { faker } from "@faker-js/faker";
let loginPage: LoginPage;
let basePage: BasePage;

test.beforeEach(async ({ page }) => {
  loginPage = new LoginPage(page);
  basePage = new BasePage(page);
  await page.goto("/");
});

test("should redirect unauthenticated user to signin page", async ({ page }) => {
  await page.goto("/personal");
  expect(page.url()).toBe("http://localhost:3000/signin");
  await page.screenshot({ path: "redirect-to-signin.png" });
});

test("should display login errors", async ({ page }) => {
  await loginPage.login("User");
  await basePage.clearAndBlur(loginPage.usernameField);
  await expect(loginPage.usernameError).toHaveText(/Username is required/);
  await page.screenshot({ path: "display-username-required-error.png" });
  await basePage.fillField(loginPage.passwordField, "abc");
  await loginPage.passwordField.blur();
  await expect(loginPage.passwordError).toHaveText("Password must contain at least 4 characters");
  await page.screenshot({ path: "display-password-error.png" });

  await expect(loginPage.submitButton).toBeDisabled();
  await page.screenshot({ path: "sign-in-submit-disabled.png" });
});

test("should show error for an invalid user", async ({ page }) => {
  await loginPage.login("invalidUserName", "invalidPa$$word");
  await basePage.clickOnElement(loginPage.submitButton);
  await expect(loginPage.signInError).toBeVisible();
  await expect(loginPage.signInError).toHaveText("Username or password is invalid");
  await page.screenshot({
    path: "sign-in-invalid-username-password-error.png",
  });
});

test("should allow a visitor to sign-up, login, and logout", async ({ page }) => {
  const userInfo = {
    firstName: faker.internet.userName(),
    lastName: faker.word.noun(),
    username: faker.word.adverb(4),
    password: faker.internet.password(),
  };

  // Sign-up User
  await basePage.clickOnElement(loginPage.signupButton);
  await basePage.clickOnElement(loginPage.signupButton);
  await expect(loginPage.signupTitle).toBeVisible();
  await basePage.fillField(loginPage.signupFirstName, userInfo.firstName);
  await basePage.fillField(loginPage.signupLastName, userInfo.lastName);
  await basePage.fillField(loginPage.signupUsername, userInfo.username);
  await basePage.fillField(loginPage.signupPassword, userInfo.password);
  await basePage.fillField(loginPage.signupConfirmPassword, userInfo.password);
  await basePage.clickOnElement(loginPage.signupSubmit);

  // Login User
  await loginPage.login(userInfo.username, userInfo.password);
  await basePage.clickOnElement(loginPage.submitButton);

  // Onboarding
  await expect(loginPage.userOnboardingDialog).toBeVisible();
  await expect(loginPage.listSkeleton).not.toBeVisible();
  await expect(loginPage.navTopNotificationsCount).toBeVisible();
  await basePage.clickOnElement(loginPage.userOnboardingNext);
  await expect(loginPage.userOnboardingDialogTitle).toContainText("Create Bank Account");
  await basePage.fillField(loginPage.bankNameInput, "The Best Bank");
  await basePage.fillField(loginPage.accountNumberInput, "123456789");
  await basePage.fillField(loginPage.routingNumberInput, "987654321");
  await basePage.clickOnElement(loginPage.bunkSubmitButton);
  await expect(loginPage.userOnboardingDialogTitle).toContainText("Finished");
  await expect(loginPage.userOnboardingDialogContent).toContainText("You're all set!");
  await basePage.clickOnElement(loginPage.userOnboardingNext);
  await expect(loginPage.transactionList).toBeVisible();

  // Logout User
  await basePage.clickOnElement(loginPage.sidenavSignout);
  await page.waitForURL("/signin");
});
