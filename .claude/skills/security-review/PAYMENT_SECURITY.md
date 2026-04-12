# Payment Security Guide - Cypress RealWorld App

## Overview

This guide provides detailed security requirements for payment and transaction features in the Cypress RealWorld App.

---

## Transaction Security Principles

### 1. Server-Side Validation (Critical)

**Never trust client-side data for financial transactions.**

All transaction parameters must be validated on the backend:

```typescript
// ❌ BAD: Trusting client amount
app.post('/api/transactions', (req, res) => {
  const { amount, recipientId } = req.body;
  // Creating transaction without validation
  createTransaction(req.user.id, recipientId, amount);
});

// ✅ GOOD: Validating all inputs
app.post('/api/transactions', async (req, res) => {
  // Validate schema
  const schema = yup.object({
    amount: yup.number().positive().max(10000).required(),
    recipientId: yup.string().uuid().required()
  });

  const validated = await schema.validate(req.body);

  // Check balance
  const balance = await getBalance(req.user.id);
  if (balance < validated.amount) {
    return res.status(400).json({ error: 'Insufficient funds' });
  }

  // Verify user authorization
  if (!await userExists(validated.recipientId)) {
    return res.status(404).json({ error: 'Recipient not found' });
  }

  // Create transaction
  const transaction = await createTransaction(
    req.user.id,
    validated.recipientId,
    validated.amount
  );

  res.json(transaction);
});
```

### 2. Authorization (Critical)

**Users must only access their own financial data.**

```typescript
// ❌ BAD: No authorization check
app.get('/api/transactions/:id', async (req, res) => {
  const transaction = await getTransaction(req.params.id);
  res.json(transaction);
});

// ✅ GOOD: Verify ownership
app.get('/api/transactions/:id', async (req, res) => {
  const transaction = await getTransaction(req.params.id);

  // Check if user is sender or receiver
  if (
    transaction.senderId !== req.user.id &&
    transaction.receiverId !== req.user.id
  ) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  res.json(transaction);
});
```

### 3. Transaction Integrity

**Transactions must be atomic and immutable.**

```typescript
// Use database transactions for atomicity
async function createTransaction(senderId, receiverId, amount) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Deduct from sender
    await client.query(
      'UPDATE accounts SET balance = balance - $1 WHERE user_id = $2',
      [amount, senderId]
    );

    // Add to receiver
    await client.query(
      'UPDATE accounts SET balance = balance + $1 WHERE user_id = $2',
      [amount, receiverId]
    );

    // Record transaction
    const result = await client.query(
      `INSERT INTO transactions (id, sender_id, receiver_id, amount, status, created_at)
       VALUES ($1, $2, $3, $4, 'completed', NOW())
       RETURNING *`,
      [uuidv4(), senderId, receiverId, amount]
    );

    await client.query('COMMIT');
    return result.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
```

### 4. Idempotency

**Prevent duplicate transactions from retries or double-clicks.**

```typescript
// ✅ GOOD: Using idempotency key
app.post('/api/transactions', async (req, res) => {
  const idempotencyKey = req.headers['idempotency-key'];

  if (!idempotencyKey) {
    return res.status(400).json({
      error: 'Idempotency-Key header required'
    });
  }

  // Check if already processed
  const existing = await getTransactionByIdempotencyKey(idempotencyKey);
  if (existing) {
    return res.json(existing); // Return existing transaction
  }

  // Create new transaction with idempotency key
  const transaction = await createTransaction({
    ...req.body,
    idempotencyKey,
    userId: req.user.id
  });

  res.status(201).json(transaction);
});
```

---

## Input Validation Rules

### Amount Validation

```typescript
const amountSchema = yup.number()
  .positive('Amount must be positive')
  .max(10000, 'Amount exceeds maximum limit')
  .test('decimal-places', 'Amount can have max 2 decimal places', value => {
    if (value === undefined) return true;
    return /^\d+(\.\d{1,2})?$/.test(value.toString());
  })
  .required('Amount is required');
```

### Transaction Request Schema

```typescript
const transactionRequestSchema = yup.object({
  amount: yup.number()
    .positive()
    .max(10000)
    .required(),

  recipientId: yup.string()
    .uuid()
    .required(),

  description: yup.string()
    .max(255)
    .optional(),

  transactionType: yup.string()
    .oneOf(['payment', 'request'])
    .required()
});
```

---

## Rate Limiting

### Transaction Rate Limits

```typescript
import rateLimit from 'express-rate-limit';

// Limit transactions per user
const transactionLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // 10 transactions per minute
  keyGenerator: (req) => req.user.id, // Per user
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many transactions. Please try again later.'
    });
  }
});

app.post('/api/transactions', transactionLimiter, createTransactionHandler);
```

### Daily Transaction Limits

```typescript
async function checkDailyLimit(userId) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dailyTotal = await pool.query(
    `SELECT SUM(amount) as total
     FROM transactions
     WHERE sender_id = $1
     AND created_at >= $2
     AND status = 'completed'`,
    [userId, today]
  );

  const DAILY_LIMIT = 50000; // $50,000 per day

  if (dailyTotal.rows[0].total >= DAILY_LIMIT) {
    throw new Error('Daily transaction limit exceeded');
  }
}
```

---

## Audit Logging

### Transaction Event Logging

```typescript
interface TransactionLog {
  event: string;
  transactionId: string;
  userId: string;
  amount: number;
  timestamp: Date;
  status: string;
  ipAddress?: string;
  userAgent?: string;
}

async function logTransactionEvent(event: TransactionLog) {
  await logger.info('transaction_event', {
    ...event,
    // Never log sensitive data
    cardNumber: undefined,
    cvv: undefined,
    password: undefined
  });

  // Also store in database for audit trail
  await pool.query(
    `INSERT INTO transaction_audit_log
     (event, transaction_id, user_id, amount, status, ip_address, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
    [
      event.event,
      event.transactionId,
      event.userId,
      event.amount,
      event.status,
      event.ipAddress
    ]
  );
}

// Usage
await logTransactionEvent({
  event: 'transaction_created',
  transactionId: transaction.id,
  userId: req.user.id,
  amount: transaction.amount,
  status: 'completed',
  timestamp: new Date(),
  ipAddress: req.ip
});
```

---

## Data Protection

### Account Number Masking

```typescript
function maskAccountNumber(accountNumber: string): string {
  if (accountNumber.length <= 4) return accountNumber;
  const lastFour = accountNumber.slice(-4);
  return `****${lastFour}`;
}

// API response
res.json({
  id: transaction.id,
  amount: transaction.amount,
  senderAccount: maskAccountNumber(transaction.senderAccount),
  receiverAccount: maskAccountNumber(transaction.receiverAccount)
});
```

### Sensitive Data Encryption

```typescript
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; // 32 bytes
const IV_LENGTH = 16;

function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(
    'aes-256-cbc',
    Buffer.from(ENCRYPTION_KEY, 'hex'),
    iv
  );

  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text: string): string {
  const parts = text.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encrypted = Buffer.from(parts[1], 'hex');

  const decipher = crypto.createDecipheriv(
    'aes-256-cbc',
    Buffer.from(ENCRYPTION_KEY, 'hex'),
    iv
  );

  let decrypted = decipher.update(encrypted);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString();
}
```

---

## Security Testing

### Test Cases for Payment Security

```typescript
describe('Transaction Security', () => {
  it('should reject negative amounts', async () => {
    const response = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send({
        amount: -100,
        recipientId: recipient.id
      });

    expect(response.status).toBe(400);
  });

  it('should reject transactions exceeding balance', async () => {
    const response = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send({
        amount: 999999,
        recipientId: recipient.id
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toMatch(/insufficient funds/i);
  });

  it('should prevent accessing other users transactions', async () => {
    const response = await request(app)
      .get(`/api/transactions/${otherUserTransaction.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(403);
  });

  it('should prevent duplicate transactions with same idempotency key', async () => {
    const idempotencyKey = uuidv4();

    // First request
    const response1 = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${token}`)
      .set('Idempotency-Key', idempotencyKey)
      .send({
        amount: 100,
        recipientId: recipient.id
      });

    expect(response1.status).toBe(201);

    // Duplicate request
    const response2 = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${token}`)
      .set('Idempotency-Key', idempotencyKey)
      .send({
        amount: 100,
        recipientId: recipient.id
      });

    expect(response2.status).toBe(200);
    expect(response2.body.id).toBe(response1.body.id);
  });

  it('should enforce rate limits', async () => {
    const requests = Array(15).fill(null).map(() =>
      request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${token}`)
        .send({
          amount: 10,
          recipientId: recipient.id
        })
    );

    const responses = await Promise.all(requests);
    const rateLimited = responses.filter(r => r.status === 429);

    expect(rateLimited.length).toBeGreaterThan(0);
  });
});
```

---

## Common Vulnerabilities

### 1. Race Conditions

**Problem**: Multiple concurrent requests could result in negative balance.

**Solution**: Use database transactions with proper locking.

```typescript
// ✅ Use SELECT FOR UPDATE to lock row
await client.query(
  'SELECT balance FROM accounts WHERE user_id = $1 FOR UPDATE',
  [senderId]
);
```

### 2. Integer Overflow

**Problem**: Very large amounts could cause overflow.

**Solution**: Validate maximum amounts and use appropriate data types.

```typescript
// Use DECIMAL/NUMERIC in database, not INTEGER
// PostgreSQL: DECIMAL(19,2) allows up to 999,999,999,999,999.99
```

### 3. Floating Point Precision

**Problem**: JavaScript floating point math is imprecise.

**Solution**: Use decimal libraries or store amounts as cents (integers).

```typescript
import Decimal from 'decimal.js';

const amount = new Decimal(req.body.amount);
const fee = amount.times(0.025); // 2.5% fee
const total = amount.plus(fee);
```

### 4. Time-of-Check to Time-of-Use (TOCTOU)

**Problem**: Balance checked at one time, used at another.

**Solution**: Use database transactions.

```typescript
// ❌ BAD: Race condition window
const balance = await getBalance(userId);
if (balance >= amount) {
  await deductFromAccount(userId, amount); // Balance might have changed!
}

// ✅ GOOD: Atomic operation
await client.query(
  `UPDATE accounts
   SET balance = balance - $1
   WHERE user_id = $2 AND balance >= $1`,
  [amount, userId]
);
```

---

## Compliance Considerations

### PCI DSS (if handling card data)

If you ever handle credit card data directly:
- Never store CVV/CVV2
- Encrypt cardholder data at rest
- Use TLS 1.2+ for transmission
- Implement access controls
- Regular security testing required
- **Recommendation**: Use payment processor (Stripe, PayPal) instead

### Financial Regulations

- **Transaction Records**: Keep for minimum 7 years
- **Audit Logs**: Immutable and tamper-proof
- **User Consent**: Required for transactions
- **Dispute Resolution**: Process for handling disputes

---

## Monitoring & Alerts

### Suspicious Activity Patterns

Monitor for:
- Multiple failed transaction attempts
- Unusual transaction amounts
- High-frequency transactions
- Transactions from new locations/devices
- Rapid account balance changes

### Alert Thresholds

```typescript
const ALERT_THRESHOLDS = {
  singleTransaction: 5000, // Alert if > $5,000
  hourlyVolume: 10000,     // Alert if > $10,000/hour
  failureRate: 0.3,        // Alert if > 30% failures
  velocityCheck: 10        // Alert if > 10 transactions/minute
};
```

---

## Incident Response

### Transaction Reversal

```typescript
async function reverseTransaction(transactionId: string, reason: string) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Get original transaction
    const original = await getTransaction(transactionId);

    // Create reversal
    await client.query(
      `INSERT INTO transactions
       (id, sender_id, receiver_id, amount, type, status, related_transaction_id, created_at)
       VALUES ($1, $2, $3, $4, 'reversal', 'completed', $5, NOW())`,
      [uuidv4(), original.receiverId, original.senderId, original.amount, transactionId]
    );

    // Update balances
    await client.query(
      'UPDATE accounts SET balance = balance - $1 WHERE user_id = $2',
      [original.amount, original.receiverId]
    );

    await client.query(
      'UPDATE accounts SET balance = balance + $1 WHERE user_id = $2',
      [original.amount, original.senderId]
    );

    // Log reversal
    await logTransactionEvent({
      event: 'transaction_reversed',
      transactionId,
      userId: 'system',
      amount: original.amount,
      status: 'reversed',
      timestamp: new Date()
    });

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
```

---

## Checklist

Before deploying payment features:

- [ ] Server-side amount validation
- [ ] Balance verification
- [ ] User authorization on all endpoints
- [ ] Database transactions for atomicity
- [ ] Idempotency key support
- [ ] Rate limiting configured
- [ ] Audit logging implemented
- [ ] Data masking in responses
- [ ] Encryption for sensitive data
- [ ] Comprehensive security tests
- [ ] Monitoring and alerts configured
- [ ] Incident response procedures documented
- [ ] Compliance requirements met
- [ ] Code reviewed by security team

---

**Remember**: Payment security is critical. When in doubt, be more restrictive.
