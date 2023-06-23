import { test, expect } from "../test";

test.describe("Bank Accounts", () => {
  test.beforeAll(async ({ backend }) => {
    await backend.seedDB();
  });

  test.beforeEach(async ({ backend, page, loginByXstate }) => {
    const user = await backend.getAUser();
    await page.goto("/signin");
    await loginByXstate(user.username);
  });

  test.describe("Bank Accounts", () => {
    test("creates a new bank account", async ({ page }) => {
      await page.getByTestId("sidenav-bankaccounts").click();

      // Check for navigation
      expect(page.url()).toMatch("/bankaccounts");

      await page.getByTestId("bankaccount-new").click();

      // Check for navigation
      expect(page.url()).toMatch("/bankaccounts/new");

      await page.getByPlaceholder("Bank Name").fill("The Best Bank");
      await page.getByPlaceholder("Routing Number").fill("987654321");
      await page.getByPlaceholder("Account Number").fill("123456789");

      await page.getByTestId("bankaccount-submit").click();

      // Ensuring the page has navigated back to the bank accounts list
      await page.waitForURL("/bankaccounts");

      // Wait until the list of bank accounts is visible
      await page.getByText("Bank Accounts").first().waitFor({ state: "visible" });

      // Retrieve all list items and count them
      const accounts = await page.getByTestIdLike("bankaccount-list-item").count();

      // Expect two bank accounts in the list
      expect(accounts).toBe(2);
    });
  });
});
