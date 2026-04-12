#!/bin/bash
# Dependency Vulnerability Scanner for Cypress RealWorld App

set -e

echo "================================================"
echo "   Dependency Security Audit"
echo "================================================"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "Error: package.json not found. Run from project root."
    exit 1
fi

echo "📦 Scanning dependencies for vulnerabilities..."
echo ""

# Run yarn audit
echo "Running yarn audit..."
if yarn audit --level moderate; then
    echo "✅ No moderate or higher vulnerabilities found!"
else
    AUDIT_EXIT=$?
    echo ""
    echo "⚠️  Vulnerabilities detected (exit code: $AUDIT_EXIT)"
    echo ""
    echo "Getting detailed audit report..."
    yarn audit --level moderate --json > /tmp/audit-report.json 2>/dev/null || true
fi

echo ""
echo "================================================"
echo "   Audit Summary"
echo "================================================"
yarn audit --summary 2>/dev/null || echo "Could not generate summary"

echo ""
echo "================================================"
echo "   Checking for Outdated Packages"
echo "================================================"
echo ""
echo "Packages with available updates:"
yarn outdated || echo "All packages are up to date!"

echo ""
echo "================================================"
echo "   High-Risk Packages to Review"
echo "================================================"
echo ""

# Check specific packages known to have had issues
echo "Checking critical packages:"
echo ""

# Axios - SSRF vulnerabilities
AXIOS_VERSION=$(node -e "console.log(require('./package.json').dependencies.axios)" 2>/dev/null || echo "not found")
echo "- axios: $AXIOS_VERSION"
if [[ "$AXIOS_VERSION" == "0.28.1" ]]; then
    echo "  ⚠️  Check for known vulnerabilities in this version"
fi

# Express - various security issues
EXPRESS_VERSION=$(node -e "console.log(require('./package.json').devDependencies.express)" 2>/dev/null || echo "not found")
echo "- express: $EXPRESS_VERSION"

# JWT libraries
JWT_VERSION=$(node -e "console.log(require('./package.json').devDependencies.jsonwebtoken || 'not direct dep')" 2>/dev/null || echo "not found")
echo "- jsonwebtoken: $JWT_VERSION"

# Bcrypt
BCRYPT_VERSION=$(node -e "console.log(require('./package.json').devDependencies.bcryptjs)" 2>/dev/null || echo "not found")
echo "- bcryptjs: $BCRYPT_VERSION"

echo ""
echo "================================================"
echo "   Recommendations"
echo "================================================"
echo ""
echo "1. Review all HIGH and CRITICAL vulnerabilities immediately"
echo "2. Update outdated packages, test thoroughly"
echo "3. For production, consider using Snyk or Dependabot"
echo "4. Regularly run 'yarn audit' before releases"
echo ""

echo "Audit complete!"
