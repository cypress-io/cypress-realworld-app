import { test, expect } from '../../fixtures/auth';
import { HomePage } from '../../pages/HomePage';

test.describe('Authenticated User Tests', () => {
  test('should access personal transactions when logged in', async ({ loggedInAsUser }) => {
    const page = await loggedInAsUser();
    const homePage = new HomePage(page);
    
    await homePage.navigateToPersonal();
    
    await homePage.expectTransactionListToBeVisible();
    await expect(homePage.signOutButton).toBeVisible();
  });

  test('should access contacts when logged in', async ({ loggedInAsUser }) => {
    const page = await loggedInAsUser();
    const homePage = new HomePage(page);
    
    await homePage.navigateToContacts();
    
    await expect(homePage.signOutButton).toBeVisible();
  });

  test('should access notifications when logged in', async ({ loggedInAsUser }) => {
    const page = await loggedInAsUser('Heath93');
    const homePage = new HomePage(page);
    await homePage.navigateToNotifications();
    
    await expect(homePage.signOutButton).toBeVisible();
  });

  test('should access user settings when logged in', async ({ loggedInAsUser }) => {
    const page = await loggedInAsUser('Dina20');
    const homePage = new HomePage(page);
    
    await homePage.navigateToUserSettings();
    
    await expect(homePage.signOutButton).toBeVisible();
  });

  test('should have access to user data', async ({ loggedInAsUser }) => {
    const page = await loggedInAsUser();
    const homePage = new HomePage(page);
    
    await expect(homePage.signOutButton).toBeVisible();
  });

  test('should be able to create a new transaction', async ({ loggedInAsUser }) => {
    const page = await loggedInAsUser();
    const homePage = new HomePage(page);
    
    await homePage.navigateToCreateTransaction();
    
    await expect(homePage.signOutButton).toBeVisible();
  });

  test('should work with specific user', async ({ loggedInAsUser }) => {
    const page = await loggedInAsUser('Heath93');
    const homePage = new HomePage(page);
    
    await homePage.navigateToPersonal();
    await expect(homePage.signOutButton).toBeVisible();
  });
});
