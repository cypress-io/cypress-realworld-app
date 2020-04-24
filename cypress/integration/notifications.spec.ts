// @ts-check
import { User } from "../../src/models";

// TODO: fix these tests after latest data seeding generators are merged in
describe.skip("Notifications", function () {
  beforeEach(function () {
    cy.task("db:seed");

    cy.server();
    cy.route("GET", "http://localhost:3001/notifications").as("notifications");
    cy.route("PATCH", "http://localhost:3001/notifications/*").as(
      "updateNotification"
    );

    cy.task("find:testData", { entity: "users" }).then((user: User) => {
      cy.directLogin(user.username);
    });
  });

  it("renders the notifications badge with count", function () {
    cy.wait("@notifications");
    cy.getTest("nav-top-notifications-count").should("contain", 1);
  });

  it("renders a notifications list", function () {
    cy.getTest("nav-top-notifications-count").click();
    cy.getTestLike("notification-list-item").should("have.length", 6);
  });

  it("renders a like notification", function () {
    cy.getTest("nav-top-notifications-count").click();
    cy.getTestLike("notification-list-item").should("contain", "liked");
  });

  it("renders a comment notification", function () {
    cy.getTest("nav-top-notifications-count").click();
    cy.getTestLike("notification-list-item").should("contain", "commented");
  });

  it("renders an requested payment request notification", function () {
    cy.getTest("nav-top-notifications-count").click();
    cy.getTestLike("notification-list-item").should("contain", "requested");
  });

  it("renders a received payment request notification", function () {
    cy.getTest("nav-top-notifications-count").click();
    cy.getTestLike("notification-list-item").should("contain", "received");
  });

  it("marks a notification as read; updates notification counter badge", function () {
    cy.getTest("nav-top-notifications-count").click();
    cy.getTestLike("notification-mark-read").eq(3).click();

    cy.wait("@updateNotification");
    cy.wait("@notifications");

    cy.getTestLike("notification-list-item").should("have.length", 5);
  });

  it("renders an empty notifications state", function () {
    cy.route("GET", "/notifications", []).as("notifications");
    cy.getTest("nav-top-notifications-count").click({ force: true });
    cy.getTest("notification-list").should("not.be.visible");
    cy.getTest("empty-list-header").should("contain", "No Notifications");
  });
});
