import { Page } from "playwright";

class LoginPage {
  page: Page;
  usernameField;
  passwordField;
  submitButton;
  usernameError;
  passwordError;
  signInError;
  signupButton;
  signupTitle;
  signupFirstName;
  signupLastName;
  signupUsername;
  signupPassword;
  signupConfirmPassword;
  signupSubmit;
  userOnboardingDialog;
  listSkeleton;
  navTopNotificationsCount;
  userOnboardingNext;
  userOnboardingDialogTitle;
  userOnboardingDialogContent;
  bankNameInput;
  accountNumberInput;
  sidenavSignout;
  transactionList;
  routingNumberInput;
  sidenavToggle;
  bunkSubmitButton;

  constructor(page: Page) {
    this.page = page;
    this.usernameField = page.locator('//input[@id="username"]');
    this.passwordField = page.getByLabel("Password");
    this.submitButton = page.locator('[data-test="signin-submit"]');
    this.usernameError = page.locator("#username-helper-text");
    this.passwordError = page.locator("#password-helper-text");
    this.signInError = page.locator('[data-test="signin-error"]');
    this.signupButton = page.locator('[data-test="signup"]');
    this.signupTitle = page.locator('[data-test="signup-title"]');
    this.signupFirstName = page.getByLabel("First Name *");
    this.signupLastName = page.getByLabel("Last Name *");
    this.signupUsername = page.getByLabel("Username *");
    this.signupPassword = page.locator('[data-test="signup-password"]').getByLabel("Password *");
    this.signupConfirmPassword = page.getByLabel(" Confirm Password *");
    this.userOnboardingDialog = page.locator('[data-test="user-onboarding-dialog"]');
    this.listSkeleton = page.locator('[data-test="list-skeleton"]');
    this.userOnboardingNext = page.locator('[data-test="user-onboarding-next"]');
    this.userOnboardingDialogTitle = page.locator('[data-test="user-onboarding-dialog-title"]');
    this.userOnboardingDialogContent = page.locator('[data-test="user-onboarding-dialog-content"]');
    this.bankNameInput = page.getByPlaceholder("Bank Name");
    this.accountNumberInput = page.getByPlaceholder("Account Number");
    this.routingNumberInput = page.getByPlaceholder("Routing Number");
    this.transactionList = page.locator('[data-test="transaction-list"]');
    this.sidenavToggle = page.locator('[data-test="sidenav-toggle"]');
    this.sidenavSignout = page.locator('[data-test="sidenav-signout"]');
    this.signupSubmit = page.locator('//button[@data-test="signup-submit"]');
    this.navTopNotificationsCount = page.locator('[data-test="nav-top-notifications-count"]');
    this.bunkSubmitButton = page.locator('[data-test="bankaccount-submit"]');
  }
  async login(username: string = "", password: string = ""): Promise<void> {
    if (username) {
      await this.usernameField.fill(username);
    }
    if (password) {
      await this.passwordField.fill(password);
    }
  }
}

export default LoginPage;
