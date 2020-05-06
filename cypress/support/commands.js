// @ts-check
/// <reference path="../global.d.ts" />

import { pick } from "lodash/fp";
import chaiDatetime from "chai-datetime";
import { format as formatDate } from "date-fns";

chai.use(chaiDatetime);

const defaultPassword = Cypress.env("defaultPassword");

Cypress.Commands.add("login", (username, password, rememberUser = false) => {
  const signinPath = "/signin";
  const log = Cypress.log({
    name: "login",
    displayName: "LOGIN",
    // @ts-ignore
    message: `🔐 Authenticating | ${username}`,
  });

  cy.server();
  cy.route("POST", "/login").as("loginUser");
  cy.route("GET", "checkAuth").as("getUserProfile");

  cy.location("pathname", { log: false }).then((currentPath) => {
    if (currentPath !== signinPath) {
      cy.visit(signinPath);
    }
  });

  log.snapshot("before");

  cy.getBySel("signin-username").type(username);
  cy.getBySel("signin-password").type(password);

  if (rememberUser) {
    cy.getBySel("signin-remember-me").find("input").check();
  }

  cy.getBySel("signin-submit").click();
  cy.wait(["@loginUser", "@getUserProfile"]).spread((loginUser, getUserProfile) => {
    log.set({
      consoleProps() {
        return {
          username,
          password,
          rememberUser,
          userId: getUserProfile.response.body.user.id,
        };
      },
    });

    // Question: what is the "2" state in between before and after snapshots
    log.snapshot("after");
    log.end();
  });
});

Cypress.Commands.add("loginByApi", (username, password = defaultPassword) => {
  return cy.request("POST", `${Cypress.env("apiUrl")}/login`, {
    username,
    password,
  });
});

Cypress.Commands.add("waitForXstateService", (service) => {
  return cy.window({ log: false }).should((win) => {
    // @ts-ignore
    if (!win[service].initialized) {
      throw new Error(`${service} is not ready!`);
    }
  });
});

Cypress.Commands.add("reactComponent", { prevSubject: "element" }, ($el) => {
  if ($el.length !== 1) {
    throw new Error(`cy.component() requires element of length 1 but got ${$el.length}`);
  }
  const key = Object.keys($el.get(0)).find((key) => key.startsWith("__reactInternalInstance$"));

  // @ts-ignore
  const domFiber = $el.prop(key);

  Cypress.log({
    name: "component",
    consoleProps() {
      return {
        component: domFiber,
      };
    },
  });

  return domFiber.return;
});

Cypress.Commands.add("setTransactionAmountRange", (min, max) => {
  cy.getBySel("transaction-list-filter-amount-range-button")
    .scrollIntoView()
    .click({ force: true });

  return cy
    .getBySelLike("filter-amount-range-slider")
    .reactComponent()
    .its("memoizedProps")
    .invoke("onChange", null, [min / 10, max / 10]);
});

Cypress.Commands.add("loginByXstate", (username, password = defaultPassword) => {
  const log = Cypress.log({
    name: "loginbyxstate",
    displayName: "LOGIN BY XSTATE",
    // @ts-ignore
    message: `🔐 Authenticating | ${username}`,
    autoEnd: false,
  });

  cy.server();
  cy.route("POST", "/login").as("loginUser");
  cy.route("GET", "/checkAuth").as("getUserProfile");
  cy.visit("/signin", { log: false }).then(() => {
    log.snapshot("before");
  });

  // Temporary fix for a real world problem
  cy.wait(100, { log: false });

  cy.waitForXstateService("authService");

  cy.window({ log: false }).then((win) => win.authService.send("LOGIN", { username, password }));

  return cy.wait(["@loginUser", "@getUserProfile"]).spread((loginUser, getUserProfile) => {
    log.set({
      consoleProps() {
        return {
          username,
          password,
          userId: getUserProfile.response.body.user.id,
        };
      },
    });

    log.snapshot("after");
    log.end();
  });
});

Cypress.Commands.add("logoutByXstate", () => {
  cy.server();
  cy.route("POST", "/logout").as("logoutUser");

  const log = Cypress.log({
    name: "logoutByXstate",
    displayName: "LOGOUT BY XSTATE",
    // @ts-ignore
    message: `🔒 Logging out current user`,
    autoEnd: false,
  });

  cy.window({ log: false }).then((win) => {
    log.snapshot("before");
    win.authService.send("LOGOUT");
  });

  return cy.wait("@logoutUser").then(() => {
    log.snapshot("after");
    log.end();
  });
});

Cypress.Commands.add("createTransaction", (payload) => {
  const log = Cypress.log({
    name: "createTransaction",
    displayName: "CREATE TRANSACTION",
    // @ts-ignore
    message: `💸 (${payload.transactionType}): ${payload.sender.id} <> ${payload.receiver.id}`,
    autoEnd: false,
    consoleProps() {
      return payload;
    },
  });

  return cy
    .window({ log: false })
    .then((win) => {
      log.snapshot("before");
      win.createTransactionService.send("SET_USERS", payload);

      const createPayload = pick(["amount", "description", "transactionType"], payload);

      return win.createTransactionService.send("CREATE", {
        ...createPayload,
        senderId: payload.sender.id,
        receiverId: payload.receiver.id,
      });
    })
    .then(() => {
      log.snapshot("after");
      log.end();
    });
});

Cypress.Commands.add("nextTransactionFeedPage", (service, page) => {
  const log = Cypress.log({
    name: "nextTransactionFeedPage",
    displayName: "NEXT TRANSACTION FEED PAGE",
    // @ts-ignore
    message: `📃 Fetching page ${page} with ${service}`,
    autoEnd: false,
    consoleProps() {
      return {
        service,
        page,
      };
    },
  });

  return cy
    .window({ log: false })
    .then((win) => {
      log.snapshot("before");
      // @ts-ignore
      return win[service].send("FETCH", { page });
    })
    .then(() => {
      log.snapshot("after");
      log.end();
    });
});

Cypress.Commands.add("pickDateRange", (startDate, endDate) => {
  const log = Cypress.log({
    name: "pickDateRange",
    displayName: "PICK DATE RANGE",
    // @ts-ignore
    message: `🗓 ${startDate.toDateString()} to ${endDate.toDateString()}`,
    autoEnd: false,
    consoleProps() {
      return {
        startDate,
        endDate,
      };
    },
  });

  const selectDate = (date) => {
    return cy.get(`[data-date='${formatDate(date, "yyyy-MM-dd")}']`).click({ force: true });
  };

  // Focus initial viewable date picker range around target start date
  // @ts-ignore: Cypress expects wrapped variable to be a jQuery type
  cy.wrap(startDate.getTime()).then((now) => {
    log.snapshot("before");
    // @ts-ignore
    cy.clock(now, ["Date"]);
  });

  // Open date range picker
  cy.getBySelLike("filter-date-range-button").click({ force: true });

  // Select date range
  selectDate(startDate);
  selectDate(endDate).then(() => {
    log.snapshot("after");
    log.end();
  });
});

Cypress.Commands.add("getBySel", (selector, ...args) => cy.get(`[data-test=${selector}]`, ...args));
Cypress.Commands.add("getBySelLike", (selector, ...args) =>
  cy.get(`[data-test*=${selector}]`, ...args)
);
