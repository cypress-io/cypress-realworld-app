// @ts-check
///<reference path="../global.d.ts" />

// @ts-ignore
import OktaAuth from "@okta/okta-auth-js";

// Okta
Cypress.Commands.add("loginByOktaApi", (username: string, password: string) => {
  cy.log(`Logging in as ${username}`);

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
      redirectUri: "http://localhost:3000/implicit/callback",
      scope: ["openid", "email", "profile"],
    };

    const authClient = new OktaAuth(config);

    return authClient.token
      .getWithoutPrompt({
        sessionToken: body.sessionToken,
        responseType: "id_token",
      })
      .then((res: any) => {
        const tokens = res.tokens;

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

        cy.visit("/");
      });
  });
});
