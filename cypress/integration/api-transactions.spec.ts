// type definitions for Cypress object "cy"
/// <reference types="cypress" />

// check this file using TypeScript if available
// @ts-check

const faker = require("faker");

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
    cy.fixture("bank_accounts").as("bank_accounts");
    cy.fixture("transactions").as("transactions");
    cy.get("@users").then(user => (this.currentUser = this.users[0]));
    cy.get("@contacts").then(contacts => (this.contacts = contacts));
    cy.get("@bank_accounts").then(accounts => (this.bankAccounts = accounts));
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
        expect(response.body.transactions[0].receiver_id).to.eq(id);
      });
    });

    it("gets a list of pending request transactions for user", function() {
      const { id } = this.currentUser;
      cy.request({
        method: "GET",
        url: `${apiTransactions}`,
        qs: {
          request_status: "pending"
        }
      }).then(response => {
        expect(response.status).to.eq(200);
        expect(response.body.transactions[0].receiver_id).to.eq(id);
      });
    });
  });

  context("GET /transactions/contacts", function() {
    it("gets a list of transactions for users list of contacts", function() {
      cy.request("GET", `${apiTransactions}/contacts`).then(response => {
        expect(response.status).to.eq(200);
        expect(response.body.transactions.length).to.eq(5);
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
        expect(response.body.transactions.length).to.eq(1);
      });
    });
  });
});
