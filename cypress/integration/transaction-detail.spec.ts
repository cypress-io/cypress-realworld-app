// type definitions for Cypress object "cy"
/// <reference types="cypress" />

// check this file using TypeScript if available
// @ts-check

describe("Transaction Detail", function() {
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
    cy.route("/transactions/public").as("publicTransactions");
    cy.route("PATCH", "http://localhost:3001/transactions/*").as(
      "updateTransaction"
    );
  });
  after(function() {
    cy.task("db:seed");
  });

  it("displays transaction detail page", function() {
    cy.getTest("main").scrollTo("top");
    cy.wait("@publicTransactions");
    cy.getTestLike("transaction-view")
      .first()
      .scrollIntoView()
      .click({ force: true });
    cy.getTest("nav-transaction-tabs").should("not.be.visible");
    cy.location("pathname").should("include", "/transaction");
  });

  it("likes a transaction", function() {
    cy.getTestLike(`transaction-like-button`).click();

    cy.getTestLike(`transaction-like-count`).should("contain", 1);
  });

  it("makes a comment on a transaction", function() {
    cy.getTestLike(`transaction-comment-input`).type(
      "This is my comment{enter}"
    );
    cy.getTestLike(`transaction-comment-count`).should("contain", 1);
  });

  it("accepts a transaction request", function() {
    cy.getTestLike(`transaction-accept-request`).click();
    cy.wait("@updateTransaction").should("have.property", "status", 204);
  });

  it("rejects a transaction request", function() {
    cy.getTestLike(`transaction-reject-request`).click();
    cy.wait("@updateTransaction").should("have.property", "status", 204);
  });
});
