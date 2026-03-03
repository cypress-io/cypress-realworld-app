import { UrlPath } from "../../providers/url-path";
import { SignInPage } from "../../pages/signin.page";
import { expect, test } from "../../fixtures";
import { SideNavPage } from "../../pages/side-nav.page";
import { defaultUserData, PASSWORD } from "../../const/user-data";
import { SignUpPage } from "../../pages/signup.page";
import { OnboardingPage } from "../../pages/onboarding.page";
import { HomePage } from "../../pages/home.page";
import { defaultBankAccountData } from "../../const/bank-account-data";
import { seedDatabase } from "../../utils/database.utils";

test.describe.serial("User Sign-up and Login", () => {
  test.beforeEach(async ({ apiRequest }) => {
    await seedDatabase(apiRequest);
  });

  test("should redirect unauthenticated user to signin page", async ({ page }) => {
    await page.goto(UrlPath.personal);

    await expect(page).toHaveURL(/\/signin$/);
  });

  test("should redirect to the home page after login", async ({ page, user }) => {
    const signInPage = new SignInPage(page);
    await signInPage.login(user.username, PASSWORD, { rememberUser: true });

    await expect(page).toHaveURL(/\/$/);
  });

  test("should remember a user for 30 days after login", async ({ page, user, isMobile }) => {
    const signInPage = new SignInPage(page);
    await signInPage.login(user.username, PASSWORD, { rememberUser: true });
    await page.waitForURL(/\/$/);

    // Verify Session Cookie
    const cookies = await page.context().cookies();
    const sessionCookie = cookies.find((cookie) => cookie.name === "connect.sid");

    expect(sessionCookie?.expires).toBeGreaterThan(0);

    // Logout User
    const sideNavPage = new SideNavPage(page);
    await sideNavPage.signOut(isMobile);

    await expect(page).toHaveURL(/\/signin$/);
  });

  test("hould allow a visitor to sign-up, login, and logout", async ({ page, user, isMobile }) => {
    await page.goto("/");
    await page.waitForURL(/\/$/);

    // Sign-up User
    const signInPage = new SignInPage(page);
    await signInPage.username.input.blur();
    await signInPage.signUpLink.click();

    const signUpPage = new SignUpPage(page);
    await expect(signUpPage.title).toBeVisible();
    await expect(signUpPage.title).toHaveText("Sign Up");

    await signUpPage.signUp(defaultUserData);

    // Login User
    await signInPage.login(defaultUserData.username, defaultUserData.password);

    // Onboarding
    const onboardingPage = new OnboardingPage(page);
    await expect(onboardingPage.context).toBeVisible();
    await expect(onboardingPage.nextButton).toBeVisible();

    await onboardingPage.nextButton.click();
    await expect(onboardingPage.title).toHaveText("Create Bank Account");

    await onboardingPage.fillBankAccount(defaultBankAccountData);
    await expect(onboardingPage.title).toHaveText("Finished");
    await expect(onboardingPage.context).toContainText("You're all set!");
    await onboardingPage.nextButton.click();

    const homePage = new HomePage(page);
    await expect(homePage.transactions).toBeVisible();

    // Logout User
    const sideNavPage = new SideNavPage(page);
    await sideNavPage.signOut(isMobile);

    await expect(page).toHaveURL(/\/signin$/);
  });

  test("should display login errors", async ({ page }) => {
    await page.goto("/");

    const signInPage = new SignInPage(page);
    await signInPage.username.input.fill("User");
    await signInPage.username.input.clear();
    await signInPage.username.input.blur();
    await expect(signInPage.username.errorMessage).toBeVisible();
    await expect(signInPage.username.errorMessage).toHaveText("Username is required");

    await signInPage.password.input.fill("abc");
    await signInPage.password.input.blur();
    await expect(signInPage.password.errorMessage).toBeVisible();
    await expect(signInPage.password.errorMessage).toContainText(
      "Password must contain at least 4 characters"
    );

    await expect(signInPage.signInButton).toBeDisabled();
  });

  test("should display signup errors", async ({ page }) => {
    await page.goto(UrlPath.signup);

    const signUpPage = new SignUpPage(page);

    await signUpPage.firstName.input.fill("First");
    await signUpPage.firstName.input.clear();
    await signUpPage.firstName.input.blur();
    await expect(signUpPage.firstName.errorMessage).toHaveText("First Name is required");

    await signUpPage.lastName.input.fill("Last");
    await signUpPage.lastName.input.clear();
    await signUpPage.lastName.input.blur();
    await expect(signUpPage.lastName.errorMessage).toHaveText("Last Name is required");

    await signUpPage.username.input.fill("User");
    await signUpPage.username.input.clear();
    await signUpPage.username.input.blur();
    await expect(signUpPage.username.errorMessage).toHaveText("Username is required");

    await signUpPage.password.input.fill("password");
    await signUpPage.password.input.clear();
    await signUpPage.password.input.blur();
    await expect(signUpPage.password.errorMessage).toHaveText("Enter your password");

    await signUpPage.confirmPassword.input.fill("DIFFERENT PASSWORD");
    await signUpPage.confirmPassword.input.blur();
    await expect(signUpPage.confirmPassword.errorMessage).toHaveText("Password does not match");
    await expect(signUpPage.signUpButton).toBeDisabled();
  });

  test("should error for an invalid user", async ({ page }) => {
    const signInPage = new SignInPage(page);
    await signInPage.login("invalidUserName", "invalidPa$$word");

    await expect(signInPage.errorMessage).toBeVisible();
    await expect(signInPage.errorMessage).toHaveText("Username or password is invalid");
  });

  test("should error for an invalid password for existing user", async ({ page, user }) => {
    const signInPage = new SignInPage(page);
    await signInPage.login(user.username, "INVALID");

    await expect(signInPage.errorMessage).toBeVisible();
    await expect(signInPage.errorMessage).toHaveText("Username or password is invalid");
  });
});
