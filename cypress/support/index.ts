// @ts-check
import "@cypress/code-coverage/support";
import "@percy/cypress";
import "./commands";
beforeEach(function () {
  cy.intercept("https://avatars.dicebear.com/api/human", { fixture: "avatar.svg" });
});
