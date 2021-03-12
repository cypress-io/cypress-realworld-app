// @ts-check
import "@cypress/code-coverage/support";
import "./commands";

beforeEach(() => {
  cy.intercept(
    // requires Cypress 7.x and higher for middleware flag
    // and fix in https://github.com/cypress-io/cypress/pull/14543
    { url: "http://localhost:3001", middleware: true },
    (req) => delete req.headers["if-none-match"]
  );
});
