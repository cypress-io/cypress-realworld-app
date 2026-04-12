# Security Standards - Cypress RealWorld App

## Overview

This document defines the security standards and requirements for the Cypress RealWorld App. All code changes must adhere to these standards.

---

## Authentication & Authorization

### Password Security
- **Hashing Algorithm**: bcrypt or Argon2 only
  - Minimum 12 rounds for bcrypt
  - Use bcryptjs package (version 2.4.3+)
- **Password Requirements**:
  - Minimum 8 characters
  - Must contain: uppercase, lowercase, number
  - No common passwords (use a password strength library)
- **Storage**: Never store plain text passwords
- **Logging**: Never log passwords (plain or hashed)

### JWT Tokens
- **Expiration**: Maximum 1 hour for access tokens
- **Refresh Tokens**: Maximum 30 days, rotate on use
- **Signature**: Use RS256 or HS256 with strong secret (min 32 bytes)
- **Validation**: Always validate signature, expiration, issuer, audience
- **Storage**:
  - Access tokens: Memory or sessionStorage only (never localStorage)
  - Refresh tokens: httpOnly, Secure, SameSite=Strict cookies

### Session Management
- **Timeout**: 30 minutes of inactivity
- **Cookie Flags**:
  - httpOnly: true
  - secure: true (in production)
  - sameSite: "strict"
- **Session Fixation**: Regenerate session ID on login
- **Logout**: Destroy session completely, clear all tokens

### Authorization
- **Default Deny**: All endpoints require authentication by default
- **User Ownership**: Users can only access their own data
  - Always validate `req.user.id === resource.userId`
- **Transaction Access**: Users can only view/modify their own transactions
- **Role-Based Access**: If implementing roles, use middleware

---

## Input Validation

### General Rules
- **Server-Side Validation**: ALWAYS validate on server, even if validated on client
- **Whitelist Approach**: Define allowed values/patterns, reject everything else
- **Type Safety**: Use TypeScript types + runtime validation (Yup, Joi, etc.)
- **Length Limits**: Enforce maximum lengths for all string inputs
- **Format Validation**: Validate emails, URLs, dates, etc. with strict patterns

### Transaction Inputs
- **Amount**:
  - Must be positive number
  - Maximum: $10,000 per transaction (configurable)
  - Minimum: $0.01
  - Format: Two decimal places only
- **Description**:
  - Maximum 255 characters
  - Sanitize HTML/special characters
- **User IDs**: Must be valid UUID format

### API Endpoints
```typescript
// Example validation schema
const transactionSchema = yup.object({
  amount: yup
    .number()
    .positive()
    .max(10000)
    .required(),
  description: yup
    .string()
    .max(255)
    .required(),
  recipientId: yup
    .string()
    .uuid()
    .required()
});
```

---

## Secrets Management

### Environment Variables
- **Required**: All secrets in `.env` file
- **Never Commit**: `.env` must be in `.gitignore`
- **Template**: Provide `.env.example` with dummy values
- **Production**: Use secure secret management (AWS Secrets Manager, HashiCorp Vault, etc.)

### Required Secrets
```bash
# Database
DATABASE_URL=

# JWT
JWT_SECRET=  # Minimum 32 characters, random

# Session
SESSION_SECRET=  # Minimum 32 characters, random

# Auth Providers (if using)
AUTH0_DOMAIN=
AUTH0_CLIENT_ID=
AUTH0_CLIENT_SECRET=

OKTA_DOMAIN=
OKTA_CLIENT_ID=
OKTA_CLIENT_SECRET=

AWS_COGNITO_REGION=
AWS_COGNITO_USER_POOL_ID=
AWS_COGNITO_CLIENT_ID=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

### Secret Rotation
- **Frequency**: Every 90 days minimum
- **Compromise**: Immediately rotate if suspected compromise
- **Old Secrets**: Keep previous version active for 24 hours during rotation

### Frontend Secrets
- **Never Expose**: Backend secrets never sent to frontend
- **VITE_ Variables**: Only use for non-sensitive config
  - ❌ VITE_API_SECRET
  - ✅ VITE_API_URL
  - ✅ VITE_AUTH0_DOMAIN (public domain is OK)

---

## API Security

### Rate Limiting
- **Authentication Endpoints**: 5 requests per minute per IP
- **API Endpoints**: 100 requests per minute per user
- **Payment Endpoints**: 10 transactions per minute per user
- **Implementation**: Use `express-rate-limit`

### CORS Configuration
```typescript
// Production CORS config
const corsOptions = {
  origin: process.env.FRONTEND_URL, // Specific origin, not wildcard
  credentials: true,
  optionsSuccessStatus: 200
};
```

### Security Headers
Required headers (use `helmet` middleware):
- `Content-Security-Policy`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security: max-age=31536000`

### Error Handling
- **Production**: Generic error messages only
  - ❌ "Database connection failed at line 42"
  - ✅ "An error occurred. Please try again."
- **Development**: Detailed errors OK
- **Logging**: Log full errors server-side with context
- **Stack Traces**: Never expose to users

---

## Payment Security

### Transaction Validation
- **Amount**: Server-side validation mandatory
  - Positive values only
  - Reasonable maximum limits
  - Two decimal places
- **Balance Check**: Verify sufficient funds before transaction
- **Authorization**: User must own source account

### Transaction Integrity
- **Idempotency**: Use transaction IDs to prevent duplicates
- **Atomicity**: Use database transactions (BEGIN/COMMIT/ROLLBACK)
- **Immutability**: Transactions cannot be modified after creation
  - Only allow status changes (pending → completed → failed)
- **Audit Trail**: Log all transaction attempts

### Audit Logging
Required fields for every transaction:
- Transaction ID (UUID)
- Timestamp (ISO 8601)
- User ID
- Source account
- Destination account
- Amount
- Currency
- Status
- IP address (optional)

### Sensitive Data
- **Masking**: Display only last 4 digits of account numbers
- **Logging**: Never log full account numbers
- **Storage**: Encrypt sensitive fields at rest
- **Transmission**: Always use HTTPS

---

## Database Security

### Connection
- **Credentials**: Environment variables only
- **TLS**: Use encrypted connections in production
- **Connection Pooling**: Limit concurrent connections

### Queries
- **Parameterization**: ALWAYS use parameterized queries
  - ✅ `query('SELECT * FROM users WHERE id = $1', [userId])`
  - ❌ `query('SELECT * FROM users WHERE id = ' + userId)`
- **ORM**: If using ORM, never use raw queries with user input
- **Injection Prevention**: Validate and escape all inputs

### Access Control
- **Least Privilege**: Database user has minimal required permissions
- **Read-Only**: Use read-only connections for queries when possible
- **No Admin**: Application never uses database admin account

---

## Dependency Management

### Package Security
- **Audit**: Run `yarn audit` before every deployment
- **CI/CD**: Automated security checks in CI pipeline
- **Updates**: Review and update dependencies monthly
- **Vulnerability Response**:
  - Critical: Fix within 24 hours
  - High: Fix within 1 week
  - Medium: Fix within 1 month

### Lock Files
- **Required**: `yarn.lock` must be committed
- **Integrity**: Verify package integrity on install
- **Private Registry**: Consider using private npm registry

### Known Vulnerable Packages
Monitor and avoid:
- Old versions of `axios` (< 1.6.0)
- `lodash` with prototype pollution issues
- Unmaintained packages

---

## Logging & Monitoring

### What to Log
- ✅ Authentication attempts (success/failure)
- ✅ Authorization failures
- ✅ All transactions
- ✅ API errors
- ✅ Security events (rate limit hits, etc.)

### What NOT to Log
- ❌ Passwords (plain or hashed)
- ❌ Full credit card numbers
- ❌ JWT tokens
- ❌ Session IDs
- ❌ API secrets
- ❌ Full account numbers

### Log Format
```json
{
  "timestamp": "2024-01-17T10:30:00Z",
  "level": "info",
  "event": "transaction_created",
  "userId": "uuid",
  "transactionId": "uuid",
  "amount": 50.00,
  "status": "completed"
}
```

---

## Testing

### Security Test Requirements
- **Authentication**: Test expired tokens, invalid signatures
- **Authorization**: Test access to other users' data
- **Input Validation**: Test boundary cases, invalid inputs
- **SQL Injection**: Test with SQL injection payloads
- **XSS**: Test with XSS payloads

### Cypress Security Tests
- Include security test cases in E2E tests
- Test authentication flows
- Test authorization boundaries
- Test rate limiting

---

## Compliance

### Data Protection
- **GDPR Compliance** (if applicable):
  - User data export capability
  - Right to deletion
  - Consent management
  - Data minimization

### Data Retention
- **User Data**: Retain until account deletion + 30 days
- **Transaction Logs**: Minimum 7 years (financial regulation)
- **Audit Logs**: Minimum 1 year
- **Session Data**: Clear after logout or expiration

---

## Incident Response

### Security Incident Procedure
1. **Detect**: Monitor logs, alerts
2. **Contain**: Disable compromised accounts/features
3. **Investigate**: Determine scope and impact
4. **Remediate**: Fix vulnerability, rotate secrets
5. **Notify**: Inform affected users if required
6. **Review**: Post-mortem, update security measures

### Secret Compromise
If any secret is compromised:
1. Rotate secret immediately
2. Revoke all active sessions/tokens
3. Force password reset if user credentials involved
4. Review logs for unauthorized access
5. Notify security team

---

## Code Review Checklist

Before merging any PR, verify:
- [ ] No hardcoded secrets
- [ ] Input validation on all endpoints
- [ ] Authentication/authorization checks
- [ ] Parameterized database queries
- [ ] Error handling doesn't leak info
- [ ] Secrets in environment variables
- [ ] Tests include security scenarios
- [ ] `yarn audit` passes
- [ ] TypeScript types enforced

---

## Resources

- OWASP Top 10: https://owasp.org/www-project-top-ten/
- Node.js Security Best Practices: https://nodejs.org/en/docs/guides/security/
- Express Security: https://expressjs.com/en/advanced/best-practice-security.html
- JWT Best Practices: https://tools.ietf.org/html/rfc8725

---

**Last Updated**: 2024-01-17
**Review Frequency**: Quarterly
**Next Review**: 2024-04-17
