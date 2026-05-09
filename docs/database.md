# Database & Test Data

The application uses a local JSON database managed with [lowdb](https://github.com/typicode/lowdb).

## Database Location

- **Main Database**: [`data/database.json`](../data/database.json)
- **Seed Data**: [`data/database-seed.json`](../data/database-seed.json)
- **Empty Seed**: [`data/empty-seed.json`](../data/empty-seed.json)

## Database Management

### Automatic Reseeding

The database is automatically reseeded:
- Each time the application starts (via `npm run dev`)
- Between each Cypress End-to-End test

This ensures a consistent state for testing.

### Manual Database Operations

#### Generate Fresh Database Seeds

```bash
npm run db:seed
```

This generates new seed data for all JSON files in the `/data` directory.

#### Start with Empty Database

```bash
npm run start:empty
```

Starts the application with an empty database to view the UI without data.

## Test Users

The database is bundled with [example data](../data/database.json) that contains everything you need to start using the app and run tests out-of-the-box.

### Default Credentials

- **Password for all users**: `s3cret`

### List Available Users

```bash
npm run list:dev:users
```

This provides the ID and username for all users in the dev database.

## Database Utilities

Updates via the React frontend are sent to the Express server and handled by a set of [database utilities](../backend/database.ts).

### Key Functions

- **Create**: Add new records
- **Read**: Query existing records
- **Update**: Modify existing records
- **Delete**: Remove records

## Using Database in Tests

### Cypress Database Command

The application provides a custom Cypress command for direct database access:

```typescript
cy.database(operation: "find" | "filter", entity: string, query?: object)
```

#### Examples

**Find a single user**:
```typescript
cy.database("find", "users", { username: "Katharina_Bernier" })
  .then((user) => {
    cy.log(user.id);
  });
```

**Filter transactions**:
```typescript
cy.database("filter", "transactions", { status: "complete" })
  .then((transactions) => {
    expect(transactions).to.have.length.greaterThan(0);
  });
```

### Available Entities

- `users`
- `contacts`
- `bankaccounts`
- `transactions`
- `likes`
- `comments`
- `notifications`
- `banktransfers`

## Database Schema

The database follows a relational structure with the following entities:

### Users
```typescript
{
  id: string;
  uuid: string;
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  email: string;
  phoneNumber: string;
  avatar: string;
  defaultPrivacyLevel: string;
  balance: number;
  createdAt: Date;
  modifiedAt: Date;
}
```

### Transactions
```typescript
{
  id: string;
  uuid: string;
  source: string;
  amount: number;
  description: string;
  privacyLevel: string;
  receiverId: string;
  senderId: string;
  balanceAtCompletion: number;
  status: string;
  requestStatus: string;
  requestResolvedAt: Date;
  createdAt: Date;
  modifiedAt: Date;
}
```

### Bank Accounts
```typescript
{
  id: string;
  uuid: string;
  userId: string;
  bankName: string;
  accountNumber: string;
  routingNumber: string;
  isDeleted: boolean;
  createdAt: Date;
  modifiedAt: Date;
}
```

## Test Data Routes

In test and development environments, the application exposes test data routes:

```typescript
app.use("/testData", testDataRoutes);
```

### Available Endpoints

- `GET /testData/users` - Get all users
- `GET /testData/contacts` - Get all contacts
- `GET /testData/transactions` - Get all transactions
- `POST /testData/seed` - Reseed the database

### Usage in Tests

```typescript
// Seed database
cy.task("db:seed");

// Query database
cy.request("GET", `${Cypress.env("apiUrl")}/testData/users`)
  .then((response) => {
    expect(response.status).to.eq(200);
    expect(response.body.results).to.be.an("array");
  });
```

## Database Seeding Strategy

### During Development

The database is seeded with realistic test data including:
- Multiple users with different roles
- Existing transactions between users
- Bank accounts for each user
- Contacts and relationships
- Likes and comments on transactions

### During Testing

Each test starts with a fresh database state to ensure:
- Test isolation
- Predictable data
- No side effects between tests
- Consistent test results

## Best Practices

1. **Don't Commit Database Changes**: The `data/database.json` file should not be committed with test-specific changes
2. **Use Seed Data**: Modify `data/database-seed.json` for permanent changes
3. **Reset Between Tests**: Let Cypress handle database reseeding automatically
4. **Use Database Commands**: Prefer `cy.database()` over direct API calls for test data queries
5. **Avoid Hardcoded IDs**: Query for data dynamically rather than using hardcoded IDs
