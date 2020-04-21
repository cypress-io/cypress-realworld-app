// check this file using TypeScript if available
// @ts-check
import { User, Transaction } from "../../src/models";

const { _ } = Cypress;

type NewTransactionCtx = {
  transactionRequest?: Transaction;
};

describe("Transaction View", function () {
  const ctx: NewTransactionCtx = {};

  beforeEach(function () {
    cy.task("db:seed");

    cy.server();
    cy.route("GET", "http://localhost:3001/transactions").as(
      "personalTransactions"
    );
    cy.route("GET", "http://localhost:3001/transactions/public").as(
      "publicTransactions"
    );
    cy.route("GET", "http://localhost:3001/transactions/*").as(
      "getTransaction"
    );
    cy.route("PATCH", "http://localhost:3001/transactions/*").as(
      "updateTransaction"
    );

    cy.route("POST", "http://localhost:3001/login").as("loginUser");
    cy.route("GET", "http://localhost:3001/checkAuth").as("userProfile");
    cy.route("GET", "http://localhost:3001/notifications").as(
      "getNotifications"
    );
    cy.route("GET", "http://localhost:3001/bankAccounts").as("getBankAccounts");

    cy.fixture("users").then((users: User[]) => {
      const authenticatedUser = users[0];

      cy.directLogin(authenticatedUser.username);
      cy.wait("@loginUser");

      cy.task("fetch:data", {
        entity: "transactions",
        findAttrs: {
          // @ts-ignore
          receiverId: authenticatedUser.id,
          status: "pending",
          requestStatus: "pending",
          requestResolvedAt: "",
        },
      }).then((results) => {
        ctx.transactionRequest = results;
      });
    });

    cy.getTest("nav-personal-tab").click();
    cy.wait("@personalTransactions");
  });

  it("transactions navigation tabs are hidden on a transaction view page", function () {
    cy.getTestLike("transaction-item").first().click({ force: true });

    cy.location("pathname").should("include", "/transaction");
    cy.getTest("nav-transaction-tabs").should("not.be.visible");
  });

  it("likes a transaction", function () {
    cy.getTestLike("transaction-item").first().click({ force: true });

    cy.getTestLike("like-button").click();
    cy.getTestLike("like-count").should("contain", 1);
    cy.getTestLike("like-button").should("be.disabled");
  });

  it("makes a comment on a transaction", function () {
    cy.getTestLike("transaction-item").first().click({ force: true });

    const comments = ["Thank you!", "Appreciate it."];

    _.each(comments, (comment, index) => {
      cy.getTestLike("comment-input").type(`${comment}{enter}`);

      cy.getTestLike("comments-list").children().eq(index).contains(comment);
    });

    cy.getTestLike("comments-list")
      .children()
      .should("have.length", comments.length);
  });

  it("accepts a transaction request", function () {
    cy.visit(`/transaction/${ctx.transactionRequest!.id}`);
    cy.wait("@getTransaction");
    cy.getTestLike("transaction-accept-request").click();
    cy.wait("@updateTransaction").should("have.property", "status", 204);
  });

  it("rejects a transaction request", function () {
    cy.getTestLike("transaction-item")
      .eq(4)
      .scrollIntoView()
      .click({ force: true });

    cy.getTestLike(`transaction-reject-request`).click();
    cy.wait("@updateTransaction").should("have.property", "status", 204);
  });

  it("does not display accept/reject buttons on completed request", function () {
    cy.getTestLike("transaction-item")
      .eq(3)
      .scrollIntoView()
      .click({ force: true });

    cy.getTest("nav-transaction-tabs").should("not.be.visible");

    cy.getTest("transaction-accept-request").should("not.be.visible");
    cy.getTest("transaction-reject-request").should("not.be.visible");
  });
});
