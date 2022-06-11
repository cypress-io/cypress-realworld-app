/// <reference types="cypress" />
const username = "Abel1";
const password = "abel1";

describe("Main test Real world app", () => {
  before(() => {
    cy.visit("http://localhost:3000");
  });
  it("Register account", () => {
    cy.get('[data-test="signup"]').click();
    cy.url().should("eq", "http://localhost:3000/signup");
    cy.get('[id="firstName"]').should("be.visible").type("Abel");
    cy.get('[id="lastName"]').should("be.visible").type("Fernandez");
    cy.get('[id="username"]').should("be.visible").type("Abel1");
    cy.get('[id="password"]').should("be.visible").type("abel1");
    cy.get('[id="confirmPassword"]').should("be.visible").type("abel1");
    cy.get('[class="MuiButton-label"]').should("be.visible").click();
    cy.url().should("eq", "http://localhost:3000/signin");
  });

  it("Checkout login page", () => {
    cy.get('[class="makeStyles-logo-22"]').should("be.visible");
    cy.get('[class="MuiTypography-root MuiTypography-h5"]')
      .should("exist")
      .and("contain", "Sign in");
    cy.get('[id="username"]').should("be.visible");
    cy.get('[id="password"]').should("be.visible");
    cy.get('[class="PrivateSwitchBase-input-33"]').should("not.be.checked");
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
  //test
});
