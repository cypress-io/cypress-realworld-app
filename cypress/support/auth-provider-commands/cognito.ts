import { Amplify } from "aws-amplify";
import { fetchAuthSession, signIn } from "aws-amplify/auth";

Amplify.configure(Cypress.env("awsConfig"));

const fetchJwts = async (username: string, password: string) => {
  const options = { authFlowType: "USER_PASSWORD_AUTH" as const };
  await signIn({ username, password, options });
  const authSession = await fetchAuthSession();
  const tokens = authSession.tokens!;
  const accessToken = tokens.accessToken;
  const accessTokenPayload = accessToken.payload;
  return {
    idToken: tokens.idToken!.toString(),
    accessToken: accessToken.toString(),
    clientId: accessTokenPayload.client_id as string,
    accessTokenSub: accessTokenPayload.sub!,
  };
};
type JwtResponse = Awaited<ReturnType<typeof fetchJwts>>;

// Amazon Cognito
Cypress.Commands.add("loginByCognitoApi", (username: string, password: string) => {
  const log = Cypress.log({
    displayName: "COGNITO LOGIN",
    message: [`🔐 Authenticating | ${username}`],
    autoEnd: false,
  });

  log.snapshot("before");

  cy.wrap(fetchJwts(username, password), { log: false }).then((unknownJwts) => {
    const { idToken, accessToken, clientId, accessTokenSub } = unknownJwts as JwtResponse;

    const keyPrefix = `CognitoIdentityServiceProvider.${clientId}`;
    const keyPrefixWithUsername = `${keyPrefix}.${accessTokenSub}`;

    const ls = window.localStorage;
    ls.setItem(`${keyPrefixWithUsername}.idToken`, idToken);
    ls.setItem(`${keyPrefixWithUsername}.accessToken`, accessToken);
    ls.setItem(`${keyPrefix}.LastAuthUser`, accessTokenSub);

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

      cy.origin(
        Cypress.env("cognito_domain"),
        {
          args: {
            username,
            password,
          },
        },
        ({ username, password }) => {
          cy.contains("Sign in with your email and password");
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
