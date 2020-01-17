// type definitions for Cypress object "cy"
/// <reference types="cypress" />

// check this file using TypeScript if available
// @ts-check

const apiUrl = "http://localhost:3001";
const apiNotifications = `${apiUrl}/notifications`;

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
    cy.get("@users").then(users => (this.currentUser = users[0]));
    cy.get("@likes").then(likes => (this.likes = likes));
    cy.get("@comments").then(comments => (this.comments = comments));
    cy.get("@transactions").then(
      transactions => (this.transactions = transactions)
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
        expect(response.body.notifications.length).to.eq(7);
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
            transaction_id: transaction.id,
            status: "received"
          },
          {
            type: "like",
            transaction_id: transaction.id,
            like_id: like.id
          },
          {
            type: "comment",
            transaction_id: transaction.id,
            comment_id: comment.id
          }
        ]
      }).then(response => {
        expect(response.status).to.eq(200);
        expect(response.body.notifications.length).to.equal(3);
        expect(response.body.notifications[0].transaction_id).to.equal(
          transaction.id
        );
      });
    });
  });
});
