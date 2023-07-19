import Amplify, { Auth } from "aws-amplify";

Amplify.configure(Cypress.env("awsConfig"));

// Amazon Cognito
Cypress.Commands.add("loginByCognitoApi", (username, password) => {
  const log = Cypress.log({
    displayName: "COGNITO LOGIN",
    message: [`🔐 Authenticating | ${username}`],
    // @ts-ignore
    autoEnd: false,
  });

  log.snapshot("before");

  const signIn = Auth.signIn({ username, password });

  cy.wrap(signIn, { log: false }).then((cognitoResponse: any) => {
    const keyPrefixWithUsername = `${cognitoResponse.keyPrefix}.${cognitoResponse.username}`;
    window.localStorage.setItem(
      `${keyPrefixWithUsername}.idToken`,
      cognitoResponse.signInUserSession.idToken.jwtToken
    );
    window.localStorage.setItem(
      `${keyPrefixWithUsername}.accessToken`,
      cognitoResponse.signInUserSession.accessToken.jwtToken
    );
    window.localStorage.setItem(
      `${keyPrefixWithUsername}.refreshToken`,
      cognitoResponse.signInUserSession.refreshToken.token
    );
    window.localStorage.setItem(
      `${keyPrefixWithUsername}.clockDrift`,
      cognitoResponse.signInUserSession.clockDrift
    );
    window.localStorage.setItem(
      `${cognitoResponse.keyPrefix}.LastAuthUser`,
      cognitoResponse.username
    );

    window.localStorage.setItem("amplify-authenticator-authState", "signedIn");

    log.snapshot("after");
    log.end();
  });

  cy.visit("/");
});

// Amazon Cognito
Cypress.Commands.add("loginByCognito", (username, password) => {
  cy.session(
    `cognito-${username}`,
    () => {
      Cypress.log({
        displayName: "COGNITO LOGIN",
        message: [`🔐 Authenticating | ${username}`],
        // @ts-ignore
        autoEnd: false,
      });

      cy.visit("/");
      cy.contains("Sign in with AWS", {
        includeShadowDom: true,
      }).click();

      cy.origin(
        Cypress.env("cognito_domain"),
        {
          args: {
            username,
            password,
          },
        },
        ({ username, password }) => {
          // cognito log in page has some elements of the same id but are off screen. we only want the visible elements to log in
          cy.get('input[name="username"]:visible').type(username);
          cy.get('input[name="password"]:visible').type(password, {
            log: false,
          });
          cy.get('input[name="signInSubmitButton"]:visible').click();
        }
      );

      // give a few seconds for redirect to settle
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(2000);

      // verify we have made it passed the login screen
      cy.contains("Get Started").should("be.visible");
    },
    {
      validate() {
        cy.visit("/");
        /**
         * NOTE: We recommend validating sessions by either validating
         * localStorage or cookies values, or possibly accessing an
         * endpoint to validate that the correct user is logged.
         *
         * This example is here for brevity to make sure
         * our user is directly taken to the onboarding flow
         * and not blocked by a login screen
         */
        // revalidate our session to make sure we are logged in
        cy.contains("Get Started").should("be.visible");
      },
    }
  );
});
