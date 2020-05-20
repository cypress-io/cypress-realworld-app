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

  type dbQueryArg = {
    entity: string;
    query: object | [object];
  };

  interface Chainable {
    /**
     *  Window object with additional properties used during test.
     */
    window(options?: Partial<Loggable & Timeoutable>): Chainable<CustomWindow>;

    getBySel(dataTestAttribute: string, args?: any): Chainable<Element>;
    getBySelLike(dataTestPrefixAttribute: string, args?: any): Chainable<Element>;

    /**
     *  Cypress task for directly querying to the database within tests
     */
    task(
      event: "filter:database",
      arg: dbQueryArg,
      options?: Partial<Loggable & Timeoutable>
    ): Chainable<any[]>;

    /**
     *  Cypress task for directly querying to the database within tests
     */
    task(
      event: "find:database",
      arg?: any,
      options?: Partial<Loggable & Timeoutable>
    ): Chainable<any>;

    database(operation: "find", entity: string, query?: object, log?: boolean): Chainable<any>;
    database(operation: "filter", entity: string, query?: object, log?: boolean): Chainable<any[]>;

    reactComponent(): Chainable<any>;
    pickDateRange(startDate: Date, endDate: Date): Chainable<void>;
    setTransactionAmountRange(min: number, max: number): Chainable<any>;
    nextTransactionFeedPage(service: string, page: number): Chainable<any>;

    /**
     * Logs in using user interface
     */
    login(username: string, password: string, rememberUser?: boolean): void;

    /**
     * Logs in using API request
     */
    loginByApi(username: string, password?: string): Chainable<Response>;

    /**
     * Logs in bypassing UI by triggering XState login event
     */
    loginByXstate(username: string, password?: string): Chainable<any>;

    /**
     * Logs out bypassing UI by triggering XState login event
     */
    logoutByXstate(): Chainable<void>;

    /**
     * Switch current user by logging out current user and logging as user with specified username
     */
    switchUser(username: string): Chainable<any>;

    /**
     * Create Transaction bypassing UI
     */
    createTransaction(payload): Chainable<any>;
  }
}
