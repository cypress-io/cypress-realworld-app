// @ts-check
///<reference path="../global.d.ts" />

Cypress.Commands.add("login", (username, password, rememberUser = false) => {
  const signinPath = "/signin";
  const log = Cypress.log({
    name: "login",
    displayName: "LOGIN",
    message: [`🔐 Authenticating | ${username}`],
    // @ts-ignore
    autoEnd: false,
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
  cy.wait("@loginUser").then((loginUser) => {
    log.set({
      consoleProps() {
        return {
          username,
          password,
          rememberUser,
          // @ts-ignore
          userId: loginUser.response.body.user.id,
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

Cypress.Commands.add("loginByXstate", (username, password = Cypress.env("defaultPassword")) => {
  const log = Cypress.log({
    name: "loginbyxstate",
    displayName: "LOGIN BY XSTATE",
    message: [`🔐 Authenticating | ${username}`],
    // @ts-ignore
    autoEnd: false,
  });

  cy.server();
  cy.route("POST", "/login").as("loginUser");
  cy.route("GET", "/checkAuth").as("getUserProfile");
  cy.visit("/signin", { log: false }).then(() => {
    log.snapshot("before");
  });

  cy.window({ log: false }).then((win) => win.authService.send("LOGIN", { username, password }));

  return cy.wait("@loginUser").then((loginUser) => {
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
    message: [`🔒 Logging out current user`],
    // @ts-ignore
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

Cypress.Commands.add("switchUser", (username) => {
  cy.logoutByXstate();
  return cy.loginByXstate(username);
});
