# Feature map: bank accounts

Listing, creating, and soft-deleting a signed-in user's bank accounts, plus the onboarding dialog
that asks for one when the list is empty. Last verified at commit `3d8b9d0` (4 of 4 tests in
`bankaccounts.spec.ts` passed with no retries, run on ports 3200/3201).

## Starting state

- App running and healthy through `rwa.mjs start` (add `--port N` for a parallel worktree).
- Database seeded from `data/database-seed.json`: 5 users and 5 bank accounts, one per user, none
  deleted. The first seeded user, `Heath93` (`uBmeaz5pX`), owns "Waters, King and O'Reilly Bank"
  (`pgl34JtnfhX`). List them with `GET http://localhost:3001/testData/bankaccounts`.
- Each test in `bankaccounts.spec.ts` reseeds (`cy.task("db:seed")`), then signs in as the first seeded
  user with `cy.loginByXstate`, so it starts on `/` with one active bank account.

## Routes and code

| Route | What it is | Code |
|---|---|---|
| `/bankaccounts` | List of the user's accounts and a Create button. Shows "No Bank Accounts" when the list is empty | `src/containers/BankAccountsContainer.tsx`, `src/components/BankAccountList.tsx`, `src/components/BankAccountItem.tsx`, `src/components/EmptyList.tsx` |
| `/bankaccounts/new` | Create form. Same container: it renders the form when `match.url === "/bankaccounts/new"` | `src/components/BankAccountForm.tsx` |
| (routing) | One `PrivateRoute path="/bankaccounts*"` covers both pages | `src/containers/PrivateRoutesContainer.tsx` |
| (state) | `bankAccountsMachine` is `dataMachine("bankAccounts")`: `idle → loading → success.withData / success.withoutData`. `CREATE` and `DELETE` go to `creating` / `deleting`, then refetch (`loading`). One instance, created in `App.tsx`, is shared by the page and the onboarding dialog | `src/machines/bankAccountsMachine.ts`, `src/machines/dataMachine.ts`, `src/containers/App.tsx` |
| (dialog) | Onboarding dialog. Opens when the list fetch succeeds with no accounts; step two renders `BankAccountForm` with `onboarding` | `src/containers/UserOnboardingContainer.tsx`, `src/machines/userOnboardingMachine.ts` |
| (nav) | "Bank Accounts" link in the side drawer | `src/components/NavDrawer.tsx` |

Form validation (Yup, in `BankAccountForm.tsx`; checks string length only, not digits):

| Field | Rule | Message |
|---|---|---|
| `bankName` | required, min 5 | "Enter a bank name", "Must contain at least 5 characters" |
| `routingNumber` | required, length exactly 9 | "Enter a valid bank routing number", "Must contain a valid routing number" |
| `accountNumber` | required, length 9 to 12 | "Enter a valid bank account number", "Must contain at least 9 digits", "Must contain no more than 12 digits" |

On submit the form calls `createBankAccount` and, outside onboarding, immediately pushes `/bankaccounts`
without waiting for the mutation.

## API

The UI uses **GraphQL only**: `POST http://localhost:${VITE_BACKEND_PORT}/graphql` with an
`operationName` (schema `backend/graphql/schema.graphql`, resolvers `backend/graphql/resolvers/`).
The `/graphql` route is **not** behind `ensureAuthenticated`; resolvers read `ctx.user` from the session.

| Operation | Result |
|---|---|
| `ListBankAccount` → `listBankAccount` | The signed-in user's accounts, **including soft-deleted ones**. Signed out: HTTP 200 with `errors` ("Cannot read properties of undefined (reading 'id')") and `data.listBankAccount: null` |
| `CreateBankAccount(bankName, accountNumber, routingNumber)` | The new account. No server-side validation |
| `DeleteBankAccount(id)` | Sets `isDeleted: true` and returns `true`. Doesn't check the session or ownership, and returns `true` for an unknown id |

REST on the API port (`backend/bankaccount-routes.ts`), used by `cypress/tests/api/api-bankaccounts.spec.ts`,
not by the UI. All routes need a session (401 `{"error":"Unauthorized"}` otherwise):

| Endpoint | Result |
|---|---|
| `GET /bankAccounts` | 200 `{results}`, the signed-in user's accounts |
| `GET /bankAccounts/:bankAccountId` | 200 `{account}` for **any** user's account (no ownership check) |
| `POST /bankAccounts` `{bankName, accountNumber, routingNumber}` | 200 `{account}`. The validator only checks that each field is a string, so `""` is accepted |
| `DELETE /bankAccounts/:bankAccountId` | 200, soft delete of **any** user's account (no ownership check) |
| `POST /testData/seed`, `GET /testData/bankaccounts` | Test-only reseed and lookup |

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
  `POST /login`, then for `list-skeleton` to disappear. No sign-in UI is exercised.
- `cy.database("find", "users")` returns the first seeded user; `cy.database("filter", "bankaccounts")`
  returns all accounts (the API spec uses it).
- GraphQL aliases: the spec's `beforeEach` intercepts `POST ${Cypress.expose("apiUrl")}/graphql` and
  sets `req.alias` from `operationName`: `@gqlListBankAccountQuery`, `@gqlCreateBankAccountMutation`,
  `@gqlDeleteBankAccountMutation`. Copy that block for new tests. It reads `apiUrl`, which the helper
  points at the run's API port.
- `isMobile()` (`cypress/support/utils.ts`) is true when `viewportWidth` is below
  `mobileViewportWidthBreakpoint` (414). The default viewport is 1280, so the sidenav branch only runs
  with a mobile viewport.
- `cy.visualSnapshot(name)` wraps `cy.percySnapshot`. Without a Percy server it takes no snapshot, so it
  asserts nothing in a local run.

## Behaviors

| Behavior | Expected result | Covered by |
|---|---|---|
| Create from the list page | Sidenav → Create → `/bankaccounts/new`; after Save, 2 rows and the second contains "The Best Bank" | `bankaccounts.spec.ts` "creates a new bank account" |
| Form validation | Each message in the validation table above appears on blur; valid values remove the helper text; Save is disabled | `bankaccounts.spec.ts` "should display bank account form errors" |
| Soft delete | After `DeleteBankAccount`, a row contains "Deleted" | `bankaccounts.spec.ts` "soft deletes a bank account" |
| Empty list | `bankaccount-list` absent, `empty-list-header` says "No Bank Accounts", onboarding dialog visible | `bankaccounts.spec.ts` "renders an empty bank account list state with onboarding modal" (the list response is **stubbed** to `[]`) |
| Create during onboarding | Next → "Create Bank Account" → Save → "Finished" / "You're all set!" → transaction list | `auth.spec.ts` "should allow a visitor to sign-up, login, and logout" |
| API: list, get, create, delete (REST and GraphQL) | 200 with the user's id on the result | `cypress/tests/api/api-bankaccounts.spec.ts` (not run for this map) |
| Database functions | List, get, create, soft delete | `src/__tests__/bankaccounts.test.ts` (Vitest, not run for this map) |
| Letters in routing / account numbers | Accepted: "abcdefghi" in both passes validation and is saved | No repo test. A scratch spec passed on 2026-11-17 at `3d8b9d0` |
| Deleting the user's only account | Row shows "(Deleted)", its Delete button is gone, and the onboarding dialog does **not** reopen on `/` (the deleted account still counts) | No repo test. A scratch spec passed on 2026-11-17 at `3d8b9d0` |
| Deleting another user's account (REST, signed in) | 200 and the other user's account becomes `isDeleted: true` | No repo test. API probe on 2026-11-17 at `3d8b9d0` |
| Deleting any account over GraphQL while signed out | 200 `{"data":{"deleteBankAccount":true}}` and the account becomes `isDeleted: true` | No repo test. API probe on 2026-11-17 at `3d8b9d0` |

Verified run (2026-11-17, commit `3d8b9d0`, clean tree, ports 3200/3201, Electron 146 headless,
Cypress 16.1.1): `rwa.mjs cypress cypress/tests/ui/bankaccounts.spec.ts` exited 0, 4 passing, 0 failing,
0 retried, about 25 s.

## Quick API probes (supporting evidence)

```bash
API=http://localhost:3001   # your run's API port (N+1)
# Signed out -> 401
curl -s -o /dev/null -w "%{http_code}\n" $API/bankAccounts
# Sign in as the first seeded user, then list over GraphQL as the UI does
curl -s -c jar.txt -H "Content-Type: application/json" \
  -d '{"username":"Heath93","password":"s3cret"}' $API/login
curl -s -b jar.txt -H "Content-Type: application/json" \
  -d '{"operationName":"ListBankAccount","query":"query ListBankAccount { listBankAccount { id bankName isDeleted } }"}' \
  $API/graphql
# Check stored values (the UI never shows account or routing numbers)
curl -s $API/testData/bankaccounts
# Probes that delete data: reseed afterwards
curl -s -o /dev/null -w "%{http_code}\n" -X POST $API/testData/seed
```

Put the cookie jar in the run's `scratch/` folder, not the repo root. The seeded usernames and ids come
from `data/database-seed.json`. Look them up instead of trusting the examples above if the seed has changed.

## Misleading results and failure conditions

- **The empty-state test doesn't use an empty account.** It rewrites the `ListBankAccount` response to
  `[]`. A real user with no accounts goes through the same code path, but the seed has none, and a user
  whose accounts are all soft-deleted never reaches the empty state (see Behaviors). `start:empty` sets
  `EMPTY_SEED=true`, but nothing in the repo reads it, so it doesn't give you an empty database.
- **The UI shows only the bank name.** "Created" in the list doesn't prove the routing or account number
  was stored correctly. Check `GET /testData/bankaccounts` or the `@gqlCreateBankAccountMutation` response.
- **The soft-delete test is loose.** It looks for "Deleted" anywhere under any `*list-item*`, and the
  spec's `getBySelLike("delete")`, `getBySelLike("list-item")`, and `getBySelLike("submit")` match any
  `data-test` containing those words. New tests should use the full `bankaccount-*` names.
- **A green UI doesn't mean the API enforces anything.** The Yup rules are frontend-only. The REST
  validator only checks for strings, GraphQL checks nothing, and both delete paths skip ownership
  checks. Test API behavior with API requests, not through the form.
- **GraphQL errors return HTTP 200.** A failed `listBankAccount` comes back as 200 with an `errors`
  array, so `response.statusCode` alone doesn't prove success. Assert on `response.body.data`.
- **REST intercepts never fire.** The UI doesn't call `/bankAccounts`. Intercept `POST /graphql` by
  `operationName` instead (`transaction-view.spec.ts` sets an unused `GET /bankAccounts` alias).
- **Two forms on one page:** during onboarding step two the dialog renders the same `BankAccountForm`
  with the same `data-test` values. If the page form could also be mounted, scope with `.within()` on
  `user-onboarding-dialog`. (From the code; not seen in a run.)
- **Console noise in `dev.log`:** XState's "Empty string transition configs" deprecation for
  `#bankAccounts.success.unknown` and React's "Invalid DOM property `stop-color`" from the onboarding
  illustrations appear on every run. They're pre-existing, not regressions.
- **Missing seed data:** if `/testData/users` is empty, `cy.database("find", "users")` returns nothing and
  `loginByXstate` fails. Run the doctor.
