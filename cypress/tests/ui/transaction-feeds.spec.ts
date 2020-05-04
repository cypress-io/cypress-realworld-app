import Dinero from "dinero.js";
import {
  User,
  Transaction,
  TransactionRequestStatus,
  TransactionResponseItem,
  Contact,
} from "../../../src/models";
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
  const isMobile =
    Cypress.config("viewportWidth") < Cypress.env("mobileViewportWidth");
  const initialFeedItemCount = isMobile ? 5 : 8;

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
    if (isMobile) {
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
        // cy.viewport("iphone-6"); // for review demo
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

  describe("renders and paginates all transaction feeds", function () {
    _.each(feedViews, (feed, feedName) => {
      it(`renders and paginates ${feedName} transaction feed`, function () {
        cy.getTestLike(feed.tab)
          .click()
          .should("have.class", "Mui-selected")
          .contains(feed.tabLabel, { matchCase: false })
          .should("have.css", { "text-transform": "uppercase" });

        cy.wait(`@${feed.routeAlias}`)
          .its("response.body.results")
          .should("have.length", Cypress.env("paginationPageSize"))
          .then((transactions) => {
            cy.getTestLike("transaction-item")
              .should("have.length", initialFeedItemCount)
              .each(($el) => {
                const transactionId = _.last(
                  // @ts-ignore
                  // TODO: generate only alphanumeric ids
                  $el.get(0).dataset.test.split("transaction-item-")
                );
                const transaction = _.find(transactions, {
                  id: transactionId,
                })!;
                const formattedAmount = Dinero({
                  amount: transaction.amount,
                }).toFormat();

                cy.wrap($el.get(0), { log: false })
                  .should("contain", transaction.description)
                  .within(() => {
                    cy.getTestLike("like-count").should(
                      "have.text",
                      `${transaction.likes.length}`
                    );
                    cy.getTestLike("comment-count").should(
                      "have.text",
                      `${transaction.comments.length}`
                    );

                    cy.getTestLike("sender").should(
                      "contain",
                      transaction.senderName
                    );
                    cy.getTestLike("receiver").should(
                      "contain",
                      transaction.receiverName
                    );

                    if (transaction.requestStatus) {
                      const expectedAction =
                        transaction.requestStatus ===
                        TransactionRequestStatus.accepted
                          ? "charged"
                          : "requested";

                      cy.getTestLike("action").should(
                        "contain",
                        expectedAction
                      );

                      return cy
                        .getTestLike("amount")
                        .should("contain", `+${formattedAmount}`)
                        .should("have.css", "color", "rgb(76, 175, 80)");
                    }

                    cy.getTestLike("action").should("contain", "paid");
                    cy.getTestLike("amount")
                      .should("contain", `-${formattedAmount}`)
                      .should("have.css", "color", "rgb(255, 0, 0)");
                  });
              });
          });

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

          cy.getTestLike("filter-date-clear-button").click({
            force: true,
          });

          cy.get("@unfilteredResults").then((unfilteredResults) => {
            cy.wait(`@${feed.routeAlias}`)
              .its("response.body.results")
              .should("deep.equal", unfilteredResults);
          });
        });
      });
    });
  });

  // TODO: add a test to filter for transaction out of known seed date range limit
  describe("filters transaction feeds by amount range", function () {
    const dollarAmountRange = {
      min: 200,
      max: 800,
    };

    _.each(feedViews, (feed, feedName) => {
      it(`filters ${feedName} transaction feed by amount range`, function () {
        cy.getTestLike(feed.tab)
          .click({ force: true })
          .should("have.class", "Mui-selected");

        cy.wait(`@${feed.routeAlias}`);

        cy.getTest("transaction-list-filter-amount-range-button")
          .scrollIntoView()
          .click({ force: true });

        cy.setTransactionAmountRange(
          dollarAmountRange.min,
          dollarAmountRange.max
        );

        cy.getTestLike("filter-amount-range-text").should(
          "contain",
          `$${dollarAmountRange.min} - $${dollarAmountRange.max}`
        );

        cy.wait(`@${feed.routeAlias}`).then(({ response: { body }, url }) => {
          // @ts-ignore
          const transactions = body.results as TransactionResponseItem[];
          const urlParams = new URLSearchParams(_.last(url.split("?")));

          const rawAmountMin = dollarAmountRange.min * 100;
          const rawAmountMax = dollarAmountRange.max * 100;

          expect(urlParams.get("amountMin")).to.equal(`${rawAmountMin}`);
          expect(urlParams.get("amountMax")).to.equal(`${rawAmountMax}`);

          transactions.forEach(({ amount }) => {
            expect(amount).to.be.within(rawAmountMin, rawAmountMax);
          });
        });
      });
    });
  });

  describe("Feed Item Visibility", () => {
    it("mine feed only shows personal transactions", function () {
      cy.task("filter:testData", {
        entity: "contacts",
        filterAttrs: { userId: ctx.user!.id },
      }).then((contacts: Contact[]) => {
        cy.visit("/personal");

        cy.wait("@personalTransactions")
          .its("response.body.results")
          .each((transaction: Transaction) => {
            const transactionParticipants = [
              transaction.senderId,
              transaction.receiverId,
            ];
            expect(transactionParticipants).to.include(ctx.user!.id);
          });
      });
    });

    it.skip("friends feed only shows contact transactions", function () {
      cy.task("filter:testData", {
        entity: "contacts",
        filterAttrs: { userId: ctx.user!.id },
      }).then((contacts: Contact[]) => {
        // FIX ME: contacts seed generator an can generate duplicate contacts
        const contactIds = contacts.map((contact) => contact.contactUserId);
        cy.visit("/personal");

        cy.wait("@personalTransactions")
          .its("response.body.results")
          .each((transaction: Transaction) => {
            const transactionParticipants = [
              transaction.senderId,
              transaction.receiverId,
            ];
            expect(transactionParticipants).to.include.members(contactIds);
          });
      });
    });
  });
});
