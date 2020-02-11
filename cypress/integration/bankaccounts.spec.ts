// type definitions for Cypress object "cy"
/// <reference types="cypress" />

// check this file using TypeScript if available
// @ts-check

describe("Bank Accounts", function() {
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
    cy.route("POST", "http://localhost:3001/bankAccounts").as(
      "createBankAccount"
    );
    cy.fixture("users").as("users");

    cy.getTest("sidenav-bankaccounts").click();
  });
  after(function() {
    cy.task("db:seed");
  });

  it("renders a list of bank accounts for the user", function() {
    cy.getTest("bankaccounts-list").should("be.visible");

    cy.getTest("bankaccounts-list-item").should("have.length", 44);
  });

  it("navigates to the create bank account form", function() {
    cy.getTest("bankaccounts-list").should("be.visible");
    cy.getTest("bankaccounts-create-form").click();
    cy.location("pathname").should("include", "/bankaccounts/new");
  });

  it("selects a user and submits a transaction payment", function() {
    cy.getTest("bankaccounts-create-form").should("be.visible");

    cy.getTest("bankaccounts-create-bankName-input").type("The Best Bank");
    cy.getTest("bankaccounts-create-accountNumber-input").type("123456789");
    cy.getTest("bankaccounts-create-routingNumber-input").type("987654321");
    cy.getTest("bankaccounts-create-submit").click();

    cy.wait("@createBankAccount").should("have.property", "status", 200);

    cy.getTestLike("bankaccounts-list-item").should("contain", "The Best Bank");
  });
});
