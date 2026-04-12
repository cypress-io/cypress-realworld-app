# Authentication Security Guide - Cypress RealWorld App

## Overview

This guide covers authentication and authorization security for the Cypress RealWorld App with multiple auth providers (Auth0, Okta, AWS Cognito, Google).

---

## Authentication Providers

### Supported Providers

1. **Local Authentication** - Username/password with bcrypt
2. **Auth0** - Enterprise SSO
3. **Okta** - Enterprise SSO
4. **AWS Cognito** - AWS managed user pools
5. **Google OAuth** - Social login

### Security Considerations by Provider

| Provider | Token Type | Validation | Notes |
|----------|-----------|-----------|-------|
| Local | JWT | Server-side | Must validate password strength |
| Auth0 | JWT | Auth0 SDK | Verify JWT signature with Auth0 public keys |
| Okta | JWT | Okta SDK | Use @okta/jwt-verifier |
| Cognito | JWT | AWS SDK | Verify token with Cognito public keys |
| Google | ID Token | Google SDK | Verify with Google OAuth library |

---

## Password-Based Authentication

### Password Hashing

```typescript
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12; // Minimum 12, increase for more security

// Registration
async function hashPassword(plainPassword: string): Promise<string> {
  return await bcrypt.hash(plainPassword, SALT_ROUNDS);
}

// Login
async function verifyPassword(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  return await bcrypt.compare(plainPassword, hashedPassword);
}

// Example usage
app.post('/api/auth/register', async (req, res) => {
  const { username, password } = req.body;

  // Validate password strength
  if (!isStrongPassword(password)) {
    return res.status(400).json({
      error: 'Password must be at least 8 characters with uppercase, lowercase, and number'
    });
  }

  const hashedPassword = await hashPassword(password);

  await createUser({ username, password: hashedPassword });

  res.status(201).json({ message: 'User created' });
});
```

### Password Strength Validation

```typescript
function isStrongPassword(password: string): boolean {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return (
    password.length >= minLength &&
    hasUpperCase &&
    hasLowerCase &&
    hasNumbers
  );
}

// Enhanced validation with common password check
const COMMON_PASSWORDS = ['password', '12345678', 'qwerty', ...];

function isStrongPasswordEnhanced(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain lowercase letter');
  }
  if (!/\d/.test(password)) {
    errors.push('Password must contain number');
  }
  if (COMMON_PASSWORDS.includes(password.toLowerCase())) {
    errors.push('Password is too common');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
```

### Login Rate Limiting

```typescript
import rateLimit from 'express-rate-limit';

// Strict rate limiting for login endpoint
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  skipSuccessfulRequests: true, // Only count failed attempts
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many login attempts. Please try again later.'
    });
  }
});

app.post('/api/auth/login', loginLimiter, async (req, res) => {
  const { username, password } = req.body;

  const user = await getUserByUsername(username);

  if (!user || !(await verifyPassword(password, user.password))) {
    // Generic error message to prevent user enumeration
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Generate session/token
  const token = generateToken(user);

  res.json({ token, user: { id: user.id, username: user.username } });
});
```

---

## JWT Token Security

### Token Generation

```typescript
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET; // Min 32 characters
const JWT_EXPIRES_IN = '1h'; // Short-lived access tokens
const REFRESH_TOKEN_EXPIRES_IN = '30d';

interface TokenPayload {
  userId: string;
  username: string;
  type: 'access' | 'refresh';
}

function generateAccessToken(user: User): string {
  return jwt.sign(
    {
      userId: user.id,
      username: user.username,
      type: 'access'
    },
    JWT_SECRET,
    {
      expiresIn: JWT_EXPIRES_IN,
      issuer: 'cypress-realworld-app',
      audience: 'cypress-app-users'
    }
  );
}

function generateRefreshToken(user: User): string {
  return jwt.sign(
    {
      userId: user.id,
      type: 'refresh'
    },
    JWT_SECRET,
    {
      expiresIn: REFRESH_TOKEN_EXPIRES_IN,
      issuer: 'cypress-realworld-app'
    }
  );
}
```

### Token Validation Middleware

```typescript
import { Request, Response, NextFunction } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET, {
      issuer: 'cypress-realworld-app',
      audience: 'cypress-app-users'
    }) as TokenPayload;

    // Ensure it's an access token
    if (payload.type !== 'access') {
      return res.status(401).json({ error: 'Invalid token type' });
    }

    req.user = payload;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: 'Token expired' });
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    return res.status(500).json({ error: 'Authentication error' });
  }
}

// Usage
app.get('/api/protected', authenticateToken, (req, res) => {
  res.json({ message: 'Protected data', user: req.user });
});
```

### Token Refresh

```typescript
app.post('/api/auth/refresh', async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ error: 'Refresh token required' });
  }

  try {
    const payload = jwt.verify(refreshToken, JWT_SECRET) as TokenPayload;

    if (payload.type !== 'refresh') {
      return res.status(401).json({ error: 'Invalid token type' });
    }

    // Optional: Check if refresh token is revoked
    if (await isTokenRevoked(refreshToken)) {
      return res.status(401).json({ error: 'Token revoked' });
    }

    const user = await getUserById(payload.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Generate new access token
    const newAccessToken = generateAccessToken(user);

    res.json({ accessToken: newAccessToken });
  } catch (error) {
    return res.status(401).json({ error: 'Invalid refresh token' });
  }
});
```

---

## OAuth Provider Integration

### Auth0 Configuration

```typescript
import { auth } from 'express-oauth2-jwt-bearer';

const checkJwt = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}`,
  tokenSigningAlg: 'RS256'
});

app.get('/api/protected', checkJwt, (req, res) => {
  res.json({ message: 'Protected route' });
});
```

### Okta Configuration

```typescript
import OktaJwtVerifier from '@okta/jwt-verifier';

const oktaJwtVerifier = new OktaJwtVerifier({
  issuer: `https://${process.env.OKTA_DOMAIN}/oauth2/default`,
  clientId: process.env.OKTA_CLIENT_ID,
  assertClaims: {
    aud: 'api://default'
  }
});

async function verifyOktaToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const jwt = await oktaJwtVerifier.verifyAccessToken(token, 'api://default');
    req.user = { userId: jwt.claims.sub, ...jwt.claims };
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
```

### AWS Cognito Configuration

```typescript
import { CognitoJwtVerifier } from 'aws-jwt-verify';

const verifier = CognitoJwtVerifier.create({
  userPoolId: process.env.AWS_COGNITO_USER_POOL_ID,
  tokenUse: 'access',
  clientId: process.env.AWS_COGNITO_CLIENT_ID
});

async function verifyCognitoToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const payload = await verifier.verify(token);
    req.user = { userId: payload.sub, ...payload };
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
```

### Google OAuth Configuration

```typescript
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function verifyGoogleToken(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    if (!payload) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = {
      userId: payload.sub,
      email: payload.email,
      name: payload.name
    };

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid Google token' });
  }
}
```

---

## Session Management

### Secure Session Configuration

```typescript
import session from 'express-session';
import connectRedis from 'connect-redis';
import { createClient } from 'redis';

const RedisStore = connectRedis(session);
const redisClient = createClient({
  url: process.env.REDIS_URL
});

app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET, // Min 32 characters
  resave: false,
  saveUninitialized: false,
  name: 'sessionId', // Don't use default 'connect.sid'
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    httpOnly: true, // Prevent XSS access
    sameSite: 'strict', // CSRF protection
    maxAge: 30 * 60 * 1000, // 30 minutes
    domain: process.env.COOKIE_DOMAIN
  },
  rolling: true // Reset expiration on each request
}));
```

### Session Fixation Prevention

```typescript
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;

  const user = await getUserByUsername(username);

  if (!user || !(await verifyPassword(password, user.password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Regenerate session to prevent fixation
  req.session.regenerate((err) => {
    if (err) {
      return res.status(500).json({ error: 'Session error' });
    }

    // Store user info in session
    req.session.userId = user.id;
    req.session.username = user.username;

    req.session.save((err) => {
      if (err) {
        return res.status(500).json({ error: 'Session error' });
      }

      res.json({
        user: { id: user.id, username: user.username }
      });
    });
  });
});
```

### Logout

```typescript
app.post('/api/auth/logout', (req, res) => {
  // Destroy session
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout error' });
    }

    // Clear cookie
    res.clearCookie('sessionId');

    res.json({ message: 'Logged out successfully' });
  });
});
```

---

## Authorization

### Role-Based Access Control (RBAC)

```typescript
enum Role {
  USER = 'user',
  ADMIN = 'admin',
  MODERATOR = 'moderator'
}

interface User {
  id: string;
  username: string;
  role: Role;
}

function requireRole(...allowedRoles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userRole = req.user.role;

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
}

// Usage
app.delete(
  '/api/users/:id',
  authenticateToken,
  requireRole(Role.ADMIN),
  async (req, res) => {
    await deleteUser(req.params.id);
    res.json({ message: 'User deleted' });
  }
);
```

### Resource Ownership Authorization

```typescript
async function requireOwnership(
  resourceType: 'transaction' | 'user' | 'account'
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const resourceId = req.params.id;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    try {
      let isOwner = false;

      switch (resourceType) {
        case 'transaction':
          const transaction = await getTransaction(resourceId);
          isOwner =
            transaction.senderId === userId ||
            transaction.receiverId === userId;
          break;
        case 'user':
          isOwner = resourceId === userId;
          break;
        case 'account':
          const account = await getAccount(resourceId);
          isOwner = account.userId === userId;
          break;
      }

      if (!isOwner) {
        return res.status(403).json({ error: 'Access denied' });
      }

      next();
    } catch (error) {
      return res.status(500).json({ error: 'Authorization error' });
    }
  };
}

// Usage
app.get(
  '/api/transactions/:id',
  authenticateToken,
  requireOwnership('transaction'),
  async (req, res) => {
    const transaction = await getTransaction(req.params.id);
    res.json(transaction);
  }
);
```

---

## Security Best Practices

### 1. Never Expose User Enumeration

```typescript
// ❌ BAD: Reveals if username exists
if (!user) {
  return res.status(404).json({ error: 'User not found' });
}
if (!await verifyPassword(password, user.password)) {
  return res.status(401).json({ error: 'Incorrect password' });
}

// ✅ GOOD: Generic error message
if (!user || !await verifyPassword(password, user.password)) {
  return res.status(401).json({ error: 'Invalid credentials' });
}
```

### 2. Prevent Timing Attacks

```typescript
import crypto from 'crypto';

// Use constant-time comparison for tokens
function secureCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  return crypto.timingSafeEqual(
    Buffer.from(a),
    Buffer.from(b)
  );
}
```

### 3. Password Reset Security

```typescript
import crypto from 'crypto';

function generateResetToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

app.post('/api/auth/forgot-password', async (req, res) => {
  const { email } = req.body;

  const user = await getUserByEmail(email);

  // Don't reveal if email exists
  if (!user) {
    return res.json({
      message: 'If email exists, reset link has been sent'
    });
  }

  const resetToken = generateResetToken();
  const resetTokenExpiry = Date.now() + 3600000; // 1 hour

  await saveResetToken(user.id, resetToken, resetTokenExpiry);

  // Send email (implementation not shown)
  await sendResetEmail(user.email, resetToken);

  res.json({
    message: 'If email exists, reset link has been sent'
  });
});

app.post('/api/auth/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;

  const user = await getUserByResetToken(token);

  if (!user || user.resetTokenExpiry < Date.now()) {
    return res.status(400).json({ error: 'Invalid or expired token' });
  }

  const hashedPassword = await hashPassword(newPassword);

  await updatePassword(user.id, hashedPassword);
  await clearResetToken(user.id);

  res.json({ message: 'Password reset successful' });
});
```

### 4. Multi-Factor Authentication (MFA)

```typescript
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

// Generate MFA secret
app.post('/api/auth/mfa/setup', authenticateToken, async (req, res) => {
  const secret = speakeasy.generateSecret({
    name: `Cypress App (${req.user.username})`
  });

  // Save secret for user
  await saveMFASecret(req.user.userId, secret.base32);

  // Generate QR code
  const qrCode = await QRCode.toDataURL(secret.otpauth_url);

  res.json({ qrCode, secret: secret.base32 });
});

// Verify MFA token
app.post('/api/auth/mfa/verify', authenticateToken, async (req, res) => {
  const { token } = req.body;

  const user = await getUserById(req.user.userId);

  if (!user.mfaSecret) {
    return res.status(400).json({ error: 'MFA not set up' });
  }

  const verified = speakeasy.totp.verify({
    secret: user.mfaSecret,
    encoding: 'base32',
    token: token,
    window: 2 // Allow 2 time steps before/after
  });

  if (!verified) {
    return res.status(401).json({ error: 'Invalid MFA token' });
  }

  await markMFAVerified(user.id);

  res.json({ message: 'MFA verified' });
});
```

---

## Testing Authentication Security

```typescript
describe('Authentication Security', () => {
  it('should reject weak passwords', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        password: '123' // Too weak
      });

    expect(response.status).toBe(400);
  });

  it('should rate limit login attempts', async () => {
    const attempts = Array(10).fill(null).map(() =>
      request(app)
        .post('/api/auth/login')
        .send({
          username: 'test',
          password: 'wrong'
        })
    );

    const responses = await Promise.all(attempts);
    const rateLimited = responses.filter(r => r.status === 429);

    expect(rateLimited.length).toBeGreaterThan(0);
  });

  it('should reject expired tokens', async () => {
    const expiredToken = jwt.sign(
      { userId: '123' },
      JWT_SECRET,
      { expiresIn: '-1h' } // Expired 1 hour ago
    );

    const response = await request(app)
      .get('/api/protected')
      .set('Authorization', `Bearer ${expiredToken}`);

    expect(response.status).toBe(401);
  });

  it('should prevent accessing other users data', async () => {
    const userAToken = generateToken(userA);
    const userBId = userB.id;

    const response = await request(app)
      .get(`/api/users/${userBId}/transactions`)
      .set('Authorization', `Bearer ${userAToken}`);

    expect(response.status).toBe(403);
  });
});
```

---

## Checklist

- [ ] Passwords hashed with bcrypt (12+ rounds)
- [ ] Password strength requirements enforced
- [ ] Login rate limiting configured
- [ ] JWT tokens properly validated
- [ ] Short token expiration (< 1 hour)
- [ ] Refresh token rotation implemented
- [ ] Session fixation prevention
- [ ] Secure cookie flags set
- [ ] Generic error messages (no user enumeration)
- [ ] Authorization on all protected endpoints
- [ ] OAuth providers properly configured
- [ ] MFA available for sensitive operations
- [ ] Password reset securely implemented
- [ ] Comprehensive authentication tests

---

**Security is critical. Always validate tokens, check authorization, and use secure defaults.**
