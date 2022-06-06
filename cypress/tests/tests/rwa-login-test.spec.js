/// <reference types="cypress" />
const username = "Abel1";
const password = "abel1";

describe("Main test Real world app", () => {
  before(() => {
    cy.visit("http://localhost:3000");
  });

  it("Checkout login page", () => {
    cy.get('[class="makeStyles-logo-3"]').should("be.visible");
    cy.get('[class="MuiTypography-root MuiTypography-h5"]')
      .should("exist")
      .and("contain", "Sign in");
    cy.get('[id="username"]');
    cy.get('[id="password"]');
    cy.get('[class="PrivateSwitchBase-input-14"]').should("not.be.checked");
    cy.get('[class="MuiButton-label"]').should("be.visible");
    cy.get('[data-test="signup"]').should("be.visible").click();
    cy.url().should("eq", "http://localhost:3000/signup");
  });

  it("Website login check", () => {
    cy.go("back");
    //cy.visit('http://localhost:3000')
    cy.url().should("eq", "http://localhost:3000/signin");
    cy.wait(1000);
    cy.intercept("POST", "http://localhost:3001/login").as("login");
    cy.get('[id="username"]').type(username);
    cy.get('[id="password"]').type(password);
    cy.get('[class="MuiButton-label"]').click();
    cy.url().should("eq", "http://localhost:3000/");

    cy.wait("@login").then((request) => {
      expect(request.request.body.username).to.contain("Abel1");
      expect(request.request.body.password).to.contain("abel1");
      expect(request.response.statusCode).to.eq(200);
    });
    cy.get('[role="dialog"]').should("be.visible");
  });
});
