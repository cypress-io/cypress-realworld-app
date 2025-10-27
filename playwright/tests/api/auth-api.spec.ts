import { test, expect } from '@playwright/test';
import { loginByApi } from '../../helpers/api';
import { DataFactory } from '../../helpers/dataFactory';

test.describe('API Authentication Tests', () => {
  test('should login via API and access protected endpoints', async ({ page }) => {
    // Use random hardcoded user for API login
    const user = DataFactory.getRandomTestUser();
    const userData = await loginByApi(page, user.username, user.password);
    
    const apiUrl = 'http://localhost:3001';
    
    const checkAuthResponse = await page.request.get(`${apiUrl}/checkAuth`);
    expect(checkAuthResponse.status()).toBe(200);
    const authData = await checkAuthResponse.json();
    
    const usersResponse = await page.request.get(`${apiUrl}/users`);
    expect(usersResponse.status()).toBe(200);
    const usersData = await usersResponse.json();
    
    const transactionsResponse = await page.request.get(`${apiUrl}/transactions`);
    expect(transactionsResponse.status()).toBe(200);
    const transactionsData = await transactionsResponse.json();
  });

  test('should fail to access protected endpoints without login', async ({ page }) => {
    const apiUrl = 'http://localhost:3001';
    
    const checkAuthResponse = await page.request.get(`${apiUrl}/checkAuth`);
    expect(checkAuthResponse.status()).toBe(401);
    
    const usersResponse = await page.request.get(`${apiUrl}/users`);
    expect(usersResponse.status()).toBe(401);
  });

  test('should login with different users', async ({ page }) => {
    // Use random hardcoded user for API login
    const user = DataFactory.getRandomTestUser();
    const userData = await loginByApi(page, user.username, user.password);
    
    const apiUrl = 'http://localhost:3001';
    const checkAuthResponse = await page.request.get(`${apiUrl}/checkAuth`);
    expect(checkAuthResponse.status()).toBe(200);
    
    const authData = await checkAuthResponse.json();
    expect(authData.user.username).toBe(user.username);
  });
});
