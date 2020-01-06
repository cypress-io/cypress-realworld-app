// type definitions for Cypress object "cy"
/// <reference types="cypress" />

// check this file using TypeScript if available
// @ts-check

describe("App", function() {
  beforeEach(function() {
    cy.task("db:reset");
    cy.task("db:seed");
    cy.visit("/");
  });

  it("renders the app", function() {
    cy.get("#root").should("contain", "PayMeNow");
  });

  it("renders transaction list", function() {
    /*cy.request("GET", "http://localhost:3001/transactions").then(response => {
      expect(response.body[0]).to.have.property("id");
    });*/
    cy.get("[data-cy='transaction-list']")
      .children()
      .should("have.length", 10);
  });
});
