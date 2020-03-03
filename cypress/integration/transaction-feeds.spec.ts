// check this file using TypeScript if available
// @ts-check

describe("Transaction Feed", function() {
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

  it("defaults side navigation to closed", function() {
    cy.getTest("drawer-icon").should("be.visible");
  });

  it("renders everyone (public) transaction feeds (friends, public)", function() {
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

  it("renders friends (contacts) transaction feed", function() {
    cy.getTest("main").scrollTo("top");
    cy.getTest("nav-contacts-tab") // On get Navigation tabs are hidden under the AppBar in the UI
      .scrollIntoView() // TODO: Bug? Does not work as expected to scroll the tab into view
      .click({ force: true }) // Current solution is to force the click
      .should("have.class", "Mui-selected");
    cy.getTest("transaction-list")
      .children()
      .should("have.length", 17);
  });

  it("renders mine (personal) transaction feed", function() {
    cy.getTest("main").scrollTo("top");
    cy.getTest("nav-personal-tab")
      .click({ force: true })
      .should("have.class", "Mui-selected");
    cy.getTest("transaction-list")
      .children()
      .should("have.length", 9);
  });

  it("shows date range calendar full screen on mobile", function() {
    cy.viewport("iphone-6");
    cy.getTest("main").scrollTo("top");
    cy.getTest("nav-personal-tab")
      .click({ force: true })
      .should("have.class", "Mui-selected");

    cy.getTest("transaction-list-filter-date-range-button")
      .scrollIntoView()
      .click({ force: true });

    cy.getTest("nav-personal-tab").should("not.be.visible");
  });

  it("renders mine (personal) transaction feed, filters by date range, then clears the date range filter", function() {
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
    cy.get("[data-date='2019-12-03']").click({ force: true });

    /*
    cy.getTest("main").scrollTo("top"); // TODO: does not work to scroll button into view either
    cy.getTest("transaction-list-filter-date-range-button")
      .scrollIntoView() // TODO: Does not work
      .should("contain", "2019-12-01")
      .should("contain", "2019-12-03");*/

    cy.wait("@personalTransactions");

    cy.getTest("transaction-list")
      .children()
      .should("have.length", 3);

    cy.getTest("transaction-list-filter-date-clear-button")
      .scrollIntoView()
      .click({ force: true });

    cy.getTest("transaction-list")
      .children()
      .should("have.length.greaterThan", 3);
  });

  it("renders mine (personal) transaction feed, filters by date range, then shows empty state", function() {
    cy.getTest("main").scrollTo("top");
    cy.getTest("nav-personal-tab")
      .click({ force: true })
      .should("have.class", "Mui-selected");

    cy.getTest("transaction-list-filter-date-range-button")
      .scrollIntoView()
      .click({ force: true });

    cy.get("[data-date='2020-02-01']").click({ force: true });
    cy.get("[data-date='2020-02-03']").click({ force: true });

    cy.wait("@personalTransactions");

    cy.getTestLike("transaction-list-item").should("not.be.visible");

    cy.getTest("empty-list-header").should("be.visible");

    cy.getTest("transaction-list-empty-create-transaction-button")
      .scrollIntoView()
      .click({ force: true });

    cy.location("pathname").should("eq", "/transaction/new");
  });

  it.skip("renders mine (personal) transaction feed, filters by amount range, then clears the amount range filter", function() {
    cy.getTest("main").scrollTo("top");
    cy.getTest("nav-personal-tab")
      .click({ force: true })
      .should("have.class", "Mui-selected");

    cy.getTest("transaction-list-filter-amount-range-button")
      .scrollIntoView()
      .click({ force: true });

    cy.getTest("transaction-list-filter-amount-range-slider")
      .find('input[type="hidden"]')
      .invoke("val", "3,10")
      .trigger("input", { force: true });

    cy.getTest("transaction-list-filter-amount-range-text")
      .should("contain", "$30")
      .and("contain", "$100");

    cy.wait("@personalTransactions");

    cy.getTest("transaction-list")
      .children()
      .should("have.length", 3);
  });
});
