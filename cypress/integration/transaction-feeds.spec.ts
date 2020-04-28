// @ts-check

import { User, Transaction } from "../../src/models";
import { addDays, isWithinRange } from "date-fns";

type TransactionFeedsCtx = {
  allUsers?: User[];
  user?: User;
};

describe("Transaction Feed", function () {
  const ctx: TransactionFeedsCtx = {};

  beforeEach(function () {
    cy.task("db:seed");

    cy.server();
    cy.route("/transactions*").as("personalTransactions");
    cy.route("/transactions/public*").as("publicTransactions");
    cy.route("/transactions/contacts*").as("contactsTransactions");

    cy.task("filter:testData", { entity: "users" }).then((users: User[]) => {
      ctx.user = users[0];
      ctx.allUsers = users;

      cy.loginByXstate(ctx.user.username);
    });
  });

  it("renders the app", function () {
    cy.getTest("app-name-logo").should("be.visible");
  });

  it("defaults side navigation to closed (mobile)", function () {
    cy.viewport("iphone-6");
    cy.getTest("sidenav-user-balance").should("not.be.visible");
  });

  it("defaults side navigation to open (desktop)", function () {
    cy.getTest("sidenav-user-balance").should("be.visible");
  });

  const feedViews = [
    {
      tab: "nav-public-tab",
      tabLabel: "everyone",
      routeAlias: "publicTransactions",
      service: "publicTransactionService",
    },
    {
      tab: "nav-contacts-tab",
      tabLabel: "friends",
      routeAlias: "contactsTransactions",
      service: "contactTransactionService",
    },
    {
      tab: "nav-personal-tab",
      tabLabel: "mine",
      routeAlias: "personalTransactions",
      service: "personalTransactionService",
    },
  ];

  feedViews.forEach((feed) => {
    it(`renders ${feed.tabLabel} transaction feed (infinite list)`, function () {
      cy.getTest(feed.tab)
        .click()
        .should("have.class", "Mui-selected")
        .contains(feed.tabLabel, { matchCase: false })
        .should("have.css", { "text-transform": "uppercase" });

      // Assert at the network layer
      cy.wait(`@${feed.routeAlias}`)
        .its("response.body.results")
        .should("have.length", Cypress.env("paginationPageSize"));

      // Assert visible UI
      cy.getTestLike("transaction-item").should("have.length", 8);

      // Scroll to paginate to next page
      cy.getTest("transaction-list").children().scrollTo("bottom");

      // TODO: Flakey assertion, seems to only fail for personal tab
      cy.getTest("transaction-loading").should("be.visible");

      cy.wait(`@${feed.routeAlias}`)
        .its("response.body")
        .then(({ results, pageData }) => {
          expect(results).have.length(Cypress.env("paginationPageSize"));
          expect(pageData.page).to.equal(2);
          // @ts-ignore
          cy.nextTransactionFeedPage(feed.service, pageData.totalPages);
        });

      cy.wait(`@${feed.routeAlias}`)
        .its("response.body")
        .then(({ results, pageData }) => {
          expect(results).to.have.length.greaterThan(1);
          expect(pageData.page).to.equal(pageData.totalPages);
          expect(pageData.hasNextPages).to.equal(false);
        });
    });
  });

  it("shows date range calendar full screen on mobile", function () {
    cy.viewport("iphone-6");

    cy.getTest("nav-personal-tab").click().should("have.class", "Mui-selected");

    cy.getTestLike("filter-date-range-button")
      .scrollIntoView()
      .click({ force: true });

    cy.getTest("date-range-filter-drawer").should("be.visible");

    // Potential Cypress Bug:
    // This is a potential bug with two overlapping fixed elements
    // https://github.com/cypress-io/cypress/issues/1242
    // https://github.com/cypress-io/cypress/issues/5959
    // cy.getTest("app-name-logo").should("not.be.visible");

    cy.getTest("date-range-filter-drawer-close").click();
  });

  it("shows amount range in drawer on mobile", function () {
    cy.viewport("iphone-6");

    cy.getTest("nav-personal-tab").click().should("have.class", "Mui-selected");
    cy.getTestLike("filter-amount-range-button").click({ force: true });
    cy.getTest("amount-range-filter-drawer").should("be.visible");
    cy.getTest("amount-range-filter-drawer-close").click();
  });

  it("renders mine (personal) transaction feed, filters by date range, then clears the date range filter", function () {
    cy.task("find:testData", {
      entity: "transactions",
    }).then((transaction: Transaction) => {
      const dateRangeStart = new Date(transaction.createdAt);
      const dateRangeEnd = addDays(dateRangeStart, 1);

      cy.getTest("nav-personal-tab")
        .click()
        .should("have.class", "Mui-selected");

      cy.wait("@personalTransactions")
        .its("response.body.results")
        .as("unfilteredResults");

      cy.pickDateRange(dateRangeStart, dateRangeEnd);

      cy.wait("@personalTransactions")
        .its("response.body.results")
        .then((transactions: Transaction[]) => {
          cy.getTestLike("transaction-item").should(
            "have.length",
            transactions.length
          );

          transactions.forEach(({ createdAt }) => {
            expect(
              isWithinRange(createdAt, dateRangeStart, dateRangeEnd)
            ).to.equal(true);

            // Fixme: using chai-datetime plugin results in "TypeError: date.getFullYear is not a function"
            // expect(createdAt).to.be.withinDate(dateRangeStart, dateRangeEnd);
          });
        });

      cy.getTestLike("filter-date-clear-button").click({ force: true });

      // @ts-ignore
      cy.get("@unfilteredResults").then((unfilteredResults: Transaction[]) => {
        cy.wait("@personalTransactions")
          .its("response.body.results")
          .should("deep.equal", unfilteredResults);
      });
    });
  });

  // TODO: add a test to filter for transaction out of known seed date range limit

  it.skip("renders mine (personal) transaction feed, filters by amount range, then clears the amount range filter", function () {
    cy.getTest("nav-personal-tab")
      .click({ force: true })
      .should("have.class", "Mui-selected");

    cy.getTest("transaction-list-filter-amount-range-button")
      .scrollIntoView()
      .click({ force: true });

    cy.window().invoke("handleAmountRangeChange", [null, [2, 50]]);

    // DISCUSS:
    // How to set hidden input values like this?
    // cy.getTest("transaction-list-filter-amount-range-slider")
    //   .find("[data-index='0']")
    //   .trigger("mousedown");

    cy.getTest("transaction-list-filter-amount-range-text")
      .should("contain", "$30")
      .and("contain", "$100");

    cy.wait("@personalTransactions");

    cy.getTest("transaction-list").children().should("have.length", 3);
  });
});
