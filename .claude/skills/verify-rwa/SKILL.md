---
name: verify-rwa
description: Launch the Cypress Real World App (RWA), confirm the running instance is yours, exercise a feature with the repo's own Cypress tests, and return a PASS / FAIL / BLOCKED verdict backed by saved evidence (commands, exit codes, logs, video). Use this whenever you change, review, or debug anything in this repository and need to show it works in the running app rather than only that it type-checks, including requests like "verify", "check sign-in still works", "run the auth tests", "reproduce this bug", "review this PR or commit", or before handing work to a reviewer.
---

# Verify RWA

A passing type check does not mean the feature works. This skill makes you prove it in the running
app and leave evidence that someone else can inspect without re-running anything.

All the fragile parts (ports, process cleanup on Windows, log capture, retry detection) live in one
helper script, so you don't have to rebuild them each time. Run it from the repo root:

```bash
node .claude/skills/verify-rwa/scripts/rwa.mjs start                     # launch + doctor (add --port N for parallel runs)
node .claude/skills/verify-rwa/scripts/rwa.mjs exec types -- yarn types  # any command, logged
node .claude/skills/verify-rwa/scripts/rwa.mjs cypress cypress/tests/ui/auth.spec.ts
node .claude/skills/verify-rwa/scripts/rwa.mjs stop                      # always, even after failures
```

`status` shows whether a run is active. `doctor` re-checks a running instance.

## 1. Launch

Prerequisites, checked once per machine:
- Dependencies are installed (`node_modules/` exists). If not, run `yarn install --frozen-lockfile`.
- Node 22 or 24 (`.node-version` pins 22.20.0, and `engines` also allows 24).
- Yarn Classic 1.x. Corepack picks 1.22.22 from `packageManager`. Yarn 2 and later are not supported.
- Cypress binary: run `yarn cypress verify` if Cypress has never run on this machine.

`start` refuses to run if another verify run is active or if its ports are busy (default 3000 for the
frontend and 3001 for the API; `--port N` uses N and N+1). Next it records the commit, branch,
uncommitted files, and ports. It then runs the same steps as `yarn dev`: reseed `data/database.json`
from `data/database-seed.json`, then start Vite (frontend) and Express via nodemon (API) under
`concurrently`. The ports are explicit and Vite gets `--strictPort`. It waits up to 150 s for both
services, then runs the doctor.

| `start` exit | Meaning | What you do |
|---|---|---|
| 0 | Ready and healthy | Drive |
| 2 | A run is already active | Reuse it (`status`), or `stop` it if it's yours and stale |
| 3 | A port is held by something this run didn't start | **BLOCKED**. Report the owner and don't kill it |
| 4 | App didn't become ready | `stop`, then **BLOCKED** with the `dev.log` tail it printed |
| 5 | Started, but doctor failed | Read the failed check, then `stop`. Don't trust results from this instance |

## 2. Doctor

The doctor answers "is the thing I'm about to test actually my app, and is it usable?". It checks:
- **Ownership:** the processes listening on the run's frontend and API ports belong to this run's recorded process tree
  (Windows) or process group (Linux/macOS). A stale server from another session would otherwise
  make your tests pass or fail for reasons unrelated to your change.
- **API:** `GET <api port>/testData/users` returns seeded users.
- **Frontend:** `GET <frontend port>/signin` serves the app shell.
- **Port:** Vite's own log says it bound the run's frontend port. Vite's config is not `strictPort`,
  so anything that starts it without `--strictPort` can quietly move to another port while tests keep
  hitting the old one.

Run `doctor` again whenever results look strange, after a long pause, or after editing
`backend/` (nodemon restarts the API).

## 3. Drive

Start with the feature map. It says which spec covers which behavior, the selectors and helpers to
reuse, and the ways a check can be misleading:

| Feature | Map | Main spec |
|---|---|---|
| Authentication (sign-in, sign-up, sign-out) | [features/authentication.md](features/authentication.md) | `cypress/tests/ui/auth.spec.ts` |
| Bank accounts (list, create, soft delete, empty state) | [features/bank-accounts.md](features/bank-accounts.md) | `cypress/tests/ui/bankaccounts.spec.ts` |

- **Existing behavior:** run the relevant spec with `cypress <spec...>`. It runs headless and saves
  video and failure screenshots into the evidence folder. Every video from the run is kept.
- **New behavior that is part of the change:** the new or changed spec under `cypress/tests/ui/` belongs
  in the diff. Write it, then run it the same way. Reuse `cy.getBySel`, `cy.login`, and `cy.database`
  rather than raw selectors.
- **One-off checks you don't want in the repo:** put the spec in `.verify-runs/<runId>/scratch/` and
  run `cypress .verify-runs/<runId>/scratch/<file>.spec.ts`. The helper points Cypress at that folder.
  Keep any probe scripts you write there too, so the evidence folder is self-contained.
- **Component tests:** `cypress src/components/SignInForm.cy.tsx -- --component`. Arguments after `--`
  go straight to `cypress run`.
- **Other commands** (`yarn types`, `yarn lint`, unit tests): `exec <name> -- <command>` so they're logged
  with their exit codes. Re-running a check keeps both logs.
- **Type-check what you changed.** `yarn types` uses the root `tsconfig.json`, which does **not** include
  `cypress/`, so it passes even when a spec has type errors. For changed Cypress specs, run
  `exec types-cypress -- npx tsc -p cypress/tsconfig.json --noEmit`. To lint only the changed files
  (faster than the full `yarn lint`), run `exec lint -- "npx eslint <files> && npx prettier --check <files>"`.
- **API probes** (curl examples in the feature map) are good supporting evidence. They don't replace a
  browser-level check of a UI change.

Run one test command at a time per app instance. Every UI spec reseeds the database in
`beforeEach` (`cy.task("db:seed")`), so two concurrent runs would overwrite each other's data.

### Parallel runs

To work on two tasks at once, give each one its own **git worktree** and its own **port base**. Each
worktree has its own `data/database.json` and `.verify-runs/`, so data and evidence stay separate.

```bash
git worktree add ../wt-a -b <branch-a>      # keep the path short on Windows
cd ../wt-a && yarn install --frozen-lockfile --prefer-offline
node .claude/skills/verify-rwa/scripts/rwa.mjs start --port 3100    # API on 3101
node .claude/skills/verify-rwa/scripts/rwa.mjs cypress cypress/tests/ui/auth.spec.ts
```

The `cypress` command points Cypress at the run's ports (`baseUrl` and `expose.apiUrl`), so don't
call `yarn cypress:run` directly on non-default ports. Its pre-hook waits on 3000/3001. Use one verify
run per worktree at a time.

## 4. Evidence and verdict

Everything goes to `.verify-runs/<runId>/` (git-ignored; runId is UTC time):
`run.json` (commit, branch, recorded processes), `dev.log`, `doctor.json`, one `<name>.log` per
check, `commands.json` (exit codes, durations, parsed Cypress counts), `videos/`, `screenshots/`
(failures only), and `summary.md`, which `stop` writes.

A verdict covers only the code that ran: the commit and uncommitted files recorded in `run.json`.
Before you report, check that the change you were asked about is actually in that code (`git status`,
`git diff`, `git log -- <file>`). If it isn't, say so plainly. Report BLOCKED for that change, and
present whatever passed as a baseline, not as proof the change works.

Decide the verdict from the evidence, not from how the run felt:
- **PASS:** the doctor was healthy, every required check exited 0, and no test needed a retry.
- **FAIL:** a required check failed against the code under test. Give the failing test, the error
  line, and the screenshot or video path.
- **BLOCKED:** the required checks couldn't run (busy port, startup failure, missing dependency). Say
  exactly what was missing. A check that didn't run never counts as passing.

`cypress.config.ts` retries failed tests twice in run mode, which can hide flakiness. The helper flags
any test that needed a retry. Such a test isn't a clean pass: report FAIL (flaky). The exception is
when you show the same flake on the base commit, in which case it's pre-existing and you note it.

Report in this shape:

```
Verdict: PASS | FAIL | BLOCKED
Commit: <sha> on <branch>; uncommitted at start: <files or "none">
Evidence: .verify-runs/<runId>/summary.md
Checks:
  | check | command | exit | result |
Behavior confirmed: <what a user would see, and which test or probe showed it>
Not verified: <anything skipped and why, e.g. third-party auth specs need credentials>
```

## 5. Cleanup

Always run `stop`, including after failures and BLOCKED results. It:
- stops only the processes this run recorded (it never touches a port owner it didn't start)
- waits for the run's ports to free up
- restores `data/database.json` if it was clean at start. The dev seeding rewrites it, and it must never
  be committed by accident.
- lists any other files that changed during the run, then writes `summary.md`

Generated files that may remain are all git-ignored and harmless: `src/aws-exports.js`,
`aws-exports-es5.js`, `.husky/_/`.

## CI

`.github/workflows/auth-verification.yml` runs the same core checks on every pull request (`yarn types`,
the Cypress-spec type check, and `auth.spec.ts` in Chrome) and uploads screenshots and videos as an
artifact. Its job name, `auth-verification`, is the status check to require before merging. It doesn't
replace a local verify run: CI tests the PR head commit on Linux, while this skill gives you a doctor,
ownership checks, and evidence on your own machine before you hand off. When you add a spec to the
feature map, also add it to the workflow's `spec` list if it should gate merges.

## Gotchas

- **Windows path length:** keep the clone at a short path (for example `C:\code\...`).
  Deep folders fail with `Filename too long` during clone and install.
- **Pre-existing warnings are noise, not regressions:** the Electron browser deprecation, the Vite
  CommonJS warning, and outdated `caniuse-lite`. The "experimentalStudio option was removed" warning
  is being removed by `chore/remove-experimental-studio` (task A), so expect it only on commits
  without that change.
- **Third-party sign-in** (Auth0, Okta, Cognito, Google) needs real credentials in `.env` and a different
  `yarn dev:*` script. This skill covers the default local sign-in only, so list those specs under "Not verified".

## Adding a feature to the map

Copy the structure of `features/authentication.md`: starting state, routes, API, selectors, helpers,
behaviors with their covering tests, and misleading results or failure conditions. Write down only
selectors and commands you have actually seen in the code or run yourself, so the next agent can trust
the map without re-deriving it.
