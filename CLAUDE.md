# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
- `yarn dev` - Start development environment (React frontend + Express backend with file watching)
- `yarn start` - Start production-like environment (React frontend + Express backend without watching)
- `yarn build` - Build the application for production
- `yarn lint` - Run ESLint and Prettier checks
- `yarn types` - Run TypeScript type checking (use this before committing)
- `yarn prettier` - Format all files with Prettier

### Testing Commands
- `yarn test` - Open Cypress test runner (alias for `cypress:open`)
- `yarn cypress:open` - Open Cypress GUI for interactive testing
- `yarn cypress:run` - Run all Cypress tests headlessly
- `yarn test:api` - Run API tests only
- `yarn test:unit` - Run unit tests with Vitest
- `yarn test:unit:ci` - Run unit tests in CI mode
- `yarn test:component:ci` - Run component tests

### Database Operations
- `yarn db:seed` - Generate fresh database seeds
- `yarn db:seed:dev` - Copy seed data to development database
- `yarn start:empty` - Start app with empty database

### Authentication Variants
The app supports multiple authentication providers, each with specific startup commands:
- `yarn dev:auth0` - Development with Auth0
- `yarn dev:okta` - Development with Okta
- `yarn dev:cognito` - Development with AWS Cognito
- `yarn dev:google` - Development with Google Auth

## Architecture Overview

### Technology Stack
- **Frontend**: React 18 + TypeScript + Vite + Material-UI
- **State Management**: XState state machines
- **Backend**: Express.js + TypeScript
- **Database**: JSON file-based with lowdb
- **Testing**: Cypress (E2E + Component) + Vitest (Unit)
- **Build Tools**: Vite with Istanbul code coverage

### Project Structure

#### Frontend (`src/`)
- `components/` - React UI components
- `containers/` - Higher-order container components 
- `machines/` - XState state machines for application logic
- `models/` - TypeScript interfaces and types
- `utils/` - Utility functions and helpers
- `__tests__/` - Unit tests

#### Backend (`backend/`)
- `app.ts` - Express server setup and middleware
- `database.ts` - Database utilities and operations (lowdb)
- `*-routes.ts` - API route handlers for different entities
- `graphql/` - GraphQL schema and resolvers
- `auth.ts` - Authentication middleware

#### Testing (`cypress/`)
- `tests/api/` - API integration tests
- `tests/ui/` - End-to-end UI tests
- `tests/ui-auth-providers/` - Authentication provider specific tests
- `support/` - Cypress configuration and custom commands

### Key Architectural Patterns

#### State Management with XState
The application uses XState for managing complex application state through state machines located in `src/machines/`:
- `authMachine.ts` - Authentication flow
- `transactionsMachine.ts` - Transaction management
- `notificationsMachine.ts` - Notifications
- Each machine handles its own loading states, error handling, and side effects

#### Database Layer
- Uses lowdb with JSON file storage in `data/database.json`
- Database utilities in `backend/database.ts` provide CRUD operations
- Database is reseeded on each application start for consistent testing
- Supports both full seed data and empty database states

#### Authentication Architecture
- Local authentication by default (user/pass stored in JSON)
- Pluggable authentication providers (Auth0, Okta, Cognito, Google)
- Each provider has its own index file (`index.auth0.tsx`, etc.)
- JWT token validation handled in `backend/helpers.ts`

#### API Design
- RESTful APIs for all entities (users, transactions, bank accounts, etc.)
- GraphQL endpoint available at `/graphql`
- API routes follow pattern: `backend/*-routes.ts`
- Request validation using express-validator

## Development Workflow

### Environment Setup
1. Copy `.env` for environment variables
2. Default ports: 3000 (frontend), 3001 (backend)
3. Database seeds automatically on `yarn dev`
4. All demo users have password: `s3cret`

### Code Quality
- TypeScript strict mode enabled
- ESLint with TypeScript rules
- Prettier for code formatting
- Husky pre-push hooks run `yarn types`
- Always run `yarn types` before committing

### Testing Strategy
- **Unit Tests**: Vitest for utility functions and business logic
- **Component Tests**: Cypress component testing for React components
- **E2E Tests**: Cypress for full user flows
- **API Tests**: Cypress for backend API testing
- Code coverage with Istanbul/NYC

### Important File Locations
- Main app configuration: `vite.config.ts`, `cypress.config.ts`
- TypeScript config: `tsconfig.json` 
- Database seed: `data/database-seed.json`
- Environment variables: `.env`
- Package management: `yarn.lock` (Yarn Classic v1)

### Authentication Testing
- Each auth provider has its own test spec in `cypress/tests/ui-auth-providers/`
- When testing with auth providers, only that provider's spec will pass
- Requires environment variables to be configured for each provider