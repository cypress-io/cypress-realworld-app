// type definitions for Cypress object "cy"
/// <reference types="cypress" />

// check this file using TypeScript if available
// @ts-check

describe("Create Transaction", function() {
  before(function() {
    cy.fixture("users").as("users");
    cy.get("@users").then(users => {
      cy.login(this.users[0].username);
    });
  });
  beforeEach(function() {
    cy.task("db:seed");
    Cypress.Cookies.preserveOnce("connect.sid");
  });
  after(function() {
    cy.task("db:seed");
  });

  it("navigates to the create transaction form and displays a list of users to select", function() {
    cy.getTest("nav-top-new-transaction").click();

    cy.getTest("users-list").should("be.visible");
  });

  it("selects a user, proceeds to transaction payment/request", function() {
    cy.getTestLike("user-list-item")
      .first()
      .click();
    cy.getTest("transaction-create-form").should("be.visible");
  });
});
