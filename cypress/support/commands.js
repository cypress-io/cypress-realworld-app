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

  cy.getTest("signin-username").type(username);
  cy.getTest("signin-password").type(password);

  if (rememberUser) {
    cy.getTest("signin-remember-me").find("input").check();
  }

  cy.getTest("signin-submit").click();
  cy.wait(["@loginUser", "@getUserProfile"]).spread(
    (loginUser, getUserProfile) => {
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
    }
  );
});

Cypress.Commands.add("loginByApi", (username, password = defaultPassword) => {
  return cy.request("POST", `${Cypress.env("apiUrl")}/login`, {
    username,
    password,
  });
});

Cypress.Commands.add("waitForXstateService", (service) => {
  return cy.window({ log: false }).should((win) => {
    const message = `${service} is ready`;
    // @ts-ignore
    expect(win[service].initialized, message).to.be.true;

Cypress.Commands.add("component", { prevSubject: "element" }, ($el) => {
  if ($el.length !== 1) {
    throw new Error(
      `cy.component() requires element of length 1 but got ${$el.length}`
    );
  }
  const key = Object.keys($el.get(0)).find((key) =>
    key.startsWith("__reactInternalInstance$")
  );
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
    log.snapshot("before");


  return domFiber._debugOwner;
});

Cypress.Commands.add("setTransactionAmountRange", (min, max) => {
  return cy
    .getTestLike("filter-amount-range-slider")
    .component()
    .its("memoizedProps")
    .invoke("onChange", null, [min / 10, max / 10]);
});

Cypress.Commands.add(
  "loginByXstate",
  (username, password = defaultPassword) => {
    const log = Cypress.log({
      name: "loginbyxstate",
      displayName: "LOGIN BY XSTATE",
      // @ts-ignore
      message: `🔐 Authenticating | ${username}`,
    });

    cy.server();
    cy.route("POST", "/login").as("loginUser");
    cy.route("GET", "/checkAuth").as("getUserProfile");
    cy.visit("/signin");

    // Temporary fix
    cy.wait(100, { log: false });

    log.snapshot("before");

    cy.waitForXstateService("authService");

    cy.window({ log: false }).then((win) =>
      win.authService.send("LOGIN", { username, password })
    );

    return cy
      .wait(["@loginUser", "@getUserProfile"])
      .spread((loginUser, getUserProfile) => {
        log.set({
          consoleProps() {
            return {
              username,
              password,
              userId: getUserProfile.response.body.user.id,
            };
          },
        });

        // Question: what is the "2" state in between before and after snapshots
        log.snapshot("after");
        log.end();
      });
  }
);

Cypress.Commands.add("logoutByXstate", () => {
  cy.server();
  cy.route("POST", "/logout").as("logoutUser");

  const log = Cypress.log({
    name: "logoutByXstate",
    displayName: "LOGOUT BY XSTATE",
    // @ts-ignore
    message: `🔒 Logging out current user`,
  });

  log.snapshot("before");

  // cy.window({ log: false }).its("authService").invoke("send", ["LOGOUT"]);
  cy.window({ log: false }).then((win) => win.authService.send("LOGOUT"));
  cy.wait("@logoutUser");

  log.snapshot("after");
  log.end();
});

Cypress.Commands.add("createTransaction", (payload) => {
  Cypress.log({
    name: "createTransaction",
    displayName: "CREATE TRANSACTION",
    // @ts-ignore
    message: `💸 (${payload.transactionType}): ${payload.sender.id} <> ${payload.receiver.id}`,
    consoleProps() {
      return payload;
    },
  });

  return cy.window({ log: false }).then((win) => {
    win.createTransactionService.send("SET_USERS", payload);

    const createPayload = pick(
      ["amount", "description", "transactionType"],
      payload
    );

    win.createTransactionService.send("CREATE", {
      ...createPayload,
      senderId: payload.sender.id,
      receiverId: payload.receiver.id,
    });
  });
});

Cypress.Commands.add("nextTransactionFeedPage", (service, page) => {
  Cypress.log({
    name: "nextTransactionFeedPage",
    displayName: "NEXT TRANSACTION FEED PAGE",
    // @ts-ignore
    message: `📃 Fetching page ${page} with ${service}`,
    consoleProps() {
      return {
        service,
        page,
      };
    },
  });

  return cy.window({ log: false }).then((win) => {
    // @ts-ignore
    return win[service].send("FETCH", { page });
  });
});

Cypress.Commands.add("pickDateRange", (startDate, endDate) => {
  const log = Cypress.log({
    name: "pickDateRange",
    displayName: "PICK DATE RANGE",
    // @ts-ignore
    message: `🗓 ${startDate.toDateString()} to ${endDate.toDateString()}`,
    consoleProps() {
      return {
        startDate,
        endDate,
      };
    },
  });

  const selectDate = (date) => {
    return cy
      .get(`[data-date='${formatDate(date, "yyyy-MM-dd")}']`)
      .click({ force: true });
  };

  log.snapshot("before");

  // Focus initial viewable date picker range around target start date
  // @ts-ignore: Cypress expects wrapped variable to be a jQuery type
  cy.wrap(startDate.getTime()).then((now) => cy.clock(now, ["Date"]));

  // Open date range picker
  cy.getTestLike("filter-date-range-button").click({ force: true });

  // Select date range
  selectDate(startDate);
  selectDate(endDate).then(() => {
    log.snapshot("after");
    log.end();
  });
});

Cypress.Commands.add("getTest", (s, ...args) =>
  cy.get(`[data-test=${s}]`, ...args)
);
Cypress.Commands.add("getTestLike", (s, ...args) =>
  cy.get(`[data-test*=${s}]`, ...args)
);
