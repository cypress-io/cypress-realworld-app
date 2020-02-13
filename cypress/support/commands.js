// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

Cypress.Commands.add("apiLogin", (username, password = "s3cret") => {
  return cy.request("POST", "http://localhost:3001/login", {
    username,
    password
  });
});

Cypress.Commands.add("getTest", s => cy.get(`[data-test=${s}]`));
Cypress.Commands.add("getTestLike", s => cy.get(`[data-test*=${s}]`));

Cypress.Commands.add("login", (username, password = "s3cret") => {
  cy.visit("/signin");

  cy.getTest("signin-username").type(username);

  cy.getTest("signin-password").type(password);

  cy.getTest("signin-submit").click();
});
