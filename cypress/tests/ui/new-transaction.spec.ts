import Dinero from "dinero.js";
import { User } from "../../../src/models";
import { isMobile } from "../../support/utils";

type NewTransactionTestCtx = {
  allUsers?: User[];
  user?: User;
  contact?: User;
};

describe("New Transaction", function () {
  const ctx: NewTransactionTestCtx = {};

  beforeEach(function () {
    cy.task("db:seed");

    cy.server();
    cy.route("POST", "/transactions").as("createTransaction");

    cy.route("GET", "/users").as("allUsers");
    cy.route("GET", "/notifications").as("notifications");
    cy.route("GET", "/transactions/public").as("publicTransactions");
    cy.route("GET", "/transactions").as("personalTransactions");
    cy.route("GET", "/users/search*").as("usersSearch");
    cy.route("PATCH", "/transactions/*").as("updateTransaction");

    cy.database("filter", "users").then((users: User[]) => {
      ctx.allUsers = users;
      ctx.user = users[0];
      ctx.contact = users[1];

      return cy.loginByXstate(ctx.user.username);
    });
  });

  it("navigates to the new transaction form, selects a user and submits a transaction payment", function () {
    const payment = {
      amount: "35",
      description: "Sushi dinner 🍣",
    };

    cy.getBySelLike("new-transaction").click();
    cy.wait("@allUsers");

    cy.getBySel("user-list-search-input").type(ctx.contact!.firstName, { force: true });
    cy.wait("@usersSearch");
    cy.visualSnapshot("User Search First Name Input");

    cy.getBySelLike("user-list-item").contains(ctx.contact!.firstName).click({ force: true });
    cy.visualSnapshot("User Search First Name List Item");

    cy.getBySelLike("amount-input").type(payment.amount);
    cy.getBySelLike("description-input").type(payment.description);
    cy.visualSnapshot("Amount and Description Input");
    cy.getBySelLike("submit-payment").click();
    cy.wait(["@createTransaction", "@getUserProfile"]);
    cy.getBySel("alert-bar-success")
      .should("be.visible")
      .and("have.text", "Transaction Submitted!");

    const updatedAccountBalance = Dinero({
      amount: ctx.user!.balance - parseInt(payment.amount) * 100,
    }).toFormat();

    if (isMobile()) {
      cy.getBySel("sidenav-toggle").click();
    }

    cy.getBySelLike("user-balance").should("contain", updatedAccountBalance);
    cy.visualSnapshot("Updated User Balance");

    if (isMobile()) {
      cy.get(".MuiBackdrop-root").click({ force: true });
    }

    cy.getBySelLike("create-another-transaction").click();
    cy.getBySel("app-name-logo").find("a").click();
    cy.getBySelLike("personal-tab").click().should("have.class", "Mui-selected");
    cy.wait("@personalTransactions");

    cy.getBySel("transaction-list").first().should("contain", payment.description);

    cy.database("find", "users", { id: ctx.contact!.id })
      .its("balance")
      .should("equal", ctx.contact!.balance + parseInt(payment.amount) * 100);
    cy.visualSnapshot("Personal List Validate Transaction in List");
  });

  it("navigates to the new transaction form, selects a user and submits a transaction request", function () {
    const request = {
      amount: "95",
      description: "Fancy Hotel 🏨",
    };

    cy.getBySelLike("new-transaction").click();
    cy.wait("@allUsers");

    cy.getBySelLike("user-list-item").contains(ctx.contact!.firstName).click({ force: true });
    cy.visualSnapshot("User Search First Name Input");

    cy.getBySelLike("amount-input").type(request.amount);
    cy.getBySelLike("description-input").type(request.description);
    cy.visualSnapshot("Amount and Description Input");
    cy.getBySelLike("submit-request").click();
    cy.wait("@createTransaction");
    cy.getBySel("alert-bar-success")
      .should("be.visible")
      .and("have.text", "Transaction Submitted!");
    cy.visualSnapshot("Transaction Request Submitted Notification");

    cy.getBySelLike("return-to-transactions").click();
    cy.getBySelLike("personal-tab").click().should("have.class", "Mui-selected");

    cy.getBySelLike("transaction-item").should("contain", request.description);
    cy.visualSnapshot("Transaction Item Description in List");
  });

  it("displays new transaction errors", function () {
    cy.getBySelLike("new-transaction").click();
    cy.wait("@allUsers");

    cy.getBySelLike("user-list-item").contains(ctx.contact!.firstName).click({ force: true });

    cy.getBySelLike("amount-input").type("43").find("input").clear().blur();
    cy.get("#transaction-create-amount-input-helper-text")
      .should("be.visible")
      .and("contain", "Please enter a valid amount");

    cy.getBySelLike("description-input").type("Fun").find("input").clear().blur();
    cy.get("#transaction-create-description-input-helper-text")
      .should("be.visible")
      .and("contain", "Please enter a note");

    cy.getBySelLike("submit-request").should("be.disabled");
    cy.getBySelLike("submit-payment").should("be.disabled");
    cy.visualSnapshot("New Transaction Errors with Submit Payment/Request Buttons Disabled");
  });

  it("submits a transaction payment and verifies the deposit for the receiver", function () {
    cy.getBySel("nav-top-new-transaction").click();

    const transactionPayload = {
      transactionType: "payment",
      amount: 25,
      description: "Indian Food",
      sender: ctx.user,
      receiver: ctx.contact,
    };

    // first let's grab the current balance from the UI
    let startBalance: string;
    if (!isMobile()) {
      // only check the balance display in desktop resolution
      // as it is NOT shown on mobile screen
      cy.get("[data-test=sidenav-user-balance]")
        .invoke("text")
        .then((x) => {
          startBalance = x; // something like "$1,484.81"
          expect(startBalance).to.match(/\$\d/);
        });
    }

    cy.createTransaction(transactionPayload);
    cy.wait("@createTransaction");
    cy.getBySel("new-transaction-create-another-transaction").should("be.visible");

    if (!isMobile()) {
      // make sure the new balance is displayed
      cy.get("[data-test=sidenav-user-balance]").should(($el) => {
        // here we only make sure the text has changed
        // we could also convert the balance to actual number
        // and confirm the new balance is the start balance - amount
        expect($el.text()).to.not.equal(startBalance);
      });
    }
    cy.visualSnapshot("Transaction Payment Submitted Notification");

    cy.switchUser(ctx.contact!.username);

    const updatedAccountBalance = Dinero({
      amount: ctx.contact!.balance + transactionPayload.amount * 100,
    }).toFormat();

    if (isMobile()) {
      cy.getBySel("sidenav-toggle").click();
    }

    cy.getBySelLike("user-balance").should("contain", updatedAccountBalance);
    cy.visualSnapshot("Verify Updated Sender Account Balance");
  });

  it("submits a transaction request and accepts the request for the receiver", function () {
    const transactionPayload = {
      transactionType: "request",
      amount: 100,
      description: "Fancy Hotel",
      sender: ctx.user,
      receiver: ctx.contact,
    };

    cy.getBySelLike("new-transaction").click();
    cy.createTransaction(transactionPayload);
    cy.wait("@createTransaction");
    cy.getBySel("new-transaction-create-another-transaction").should("be.visible");
    cy.visualSnapshot("receiver - Transaction Payment Submitted Notification");

    cy.switchUser(ctx.contact!.username);

    cy.getBySelLike("personal-tab").click();

    cy.wait("@personalTransactions");

    cy.getBySelLike("transaction-item")
      .first()
      .should("contain", transactionPayload.description)
      .click({ force: true });
    cy.visualSnapshot("Navigate to Transaction Item");

    cy.getBySelLike("accept-request").click();
    cy.wait("@updateTransaction").its("status").should("equal", 204);
    cy.getBySelLike("transaction-detail-header").should("be.visible");
    cy.getBySelLike("transaction-amount").should("be.visible");
    cy.getBySelLike("sender-avatar").should("be.visible");
    cy.getBySelLike("receiver-avatar").should("be.visible");
    cy.getBySelLike("transaction-description").should("be.visible");
    cy.visualSnapshot("Accept Transaction Request");

    cy.switchUser(ctx.user!.username);

    const updatedAccountBalance = Dinero({
      amount: ctx.user!.balance + transactionPayload.amount * 100,
    }).toFormat();

    if (isMobile()) {
      cy.getBySel("sidenav-toggle").click();
    }

    cy.getBySelLike("user-balance").should("contain", updatedAccountBalance);
    cy.visualSnapshot("Verify Updated Sender Account Balance");
  });
});
