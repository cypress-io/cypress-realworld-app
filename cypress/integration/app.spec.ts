// type definitions for Cypress object "cy"
/// <reference types="cypress" />

// check this file using TypeScript if available
// @ts-check

describe("App", function() {
  beforeEach(function() {
    cy.task("db:seed");
    cy.visit("/");
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
