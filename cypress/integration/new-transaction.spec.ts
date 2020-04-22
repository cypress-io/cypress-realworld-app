// check this file using TypeScript if available
// @ts-check
import Dinero from "dinero.js";
import { User } from "../../src/models";

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
    cy.route("POST", "http://localhost:3001/logout").as("logout");
    cy.route("POST", "http://localhost:3001/transactions").as(
      "createTransaction"
    );
    cy.route("GET", "http://localhost:3001/users").as("allUsers");
    cy.route("GET", "http://localhost:3001/notifications").as("notifications");
    cy.route("GET", "http://localhost:3001/transactions/public").as(
      "publicTransactions"
    );
    cy.route("GET", "http://localhost:3001/checkAuth").as("userProfile");
    cy.route("GET", "http://localhost:3001/transactions").as(
      "personalTransactions"
    );
    cy.route("GET", "http://localhost:3001/users/search*").as("usersSearch");
    cy.route("PATCH", "http://localhost:3001/transactions/*").as(
      "updateTransaction"
    );

    cy.fixture("users").then((users: User[]) => {
      ctx.allUsers = users;
      ctx.user = users[0];
      ctx.contact = users[1];

      return cy.directLogin(ctx.user.username);
    });
  });

  it("navigates to the new transaction form, selects a user and submits a transaction payment", function () {
    cy.wait(["@userProfile", "@notifications", "@publicTransactions"]);
    cy.getTest("nav-top-new-transaction").click();

    // Wait for users to be fetched for contact selection
    // Not waiting on a dependent network request can lead to flake
    // Especially for network activity that has to complete before taking action
    cy.wait("@allUsers");

    cy.getTest("user-list-search-input").type(ctx.contact!.firstName);

    // If the user search request is not awaited this contact list filtering can break
    // without the test catching it.
    cy.wait("@usersSearch");

    cy.getTestLike("user-list-item").contains(ctx.contact!.firstName).click();

    cy.getTest("transaction-create-amount-input").type("25");
    cy.getTest("transaction-create-description-input").type("Indian Food");
    cy.getTest("transaction-create-submit-payment").click();

    cy.wait("@createTransaction").should("have.property", "status", 200);

    cy.getTest("sidenav-user-balance").should("contain", "$525.00");

    cy.getTest("app-name-logo").find("a").click();

    cy.getTest("nav-personal-tab").click().should("have.class", "Mui-selected");

    cy.wait("@personalTransactions");

    cy.getTest("transaction-list").first().should("contain", "Indian Food");
  });

  it("submits a transaction payment and verifies the deposit for the receiver", function () {
    cy.wait(["@userProfile", "@notifications", "@publicTransactions"]);
    cy.getTest("nav-top-new-transaction").click();

    cy.createTransaction({
      transactionType: "payment",
      amount: "25",
      description: "Indian Food",
      sender: ctx.user,
      receiver: ctx.contact,
    });

    cy.wait("@createTransaction");
    cy.directLogout();
    cy.wait("@logout");

    // @ts-ignore
    cy.directLogin(ctx.contact.username);

    cy.getTest("sidenav-user-balance").should(
      "contain",
      // @ts-ignore
      Dinero({ amount: ctx.contact.balance + 25 * 100 }).toFormat()
    );
  });

  it("submits a transaction request and accepts the request for the receiver", function () {
    cy.wait(["@userProfile", "@notifications", "@publicTransactions"]);
    cy.getTest("nav-top-new-transaction").click();

    cy.createTransaction({
      transactionType: "request",
      amount: "100",
      description: "Fancy Hotel",
      sender: ctx.user,
      receiver: ctx.contact,
    });

    cy.wait("@createTransaction");
    cy.directLogout();
    cy.wait("@logout");

    // @ts-ignore
    cy.directLogin(ctx.contact.username);

    cy.getTest("nav-personal-tab").click();
    cy.getTestLike("transaction-item")
      .should("contain", "Fancy Hotel")
      .click({ multiple: true, force: true });

    cy.getTestLike(`transaction-accept-request`).click();
    cy.wait("@updateTransaction").should("have.property", "status", 204);

    cy.directLogout();
    cy.wait("@logout");

    // @ts-ignore
    cy.directLogin(ctx.user.username);
    cy.getTest("sidenav-user-balance").should(
      "contain",
      // @ts-ignore
      Dinero({ amount: ctx.user.balance + 100 * 100 }).toFormat()
    );
  });

  it("selects a user and submits a transaction request", function () {
    cy.getTest("nav-top-new-transaction").click();

    cy.wait("@allUsers");

    cy.getTestLike("user-list-item").contains("Kaden").click();
    cy.getTest("transaction-create-form").should("be.visible");

    cy.getTest("transaction-create-amount-input").type("95");
    cy.getTest("transaction-create-description-input").type("Fancy Hotel");
    cy.getTest("transaction-create-submit-request").click();

    cy.wait("@createTransaction").should("have.property", "status", 200);

    cy.getTest("sidenav-user-balance").should("contain", "$550.00");

    cy.getTest("app-name-logo").find("a").click();
    // Guide Tip: re-querying DOM for element
    cy.getTest("nav-personal-tab").as("mine-tab");
    cy.get("@mine-tab").click();

    // Discussion point: Is it cy.get()
    cy.get("@mine-tab").should("have.class", "Mui-selected");

    cy.getTestLike("transaction-item").should("contain", "Fancy Hotel");
  });

  it("searches for a user by username", function () {
    const targetUser = ctx.allUsers![6];

    cy.getTest("nav-top-new-transaction").click();
    cy.wait("@allUsers");

    cy.getTest("user-list-search-input").type(targetUser.username);

    cy.wait("@usersSearch").should("have.property", "status", 200);
    cy.getTestLike("user-list-item").first().contains(targetUser.firstName);
  });

  it("searches for a user by email", function () {
    const targetUser = ctx.allUsers![6];

    cy.getTest("nav-top-new-transaction").click();
    cy.wait("@allUsers");

    cy.getTest("user-list-search-input").type(targetUser.email);

    cy.wait("@usersSearch").should("have.property", "status", 200);
    cy.getTestLike("user-list-item").first().contains(targetUser.firstName);
  });

  it("searches for a user by phone", function () {
    const targetUser = ctx.allUsers![6];
    const phone = targetUser.phoneNumber.replace(/[^0-9]/g, "");

    cy.getTest("nav-top-new-transaction").click();
    cy.wait("@allUsers");

    cy.getTest("user-list-search-input").type(phone);

    cy.wait("@usersSearch").should("have.property", "status", 200);
    cy.getTestLike("user-list-item").first().contains(targetUser.firstName);
  });
});
