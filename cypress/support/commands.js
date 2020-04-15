// @ts-check
/// <reference path="../global.d.ts" />

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
  return cy.request("POST", `${Cypress.env("apiUrl")}/login`, {
    username,
    password,
  });
});

Cypress.Commands.add("directLogin", (username, password = "s3cret") => {
  cy.visit("/signin");
  cy.window()
    .its("authService")
    .invoke("send", ["LOGIN", { username, password }]);
});

Cypress.Commands.add("directLogout", () => {
  cy.window().its("authService").invoke("send", ["LOGOUT"]);
});

Cypress.Commands.add("createTransaction", (payload) => {
  cy.window()
    .its("createTransactionService")
    .invoke("send", ["CREATE", payload]);
});

Cypress.Commands.add("getTest", (s) => cy.get(`[data-test=${s}]`));
Cypress.Commands.add("getTestLike", (s) => cy.get(`[data-test*=${s}]`));

Cypress.Commands.add("login", (username, password = "s3cret") => {
  cy.visit("/signin");

  cy.getTest("signin-username").type(username);

  cy.getTest("signin-password").type(password);

  cy.getTest("signin-submit").click();
});
