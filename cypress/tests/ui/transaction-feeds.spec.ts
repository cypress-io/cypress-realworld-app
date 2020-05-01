import { User, Transaction } from "../../../src/models";
import { addDays, isWithinInterval, startOfDay } from "date-fns";
import {
  startOfDayUTC,
  endOfDayUTC,
} from "../../../src/utils/transactionUtils";

const { _ } = Cypress;

type TransactionFeedsCtx = {
  allUsers?: User[];
  user?: User;
};

describe("Transaction Feed", function () {
  const ctx: TransactionFeedsCtx = {};

  const feedViews = {
    public: {
      tab: "public-tab",
      tabLabel: "everyone",
      routeAlias: "publicTransactions",
      service: "publicTransactionService",
    },
    contacts: {
      tab: "contacts-tab",
      tabLabel: "friends",
      routeAlias: "contactsTransactions",
      service: "contactTransactionService",
    },
    personal: {
      tab: "personal-tab",
      tabLabel: "mine",
      routeAlias: "personalTransactions",
      service: "personalTransactionService",
    },
  };

  beforeEach(function () {
    cy.task("db:seed");

    cy.server();
    cy.route("/transactions*").as(feedViews.personal.routeAlias);
    cy.route("/transactions/public*").as(feedViews.public.routeAlias);
    cy.route("/transactions/contacts*").as(feedViews.contacts.routeAlias);

    cy.task("filter:testData", { entity: "users" }).then((users: User[]) => {
      ctx.user = users[0];
      ctx.allUsers = users;

      cy.loginByXstate(ctx.user.username);
    });
  });

  // TODO: temporary placement
  describe("ancillary tests", function () {
    if (Cypress.config("viewportWidth") < 414) {
      it("defaults side navigation to closed (mobile)", function () {
        cy.getTest("sidenav-user-balance").should("not.be.visible");
      });

      it("shows amount range in drawer on mobile", function () {
        cy.getTest("nav-personal-tab")
          .click()
          .should("have.class", "Mui-selected");
        cy.getTestLike("filter-amount-range-button").click({ force: true });
        cy.getTest("amount-range-filter-drawer").should("be.visible");
        cy.getTest("amount-range-filter-drawer-close").click();
      });

      it("shows date range calendar full screen on mobile", function () {
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
    } else {
      it("defaults side navigation to open (desktop)", function () {
        cy.getTest("sidenav-user-balance").should("be.visible");
      });
    }
  });

  // TODO: expand test to verify that amount formatting based on +/-
  describe("renders and paginates all transaction feeds", function () {
    _.each(feedViews, (feed, feedName) => {
      it(`renders and paginates ${feedName} transaction feed`, function () {
        cy.getTestLike(feed.tab)
          .click()
          .should("have.class", "Mui-selected")
          .contains(feed.tabLabel, { matchCase: false })
          .should("have.css", { "text-transform": "uppercase" });

        // Assert at the network layer
        cy.wait(`@${feed.routeAlias}`)
          .its("response.body.results")
          .should("have.length", Cypress.env("paginationPageSize"));

        // Assert visible UI
        cy.getTestLike("transaction-item").should(
          "have.length.within",
          5,
          parseInt(Cypress.env("paginationPageSize"))
        );

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
    _.each(feedViews, (feed, feedName) => {
      it(`filters ${feedName} transaction feed by date range`, function () {
        cy.task("find:testData", {
          entity: "transactions",
        }).then((transaction: Transaction) => {
          const dateRangeStart = startOfDay(new Date(transaction.createdAt));
          const dateRangeEnd = endOfDayUTC(addDays(dateRangeStart, 1));

          cy.getTestLike(feed.tab).click().should("have.class", "Mui-selected");

          cy.wait(`@${feed.routeAlias}`)
            .its("response.body.results")
            .as("unfilteredResults");

          cy.pickDateRange(dateRangeStart, dateRangeEnd);

          cy.wait(`@${feed.routeAlias}`)
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
              cy.wait(`@${feed.routeAlias}`)
                .its("response.body.results")
                .should("deep.equal", unfilteredResults);
            }
          );
        });
      });
    });
  });

  // TODO: add a test to filter for transaction out of known seed date range limit

  describe("filters transaction feeds by amount range", function () {
    _.each(feedViews, (feed, feedName) => {
      it(`filters ${feedName} transaction feed by amount range`, function () {
        cy.getTestLike(feed.tab)
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

        cy.wait(`@${feed.routeAlias}`);

        cy.getTestLike("transaction-item").should("have.length.greaterThan", 1);
      });
    });
  });
});
