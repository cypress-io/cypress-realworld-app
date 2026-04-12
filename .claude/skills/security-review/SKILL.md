---
name: security-review
description: Comprehensive security review of code changes. Checks for vulnerabilities, hardcoded secrets, insecure patterns, and dependency issues. Automatically runs security scans and analyzes authentication, authorization, and data protection. Use when reviewing security-sensitive changes, PRs, or for compliance audits.
allowed-tools: Read, Grep, Glob, Bash(npm:*), Bash(yarn:*), Bash(git:*), Bash(grep:*), Bash(find:*)
model: sonnet
---

# Security Code Review - Cypress RealWorld App

## Overview

Perform comprehensive security analysis on code changes, dependencies, and configurations for this payment and authentication application.

**This app contains:**
- Payment transactions (sensitive financial data)
- Multi-provider authentication (Auth0, Okta, AWS Cognito, Google)
- User data and social features
- JWT token handling
- Express backend API
- React frontend
- GraphQL API

---

## Automated Security Scans

Run these first to get baseline security status:

### 1. Dependency Vulnerability Scan
```bash
# Check for known vulnerabilities
yarn audit --level moderate

# Get summary
yarn audit --summary
```

### 2. Hardcoded Secrets Detection
```bash
# Search for potential secrets in code
grep -r -i "password.*=.*['\"]" --include="*.ts" --include="*.tsx" --include="*.js" --exclude-dir=node_modules .
grep -r -i "api[_-]?key.*=.*['\"]" --include="*.ts" --include="*.tsx" --include="*.js" --exclude-dir=node_modules .
grep -r -i "secret.*=.*['\"]" --include="*.ts" --include="*.tsx" --include="*.js" --exclude-dir=node_modules .
grep -r -i "token.*=.*['\"]" --include="*.ts" --include="*.tsx" --include="*.js" --exclude-dir=node_modules .
```

### 3. TypeScript Security
```bash
# Check for any type-related security issues
yarn types
```

### 4. Linting for Security Issues
```bash
# Run ESLint (includes security plugins)
yarn lint
```

---

## Manual Security Checklist

### 🔐 Authentication & Authorization

#### JWT Security
- [ ] **Token Validation**: Verify JWT tokens are properly validated on backend
  - Check: `backend/` for JWT verification logic
  - Must validate signature, expiration, issuer
- [ ] **Token Storage**: Ensure tokens stored securely (httpOnly, Secure, SameSite)
  - Check: Cookie settings in Express session config
- [ ] **Token Expiration**: Short-lived access tokens (< 1 hour)
  - Check: JWT expiration settings in auth providers
- [ ] **Refresh Token Security**: Refresh tokens properly rotated and secured

#### Password Security
- [ ] **Password Hashing**: Using bcrypt with sufficient rounds (≥12)
  - Check: `backend/` for password hashing (should use bcryptjs)
- [ ] **Password Validation**: Strong password requirements enforced
  - Check: Validation in user registration/password reset
- [ ] **No Plain Text Passwords**: Never log or store plain passwords
  - Search: Ensure no `console.log(password)` or similar

#### Session Management
- [ ] **Session Timeout**: Sessions expire after inactivity
  - Check: `express-session` configuration
- [ ] **Secure Cookies**: httpOnly, Secure, SameSite=Strict flags set
  - Check: Cookie configuration in backend
- [ ] **Session Fixation**: New session created after login
  - Check: Session regeneration on authentication

#### Authorization
- [ ] **Access Control**: Users can only access their own data
  - Check: All API endpoints validate user ownership
- [ ] **Transaction Authorization**: Users can only modify their own transactions
  - Check: Transaction endpoints verify user ID
- [ ] **RBAC Implementation**: Role-based checks if applicable
  - Check: Middleware for role verification

---

### 💉 Injection Vulnerabilities

#### SQL Injection
- [ ] **Parameterized Queries**: All database queries use parameterization
  - Check: Database query files for string concatenation
- [ ] **ORM Usage**: Using ORM safely (TypeORM, Prisma, etc.)
  - Check: No raw SQL with user input
- [ ] **Input Validation**: User inputs validated before database operations

#### XSS (Cross-Site Scripting)
- [ ] **Output Encoding**: React automatically encodes, but check for `dangerouslySetInnerHTML`
  - Search: `dangerouslySetInnerHTML` usage
- [ ] **User-Generated Content**: Comments, descriptions properly sanitized
  - Check: Transaction descriptions, user profiles
- [ ] **CSP Headers**: Content-Security-Policy headers configured
  - Check: Express middleware for security headers

#### Command Injection
- [ ] **No Shell Commands with User Input**: Avoid `exec()`, `spawn()` with user data
  - Search: `child_process.exec`, `child_process.spawn`
- [ ] **File Path Validation**: User-provided paths validated
  - Check: Any file upload/download functionality

#### GraphQL Injection
- [ ] **Query Complexity Limits**: Prevent DoS via complex queries
  - Check: GraphQL server configuration
- [ ] **Input Validation**: GraphQL inputs validated
  - Check: Resolver input validation
- [ ] **Query Depth Limiting**: Maximum query depth enforced

---

### 💰 Payment Security (High Priority)

#### Transaction Security
- [ ] **Amount Validation**: Transaction amounts validated server-side
  - Check: Payment endpoints validate positive amounts, reasonable limits
- [ ] **Transaction Integrity**: No tampering with amounts or recipients
  - Check: Server validates all transaction fields
- [ ] **Idempotency**: Duplicate transactions prevented
  - Check: Transaction ID uniqueness, duplicate detection
- [ ] **Audit Logging**: All transactions logged with user, amount, timestamp
  - Check: Transaction logging implementation

#### Sensitive Data Protection
- [ ] **No Sensitive Data in Logs**: Never log full credit card numbers, CVVs
  - Search: Payment-related logging
- [ ] **Data Masking**: Display masked account numbers
  - Check: Frontend only shows last 4 digits
- [ ] **Encryption at Rest**: Payment data encrypted in database
  - Check: Database encryption configuration

---

### 🔒 Data Protection & Privacy

#### Sensitive Data Handling
- [ ] **PII Protection**: Personal information properly secured
  - Check: User data access controls
- [ ] **Data Minimization**: Only collect necessary data
  - Review: User model fields
- [ ] **Secure Transmission**: All data sent over HTTPS
  - Check: No HTTP endpoints
- [ ] **Data Retention**: Old data properly purged
  - Check: Data cleanup policies

#### Encryption
- [ ] **TLS/HTTPS**: All communications use HTTPS
  - Check: No hardcoded HTTP URLs
- [ ] **Strong Ciphers**: Modern TLS 1.2+ with strong cipher suites
  - Check: Server TLS configuration
- [ ] **No Weak Algorithms**: No MD5, SHA1, DES
  - Search: Cryptographic algorithm usage

---

### 🔑 Secrets Management

#### Environment Variables
- [ ] **No Hardcoded Secrets**: All secrets in environment variables
  - Check: `.env.example` vs code
- [ ] **Secrets Not Committed**: `.env` in `.gitignore`
  - Verify: `.gitignore` includes `.env`
- [ ] **Production Secrets**: Different secrets for dev/prod
  - Review: Environment configuration

#### API Keys & Tokens
- [ ] **API Key Rotation**: Keys regularly rotated
- [ ] **Least Privilege**: API keys have minimum required permissions
- [ ] **No Client-Side Secrets**: Backend secrets never sent to frontend
  - Check: No secrets in React code or environment variables starting with `VITE_`

---

### 🌐 API Security

#### Input Validation
- [ ] **Server-Side Validation**: All inputs validated on backend
  - Check: Express validators, Yup schemas
- [ ] **Type Checking**: TypeScript types enforced at runtime
  - Check: Runtime validation matches TypeScript types
- [ ] **Length Limits**: String inputs have max length
  - Check: Request body size limits
- [ ] **Format Validation**: Emails, URLs, dates properly validated
  - Check: Validation schemas

#### Rate Limiting
- [ ] **API Rate Limiting**: Prevent brute force and DoS
  - Check: Express rate limiter middleware
- [ ] **Per-User Limits**: Limits per authenticated user
- [ ] **Login Rate Limiting**: Failed login attempts limited
  - Check: Authentication endpoint throttling

#### CORS Configuration
- [ ] **CORS Properly Configured**: Only allow trusted origins
  - Check: `cors` middleware configuration
- [ ] **No Wildcard Origins**: No `Access-Control-Allow-Origin: *` in production
- [ ] **Credentials Handling**: CORS credentials properly configured

#### Error Handling
- [ ] **No Stack Traces**: Don't expose stack traces to users
  - Check: Express error handler
- [ ] **Generic Error Messages**: Don't leak sensitive info in errors
  - Check: API error responses
- [ ] **Logging Errors**: All errors logged server-side
  - Check: Error logging implementation

---

### 📦 Dependency Security

#### Package Management
- [ ] **Known Vulnerabilities**: No high/critical CVEs in dependencies
  - Run: `yarn audit`
- [ ] **Outdated Packages**: Review outdated packages
  - Run: `yarn outdated`
- [ ] **Package Integrity**: Using lockfile (yarn.lock)
  - Check: `yarn.lock` committed
- [ ] **Supply Chain**: Verify package sources and maintainers
  - Review: New dependencies before adding

#### Specific Vulnerable Packages (Common Issues)
- [ ] **Axios Version**: Check for Axios SSRF vulnerabilities
- [ ] **Express Version**: Ensure Express is recent (4.20.0+ is good)
- [ ] **JWT Libraries**: @okta/jwt-verifier, express-jwt up to date
- [ ] **Bcrypt**: Using bcryptjs (safer than native bcrypt)
- [ ] **Lodash**: Check for prototype pollution issues

---

### 🔧 Configuration Security

#### Backend Configuration
- [ ] **Debug Mode**: Debug/verbose logging disabled in production
  - Check: `NODE_ENV=production` configuration
- [ ] **Security Headers**: Helmet or security headers middleware
  - Check: Express security middleware
- [ ] **HTTPS Enforcement**: Redirect HTTP to HTTPS
  - Check: Server configuration
- [ ] **File Upload Security**: File uploads validated and restricted
  - Check: File upload endpoints if any

#### Frontend Configuration
- [ ] **No Sensitive Config**: No secrets in Vite config
  - Check: `vite.config.ts`
- [ ] **Source Maps**: Disabled or restricted in production
  - Check: Build configuration
- [ ] **Console Logs**: No sensitive data in console.log
  - Search: `console.log` statements

#### Database Security
- [ ] **Connection String**: Database credentials in environment variables
  - Check: Database connection configuration
- [ ] **Prepared Statements**: Using parameterized queries
- [ ] **Least Privilege**: Database user has minimum permissions
- [ ] **Backup Security**: Database backups encrypted

---

### 🧪 Cypress Test Security

#### Test Data
- [ ] **No Real Credentials**: Tests use mock credentials
  - Check: Cypress fixtures and test files
- [ ] **Test Secrets**: Test secrets not committed
  - Check: Cypress environment files
- [ ] **Test Isolation**: Tests don't leak data between runs
  - Check: Database seeding and cleanup

---

## Security Scan Scripts

The following scripts are available in `.claude/skills/security-review/scripts/`:

- **`audit-dependencies.sh`**: Comprehensive dependency vulnerability scan
- **`scan-secrets.sh`**: Search for hardcoded secrets and credentials
- **`check-auth.sh`**: Validate authentication implementation
- **`check-payments.sh`**: Review payment security

Run all scans:
```bash
cd .claude/skills/security-review/scripts
./run-all-scans.sh
```

---

## Output Format

For each security finding, report:

### 🔴 Critical | 🟠 High | 🟡 Medium | 🟢 Low

**Finding #**: [Title]
- **Severity**: Critical/High/Medium/Low
- **Category**: (Authentication, Injection, Secrets, etc.)
- **Location**: `file:line`
- **Issue**: Clear description of the vulnerability
- **Risk**: What could happen if exploited
- **Recommendation**: Specific fix with code example
- **References**: CWE/OWASP links if applicable

---

## Priority Focus Areas

For this Cypress RealWorld App, prioritize:

1. **Payment Security** - Transaction integrity, amount validation
2. **Authentication** - JWT validation, session security, multi-provider auth
3. **Secrets Management** - API keys for Auth0, Okta, Cognito, Google
4. **Authorization** - User data access controls
5. **Dependency Vulnerabilities** - Keep dependencies updated
6. **Input Validation** - Prevent injection attacks

---

## Resources

- **OWASP Top 10**: https://owasp.org/www-project-top-ten/
- **OWASP API Security**: https://owasp.org/www-project-api-security/
- **CWE Top 25**: https://cwe.mitre.org/top25/
- **Node.js Security Best Practices**: https://nodejs.org/en/docs/guides/security/
- **Express Security Best Practices**: https://expressjs.com/en/advanced/best-practice-security.html

Additional documentation:
- [SECURITY_STANDARDS.md](SECURITY_STANDARDS.md) - Team security standards
- [PAYMENT_SECURITY.md](PAYMENT_SECURITY.md) - Payment-specific guidelines
- [AUTH_SECURITY.md](AUTH_SECURITY.md) - Authentication security checklist
