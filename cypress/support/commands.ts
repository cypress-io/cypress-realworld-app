// @ts-check
///<reference path="../global.d.ts" />

import { pick } from "lodash/fp";
import { format as formatDate } from "date-fns";
import { isMobile } from "./utils";

// Import Cypress Percy plugin command (https://docs.percy.io/docs/cypress)
import "@percy/cypress";

// Import commands for third-party auth providers
import "./auth-provider-commands/auth0";
import "./auth-provider-commands/okta";

// custom command to make taking snapshots with full name
// formed from the test title + suffix easier
// cy.visualSnapshot() // default full test title
// cy.visualSnapshot('clicked') // full test title + ' - clicked'
// also sets the width and height to the current viewport
Cypress.Commands.add("visualSnapshot", (maybeName) => {
  // @ts-ignore
  let snapshotTitle = cy.state("runnable").fullTitle();
  if (maybeName) {
    snapshotTitle = snapshotTitle + " - " + maybeName;
  }
  cy.percySnapshot(snapshotTitle, {
    // @ts-ignore
    widths: [cy.state("viewportWidth")],
    // @ts-ignore
    minHeight: cy.state("viewportHeight"),
  });
});

Cypress.Commands.add("getBySel", (selector, ...args) => {
  return cy.get(`[data-test=${selector}]`, ...args);
});

Cypress.Commands.add("getBySelLike", (selector, ...args) => {
  return cy.get(`[data-test*=${selector}]`, ...args);
});

Cypress.Commands.add("login", (username, password, { rememberUser = false } = {}) => {
  const signinPath = "/signin";
  const log = Cypress.log({
    name: "login",
    displayName: "LOGIN",
    message: [`🔐 Authenticating | ${username}`],
    // @ts-ignore
    autoEnd: false,
  });

  cy.intercept("POST", "/login").as("loginUser");
  cy.intercept("GET", "checkAuth").as("getUserProfile");

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
  cy.wait("@loginUser").then((loginUser: any) => {
    log.set({
      consoleProps() {
        return {
          username,
          password,
          rememberUser,
          userId: loginUser.response.statusCode !== 401 && loginUser.response.body.user.id,
        };
      },
    });

    log.snapshot("after");
    log.end();
  });
});

Cypress.Commands.add("loginByApi", (username, password = Cypress.env("defaultPassword")) => {
  return cy.request("POST", `${Cypress.env("apiUrl")}/login`, {
    username,
    password,
  });
});

Cypress.Commands.add("reactComponent", { prevSubject: "element" }, ($el) => {
  if ($el.length !== 1) {
    throw new Error(`cy.component() requires element of length 1 but got ${$el.length}`);
  }
  // Query for key starting with __reactInternalInstance$ for React v16.x
  //
  const key = Object.keys($el.get(0)).find((key) => key.startsWith("__reactFiber$"));

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
  cy.getBySel("transaction-list-filter-amount-range-button").scrollIntoView();
  cy.getBySel("transaction-list-filter-amount-range-button").click({ force: true });

  return cy
    .getBySelLike("filter-amount-range-slider")
    .reactComponent()
    .its("memoizedProps")
    .its("ownerState")
    .invoke("onChange", null, [min / 10, max / 10]);
});

Cypress.Commands.add("loginByXstate", (username, password = Cypress.env("defaultPassword")) => {
  const log = Cypress.log({
    name: "loginbyxstate",
    displayName: "LOGIN BY XSTATE",
    message: [`🔐 Authenticating | ${username}`],
    autoEnd: false,
  });

  cy.intercept("POST", "/login").as("loginUser");
  cy.intercept("GET", "/checkAuth").as("getUserProfile");
  cy.visit("/signin", { log: false }).then(() => {
    log.snapshot("before");
  });

  cy.window({ log: false }).then((win) => win.authService.send("LOGIN", { username, password }));

  cy.wait("@loginUser").then((loginUser) => {
    log.set({
      consoleProps() {
        return {
          username,
          password,
          // @ts-ignore
          userId: loginUser.response.body.user.id,
        };
      },
    });
  });

  return cy
    .getBySel("list-skeleton")
    .should("not.exist")
    .then(() => {
      log.snapshot("after");
      log.end();
    });
});

Cypress.Commands.add("logoutByXstate", () => {
  const log = Cypress.log({
    name: "logoutByXstate",
    displayName: "LOGOUT BY XSTATE",
    message: [`🔒 Logging out current user`],
    // @ts-ignore
    autoEnd: false,
  });

  cy.window({ log: false }).then((win) => {
    log.snapshot("before");
    win.authService.send("LOGOUT");
  });

  return cy
    .location("pathname")
    .should("equal", "/signin")
    .then(() => {
      log.snapshot("after");
      log.end();
    });
});

Cypress.Commands.add("switchUserByXstate", (username) => {
  cy.logoutByXstate();
  return cy.loginByXstate(username).then(() => {
    if (isMobile()) {
      cy.getBySel("sidenav-toggle").click();
      cy.getBySel("sidenav-username").contains(username);
      cy.getBySel("sidenav-toggle").click({ force: true });
    } else {
      cy.getBySel("sidenav-username").contains(username);
    }
    cy.getBySel("list-skeleton").should("not.exist");
    cy.getBySelLike("transaction-item").should("have.length.greaterThan", 1);
  });
});

Cypress.Commands.add("createTransaction", (payload) => {
  const log = Cypress.log({
    name: "createTransaction",
    displayName: "CREATE TRANSACTION",
    message: [`💸 (${payload.transactionType}): ${payload.sender.id} <> ${payload.receiver.id}`],
    // @ts-ignore
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
    message: [`📃 Fetching page ${page} with ${service}`],
    // @ts-ignore
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
    message: [`🗓 ${startDate.toDateString()} to ${endDate.toDateString()}`],
    // @ts-ignore
    autoEnd: false,
    consoleProps() {
      return {
        startDate,
        endDate,
      };
    },
  });

  const selectDate = (date: Date) => {
    return cy.get(`[data-date='${formatDate(date, "yyyy-MM-dd")}']`).click({ force: true });
  };

  log.snapshot("before");
  // Focus initial viewable date picker range around target start date
  // @ts-ignore
  cy.clock(startDate.getTime(), ["Date"]);

  // Open date range picker
  cy.getBySelLike("filter-date-range-button").click({ force: true });
  cy.get(".Cal__Header__root").should("be.visible");

  // Select date range
  selectDate(startDate);
  selectDate(endDate).then(() => {
    log.snapshot("after");
    log.end();
  });

  cy.get(".Cal__Header__root").should("not.exist");
});

Cypress.Commands.add("database", (operation, entity, query, logTask = false) => {
  const params = {
    entity,
    query,
  };

  const log = Cypress.log({
    name: "database",
    displayName: "DATABASE",
    message: [`🔎 ${operation}ing within ${entity} data`],
    // @ts-ignore
    autoEnd: false,
    consoleProps() {
      return params;
    },
  });

  return cy.task(`${operation}:database`, params, { log: logTask }).then((data) => {
    log.snapshot();
    log.end();
    return data;
  });
});

Cypress.Commands.add("loginByGoogleApi", () => {
  cy.log("Logging in to Google");

  cy.request({
    method: "POST",
    url: "https://www.googleapis.com/oauth2/v4/token",
    body: {
      grant_type: "refresh_token",
      client_id: Cypress.env("googleClientId"),
      client_secret: Cypress.env("googleClientSecret"),
      refresh_token: Cypress.env("googleRefreshToken"),
    },
  }).then(({ body }) => {
    const { access_token, id_token } = body;

    cy.request({
      method: "GET",
      url: "https://www.googleapis.com/oauth2/v3/userinfo",
      headers: { Authorization: `Bearer ${access_token}` },
    }).then(({ body }) => {
      cy.log(body);
      const userItem = {
        token: id_token,
        user: {
          googleId: body.sub,
          email: body.email,
          givenName: body.given_name,
          familyName: body.family_name,
          imageUrl: body.picture,
        },
      };

      window.localStorage.setItem("googleCypress", JSON.stringify(userItem));

      cy.visit("/");
    });
  });
});
