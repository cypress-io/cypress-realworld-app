// type definitions for Cypress object "cy"
// https://on.cypress.io/typescript
/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    // describe new "cy" commands here

    /**
     * Logs in using API request
     */
    apiLogin(username: string, password?: string): Chainable<Response>;
    /**
     * Logs in using user interface
     */
    login(username: string, password?: string): void;

    getTest(dataTestAttribute: string): Chainable<Element>;
    getTestLike(dataTestPrefixAttribute: string): Chainable<Element>;
  }
}
