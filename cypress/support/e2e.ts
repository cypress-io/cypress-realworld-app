// @ts-check
import "@cypress/code-coverage/support";
import "./commands";
import { isMobile } from "./utils";

beforeEach(() => {
  // Follow the configured API URL (expose.apiUrl) so these intercepts still match when the API runs on another port
  const apiRoutes = `${Cypress.expose("apiUrl")}/**`;

  // cy.intercept middleware to remove 'if-none-match' headers from all requests
  // to prevent the server from returning cached responses of API requests
  cy.intercept({ url: apiRoutes, middleware: true }, (req) => delete req.headers["if-none-match"]);

  // Throttle API responses for mobile testing to simulate real world condition
  if (isMobile()) {
    cy.intercept({ url: apiRoutes, middleware: true }, (req) => {
      req.on("response", (res) => {
        // Throttle the response to 1 Mbps to simulate a mobile 3G connection
        res.setThrottle(1000);
      });
    });
  }
});
