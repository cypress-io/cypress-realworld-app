/// <reference types="cypress" />

declare namespace Cypress {
  import { authService } from "../src/machines/authMachine";
  import { createTransactionService } from "../src/machines/createTransactionMachine";
  import { publicTransactionService } from "../src/machines/publicTransactionsMachine";
  import { contactsTransactionService } from "../src/machines/contactsTransactionsMachine";
  import { personalTransactionService } from "../src/machines/personalTransactionsMachine";
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
    authService: typeof authService;
    createTransactionService: typeof createTransactionService;
    publicTransactionService: typeof publicTransactionService;
    contactTransactionService: typeof contactsTransactionService;
    personalTransactionService: typeof personalTransactionService;
  }

  type dbQueryArg = {
    entity: string;
    query: object | [object];
  };

  type LoginOptions = {
    rememberUser: boolean;
  };

  interface Chainable {
    /**
     *  Window object with additional properties used during test.
     */
    window(options?: Partial<Loggable & Timeoutable>): Chainable<CustomWindow>;

    /**
     * Custom command to make taking Percy snapshots with full name formed from the test title + suffix easier
     */
    visualSnapshot(maybeName?): Chainable<any>;

    getBySel(dataTestAttribute: string, args?: any): Chainable<JQuery<HTMLElement>>;
    getBySelLike(dataTestPrefixAttribute: string, args?: any): Chainable<JQuery<HTMLElement>>;

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

    /**
     * Find a single entity via database query
     */
    database(operation: "find", entity: string, query?: object, log?: boolean): Chainable<any>;

    /**
     * Filter for data entities via database query
     */
    database(operation: "filter", entity: string, query?: object, log?: boolean): Chainable<any>;

    /**
     * Fetch React component instance associated with received element subject
     */
    reactComponent(): Chainable<any>;

    /**
     * Select data range within date range picker component
     */
    pickDateRange(startDate: Date, endDate: Date): Chainable<void>;

    /**
     * Select transaction amount range
     */
    setTransactionAmountRange(min: number, max: number): Chainable<any>;

    /**
     * Paginate to the next page in transaction infinite-scroll pagination view
     */
    nextTransactionFeedPage(service: string, page: number): Chainable<any>;

    /**
     * Logs-in user by using UI
     */
    login(username: string, password: string, loginOptions?: LoginOptions): void;

    /**
     * Logs-in user by using API request
     */
    loginByApi(username: string, password?: string): Chainable<Response>;

    /**
     * Logs-in user by using Google API request
     */
    loginByGoogleApi(): Chainable<Response>;

    /**
     * Logs-in user by using Okta API request
     */
    loginByOktaApi(username: string, password?: string): Chainable<Response>;

    /**
     * Logs-in user by navigating to Okta tenant with cy.origin()
     */
    loginByOkta(username: string, password: string): Chainable<Response>;

    /**
     * Logs in bypassing UI by triggering XState login event
     */
    loginByXstate(username: string, password?: string): Chainable<any>;

    /**
     * Logs out via bypassing UI by triggering XState logout event
     */
    logoutByXstate(): Chainable<string>;

    /**
     * Logs in via Auth0 login page
     */
    loginToAuth0(username: string, password: string): Chainable<any>;

    /**
     * Switch current user by logging out current user and logging as user with specified username
     */
    switchUserByXstate(username: string): Chainable<any>;

    /**
     * Create Transaction via bypassing UI and using XState createTransactionService
     */
    createTransaction(payload): Chainable<any>;

    /**
     * Logs in to AWS Cognito via Amplify Auth API bypassing UI using Cypress Task
     */
    loginByCognitoApi(username: string, password: string): Chainable<any>;

    /**
     * Logs in to AWS Cognito Federated via cy.origin()
     */
    loginByCognito(username: string, password: string): Chainable<any>;
  }
}
