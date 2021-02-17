// check this file using TypeScript if available
// @ts-check

import faker from "faker";
import { User } from "../../../src/models";
import { BankAccount } from "cypress-realword-app-api/model"

const apiBankAccounts = `${Cypress.env("apiUrl")}/bankAccounts`;

type TestBankAccountsCtx = {
  allUsers?: User[];
  authenticatedUser?: User;
  bankAccounts?: BankAccount[];
};

describe("Bank Accounts API", function () {
  let ctx: TestBankAccountsCtx = {};

  beforeEach(function () {
    cy.task("db:seed");

    cy.database("filter", "users").then((users: User[]) => {
      ctx.authenticatedUser = users[0];
      ctx.allUsers = users;

      return cy.loginByApi(ctx.authenticatedUser.username);
    });

    cy.database("filter", "bankaccounts").then((bankAccounts: BankAccount[]) => {
      ctx.bankAccounts = bankAccounts;
    });
  });

  context("GET /bankAccounts", function () {
    it("gets a list of bank accounts for user", function () {
      const { id: userId } = ctx.authenticatedUser!;
      cy.request("GET", `${apiBankAccounts}`).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.results[0].userId).to.eq(userId);
      });
    });
  });

  context("GET /bankAccounts/:bankAccountId", function () {
    it("gets a bank account", function () {
      const { id: userId } = ctx.authenticatedUser!;
      const { id: bankAccountId } = ctx.bankAccounts![0];
      cy.request("GET", `${apiBankAccounts}/${bankAccountId}`).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.account.userId).to.eq(userId);
      });
    });
  });

  context("POST /bankAccounts", function () {
    it("creates a new bank account", function () {
      const { id: userId } = ctx.authenticatedUser!;

      cy.request("POST", `${apiBankAccounts}`, {
        bankName: `${faker.company.companyName()} Bank`,
        accountNumber: faker.finance.account(10),
        routingNumber: faker.finance.account(9),
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.account.id).to.be.a("string");
        expect(response.body.account.userId).to.eq(userId);
      });
    });
  });

  context("DELETE /contacts/:bankAccountId", function () {
    it("deletes a bank account", function () {
      const { id: bankAccountId } = ctx.bankAccounts![0];
      cy.request("DELETE", `${apiBankAccounts}/${bankAccountId}`).then((response) => {
        expect(response.status).to.eq(200);
      });
    });
  });
});
