# NPM Scripts Reference

Complete list of available npm scripts and their purposes.

## Development Scripts

### `npm run dev`
Starts backend in watch mode and frontend for development.

```bash
npm run dev
```

- Frontend: http://localhost:3000
- Backend: http://localhost:3001

### `npm run dev:coverage`
Starts backend and frontend with instrumented code coverage enabled.

```bash
npm run dev:coverage
```

Use this when you want to collect code coverage data during manual testing or Cypress runs.

### `npm run dev:auth0`
Starts the application using Auth0 for authentication.

```bash
npm run dev:auth0
```

> **Prerequisites**: Auth0 configuration in `.env` file
> **Guide**: [Auth0 Setup](http://on.cypress.io/auth0)

### `npm run dev:okta`
Starts the application using Okta for authentication.

```bash
npm run dev:okta
```

> **Prerequisites**: Okta configuration in `.env` file
> **Guide**: [Okta Setup](http://on.cypress.io/okta)

### `npm run dev:cognito`
Starts the application using Amazon Cognito for authentication.

```bash
npm run dev:cognito
```

> **Prerequisites**: AWS Cognito configuration
> **Guide**: [Cognito Setup](http://on.cypress.io/amazon-cognito)

### `npm run dev:google`
Starts the application using Google for authentication.

```bash
npm run dev:google
```

> **Prerequisites**: Google OAuth configuration in `.env` file
> **Guide**: [Google Auth Setup](https://docs.cypress.io/guides/testing-strategies/google-authentication.html)

## Production Scripts

### `npm start`
Starts backend and frontend in production mode (no watch mode).

```bash
npm start
```

### `npm run start:empty`
Starts backend, frontend, and Cypress with an empty database seed.

```bash
npm run start:empty
```

Useful for viewing the application UI without any data.

## Testing Scripts

### `npm run cypress:open`
Opens the Cypress Test Runner in interactive mode.

```bash
npm run cypress:open
```

### `npm run cypress:run`
Runs Cypress tests in headless mode.

```bash
npm run cypress:run
```

**With options**:
```bash
# Run with coverage
npm run cypress:run -- --env coverage=true

# Run specific spec
npm run cypress:run -- --spec "cypress/src/ui/auth.spec.ts"

# Run with coverage mapping
npm run cypress:run -- --env coverage=true,mapCoverage=true,mapNodeCoverage=true
```

### `npm test`
Runs unit tests using Jest.

```bash
npm test
```

## Database Scripts

### `npm run db:seed`
Generates fresh database seeds for JSON files in `/data`.

```bash
npm run db:seed
```

Creates new seed data with randomized but realistic test data.

### `npm run list:dev:users`
Lists all users in the development database with their IDs and usernames.

```bash
npm run list:dev:users
```

Output example:
```
Users in database:
- ID: 1, Username: Katharina_Bernier
- ID: 2, Username: Arely_Kertzmann
...
```

## Build & Type Checking

### `npm run types`
Validates TypeScript types across the project.

```bash
npm run types
```

Checks both frontend and backend TypeScript code for type errors.

### `npm run build`
Builds the frontend application for production.

```bash
npm run build
```

Output is placed in the `build/` directory.

## Utility Scripts

### `npm run tsnode`
Customized ts-node command to work around react-scripts restrictions.

```bash
npm run tsnode <file.ts>
```

Used internally by other scripts that need to run TypeScript files directly.

## Coverage Scripts

### Generate Coverage Report

```bash
# 1. Start app with coverage
npm run dev:coverage

# 2. Run tests with coverage
npm run cypress:run -- --env coverage=true

# 3. View report at coverage/index.html
```

### Generate Coverage Map

```bash
# Run tests with coverage mapping enabled
MAP_COVERAGE=true MAP_NODE_COVERAGE=true npm run cypress:run -- --env coverage=true
```

Coverage maps are saved to:
- Frontend: `cypress/results/reports/coverage-map/coverage-map.json`
- Backend: `cypress/results/reports/coverage-map/node-coverage-map.json`

## CI/CD Scripts

These scripts are typically used in CI/CD pipelines:

### Filter Specs Based on PR Changes

```bash
python .github/scripts/cypress-src-to-specs-filter.py
```

**Environment Variables Required**:
- `GITHUB_OUTPUT`: Path to GitHub Actions output file
- `PR_FILENAMES`: Comma-separated list of changed files
- `MAP_FILE_PATH`: Path to coverage map JSON
- `SPECS_PER_CONTAINER`: (Optional) Number of specs per container

## Script Combinations

### Full Coverage Workflow

```bash
# 1. Start with coverage
npm run dev:coverage

# 2. Run tests with coverage and mapping
npm run cypress:run -- --env coverage=true,mapCoverage=true,mapNodeCoverage=true

# 3. View coverage report
open coverage/index.html

# 4. Check coverage map
cat cypress/results/reports/coverage-map/coverage-map.json
```

### Quick Test Run

```bash
# Start app in one terminal
npm run dev

# Run tests in another terminal
npm run cypress:run
```

### Debug Specific Test

```bash
# Start app
npm run dev

# Open Cypress Test Runner
npm run cypress:open

# Select and run specific test in the UI
```

## Environment Variables

Many scripts respect environment variables:

```bash
# Set coverage flags
MAP_COVERAGE=true MAP_NODE_COVERAGE=true npm run cypress:run

# Set verbose failures
VERBOSE_FAILURES=true npm run cypress:run

# Change ports
PORT=4000 VITE_BACKEND_PORT=4001 npm run dev
```

## Troubleshooting

### Port Already in Use

If ports 3000 or 3001 are already in use:

```bash
# Find and kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different ports
PORT=4000 VITE_BACKEND_PORT=4001 npm run dev
```

### Tests Failing After Code Changes

```bash
# Regenerate coverage map
MAP_COVERAGE=true MAP_NODE_COVERAGE=true npm run cypress:run -- --env coverage=true

# Commit updated coverage map
git add cypress/results/reports/coverage-map/
git commit -m "Update coverage map"
```

### Database Issues

```bash
# Reset database
npm run db:seed

# Start with empty database
npm run start:empty
```
