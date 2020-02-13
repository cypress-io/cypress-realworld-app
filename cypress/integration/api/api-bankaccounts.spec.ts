// check this file using TypeScript if available
// @ts-check

import faker from "faker";

const apiBankAccounts = `${Cypress.env("apiUrl")}/bankAccounts`;

describe("Bank Accounts API", function() {
  before(function() {
    //cy.task("db:reset");
    cy.task("db:seed");
    // TODO: Refactor
    // hacks/experiements
    cy.fixture("users").as("users");
    cy.fixture("contacts").as("contacts");
    cy.fixture("bankAccounts").as("bankAccounts");
    cy.get("@users").then(user => (this.currentUser = this.users[0]));
    cy.get("@contacts").then(contacts => (this.contacts = contacts));
    cy.get("@bankAccounts").then(accounts => (this.bankAccounts = accounts));
  });

  beforeEach(function() {
    const { username } = this.currentUser;
    cy.apiLogin(username);
  });

  afterEach(function() {
    //cy.task("db:reset");
    cy.task("db:seed");
  });

  context("GET /bankAccounts", function() {
    it("gets a list of bank accounts for user", function() {
      const { id } = this.currentUser;
      cy.request("GET", `${apiBankAccounts}`).then(response => {
        expect(response.status).to.eq(200);
        expect(response.body.accounts[0].userId).to.eq(id);
      });
    });
  });

  context("GET /bankAccounts/:bankAccountId", function() {
    it("gets a bank account", function() {
      const userId = this.currentUser.id;
      const { id } = this.bankAccounts[0];
      cy.request("GET", `${apiBankAccounts}/${id}`).then(response => {
        expect(response.status).to.eq(200);
        expect(response.body.account.userId).to.eq(userId);
      });
    });
  });

  context("POST /bankAccounts", function() {
    it("creates a new bank account", function() {
      const { id } = this.currentUser;

      cy.request("POST", `${apiBankAccounts}`, {
        bankName: `${faker.company.companyName()} Bank`,
        accountNumber: faker.finance.account(10),
        routingNumber: faker.finance.account(9)
      }).then(response => {
        expect(response.status).to.eq(200);
        expect(response.body.account.id).to.be.a("string");
        expect(response.body.account.userId).to.eq(id);
      });
    });
  });

  context("DELETE /contacts/:bankAccountId", function() {
    it("deletes a bank account", function() {
      const { id } = this.bankAccounts[0];
      cy.request("DELETE", `${apiBankAccounts}/${id}`).then(response => {
        expect(response.status).to.eq(200);
      });
    });
  });
});
