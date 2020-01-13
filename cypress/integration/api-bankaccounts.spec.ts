// type definitions for Cypress object "cy"
/// <reference types="cypress" />

// check this file using TypeScript if available
// @ts-check

const faker = require("faker");

const apiUrl = "http://localhost:3001";
const apiBankAccounts = `${apiUrl}/bank_accounts`;

describe("Bank Accounts API", function() {
  before(function() {
    //cy.task("db:reset");
    cy.task("db:seed");
    // TODO: Refactor
    // hacks/experiements
    cy.fixture("users").as("users");
    cy.fixture("contacts").as("contacts");
    cy.fixture("bank_accounts").as("bank_accounts");
    cy.get("@users").then(user => (this.currentUser = this.users[0]));
    cy.get("@contacts").then(contacts => (this.contacts = contacts));
    cy.get("@bank_accounts").then(accounts => (this.bankAccounts = accounts));
  });

  beforeEach(function() {
    const { username } = this.currentUser;
    cy.apiLogin(username);
  });

  afterEach(function() {
    //cy.task("db:reset");
    cy.task("db:seed");
  });

  context("GET /bank_accounts", function() {
    it("gets a list of bank accounts for user", function() {
      const { id } = this.currentUser;
      cy.request("GET", `${apiBankAccounts}`).then(response => {
        expect(response.status).to.eq(200);
        expect(response.body.accounts[0].user_id).to.eq(id);
      });
    });
  });

  context("GET /bank_accounts/:bank_account_id", function() {
    it("gets a bank account", function() {
      const userId = this.currentUser.id;
      const { id } = this.bankAccounts[0];
      cy.request("GET", `${apiBankAccounts}/${id}`).then(response => {
        expect(response.status).to.eq(200);
        expect(response.body.account.user_id).to.eq(userId);
      });
    });
  });

  context("POST /bank_accounts", function() {
    it("creates a new bank account", function() {
      const { id } = this.currentUser;

      cy.request("POST", `${apiBankAccounts}`, {
        bank_name: `${faker.company.companyName()} Bank`,
        account_number: faker.finance.account(10),
        routing_number: faker.finance.account(9)
      }).then(response => {
        expect(response.status).to.eq(200);
        expect(response.body.account.id).to.be.a("string");
        expect(response.body.account.user_id).to.eq(id);
      });
    });
  });

  /*
  context("DELETE /contacts/:contact_id", function() {
    it("deletes a contact", function() {
      const contact = this.contacts[0];

      cy.request("DELETE", `${apiContacts}/${contact.id}`).then(response => {
        expect(response.status).to.eq(200);
      });
    });
  });
  */
});
