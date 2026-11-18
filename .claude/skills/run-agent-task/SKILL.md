---
name: run-agent-task
description: Run one engineering cycle on this repo. It takes the oldest open GitHub issue labeled agent-ready and claims it. As Lead, it plans the work. A Builder subagent implements it in its own git worktree and ports, then the Reviewer subagent verifies the exact commit. The run ends in a draft PR or a recorded blocker, plus a run record and scorecard. Use when asked to process the next agent-ready issue or run the agent pipeline, for /run-agent-task, or from the scheduled intake routine. It never merges.
---

# run-agent-task

You are the Lead (and the "Chief" from the source guide). You take **one** issue through
plan → build → review → draft PR, and you leave records a human can audit in minutes. You don't write
the change yourself; the Builder does. You don't judge it yourself; the Reviewer does. Your job is
scope, handoffs, checking claims, and the record.

Helper: `node .claude/skills/run-agent-task/scripts/runs.mjs <command>` (called `runs.mjs` below). It
handles intake, ownership labels and comments, port allocation, run records, and the scorecard. Run
records live in `.agent-runs/<run-id>/` in the main checkout (gitignored).

## Hard rules

- **One issue per run.** If no issue qualifies, report why and stop, without creating a worktree or
  launching an agent.
- **Never merge, and never expand scope.** If the work needs a file outside the issue's Scope, or a
  decision the issue doesn't make, stop the run as blocked. Don't decide for the human.
- **Two correction rounds at most.** If the third review still fails, the run ends blocked.
- **A verdict is only valid for the commit it names.** Push only when the branch head equals the
  reviewed SHA.
- **No attribution lines.** Commits and PR bodies never get `Co-Authored-By` or "Generated with" lines.
  Tell the Builder this too.
- **Unknown values stay `null`.** Never estimate a number into the run record. Write a note instead.
- **Record every human touch.** Each time the human clarifies a requirement, restarts work, or corrects
  an agent, run `runs.mjs note <run> intervention "<what and why>"`.

## 0. Preflight

Run these from the main checkout:

```bash
git status --porcelain            # must be empty for tracked files
gh auth status                    # must be logged in
node .claude/skills/verify-rwa/scripts/rwa.mjs status   # note any active runs
```

## 1. Intake

```bash
node .claude/skills/run-agent-task/scripts/runs.mjs pick
```

`pick` is read-only. It looks at open `agent-ready` issues, oldest first, and skips any issue that:

- has a busy label (`agent-in-progress`, `agent-pr-open` or `agent-blocked`)
- has an assignee
- has a linked open PR
- already has an `agent/issue-N-*` branch, on origin or locally
- has an unfinished local run
- has an empty template section (Why, Scope, Acceptance criteria, Base branch), or a base branch that isn't on origin

If `picked` is null, report the `skipped` list and stop.

## 2. Claim

```bash
node .claude/skills/run-agent-task/scripts/runs.mjs claim <issue>
```

`claim` re-checks the issue, picks a free port base (3100–3900), and creates the run record. Then it
adds `agent-in-progress` and posts the ownership record as an issue comment. Note the printed
`run_id`, `branch`, `worktree`, `base` and `ports`.

## 3. Plan (Lead)

Read the issue, then the code and tests it names. Also read the relevant `verify-rwa` feature maps
(`.claude/skills/verify-rwa/features/`). Then write `.agent-runs/<run>/handoff.md`:

```markdown
# Handoff: <task>

| Field           | Value                                                     |
| --------------- | --------------------------------------------------------- |
| Issue           | <url>                                                     |
| Run             | <run_id>                                                  |
| Worktree        | <worktree>                                                |
| Branch          | <branch> (from <base> @ <short sha>)                      |
| Ports           | frontend <N>, API <N+1>, so start with `start --port <N>` |
| Merge authority | Human only                                                |

## Lead findings

<what the code does today, traps from the feature maps, and the exact lines involved>

## Acceptance criteria

| #   | Expected | Proven by |
| --- | -------- | --------- |

## File ownership

- **You own:** <the issue's Scope, exactly>
- Everything else is read-only.

## Boundaries

<the issue's Boundaries, plus: commit locally, no attribution lines, don't push, stop the app when done>
```

Make every acceptance criterion testable, and name a check that actually covers the changed file. For
example, `tsc -p cypress/tsconfig.json` doesn't cover `cypress.config.ts`. If you can't make a
criterion testable without guessing what the human wants, stop with
`runs.mjs finish <run> --blocked "needs clarification: <question>"`.

## 4. Environment

```bash
git fetch origin <base> && git worktree add --no-track <worktree> -b <branch> origin/<base>
cd <worktree> && yarn install --frozen-lockfile --prefer-offline   # about 3.5 min; run it in the background
```

`--no-track` matters: with the base as upstream, a bare `git push` from the worktree would land on the
base branch. The worktree path must stay short (Windows MAX_PATH), and `claim` already picks one next to the main
checkout.

## 5. Build

Launch the Builder as a **background** subagent. Use the `builder` agent type if it's loaded.
Otherwise use `general-purpose`, and start the prompt with "Read `<main checkout>/.claude/agents/builder.md`
and follow it exactly." Give the role file as an **absolute path in the main checkout**: the
worktree's base branch may predate the pipeline, so its copy can be missing or old. Record the launch
time (`date -u`) so you can compute the agent's minutes. Pass:

- the handoff path
- the worktree
- the port base
- `Round: 0`
- "no attribution lines in commits"

When it returns:

1. **Save its report** under `## Builder handoff (round N)` in `handoff.md`. Subagents can't always
   write report files, so you save it.
2. **Record its cost:** `runs.mjs agent <run> builder <round> <minutes> <tokens> <tool_calls>`. Take
   the numbers from the agent's result, and use `null` for any that weren't reported.
3. **Check its claims.** Do this before the review, not instead of it:
   - The head SHA exists, and `git -C <worktree> status --porcelain` is empty.
   - `git -C <worktree> diff --stat <base-sha>..<head>` touches only owned files.
   - Each check it reports exists in its `.verify-runs/<runId>/` folder with that exit code.
   - Record any false claim with `runs.mjs note <run> defect "<claim>"`.

## 6. Review

Launch the Reviewer as a **background** subagent: the `reviewer` agent type, or `general-purpose`
told to follow `<main checkout>/.claude/agents/reviewer.md` (absolute path, as for the Builder). Pass:

- the acceptance criteria
- the exact head and base SHAs
- the Builder's evidence path
- the worktree and port base

Ask it to run a can-fail check for every new or changed test.

When it returns, save its report under `## Reviewer verdict (round N)` in the handoff. Then run
`runs.mjs agent <run> reviewer <round> <minutes> <tokens> <tool_calls> <VERDICT>`.

- **PASS:** go to step 7.
- **FAIL:** confirm each finding yourself, in the code or the evidence. For each confirmed finding, run
  `runs.mjs note <run> defect "<finding>"`. If you were wrong about something in the handoff, run
  `runs.mjs note <run> lead_mistake "<what>"`. Then send _only_ the confirmed findings back to the same
  Builder with `SendMessage`, and give it the next round number. Run
  `runs.mjs set <run> correction_rounds <n>`, then review again. After round 2 fails, run
  `runs.mjs finish <run> --blocked "<summary>"` and stop.
- **BLOCKED:** record what's missing with `runs.mjs finish <run> --blocked "<what>"` and stop. Don't
  work around a missing check by skipping it.

## 7. Deliver

1. **Confirm the head.** `git -C <worktree> rev-parse HEAD` must equal the reviewed SHA.
2. **Record the result:**
   ```bash
   runs.mjs set <run> reviewed_sha '"<sha>"'
   runs.mjs set <run> head_sha '"<sha>"'
   runs.mjs set <run> verdict '"PASS"'
   runs.mjs set <run> acceptance '{"total":N,"met":N}'
   runs.mjs set <run> evidence '["<worktree>/.verify-runs/<id>/", ...]'
   ```
3. **Push the branch:** `git -C <worktree> push -u origin <branch>`.
4. **Open a draft PR** against the issue's base branch. Use the REST API, because `gh pr edit` breaks on
   older gh versions:

   ```bash
   gh api repos/<owner>/<repo>/pulls -f title="<title>" -f head=<branch> -f base=<base> -F draft=true -F body=@<body-file>
   ```

   The body starts with `Refs #<issue>`. It then gives:

   - the change
   - an acceptance-criteria → evidence table
   - the reviewed SHA
   - the correction rounds
   - out-of-scope findings
   - "Merge authority: human"

   No attribution lines.

5. **Close out the issue:** `runs.mjs finish <run> --pr <url>`. This swaps the label to
   `agent-pr-open` and comments the result on the issue.
6. **Read the CI check once** (don't poll), and record it with `runs.mjs set <run> ci '{"check":"auth-verification","conclusion":"<state>"}'`.
   If it's still running, record `"in_progress"` and say so in the report.

## 8. Report

```bash
node .claude/skills/run-agent-task/scripts/runs.mjs report <run>
node .claude/skills/run-agent-task/scripts/runs.mjs scorecard
```

Give the human the report. It has the issue and PR links, the reviewed commit, the checks and evidence,
the correction rounds, the human interventions, and any unresolved blockers, with unknowns as `null`.
Ask them to time their own review and record it:
`runs.mjs review-time <run> <minutes>`. That's the one measurement only the human can make.

Leave the worktree in place until the PR is merged or closed. Then run `git worktree remove <worktree>`.

## If the run stalls

| Symptom                                     | What to do                                                                                                                                         |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| The app won't start in the worktree         | Read `rwa.mjs` doctor output and `dev.log`, and reproduce the failure before changing anything. Startup problems are never fixed in product code   |
| Another run touches the same issue or files | `pick` and `claim` should prevent this. If it happens, find the owner from the issue comments, stop the duplicate, and note which branch continues |
| The Reviewer can't run a required check     | The verdict stays BLOCKED. Record the missing dependency, port or permission                                                                       |
| A new commit appears after PASS             | Send the new SHA back to the Reviewer. Never push a head that wasn't reviewed                                                                      |
| `pick` finds nothing                        | Report the skipped issues and their reasons. That's a normal outcome, not an error                                                                 |

## Running it on a schedule

Only set up a schedule after a manual run has gone smoothly, and only with the human's approval. Each
scheduled run uses tokens, even when it finds nothing. The routine prompt is:

> In the cypress-realworld-app checkout, use the run-agent-task skill to process at most one
> agent-ready issue. If none qualifies, stop without launching an agent. Never merge or expand scope.
> Report the issue, PR and run-record paths.
