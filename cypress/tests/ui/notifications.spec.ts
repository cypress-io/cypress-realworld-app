// @ts-check
import { User } from "../../../src/models";

// TODO: fix these tests after latest data seeding generators are merged in
describe.skip("Notifications", function () {
  beforeEach(function () {
    cy.task("db:seed");

    cy.server();
    cy.route("GET", "/notifications").as("notifications");
    cy.route("PATCH", "/notifications/*").as("updateNotification");

    cy.task("find:testData", { entity: "users" }).then((user: User) => {
      cy.loginByXstate(user.username);
    });
    cy.wait("@notifications");
  });

  it("renders the notifications badge with count", function () {
    cy.getTest("nav-top-notifications-count").should("have.length.gte", 1);
  });

  it("renders a notifications list", function () {
    cy.getTest("nav-top-notifications-count").click();
    cy.getTestLike("notification-list-item").should("have.length.gte", 1);
  });

  it("renders a like notification", function () {
    cy.getTest("nav-top-notifications-count").click();
    cy.getTestLike("notification-list-item").should("contain", "liked");
  });

  it("renders a comment notification", function () {
    cy.getTest("nav-top-notifications-count").click();
    cy.getTestLike("notification-list-item").should("contain", "commented");
  });

  it("renders a payment request notification", function () {
    cy.getTest("nav-top-notifications-count").click();
    cy.getTestLike("notification-list-item").should("contain", "requested");
  });

  it("renders a received payment request notification", function () {
    cy.getTest("nav-top-notifications-count").click();
    cy.getTestLike("notification-list-item").should("contain", "received");
  });

  it("marks a notification as read; updates notification counter badge", function () {
    cy.visit("/notifications");

    cy.wait("@notifications")
      .its("response.body.results.length")
      .as("notificationsCount");

    cy.getTestLike("notification-mark-read").first().click({ force: true });

    cy.wait("@updateNotification");

    // TODO: double check the command log dom snapshots during this assertion
    cy.get("@notificationsCount").then((count) => {
      cy.getTestLike("notification-list-item").should(
        "have.length.lessThan",
        // @ts-ignore
        count
      );
    });
  });

  it("renders an empty notifications state", function () {
    cy.route("GET", "/notifications", []).as("notifications");
    cy.getTest("nav-top-notifications-count").click({ force: true });
    cy.getTest("notification-list").should("not.be.visible");
    cy.getTest("empty-list-header").should("contain", "No Notifications");
  });
});
