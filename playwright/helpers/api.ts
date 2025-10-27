import { Page } from '@playwright/test';

/**
 * Performs fast API login by bypassing UI and authenticating directly via API
 * Use this for API-only tests where frontend synchronization is not needed
 * @param page - The Playwright page instance
 * @param username - The username to login with
 * @param password - The password to login with (defaults to 's3cret')
 * @returns Promise<UserData> - The user data returned from the login API
 * @throws Error if login fails or session verification fails
 */
export async function loginByApi(page: Page, username: string, password: string = 's3cret') {
  const apiUrl = 'http://localhost:3001';
  
  // Make API login request
  const response = await page.request.post(`${apiUrl}/login`, {
    data: { username, password }
  });
  
  if (response.status() !== 200) {
    const errorText = await response.text();
    throw new Error(`Login failed: ${response.status()} - ${errorText}`);
  }
  
  const data = await response.json();
  
  // Verify the session is working by calling checkAuth
  const checkAuthResponse = await page.request.get(`${apiUrl}/checkAuth`);
  
  if (checkAuthResponse.status() !== 200) {
    throw new Error('Session verification failed after login');
  }
  
  return data;
}

