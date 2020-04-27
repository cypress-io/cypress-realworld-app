// @ts-check

import { User } from "../../src/models";

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

  it.skip("renders everyone (public) (infinite list)", function () {
    // Discussion: Should repeated assertions like this be wrapped up in commands
    cy.getTest("nav-public-tab")
      .should("have.class", "Mui-selected")
      .contains("everyone", { matchCase: false })
      .should("have.css", { "text-transform": "uppercase" });

    // Assert at the network layer
    // TODO: make 10 an importable constant
    cy.wait("@publicTransactions")
      .its("response.body.results")
      .should("have.length", 10);

    cy.getTestLike("transaction-item").should("have.length", 8);

    cy.getTest("transaction-list").children().scrollTo("bottom");

    cy.wait("@publicTransactions")
      .its("response.body")
      .then(({ results, pageData }) => {
        expect(results).have.length(10);
        expect(pageData.page).to.equal(2);
      });

    // TODO: asserting network call count
    // cy.wait("@publicTransactions").should("have.callCount", 2);
    // cy.wait("@publicTransactions").should("be.calledTwice");
  });

  it.skip("renders everyone (public) (infinite list)", function () {
    // Options for Testing Paginated views
    // - Assert at the network layer
    // - Assert at the UI layer
    // - Assert internal state

    // Discussion: Should repeated assertions like this be wrapped up in commands
    cy.getTest("nav-public-tab")
      .should("have.class", "Mui-selected")
      .contains("everyone", { matchCase: false })
      .should("have.css", { "text-transform": "uppercase" });

    // Assert at the network layer
    cy.wait("@publicTransactions")
      .its("response.body")
      .then(({ results, pageData }) => {
        // TODO: use satisfy assertion
        if (pageData.totalPages > 1) {
          expect(results).to.have.lengthOf(10);
        } else {
          expect(results).to.have.at.least(10);
        }

        expect(pageData.page).to.equal(1);

        Array.from({ length: pageData.totalPages }, (v, pageIndex) => {
          const currentPage = pageIndex + 2;

          cy.getTest("transaction-list").children().scrollTo("bottom");
          cy.getTest("transaction-loading").should("be.visible");

          if (currentPage < pageData.totalPages) {
            cy.wait("@publicTransactions")
              .its("response.body.results")
              .then(({ results, pageData }) => {
                expect(pageData.page).to.equal(currentPage);

                if (pageData.page < pageData.totalPages) {
                  expect(results).to.have.lengthOf(10); // this runs first because it's sync
                  return cy
                    .getTest("transaction-loading")
                    .should("not.be.visible");
                }

                expect(results.length).to.be.at.least(1);
              });
          }
        });
      });

    cy.getTestLike("transaction-item").should("have.length", 10);
  });

  it("renders friends (contacts) transaction feed  (infinite list)", function () {
    cy.getTest("nav-contacts-tab") // On get Navigation tabs are hidden under the AppBar in the UI
      .scrollIntoView() // TODO: Bug? Does not work as expected to scroll the tab into view
      .click({ force: true }); // Current solution is to force the click
    cy.getTestLike("transaction-item").should("have.length", 8);
    cy.getTest("nav-contacts-tab").should("have.class", "Mui-selected");
    cy.getTest("transaction-list").children().scrollTo("bottom");
    cy.getTest("transaction-loading").should("be.visible");
    cy.wait("@contactsTransactions");
    cy.getTest("transaction-loading").should("not.be.visible");
    // DISCUSS: the most effective assertion for infinite scroll
    cy.getTestLike("transaction-item").should("have.length.greaterThan", 5);
  });

  it("renders mine (personal) transaction feed (infinite list)", function () {
    cy.getTest("nav-personal-tab").click({ force: true });
    cy.getTest("nav-personal-tab").should("have.class", "Mui-selected");

    cy.getTestLike("transaction-item").should("have.length", 8);

    // TODO: Test infinite scrolling by adding more personal transactions
    /*
    cy.getTest("transaction-list")
      .children()
      .scrollTo("bottom");

    cy.getTest("transaction-loading").should("be.visible");
    cy.wait("@personalTransactions");
    cy.getTest("transaction-loading").should("not.be.visible");

    // DISCUSS: the most effective assertion for infinite scroll
    cy.getTestLike("transaction-item").should("have.length.greaterThan", 5);
    */
  });

  it("shows date range calendar full screen on mobile", function () {
    cy.viewport("iphone-6");
    cy.getTest("main").scrollTo("top");
    cy.getTest("nav-personal-tab")
      .click({ force: true })
      .should("have.class", "Mui-selected");

    cy.getTest("transaction-list-filter-date-range-button")
      .scrollIntoView()
      .click({ force: true });

    cy.getTest("date-range-filter-drawer").should("be.visible");
    // DISCUSS:
    // Testing for hidden elements fail
    // and appear to be related to issues filed against Cypress
    // https://github.com/cypress-io/cypress/issues/1242
    // https://github.com/cypress-io/cypress/issues/5959
    //cy.getTest("app-name-logo").should("be.hidden");
    //cy.getTest("app-name-logo").should("not.be.visible");

    cy.getTest("date-range-filter-drawer-close").click();
  });

  it("shows amount range in drawer on mobile", function () {
    cy.viewport("iphone-6");
    cy.getTest("main").scrollTo("top");
    cy.getTest("nav-personal-tab")
      .click({ force: true })
      .should("have.class", "Mui-selected");

    cy.getTest("transaction-list-filter-amount-range-button")
      .scrollIntoView()
      .click({ force: true });

    cy.getTest("amount-range-filter-drawer").should("be.visible");

    cy.getTest("amount-range-filter-drawer-close").click();
  });

  it("renders mine (personal) transaction feed, filters by date range, then clears the date range filter", function () {
    cy.wrap(new Date(2019, 11, 1).getTime()).then((now) => {
      cy.clock(now, ["Date"]);

      cy.getTest("nav-personal-tab")
        .click()
        .should("have.class", "Mui-selected");

      cy.getTest("main").scrollTo("top");
      cy.getTest("transaction-list-filter-date-range-button").click({
        force: true,
      });

      cy.get("[data-date='2019-12-01']").click({ force: true });
      cy.get("[data-date='2019-12-03']").click({ force: true });

      cy.wait("@personalTransactions");

      cy.getTestLike("transaction-item").should("have.length", 3);

      cy.getTest("transaction-list-filter-date-clear-button")
        .scrollIntoView()
        .click({ force: true });

      cy.getTestLike("transaction-item").should("have.length.greaterThan", 3);
    });
  });

  it("renders mine (personal) transaction feed, filters by date range, then shows empty state", function () {
    cy.getTest("nav-personal-tab").click().should("have.class", "Mui-selected");

    cy.getTest("transaction-list-filter-date-range-button")
      .scrollIntoView()
      .click({ force: true });

    cy.get("[data-date='2020-02-01']").click({ force: true });
    cy.get("[data-date='2020-02-02']").click({ force: true });

    cy.wait("@personalTransactions");

    cy.getTestLike("transaction-list-item").should("not.be.visible");

    cy.getTest("empty-list-header").should("be.visible");
  });

  it.skip("renders mine (personal) transaction feed, filters by amount range, then clears the amount range filter", function () {
    cy.getTest("nav-personal-tab")
      .click({ force: true })
      .should("have.class", "Mui-selected");

    cy.getTest("transaction-list-filter-amount-range-button")
      .scrollIntoView()
      .click({ force: true });

    // DISCUSS:
    // How to set hidden input values like this?
    cy.getTest("transaction-list-filter-amount-range-slider")
      .find('input[type="hidden"]')
      .invoke("val", "3,10")
      .trigger("input", { force: true });

    cy.getTest("transaction-list-filter-amount-range-text")
      .should("contain", "$30")
      .and("contain", "$100");

    cy.wait("@personalTransactions");

    cy.getTest("transaction-list").children().should("have.length", 3);
  });
});
