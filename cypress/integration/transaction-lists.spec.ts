// check this file using TypeScript if available
// @ts-check

describe("Transaction Lists", function() {
  before(function() {
    cy.fixture("users").as("users");
    cy.get("@users").then(users => {
      cy.login(this.users[0].username);
    });
  });
  beforeEach(function() {
    cy.task("db:seed");
    // TODO: Highlight this use case
    Cypress.Cookies.preserveOnce("connect.sid");
    cy.server();
    cy.route("GET", "/transactions*").as("personalTransactions");
  });
  after(function() {
    cy.task("db:seed");
  });

  it("renders the app", function() {
    cy.getTest("app-name-logo").should("contain", "Pay App");
  });

  it("defaults side navigation to open", function() {
    cy.getTest("drawer-icon").should("not.be.visible");
  });

  it("renders public transaction lists (contacts, public)", function() {
    cy.getTest("transaction-list").should("have.length", 2);

    cy.getTest("nav-public-tab").should("have.class", "Mui-selected");

    cy.getTest("transaction-list")
      .first()
      .children()
      .should("have.length", 17);

    cy.getTest("transaction-list")
      .last()
      .children()
      .should("have.length", 3);
  });

  it("renders contacts transaction list", function() {
    cy.getTest("main").scrollTo("top");
    cy.getTest("nav-contacts-tab") // On get Navigation tabs are hidden under the AppBar in the UI
      .scrollIntoView() // TODO: Bug? Does not work as expected to scroll the tab into view
      .click({ force: true }) // Current solution is to force the click
      .should("have.class", "Mui-selected");
    cy.getTest("transaction-list")
      .children()
      .should("have.length", 17);
  });

  it("renders personal transaction list", function() {
    cy.getTest("main").scrollTo("top");
    cy.getTest("nav-personal-tab")
      .click({ force: true })
      .should("have.class", "Mui-selected");
    cy.getTest("transaction-list")
      .children()
      .should("have.length", 9);
  });

  it("renders personal transaction list, filters by date range", function() {
    // Set clock to date and time for when tests are run on CI
    cy.clock(
      new Date(
        "Thu Feb 20 2020 11:49:33 GMT-0600 (Central Standard Time)"
      ).valueOf(),
      ["Date"]
    );
    cy.getTest("main").scrollTo("top");
    cy.getTest("nav-personal-tab")
      .click({ force: true })
      .should("have.class", "Mui-selected");

    // TODO: Another example of scrollIntoView not working; resort to force clicks
    cy.getTest("transaction-list-filter-date-range-button")
      .scrollIntoView()
      .click({ force: true });

    // Idea?
    //cy.get("[data-date='2019-11-17']").scrollIntoView();

    cy.get("[data-date='2019-12-01']").click({ force: true });
    cy.get("[data-date='2019-12-05']").click({ force: true });

    /*
    cy.getTest("main").scrollTo("top"); // TODO: does not work to scroll button into view either
    cy.getTest("transaction-list-filter-date-range-button")
      .scrollIntoView() // TODO: Does not work
      .should("contain", "2019-12-01")
      .should("contain", "2019-12-05");*/

    cy.wait("@personalTransactions");

    cy.getTest("transaction-list")
      .children()
      .should("have.length", 4);
  });
});
