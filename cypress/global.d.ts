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
     * Logs in using user interface
     */
    login(username: string, password: string, rememberUser?: boolean): void;

    /**
     * Logs in using API request
     */
    loginByApi(username: string, password?: string): Chainable<Response>;

    /**
     * Logs in bypassing UI
     */
    loginByXstate(username: string, password?: string): Chainable<any>;

    /**
     * Logs out bypassing UI
     */
    logoutByXstate(): Chainable<void>;

    /**
     * Create Transaction bypassing UI
     */
    createTransaction(payload): Chainable<any>;

    nextTransactionFeedPage(service: string, page: number): Chainable<any>;

    pickDateRange(startDate: Date, endDate: Date): Chainable<void>;

    getTest(dataTestAttribute: string): Chainable<Element>;
    getTestLike(dataTestPrefixAttribute: string): Chainable<Element>;
    fetchTestData(entity: string, filterDetails: object): Chainable<any[]>;
  }
}
