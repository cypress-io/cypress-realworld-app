# Cypress Specs Traceability Demo

> A demonstration repository showcasing intelligent test selection using code coverage mapping to run only relevant Cypress specs based on source code changes in Pull Requests.

## 🎯 Purpose

This repository demonstrates how to:

1. **Generate Coverage Maps** - Automatically track which Cypress tests cover which source files
2. **Intelligent Test Selection** - Run only the specs that test the code changed in a PR
3. **Optimize CI/CD** - Reduce test execution time by running targeted regression tests
4. **Maintain Quality** - Ensure code changes are properly tested without running the entire suite

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/en/) (see [.node-version](./.node-version) for exact version)
- npm or yarn

### Installation

```bash
git clone <repository-url>
cd cypress-specs-traceability
npm install
```

### Run the Application

```bash
# Start the app with coverage enabled
npm run dev:coverage
```

The app runs on:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001

### Run Cypress Tests

```bash
# Open Cypress Test Runner
npm run cypress:open

# Run tests in headless mode with coverage mapping
npm run cypress:run -- --env coverage=true,mapCoverage=true
```

## 📊 Coverage Mapping

### How It Works

1. **During Test Execution**: 
   - Frontend coverage is collected from `window.__coverage__`
   - Backend coverage is collected from `/__coverage__` endpoint
   - Each test's coverage is mapped to source files

2. **Coverage Map Generation**:
   - Maps are stored in `cypress/results/reports/coverage-map/`
   - Structure: `{ "src/file.ts": { "spec.cy.ts": { "test name": statementCount } } }`

3. **PR Test Selection**:
   - Python script analyzes changed files in PR
   - Identifies specs with highest coverage for those files
   - Outputs only relevant specs to run

### Enable Coverage Mapping

Set environment variables:

```bash
# Enable frontend coverage mapping
MAP_COVERAGE=true

# Enable backend coverage mapping  
MAP_NODE_COVERAGE=true

# Enable verbose failure reports
VERBOSE_FAILURES=true
```

Or in [`cypress.config.ts`](./cypress.config.ts):

```typescript
env: {
  mapCoverage: true,
  mapNodeCoverage: true,
  verboseFailures: true,
}
```

## 🔧 Key Features

### 1. Custom Cypress Commands

- **[`cy.mapCoverage()`](./cypress/support/commands.ts)** - Maps test coverage to source files
- **[`cy.writeVerboseReport()`](./cypress/support/commands.ts)** - Generates detailed failure reports with DOM snapshots

### 2. Automated Test Hooks

- **beforeEach**: Cleans up reports and resets coverage counters
- **afterEach**: Collects coverage data and writes verbose reports for failures

### 3. Intelligent Spec Filter

[`.github/scripts/cypress-src-to-specs-filter.py`](./.github/scripts/cypress-src-to-specs-filter.py) analyzes PR changes and outputs:
- Filtered list of relevant specs
- Optimal parallel container configuration
- Regression vs full test run indicator

## 📁 Project Structure

```
cypress-specs-traceability/
├── .github/
│   └── scripts/
│       └── cypress-src-to-specs-filter.py  # PR-based spec filtering
├── backend/                                 # Express API with coverage endpoints
├── cypress/
│   ├── src/                                # Test specs
│   │   ├── api/                           # API tests
│   │   └── ui/                            # UI tests
│   ├── support/
│   │   ├── commands.ts                    # Custom commands
│   │   └── e2e.ts                         # Test hooks
│   └── results/
│       └── reports/
│           ├── coverage-map/              # Generated coverage maps
│           └── verbose/                   # Verbose failure reports
├── src/                                    # React frontend
└── docs/                                   # Additional documentation
```

## 📖 Documentation

- [Third-Party Authentication](./docs/authentication.md) - Auth0, Okta, Cognito, Google setup
- [Database & Seeding](./docs/database.md) - Database management and test data
- [NPM Scripts Reference](./docs/npm-scripts.md) - Complete list of available commands
- [Code Coverage Guide](./docs/code-coverage.md) - Detailed coverage setup and usage

## 🧪 Running Tests

### Local Development

```bash
# Run all tests with coverage
npm run cypress:run -- --env coverage=true,mapCoverage=true

# Run specific spec
npm run cypress:run -- --spec "cypress/src/ui/auth.spec.ts"

# Open Test Runner
npm run cypress:open
```

### CI/CD Integration

```yaml
# Example GitHub Actions workflow
- name: Filter Specs Based on PR Changes
  id: filter
  run: python .github/scripts/cypress-src-to-specs-filter.py
  env:
    PR_FILENAMES: ${{ steps.changed-files.outputs.all_changed_files }}
    MAP_FILE_PATH: cypress/results/reports/coverage-map/coverage-map.json

- name: Run Filtered Specs
  run: npm run cypress:run -- --spec "${{ steps.filter.outputs.spec-paths }}"
```

## 🔍 Coverage Map Example

```json
{
  "src/containers/App.tsx": {
    "cypress/src/ui/auth.spec.ts": {
      "logs in successfully": 45,
      "displays error on invalid credentials": 23
    }
  },
  "backend/user-routes.ts": {
    "cypress/src/api/api-users.spec.ts": {
      "GET /users returns all users": 67
    }
  }
}
```

## 🛠 Technology Stack

- **Frontend**: React, XState, Material-UI, TypeScript
- **Backend**: Express, lowdb, TypeScript
- **Testing**: Cypress, @cypress/code-coverage
- **CI/CD**: GitHub Actions, Python

## 📝 Environment Variables

```bash
# Coverage
MAP_COVERAGE=true                    # Enable frontend coverage mapping
MAP_NODE_COVERAGE=true               # Enable backend coverage mapping
VERBOSE_FAILURES=true                # Enable verbose failure reports

# Application
PORT=3000                            # Frontend port
VITE_BACKEND_PORT=3001              # Backend port
SEED_DEFAULT_USER_PASSWORD=s3cret   # Default user password
```

## 🤝 Contributing

This is a demonstration repository. Feel free to fork and adapt for your own projects.

## 📄 License

[![license](https://img.shields.io/badge/license-MIT-green.svg)](https://github.com/cypress-io/cypress/blob/master/LICENSE)

This project is licensed under the terms of the [MIT license](/LICENSE).

## 🔗 Related Resources

- [Cypress Documentation](https://docs.cypress.io)
- [Cypress Code Coverage Plugin](https://github.com/cypress-io/code-coverage)
- [Original Cypress Real World App](https://github.com/cypress-io/cypress-realworld-app)

---

**Built with** [Cypress](https://cypress.io) | Based on [Cypress Real World App](https://github.com/cypress-io/cypress-realworld-app)
