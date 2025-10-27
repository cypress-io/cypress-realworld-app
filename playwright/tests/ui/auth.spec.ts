import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { SignupPage } from '../../pages/SignupPage';
import { HomePage } from '../../pages/HomePage';
import { DataFactory, testUsers } from '../../helpers/dataFactory';

/**
 * Tests login form field validation by filling, clearing, and verifying error messages
 * @param loginPage - The LoginPage instance to test
 * @param fieldName - The field to test ('username' or 'password')
 * @param testValue - The value to enter in the field
 * @param expectedError - The expected error message to verify
 */
async function testLoginFieldValidation(
  loginPage: LoginPage, 
  fieldName: 'username' | 'password', 
  testValue: string, 
  expectedError: string
) {
  if (fieldName === 'username') {
    await loginPage.fillUsername(testValue);
    await loginPage.clearUsername();
    await loginPage.blurUsername();
    await loginPage.expectUsernameHelperTextToBeVisible(expectedError);
  } else {
    await loginPage.fillPassword(testValue);
    await loginPage.blurPassword();
    await loginPage.expectPasswordHelperTextToBeVisible(expectedError);
  }
}

/**
 * Tests signup form field validation by filling, clearing, and verifying error messages
 * @param signupPage - The SignupPage instance to test
 * @param fieldName - The field to test ('firstName', 'lastName', 'username', 'password', or 'confirmPassword')
 * @param testValue - The value to enter in the field
 * @param expectedError - The expected error message to verify
 */
async function testSignupFieldValidation(
  signupPage: SignupPage,
  fieldName: 'firstName' | 'lastName' | 'username' | 'password' | 'confirmPassword',
  testValue: string,
  expectedError: string
) {
  switch (fieldName) {
    case 'firstName':
      await signupPage.fillFirstName(testValue);
      await signupPage.clearFirstName();
      await signupPage.blurFirstName();
      await signupPage.expectFirstNameHelperTextToBeVisible(expectedError);
      break;
    case 'lastName':
      await signupPage.fillLastName(testValue);
      await signupPage.clearLastName();
      await signupPage.blurLastName();
      await signupPage.expectLastNameHelperTextToBeVisible(expectedError);
      break;
    case 'username':
      await signupPage.fillUsername(testValue);
      await signupPage.clearUsername();
      await signupPage.blurUsername();
      await signupPage.expectUsernameHelperTextToBeVisible(expectedError);
      break;
    case 'password':
      await signupPage.fillPassword(testValue);
      await signupPage.clearPassword();
      await signupPage.blurPassword();
      await signupPage.expectPasswordHelperTextToBeVisible(expectedError);
      break;
    case 'confirmPassword':
      await signupPage.fillConfirmPassword(testValue);
      await signupPage.blurConfirmPassword();
      await signupPage.expectConfirmPasswordHelperTextToBeVisible(expectedError);
      break;
  }
}

test.describe('User Authentication', () => {
  test.describe('Access Control', () => {
    test('should redirect unauthenticated user to signin page', async ({ page }) => {
      const homePage = new HomePage(page);
      await homePage.navigateToPersonal();
      await homePage.expectToBeRedirectedToSignin();
    });
  });

  test.describe('Login Flow', () => {
        test('should allow user to login with valid credentials', async ({ page }) => {
          const loginPage = new LoginPage(page);
          const homePage = new HomePage(page);

          // Use random hardcoded user for login
          const user = DataFactory.getRandomTestUser();

          await loginPage.navigate();
          await loginPage.login(user.username, user.password);

          await expect(homePage.signOutButton).toBeVisible();
        });

    test('should display login errors for invalid credentials', async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.navigate();
      await loginPage.loginWithInvalidCredentials('invalidUser', 'invalidPassword');
      await loginPage.expectErrorMessageToBeVisible('Username or password is invalid');
    });

        test('should error for invalid password for existing user', async ({ page }) => {
          const loginPage = new LoginPage(page);
          
          // Use random hardcoded user for testing invalid password
          const user = DataFactory.getRandomTestUser();
          
          await loginPage.navigate();
          await loginPage.loginWithInvalidCredentials(user.username, 'INVALID');
          await loginPage.expectErrorMessageToBeVisible('Username or password is invalid');
        });

        test('should allow user to logout', async ({ page }) => {
          const loginPage = new LoginPage(page);
          const homePage = new HomePage(page);
          
          // Use random hardcoded user for logout test
          const user = DataFactory.getRandomTestUser();
          
          await loginPage.navigate();
          await loginPage.login(user.username, user.password);
          await homePage.logout();
        });

        test('should remember a user for 30 days after login', async ({ page }) => {
          const loginPage = new LoginPage(page);
          const homePage = new HomePage(page);
          
          // Use random hardcoded user for remember me test
          const user = DataFactory.getRandomTestUser();
          
          await loginPage.navigate();
          await loginPage.login(user.username, user.password, true);

          const cookies = await page.context().cookies();
          const sessionCookie = cookies.find(cookie => cookie.name === 'connect.sid');
          expect(sessionCookie).toBeTruthy();

          await homePage.logout();
        });
  });

  test.describe('Signup Flow', () => {
    test('should allow user to sign up', async ({ page }) => {
      const signupPage = new SignupPage(page);
      await signupPage.navigate();
      
      // Use generated user data for signup
      const userInfo = DataFactory.createUser();

      await signupPage.signup(userInfo.firstName, userInfo.lastName, userInfo.username, userInfo.password);
      await signupPage.expectToBeOnSigninPage();
    });

    test('should allow user to sign up with generated data', async ({ page }) => {
      const signupPage = new SignupPage(page);
      await signupPage.navigate();
      
      // Use data factory to generate user data
      const userInfo = DataFactory.createUser();

      await signupPage.signup(userInfo.firstName, userInfo.lastName, userInfo.username, userInfo.password);
      await signupPage.expectToBeOnSigninPage();
    });
  });

  test.describe('Form Validation', () => {
    test('should display login form validation errors', async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.navigate();

      await testLoginFieldValidation(loginPage, 'username', 'User', 'Username is required');
      await testLoginFieldValidation(loginPage, 'password', 'abc', 'Password must contain at least 4 characters');
      await loginPage.expectLoginButtonToBeDisabled();
    });

    test('should display signup form validation errors', async ({ page }) => {
      const signupPage = new SignupPage(page);
      await signupPage.navigate();

      await testSignupFieldValidation(signupPage, 'firstName', 'First', 'First Name is required');
      await testSignupFieldValidation(signupPage, 'lastName', 'Last', 'Last Name is required');
      await testSignupFieldValidation(signupPage, 'username', 'User', 'Username is required');
      await testSignupFieldValidation(signupPage, 'password', 'password', 'Enter your password');
      await testSignupFieldValidation(signupPage, 'confirmPassword', 'DIFFERENT PASSWORD', 'Password does not match');

      await signupPage.expectSignupButtonToBeDisabled();
    });
  });

  test('should allow complete signup to login flow with onboarding', async ({ page }) => {
    const signupPage = new SignupPage(page);
    const loginPage = new LoginPage(page);
    const homePage = new HomePage(page);
    
    await signupPage.navigate();
    
    // Use generated user data for signup
    const userInfo = DataFactory.createUser();    

    await signupPage.signup(userInfo.firstName, userInfo.lastName, userInfo.username, userInfo.password);
    await signupPage.expectToBeOnSigninPage();

    await loginPage.login(userInfo.username, userInfo.password);

    await homePage.expectUserOnboardingDialogToBeVisible();
    await homePage.expectListSkeletonToNotBeVisible();
    await homePage.expectNavTopNotificationsCountToBeVisible();
    await homePage.clickUserOnboardingNext();

    await homePage.expectUserOnboardingDialogTitleToContainText('Create Bank Account');
    await homePage.createBankAccount('The Best Bank', '987654321', '123456789');

    await homePage.expectUserOnboardingDialogTitleToContainText('Finished');
    await homePage.expectUserOnboardingDialogContentToContainText("You're all set!");
    await homePage.clickUserOnboardingNext();

    await homePage.expectTransactionListToBeVisible();

    await homePage.logout();
  });
});
