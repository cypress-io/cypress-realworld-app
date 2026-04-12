# Claude Code Configuration

This directory contains custom configurations, skills, commands, and agents for Claude Code.

## Directory Structure

```
.claude/
├── commands/           # Custom slash commands
│   ├── commit.md
│   └── commit-and-pr.md
├── skills/            # Skills (automatic invocation)
│   └── security-review/
│       ├── SKILL.md
│       ├── SECURITY_STANDARDS.md
│       ├── PAYMENT_SECURITY.md
│       ├── AUTH_SECURITY.md
│       └── scripts/
│           ├── audit-dependencies.sh
│           ├── scan-secrets.sh
│           ├── check-auth.sh
│           ├── check-payments.sh
│           └── run-all-scans.sh
└── agents/            # Subagents (explicit invocation)
    └── security-reviewer.md
```

---

## 🔒 Security Review System

### Option 1: Security Review Agent (Explicit)

**Location**: `.claude/agents/security-reviewer.md`

**Use when**: You want explicit, comprehensive security analysis

**How to invoke**:
```
Use the security-reviewer agent to scan my recent changes
```

```
Use the security-reviewer agent to do a full security audit before deployment
```

```
Use the security-reviewer agent to review authentication security
```

**What it does**:
1. Runs all automated security scans
2. Performs manual code review
3. Generates comprehensive security report
4. Provides specific fixes with code examples
5. Can implement fixes if requested

**Best for**:
- Pre-deployment security audits
- PR security reviews
- Comprehensive codebase analysis
- When you need a detailed report

### Option 2: Security Review Skill (Automatic)

**Location**: `.claude/skills/security-review/`

**Use when**: You casually mention security

**How it triggers** (automatically):
```
Review this code for security issues
```

```
Is this secure?
```

```
Check for vulnerabilities
```

**What it does**:
- Provides security guidance and checklists
- References security standards
- Runs quick scans
- Gives immediate feedback

**Best for**:
- Quick security checks
- During development
- Real-time security guidance

### Manual Security Scans

Run scans directly without Claude:

```bash
# Run all security scans
.claude/skills/security-review/scripts/run-all-scans.sh

# Individual scans
.claude/skills/security-review/scripts/audit-dependencies.sh
.claude/skills/security-review/scripts/scan-secrets.sh
.claude/skills/security-review/scripts/check-auth.sh
.claude/skills/security-review/scripts/check-payments.sh
```

---

## 📝 Custom Slash Commands

### `/commit`

Commits recent changes with AI-generated commit message.

**Usage**:
```
/commit
```

**What it does**:
1. Analyzes git status and changes
2. Generates meaningful commit message
3. Stages and commits changes
4. Follows repository's commit style

### `/commit-and-pr`

Full workflow: commit changes, create branch, push, and open PR.

**Usage**:
```
/commit-and-pr
```

**What it does**:
1. Commits changes with generated message
2. Creates feature branch (if needed)
3. Pushes to remote
4. Creates pull request with description
5. Returns PR URL

---

## 📚 Security Documentation

### SECURITY_STANDARDS.md
Team security standards and requirements:
- Authentication & authorization rules
- Password security requirements
- JWT token standards
- Secrets management
- API security guidelines
- Database security
- Compliance requirements

### PAYMENT_SECURITY.md
Payment-specific security guide:
- Transaction validation patterns
- Authorization checks
- Idempotency
- Audit logging
- Rate limiting
- Code examples (good vs bad)
- Common vulnerabilities
- Security testing

### AUTH_SECURITY.md
Authentication security guide:
- Password hashing (bcrypt)
- JWT validation
- Session management
- OAuth provider integration (Auth0, Okta, Cognito, Google)
- MFA implementation
- Authorization patterns
- Security best practices

---

## 🚀 Quick Start

### Run a Security Review

**Option A: Use the agent (recommended for comprehensive review)**
```
Use the security-reviewer agent to audit the codebase
```

**Option B: Mention security (quick check)**
```
Review my changes for security issues
```

**Option C: Run scans manually**
```bash
.claude/skills/security-review/scripts/run-all-scans.sh
```

### Create a Commit

```
/commit
```

### Create a PR

```
/commit-and-pr
```

---

## 🔧 Customization

### Add Custom Security Checks

Edit `.claude/skills/security-review/SKILL.md` to add project-specific checks.

### Create New Scan Scripts

1. Create script in `.claude/skills/security-review/scripts/`
2. Make it executable: `chmod +x script.sh`
3. Add to `run-all-scans.sh`

### Modify Security Standards

Update documentation in `.claude/skills/security-review/`:
- `SECURITY_STANDARDS.md` - General standards
- `PAYMENT_SECURITY.md` - Payment guidelines
- `AUTH_SECURITY.md` - Authentication patterns

### Create New Commands

Add `.md` files to `.claude/commands/`:

```markdown
---
description: Command description
allowed-tools: Read, Bash(git:*)
---

Command prompt here...
```

### Create New Agents

Add `.md` files to `.claude/agents/`:

```markdown
---
name: agent-name
description: Agent description
allowed-tools: Read, Bash, Edit, Write
---

Agent instructions here...
```

---

## 🎯 When to Use What

| Scenario | Use This | Why |
|----------|----------|-----|
| Pre-deployment security audit | Security-reviewer agent | Comprehensive, detailed report |
| PR security review | Security-reviewer agent | Full analysis with specific findings |
| Quick security check during dev | Security skill (auto) | Fast feedback, guidance |
| Manual security scan | Scripts in terminal | No AI, just automated tools |
| Commit recent changes | `/commit` command | Quick, follows repo style |
| Commit + create PR | `/commit-and-pr` command | Full workflow automation |
| Understanding security standards | Read docs in skills/security-review/ | Best practices, code examples |

---

## 📋 Security Review Checklist

Before deploying:
- [ ] Run security-reviewer agent
- [ ] Address all Critical findings
- [ ] Address all High findings
- [ ] Review Medium/Low findings
- [ ] Run `yarn audit` and fix vulnerabilities
- [ ] Check no secrets committed
- [ ] Verify authentication/authorization
- [ ] Test payment security
- [ ] Review documentation updates

---

## 🆘 Troubleshooting

### Scripts not executing
```bash
chmod +x .claude/skills/security-review/scripts/*.sh
```

### Agent not found
Verify file exists:
```bash
ls -la .claude/agents/security-reviewer.md
```

### Skill not triggering
Skills trigger automatically on keywords. Try explicitly:
```
Use the security-review skill to check this code
```

### Scans failing
Ensure you're in project root:
```bash
cd /path/to/cypress-realworld-app
```

---

## 📖 Resources

- **OWASP Top 10**: https://owasp.org/www-project-top-ten/
- **Node.js Security**: https://nodejs.org/en/docs/guides/security/
- **Express Security**: https://expressjs.com/en/advanced/best-practice-security.html
- **JWT Best Practices**: https://tools.ietf.org/html/rfc8725

---

## 🤝 Contributing

To improve security tooling:

1. Add new scan scripts to `skills/security-review/scripts/`
2. Update documentation with new patterns
3. Add security test cases
4. Share findings with team

---

## 📞 Support

- Report issues: Create GitHub issue
- Questions: Ask in team chat
- Security incidents: Follow incident response procedure

---

**Last Updated**: 2024-01-17
**Maintained By**: Development Team
