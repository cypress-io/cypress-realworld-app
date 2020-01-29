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
    cy.server();
    cy.route("POST", "http://localhost:3001/transactions").as(
      "createTransaction"
    );
  });
  after(function() {
    cy.task("db:seed");
  });

  it("navigates to the create transaction form and displays a list of users to select", function() {
    cy.getTest("nav-top-new-transaction").click();

    cy.getTest("users-list").should("be.visible");
  });

  it("selects a user and submits a transaction payment", function() {
    cy.getTestLike("user-list-item")
      .first()
      .click();
    cy.getTest("transaction-create-form").should("be.visible");

    cy.getTest("transaction-create-amount-input").type("25");
    cy.getTest("transaction-create-description-input").type("Food");
    cy.getTest("transaction-create-submit-payment").click();

    cy.wait("@createTransaction").then(resp => {
      cy.log(this.resp);
    });
  });

  it("selects a user and submits a transaction request", function() {
    cy.getTest("nav-top-new-transaction").click();
    cy.getTestLike("user-list-item")
      .first()
      .click();
    cy.getTest("transaction-create-form").should("be.visible");

    cy.getTest("transaction-create-amount-input").type("95");
    cy.getTest("transaction-create-description-input").type("Hotel");
    cy.getTest("transaction-create-submit-request").click();
    cy.wait("@createTransaction").then(resp => {
      cy.log(this.resp);
    });
  });
});
