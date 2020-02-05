// type definitions for Cypress object "cy"
/// <reference types="cypress" />

// check this file using TypeScript if available
// @ts-check

const faker = require("faker");
const getFakeAmount = () => parseInt(faker.finance.amount(), 10);

const apiUrl = "http://localhost:3001";
const apiTransactions = `${apiUrl}/transactions`;

describe("Transactions API", function() {
  before(function() {
    //cy.task("db:reset");
    cy.task("db:seed");
    // TODO: Refactor
    // hacks/experiements
    cy.fixture("users").as("users");
    cy.fixture("contacts").as("contacts");
    cy.fixture("bankAccounts").as("bankAccounts");
    cy.fixture("transactions").as("transactions");
    cy.get("@users").then(user => (this.currentUser = this.users[0]));
    cy.get("@contacts").then(contacts => (this.contacts = contacts));
    cy.get("@bankAccounts").then(accounts => (this.bankAccounts = accounts));
    cy.get("@transactions").then(
      transactions => (this.transactions = transactions)
    );
  });

  beforeEach(function() {
    const { username } = this.currentUser;
    cy.apiLogin(username);
  });

  afterEach(function() {
    //cy.task("db:reset");
    cy.task("db:seed");
  });

  context("GET /transactions", function() {
    it("gets a list of transactions for user (default)", function() {
      const { id } = this.currentUser;
      cy.request("GET", `${apiTransactions}`).then(response => {
        expect(response.status).to.eq(200);
        expect(response.body.transactions[0].senderId).to.eq(id);
      });
    });

    it("gets a list of pending request transactions for user", function() {
      const { id } = this.currentUser;
      cy.request({
        method: "GET",
        url: `${apiTransactions}`,
        qs: {
          requestStatus: "pending"
        }
      }).then(response => {
        expect(response.status).to.eq(200);
        expect(response.body.transactions[0].receiverId).to.eq(id);
      });
    });
  });

  context("GET /transactions/contacts", function() {
    it("gets a list of transactions for users list of contacts", function() {
      cy.request("GET", `${apiTransactions}/contacts`).then(response => {
        expect(response.status).to.eq(200);
        expect(response.body.transactions.length).to.eq(17);
      });
    });

    it("gets a list of transactions for users list of contacts - status 'incomplete'", function() {
      cy.request({
        method: "GET",
        url: `${apiTransactions}/contacts`,
        qs: {
          status: "incomplete"
        }
      }).then(response => {
        expect(response.status).to.eq(200);
        expect(response.body.transactions.length).to.eq(3);
      });
    });
  });

  context("GET /transactions/public", function() {
    it("gets a list of public transactions", function() {
      cy.request("GET", `${apiTransactions}/public`).then(response => {
        expect(response.status).to.eq(200);
        expect(response.body.transactions.contacts.length).to.eq(17);
        expect(response.body.transactions.public.length).to.eq(3);
      });
    });
  });

  context("POST /transactions", function() {
    it("creates a new payment", function() {
      const sender = this.currentUser;
      const receiver = this.users[1];
      const senderBankAccount = this.bankAccounts[0];

      cy.request("POST", `${apiTransactions}`, {
        type: "payment",
        source: senderBankAccount.id,
        receiverId: receiver.id,
        description: `Payment: ${sender.id} to ${receiver.id}`,
        amount: getFakeAmount(),
        privacyLevel: "public"
      }).then(response => {
        expect(response.status).to.eq(200);
        expect(response.body.transaction.id).to.be.a("string");
        expect(response.body.transaction.status).to.eq("pending");
        expect(response.body.transaction.requestStatus).to.eq(undefined);
      });
    });

    it("creates a new request", function() {
      const sender = this.currentUser;
      const receiver = this.users[1];
      const senderBankAccount = this.bankAccounts[0];

      cy.request("POST", `${apiTransactions}`, {
        type: "request",
        source: senderBankAccount.id,
        receiverId: receiver.id,
        description: `Request: ${sender.id} from ${receiver.id}`,
        amount: getFakeAmount(),
        privacyLevel: "public"
      }).then(response => {
        expect(response.status).to.eq(200);
        expect(response.body.transaction.id).to.be.a("string");
        expect(response.body.transaction.status).to.eq("pending");
        expect(response.body.transaction.requestStatus).to.eq("pending");
      });
    });
  });

  context("PATCH /transactions/:transactionId", function() {
    it("updates a transaction", function() {
      const transaction = this.transactions[0];

      cy.request("PATCH", `${apiTransactions}/${transaction.id}`, {
        requestStatus: "rejected"
      }).then(response => {
        expect(response.status).to.eq(204);
      });
    });

    it("error when invalid field sent", function() {
      const transaction = this.transactions[0];

      cy.request({
        method: "PATCH",
        url: `${apiTransactions}/${transaction.id}`,
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
