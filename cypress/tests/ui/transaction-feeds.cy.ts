import Dinero from "dinero.js";
import {
  User,
  Transaction,
  TransactionRequestStatus,
  TransactionResponseItem,
  Contact,
  TransactionStatus,
} from "../../../src/models";
import { addDays, isWithinInterval, startOfDay } from "date-fns";
import { startOfDayUTC, endOfDayUTC } from "../../../src/utils/transactionUtils";
import { isMobile } from "../../support/utils";

const { _ } = Cypress;

type TransactionFeedsCtx = {
  allUsers?: User[];
  user?: User;
  contactIds?: string[];
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

    cy.intercept("GET", "/notifications").as("notifications");
    cy.intercept("GET", "/transactions*").as(feedViews.personal.routeAlias);
    cy.intercept("GET", "/transactions/public*").as(feedViews.public.routeAlias);
    cy.intercept("GET", "/transactions/contacts*").as(feedViews.contacts.routeAlias);

    cy.database("filter", "users").then((users: User[]) => {
      ctx.user = users[0];
      ctx.allUsers = users;

      cy.loginByXstate(ctx.user.username);
    });
  });
  describe("app layout and responsiveness", function () {
    it("toggles the navigation drawer", function () {
      cy.wait("@notifications");
      cy.wait("@publicTransactions");
      if (isMobile()) {
        cy.getBySel("sidenav-home").should("not.exist");
        cy.visualSnapshot("Mobile Initial Side Navigation Not Visible");
        cy.getBySel("sidenav-toggle").click();
        cy.getBySel("sidenav-home").should("be.visible");
        cy.visualSnapshot("Mobile Toggle Side Navigation Visible");
        cy.get(".MuiBackdrop-root").click({ force: true });
        cy.getBySel("sidenav-home").should("not.exist");
        cy.visualSnapshot("Mobile Home Link Side Navigation Not Visible");

        cy.getBySel("sidenav-toggle").click();
        cy.getBySel("sidenav-home").click().should("not.exist");
        cy.visualSnapshot("Mobile Toggle Side Navigation Not Visible");
      } else {
        cy.getBySel("sidenav-home").should("be.visible");
        cy.visualSnapshot("Desktop Side Navigation Visible");
        cy.getBySel("sidenav-toggle").click();
        cy.getBySel("sidenav-home").should("not.be.visible");
        cy.visualSnapshot("Desktop Side Navigation Not Visible");
      }
    });
  });

  describe("renders and paginates all transaction feeds", function () {
    it("renders transactions item variations in feed", function () {
      cy.intercept("GET", "/transactions/public*", {
        headers: {
          "X-Powered-By": "Express",
          Date: new Date().toString(),
        },
        fixture: "public-transactions.json",
      }).as("mockedPublicTransactions");

      // Visit page again to trigger call to /transactions/public
      cy.visit("/");

      cy.wait("@notifications");
      cy.wait("@mockedPublicTransactions")
        .its("response.body.results")
        .then((transactions) => {
          const getTransactionFromEl = ($el: JQuery<Element>): TransactionResponseItem => {
            const transactionId = $el.data("test").split("transaction-item-")[1];
            return _.find(transactions, (transaction) => {
              return transaction.id === transactionId;
            })!;
          };

          cy.log("🚩Testing a paid payment transaction item");
          cy.contains("[data-test*='transaction-item']", "paid").within(($el) => {
            const transaction = getTransactionFromEl($el);
            const formattedAmount = Dinero({
              amount: transaction.amount,
            }).toFormat();

            expect([TransactionStatus.pending, TransactionStatus.complete]).to.include(
              transaction.status
            );

            expect(transaction.requestStatus).to.be.empty;

            cy.getBySelLike("like-count").should("have.text", `${transaction.likes.length}`);
            cy.getBySelLike("comment-count").should("have.text", `${transaction.comments.length}`);

            cy.getBySelLike("sender").should("contain", transaction.senderName);
            cy.getBySelLike("receiver").should("contain", transaction.receiverName);

            cy.getBySelLike("amount")
              .should("contain", `-${formattedAmount}`)
              .should("have.css", "color", "rgb(255, 0, 0)");
          });

          cy.log("🚩Testing a charged payment transaction item");
          cy.contains("[data-test*='transaction-item']", "charged").within(($el) => {
            const transaction = getTransactionFromEl($el);
            const formattedAmount = Dinero({
              amount: transaction.amount,
            }).toFormat();

            expect(TransactionStatus.complete).to.equal(transaction.status);

            expect(transaction.requestStatus).to.equal(TransactionRequestStatus.accepted);

            cy.getBySelLike("amount")
              .should("contain", `+${formattedAmount}`)
              .should("have.css", "color", "rgb(76, 175, 80)");
          });

          cy.log("🚩Testing a requested payment transaction item");
          cy.contains("[data-test*='transaction-item']", "requested").within(($el) => {
            const transaction = getTransactionFromEl($el);
            const formattedAmount = Dinero({
              amount: transaction.amount,
            }).toFormat();

            expect([TransactionStatus.pending, TransactionStatus.complete]).to.include(
              transaction.status
            );
            expect([
              TransactionRequestStatus.pending,
              TransactionRequestStatus.rejected,
            ]).to.include(transaction.requestStatus);

            cy.getBySelLike("amount")
              .should("contain", `+${formattedAmount}`)
              .should("have.css", "color", "rgb(76, 175, 80)");
          });
          cy.visualSnapshot("Transaction Item");
        });
    });

    _.each(feedViews, (feed, feedName) => {
      it(`paginates ${feedName} transaction feed`, function () {
        cy.getBySelLike(feed.tab)
          .click()
          .should("have.class", "Mui-selected")
          .contains(feed.tabLabel, { matchCase: false })
          .should("have.css", { "text-transform": "uppercase" });
        cy.getBySel("list-skeleton").should("not.exist");
        cy.visualSnapshot(`Paginate ${feedName}`);

        cy.wait(`@${feed.routeAlias}`)
          .its("response.body.results")
          .should("have.length", Cypress.env("paginationPageSize"));

        // Temporary fix: https://github.com/cypress-io/cypress-realworld-app/issues/338
        if (isMobile()) {
          cy.wait(10);
        }

        cy.log("📃 Scroll to next page");
        cy.getBySel("transaction-list").children().scrollTo("bottom");

        cy.wait(`@${feed.routeAlias}`)
          .its("response.body")
          .then(({ results, pageData }) => {
            expect(results).have.length(Cypress.env("paginationPageSize"));
            expect(pageData.page).to.equal(2);
            cy.visualSnapshot(`Paginate ${feedName} Next Page`);
            cy.nextTransactionFeedPage(feed.service, pageData.totalPages);
          });

        cy.wait(`@${feed.routeAlias}`)
          .its("response.body")
          .then(({ results, pageData }) => {
            expect(results).to.have.length.least(1);
            expect(pageData.page).to.equal(pageData.totalPages);
            expect(pageData.hasNextPages).to.equal(false);
            cy.visualSnapshot(`Paginate ${feedName} Last Page`);
          });
      });
    });
  });

  describe("filters transaction feeds by date range", function () {
    if (isMobile()) {
      it("closes date range picker modal", () => {
        cy.getBySelLike("filter-date-range-button").click({ force: true });
        cy.get(".Cal__Header__root").should("be.visible");
        cy.visualSnapshot("Mobile Open Date Range Picker");
        cy.getBySel("date-range-filter-drawer-close").click();
        cy.get(".Cal__Header__root").should("not.exist");
        cy.visualSnapshot("Mobile Close Date Range Picker");
      });
    }

    _.each(feedViews, (feed, feedName) => {
      it(`filters ${feedName} transaction feed by date range`, function () {
        cy.database("find", "transactions").then((transaction: Transaction) => {
          const dateRangeStart = startOfDay(new Date(transaction.createdAt));
          const dateRangeEnd = endOfDayUTC(addDays(dateRangeStart, 1));

          cy.getBySelLike(feed.tab).click().should("have.class", "Mui-selected");

          cy.wait(`@${feed.routeAlias}`).its("response.body.results").as("unfilteredResults");

          cy.pickDateRange(dateRangeStart, dateRangeEnd);

          cy.wait(`@${feed.routeAlias}`)
            .its("response.body.results")
            .then((transactions: Transaction[]) => {
              cy.getBySelLike("transaction-item").should("have.length", transactions.length);

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

              cy.visualSnapshot("Date Range Filtered Transactions");
            });

          cy.log("Clearing date range filter. Data set should revert");
          cy.getBySelLike("filter-date-clear-button").click({
            force: true,
          });
          cy.getBySelLike("filter-date-range-button").should("contain", "ALL");

          cy.get("@unfilteredResults").then((unfilteredResults) => {
            cy.wait(`@${feed.routeAlias}`)
              .its("response.body.results")
              .should("deep.equal", unfilteredResults);
            cy.visualSnapshot("Unfiltered Transactions");
          });
        });
      });

      it(`does not show ${feedName} transactions for out of range date limits`, function () {
        const dateRangeStart = startOfDay(new Date(2014, 1, 1));
        const dateRangeEnd = endOfDayUTC(addDays(dateRangeStart, 1));

        cy.getBySelLike(feed.tab).click();
        cy.wait(`@${feed.routeAlias}`);

        cy.pickDateRange(dateRangeStart, dateRangeEnd);
        cy.wait(`@${feed.routeAlias}`);

        cy.getBySelLike("transaction-item").should("have.length", 0);
        cy.getBySel("empty-list-header").should("contain", "No Transactions");
        cy.getBySelLike("empty-create-transaction-button")
          .should("have.attr", "href", "/transaction/new")
          .contains("create a transaction", { matchCase: false })
          .should("have.css", { "text-transform": "uppercase" });
        cy.visualSnapshot("No Transactions");
      });
    });
  });

  describe("filters transaction feeds by amount range", function () {
    const dollarAmountRange = {
      min: 200,
      max: 800,
    };

    _.each(feedViews, (feed, feedName) => {
      it(`filters ${feedName} transaction feed by amount range`, function () {
        cy.getBySelLike(feed.tab).click({ force: true }).should("have.class", "Mui-selected");

        cy.wait(`@${feed.routeAlias}`).its("response.body.results").as("unfilteredResults");

        cy.setTransactionAmountRange(dollarAmountRange.min, dollarAmountRange.max);

        cy.getBySelLike("filter-amount-range-text").should(
          "contain",
          `$${dollarAmountRange.min} - $${dollarAmountRange.max}`
        );

        // @ts-ignore
        cy.wait(`@${feed.routeAlias}`).then(({ response: { body, url } }) => {
          const transactions = body.results as TransactionResponseItem[];
          const urlParams = new URLSearchParams(_.last(url.split("?")));

          const rawAmountMin = dollarAmountRange.min * 100;
          const rawAmountMax = dollarAmountRange.max * 100;

          expect(urlParams.get("amountMin")).to.equal(`${rawAmountMin}`);
          expect(urlParams.get("amountMax")).to.equal(`${rawAmountMax}`);

          cy.visualSnapshot("Amount Range Filtered Transactions");
          transactions.forEach(({ amount }) => {
            expect(amount).to.be.within(rawAmountMin, rawAmountMax);
          });
        });

        cy.getBySelLike("amount-clear-button").click();

        if (isMobile()) {
          cy.getBySelLike("amount-range-filter-drawer-close").click();
          cy.getBySel("amount-range-filter-drawer").should("not.exist");
        } else {
          cy.getBySel("transaction-list-filter-amount-clear-button").click();
          cy.getBySel("main").scrollTo("top");
          cy.getBySel("transaction-list-filter-date-range-button").click({ force: true });
          cy.getBySel("transaction-list-filter-amount-range").should("not.be.visible");
        }

        cy.get("@unfilteredResults").then((unfilteredResults) => {
          cy.wait(`@${feed.routeAlias}`)
            .its("response.body.results")
            .should("deep.equal", unfilteredResults);
          cy.visualSnapshot("Unfiltered Transactions");
        });
      });

      it(`does not show ${feedName} transactions for out of range amount limits`, function () {
        cy.getBySelLike(feed.tab).click();
        cy.wait(`@${feed.routeAlias}`);

        cy.setTransactionAmountRange(550, 1000);
        cy.getBySelLike("filter-amount-range-text").should("contain", "$550 - $1,000");
        cy.wait(`@${feed.routeAlias}`);

        cy.getBySelLike("transaction-item").should("have.length", 0);
        cy.getBySel("empty-list-header").should("contain", "No Transactions");
        cy.getBySelLike("empty-create-transaction-button")
          .should("have.attr", "href", "/transaction/new")
          .contains("create a transaction", { matchCase: false })
          .should("have.css", { "text-transform": "uppercase" });
        cy.visualSnapshot("No Transactions");
      });
    });
  });

  describe("Feed Item Visibility", () => {
    it("mine feed only shows personal transactions", function () {
      cy.database("filter", "contacts", { userId: ctx.user!.id }).then((contacts: Contact[]) => {
        ctx.contactIds = contacts.map((contact) => contact.contactUserId);
      });

      cy.getBySelLike(feedViews.personal.tab).click();

      cy.wait("@personalTransactions")
        .its("response.body.results")
        .each((transaction: Transaction) => {
          const transactionParticipants = [transaction.senderId, transaction.receiverId];
          expect(transactionParticipants).to.include(ctx.user!.id);
        });
      cy.getBySel("list-skeleton").should("not.exist");
      cy.visualSnapshot("Personal Transactions");
    });

    it("first five items belong to contacts in public feed", function () {
      cy.database("filter", "contacts", { userId: ctx.user!.id }).then((contacts: Contact[]) => {
        ctx.contactIds = contacts.map((contact) => contact.contactUserId);
      });

      cy.wait("@publicTransactions")
        .its("response.body.results")
        .invoke("slice", 0, 5)
        .each((transaction: Transaction) => {
          const transactionParticipants = [transaction.senderId, transaction.receiverId];

          const contactsInTransaction = _.intersection(transactionParticipants, ctx.contactIds!);
          const message = `"${contactsInTransaction}" are contacts of ${ctx.user!.id}`;
          expect(contactsInTransaction, message).to.not.be.empty;
        });
      cy.getBySel("list-skeleton").should("not.exist");
      cy.visualSnapshot("First 5 Transaction Items belong to contacts");
    });

    it("friends feed only shows contact transactions", function () {
      cy.database("filter", "contacts", { userId: ctx.user!.id }).then((contacts: Contact[]) => {
        ctx.contactIds = contacts.map((contact) => contact.contactUserId);
      });

      cy.getBySelLike(feedViews.contacts.tab).click();

      cy.wait("@contactsTransactions")
        .its("response.body.results")
        .each((transaction: Transaction) => {
          const transactionParticipants = [transaction.senderId, transaction.receiverId];

          const contactsInTransaction = _.intersection(ctx.contactIds!, transactionParticipants);

          const message = `"${contactsInTransaction}" are contacts of ${ctx.user!.id}`;
          expect(contactsInTransaction, message).to.not.be.empty;
        });
      cy.getBySel("list-skeleton").should("not.exist");
      cy.visualSnapshot("Friends Feed only shows contacts transactions");
    });
  });
});
