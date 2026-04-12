#!/bin/bash
# Hardcoded Secrets Scanner for Cypress RealWorld App

set -e

echo "================================================"
echo "   Hardcoded Secrets Scanner"
echo "================================================"
echo ""

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

FINDINGS=0

echo "🔍 Scanning for hardcoded secrets..."
echo ""

# Function to search and report
search_pattern() {
    local pattern=$1
    local description=$2
    local results

    results=$(grep -r -n -i "$pattern" \
        --include="*.ts" \
        --include="*.tsx" \
        --include="*.js" \
        --include="*.jsx" \
        --exclude-dir=node_modules \
        --exclude-dir=.git \
        --exclude-dir=dist \
        --exclude-dir=build \
        --exclude-dir=coverage \
        . 2>/dev/null || true)

    if [ -n "$results" ]; then
        echo -e "${RED}⚠️  Found potential $description:${NC}"
        echo "$results" | head -20
        echo ""
        FINDINGS=$((FINDINGS + 1))
    fi
}

# Search for various secret patterns
echo "Searching for hardcoded passwords..."
search_pattern 'password\s*=\s*["\x27][^"\x27]{3,}["\x27]' "hardcoded passwords"

echo "Searching for API keys..."
search_pattern 'api[_-]?key\s*=\s*["\x27][A-Za-z0-9+/=_-]{10,}["\x27]' "API keys"
search_pattern 'apikey\s*=\s*["\x27][A-Za-z0-9+/=_-]{10,}["\x27]' "API keys (no separator)"

echo "Searching for tokens..."
search_pattern 'token\s*=\s*["\x27][A-Za-z0-9+/=_-]{20,}["\x27]' "tokens"
search_pattern 'auth.*token\s*=\s*["\x27][^"\x27]{20,}["\x27]' "auth tokens"

echo "Searching for secrets..."
search_pattern 'secret\s*=\s*["\x27][^"\x27]{10,}["\x27]' "secrets"
search_pattern 'client[_-]?secret' "client secrets"

echo "Searching for private keys..."
search_pattern 'private[_-]?key\s*=\s*["\x27]' "private keys"
search_pattern '-----BEGIN.*PRIVATE KEY-----' "private key blocks"

echo "Searching for AWS credentials..."
search_pattern 'aws[_-]?access[_-]?key' "AWS access keys"
search_pattern 'aws[_-]?secret' "AWS secrets"
search_pattern 'AKIA[0-9A-Z]{16}' "AWS access key IDs"

echo "Searching for database credentials..."
search_pattern 'database.*password' "database passwords"
search_pattern 'db[_-]?password' "database passwords"
search_pattern 'postgres.*password' "PostgreSQL passwords"

echo "Searching for Auth0 secrets..."
search_pattern 'auth0.*secret' "Auth0 secrets"
search_pattern 'auth0.*client.*secret' "Auth0 client secrets"

echo "Searching for Okta credentials..."
search_pattern 'okta.*token' "Okta tokens"
search_pattern 'okta.*secret' "Okta secrets"

echo "Searching for JWT secrets..."
search_pattern 'jwt[_-]?secret\s*=\s*["\x27][^"\x27]{10,}["\x27]' "JWT secrets"

echo "Searching for hardcoded URLs with credentials..."
search_pattern '://[^:@]+:[^:@]+@' "URLs with embedded credentials"

echo ""
echo "================================================"
echo "   Checking .env file exposure"
echo "================================================"
echo ""

# Check if .env is in gitignore
if [ -f ".gitignore" ]; then
    if grep -q "^\.env$" .gitignore; then
        echo -e "${GREEN}✅ .env is in .gitignore${NC}"
    else
        echo -e "${RED}⚠️  .env might not be properly ignored!${NC}"
        FINDINGS=$((FINDINGS + 1))
    fi
else
    echo -e "${YELLOW}⚠️  No .gitignore found${NC}"
fi

# Check if .env files exist
if [ -f ".env" ]; then
    echo -e "${YELLOW}⚠️  .env file exists - ensure it's not committed${NC}"
fi

# Check for committed .env files in git history
if git rev-parse --git-dir > /dev/null 2>&1; then
    echo ""
    echo "Checking git history for accidentally committed secrets..."
    ENV_IN_HISTORY=$(git log --all --full-history -- "*.env" 2>/dev/null | head -5 || true)
    if [ -n "$ENV_IN_HISTORY" ]; then
        echo -e "${RED}⚠️  Found .env files in git history!${NC}"
        echo "$ENV_IN_HISTORY"
        FINDINGS=$((FINDINGS + 1))
    else
        echo -e "${GREEN}✅ No .env files in git history${NC}"
    fi
fi

echo ""
echo "================================================"
echo "   Checking Vite environment variables"
echo "================================================"
echo ""

# Check for secrets exposed to frontend via VITE_ prefix
echo "Checking for sensitive data in VITE_ environment variables..."
VITE_SECRETS=$(grep -r "VITE_.*SECRET\|VITE_.*PASSWORD\|VITE_.*PRIVATE" \
    --include="*.ts" \
    --include="*.tsx" \
    --include="*.js" \
    --exclude-dir=node_modules \
    . 2>/dev/null || true)

if [ -n "$VITE_SECRETS" ]; then
    echo -e "${RED}⚠️  Found potential secrets in VITE_ variables (exposed to frontend!):${NC}"
    echo "$VITE_SECRETS"
    FINDINGS=$((FINDINGS + 1))
else
    echo -e "${GREEN}✅ No obvious secrets in VITE_ variables${NC}"
fi

echo ""
echo "================================================"
echo "   Summary"
echo "================================================"
echo ""

if [ $FINDINGS -eq 0 ]; then
    echo -e "${GREEN}✅ No hardcoded secrets detected!${NC}"
    echo ""
    echo "Note: This is an automated scan. Manual review is still recommended."
else
    echo -e "${RED}⚠️  Found $FINDINGS potential security issues${NC}"
    echo ""
    echo "Action Required:"
    echo "1. Review all findings above"
    echo "2. Move secrets to environment variables"
    echo "3. Use .env files (and add to .gitignore)"
    echo "4. For committed secrets, rotate them immediately"
    echo "5. Consider using git-secrets or similar tools"
fi

echo ""
exit 0
