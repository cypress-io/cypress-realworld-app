---
description: Commit changes and create a PR
allowed-tools: Bash
---

# Task: Commit Changes and Create Pull Request

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

**Base Branch:**
!`git remote show origin | grep "HEAD branch" | awk '{print $NF}'`

## Your Task

Based on the changes shown above, please:

1. **Review the changes** - Analyze what has been modified, added, or deleted

2. **Generate a commit message** following the style of recent commits in this repository:
   - Should be concise and descriptive
   - Focus on the "why" rather than just the "what"
   - Follow the repository's commit message conventions

3. **Stage and commit the changes**:
   - Stage all relevant files with `git add`
   - Create the commit with your generated message
   - Include the co-author line: `Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>`

4. **Create a new branch** (if not already on one):
   - Generate a descriptive branch name based on the changes
   - Format: `feature/description` or `fix/description` or `refactor/description`

5. **Push to remote**:
   - Push the new branch to origin with `-u` flag

6. **Create a Pull Request** using `gh pr create`:
   - Generate a clear PR title
   - Create a comprehensive PR description with:
     - ## Summary section (2-3 bullet points of what changed)
     - ## Changes section (detailed list of modifications)
     - ## Test Plan section (how to test these changes)
     - Include the footer: "🤖 Generated with [Claude Code](https://claude.com/claude-code)"
   - Target the base branch (develop or main)

7. **Return the PR URL** when complete

## Important Notes

- NEVER use `--no-verify` flag
- NEVER use `--force` when pushing
- If there are no changes to commit, inform the user
- If pre-commit hooks fail, address the issues and create a NEW commit (don't amend)
- Review all changes carefully before committing
