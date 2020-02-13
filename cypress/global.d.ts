// type definitions for Cypress object "cy"
// https://on.cypress.io/typescript
/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    // describe new "cy" commands here
    apiLogin(username: string, password?: string): Chainable<Response>
  }
}
