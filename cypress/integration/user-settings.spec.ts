// type definitions for Cypress object "cy"
/// <reference types="cypress" />

// check this file using TypeScript if available
// @ts-check

describe("User Settings", function() {
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
    cy.route("PATCH", "http://localhost:3001/users").as("updateUser");
    cy.fixture("users").as("users");

    cy.getTest("sidenav-user-settings").click();
  });
  after(function() {
    cy.task("db:seed");
  });

  it("navigates to the user settings form", function() {
    cy.getTest("user-settings-form").should("be.visible");
    cy.location("pathname").should("include", "/user/settings");
  });

  it("updates first name, last name, email and phone number", function() {
    cy.getTest("user-settings-firstName-input").type("New First Name");
    cy.getTest("user-settings-lastName-input").type("New Last Name");
    cy.getTest("user-settings-submit").click();

    cy.wait("@updateUser").should("have.property", "status", 204);
  });
});
