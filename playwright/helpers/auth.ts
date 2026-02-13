import { Page, expect } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";

/**
 * Login helper function that mimics Cypress cy.login command
 * This function handles navigation to signin page if needed, fills in credentials,
 * and waits for the login request to complete.
 */
export async function login(
  page: Page,
  username: string,
  password: string,
  options?: { rememberUser?: boolean }
): Promise<void> {
  const loginPage = new LoginPage(page);

  // Wait for login request to complete (similar to cy.wait("@loginUser"))
  const loginPromise = page.waitForResponse(
    (response) => response.url().includes("/login") && response.request().method() === "POST"
  );

  // The LoginPage.login method handles navigation if needed
  await loginPage.login(username, password, {
    rememberMe: options?.rememberUser,
  });

  // Wait for login to complete
  await loginPromise;

  // Wait for navigation or checkAuth to complete
  await page.waitForLoadState("networkidle");
}
