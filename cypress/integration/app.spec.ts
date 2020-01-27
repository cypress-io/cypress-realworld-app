// type definitions for Cypress object "cy"
/// <reference types="cypress" />

// check this file using TypeScript if available
// @ts-check

describe("App", function() {
  beforeEach(function() {
    cy.task("db:seed");
  });
  beforeEach(function() {
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

  context("Private Routes", function() {
    before(function() {
      cy.fixture("users").as("users");
      cy.get("@users").then(users => {
        cy.login(this.users[0].username);
      });
    });
    it("renders the app", function() {
      cy.getTest("app-name-logo").should("contain", "Pay App");
    });

    it("defaults side navigation to open", function() {
      cy.getTest("drawer-icon").should("not.be.visible");
    });

    it("renders public transaction lists (contacts, public)", function() {
      cy.getTest("transaction-list").should("have.length", 2);

      cy.getTest("transaction-list")
        .first()
        .children()
        .should("have.length", 11);

      cy.getTest("transaction-list")
        .last()
        .children()
        .should("have.length", 5);
    });

    it("renders contacts transaction list", function() {
      cy.getTest("nav-contacts-tab").click();
      cy.getTest("transaction-list")
        .children()
        .should("have.length", 7);
    });

    it("renders personal transaction list", function() {
      cy.getTest("nav-personal-tab").click();
      cy.getTest("transaction-list")
        .children()
        .should("have.length", 3);
    });

    it("logs out", function() {
      cy.getTest("sidenav-signout").click();
      cy.location("pathname").should("eq", "/signin");
    });
  });
});
