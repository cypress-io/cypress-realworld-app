import { test as base, Page } from '@playwright/test';
import { DataFactory, testUsers } from '../helpers/dataFactory';

/**
 * Performs UI login by navigating to signin page and filling credentials
 */
async function loginUser(page: Page, username: string, password: string = 's3cret') {
  await page.goto('http://localhost:3000/signin');
  await page.locator('#username').fill(username);
  await page.locator('#password').fill(password);
  await page.getByTestId('signin-submit').click();
  await page.waitForURL('http://localhost:3000/');
}

export const test = base.extend<{
  loggedInAsUser: (username?: string) => Promise<Page>;
}>({
  loggedInAsUser: async ({ page }, use) => {
    const loginFunction = async (username?: string) => {
      const user = username 
        ? Object.values(testUsers).find(u => u.username === username) || 
          (() => { throw new Error(`User '${username}' not found`); })()
        : DataFactory.getRandomTestUser();
      
      await loginUser(page, user.username, user.password);
      return page;
    };
    
    await use(loginFunction);
  },
});

export { expect } from '@playwright/test';
