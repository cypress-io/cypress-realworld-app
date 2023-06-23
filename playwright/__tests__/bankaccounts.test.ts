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

    test.only("Bank Account form error validations", async ({ page }) => {
      await page.getByTestId("sidenav-bankaccounts").click();

      // Check for navigation
      expect(page.url()).toMatch("/bankaccounts");

      await page.getByTestId("bankaccount-new").click();
      // Fill the input
      await page.getByPlaceholder("Bank Name").fill("The");

      await page.pause();

      // Clear the input and trigger blur
      await page.getByPlaceholder("Bank Name").fill("");
      await page.getByPlaceholder("Bank Name").press("Tab");

      // Check the validation message
      expect(await page.locator("#bankaccount-bankName-input-helper-text").textContent()).toContain(
        "Enter a bank name"
      );

      // Fill the input with less than 9 digits
      await page.getByPlaceholder("Routing Number").fill("12345678");
      await page.getByPlaceholder("Routing Number").press("Tab");

      // Check the validation message
      expect(
        await page.locator("#bankaccount-routingNumber-input-helper-text").textContent()
      ).toContain("Must contain a valid routing number");

      // Fill the input with exactly 9 digits
      await page.getByPlaceholder("Routing Number").fill("123456789");
      await page.getByPlaceholder("Routing Number").press("Tab");

      // Check that the validation message does not exist
      expect(await page.locator("#bankaccount-routingNumber-input-helper-text").isVisible()).toBe(
        false
      );

      // Fill the input with less than 9 digits
      await page.getByPlaceholder("Account Number").fill("12345678");
      await page.getByPlaceholder("Account Number").press("Tab");

      // Check the validation message
      expect(
        await page.locator("#bankaccount-accountNumber-input-helper-text").textContent()
      ).toContain("Must contain at least 9 digits");

      // Fill the input with exactly 9 digits
      await page.getByPlaceholder("Account Number").fill("123456789");
      await page.getByPlaceholder("Account Number").press("Tab");

      // Check that the validation message does not exist
      expect(await page.locator("#bankaccount-accountNumber-input-helper-text").isVisible()).toBe(
        false
      );

      // Fill the input with exactly 12 digits
      await page.getByPlaceholder("Account Number").fill("123456789111");
      await page.getByPlaceholder("Account Number").press("Tab");

      // Check that the validation message does not exist
      expect(await page.locator("#bankaccount-accountNumber-input-helper-text").isVisible()).toBe(
        false
      );

      // Fill the input with more than 12 digits
      await page.getByPlaceholder("Account Number").fill("1234567891111");
      await page.getByPlaceholder("Account Number").press("Tab");

      // Check the validation message
      expect(
        await page.locator("#bankaccount-accountNumber-input-helper-text").textContent()
      ).toContain("Must contain no more than 12 digits");
    });
  });
});
