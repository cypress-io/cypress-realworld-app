# Playwright Test Suite

## Quick Start
```bash
npm test                    # Run all tests
npm test -- tests/api/      # Run API tests only
npm test -- tests/ui/       # Run UI tests only
```

## Test Structure
- **API Tests**: Fast authentication and endpoint testing
- **UI Tests**: Full user journey testing with proper auth state

## Authentication
- **API Tests**: Use `loginByApi()` for fast API-only authentication
- **UI Tests**: Use fixtures (`loggedInAsUser`) for reliable frontend auth state

## Configuration
- Base URL: `http://localhost:3000`
- API URL: `http://localhost:3001`
- Test users available in `fixtures/auth.ts`
