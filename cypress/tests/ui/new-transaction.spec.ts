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
    cy.percySnapshot();

    cy.getBySel("user-list-search-input").type(ctx.contact!.firstName, { force: true });
    cy.wait("@usersSearch");
    cy.percySnapshot();

    cy.getBySelLike("user-list-item").contains(ctx.contact!.firstName).click({ force: true });

    cy.getBySelLike("amount-input").type(payment.amount);
    cy.getBySelLike("description-input").type(payment.description);
    cy.percySnapshot();
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
    cy.percySnapshot();

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
    cy.percySnapshot();
  });

  it("navigates to the new transaction form, selects a user and submits a transaction request", function () {
    const request = {
      amount: "95",
      description: "Fancy Hotel 🏨",
    };

    cy.getBySelLike("new-transaction").click();
    cy.wait("@allUsers");
    cy.percySnapshot();

    cy.getBySelLike("user-list-item").contains(ctx.contact!.firstName).click({ force: true });

    cy.getBySelLike("amount-input").type(request.amount);
    cy.getBySelLike("description-input").type(request.description);
    cy.getBySelLike("submit-request").click();
    cy.wait("@createTransaction");
    cy.getBySel("alert-bar-success")
      .should("be.visible")
      .and("have.text", "Transaction Submitted!");
    cy.percySnapshot();

    cy.getBySelLike("return-to-transactions").click();
    cy.getBySelLike("personal-tab").click().should("have.class", "Mui-selected");

    cy.getBySelLike("transaction-item").should("contain", request.description);
    cy.percySnapshot();
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
    cy.percySnapshot();
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

    cy.createTransaction(transactionPayload);
    cy.wait("@createTransaction");

    cy.switchUser(ctx.contact!.username);

    const updatedAccountBalance = Dinero({
      amount: ctx.contact!.balance + transactionPayload.amount * 100,
    }).toFormat();

    if (isMobile()) {
      cy.getBySel("sidenav-toggle").click();
    }

    cy.getBySelLike("user-balance").should("contain", updatedAccountBalance);
    cy.percySnapshot();
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

    cy.switchUser(ctx.contact!.username);

    cy.getBySelLike("personal-tab").click();

    cy.wait("@personalTransactions");

    cy.getBySelLike("transaction-item")
      .first()
      .should("contain", transactionPayload.description)
      .click({ force: true });
    cy.percySnapshot();

    cy.getBySelLike("accept-request").click();
    cy.wait("@updateTransaction").its("status").should("equal", 204);
    cy.percySnapshot();

    cy.switchUser(ctx.user!.username);

    const updatedAccountBalance = Dinero({
      amount: ctx.user!.balance + transactionPayload.amount * 100,
    }).toFormat();

    if (isMobile()) {
      cy.getBySel("sidenav-toggle").click();
    }

    cy.getBySelLike("user-balance").should("contain", updatedAccountBalance);
    cy.percySnapshot();
  });

  it("searches for a user by attributes", function () {
    const targetUser = ctx.allUsers![2];
    const searchAttrs: (keyof User)[] = [
      "firstName",
      "lastName",
      "username",
      "email",
      "phoneNumber",
    ];

    cy.getBySelLike("new-transaction").click();
    cy.wait("@allUsers");
    cy.percySnapshot();

    searchAttrs.forEach((attr: keyof User) => {
      cy.getBySel("user-list-search-input").type(targetUser[attr] as string, { force: true });
      cy.wait("@usersSearch");

      cy.getBySelLike("user-list-item")
        .first()
        .contains(targetUser[attr] as string);
      cy.percySnapshot();

      cy.focused().clear();
      cy.getBySel("users-list").should("be.empty");
    });
  });
});
