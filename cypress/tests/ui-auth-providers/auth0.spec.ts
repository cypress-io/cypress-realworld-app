import { isMobile } from "../../support/utils";

if (Cypress.env("auth0_username")) {
  describe("Auth0", function () {
    beforeEach(function () {
      cy.task("db:seed");
      cy.intercept("POST", "/graphql").as("createBankAccount");
      cy.loginToAuth0(Cypress.env("auth0_username"), Cypress.env("auth0_password"));
      cy.visit("/");
    });

    it("should allow a visitor to login, onboard and logout", function () {
      cy.contains("Get Started").should("be.visible");

      // Onboarding
      cy.getBySel("user-onboarding-dialog").should("be.visible");
      cy.getBySel("user-onboarding-next").click();

      cy.getBySel("user-onboarding-dialog-title").should("contain", "Create Bank Account");

      cy.getBySelLike("bankName-input").type("The Best Bank");
      cy.getBySelLike("accountNumber-input").type("123456789");
      cy.getBySelLike("routingNumber-input").type("987654321");
      cy.getBySelLike("submit").click();

      cy.getBySel("user-onboarding-dialog-title").should("contain", "Finished");
      cy.getBySel("user-onboarding-dialog-content").should("contain", "You're all set!");
      cy.getBySel("user-onboarding-next").click();

      cy.getBySel("transaction-list").should("be.visible");

      // Logout User
      if (isMobile()) {
        cy.getBySel("sidenav-toggle").click();
      }
      cy.getBySel("sidenav-signout").click();

      cy.location("pathname").should("eq", "/");
    });

    // This test should pass without needing to go through the login flow again,
    // due to the session data being cached by cy.loginToAuth0.
    it("shows onboarding", function () {
      cy.contains("Get Started").should("be.visible");
    });
  });
}
