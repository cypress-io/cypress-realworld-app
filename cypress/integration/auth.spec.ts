// check this file using TypeScript if available
// @ts-check

describe("User Sign-up and Login", function() {
  beforeEach(function() {
    cy.task("db:seed");
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

    // Logout User
    cy.getTest("sidenav-open").click();
    cy.getTest("sidenav-signout").click();
    cy.location("pathname").should("eq", "/");
  });
});
