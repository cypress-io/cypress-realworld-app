// @ts-check
///<reference path="../../global.d.ts" />

// @ts-ignore
import { OktaAuth } from "@okta/okta-auth-js";

import { frontendPort } from "../../../src/utils/portUtils";

// Okta
Cypress.Commands.add("loginByOktaApi", (username: string, password?: string) => {
  const log = Cypress.log({
    displayName: "OKTA LOGIN",
    message: [`🔐 Authenticating | ${username}`],
    autoEnd: false,
  });

  log.snapshot("before");

  cy.request({
    method: "POST",
    url: `https://${Cypress.env("okta_domain")}/api/v1/authn`,
    body: {
      username,
      password,
    },
  }).then(({ body }) => {
    const user = body._embedded.user;
    const config = {
      issuer: `https://${Cypress.env("okta_domain")}/oauth2/default`,
      clientId: Cypress.env("okta_client_id"),
      redirectUri: `http://localhost:${frontendPort}/implicit/callback`,
      scope: ["openid", "email", "profile"],
    };

    const authClient = new OktaAuth(config);

    return authClient.token
      .getWithoutPrompt({
        sessionToken: body.sessionToken,
      })
      .then(({ tokens }: any) => {
        const userItem = {
          token: tokens.accessToken.value,
          user: {
            sub: user.id,
            email: user.profile.login,
            given_name: user.profile.firstName,
            family_name: user.profile.lastName,
            preferred_username: user.profile.login,
          },
        };

        window.localStorage.setItem("oktaCypress", JSON.stringify(userItem));

        log.snapshot("after");
        log.end();
      });
  });

  cy.visit("/");
});

// Okta
Cypress.Commands.add("loginByOkta", (username: string, password: string) => {
  cy.session(
    `okta-${username}`,
    () => {
      Cypress.log({
        displayName: "OKTA LOGIN",
        message: [`🔐 Authenticating | ${username}`],
      });

      cy.visit("/");

      cy.origin(
        Cypress.env("okta_domain"),
        { args: { username, password } },
        ({ username, password }) => {
          cy.get('input[name="identifier"]').type(username);
          cy.get('input[name="credentials.passcode"]').type(password, {
            log: false,
          });
          cy.get('[type="submit"]').click();
        }
      );

      cy.get('[data-test="sidenav-username"]').should("contain", username);
    },
    {
      validate() {
        cy.visit("/");
        /**
         * NOTE: We recommend validating sessions by either validating
         * localStorage or cookies values, or possibly accessing an
         * endpoint to validate that the correct user is logged.
         */
        // revalidate our session to make sure we are logged in
        cy.get('[data-test="sidenav-username"]').should("contain", username);
      },
    }
  );
});
