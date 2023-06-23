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

      await page.visualSnapshot("Display New Bank Account Form");

      await page.getByPlaceholder("Bank Name").fill("The Best Bank");
      await page.getByPlaceholder("Routing Number").fill("987654321");
      await page.getByPlaceholder("Account Number").fill("123456789");
      await page.visualSnapshot("Fill out New Bank Account Form");

      await page.getByTestId("bankaccount-submit").click();

      // Ensuring the page has navigated back to the bank accounts list
      await page.waitForURL("/bankaccounts");

      // Wait until the list of bank accounts is visible
      await page.getByText("Bank Accounts").first().waitFor({ state: "visible" });

      // Retrieve all list items and count them
      const accounts = await page.getByTestIdLike("bankaccount-list-item").count();

      // Expect two bank accounts in the list
      expect(accounts).toBe(2);
      await page.visualSnapshot("Bank Account Created");
    });

    test("Bank Account form error validations", async ({ page }) => {
      await page.getByTestId("sidenav-bankaccounts").click();

      // Check for navigation
      expect(page.url()).toMatch("/bankaccounts");

      await page.getByTestId("bankaccount-new").click();
      // Fill the input
      await page.getByPlaceholder("Bank Name").fill("The");

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
      await page.visualSnapshot("Bank Account Form with Errors and Submit button disabled");
    });

    test("Soft deletes a bank account", async ({ page, backend }) => {
      await backend.seedDB();
      await page.getByTestId("sidenav-bankaccounts").click();

      // Check for navigation
      expect(page.url()).toMatch("/bankaccounts");

      // Click on the delete button for the first bank account
      await page.getByTestIdLike("delete").first().click();

      // Check that the first bank account in the list is marked as deleted
      await page.getByTestIdLike("bankaccount-list-item").waitFor({ state: "visible" });
      const bankAccounts = await page.getByTestIdLike("bankaccount-list-item").textContent();
      expect(bankAccounts).toContain("Delete");
      await page.visualSnapshot("Soft Delete Bank Account");
    });

    test("Renders an empty bank account list state with onboarding modal", async ({ page }) => {
      await page.route("**/*", (route, request) => {
        if (request.postData()?.includes("ListBankAccount")) {
          const response = {
            status: 200,
            headers: { "Access-Control-Allow-Origin": "*" },
            contentType: "application/json",
            body: JSON.stringify({ data: { listBankAccount: [] } }),
          };

          return route.fulfill(response);
        }
        return route.continue();
      });

      await page.getByTestId("sidenav-bankaccounts").click();

      // Check for navigation
      expect(page.url()).toMatch("/bankaccounts");

      // Check that the bank account list does not exist
      const bankAccountList = await page.getByTestId("bankaccount-list").isVisible();
      expect(bankAccountList).toBe(false);

      // Check that the empty list header is displayed
      const emptyListHeader = await page.getByTestId("empty-list-header").textContent();
      expect(emptyListHeader).toContain("No Bank Accounts");

      // Check that the notifications count exists
      const notificationsCount = await page.getByTestId("nav-top-notifications-count").isVisible();
      expect(notificationsCount).toBe(true);

      await page.visualSnapshot("User Onboarding Dialog is Visible");
    });
  });
});
