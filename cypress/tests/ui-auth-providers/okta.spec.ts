import { isMobile } from "../../support/utils";

if (Cypress.env("okta_username")) {
  if (Cypress.env("okta_programmatic_login")) {
    describe("Okta", function () {
      beforeEach(function () {
        cy.task("db:seed");

        cy.intercept("POST", "/bankAccounts").as("createBankAccount");

        cy.loginByOktaApi(Cypress.env("okta_username"), Cypress.env("okta_password"));
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

        cy.wait("@createBankAccount");

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

      it("shows onboarding", function () {
        cy.contains("Get Started").should("be.visible");
      });
    });
  } else {
    describe("Okta", function () {
      beforeEach(function () {
        cy.task("db:seed");

        cy.loginByOkta(Cypress.env("okta_username"), Cypress.env("okta_password"));
        cy.visit("/");
      });

      it("verifies signed in user does not have a bank account", function () {
        cy.get('[data-test="sidenav-bankaccounts"]').click();
        cy.get('[data-test="empty-list-header"]').should("be.visible");
      });

      it("verifies signed in user does not have any notifications", function () {
        cy.get('[data-test="sidenav-notifications"]').click();
        cy.get('[data-test="empty-list-header"]').should("be.visible");
      });
    });
  }
}
