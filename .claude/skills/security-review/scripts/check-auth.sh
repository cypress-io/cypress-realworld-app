#!/bin/bash
# Authentication Security Checker for Cypress RealWorld App

set -e

echo "================================================"
echo "   Authentication Security Review"
echo "================================================"
echo ""

RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m'

ISSUES=0

echo "🔐 Checking authentication implementation..."
echo ""

# Check password hashing
echo "================================================"
echo "1. Password Hashing"
echo "================================================"
echo ""

echo "Checking for bcrypt usage..."
if grep -r "bcrypt" --include="*.ts" --include="*.js" --exclude-dir=node_modules backend/ > /dev/null 2>&1; then
    echo -e "${GREEN}✅ bcrypt found in backend${NC}"

    # Check for proper bcrypt rounds
    BCRYPT_ROUNDS=$(grep -r "bcrypt.*hash\|bcrypt.*genSalt" --include="*.ts" backend/ 2>/dev/null | head -5 || true)
    if [ -n "$BCRYPT_ROUNDS" ]; then
        echo "Found bcrypt usage:"
        echo "$BCRYPT_ROUNDS"
    fi

    # Check for weak rounds
    if grep -r "bcrypt.*hash.*[1-9]," --include="*.ts" backend/ > /dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  Check bcrypt rounds - should be >= 12${NC}"
        ISSUES=$((ISSUES + 1))
    fi
else
    echo -e "${RED}⚠️  bcrypt not found - check password hashing implementation${NC}"
    ISSUES=$((ISSUES + 1))
fi

# Check for weak hashing
echo ""
echo "Checking for weak hashing algorithms..."
WEAK_HASH=$(grep -r "md5\|sha1" --include="*.ts" --include="*.js" --exclude-dir=node_modules . 2>/dev/null || true)
if [ -n "$WEAK_HASH" ]; then
    echo -e "${YELLOW}⚠️  Found weak hashing (MD5/SHA1):${NC}"
    echo "$WEAK_HASH" | head -10
    ISSUES=$((ISSUES + 1))
else
    echo -e "${GREEN}✅ No weak hashing algorithms detected${NC}"
fi

# Check JWT validation
echo ""
echo "================================================"
echo "2. JWT Token Security"
echo "================================================"
echo ""

echo "Checking JWT verification..."
if grep -r "jwt.*verify\|verifyToken" --include="*.ts" backend/ > /dev/null 2>&1; then
    echo -e "${GREEN}✅ JWT verification found${NC}"

    JWT_VERIFY=$(grep -r -A 5 "jwt.*verify\|verifyToken" --include="*.ts" backend/ 2>/dev/null | head -20)
    echo "JWT verification code:"
    echo "$JWT_VERIFY"
else
    echo -e "${RED}⚠️  JWT verification not found - tokens might not be validated!${NC}"
    ISSUES=$((ISSUES + 1))
fi

echo ""
echo "Checking for JWT expiration..."
if grep -r "expiresIn\|exp:" --include="*.ts" --exclude-dir=node_modules . > /dev/null 2>&1; then
    echo -e "${GREEN}✅ JWT expiration configured${NC}"
    EXP=$(grep -r "expiresIn" --include="*.ts" --exclude-dir=node_modules . 2>/dev/null | head -5)
    echo "$EXP"
else
    echo -e "${YELLOW}⚠️  JWT expiration not found - tokens should expire${NC}"
    ISSUES=$((ISSUES + 1))
fi

# Check session configuration
echo ""
echo "================================================"
echo "3. Session Security"
echo "================================================"
echo ""

echo "Checking session configuration..."
if [ -f "backend/app.ts" ]; then
    if grep -q "express-session" backend/app.ts; then
        echo -e "${GREEN}✅ express-session configured${NC}"

        # Check for secure session config
        echo ""
        echo "Session configuration:"
        grep -A 10 "express-session\|session({" backend/app.ts 2>/dev/null || true

        # Check for httpOnly
        if grep -q "httpOnly.*true" backend/app.ts; then
            echo -e "${GREEN}✅ httpOnly flag set${NC}"
        else
            echo -e "${YELLOW}⚠️  httpOnly flag not found - cookies should be httpOnly${NC}"
            ISSUES=$((ISSUES + 1))
        fi

        # Check for secure flag
        if grep -q "secure.*true" backend/app.ts; then
            echo -e "${GREEN}✅ secure flag configured${NC}"
        else
            echo -e "${YELLOW}⚠️  secure flag not found - cookies should be secure in production${NC}"
        fi

        # Check for sameSite
        if grep -q "sameSite" backend/app.ts; then
            echo -e "${GREEN}✅ sameSite configured${NC}"
        else
            echo -e "${YELLOW}⚠️  sameSite not found - helps prevent CSRF${NC}"
        fi
    fi
fi

# Check authentication endpoints
echo ""
echo "================================================"
echo "4. Authentication Endpoints"
echo "================================================"
echo ""

echo "Checking for login endpoint..."
LOGIN_ENDPOINTS=$(find backend -name "*.ts" -exec grep -l "login\|signin" {} \; 2>/dev/null || true)
if [ -n "$LOGIN_ENDPOINTS" ]; then
    echo -e "${GREEN}✅ Login endpoints found:${NC}"
    echo "$LOGIN_ENDPOINTS"
else
    echo -e "${YELLOW}⚠️  Login endpoints not found${NC}"
fi

echo ""
echo "Checking for rate limiting on auth endpoints..."
if grep -r "rate.*limit\|express-rate-limit" --include="*.ts" backend/ > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Rate limiting found${NC}"
else
    echo -e "${RED}⚠️  Rate limiting not found - auth endpoints vulnerable to brute force${NC}"
    ISSUES=$((ISSUES + 1))
fi

# Check authorization middleware
echo ""
echo "================================================"
echo "5. Authorization Middleware"
echo "================================================"
echo ""

echo "Checking for authentication middleware..."
if grep -r "isAuthenticated\|ensureAuth\|requireAuth" --include="*.ts" backend/ > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Authentication middleware found${NC}"
    AUTH_MIDDLEWARE=$(grep -r "isAuthenticated\|ensureAuth\|requireAuth" --include="*.ts" backend/ 2>/dev/null | head -10)
    echo "$AUTH_MIDDLEWARE"
else
    echo -e "${YELLOW}⚠️  Authentication middleware not clearly identified${NC}"
fi

echo ""
echo "Checking protected routes..."
PROTECTED_ROUTES=$(grep -r "router.*use.*auth\|router.*get.*auth\|router.*post.*auth" --include="*.ts" backend/ 2>/dev/null | head -10 || true)
if [ -n "$PROTECTED_ROUTES" ]; then
    echo -e "${GREEN}✅ Protected routes found${NC}"
    echo "$PROTECTED_ROUTES"
else
    echo -e "${YELLOW}⚠️  Protected routes not clearly identified${NC}"
fi

# Check multi-provider auth
echo ""
echo "================================================"
echo "6. Multi-Provider Authentication"
echo "================================================"
echo ""

echo "Checking Auth0 integration..."
if grep -r "@auth0" package.json > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Auth0 configured${NC}"

    # Check for Auth0 secrets
    if grep -r "AUTH0.*DOMAIN\|AUTH0.*CLIENT" --include="*.ts" --exclude-dir=node_modules . > /dev/null 2>&1; then
        echo "  Auth0 config references found"
    fi
else
    echo "  Auth0 not in use"
fi

echo ""
echo "Checking Okta integration..."
if grep -r "@okta" package.json > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Okta configured${NC}"

    if grep -r "OKTA.*DOMAIN\|OKTA.*CLIENT" --include="*.ts" --exclude-dir=node_modules . > /dev/null 2>&1; then
        echo "  Okta config references found"
    fi
else
    echo "  Okta not in use"
fi

echo ""
echo "Checking AWS Cognito integration..."
if grep -r "aws-amplify\|aws-cognito" package.json > /dev/null 2>&1; then
    echo -e "${GREEN}✅ AWS Cognito configured${NC}"
else
    echo "  Cognito not in use"
fi

echo ""
echo "Checking Google OAuth..."
if grep -r "google.*login\|@matheusluizn/react-google-login" package.json > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Google OAuth configured${NC}"
else
    echo "  Google OAuth not in use"
fi

# Summary
echo ""
echo "================================================"
echo "   Summary"
echo "================================================"
echo ""

if [ $ISSUES -eq 0 ]; then
    echo -e "${GREEN}✅ No major authentication issues detected!${NC}"
    echo ""
    echo "Manual review recommended for:"
    echo "- JWT token expiration times (should be < 1 hour)"
    echo "- Session timeout configuration"
    echo "- Password strength requirements"
    echo "- Multi-factor authentication (if required)"
else
    echo -e "${YELLOW}⚠️  Found $ISSUES potential authentication issues${NC}"
    echo ""
    echo "Action Required:"
    echo "1. Review all findings above"
    echo "2. Implement missing security controls"
    echo "3. Test authentication flows thoroughly"
    echo "4. Review auth provider configurations"
fi

echo ""
exit 0
