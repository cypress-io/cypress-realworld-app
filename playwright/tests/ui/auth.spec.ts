import { UrlPath } from "../../providers/url-path";
import { SignInPage } from "../../pages/signin-page";
import { expect, test } from "../../fixtures";
import { SideNavPage } from "../../pages/sideNav-page";
import { PASSWORD, UserData } from "../../const/user-data";

test.describe.serial("User Sign-up and Login", () => {
  test.beforeEach(async ({ seedDatabase }) => {
    await seedDatabase();
  });

  test("should redirect unauthenticated user to signin page", async ({ page }) => {
    await page.goto(UrlPath.personal);

    await expect(page).toHaveURL(/\/signin$/);
  });

  test("should redirect to the home page after login", async ({ page, user }) => {
    const signInPage = new SignInPage(page);
    await signInPage.login(user.username, PASSWORD, { rememberUser: true });

    await expect(page).toHaveURL(/\/$/);
  });

  test("should remember a user for 30 days after login", async ({ page, user, isMobile }) => {
    const signInPage = new SignInPage(page);
    await signInPage.login(user.username, PASSWORD, { rememberUser: true });
    await page.waitForURL(/\/$/);

    // Verify Session Cookie
    const cookies = await page.context().cookies();
    const sessionCookie = cookies.find((cookie) => cookie.name === "connect.sid");

    expect(sessionCookie?.expires).toBeGreaterThan(0);

    // Logout User
    const sideNavPage = new SideNavPage(page);
    if (isMobile) {
      await sideNavPage.toggle.click();
    }

    await sideNavPage.signOutbutton.click();

    await expect(page).toHaveURL(/\/signin$/);
  });

  // test("hould allow a visitor to sign-up, login, and logout", async ({ page, user, isMobile }) => {


  // it("should allow a visitor to sign-up, login, and logout", function () {
  //   // Sign-up User
  //   cy.visit("/");

  //   cy.getBySel("signup").click();
  //   cy.getBySel("signup-title").should("be.visible").and("contain", "Sign Up");
  //   cy.visualSnapshot("Sign Up Title");

  //   cy.getBySel("signup-first-name").type(userInfo.firstName);
  //   cy.getBySel("signup-last-name").type(userInfo.lastName);
  //   cy.getBySel("signup-username").type(userInfo.username);
  //   cy.getBySel("signup-password").type(userInfo.password);
  //   cy.getBySel("signup-confirmPassword").type(userInfo.password);
  //   cy.visualSnapshot("About to Sign Up");
  //   cy.getBySel("signup-submit").click();
  //   cy.wait("@signup");

  //   // Login User
  //   cy.login(userInfo.username, userInfo.password);

  //   // Onboarding
  //   cy.getBySel("user-onboarding-dialog").should("be.visible");
  //   cy.getBySel("list-skeleton").should("not.exist");
  //   cy.getBySel("nav-top-notifications-count").should("exist");
  //   cy.visualSnapshot("User Onboarding Dialog");
  //   cy.getBySel("user-onboarding-next").click();

  //   cy.getBySel("user-onboarding-dialog-title").should("contain", "Create Bank Account");

  //   cy.getBySelLike("bankName-input").type("The Best Bank");
  //   cy.getBySelLike("accountNumber-input").type("123456789");
  //   cy.getBySelLike("routingNumber-input").type("987654321");
  //   cy.visualSnapshot("About to complete User Onboarding");
  //   cy.getBySelLike("submit").click();

  //   cy.wait("@gqlCreateBankAccountMutation");

  //   cy.getBySel("user-onboarding-dialog-title").should("contain", "Finished");
  //   cy.getBySel("user-onboarding-dialog-content").should("contain", "You're all set!");
  //   cy.visualSnapshot("Finished User Onboarding");
  //   cy.getBySel("user-onboarding-next").click();

  //   cy.getBySel("transaction-list").should("be.visible");
  //   cy.visualSnapshot("Transaction List is visible after User Onboarding");

  //   // Logout User
  //   if (isMobile()) {
  //     cy.getBySel("sidenav-toggle").click();
  //   }
  //   cy.getBySel("sidenav-signout").click();
  //   cy.location("pathname").should("eq", "/signin");
  //   cy.visualSnapshot("Redirect to SignIn");
  // });

  // it("should display login errors", function () {
  //   cy.visit("/");

  //   cy.getBySel("signin-username").type("User");
  //   cy.getBySel("signin-username").find("input").clear();
  //   cy.getBySel("signin-username").find("input").blur();
  //   cy.get("#username-helper-text").should("be.visible").and("contain", "Username is required");
  //   cy.visualSnapshot("Display Username is Required Error");

  //   cy.getBySel("signin-password").type("abc");
  //   cy.getBySel("signin-password").find("input").blur();
  //   cy.get("#password-helper-text")
  //     .should("be.visible")
  //     .and("contain", "Password must contain at least 4 characters");
  //   cy.visualSnapshot("Display Password Error");

  //   cy.getBySel("signin-submit").should("be.disabled");
  //   cy.visualSnapshot("Sign In Submit Disabled");
  // });

  // it("should display signup errors", function () {
  //   cy.intercept("GET", "/signup");

  //   cy.visit("/signup");

  //   cy.getBySel("signup-first-name").type("First");
  //   cy.getBySel("signup-first-name").find("input").clear();
  //   cy.getBySel("signup-first-name").find("input").blur();
  //   cy.get("#firstName-helper-text").should("be.visible").and("contain", "First Name is required");

  //   cy.getBySel("signup-last-name").type("Last");
  //   cy.getBySel("signup-last-name").find("input").clear();
  //   cy.getBySel("signup-last-name").find("input").blur();
  //   cy.get("#lastName-helper-text").should("be.visible").and("contain", "Last Name is required");

  //   cy.getBySel("signup-username").type("User");
  //   cy.getBySel("signup-username").find("input").clear();
  //   cy.getBySel("signup-username").find("input").blur();
  //   cy.get("#username-helper-text").should("be.visible").and("contain", "Username is required");

  //   cy.getBySel("signup-password").type("password");
  //   cy.getBySel("signup-password").find("input").clear();
  //   cy.getBySel("signup-password").find("input").blur();
  //   cy.get("#password-helper-text").should("be.visible").and("contain", "Enter your password");

  //   cy.getBySel("signup-confirmPassword").type("DIFFERENT PASSWORD");
  //   cy.getBySel("signup-confirmPassword").find("input").blur();
  //   cy.get("#confirmPassword-helper-text")
  //     .should("be.visible")
  //     .and("contain", "Password does not match");
  //   cy.visualSnapshot("Display Sign Up Required Errors");

  //   cy.getBySel("signup-submit").should("be.disabled");
  //   cy.visualSnapshot("Sign Up Submit Disabled");
  // });

  // it("should error for an invalid user", function () {
  //   cy.login("invalidUserName", "invalidPa$$word");

  //   cy.getBySel("signin-error")
  //     .should("be.visible")
  //     .and("have.text", "Username or password is invalid");
  //   cy.visualSnapshot("Sign In, Invalid Username and Password, Username or Password is Invalid");
  // });

  // it("should error for an invalid password for existing user", function () {
  //   cy.database("find", "users").then((user: User) => {
  //     cy.login(user.username, "INVALID");
  //   });

  //   cy.getBySel("signin-error")
  //     .should("be.visible")
  //     .and("have.text", "Username or password is invalid");
  //   cy.visualSnapshot("Sign In, Invalid Username, Username or Password is Invalid");
  // });
});
