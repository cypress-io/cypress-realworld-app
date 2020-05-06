// @ts-check
import Dinero from "dinero.js";
import { User } from "../../../src/models";

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

    cy.task("filter:testData", { entity: "users" }).then((users: User[]) => {
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

    // Wait for users to be fetched for contact selection
    // Not waiting on a dependent network request can lead to flake
    // Especially for network activity that has to complete before taking action
    cy.wait("@allUsers");

    cy.getBySel("user-list-search-input").type(ctx.contact!.firstName);

    // If the user search request is not awaited this contact list filtering can break
    // without the test catching it.
    cy.wait("@usersSearch");

    cy.getBySelLike("user-list-item").contains(ctx.contact!.firstName).click();

    cy.getBySelLike("amount-input").type(payment.amount);
    cy.getBySelLike("description-input").type(payment.description);
    cy.getBySelLike("submit-payment").click();
    cy.wait(["@createTransaction", "@getUserProfile"]);

    cy.task("find:testData", {
      entity: "users",
      findAttr: { id: ctx.contact!.id },
    }).then((updatedContact: User) => {
      const updatedBalance = Dinero({
        amount: updatedContact.balance,
      }).toFormat();

      cy.getBySel("sidenav-user-balance", { timeout: 5000 }).should("contain", updatedBalance);
    });

    cy.getBySel("app-name-logo").find("a").click();
    cy.getBySel("nav-personal-tab").click().should("have.class", "Mui-selected");
    cy.wait("@personalTransactions");

    cy.getBySel("transaction-list").first().should("contain", payment.description);
  });

  it("navigates to the new transaction form, selects a user and submits a transaction request", function () {
    const request = {
      amount: "95",
      description: "Fancy Hotel 🏨",
    };

    cy.getBySelLike("new-transaction").click();
    cy.wait("@allUsers");

    cy.getBySelLike("user-list-item").contains(ctx.contact!.firstName).click();

    cy.getBySelLike("amount-input").type(request.amount);
    cy.getBySelLike("description-input").type(request.description);
    cy.getBySelLike("submit-request").click();
    cy.wait("@createTransaction");

    cy.getBySelLike("return-to-transactions").click();
    cy.getBySel("nav-personal-tab").click().should("have.class", "Mui-selected");

    cy.getBySelLike("transaction-item").should("contain", request.description);
  });

  it("displays new transaction errors", function () {
    cy.getBySelLike("new-transaction").click();
    cy.wait("@allUsers");

    cy.getBySelLike("user-list-item").contains(ctx.contact!.firstName).click();

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

    cy.logoutByXstate();

    cy.loginByXstate(ctx.contact!.username);

    const newContactBalance = Dinero({
      amount: ctx.contact!.balance + transactionPayload.amount * 100,
    }).toFormat();

    cy.getBySel("sidenav-user-balance").should("contain", newContactBalance);
  });

  it("submits a transaction request and accepts the request for the receiver", function () {
    cy.getBySelLike("new-transaction").click();

    const transactionPayload = {
      transactionType: "request",
      amount: 100,
      description: "Fancy Hotel",
      sender: ctx.user,
      receiver: ctx.contact,
    };

    cy.createTransaction(transactionPayload);
    cy.wait("@createTransaction");

    cy.logoutByXstate();

    cy.loginByXstate(ctx.contact!.username);

    cy.getBySel("nav-personal-tab").click();
    cy.getBySelLike("transaction-item")
      .contains(transactionPayload.description)
      .click({ force: true });

    cy.getBySelLike("accept-request").click();
    cy.wait("@updateTransaction").its("status").should("equal", 204);

    cy.logoutByXstate();

    cy.loginByXstate(ctx.user!.username);
    cy.getBySel("sidenav-user-balance").should(
      "contain",
      Dinero({
        amount: ctx.user!.balance + transactionPayload.amount * 100,
      }).toFormat()
    );
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

    cy.wrap(searchAttrs).each((attr: keyof User) => {
      cy.getBySel("user-list-search-input").type(targetUser[attr] as string);
      cy.wait("@usersSearch");

      cy.getBySelLike("user-list-item")
        .first()
        .contains(targetUser[attr] as string);

      cy.focused().clear();
    });
  });
});
