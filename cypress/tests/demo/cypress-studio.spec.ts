import { User } from "models";

describe("Cypress Studio Demo", function () {
  beforeEach(function () {
    cy.task("db:seed");

    cy.database("find", "users").then((user: User) => {
      cy.login(user.username, "s3cret", { rememberUser: true });
    });
  });
  // DEMO: pending tests for Cypress Cloud pending status
  it("create new transaction");
  it("create new bank account");

  // DEMO: skipped status alongside pending in the same spec
  it.skip("records a studio flow for notifications", function () {
    cy.getBySel("nav-top-notifications-count").should("exist");
  });
});
