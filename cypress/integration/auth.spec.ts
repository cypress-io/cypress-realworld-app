// check this file using TypeScript if available
// @ts-check

describe("App", function() {
  beforeEach(function() {
    cy.task("db:seed");
    Cypress.Cookies.preserveOnce("connect.sid");
  });
  after(function() {
    cy.task("db:seed");
  });
  context("Public Routes", function() {
    it("renders the signin page", function() {
      cy.visit("/signin")
        .get("#root")
        .should("contain", "Sign In");
    });
    it("signs up a user", function() {
      cy.visit("/signup")
        .get("#root")
        .should("contain", "Sign Up");

      cy.getTest("signup-first-name").type("First");
      cy.getTest("signup-last-name").type("Last");
      cy.getTest("signup-username").type("Username");

      cy.getTest("signup-password").type("password");
      cy.getTest("signup-confirmPassword").type("password");

      cy.getTest("signup-submit").click();

      cy.location("pathname").should("eq", "/signin");
    });
  });

  context("Login / Logout", function() {
    beforeEach(function() {
      cy.fixture("users").as("users");
      cy.get("@users").then(users => {
        cy.login(this.users[0].username);
      });
    });
    it("logs out", function() {
      cy.getTest("sidenav-signout").click();
      cy.location("pathname").should("eq", "/signin");
    });
  });
});
