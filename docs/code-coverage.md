# Code Coverage Guide

This guide explains how to generate, collect, and use code coverage data for intelligent test selection.

## Overview

The application uses [@cypress/code-coverage](https://github.com/cypress-io/code-coverage) plugin to:
1. Instrument frontend and backend code
2. Collect coverage during test execution
3. Generate coverage reports
4. Map coverage to create test-to-source relationships

## Generating Coverage Reports

### 1. Start the Application with Coverage

```bash
npm run dev:coverage
```

This starts both frontend and backend with instrumented code.

### 2. Run Tests with Coverage Enabled

```bash
npm run cypress:run -- --env coverage=true
```

### 3. View the Report

Once the test run completes, open:
```
coverage/index.html
```

## Coverage Mapping

Coverage mapping creates a relationship between source files and the tests that cover them.

### Enable Coverage Mapping

Set environment variables:

```bash
# Frontend coverage mapping
MAP_COVERAGE=true

# Backend coverage mapping
MAP_NODE_COVERAGE=true
```

Or in `cypress.config.ts`:

```typescript
env: {
  mapCoverage: true,
  mapNodeCoverage: true,
  coverageMapPath: 'cypress/results/reports/coverage-map/coverage-map.json',
  nodeCoverageMapPath: 'cypress/results/reports/coverage-map/node-coverage-map.json',
}
```

### How Coverage Mapping Works

#### During Test Execution

**Frontend Coverage** ([`cypress/support/e2e.ts`](../cypress/support/e2e.ts)):
```typescript
afterEach(function () {
  if (Cypress.env('mapCoverage')) {
    cy.window().then((win) => {
      const coverageObject = win.__coverage__;
      if (coverageObject) {
        cy.mapCoverage(specFile, testTitle, coverageObject, true);
      }
    });
  }
});
```

**Backend Coverage** ([`cypress/support/e2e.ts`](../cypress/support/e2e.ts)):
```typescript
afterEach(function () {
  if (Cypress.env('mapNodeCoverage')) {
    const apiUrl = Cypress.env('apiUrl').replace('/api', '/__coverage__');
    cy.request({ url: apiUrl }).then(response => {
      if (response.status === 200) {
        cy.mapCoverage(specFile, testTitle, response.body, false);
      }
    });
  }
});
```

#### Coverage Map Structure

```json
{
  "src/containers/App.tsx": {
    "cypress/src/ui/auth.spec.ts": {
      "logs in successfully": 45,
      "displays error on invalid credentials": 23
    },
    "cypress/src/ui/user-settings.spec.ts": {
      "updates user profile": 12
    }
  },
  "backend/user-routes.ts": {
    "cypress/src/api/api-users.spec.ts": {
      "GET /users returns all users": 67,
      "POST /users creates a new user": 42
    }
  }
}
```

**Structure Explanation**:
- **Top level**: Source file paths
- **Second level**: Spec file paths that cover the source
- **Third level**: Individual test names
- **Values**: Number of statements covered by that test

### Coverage Reset Between Tests

The `beforeEach` hook resets backend coverage counters to ensure per-test coverage:

```typescript
beforeEach(() => {
  if (Cypress.env('mapNodeCoverage')) {
    const coverageUrl = Cypress.env('apiUrl').replace('/api', '/__coverage__');
    cy.request({ method: 'DELETE', url: coverageUrl });
  }
});
```

## Backend Coverage Endpoints

The backend provides two coverage endpoints ([`backend/app.ts`](../backend/app.ts)):

### GET `/__coverage__`

Returns current coverage data:

```typescript
app.get("/__coverage__", (req, res) => {
  res.json(global.__coverage__);
});
```

### DELETE `/__coverage__`

Resets coverage counters:

```typescript
app.delete("/__coverage__", (req, res) => {
  // Reset all statement/function/branch counts to 0
  res.json({ reset: true });
});
```

## Using Coverage Maps for Test Selection

The coverage map enables intelligent test selection in CI/CD:

### 1. Generate Coverage Map

Run tests locally with coverage mapping enabled:

```bash
MAP_COVERAGE=true MAP_NODE_COVERAGE=true npm run cypress:run -- --env coverage=true
```

### 2. Commit Coverage Map

```bash
git add cypress/results/reports/coverage-map/
git commit -m "Update coverage map"
```

### 3. Use in CI/CD

The [`.github/scripts/cypress-src-to-specs-filter.py`](../.github/scripts/cypress-src-to-specs-filter.py) script uses the coverage map to determine which specs to run based on PR changes.

Example GitHub Actions workflow:

```yaml
- name: Get Changed Files
  id: changed-files
  uses: tj-actions/changed-files@v40

- name: Filter Specs
  id: filter
  run: python .github/scripts/cypress-src-to-specs-filter.py
  env:
    PR_FILENAMES: ${{ steps.changed-files.outputs.all_changed_files }}
    MAP_FILE_PATH: cypress/results/reports/coverage-map/coverage-map.json
    SPECS_PER_CONTAINER: 3

- name: Run Filtered Specs
  run: npm run cypress:run -- --spec "${{ steps.filter.outputs.spec-paths }}"
```

## Custom Commands

### `cy.mapCoverage()`

Maps coverage data to the coverage map file.

**Signature**:
```typescript
cy.mapCoverage(
  specFile: string,
  testTitle: string,
  coverageObject: any,
  isFrontendCoverage: boolean = true
)
```

**Parameters**:
- `specFile`: Relative path to the spec file
- `testTitle`: Name of the test
- `coverageObject`: Coverage data from `window.__coverage__` or `/__coverage__`
- `isFrontendCoverage`: `true` for frontend, `false` for backend

**Implementation**: [`cypress/support/commands.ts`](../cypress/support/commands.ts)

## Troubleshooting

### Coverage Not Collected

**Issue**: No coverage data in `window.__coverage__` or `/__coverage__`

**Solutions**:
1. Ensure you started the app with `npm run dev:coverage`
2. Check that `coverage=true` is set in Cypress env
3. Verify instrumentation is working (check browser console for `__coverage__` object)

### Coverage Map Not Generated

**Issue**: Coverage map file is empty or not created

**Solutions**:
1. Verify `mapCoverage` and/or `mapNodeCoverage` are set to `true`
2. Check that tests are actually running and passing
3. Ensure the output directory exists: `cypress/results/reports/coverage-map/`

### Backend Coverage Endpoint Not Found

**Issue**: `/__coverage__` returns 404

**Solutions**:
1. Verify `@cypress/code-coverage/middleware/express` is loaded in [`backend/app.ts`](../backend/app.ts)
2. Check that `global.__coverage__` exists (requires instrumented code)
3. Ensure you're using `npm run dev:coverage` not `npm run dev`

## Best Practices

1. **Regenerate Coverage Maps Regularly**: Run full test suite with coverage mapping after significant code changes
2. **Commit Coverage Maps**: Keep coverage maps in version control for CI/CD usage
3. **Monitor Coverage Trends**: Track which files have good test coverage
4. **Use for Regression Testing**: Let coverage maps guide which tests to run on PRs
5. **Clean Up Old Data**: Periodically regenerate coverage maps to remove stale entries
