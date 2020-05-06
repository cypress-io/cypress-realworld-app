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
    cy.wait("@notifications");
  });

  describe("notifications from user interactions", function () {
    it("User A likes a transaction of User B; User B gets notification that User A liked transaction ", function () {
      cy.task("filter:testData", {
        entity: "transactions",
        filterAttrs: { senderId: ctx.userB!.id },
      }).then((transactions: Transaction[]) => {
        const userBTransaction = transactions[0];

        cy.visit(`/transaction/${userBTransaction.id}`);

        cy.getBySelLike("like-button").click();

        cy.logoutByXstate();

        cy.loginByXstate(ctx.userB!.username);

        cy.visit("/notifications");

        cy.getBySelLike("notification-list-item")
          .should("contain", ctx.userA?.firstName)
          .and("contain", "liked");
      });
    });

    it("User A comments on a transaction of User B; User B gets notification that User A commented on their transaction", function () {
      cy.task("filter:testData", {
        entity: "transactions",
        filterAttrs: { senderId: ctx.userB!.id },
      }).then((transactions: Transaction[]) => {
        const userBTransaction = transactions[0];

        cy.visit(`/transaction/${userBTransaction.id}`);

        cy.getBySelLike("comment-input").type("Thank You!{enter}");

        cy.logoutByXstate();

        cy.loginByXstate(ctx.userB!.username);

        cy.visit("/notifications");

        cy.getBySelLike("notification-list-item")
          .should("contain", ctx.userA?.firstName)
          .and("contain", "commented");
      });
    });

    it("User A sends a payment to User B", function () {
      cy.getBySel("nav-top-new-transaction").click();

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

      cy.visit("/notifications");

      cy.getBySelLike("notification-list-item")
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

      cy.visit("/notifications");

      cy.getBySelLike("notification-list-item")
        .should("contain", ctx.userA?.firstName)
        .and("contain", "requested payment");
    });
  });

  it("renders the notifications badge with count", function () {
    cy.getBySel("nav-top-notifications-count").should("have.length.gte", 1);
  });

  describe("notifications list", function () {
    it("renders a notifications list", function () {
      cy.getBySel("nav-top-notifications-count").click();

      cy.getBySelLike("notification-list-item").should("contain", "liked");
      cy.getBySelLike("notification-list-item").should("contain", "commented");
      cy.getBySelLike("notification-list-item").should("contain", "requested");
      cy.getBySelLike("notification-list-item").should("contain", "received");
    });

    it("marks a notification as read; updates notification counter badge", function () {
      cy.visit("/notifications");

      cy.wait("@notifications")
        .its("response.body.results.length")
        .as("notificationsCount");

      cy.getBySelLike("notification-mark-read").first().click({ force: true });

      cy.wait("@updateNotification");

      // TODO: double check the command log dom snapshots during this assertion
      cy.get("@notificationsCount").then((count) => {
        cy.getBySelLike("notification-list-item").should(
          "have.length.lessThan",
          // @ts-ignore
          count
        );
      });
    });

    it("renders an empty notifications state", function () {
      cy.route("GET", "/notifications", []).as("notifications");
      cy.getBySel("nav-top-notifications-count").click({ force: true });
      cy.getBySel("notification-list").should("not.be.visible");
      cy.getBySel("empty-list-header").should("contain", "No Notifications");
    });
  });
});
