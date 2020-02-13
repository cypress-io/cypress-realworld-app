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
    cy.getTest("nav-top-notifications-count").should("contain", 6);
  });

  it("renders a notifications list", function() {
    cy.getTest("nav-top-notifications-count").click();
    cy.getTestLike("notification-list-item").should("have.length", 6);
  });

  it("renders a like notification", function() {
    cy.getTest("nav-top-notifications-count").click();
    cy.getTestLike("notification-list-item").should("contain", "liked");
  });

  it("renders a comment notification", function() {
    cy.getTest("nav-top-notifications-count").click();
    cy.getTestLike("notification-list-item").should("contain", "commented");
  });

  it("renders an requested payment request notification", function() {
    cy.getTest("nav-top-notifications-count").click();
    cy.getTestLike("notification-list-item").should("contain", "requested");
  });

  it("renders a received payment request notification", function() {
    cy.getTest("nav-top-notifications-count").click();
    cy.getTestLike("notification-list-item").should("contain", "received");
  });

  it("marks a notification as read", function() {
    cy.getTest("nav-top-notifications-count").click();
    cy.getTestLike("notification-mark-read")
      .eq(3)
      .click();

    cy.wait("@notifications");

    cy.getTestLike("notification-list-item").should("have.length", 5);
  });
});
