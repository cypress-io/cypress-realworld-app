// check this file using TypeScript if available
// @ts-check

describe("Transaction View", function() {
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
    cy.route("GET", "/transactions").as("personalTransactions");
    cy.route("PATCH", "http://localhost:3001/transactions/*").as(
      "updateTransaction"
    );
    cy.getTest("app-name-logo")
      .find("a")
      .click();
    cy.getTest("nav-personal-tab")
      .click({ force: true })
      .should("have.class", "Mui-selected");
  });

  afterEach(function() {
    cy.task("db:seed");
  });

  after(function() {
    cy.task("db:seed");
  });

  it("displays transaction view page", function() {
    cy.getTestLike("transaction-view")
      .eq(3)
      .scrollIntoView()
      .click({ force: true });
    cy.getTest("nav-transaction-tabs").should("not.be.visible");
    cy.location("pathname").should("include", "/transaction");
  });

  it("likes a transaction", function() {
    cy.getTestLike("transaction-view")
      .eq(2)
      .scrollIntoView()
      .click({ force: true });

    cy.getTestLike(`transaction-like-button`).click();

    cy.getTestLike(`transaction-like-count`).should("contain", 1);
  });

  it("makes a comment on a transaction", function() {
    cy.getTestLike("transaction-view")
      .eq(2)
      .scrollIntoView()
      .click({ force: true });

    cy.getTestLike(`transaction-comment-input`).type(
      "This is my comment{enter}"
    );
    cy.getTestLike(`comments-list`)
      .children()
      .should("have.length", 1);
  });

  it("accepts a transaction request", function() {
    cy.getTestLike("transaction-view")
      .eq(0)
      .scrollIntoView()
      .click({ force: true });

    cy.getTestLike(`transaction-accept-request`).click();
    cy.wait("@updateTransaction").should("have.property", "status", 204);
  });

  it("rejects a transaction request", function() {
    cy.getTestLike("transaction-view")
      .eq(4)
      .scrollIntoView()
      .click({ force: true });

    cy.getTestLike(`transaction-reject-request`).click();
    cy.wait("@updateTransaction").should("have.property", "status", 204);
  });

  it("does not display accept/reject buttons on completed request", function() {
    cy.getTestLike("transaction-view")
      .eq(3)
      .scrollIntoView()
      .click({ force: true });

    cy.getTest("nav-transaction-tabs").should("not.be.visible");

    cy.getTest("transaction-accept-request").should("not.be.visible");
    cy.getTest("transaction-reject-request").should("not.be.visible");
  });
});
