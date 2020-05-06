// @ts-check
import { User, Transaction } from "../../../src/models";

type NotificationsCtx = {
  allUsers?: User[];
  userA?: User;
  userB?: User;
  userC?: User;
};

describe("Notifications", function () {
  const ctx: NotificationsCtx = {};

  beforeEach(function () {
    cy.task("db:seed");

    cy.server();
    cy.route("GET", "/notifications").as("notifications");
    cy.route("PATCH", "/notifications/*").as("updateNotification");
    cy.route("POST", "/transactions").as("createTransaction");

    cy.task("filter:testData", { entity: "users" }).then((users: User[]) => {
      ctx.userA = users[0];
      ctx.userB = users[1];
      ctx.userC = users[2];
      ctx.allUsers = users;

      cy.loginByXstate(ctx.userA.username);
    });
  });

  describe("notifications from user interactions", function () {
    it("User A likes a transaction of User B; User B gets notification that User A liked transaction ", function () {
      cy.task("find:testData", {
        entity: "transactions",
        filterAttrs: { senderId: ctx.userB!.id },
      }).then((transaction: Transaction) => {
        cy.wait("@notifications");
        cy.visit(`/transaction/${transaction.id}`);

        cy.log("🚩 Renders the notifications badge with count");
        cy.wait("@notifications")
          .its("response.body.results.length")
          .then((notificationCount) => {
            cy.getBySel("nav-top-notifications-count").should("have.text", `${notificationCount}`);
          });

        cy.getBySelLike("like-button").click();

        cy.logoutByXstate();

        cy.loginByXstate(ctx.userB!.username);
        cy.wait("@notifications")
          .its("response.body.results.length")
          .as("preDismissedNotificationCount");

        //cy.getBySelLike("notifications-link").click();
        cy.visit("/notifications");

        cy.getBySelLike("notification-list-item")
          .first()
          .should("contain", ctx.userA?.firstName)
          .and("contain", "liked");

        cy.log("🚩 Marks notification as read");
        cy.getBySelLike("notification-mark-read").first().click({ force: true });
        cy.wait("@updateNotification", { timeout: 7000 });
        cy.get("@preDismissedNotificationCount").then((count) => {
          cy.getBySelLike("notification-list-item").should("have.length.lessThan", Number(count));
        });
      });
    });

    it("User A comments on a transaction of User B; User B gets notification that User A commented on their transaction", function () {
      cy.task("find:testData", {
        entity: "transactions",
        filterAttrs: { senderId: ctx.userB!.id },
      }).then((transaction: Transaction) => {
        cy.visit(`/transaction/${transaction.id}`);

        cy.getBySelLike("comment-input").type("Thank You!{enter}");

        cy.logoutByXstate();
        cy.loginByXstate(ctx.userB!.username);

        cy.getBySelLike("notifications-link").click();
        cy.getBySelLike("notification-list-item")
          .first()
          .should("contain", ctx.userA?.firstName)
          .and("contain", "commented");
      });
    });

    it("User A sends a payment to User B", function () {
      cy.getBySelLike("new-transaction").click();

      const transactionPayload = {
        transactionType: "payment",
        amount: 30,
        description: "🍕Pizza",
        sender: ctx.userA!,
        receiver: ctx.userB!,
      };

      cy.createTransaction(transactionPayload);
      cy.wait("@createTransaction");

      cy.logoutByXstate();

      cy.loginByXstate(ctx.userB!.username);

      cy.getBySelLike("notifications-link").click();

      cy.getBySelLike("notification-list-item")
        .first()
        .should("contain", ctx.userB?.firstName)
        .and("contain", "received payment");
    });

    it("User A sends a payment request to User C", function () {
      cy.getBySel("nav-top-new-transaction").click();

      const transactionPayload = {
        transactionType: "request",
        amount: 300,
        description: "🛫🛬 Airfare",
        sender: ctx.userA!,
        receiver: ctx.userC!,
      };

      cy.createTransaction(transactionPayload);
      cy.wait("@createTransaction");

      cy.logoutByXstate();

      cy.loginByXstate(ctx.userC!.username);

      cy.getBySelLike("notifications-link").click();

      cy.getBySelLike("notification-list-item")
        .should("contain", ctx.userA?.firstName)
        .and("contain", "requested payment");
    });
  });

  it("renders an empty notifications state", function () {
    cy.route("GET", "/notifications", []).as("notifications");
    cy.getBySelLike("notifications-link").click();
    cy.getBySel("notification-list").should("not.be.visible");
    cy.getBySel("empty-list-header").should("contain", "No Notifications");
  });
});
