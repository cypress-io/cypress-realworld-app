---
description: Commit recent changes with generated message
allowed-tools: Bash(git:*)
---

# Task: Commit Recent Changes

## Current Repository State

**Git Status:**
!`git status`

**Unstaged Changes:**
!`git diff`

**Staged Changes:**
!`git diff --cached`

**Current Branch:**
!`git branch --show-current`

**Recent Commits (for style reference):**
!`git log --oneline -10`

## Your Task

Based on the changes shown above, please:

1. **Analyze the changes** - Review what has been modified, added, or deleted

2. **Generate a commit message** following the repository's commit style:
   - Concise and descriptive
   - Focus on why the change was made
   - Follow existing conventions

3. **Stage and commit**:
   - Stage all relevant files with `git add`
   - Create the commit with your generated message
   - Include: `Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>`

4. **Verify** by running `git status` after committing

## Important Notes

- NEVER use `--no-verify` flag
- If there are no changes, inform the user
- If pre-commit hooks fail, fix issues and create a NEW commit (don't amend)
- Don't commit files with secrets (.env, credentials.json, etc.)
