// type definitions for Cypress object "cy"
// https://on.cypress.io/typescript
/// <reference types="cypress" />

declare namespace Cypress {
  import { Transaction } from "../src/models";
  interface Chainable {
    // describe new "cy" commands here

    task(
      event: "filter:testData",
      arg?: any,
      options?: Partial<Loggable & Timeoutable>
    ): Chainable<Transaction[]>;

    task(
      event: "find:testData",
      arg?: any,
      options?: Partial<Loggable & Timeoutable>
    ): Chainable<Transaction>;

    /**
     * Logs in using API request
     */
    apiLogin(username: string, password?: string): Chainable<Response>;

    /**
     * Logs in using user interface
     */
    login(username: string, password?: string): void;

    /**
     * Logs in bypassing UI
     */
    directLogin(username: string, password?: string): void;

    /**
     * Logs out bypassing UI
     */
    directLogout(): void;

    /**
     * Create Transaction bypassing UI
     */
    createTransaction(payload): void;

    getTest(dataTestAttribute: string): Chainable<Element>;
    getTestLike(dataTestPrefixAttribute: string): Chainable<Element>;
    fetchTestData(entity: string, filterDetails: object): Chainable<any[]>;
  }
}
