// check this file using TypeScript if available
// @ts-check

describe("User Settings", function () {
  before(function () {
    cy.fixture("users").as("users");
    cy.get("@users").then((users) => {
      cy.login(this.users[0].username);
    });
  });
  beforeEach(function () {
    cy.task("db:seed");
    Cypress.Cookies.preserveOnce("connect.sid");
    cy.server();
    cy.route("PATCH", "http://localhost:3001/users/*").as("updateUser");
    cy.fixture("users").as("users");

    cy.getTest("sidenav-open").click();
    cy.getTest("sidenav-user-settings").click();
  });
  after(function () {
    cy.task("db:seed");
  });

  it("renders the user settings form", function () {
    // TODO: Investigate drawer state as solution for flakiness of this test
    cy.getTest("user-settings-form").should("be.visible");
    cy.location("pathname").should("include", "/user/settings");
  });

  it("updates first name, last name, email and phone number", function () {
    cy.getTest("user-settings-firstName-input")
      .find("input")
      .clear()
      .type("New First Name");
    cy.getTest("user-settings-lastName-input")
      .find("input")
      .clear()
      .type("New Last Name");
    cy.getTest("user-settings-email-input")
      .find("input")
      .clear()
      .type("email@email.com");
    cy.getTest("user-settings-phoneNumber-input")
      .find("input")
      .clear()
      .type("6155551212");
    cy.getTest("user-settings-submit").click();

    cy.wait("@updateUser").should("have.property", "status", 204);
  });
});
