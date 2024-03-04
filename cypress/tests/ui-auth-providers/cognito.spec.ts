import "../../support/auth-provider-commands/cognito";
import { isMobile } from "../../support/utils";
const apiGraphQL = `${Cypress.env("apiUrl")}/graphql`;

if (Cypress.env("cognito_username")) {
  // Sign in with AWS
  if (Cypress.env("cognito_programmatic_login")) {
    describe("AWS Cognito, programmatic login (cypress.config.ts#cognito_programmatic_login: true)", function () {
      beforeEach(function () {
        cy.task("db:seed");

        cy.intercept("POST", apiGraphQL).as("createBankAccount");

        cy.loginByCognitoApi(Cypress.env("cognito_username"), Cypress.env("cognito_password"));
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
    describe("AWS Cognito, cy.origin() login (cypress.config.ts#cognito_programmatic_login: false)", function () {
      beforeEach(function () {
        cy.task("db:seed");
        cy.loginByCognito(Cypress.env("cognito_username"), Cypress.env("cognito_password"));
        cy.visit("/");
      });

      it("shows onboarding", function () {
        cy.contains("Get Started").should("be.visible");
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
      });
    });
  }
}
