// check this file using TypeScript if available
// @ts-check

describe("User Sign-up and Login", function () {
  beforeEach(function () {
    cy.task("db:seed");

    cy.server();
    cy.route("POST", "http://localhost:3001/bankAccounts").as(
      "createBankAccount"
    );
    cy.route("POST", "http://localhost:3001/login").as("login");
  });

  it("should allow a visitor to sign-up, login, and logout", function () {
    // Sign-up User
    cy.visit("/signup");
    cy.getTest("signup-first-name").type("First");
    cy.getTest("signup-last-name").type("Last");
    cy.getTest("signup-username").type("Username");
    cy.getTest("signup-password").type("password");
    cy.getTest("signup-confirmPassword").type("password");
    cy.getTest("signup-submit").click();

    // Login User
    cy.getTest("signin-username").type("Username");
    cy.getTest("signin-password").type("password");
    cy.getTest("signin-submit").click();

    // Onboarding
    cy.getTest("user-onboarding-dialog").should("be.visible");
    cy.getTest("user-onboarding-next").click();

    cy.getTest("user-onboarding-dialog-title").should(
      "contain",
      "Create Bank Account"
    );
    cy.getTest("bankaccount-form").should("be.visible");

    cy.getTest("bankaccount-bankName-input").type("The Best Bank");
    cy.getTest("bankaccount-accountNumber-input").type("123456789");
    cy.getTest("bankaccount-routingNumber-input").type("987654321");
    cy.getTest("bankaccount-submit").click();

    cy.wait("@createBankAccount").should("have.property", "status", 200);

    cy.getTest("user-onboarding-dialog").should("be.visible");
    cy.getTest("user-onboarding-dialog-title").should("contain", "Finished");
    cy.getTest("user-onboarding-dialog-content").should(
      "contain",
      "You're all set!"
    );
    cy.getTest("user-onboarding-next").click();

    cy.getTest("transaction-list").should("be.visible");

    // Logout User
    cy.getTest("sidenav-signout").click();
    cy.location("pathname").should("eq", "/");
  });

  it("should remember a user for 30 days after login", function () {
    cy.fixture("users").as("users");

    cy.visit("/");

    cy.get("@users").then((users) => {
      // Login User
      cy.getTest("signin-username").type(this.users[0].username);
      cy.getTest("signin-password").type("s3cret");
      cy.getTest("signin-remember-me").find("input").check();
      cy.getTest("signin-submit").click();

      cy.wait("@login");

      // Verify Session Cookie
      cy.getCookie("connect.sid").should("have.property", "expiry");

      // Logout User
      cy.getTest("sidenav-signout").click();
      cy.location("pathname").should("eq", "/");
    });
  });

  it("should display username and password login errors", function () {
    cy.fixture("users").as("users");

    cy.visit("/");

    cy.get("@users").then((users) => {
      cy.getTest("signin-username").type("User").find("input").clear().blur();
      cy.getTest("signin-password").type("abc").find("input").blur();
      cy.get("#username-helper-text").should("be.visible");
      cy.get("#password-helper-text")
        .should("be.visible")
        .should("contain", "Password must contain at least 4 characters");
    });
  });
});
