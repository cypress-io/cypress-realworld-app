// @ts-check
import { User } from "../../../src/models";

type BankAccountsTestCtx = {
  user?: User;
};

describe("Bank Accounts", function () {
  const ctx: BankAccountsTestCtx = {};

  beforeEach(function () {
    cy.task("db:seed");

    cy.server();
    cy.route("POST", "http://localhost:3001/bankAccounts").as(
      "createBankAccount"
    );
    cy.route("DELETE", "http://localhost:3001/bankAccounts/*").as(
      "deleteBankAccount"
    );

    cy.task("find:testData", { entity: "users" }).then((user: User) => {
      ctx.user = user;

      return cy.loginByXstate(ctx.user.username);
    });
  });

  it("creates a new bank account", function () {
    cy.getTest("sidenav-bankaccounts").click();

    cy.getTest("bankaccount-new").click();
    cy.location("pathname").should("be", "/bankaccounts/new");

    cy.getTestLike("bankName-input").type("The Best Bank");
    cy.getTestLike("accountNumber-input").type("123456789");
    cy.getTestLike("routingNumber-input").type("987654321");
    cy.getTestLike("submit").click();

    cy.wait("@createBankAccount");

    cy.getTestLike("bankaccount-list-item")
      .should("have.length", 2)
      .eq(1)
      .should("contain", "The Best Bank");
  });

  it("soft deletes a bank account", function () {
    cy.getTest("sidenav-bankaccounts").click();
    cy.getTestLike("delete").first().click();
    cy.getTestLike("list-item").children().contains("Deleted");
  });

  // TODO: the onboarding modal assertion can be removed after adding "onboarded" flag to user profile
  it("renders an empty bank account list state with onboarding modal", function () {
    cy.route("GET", "/bankAccounts", []).as("getBankAccounts");

    cy.visit("/bankaccounts");
    cy.wait("@getBankAccounts");

    cy.getTest("bankaccount-list").should("not.be.visible");
    cy.getTest("empty-list-header").should("contain", "No Bank Accounts");
    cy.getTest("user-onboarding-dialog").should("be.visible");
  });
});
