import { User } from "models";
const usersdemo = require('../../fixtures/usersdemo.json')
const signinPath = "/signin";

describe("Cypress Studio Demo", function () {
  before(function () {
    cy.visit(signinPath);
  });
  it("create new payment transaction", function () {
    usersdemo.forEach((userdemo) => {  
      cy.get("#username").type(userdemo.username);
      cy.get("#password").type(userdemo.password);
      cy.get("[data-test=signin-submit]").click();
    // Extend test with Cypress Studio
    cy.get('[data-test="nav-top-new-transaction"]').click();
    cy.get('#root ul > li:nth-child(3)').click();
    cy.get('#amount').type('500');
    cy.get('#transaction-create-description-input').type('pago de internet');
    cy.get('[data-test=transaction-create-submit-payment]').click();
    cy.screenshot('payment done');
    cy.get('[data-test="new-transaction-return-to-transactions"]').click();
    cy.get('[data-test=sidenav-signout]').click();
    });
  });
  it("create new request transaction", function () {
    usersdemo.forEach((userdemo) => {  
      cy.get("#username").type(userdemo.username);
      cy.get("#password").type(userdemo.password);
      cy.get("[data-test=signin-submit]").click();
    // Extend test with Cypress Studio
    cy.get('[data-test="nav-top-new-transaction"]').click()
    cy.get('#root ul > li:nth-child(2)').click();
    cy.get('#amount').type('500')
    cy.get('#transaction-create-description-input').type('pago de internet')
    cy.get('[data-test=transaction-create-submit-request]').click()
    cy.screenshot('request done')
    cy.get('[data-test="new-transaction-return-to-transactions"]').click()
    cy.get('[data-test=sidenav-signout]').click();
    });
  });
  it.skip("create new bank account", function () {
    // Extend test with Cypress Studio
    cy.get('[data-test=sidenav-bankaccounts]').click()
    cy.get('[data-test=bankaccount-new]').click()
    cy.get('#bankaccount-bankName-input').type('BANK OF AMERICA')
    cy.get('#bankaccount-routingNumber-input').type('122105155')
    cy.get('#bankaccount-accountNumber-input').type('123456789')
    cy.get('[data-test=bankaccount-submit]').click()
    cy.screenshot('bank account created')
    cy.get('[data-test=sidenav-home]').click()

  });
  it.skip("delate a bank account", function () {
    // Extend test with Cypress Studio
    cy.get('[data-test=sidenav-bankaccounts]').click()
    cy.get('[data-test=bankaccount-list-item-RskoB7r4Bic] > .MuiGrid-container > :nth-child(2) > [data-test=bankaccount-delete]').click()
    cy.screenshot('bank account dalated')
    cy.get('[data-test=sidenav-home]').click()
    //add assertion...
  });
  after(function () {
    cy.log('Test completed')
  });
});
