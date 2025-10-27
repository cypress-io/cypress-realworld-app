# Data Factory

Simple data generation utilities for Playwright tests 

## Usage

```typescript
import { DataFactory } from '../helpers/dataFactory';

// Generate completely random user data
const userData = DataFactory.createUser();
// Returns: { firstName: 'John', lastName: 'Doe', username: 'johndoe42', password: 's3cret' }

// Generate user with custom first and last name
const userData = DataFactory.createUser('John', 'Doe');
// Returns: { firstName: 'John', lastName: 'Doe', username: 'johndoe42', password: 's3cret' }

// Generate user with custom username only
const userData = DataFactory.createUser(undefined, undefined, 'CustomUser123');
// Returns: { firstName: 'Jane', lastName: 'Smith', username: 'CustomUser123', password: 's3cret' }

// Generate user with all custom data
const userData = DataFactory.createUser('Alice', 'Johnson', 'alice123', 'custompass');
// Returns: { firstName: 'Alice', lastName: 'Johnson', username: 'alice123', password: 'custompass' }

```


## Available Methods

- `createUser(firstName?, lastName?, username?, password?)` - Generate user with optional parameters
- `getRandomTestUser()` - Get random hardcoded test user

## Hardcoded Test Users

```typescript
import { testUsers, DataFactory } from '../helpers/dataFactory';

// Access specific users directly
const heathUser = testUsers.heath;
const dinaUser = testUsers.dina;

// Get random hardcoded user
const randomUser = DataFactory.getRandomTestUser();
```

