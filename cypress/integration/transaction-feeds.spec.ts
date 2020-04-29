import { User, Transaction } from "../../src/models";
import { addDays, isWithinInterval, startOfDay } from "date-fns";
import { startOfDayUTC, endOfDayUTC } from "../../src/utils/transactionUtils";

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

  // TODO: temporary placement
  describe("ancillary tests", function () {
    it("defaults side navigation to closed (mobile)", function () {
      cy.viewport("iphone-6");
      cy.getTest("sidenav-user-balance").should("not.be.visible");
    });

    it("defaults side navigation to open (desktop)", function () {
      cy.getTest("sidenav-user-balance").should("be.visible");
    });

    it("shows amount range in drawer on mobile", function () {
      cy.viewport("iphone-6");

      cy.getTest("nav-personal-tab")
        .click()
        .should("have.class", "Mui-selected");
      cy.getTestLike("filter-amount-range-button").click({ force: true });
      cy.getTest("amount-range-filter-drawer").should("be.visible");
      cy.getTest("amount-range-filter-drawer-close").click();
    });

    it("shows date range calendar full screen on mobile", function () {
      cy.viewport("iphone-6");

      cy.getTest("nav-personal-tab")
        .click()
        .should("have.class", "Mui-selected");

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
  });

  describe("renders and paginates all transaction feeds", function () {
    const feedViews = [
      // TODO: the new seed for public transactions currently only has 5 transactions,
      //       which is less than the pagination page limit. This introduces a new test case
      //       where a paginated view renders a list with only 1 page to load
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
      it(`renders and paginates ${feed.tabLabel} transaction feed`, function () {
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

        // TODO: Flakey assertion
        // cy.getTest("transaction-loading").should("be.visible");

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
  });

  describe("filters transaction feeds by date range", function () {
    it("filters mine (personal) transaction feed by date range", function () {
      cy.task("find:testData", {
        entity: "transactions",
      }).then((transaction: Transaction) => {
        const dateRangeStart = startOfDay(new Date(transaction.createdAt));
        const dateRangeEnd = endOfDayUTC(addDays(dateRangeStart, 1));

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
              const createdAtDate = startOfDayUTC(new Date(createdAt));

              expect(
                isWithinInterval(createdAtDate, {
                  start: startOfDayUTC(dateRangeStart),
                  end: dateRangeEnd,
                }),
                `transaction created date (${createdAtDate.toISOString()}) 
                is within ${dateRangeStart.toISOString()} 
                and ${dateRangeEnd.toISOString()}`
              ).to.equal(true);
            });
          });

        cy.getTestLike("filter-date-clear-button").click({ force: true });

        cy.get("@unfilteredResults").then(
          // @ts-ignore
          (unfilteredResults: Transaction[]) => {
            cy.wait("@personalTransactions")
              .its("response.body.results")
              .should("deep.equal", unfilteredResults);
          }
        );
      });
    });
  });

  // TODO: add a test to filter for transaction out of known seed date range limit

  describe("filters transaction feeds by amount range", function () {
    it("filters public (everyone) transaction feed by amount range", function () {
      cy.getTest("nav-public-tab")
        .click({ force: true })
        .should("have.class", "Mui-selected");

      cy.getTest("transaction-list-filter-amount-range-button")
        .scrollIntoView()
        .click({ force: true });

      cy.get("[data-index='0']")
        .trigger("mousedown", { force: true })
        .trigger("mousemove", 10, -10, { force: true });

      cy.get("[data-index='1']")
        .trigger("mousedown", { force: true })
        .trigger("mousemove", -100, 100, { force: true });

      cy.getTest("transaction-list-filter-amount-range-text")
        .should("contain", "$40")
        .and("contain", "$300");

      cy.wait("@publicTransactions");

      cy.getTestLike("transaction-item").should("have.length.greaterThan", 1);
    });
  });
});
