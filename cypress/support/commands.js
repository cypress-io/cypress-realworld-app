// @ts-check
/// <reference path="../global.d.ts" />

import { pick } from "lodash/fp";

const defaultPassword = "s3cret";

Cypress.Commands.add("login", (username, password, rememberUser = false) => {
  const signinPath = "/signin";
  const log = Cypress.log({
    name: "login",
    displayName: "LOGIN",
    // @ts-ignore
    message: `🔐 Authenticating | ${username}`,
  });

  cy.server();
  cy.route("POST", "/login").as("login");

  cy.location("pathname", { log: false }).then((currentPath) => {
    if (currentPath !== signinPath) {
      cy.visit(signinPath);
    }
  });

  log.snapshot("before");

  cy.getTest("signin-username").type(username);
  cy.getTest("signin-password").type(password);

  if (rememberUser) {
    cy.getTest("signin-remember-me").find("input").check();
  }

  cy.getTest("signin-submit").click();
  cy.wait("@login");

  log.snapshot("after");
  log.end();
});

Cypress.Commands.add("loginByApi", (username, password = defaultPassword) => {
  return cy.request("POST", `${Cypress.env("apiUrl")}/login`, {
    username,
    password,
  });
});

Cypress.Commands.add(
  "loginByXstate",
  (username, password = defaultPassword) => {
    cy.visit("/signin");

    return cy
      .window()
      .its("authService")
      .invoke("send", ["LOGIN", { username, password }]);
  }
);

Cypress.Commands.add("logoutByXstate", () => {
  return cy.window().its("authService").invoke("send", ["LOGOUT"]);
});

Cypress.Commands.add("createTransaction", (payload) => {
  return cy
    .window()
    .its("createTransactionService")
    .then((service) => {
      service.send("SET_USERS", payload);

      const createPayload = pick(
        ["amount", "description", "transactionType"],
        payload
      );

      service.send("CREATE", {
        ...createPayload,
        senderId: payload.sender.id,
        receiverId: payload.receiver.id,
      });
    });
});

Cypress.Commands.add("getTest", (s) => cy.get(`[data-test=${s}]`));
Cypress.Commands.add("getTestLike", (s) => cy.get(`[data-test*=${s}]`));
