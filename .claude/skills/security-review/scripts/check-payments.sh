#!/bin/bash
# Payment Security Checker for Cypress RealWorld App

set -e

echo "================================================"
echo "   Payment Security Review"
echo "================================================"
echo ""

RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m'

ISSUES=0

echo "💰 Checking payment security implementation..."
echo ""

# Find transaction-related files
echo "Finding payment/transaction files..."
TRANSACTION_FILES=$(find backend -type f -name "*transaction*" -o -name "*payment*" 2>/dev/null || true)
if [ -n "$TRANSACTION_FILES" ]; then
    echo -e "${GREEN}✅ Transaction files found:${NC}"
    echo "$TRANSACTION_FILES"
    echo ""
else
    echo -e "${YELLOW}⚠️  No explicit transaction files found${NC}"
    echo "Searching more broadly..."
    TRANSACTION_FILES=$(grep -r -l "transaction\|payment" --include="*.ts" backend/ 2>/dev/null | head -10 || true)
    echo "$TRANSACTION_FILES"
    echo ""
fi

# Check transaction validation
echo "================================================"
echo "1. Transaction Amount Validation"
echo "================================================"
echo ""

echo "Checking for server-side amount validation..."
AMOUNT_VALIDATION=$(grep -r -i "amount.*validation\|validate.*amount\|amount.*>.*0" --include="*.ts" backend/ 2>/dev/null || true)
if [ -n "$AMOUNT_VALIDATION" ]; then
    echo -e "${GREEN}✅ Amount validation found${NC}"
    echo "$AMOUNT_VALIDATION" | head -10
else
    echo -e "${RED}⚠️  Server-side amount validation not clearly identified${NC}"
    echo "   Ensure transaction amounts are validated server-side"
    ISSUES=$((ISSUES + 1))
fi

echo ""
echo "Checking for negative amount prevention..."
if grep -r "amount.*<.*0\|amount.*>.*0" --include="*.ts" backend/ > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Amount boundary checks found${NC}"
else
    echo -e "${YELLOW}⚠️  Ensure negative amounts are rejected${NC}"
    ISSUES=$((ISSUES + 1))
fi

echo ""
echo "Checking for maximum amount limits..."
if grep -r "max.*amount\|amount.*limit" --include="*.ts" backend/ > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Amount limits configured${NC}"
else
    echo -e "${YELLOW}⚠️  Consider implementing maximum transaction limits${NC}"
fi

# Check transaction integrity
echo ""
echo "================================================"
echo "2. Transaction Integrity"
echo "================================================"
echo ""

echo "Checking transaction data immutability..."
if grep -r "readonly\|const.*transaction" --include="*.ts" backend/ > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Transaction immutability patterns found${NC}"
else
    echo -e "${YELLOW}⚠️  Ensure transactions cannot be modified after creation${NC}"
fi

echo ""
echo "Checking for transaction ID generation..."
if grep -r "uuid\|shortid\|nanoid" --include="*.ts" backend/ > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Unique ID generation found${NC}"
else
    echo -e "${YELLOW}⚠️  Ensure transaction IDs are unique and unpredictable${NC}"
    ISSUES=$((ISSUES + 1))
fi

# Check authorization
echo ""
echo "================================================"
echo "3. Transaction Authorization"
echo "================================================"
echo ""

echo "Checking if users can only access their own transactions..."
USER_CHECK=$(grep -r "userId.*===\|user.*id.*==\|req\.user" --include="*.ts" backend/ 2>/dev/null | grep -i "transaction" || true)
if [ -n "$USER_CHECK" ]; then
    echo -e "${GREEN}✅ User ID checks found in transaction code${NC}"
    echo "$USER_CHECK" | head -10
else
    echo -e "${RED}⚠️  User authorization not clearly identified${NC}"
    echo "   CRITICAL: Users must only access their own transactions"
    ISSUES=$((ISSUES + 1))
fi

echo ""
echo "Checking for balance verification..."
if grep -r "balance\|account.*balance\|sufficient.*funds" --include="*.ts" backend/ > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Balance checks found${NC}"
else
    echo -e "${YELLOW}⚠️  Ensure sufficient balance checks before transactions${NC}"
    ISSUES=$((ISSUES + 1))
fi

# Check audit logging
echo ""
echo "================================================"
echo "4. Audit Logging"
echo "================================================"
echo ""

echo "Checking for transaction logging..."
LOGGING=$(grep -r "log\|logger" --include="*.ts" backend/ 2>/dev/null | grep -i "transaction" || true)
if [ -n "$LOGGING" ]; then
    echo -e "${GREEN}✅ Transaction logging found${NC}"
    echo "$LOGGING" | head -5
else
    echo -e "${YELLOW}⚠️  Transaction logging not clearly identified${NC}"
    echo "   All transactions should be logged with timestamp, user, amount"
    ISSUES=$((ISSUES + 1))
fi

echo ""
echo "Checking that sensitive data is not logged..."
SENSITIVE_LOGGING=$(grep -r "log.*password\|log.*card\|log.*cvv\|log.*pin" --include="*.ts" backend/ 2>/dev/null || true)
if [ -n "$SENSITIVE_LOGGING" ]; then
    echo -e "${RED}⚠️  Sensitive data might be logged:${NC}"
    echo "$SENSITIVE_LOGGING"
    ISSUES=$((ISSUES + 1))
else
    echo -e "${GREEN}✅ No obvious sensitive data in logs${NC}"
fi

# Check data protection
echo ""
echo "================================================"
echo "5. Sensitive Data Protection"
echo "================================================"
echo ""

echo "Checking for data masking..."
if grep -r "mask\|substring.*-4\|slice.*-4\|\\*\\*\\*\\*" --include="*.ts" . > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Data masking patterns found${NC}"
else
    echo -e "${YELLOW}⚠️  Implement masking for account numbers (show last 4 digits only)${NC}"
fi

echo ""
echo "Checking database encryption..."
echo "Note: Database encryption must be verified at infrastructure level"
if grep -r "encrypt\|cipher" --include="*.ts" backend/ > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Encryption references found${NC}"
else
    echo -e "${YELLOW}⚠️  Verify sensitive payment data is encrypted at rest${NC}"
fi

# Check idempotency
echo ""
echo "================================================"
echo "6. Idempotency & Duplicate Prevention"
echo "================================================"
echo ""

echo "Checking for duplicate transaction prevention..."
if grep -r "idempotent\|duplicate\|unique.*constraint" --include="*.ts" backend/ > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Duplicate prevention found${NC}"
else
    echo -e "${YELLOW}⚠️  Implement idempotency to prevent duplicate transactions${NC}"
    echo "   Use idempotency keys or transaction ID uniqueness"
    ISSUES=$((ISSUES + 1))
fi

# Check rate limiting
echo ""
echo "================================================"
echo "7. Rate Limiting"
echo "================================================"
echo ""

echo "Checking for transaction rate limiting..."
if grep -r "rate.*limit" --include="*.ts" backend/ > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Rate limiting configured${NC}"
else
    echo -e "${YELLOW}⚠️  Implement rate limiting on transaction endpoints${NC}"
    echo "   Prevents automated attacks and unusual activity"
    ISSUES=$((ISSUES + 1))
fi

# Check input validation
echo ""
echo "================================================"
echo "8. Input Validation"
echo "================================================"
echo ""

echo "Checking for transaction input validation..."
if grep -r "validator\|validate\|yup\|joi" --include="*.ts" backend/ > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Validation framework found${NC}"

    # Check for transaction-specific validation
    TRANS_VALIDATION=$(grep -r "transaction.*schema\|transaction.*validation" --include="*.ts" backend/ 2>/dev/null || true)
    if [ -n "$TRANS_VALIDATION" ]; then
        echo -e "${GREEN}✅ Transaction validation schemas found${NC}"
    else
        echo -e "${YELLOW}⚠️  Ensure transaction data is validated with schemas${NC}"
    fi
else
    echo -e "${RED}⚠️  Input validation framework not found${NC}"
    ISSUES=$((ISSUES + 1))
fi

# Database queries
echo ""
echo "================================================"
echo "9. SQL Injection Prevention"
echo "================================================"
echo ""

echo "Checking for parameterized queries..."
if grep -r "\\$1\|\\$2\|\\?" --include="*.ts" backend/ > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Parameterized query patterns found${NC}"
else
    echo -e "${YELLOW}⚠️  Ensure all transaction queries use parameterization${NC}"
fi

echo ""
echo "Checking for dangerous string concatenation in queries..."
CONCAT_QUERIES=$(grep -r "query.*+\|\\`.*\\$\{.*transaction" --include="*.ts" backend/ 2>/dev/null || true)
if [ -n "$CONCAT_QUERIES" ]; then
    echo -e "${RED}⚠️  Potential SQL injection risk:${NC}"
    echo "$CONCAT_QUERIES" | head -10
    ISSUES=$((ISSUES + 1))
else
    echo -e "${GREEN}✅ No obvious query concatenation found${NC}"
fi

# Summary
echo ""
echo "================================================"
echo "   Summary"
echo "================================================"
echo ""

if [ $ISSUES -eq 0 ]; then
    echo -e "${GREEN}✅ No major payment security issues detected!${NC}"
    echo ""
    echo "Manual review still recommended for:"
    echo "- Transaction workflow end-to-end"
    echo "- Race condition handling"
    echo "- Refund/reversal security"
    echo "- Payment provider integration (if external)"
else
    echo -e "${RED}⚠️  Found $ISSUES potential payment security issues${NC}"
    echo ""
    echo "Action Required:"
    echo "1. Review all findings above"
    echo "2. Implement missing security controls"
    echo "3. Test payment flows thoroughly"
    echo "4. Consider penetration testing for payment features"
fi

echo ""
echo "================================================"
echo "   Critical Payment Security Checklist"
echo "================================================"
echo ""
echo "Ensure you have:"
echo "  [ ] Server-side amount validation (positive, reasonable limits)"
echo "  [ ] User authorization (can only access own transactions)"
echo "  [ ] Balance verification before transactions"
echo "  [ ] Audit logging (all transactions logged)"
echo "  [ ] Idempotency (prevent duplicate charges)"
echo "  [ ] Rate limiting (prevent abuse)"
echo "  [ ] Input validation (strict schemas)"
echo "  [ ] SQL injection prevention (parameterized queries)"
echo "  [ ] Sensitive data masking (display only)"
echo "  [ ] Encryption at rest (database level)"
echo ""

exit 0
