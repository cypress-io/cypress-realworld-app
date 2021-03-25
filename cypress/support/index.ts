// @ts-check
import "@cypress/code-coverage/support";
import "./commands";
import { isMobile } from "./utils";

beforeEach(() => {
  // cy.intercept middleware to remove 'if-none-match' headers from all requests
  // to prevent the server from returning cached responses of API requests
  cy.intercept(
    { url: "http://localhost:3001", middleware: true },
    (req) => delete req.headers["if-none-match"]
  );

  // If under mobile viewport, apply cy.intercept middleware to delay the response
  // for all routes except /login
  if (isMobile()) {
    cy.intercept({ url: "http://localhost:3001", middleware: true }, (req) => {
      req.on("response", (res) => {
        if (req.url !== "http://localhost:3001/login") {
          res.delay(2500);
        }
      });
    });
  }
});
