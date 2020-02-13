// check this file using TypeScript if available
// @ts-check

describe("Bank Accounts", function() {
  before(function() {
    cy.fixture("users").as("users");
    cy.get("@users").then(users => {
      cy.login(this.users[0].username);
    });
  });
  beforeEach(function() {
    cy.task("db:seed");
    Cypress.Cookies.preserveOnce("connect.sid");
    cy.server();
    cy.route("POST", "http://localhost:3001/bankAccounts").as(
      "createBankAccount"
    );
    cy.route("DELETE", "http://localhost:3001/bankAccounts/*").as(
      "deleteBankAccount"
    );
    cy.route("http://localhost:3001/bankAccounts").as("bankAccounts");
    cy.fixture("users").as("users");

    cy.getTest("sidenav-bankaccounts").click();
  });
  after(function() {
    cy.task("db:seed");
  });

  it("renders a list of bank accounts for the user", function() {
    cy.getTest("bankaccount-list").should("be.visible");

    cy.wait("@bankAccounts");
    cy.getTestLike("bankaccount-list-item").should("have.length", 1);
  });

  it("deletes a bank account", function() {
    cy.getTest("bankaccount-list").should("be.visible");

    cy.getTestLike("bankaccount-delete")
      .first()
      .click();

    cy.wait("@deleteBankAccount").should("have.property", "status", 200);
    cy.wait("@bankAccounts");

    cy.getTestLike("bankaccount-list-item")
      .children()
      .contains("Deleted");
  });

  it("navigates to the create bank account form", function() {
    cy.getTest("bankaccount-list").should("be.visible");
    cy.getTest("bankaccount-new").click();
    cy.location("pathname").should("include", "/bankaccount/new");
  });

  it("selects a user and submits a transaction payment", function() {
    cy.getTest("bankaccount-new").click();
    cy.getTest("bankaccount-form").should("be.visible");

    cy.getTest("bankaccount-bankName-input").type("The Best Bank");
    cy.getTest("bankaccount-accountNumber-input").type("123456789");
    cy.getTest("bankaccount-routingNumber-input").type("987654321");
    cy.getTest("bankaccount-submit").click();

    cy.wait("@createBankAccount").should("have.property", "status", 200);

    cy.getTestLike("bankaccount-list-item").should("contain", "The Best Bank");
  });
});
