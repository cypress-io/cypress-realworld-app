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
    cy.server();
    cy.route("GET", "/notifications").as("notifications");
  });
  after(function() {
    cy.task("db:seed");
  });

  it("renders the notifications badge with count", function() {
    cy.wait("@notifications");
    cy.getTest("nav-top-notifications-count").should("contain", "7");
  });

  it("renders a notifications list", function() {
    cy.getTest("nav-top-notifications-count").click();
    cy.getTestLike("notification-list-item").should("have.length", 7);
  });

  it("renders a like notification", function() {
    cy.getTest("nav-top-notifications-count").click();
    cy.getTestLike("notification-list-item").should("contain", "likes");
  });

  it("renders a comment notification", function() {
    cy.getTest("nav-top-notifications-count").click();
    cy.getTestLike("notification-list-item").should("contain", "commented");
  });

  it("renders an accepted payment request notification", function() {
    cy.getTest("nav-top-notifications-count").click();
    cy.getTestLike("notification-list-item").should("contain", "accepted");
  });

  it("renders a rejected payment request notification", function() {
    cy.getTest("nav-top-notifications-count").click();
    cy.getTestLike("notification-list-item").should("contain", "rejected");
  });
});
