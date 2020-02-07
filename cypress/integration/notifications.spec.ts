// type definitions for Cypress object "cy"
/// <reference types="cypress" />

// check this file using TypeScript if available
// @ts-check

describe("Notifications", function() {
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

  it("renders the notifications badge with count", function() {
    cy.getTest("nav-top-notifications-count").should("contain", "7");
  });

  it.skip("renders a notifications list", function() {
    cy.getTest("nav-top-notifications-count").click();
    cy.getTest("notifications-list").should("have.length", 2);
  });
});
