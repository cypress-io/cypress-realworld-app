// type definitions for Cypress object "cy"
/// <reference types="cypress" />

// check this file using TypeScript if available
// @ts-check

describe("Transaction Lists", function() {
  before(function() {
    cy.fixture("users").as("users");
    cy.get("@users").then(users => {
      cy.login(this.users[0].username);
    });
  });
  beforeEach(function() {
    cy.task("db:seed");
    // TODO: Highlight this use case
    Cypress.Cookies.preserveOnce("connect.sid");
  });
  after(function() {
    cy.task("db:seed");
  });

  it("renders the app", function() {
    cy.getTest("app-name-logo").should("contain", "Pay App");
  });

  it("defaults side navigation to open", function() {
    cy.getTest("drawer-icon").should("not.be.visible");
  });

  it("renders public transaction lists (contacts, public)", function() {
    cy.getTest("transaction-list").should("have.length", 2);

    cy.getTest("nav-public-tab").should("have.class", "Mui-selected");

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
    cy.getTest("main").scrollTo("top");
    cy.getTest("nav-contacts-tab") // On get Navigation tabs are hidden under the AppBar in the UI
      .scrollIntoView() // TODO: Bug? Does not work as expected to scroll the tab into view
      .click({ force: true }) // Current solution is to force the click
      .should("have.class", "Mui-selected");
    cy.getTest("transaction-list")
      .children()
      .should("have.length", 7);
  });

  it("renders personal transaction list", function() {
    cy.getTest("main").scrollTo("top");
    cy.getTest("nav-personal-tab")
      .click({ force: true })
      .should("have.class", "Mui-selected");
    cy.getTest("transaction-list")
      .children()
      .should("have.length", 3);
  });
});
