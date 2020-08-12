import { User } from "../../../src/models";
import { isMobile } from "../../support/utils";

type BankAccountsTestCtx = {
  user?: User;
};

describe("Bank Accounts", function () {
  const ctx: BankAccountsTestCtx = {};

  beforeEach(function () {
    cy.task("db:seed");

    cy.server();
    cy.route("POST", "/bankAccounts").as("createBankAccount");
    cy.route("DELETE", "/bankAccounts/*").as("deleteBankAccount");

    cy.database("find", "users").then((user: User) => {
      ctx.user = user;

      return cy.loginByXstate(ctx.user.username);
    });
  });

  it("creates a new bank account", function () {
    if (isMobile()) {
      cy.getBySel("sidenav-toggle").click();
    }

    cy.getBySel("sidenav-bankaccounts").click();
    cy.percySnapshot();

    cy.getBySel("bankaccount-new").click();
    cy.location("pathname").should("be", "/bankaccounts/new");

    cy.getBySelLike("bankName-input").type("The Best Bank");
    cy.getBySelLike("routingNumber-input").type("987654321");
    cy.getBySelLike("accountNumber-input").type("123456789");
    cy.percySnapshot();
    cy.getBySelLike("submit").click();

    cy.wait("@createBankAccount");

    cy.getBySelLike("bankaccount-list-item")
      .should("have.length", 2)
      .eq(1)
      .should("contain", "The Best Bank");
    cy.percySnapshot();
  });

  it("should display bank account form errors", function () {
    cy.visit("/bankaccounts");
    cy.getBySel("bankaccount-new").click();
    cy.percySnapshot();

    cy.getBySelLike("bankName-input").type("The").find("input").clear().blur();
    cy.get("#bankaccount-bankName-input-helper-text")
      .should("be.visible")
      .and("contain", "Enter a bank name");
    cy.percySnapshot();

    cy.getBySelLike("bankName-input").type("The").find("input").blur();
    cy.get("#bankaccount-bankName-input-helper-text")
      .should("be.visible")
      .and("contain", "Must contain at least 5 characters");
    cy.percySnapshot();

    ["routing", "account"].forEach((field) => {
      cy.getBySelLike(`${field}Number-input`).type("123").find("input").clear().blur();
      cy.get(`#bankaccount-${field}Number-input-helper-text`)
        .should("be.visible")
        .and("contain", `Enter a valid bank ${field} number`);
      cy.percySnapshot();

      cy.getBySelLike(`${field}Number-input`).type("12345678").find("input").blur();
      cy.get(`#bankaccount-${field}Number-input-helper-text`)
        .should("be.visible")
        .and("contain", `Must contain a valid ${field} number`);
      cy.percySnapshot();
    });

    cy.getBySel("bankaccount-submit").should("be.disabled");
    cy.percySnapshot();
  });

  it("soft deletes a bank account", function () {
    cy.visit("/bankaccounts");
    cy.getBySelLike("delete").first().click();
    cy.percySnapshot();
    cy.wait("@deleteBankAccount");
    cy.getBySelLike("list-item").children().contains("Deleted");
    cy.percySnapshot();
  });

  // TODO: [enhancement] the onboarding modal assertion can be removed after adding "onboarded" flag to user profile
  it("renders an empty bank account list state with onboarding modal", function () {
    cy.route("GET", "/bankAccounts", []).as("getBankAccounts");

    cy.visit("/bankaccounts");
    cy.wait("@getBankAccounts");
    cy.percySnapshot();

    cy.getBySel("bankaccount-list").should("not.be.visible");
    cy.getBySel("empty-list-header").should("contain", "No Bank Accounts");
    cy.getBySel("user-onboarding-dialog").should("be.visible");
    cy.percySnapshot();
  });
});
