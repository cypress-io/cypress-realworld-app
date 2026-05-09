# Third-Party Authentication Providers

Support for 3rd party authentication is available in the application to demonstrate the concepts of logging in with a 3rd party provider.

The app contains different entry points for each provider. There is a separate **index** file for each provider, and to use one, you must replace the current **index.tsx** file with the desired one.

## Supported Providers

- [Auth0](#auth0) (index.auth0.tsx)
- [Okta](#okta) (index.okta.tsx)
- [Amazon Cognito](#amazon-cognito) (index.cognito.tsx)
- [Google](#google) (index.google.tsx)

---

## Auth0

The [Auth0](https://auth0.com/) tests have been rewritten to take advantage of [`cy.session`](https://docs.cypress.io/api/commands/session) and [`cy.origin`](https://docs.cypress.io/api/commands/origin) commands.

### Prerequisites

- Auth0 account
- Tenant configured for use with a SPA
- Environment variables from Auth0 placed in [.env](../.env)

For more details see:
- [Auth0 Application Setup](http://on.cypress.io/auth0#Auth0-Application-Setup)
- [Setting Auth0 app credentials in Cypress](http://on.cypress.io/auth0#Setting-Auth0-app-credentials-in-Cypress)

### Setup

1. Replace **src/index.tsx** with **src/index.auth0.tsx**
2. Start the application: `npm run dev:auth0`
3. Run Cypress: `npm run cypress:open`

> **Note**: The only passing spec will be the [auth0 spec](../cypress/src/ui-auth-providers/auth0.spec.ts); all others will fail. Your test user will need to authorize your Auth0 app before the tests will pass.

---

## Okta

A [guide has been written with detail around adapting the RWA](http://on.cypress.io/okta) to use [Okta](https://okta.com) and to explain the programmatic command used for Cypress tests.

### Prerequisites

- [Okta](https://okta.com) account
- [Application configured for use with a SPA](https://developer.okta.com/docs/guides/sign-into-spa/react/create-okta-application/)
- Environment variables from Okta placed in [.env](../.env)

### Setup

1. Replace **src/index.tsx** with **src/index.okta.tsx**
2. Start the application: `npm run dev:okta`
3. Run Cypress: `npm run cypress:open`

> **Note**: The only passing spec will be the [okta spec](../cypress/src/ui-auth-providers/okta.spec.ts); all others will fail.

---

## Amazon Cognito

A [guide has been written with detail around adapting the RWA](http://on.cypress.io/amazon-cognito) to use [Amazon Cognito](https://aws.amazon.com/cognito/) as the authentication solution and to explain the programmatic command used for Cypress tests.

### Prerequisites

- [Amazon Cognito](https://aws.amazon.com/cognito/) account
- Environment variables provided by the [AWS Amplify CLI](https://amplify.aws)

### User Pool Requirements

A user pool is required (identity pool is not used here):

- **Hosted UI Domain** configured with:
  - Callback URL: `http://localhost:3000/`
  - Sign-out URL: `http://localhost:3000/`
  - Implicit grant OAuth grant type
  - OpenID Connect scopes:
    - `aws.cognito.signin.user.admin`
    - `email`
    - `openid`

- **App Client** configured with:
  - Enabled auth flow `ALLOW_USER_PASSWORD_AUTH` (for programmatic login)
  - The `cy.origin()` flavor only requires `ALLOW_USER_SRP_AUTH`

- **User** corresponding to the `AWS_COGNITO` env vars with:
  - Confirmation Status: `Confirmed`
  - If status is `Force Reset Password`, log in once at `http://localhost:3000` while running `npm run dev:cognito` to reset

### Configuration Files

- `.env` file: `VITE_AUTH_TOKEN_NAME` and vars beginning with `AWS_COGNITO`
- `scripts/mock-aws-exports.js` and `scripts/mock-aws-exports-es5.js`: Must have the same data (can be edited manually or exported from amplify CLI)
- `cypress.config.ts`: `cognito_programmatic_login` controls test flavor

### Setup

1. Replace **src/index.tsx** with **src/index.cognito.tsx**
2. Start the application: `npm run dev:cognito` (may need to run `npm run dev` once first)
3. Run Cypress: `npm run cypress:open`

> **Note**: The only passing spec will be the [cognito spec](../cypress/src/ui-auth-providers/cognito.spec.ts); all others will fail.

---

## Google

A [guide has been written with detail around adapting the RWA](https://docs.cypress.io/guides/testing-strategies/google-authentication.html) to use [Google](https://google.com) as the authentication solution and to explain the programmatic command used for Cypress tests.

### Prerequisites

- [Google](https://google.com) account
- Environment variables from Google placed in [.env](../.env)

### Setup

1. Replace **src/index.tsx** with **src/index.google.tsx**
2. Start the application: `npm run dev:google`
3. Run Cypress: `npm run cypress:open`

> **Note**: The only passing spec when run with `npm run dev:google` will be the [google spec](../cypress/src/ui-auth-providers/google.spec.ts); all others will fail.
