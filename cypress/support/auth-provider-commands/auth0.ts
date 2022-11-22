// @ts-check
///<reference path="../../global.d.ts" />

// Note: this function leaves you on a blank page, so you must call cy.visit()
// afterwards, before continuing with your test.
Cypress.Commands.add("loginToAuth0", (username: string, password: string) => {
  const log = Cypress.log({
    displayName: "AUTH0 LOGIN",
    message: [`🔐 Authenticating | ${username}`],
    // @ts-ignore
    autoEnd: false,
  });
  log.snapshot("before");

  const args = { username, password };
  cy.session(args, () => {
    // App landing page redirects to Auth0.
    cy.visit("/");

    // Login on Auth0.
    cy.origin("dev-ufts63sf.us.auth0.com", { args }, ({ username, password }) => {
      cy.get("input#username").type(username);
      cy.get("input#password").type(password);
      cy.contains("button[value=default]", "Continue").click();
    });
    // Auth0 redirects back to RWA.

    // Wait for RWA to save auth token to localstorage before saving session.
    cy.url().should((url) => {
      expect(url).to.contain(Cypress.config("baseUrl")); // <-- We're on baseUrl here
      expect(localStorage.getItem("authAccessToken")).to.exist;
    });
  }, {
    validate: () => {
      cy.url().should("contain", Cypress.config("baseUrl")); // <-- This fails because we're on blank now
    }
  });

  log.snapshot("after");
  log.end();
});
