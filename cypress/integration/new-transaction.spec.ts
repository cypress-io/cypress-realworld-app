// check this file using TypeScript if available
// @ts-check

describe("New Transaction", function () {
  before(function () {
    cy.fixture("users").as("users");
    // TODO: example for showing how to show fixture types
    cy.get("@users").then((users) => {
      // @ts-ignore
      cy.login(users[0].username).as("user");

      // @ts-ignore
      cy.wrap(users[1]).as("contact");
    });
  });

  beforeEach(function () {
    cy.task("db:seed");
    Cypress.Cookies.preserveOnce("connect.sid");
    cy.server();
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
    cy.fixture("users").as("users");
  });

  it("navigates to the new transaction form, selects a user and submits a transaction payment", function () {
    cy.wait(["@userProfile", "@notifications", "@publicTransactions"])
    cy.getTest("nav-top-new-transaction").click();

    // Wait for users to be fetched for contact selection
    // Not waiting on a dependent network request can lead to flake
    // Especially for network activity that has to complete before taking action
    cy.wait("@allUsers");

    cy.get("@contact").then((contact) => {
      // @ts-ignore
      cy.getTest("user-list-search-input").type(contact.firstName)

      // If the user search request is not awaited this contact list filtering can break
      // without the test catching it.
      cy.wait("@usersSearch")

      // @ts-ignore
      cy.getTestLike("user-list-item").contains(contact.firstName).click();
    })

    cy.getTest("transaction-create-amount-input").type("25");
    cy.getTest("transaction-create-description-input").type("Indian Food");
    cy.getTest("transaction-create-submit-payment").click();

    cy.wait("@createTransaction").should("have.property", "status", 200);

    cy.getTest("sidenav-user-balance").should("contain", "$525.00");

    cy.getTest("app-name-logo").find("a").click();
    // Guide Tip: re-querying DOM for element
    cy.getTest("nav-personal-tab").as("mine-tab");
    cy.get("@mine-tab").click();

    // Discussion point: Is it cy.get()
    cy.get("@mine-tab").should("have.class", "Mui-selected");

    cy.wait("@personalTransactions");

    cy.getTest("transaction-list").first().should("contain", "Indian Food");
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
    cy.getTest("nav-top-new-transaction").click();
    cy.get("@users").then((users) => {
      cy.getTest("user-list-search-input").within(($elem) => {
        cy.get("input")
          //  .scrollIntoView() // TODO: Bug? Does not work here
          //  .type({ force: true }) // type must be forced since hidden
          .type(this.users[6].username, { force: true })
          .blur();
      });
    });

    cy.wait("@usersSearch").should("have.property", "status", 200);
    cy.getTestLike("user-list-item").first().contains("Kaden");
  });

  it("searches for a user by email", function () {
    cy.getTest("nav-top-new-transaction").click();
    cy.get("@users").then((users) => {
      cy.getTest("user-list-search-input").within(($elem) => {
        cy.get("input")
          //  .scrollIntoView() // TODO: Bug? Does not work here
          //  .type({ force: true }) // type must be forced since hidden
          .type(this.users[6].email, { force: true })
          .blur();
      });
    });

    cy.wait("@usersSearch").should("have.property", "status", 200);
    cy.getTestLike("user-list-item").first().contains("Kaden");
  });

  it("searches for a user by phone", function () {
    cy.getTest("nav-top-new-transaction").click();
    cy.get("@users").then((users) => {
      const phone = this.users[6].phoneNumber.replace(/[^0-9]/g, "");
      const partialPhone = phone;

      cy.getTest("user-list-search-input").within(($elem) => {
        cy.get("input")
          //  .scrollIntoView() // TODO: Bug? Does not work here
          //  .type({ force: true }) // type must be forced since hidden
          .type(partialPhone, { force: true })
          .blur();
      });
    });

    cy.wait("@usersSearch").should("have.property", "status", 200);
    cy.getTestLike("user-list-item").first().contains("Kaden");
  });
});
