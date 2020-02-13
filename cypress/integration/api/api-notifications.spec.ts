// check this file using TypeScript if available
// @ts-check

const apiNotifications = `${Cypress.env("apiUrl")}/notifications`;

describe("Notifications API", function() {
  before(function() {
    //cy.task("db:reset");
    cy.task("db:seed");
    // TODO: Refactor
    // hacks/experiements
    cy.fixture("users").as("users");
    cy.fixture("transactions").as("transactions");
    cy.fixture("likes").as("likes");
    cy.fixture("comments").as("comments");
    cy.fixture("notifications").as("notifications");
    cy.get("@users").then(users => (this.currentUser = users[0]));
    cy.get("@likes").then(likes => (this.likes = likes));
    cy.get("@comments").then(comments => (this.comments = comments));
    cy.get("@transactions").then(
      transactions => (this.transactions = transactions)
    );
    cy.get("@notifications").then(
      notifications => (this.notifications = notifications)
    );
  });

  beforeEach(function() {
    const { username } = this.currentUser;
    cy.apiLogin(username);
  });

  afterEach(function() {
    cy.task("db:seed");
  });

  context("GET /notifications", function() {
    it("gets a list of notifications for a user", function() {
      cy.request("GET", `${apiNotifications}`).then(response => {
        expect(response.status).to.eq(200);
        expect(response.body.notifications.length).to.eq(6);
      });
    });
  });

  context("POST /notifications", function() {
    it("creates notifications for transaction, like and comment", function() {
      const transaction = this.transactions[0];
      const like = this.likes[0];
      const comment = this.comments[0];

      cy.request("POST", `${apiNotifications}/bulk`, {
        items: [
          {
            type: "payment",
            transactionId: transaction.id,
            status: "received"
          },
          {
            type: "like",
            transactionId: transaction.id,
            likeId: like.id
          },
          {
            type: "comment",
            transactionId: transaction.id,
            commentId: comment.id
          }
        ]
      }).then(response => {
        expect(response.status).to.eq(200);
        expect(response.body.notifications.length).to.equal(3);
        expect(response.body.notifications[0].transactionId).to.equal(
          transaction.id
        );
      });
    });
  });

  context("PATCH /notifications/:notificationId", function() {
    it("updates a notification", function() {
      const notification = this.notifications[0];

      cy.request("PATCH", `${apiNotifications}/${notification.id}`, {
        isRead: true
      }).then(response => {
        expect(response.status).to.eq(204);
      });
    });

    it("error when invalid field sent", function() {
      const notification = this.notifications[0];

      cy.request({
        method: "PATCH",
        url: `${apiNotifications}/${notification.id}`,
        failOnStatusCode: false,
        body: {
          notAUserField: "not a user field"
        }
      }).then(response => {
        expect(response.status).to.eq(422);
        expect(response.body.errors.length).to.eq(1);
      });
    });
  });
});
