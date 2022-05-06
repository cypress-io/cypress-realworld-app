import "@cypress/code-coverage/support";
import "./commands";

import { mount } from "cypress/react";
declare global {
  namespace Cypress {
    interface Chainable {
      mount: typeof mount;
    }
  }
}

Cypress.Commands.add("mount", mount);
