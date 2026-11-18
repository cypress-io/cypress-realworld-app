# Feature map: bank accounts

Listing, creating, and soft-deleting a signed-in user's bank accounts, plus the onboarding dialog
that asks for one when the list is empty. Last verified at commit `3d8b9d0` (4 of 4 tests in
`bankaccounts.spec.ts` passed with no retries, run on ports 3200/3201). Scratch and API probes were
re-run at `68e8915`, whose app code is identical to `3d8b9d0` (only skill docs differ).

## Starting state

- App running and healthy through `rwa.mjs start` (add `--port N` for a parallel worktree).
- Database seeded from `data/database-seed.json`: 5 users and 5 bank accounts, one per user, none
  deleted. The first seeded user, `Heath93` (`uBmeaz5pX`), owns "Waters, King and O'Reilly Bank"
  (`pgl34JtnfhX`). List them with `GET http://localhost:3001/testData/bankaccounts`.
- Each test in `bankaccounts.spec.ts` reseeds (`cy.task("db:seed")`), then signs in as the first seeded
  user with `cy.loginByXstate`. `redirectHomeAfterLogin` in `authMachine.ts` then moves from `/signin` to
  `/` (a scratch probe asserted the path), so each test starts on `/` with one active bank account.

## Routes and code

| Route | What it is | Code |
|---|---|---|
| `/bankaccounts` | List of the user's accounts and a Create button. Shows "No Bank Accounts" when the list is empty | `src/containers/BankAccountsContainer.tsx`, `src/components/BankAccountList.tsx`, `src/components/BankAccountItem.tsx`, `src/components/EmptyList.tsx` |
| `/bankaccounts/new` | Create form. Same container: it renders the form when `match.url === "/bankaccounts/new"` | `src/components/BankAccountForm.tsx` |
| (routing) | One `PrivateRoute path="/bankaccounts*"` covers both pages | `src/containers/PrivateRoutesContainer.tsx` |
| (state) | `bankAccountsMachine` is `dataMachine("bankAccounts")`: `idle → loading → success.withData / success.withoutData`. `CREATE` and `DELETE` go to `creating` / `deleting`, then refetch (`loading`). One instance, created in `App.tsx`, is shared by the page and the onboarding dialog | `src/machines/bankAccountsMachine.ts`, `src/machines/dataMachine.ts`, `src/containers/App.tsx` |
| (dialog) | Onboarding dialog. Opens when the list fetch succeeds with no accounts and onboarding isn't done; step two renders `BankAccountForm` with `onboarding` | `src/containers/UserOnboardingContainer.tsx`, `src/machines/userOnboardingMachine.ts` |
| (nav) | "Bank Accounts" link in the side drawer | `src/components/NavDrawer.tsx` |

Form validation (Yup, in `BankAccountForm.tsx`; checks string length only, not digits):

| Field | Rule | Message |
|---|---|---|
| `bankName` | required, min 5 | "Enter a bank name", "Must contain at least 5 characters" |
| `routingNumber` | required, length exactly 9 | "Enter a valid bank routing number", "Must contain a valid routing number" |
| `accountNumber` | required, length 9 to 12 | "Enter a valid bank account number", "Must contain at least 9 digits", "Must contain no more than 12 digits" |

On submit the form sends `CREATE` to the machine and, outside onboarding, pushes `/bankaccounts` right
away. It doesn't wait for the mutation to finish.

## API

For bank accounts the UI uses **GraphQL only**: `POST http://localhost:${VITE_BACKEND_PORT}/graphql` with
an `operationName` (schema `backend/graphql/schema.graphql`, resolvers `backend/graphql/resolvers/`).
The `/graphql` route is **not** behind `ensureAuthenticated`; resolvers read `ctx.user` from the session.
The schema has no single-account query.

| Operation | Result |
|---|---|
| `ListBankAccount` → `listBankAccount` | The signed-in user's accounts, **including soft-deleted ones**. Signed out: HTTP 200 with `errors` ("TypeError: Cannot read properties of undefined (reading 'id')") and `data.listBankAccount: null` (probe) |
| `CreateBankAccount(bankName, accountNumber, routingNumber)` | The new account. The schema requires all three as `String!`, but nothing else is checked: `""` and 1-character values were accepted (probe) |
| `DeleteBankAccount(id)` | Sets `isDeleted: true` and returns `true`. Doesn't check the session or ownership, and returns `true` for an unknown id (probes) |

REST on the API port (`backend/bankaccount-routes.ts`) is used by `cypress/tests/api/api-bankaccounts.spec.ts`,
not by the UI. Without a session, all four routes return 401 `{"error":"Unauthorized"}` (probe):

| Endpoint | Result (signed in) |
|---|---|
| `GET /bankAccounts` | 200 `{results}`, the signed-in user's accounts |
| `GET /bankAccounts/:bankAccountId` | 200 `{account}` for **any** user's account (no ownership check; probe) |
| `POST /bankAccounts` `{bankName, accountNumber, routingNumber}` | 200 `{account}`. The validator only checks that each field is a string, so `""` is accepted (probe) |
| `DELETE /bankAccounts/:bankAccountId` | 200, soft delete of **any** user's account (no ownership check; probe) |
| `POST /testData/seed`, `GET /testData/bankaccounts` | Test-only reseed and lookup (mounted when `NODE_ENV` is `test` or `development`) |

## Selectors

Use `cy.getBySel("<name>")` (`[data-test=<name>]`) or `cy.getBySelLike("<part>")` (`[data-test*=<part>]`).

| Element | `data-test` |
|---|---|
| Side-drawer link (on mobile widths, open `sidenav-toggle` first) | `sidenav-bankaccounts` |
| Create button on the list page (a link to `/bankaccounts/new`) | `bankaccount-new` |
| List (only rendered when there is at least one account) | `bankaccount-list` |
| One row; text is the bank name plus "(Deleted)" when soft-deleted | `bankaccount-list-item-<id>` (use `getBySelLike("bankaccount-list-item")`) |
| Delete button in a row (not rendered for deleted accounts) | `bankaccount-delete` |
| Empty state | `empty-list-header` ("No Bank Accounts"), `empty-list-children` |
| Form and inputs (MUI wrappers; use `.find("input")` to clear, focus, or blur) | `bankaccount-form`, `bankaccount-bankName-input`, `bankaccount-routingNumber-input`, `bankaccount-accountNumber-input` |
| Save button (disabled while the form is invalid or submitting) | `bankaccount-submit` |
| Field validation text (ids, not data-test; only in the DOM while there is an error) | `#bankaccount-bankName-input-helper-text`, `#bankaccount-routingNumber-input-helper-text`, `#bankaccount-accountNumber-input-helper-text` |
| Onboarding dialog | `user-onboarding-dialog`, `user-onboarding-dialog-title`, `user-onboarding-dialog-content`, `user-onboarding-next`, `user-onboarding-logout` |
| Notification count in the top bar | `nav-top-notifications-count` |

## Helpers

- `cy.loginByXstate(username, password?)` (`cypress/support/commands.ts`) visits `/signin`, sends
  `LOGIN` to `window.authService` with the default password (`env.defaultPassword`), waits for
  `POST /login`, then asserts `list-skeleton` doesn't exist. That's an absence check, so it doesn't prove
  the home page has finished loading. No sign-in UI is exercised.
- `cy.database("find", "users")` returns the first seeded user; `cy.database("filter", "bankaccounts")`
  returns all accounts (the API spec uses it).
- GraphQL aliases: the spec's `beforeEach` intercepts `POST ${Cypress.expose("apiUrl")}/graphql` and
  sets `req.alias` from `operationName`: `@gqlListBankAccountQuery`, `@gqlCreateBankAccountMutation`,
  `@gqlDeleteBankAccountMutation`. Copy that block for new tests. It reads `apiUrl`, which the helper
  points at the run's API port. See the stale-wait trap below before relying on `@gqlListBankAccountQuery`.
- `isMobile()` (`cypress/support/utils.ts`) is true when `viewportWidth` is below
  `mobileViewportWidthBreakpoint` (414). The default viewport is 1280, so the sidenav branch only runs
  with a mobile viewport.
- `cy.visualSnapshot(name)` wraps `cy.percySnapshot`. `@percy/cypress` skips the snapshot unless the
  Percy CLI is running (`percy exec`), and `rwa.mjs` doesn't start it, so it asserts nothing in these runs.

## Behaviors

| Behavior | Expected result | Covered by |
|---|---|---|
| Create from the list page | Sidenav → Create → `/bankaccounts/new`; after Save, 2 rows and the second contains "The Best Bank" | `bankaccounts.spec.ts` "creates a new bank account" |
| Form validation | All 7 messages in the validation table appear (the spec blurs each field); a 9-digit routing number and 9- or 12-digit account numbers clear the helper text; Save is disabled at the end with errors showing | `bankaccounts.spec.ts` "should display bank account form errors" |
| Soft delete | After `DeleteBankAccount`, a row contains "Deleted" | `bankaccounts.spec.ts` "soft deletes a bank account" |
| Empty list | `bankaccount-list` absent, `empty-list-header` says "No Bank Accounts", onboarding dialog visible | `bankaccounts.spec.ts` "renders an empty bank account list state with onboarding modal" (the list response is **stubbed** to `[]`) |
| Create during onboarding | Next → "Create Bank Account" → Save → "Finished" / "You're all set!" → transaction list | `auth.spec.ts` "should allow a visitor to sign-up, login, and logout" (not run for this map) |
| Database functions | List by user, get by id, create, soft delete | `src/__tests__/bankaccounts.test.ts` (Vitest, not run for this map) |
| Letters in routing / account numbers | Accepted: "abcdefghi" in both passes validation, Save is enabled, and both values are stored as typed (mutation response and `/testData/bankaccounts`) | No repo test. Scratch spec passed with no retry on 2026-11-17 (run `20261118-000930`) |
| Deleting the user's only account | Row shows "(Deleted)" and its Delete button is gone. After a fresh page load, `listBankAccount` returns that one account with `isDeleted: true`, the list renders it, and the onboarding dialog stays closed on `/bankaccounts` and on `/` (the deleted account still counts as data) | No repo test. Scratch spec passed with no retry on 2026-11-17 (run `20261118-000930`) |
| Deleting another user's account (REST, signed in) | 200 and the other user's account becomes `isDeleted: true` | No repo test. API probe on 2026-11-17 (run `20261117-234821`) |
| Deleting any account over GraphQL while signed out | 200 `{"data":{"deleteBankAccount":true}}` and the account becomes `isDeleted: true` | No repo test. API probe on 2026-11-17 (run `20261117-234821`) |

API spec coverage (`cypress/tests/api/api-bankaccounts.spec.ts`, not run for this map). Each test signs
in as the first seeded user with `cy.loginByApi`:

| Test (context → it) | What it asserts |
|---|---|
| "GET /bankAccounts" → "gets a list of bank accounts for user" | 200; `results[0].userId` is the signed-in user |
| "GET /bankAccounts/:bankAccountId" → "gets a bank account" | 200; `account.userId` is the signed-in user (it reads the first seeded account, which belongs to that user) |
| "POST /bankAccounts" → "creates a new bank account" | 200; `account.id` is a string; `account.userId` is the signed-in user |
| "DELETE /contacts/:bankAccountId" → "deletes a bank account" (calls `DELETE /bankAccounts/:id` despite the title) | 200 only. It doesn't check `isDeleted` |
| "/graphql" → "gets a list of bank accounts for user" | 200; no `errors`; `listBankAccount[0].userId` is the signed-in user |
| "/graphql" → "creates a new bank account" | 200; `createBankAccount.userId` is the signed-in user |
| "/graphql" → "deletes a bank account" | 200 only. It doesn't check the result or `isDeleted` |

Verified run (2026-11-17, commit `3d8b9d0`, clean tree, ports 3200/3201, Electron 146 headless,
Cypress 16.1.1): `rwa.mjs cypress cypress/tests/ui/bankaccounts.spec.ts` exited 0, 4 passing, 0 failing,
0 retried, about 25 s (run `20261117-234821`).

## Quick API probes (supporting evidence)

```bash
API=http://localhost:3001                      # your run's API port (N+1)
JAR=.verify-runs/<runId>/scratch/cookies.txt   # keep the cookie jar out of the repo root
# Signed out -> 401
curl -s -o /dev/null -w "%{http_code}\n" $API/bankAccounts
# Sign in as the first seeded user, then list over GraphQL as the UI does
curl -s -c $JAR -H "Content-Type: application/json" \
  -d '{"username":"Heath93","password":"s3cret"}' $API/login
curl -s -b $JAR -H "Content-Type: application/json" \
  -d '{"operationName":"ListBankAccount","query":"query ListBankAccount { listBankAccount { id bankName isDeleted } }"}' \
  $API/graphql
# Check stored values (the UI never shows account or routing numbers)
curl -s $API/testData/bankaccounts
# Probes that change data: reseed afterwards
curl -s -o /dev/null -w "%{http_code}\n" -X POST $API/testData/seed
```

The full probe scripts used for this map are in the runs' `scratch/` folders (`api-probes*.sh`). The
seeded usernames and ids come from `data/database-seed.json`. Look them up instead of trusting the
examples above if the seed has changed.

## Misleading results and failure conditions

- **The empty-state test's list wait is stale.** The page shown after sign-in already fires a
  `ListBankAccount` request that nothing waits on. `cy.wait` yields the oldest unwaited request for an alias, so in "renders an empty
  bank account list state…", `cy.wait("@gqlListBankAccountQuery")` after `cy.visit` returns that
  earlier, **unstubbed** response. A scratch copy recorded `listBankAccount` length 1 there, not 0. The
  test still passes because the assertions after it retry until the stubbed response renders. To wait on
  the request from a specific page load, register a new `cy.intercept(...).as(...)` right before
  `cy.visit` (this is what the "only account" probe does).
- **The empty-state test doesn't use real empty data.** It rewrites the `ListBankAccount` response to
  `[]`. A user whose accounts are all soft-deleted never reaches the empty state (see Behaviors).
- **Real empty data: `yarn start:empty`.** Its `prestart:empty` hook runs `db:seed:empty`, which copies
  `data/empty-seed.json` (every table has 0 rows) over `data/database.json`. Caveats: any spec's
  `cy.task("db:seed")` reloads `database-seed.json`, so a Cypress run puts the seed data back; the empty
  database has no users, so sign up first; and it binds the default ports 3000/3001 (Vite from
  `vite.config.ts`, which isn't `strictPort`; the API from `.env`) outside `rwa.mjs`, so the doctor's
  ownership checks don't cover it. The script also sets `EMPTY_SEED=true`, but nothing reads it; the hook
  does the emptying. (From `package.json` and the seed file; not run for this map.)
- **The UI shows only the bank name.** "Created" in the list doesn't prove the routing or account number
  was stored correctly. Check `GET /testData/bankaccounts` or the `@gqlCreateBankAccountMutation` response.
- **The soft-delete test is loose.** It looks for "Deleted" anywhere under any `*list-item*`, and the
  spec's `getBySelLike("delete")`, `getBySelLike("list-item")`, and `getBySelLike("submit")` match any
  `data-test` containing those words. New tests should use the full `bankaccount-*` names.
- **A green UI doesn't mean the API enforces anything.** The Yup rules are frontend-only. The REST
  validator only checks for strings, GraphQL only checks that the three arguments are present, and both
  delete paths skip ownership checks. Test API behavior with API requests, not through the form.
- **GraphQL errors come back as HTTP 200.** Both kinds probed did: a resolver error (signed-out
  `listBankAccount`) and a validation error (`createBankAccount` with missing arguments), each with an
  `errors` array. `response.statusCode` alone doesn't prove success. Assert on `response.body.data`.
  This holds for the default and axios `Accept` headers. With `Accept: application/graphql-response+json`,
  a missing-argument validation error returns 400, while a resolver error stays 200 (review run
  `20261118-001619`).
- **REST intercepts don't match UI traffic.** Nothing in `src/` requests `/bankAccounts`. Intercept
  `POST /graphql` by `operationName` instead. `transaction-view.spec.ts` sets a `GET /bankAccounts`
  alias that it never waits on.
- **Two forms on one page:** during onboarding step two the dialog renders the same `BankAccountForm`
  with the same `data-test` values. If the page form could also be mounted, scope with `.within()` on
  `user-onboarding-dialog`. (From the code; not seen in a run.)
- **Console noise in `dev.log`** (pre-existing; seen throughout both runs):
  - React's "Invalid DOM property `stop-color`" and "`stop-opacity`" come from the hyphenated SVG
    attributes in `src/components/SvgCypressLogo.tsx`. `Footer` renders that logo on `SignInForm`,
    `SignUpForm`, and `MainLayout`, so the warnings appear on nearly every page, not just bank accounts.
  - XState's "Empty string transition configs … deprecated" comes from the `""` transition in
    `success.unknown` of `src/machines/dataMachine.ts`, so every machine built from it can log it. Both
    runs showed it for `#bankAccounts`, `#notifications`, and `#publicTransactions`.
- **Seed problems:** `cy.task("db:seed")` reloads `database-seed.json` before every test, so leftover
  data from an earlier run (or an empty database from `start:empty`) doesn't affect the spec. If that file
  had no users (or the users table were empty), the `find:database` task's `_.find(...)` returns
  `undefined`, and Cypress fails the task before the `.then` runs: "CypressError: `cy.task('find:database')`
  failed … The task 'find:database' returned undefined. You must return a value, null, or a promise that
  resolves to a value or null" (seen in review run `20261118-001619`). If `db:seed` itself fails, check the doctor: the API is
  probably down or on another port.
