<p style='color: #3f51b5' align="center">
  <img style='color: #3f51b5' alt="Pay App Logo" src="./src/svgs/pay-app-logo.svg" />
</p>

A payment application to demonstrate **real-world** usage of [Cypress](https://cypress.io) testing methods, patterns, and workflows.

<p align="center">
  <img style='width: 70%' alt="Pay App Desktop" src="./public/img/pay-app-desktop.png" />
</p>

## Features

🛠 Built with React, XState, Express, Lowdb, & TypeScript  
⚡️ Zero database dependencies  
🚀 Full-stack Express/React application with real-world features and tests  
👮‍♂️ Local Authentication  
🔥 Database Seeding with End-to-end Tests  
💻 CI/CD + [Cypress Dashboard](https://cypress.io/dashboard)

## Getting Started

### Installation

```shell
yarn install
```

### Running the App

```shell
yarn dev
```

### Database

The database is located in [data/database.json](./data/database.json) and is [reseeded](./data/dev-seed.json) each time the application is started.

It provides several existing users with the password of `s3cret`.

### Additional NPM Scripts

| Script         | Description                                                          |
| -------------- | -------------------------------------------------------------------- |
| start          | Starts backend and frontend                                          |
| types          | Validates types                                                      |
| db:seed        | Generates fresh database seeds for json files in /data               |
| dev:mobile     | Starts backend, frontend and Cypress with mobile-cypress.json config |
| start:empty    | Starts backend, frontend and Cypress with empty database seed        |
| start:test     | Starts backend, frontend and Cypress with test database seed         |
| tsnode         | Customized ts-node command to get around react-scripts restrictions  |
| list:dev:users | Provides id and username for users in the dev database               |

<br />
<br />
<br />
<br />
<p style='color: "#3f51b5"' align="center">
  <img width="100" style='color: "#3f51b5"' alt="Cypress Logo" src="./src/svgs/cypress-logo.svg" />
</p>
