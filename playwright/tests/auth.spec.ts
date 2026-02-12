import { test, expect } from "../fixtures";
import { SignInPage } from "../pages/signin.page";
import { SignUpPage } from "../pages/signup.page";
import { OnboardingPage } from "../pages/onboarding.page";
import { SidenavComponent } from "../components/sidenav.component";
import { HomePage } from "../pages/home.page";
import { seedDatabase, findUser } from "../helpers/database.helper";
import { DEFAULT_PASSWORD, SIGN_UP_USER } from "../data/users";
import { TEST_BANK_ACCOUNT } from "../data/bankaccounts";

test.describe("User Sign-up and Login", () => {
  test.beforeEach(async ({ apiRequest }) => {
    await seedDatabase(apiRequest);
  });

  test("should redirect unauthenticated user to signin page", async ({ page }) => {
    await page.goto("/personal");
    await expect(page).toHaveURL(/\/signin/);
  });

  test("should redirect to the home page after login", async ({ page, apiRequest }) => {
    const user = await findUser(apiRequest);
    const signInPage = new SignInPage(page);
    await signInPage.login(user.username, DEFAULT_PASSWORD, { rememberUser: true });
    await expect(page).toHaveURL("/");
  });

  test("should remember a user for 30 days after login", async ({ page, context, apiRequest }) => {
    const user = await findUser(apiRequest);
    const signInPage = new SignInPage(page);
    const sidenav = new SidenavComponent(page);

    await signInPage.login(user.username, DEFAULT_PASSWORD, { rememberUser: true });
    await expect(page).toHaveURL("/");

    const cookies = await context.cookies();
    const sessionCookie = cookies.find((c) => c.name === "connect.sid");
    expect(sessionCookie).toBeDefined();
    expect(sessionCookie!.expires).toBeGreaterThan(0);

    await sidenav.logout();
    await expect(page).toHaveURL(/\/signin/);
  });

  test("should allow a visitor to sign-up, login, and logout", async ({ page }) => {
    const signInPage = new SignInPage(page);
    const signUpPage = new SignUpPage(page);
    const onboarding = new OnboardingPage(page);
    const homePage = new HomePage(page);
    const sidenav = new SidenavComponent(page);

    // Sign up
    await signUpPage.goto();
    await expect(signUpPage.title()).toBeVisible();
    await expect(signUpPage.title()).toContainText("Sign Up");
    await signUpPage.signUp(
      SIGN_UP_USER.firstName,
      SIGN_UP_USER.lastName,
      SIGN_UP_USER.username,
      SIGN_UP_USER.password
    );

    // Login
    await signInPage.login(SIGN_UP_USER.username, SIGN_UP_USER.password);

    // Onboarding
    await expect(onboarding.dialog()).toBeVisible();
    await onboarding.nextButton().click();

    await expect(onboarding.dialogTitle()).toContainText("Create Bank Account");
    await onboarding.createBankAccount(
      TEST_BANK_ACCOUNT.bankName,
      TEST_BANK_ACCOUNT.accountNumber,
      TEST_BANK_ACCOUNT.routingNumber
    );

    await expect(onboarding.dialogTitle()).toContainText("Finished");
    await expect(onboarding.dialogContent()).toContainText("You're all set!");
    await onboarding.nextButton().click();

    await expect(homePage.transactionList()).toBeVisible();

    // Logout
    await sidenav.logout();
    await expect(page).toHaveURL(/\/signin/);
  });

  test("should display login errors", async ({ page }) => {
    const signInPage = new SignInPage(page);
    await signInPage.goto();

    await signInPage.usernameInput().fill("User");
    await signInPage.usernameInput().clear();
    await signInPage.usernameInput().blur();
    await expect(signInPage.usernameHelperText()).toBeVisible();
    await expect(signInPage.usernameHelperText()).toContainText("Username is required");

    await signInPage.passwordInput().fill("abc");
    await signInPage.passwordInput().blur();
    await expect(signInPage.passwordHelperText()).toBeVisible();
    await expect(signInPage.passwordHelperText()).toContainText(
      "Password must contain at least 4 characters"
    );

    await expect(signInPage.submitButton()).toBeDisabled();
  });

  test("should display signup errors", async ({ page }) => {
    const signUpPage = new SignUpPage(page);
    await signUpPage.goto();

    await signUpPage.firstNameInput().fill("First");
    await signUpPage.firstNameInput().clear();
    await signUpPage.firstNameInput().blur();
    await expect(signUpPage.firstNameHelperText()).toBeVisible();
    await expect(signUpPage.firstNameHelperText()).toContainText("First Name is required");

    await signUpPage.lastNameInput().fill("Last");
    await signUpPage.lastNameInput().clear();
    await signUpPage.lastNameInput().blur();
    await expect(signUpPage.lastNameHelperText()).toBeVisible();
    await expect(signUpPage.lastNameHelperText()).toContainText("Last Name is required");

    await signUpPage.usernameInput().fill("User");
    await signUpPage.usernameInput().clear();
    await signUpPage.usernameInput().blur();
    await expect(signUpPage.usernameHelperText()).toBeVisible();
    await expect(signUpPage.usernameHelperText()).toContainText("Username is required");

    await signUpPage.passwordInput().fill("password");
    await signUpPage.passwordInput().clear();
    await signUpPage.passwordInput().blur();
    await expect(signUpPage.passwordHelperText()).toBeVisible();
    await expect(signUpPage.passwordHelperText()).toContainText("Enter your password");

    await signUpPage.confirmPasswordInput().fill("DIFFERENT PASSWORD");
    await signUpPage.confirmPasswordInput().blur();
    await expect(signUpPage.confirmPasswordHelperText()).toBeVisible();
    await expect(signUpPage.confirmPasswordHelperText()).toContainText("Password does not match");

    await expect(signUpPage.submitButton()).toBeDisabled();
  });

  test("should display error for an invalid user", async ({ page }) => {
    const signInPage = new SignInPage(page);
    await signInPage.login("invalidUserName", "invalidPa$$word");
    await expect(signInPage.errorMessage()).toBeVisible();
    await expect(signInPage.errorMessage()).toHaveText("Username or password is invalid");
  });

  test("should display error for an invalid password for existing user", async ({
    page,
    apiRequest,
  }) => {
    const user = await findUser(apiRequest);
    const signInPage = new SignInPage(page);
    await signInPage.login(user.username, "INVALID");
    await expect(signInPage.errorMessage()).toBeVisible();
    await expect(signInPage.errorMessage()).toHaveText("Username or password is invalid");
  });
});
