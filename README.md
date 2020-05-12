<p style='color: #3f51b5' align="center">
  <img style='color: #3f51b5' alt="Pay App Logo" src="./src/svgs/pay-app-logo.svg" />
</p>

A payment application to demonstrate **real-world** usage of [Cypress](https://cypress.io) testing methods, patterns, and workflows.

<p align="center">
  <img style='width: 70%' alt="Pay App Desktop" src="./public/img/pay-app-desktop.png" />
</p>

## Features

🛠 Built with [React][reactjs], [XState][xstate], [Express][express], [lowdb][lowdb], & [TypeScript][typescript]  
⚡️ Zero database dependencies  
🚀 Full-stack [Express][express]/[React][reactjs] application with real-world features and tests  
👮‍♂️ Local Authentication  
🔥 Database Seeding with End-to-end Tests  
💻 CI/CD + [Cypress Dashboard][cypressdashboard]

## Getting Started

The Cypress Real-World App (RWA) is a full-stack Express/React application backed by a local JSON database ([lowdb]).

The app is bundled with [example data](./data/database.json) (`data/database.json`) that contains everything you need to start using the app and run tests out-of-the-box.

> 🚩 **Note**
> You can login to the app with any of the [example app users](./data/database.json#L2). The default password for all users is `s3cret`.

### Installation

```shell
yarn install
```

### Run the app

```shell
yarn dev
```

### Start Cypress

```shell
yarn cypress:open
```

## Tests

| Type | Location                                 |
| ---- | ---------------------------------------- |
| api  | [cypress/tests/api](./cypress/tests/api) |
| ui   | [cypress/tests/ui](./cypress/tests/ui)   |
| unit | [`src/__tests__`](./src/__tests__)       |

## Database

- The local JSON database located in [data/database.json](./data/database.json) and is managed with [lowdb].

- The database is [reseeded](./data/dev-seed.json) each time the application is started (via `yarn dev`). Database seeding is done in between each [Cypress End-to-End test](./cypress/tests).

- Updates via the React frontend are sent to the [Express][express] server and handled by a set of [database utilities](backend/database.ts)

- Generate a new database using `yarn db:seed`.

- An [empty database seed](./data/empty-seed.json) is provided along with a script (`yarn start:empty`) to view the application without data.

> 🚩 **Note**
> You can login to the app with any of the [example app users](./data/database.json#L2). The default password for all users is `s3cret`.

## Additional NPM Scripts

| Script         | Description                                                         |
| -------------- | ------------------------------------------------------------------- |
| dev            | Starts backend in wath mode and frontend                            |
| start          | Starts backend and frontend                                         |
| types          | Validates types                                                     |
| db:seed        | Generates fresh database seeds for json files in /data              |
| start:empty    | Starts backend, frontend and Cypress with empty database seed       |
| tsnode         | Customized ts-node command to get around react-scripts restrictions |
| list:dev:users | Provides id and username for users in the dev database              |

For a complete list of scripts see [package.json](./package.json)

## Code Coverage Report

The Cypress Real-World App uses the [@cypress/code-coverage]() plugin to generate code coverage reports for the app frontend and backend.

To generate a code coverage report:

1. Run `yarn cypress:run --env coverage=true` and wait for the test run to complete.
2. Once the test run is complete, you can view the report at `coverage/lcov-report/index.html`.

<br />
<br />
<br />
<br />
<p style='color: "#3f51b5"' align="center">
  <img width="100" style='color: "#3f51b5"' alt="Cypress Logo" src="./src/svgs/cypress-logo.svg" />
</p>

[reactjs]: https://reactjs.org
[xstate]: https://xstate.js.org
[express]: https://expressjs.com
[lowdb]: https://github.com/typicode/lowdb
[typescript]: https://typescriptlang.org
[cypressdashboard]: https://dashboard.cypress.io/projects/7s5okt
