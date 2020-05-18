/// <reference types="cypress" />

declare namespace Cypress {
  import {
    User,
    BankAccount,
    Like,
    Comment,
    Transaction,
    BankTransfer,
    Contact,
  } from "../src/models";

  interface CustomWindow extends Window {
    authService: any;
    createTransactionService: any;
    publicTransactionService: any;
    contactTransactionService: any;
    personalTransactionService: any;
  }

  interface Chainable {
    window(options?: Partial<Loggable & Timeoutable>): Chainable<CustomWindow>;

    task(
      event: "filter:testData",
      arg?: any,
      options?: Partial<Loggable & Timeoutable>
    ): Chainable<any[]>;

    task(
      event: "find:testData",
      arg?: any,
      options?: Partial<Loggable & Timeoutable>
    ): Chainable<any>;

    task(
      event: "queryDatabase",
      arg?: any,
      options?: Partial<Loggable & Timeoutable>
    ): Chainable<any>;

    waitForXstateService(service: string): Chainable<CustomWindow>;

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

    switchUser(username: string): Chainable<any>;

    /**
     * Create Transaction bypassing UI
     */
    createTransaction(payload): Chainable<any>;

    nextTransactionFeedPage(service: string, page: number): Chainable<any>;

    pickDateRange(startDate: Date, endDate: Date): Chainable<void>;

    getBySel(dataTestAttribute: string, args?: any): Chainable<Element>;
    getBySelLike(dataTestPrefixAttribute: string, args?: any): Chainable<Element>;
    database(operation: "find", entity: string, query?: object, log?: boolean): Chainable<any>;
    database(operation: "filter", entity: string, query?: object, log?: boolean): Chainable<any[]>;
    reactComponent(): Chainable<any>;
    setTransactionAmountRange(min: number, max: number): Chainable<any>;
    clickWithoutScroll(): Chainable<Element>;
  }
}
