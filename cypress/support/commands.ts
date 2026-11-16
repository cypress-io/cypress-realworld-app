// @ts-check
///<reference path="../global.d.ts" />

import { differenceInMonths, parse as parseDate } from "date-fns";
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

Cypress.Commands.add("loginByApi", (username, password) => {
  const sendLogin = (pw: string) =>
    cy.request("POST", `${Cypress.expose("apiUrl")}/login`, {
      username,
      password: pw,
    });

  return password !== undefined
    ? sendLogin(password)
    : cy.env(["defaultPassword"]).then(({ defaultPassword }) => sendLogin(defaultPassword));
});

// The slider moves whichever thumb is nearest a click to the click, and spans values 0 to
// 100, which are tens of dollars. Returns the values to click, in order, to move the thumbs
// from 0 and 100 to `min` and `max`, never clicking nearer the other thumb.
const amountRangeClicks = (min: number, max: number) => {
  const thumbs = [0, 100];
  const clicks: number[] = [];

  const moveThumb = (index: number, target: number) => {
    while (thumbs[index] !== target) {
      const midpoint = (thumbs[0] + thumbs[1]) / 2;
      const reach =
        index === 0
          ? Math.min(target, Math.ceil(midpoint) - 1)
          : Math.max(target, Math.floor(midpoint) + 1);

      if (reach === thumbs[index]) {
        throw new Error(`Can't click the amount range slider to ${min} - ${max}`);
      }

      thumbs[index] = reach;
      clicks.push(reach);
    }
  };

  moveThumb(1, max);
  moveThumb(0, min);

  return clicks;
};

Cypress.Commands.add("setTransactionAmountRange", (min, max, routeAlias) => {
  cy.getBySel("transaction-list-filter-amount-range-button").scrollIntoView();
  cy.getBySel("transaction-list-filter-amount-range-button").click({ force: true });
  // The filter grows or slides in, and its width and position are only final once it has.
  // Its first frame has no transform yet, but it also hasn't started fading in. The side nav
  // is a drawer too, so this looks for the paper the slider is in.
  cy.getBySelLike("filter-amount-range-slider")
    .closest(".MuiPopover-paper, .MuiDrawer-paper")
    .should("have.css", "opacity", "1")
    .and("have.css", "transform", "none");

  cy.getBySelLike("filter-amount-range-slider")
    .invoke("outerWidth")
    .then((width) => {
      const clicks = amountRangeClicks(min / 10, max / 10);

      clicks.forEach((value, index) => {
        // Cypress rounds a click's coordinates up, so aiming half a pixel short of a value
        // lands within half a pixel of it, closer than one step of the slider
        cy.getBySelLike("filter-amount-range-slider").click(
          (value / 100) * Number(width) - 0.5,
          1,
          {
            force: true,
          }
        );

        // Each click refetches the feed, so wait out every request but the last, which the
        // test waits for itself
        if (index < clicks.length - 1) {
          cy.wait(`@${routeAlias}`);
        }
      });
    });
});

let loginCount = 0;

Cypress.Commands.add("loginByUi", (username, password) => {
  const log = Cypress.log({
    name: "loginByUi",
    displayName: "LOGIN BY UI",
    message: [`🔐 Authenticating | ${username}`],
    autoEnd: false,
    // cy.login logs the signed-in user's id from the login response
    consoleProps() {
      return { username };
    },
  });

  // The app keeps the bank accounts it fetched across a logout, so if the next logout
  // beats this fetch, the fetch fails and the next user sees the onboarding dialog for
  // having no bank accounts. A fresh alias keeps an earlier login's fetch from matching.
  const bankAccountsAlias = `loginBankAccounts${loginCount++}`;

  cy.intercept("POST", "/graphql", (req) => {
    if (req.body?.operationName === "ListBankAccount") {
      req.alias = bankAccountsAlias;
    }
  });

  const doLogin = (pw: string) => cy.login(username, pw);

  if (password !== undefined) {
    doLogin(password);
  } else {
    cy.env(["defaultPassword"]).then(({ defaultPassword }) => doLogin(defaultPassword));
  }

  cy.wait(`@${bankAccountsAlias}`);

  return cy
    .getBySel("list-skeleton")
    .should("not.exist")
    .then(() => {
      log.snapshot("after");
      log.end();
    });
});

Cypress.Commands.add("logoutByUi", () => {
  const log = Cypress.log({
    name: "logoutByUi",
    displayName: "LOGOUT BY UI",
    message: [`🔒 Logging out current user`],
    // @ts-ignore
    autoEnd: false,
  });

  if (isMobile()) {
    cy.getBySel("sidenav-toggle").click();
  }

  cy.getBySel("sidenav-signout").click();

  return cy
    .location("pathname")
    .should("equal", "/signin")
    .then(() => {
      log.snapshot("after");
      log.end();
    });
});

Cypress.Commands.add("switchUser", (username) => {
  cy.logoutByUi();
  return cy.loginByUi(username).then(() => {
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

  cy.getBySel("user-list-search-input").type(payload.receiver.username, { force: true });
  cy.getBySel(`user-list-item-${payload.receiver.id}`).click({ force: true });
  cy.getBySelLike("amount-input").type(`${payload.amount}`);
  cy.getBySelLike("description-input").type(payload.description);

  cy.getBySelLike(`submit-${payload.transactionType}`).click();

  return cy.then(() => {
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
    const targetDay = date.getDate();

    return cy
      .get(".react-calendar__navigation__label")
      .invoke("text")
      .then((label: string) => {
        const parsedDate = parseDate(label, "MMMM yyyy", new Date());
        const monthsDiff = differenceInMonths(new Date(), parsedDate);

        if (monthsDiff < 0) {
          for (let i = 0; i < Math.abs(monthsDiff); i++) {
            cy.get(".react-calendar__navigation__prev-button").click();
          }
        } else if (monthsDiff > 0) {
          for (let i = 0; i < monthsDiff; i++) {
            cy.get(".react-calendar__navigation__next-button").click();
          }
        }
      })
      .then(() => {
        cy.get(".react-calendar__month-view__days__day")
          .contains(new RegExp(`^${targetDay}$`))
          .click({ force: true });
      });
  };

  log.snapshot("before");
  // Focus initial viewable date picker range around target start date
  // @ts-ignore
  cy.clock(startDate.getTime(), ["Date"]);

  // Open date range picker
  cy.getBySelLike("filter-date-range-button").click({ force: true });
  cy.get(".react-calendar").should("be.visible");

  // Select date range
  selectDate(startDate);
  selectDate(endDate).then(() => {
    log.snapshot("after");
    log.end();
  });

  cy.get(".react-calendar").should("not.exist");
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

  cy.task<{ clientSecret: string; refreshToken: string }>("getGoogleCredentials").then(
    ({ clientSecret, refreshToken }) => {
      cy.request({
        method: "POST",
        url: "https://www.googleapis.com/oauth2/v4/token",
        body: {
          grant_type: "refresh_token",
          client_id: Cypress.expose("googleClientId"),
          client_secret: clientSecret,
          refresh_token: refreshToken,
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
    }
  );
});
