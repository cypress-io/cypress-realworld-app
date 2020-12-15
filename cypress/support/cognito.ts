import Amplify, { Auth } from "aws-amplify";

Amplify.configure(Cypress.env("awsConfig"));

// Amazon Cognito
Cypress.Commands.add("loginByCognitoApi", (username, password) => {
  cy.wrap(
    Auth.signIn({
      username,
      password,
    })
  ).then((cognitoResponse) => {
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

    cy.visit("/");
  });
});
