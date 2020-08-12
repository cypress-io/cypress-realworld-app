import { isMobile } from "../../support/utils";
import { User, Transaction } from "../../../src/models";

type NotificationsCtx = {
  userA: User;
  userB: User;
  userC: User;
};

describe("Notifications", function () {
  const ctx = {} as NotificationsCtx;

  beforeEach(function () {
    cy.task("db:seed");

    cy.server();
    cy.route("GET", "/notifications").as("getNotifications");
    cy.route("POST", "/transactions").as("createTransaction");
    cy.route("PATCH", "/notifications/*").as("updateNotification");
    cy.route("POST", "/comments/*").as("postComment");

    cy.database("filter", "users").then((users: User[]) => {
      ctx.userA = users[0];
      ctx.userB = users[1];
      ctx.userC = users[2];
    });
  });

  describe("notifications from user interactions", function () {
    it("User A likes a transaction of User B; User B gets notification that User A liked transaction ", function () {
      cy.loginByXstate(ctx.userA.username);
      cy.wait("@getNotifications");
      cy.percySnapshot();

      cy.database("find", "transactions", { senderId: ctx.userB.id }).then(
        (transaction: Transaction) => {
          cy.visit(`/transaction/${transaction.id}`);
        }
      );

      cy.log("🚩 Renders the notifications badge with count");
      cy.wait("@getNotifications")
        .its("response.body.results.length")
        .then((notificationCount) => {
          cy.getBySel("nav-top-notifications-count").should("have.text", `${notificationCount}`);
        });
      cy.percySnapshot();

      const likesCountSelector = "[data-test*=transaction-like-count]";
      cy.contains(likesCountSelector, 0);
      cy.percySnapshot();
      cy.getBySelLike("like-button").click();
      // a successful "like" should disable the button and increment
      // the number of likes
      cy.getBySelLike("like-button").should("be.disabled");
      cy.contains(likesCountSelector, 1);
      cy.percySnapshot();

      cy.switchUser(ctx.userB.username);
      cy.percySnapshot();

      cy.wait("@getNotifications")
        .its("response.body.results.length")
        .as("preDismissedNotificationCount");

      cy.visit("/notifications");

      cy.wait("@getNotifications");
      cy.percySnapshot();

      cy.getBySelLike("notification-list-item")
        .should("have.length", 9)
        .first()
        .should("contain", ctx.userA?.firstName)
        .and("contain", "liked");

      cy.log("🚩 Marks notification as read");
      cy.getBySelLike("notification-mark-read").first().click({ force: true });
      cy.wait("@updateNotification");
      cy.percySnapshot();

      cy.get("@preDismissedNotificationCount").then((count) => {
        cy.getBySelLike("notification-list-item").should("have.length.lessThan", Number(count));
      });
      cy.percySnapshot();
    });

    it("User C likes a transaction between User A and User B; User B and get notifications that User C liked transaction", function () {
      cy.loginByXstate(ctx.userC.username);
      cy.percySnapshot();

      cy.database("find", "transactions", {
        senderId: ctx.userB.id,
        receiverId: ctx.userA.id,
      }).then((transaction: Transaction) => {
        cy.visit(`/transaction/${transaction.id}`);
      });

      const likesCountSelector = "[data-test*=transaction-like-count]";
      cy.contains(likesCountSelector, 0);
      cy.percySnapshot();
      cy.getBySelLike("like-button").click();
      cy.getBySelLike("like-button").should("be.disabled");
      cy.contains(likesCountSelector, 1);
      cy.percySnapshot();

      cy.switchUser(ctx.userA.username);

      cy.getBySelLike("notifications-link").click();

      cy.wait("@getNotifications");
      cy.percySnapshot();

      cy.location("pathname").should("equal", "/notifications");

      cy.getBySelLike("notification-list-item")
        .should("have.length", 9)
        .first()
        .should("contain", ctx.userC.firstName)
        .and("contain", "liked");
      cy.percySnapshot();

      cy.switchUser(ctx.userB.username);

      cy.getBySelLike("notifications-link").click();

      cy.wait("@getNotifications");
      cy.percySnapshot();

      cy.getBySelLike("notification-list-item")
        .should("have.length", 9)
        .first()
        .should("contain", ctx.userC.firstName)
        .and("contain", "liked");
      cy.percySnapshot();
    });

    it("User A comments on a transaction of User B; User B gets notification that User A commented on their transaction", function () {
      cy.loginByXstate(ctx.userA.username);
      cy.percySnapshot();

      cy.database("find", "transactions", { senderId: ctx.userB.id }).then(
        (transaction: Transaction) => {
          cy.visit(`/transaction/${transaction.id}`);
        }
      );

      cy.getBySelLike("comment-input").type("Thank You{enter}");

      cy.wait("@postComment");
      cy.percySnapshot();

      cy.switchUser(ctx.userB.username);

      cy.getBySelLike("notifications-link").click();

      cy.wait("@getNotifications");
      cy.percySnapshot();

      cy.getBySelLike("notification-list-item")
        .should("have.length", 9)
        .first()
        .should("contain", ctx.userA?.firstName)
        .and("contain", "commented");
      cy.percySnapshot();
    });

    it("User C comments on a transaction between User A and User B; User A and B get notifications that User C commented on their transaction", function () {
      cy.loginByXstate(ctx.userC.username);
      cy.percySnapshot();

      cy.database("find", "transactions", {
        senderId: ctx.userB.id,
        receiverId: ctx.userA.id,
      }).then((transaction: Transaction) => {
        cy.visit(`/transaction/${transaction.id}`);
      });

      cy.getBySelLike("comment-input").type("Thank You{enter}");

      cy.wait("@postComment");
      cy.percySnapshot();

      cy.switchUser(ctx.userA.username);

      cy.getBySelLike("notifications-link").click();

      cy.wait("@getNotifications");
      cy.percySnapshot();

      cy.getBySelLike("notification-list-item")
        .should("have.length", 9)
        .first()
        .should("contain", ctx.userC.firstName)
        .and("contain", "commented");

      cy.switchUser(ctx.userB.username);
      cy.percySnapshot();

      cy.getBySelLike("notifications-link").click();
      cy.getBySelLike("notification-list-item")
        .should("have.length", 9)
        .first()
        .should("contain", ctx.userC.firstName)
        .and("contain", "commented");
      cy.percySnapshot();
    });

    it("User A sends a payment to User B", function () {
      cy.loginByXstate(ctx.userA.username);
      cy.percySnapshot();

      cy.getBySelLike("new-transaction").click();
      cy.createTransaction({
        transactionType: "payment",
        amount: 30,
        description: "🍕Pizza",
        sender: ctx.userA,
        receiver: ctx.userB,
      });
      cy.wait("@createTransaction");
      cy.percySnapshot();

      cy.switchUser(ctx.userB.username);

      cy.getBySelLike("notifications-link").click();
      cy.percySnapshot();
      cy.getBySelLike("notification-list-item")
        .first()
        .should("contain", ctx.userB.firstName)
        .and("contain", "received payment");
      cy.percySnapshot();
    });

    it("User A sends a payment request to User C", function () {
      cy.loginByXstate(ctx.userA.username);
      cy.percySnapshot();

      cy.getBySelLike("new-transaction").click();
      cy.createTransaction({
        transactionType: "request",
        amount: 300,
        description: "🛫🛬 Airfare",
        sender: ctx.userA,
        receiver: ctx.userC,
      });
      cy.wait("@createTransaction");
      cy.percySnapshot();

      cy.switchUser(ctx.userC.username);

      cy.getBySelLike("notifications-link").click();
      cy.getBySelLike("notification-list-item")
        .should("contain", ctx.userA.firstName)
        .and("contain", "requested payment");
      cy.percySnapshot();
    });
  });

  it("renders an empty notifications state", function () {
    cy.route("GET", "/notifications", []).as("notifications");

    cy.loginByXstate(ctx.userA.username);
    cy.percySnapshot();

    if (isMobile()) {
      cy.getBySel("sidenav-toggle").click();
    }
    cy.getBySel("sidenav-notifications").click();
    cy.percySnapshot();
    cy.location("pathname").should("equal", "/notifications");
    cy.getBySel("notification-list").should("not.be.visible");
    cy.getBySel("empty-list-header").should("contain", "No Notifications");
    cy.percySnapshot();
  });
});
