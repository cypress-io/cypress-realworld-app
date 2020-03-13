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
    cy.route("GET", "http://localhost:3001/bankAccounts").as("bankAccounts");
    cy.fixture("users").as("users");

    cy.getTest("sidenav-open").click();
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

  it("soft deletes a bank account", function() {
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

  it.skip("renders an empty bank account list state", function() {
    // TODO: does not work per https://github.com/cypress-io/cypress/issues/3890
    // Overwrite default bank account response
    // cy.route("http://localhost:3001/bankAccounts", []).as("bankAccounts");
    cy.getTest("nav-top-notifications-count").click();
    cy.getTest("bankaccount-list").should("not.be.visible");
    cy.getTest("empty-list-header").should("contain", "No Bank Accounts");
  });
});
