// check this file using TypeScript if available
// @ts-check

describe("New Transaction", function() {
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
    cy.route("POST", "http://localhost:3001/transactions").as(
      "createTransaction"
    );
    cy.route("GET", "http://localhost:3001/users/search*").as("usersSearch");
    cy.fixture("users").as("users");

    cy.getTest("nav-top-new-transaction").click();
  });
  after(function() {
    cy.task("db:seed");
  });

  it("navigates to the new transaction form, selects a user and submits a transaction payment", function() {
    cy.getTest("users-list").should("be.visible");
    cy.getTestLike("user-list-item")
      .contains("Kaden")
      .click();
    cy.getTest("transaction-create-form").should("be.visible");

    cy.getTest("transaction-create-amount-input").type("25");
    cy.getTest("transaction-create-description-input").type("Indian Food");
    cy.getTest("transaction-create-submit-payment").click();

    cy.wait("@createTransaction").should("have.property", "status", 200);

    cy.getTest("sidenav-open").click();
    cy.getTest("sidenav-user-balance").should("contain", "$525.00");
    cy.getTest("sidenav-close").click();

    cy.getTest("nav-public-tab").should("have.class", "Mui-selected");

    cy.getTest("transaction-list")
      .first()
      .should("contain", "Indian Food");
  });

  it("selects a user and submits a transaction request", function() {
    cy.getTest("nav-top-new-transaction").click();
    cy.getTestLike("user-list-item")
      .contains("Kaden")
      .click();
    cy.getTest("transaction-create-form").should("be.visible");

    cy.getTest("transaction-create-amount-input").type("9500");
    cy.getTest("transaction-create-description-input").type("Fancy Hotel");
    cy.getTest("transaction-create-submit-request").click();

    cy.wait("@createTransaction").should("have.property", "status", 200);

    cy.getTest("sidenav-open").click();
    cy.getTest("sidenav-user-balance").should("contain", "$550.00");
    cy.getTest("sidenav-close").click();

    cy.getTest("transaction-list").should("contain", "Fancy Hotel");
  });

  it("searches for a user by username", function() {
    cy.getTest("nav-top-new-transaction").click();

    cy.get("@users").then(users => {
      cy.getTest("user-list-search-input").within($elem => {
        cy.get("input")
          //  .scrollIntoView() // TODO: Bug? Does not work here
          //  .type({ force: true }) // type must be forced since hidden
          .type(this.users[6].username, { force: true })
          .blur();
      });
    });

    cy.wait("@usersSearch").should("have.property", "status", 200);
    cy.getTestLike("user-list-item")
      .first()
      .contains("Kaden");
  });

  it("searches for a user by email", function() {
    cy.getTest("nav-top-new-transaction").click();

    cy.get("@users").then(users => {
      cy.getTest("user-list-search-input").within($elem => {
        cy.get("input")
          //  .scrollIntoView() // TODO: Bug? Does not work here
          //  .type({ force: true }) // type must be forced since hidden
          .type(this.users[6].email, { force: true })
          .blur();
      });
    });

    cy.wait("@usersSearch").should("have.property", "status", 200);
    cy.getTestLike("user-list-item")
      .first()
      .contains("Kaden");
  });

  it("searches for a user by phone", function() {
    cy.getTest("nav-top-new-transaction").click();

    cy.get("@users").then(users => {
      const phone = this.users[6].phoneNumber.replace(/[^0-9]/g, "");
      const partialPhone = phone;

      cy.getTest("user-list-search-input").within($elem => {
        cy.get("input")
          //  .scrollIntoView() // TODO: Bug? Does not work here
          //  .type({ force: true }) // type must be forced since hidden
          .type(partialPhone, { force: true })
          .blur();
      });
    });

    cy.wait("@usersSearch").should("have.property", "status", 200);
    cy.getTestLike("user-list-item")
      .first()
      .contains("Kaden");
  });
});
