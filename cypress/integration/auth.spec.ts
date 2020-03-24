// check this file using TypeScript if available
// @ts-check

describe("User Sign-up and Login", function() {
  beforeEach(function() {
    cy.task("db:seed");
    cy.server();
    cy.route("POST", "http://localhost:3001/bankAccounts").as(
      "createBankAccount"
    );
  });

  it("should allow a visitor to sign-up, login, and logout", function() {
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
    cy.getTest("sidenav-open").click();
    cy.getTest("sidenav-signout").click();
    cy.location("pathname").should("eq", "/");
  });
});
