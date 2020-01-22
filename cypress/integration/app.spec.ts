// type definitions for Cypress object "cy"
/// <reference types="cypress" />

// check this file using TypeScript if available
// @ts-check

describe("App", function() {
  beforeEach(function() {
    cy.task("db:seed");
  });
  context("Public Routes", function() {
    it("renders the signin page", function() {
      cy.visit("/signin")
        .get("#root")
        .should("contain", "Sign In");
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

    it("renders transaction list", function() {
      cy.getTest("transaction-list")
        .children()
        .should("have.length", 1);
    });
  });
});
