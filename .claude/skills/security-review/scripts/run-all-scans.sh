#!/bin/bash
# Master Security Scanner - Run all security checks

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"

cd "$PROJECT_ROOT"

echo "========================================================"
echo "   Comprehensive Security Review"
echo "   Cypress RealWorld App"
echo "========================================================"
echo ""
echo "Project: $PROJECT_ROOT"
echo "Date: $(date)"
echo ""

# Make all scripts executable
chmod +x "$SCRIPT_DIR"/*.sh

# Run each security scan
echo ""
echo "========================================="
echo "   SCAN 1/4: Dependency Vulnerabilities"
echo "========================================="
echo ""
bash "$SCRIPT_DIR/audit-dependencies.sh"

echo ""
echo ""
echo "========================================="
echo "   SCAN 2/4: Hardcoded Secrets"
echo "========================================="
echo ""
bash "$SCRIPT_DIR/scan-secrets.sh"

echo ""
echo ""
echo "========================================="
echo "   SCAN 3/4: Authentication Security"
echo "========================================="
echo ""
bash "$SCRIPT_DIR/check-auth.sh"

echo ""
echo ""
echo "========================================="
echo "   SCAN 4/4: Payment Security"
echo "========================================="
echo ""
bash "$SCRIPT_DIR/check-payments.sh"

# Final summary
echo ""
echo ""
echo "========================================================"
echo "   FINAL SUMMARY"
echo "========================================================"
echo ""
echo "All security scans completed!"
echo ""
echo "Next steps:"
echo "1. Review all findings above"
echo "2. Prioritize Critical and High severity issues"
echo "3. Create tickets for Medium/Low issues"
echo "4. Fix security issues before deploying"
echo "5. Re-run scans after fixes"
echo ""
echo "For production deployment, also consider:"
echo "  - External security audit / penetration testing"
echo "  - SAST/DAST tools (Snyk, SonarQube, etc.)"
echo "  - Container scanning (if using Docker)"
echo "  - Infrastructure security review"
echo "  - Compliance checks (GDPR, PCI-DSS if applicable)"
echo ""
echo "========================================================"
echo ""
