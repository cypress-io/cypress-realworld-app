# Feature map: authentication

Local username/password sign-in, sign-up, and sign-out. Last verified at commit `0729f68`
(8 of 8 tests in `auth.spec.ts` passed with no retries).

## Starting state

- App running and healthy through `rwa.mjs start`.
- Database seeded: 5 users, all with password `s3cret` (`SEED_DEFAULT_USER_PASSWORD` in `.env`).
  List them with `GET http://localhost:3001/testData/users` or `yarn list:dev:users`.
- Browser signed out. Each test in `auth.spec.ts` reseeds the database first (`cy.task("db:seed")`).

## Routes and code

| Route | What it is | Code |
|---|---|---|
| `/signin` | Sign-in form | `src/components/SignInForm.tsx` |
| `/signup` | Sign-up form | `src/components/SignUpForm.tsx` |
| `/` | Home (transactions). Signed-out users are redirected to `/signin` | `src/containers/App.tsx` |
| (state) | Auth state machine: `unauthorized → loading → authorized` | `src/machines/authMachine.ts` |

API on :3001 (`backend/auth.ts`, Passport local strategy):

| Endpoint | Result |
|---|---|
| `POST /login` `{username, password, remember?}` | 200 `{user}` or 401 |
| `GET /checkAuth` | 200 `{user}`, or 401 `{"error":"User is unauthorized"}` when signed out |
| `POST /logout` | Clears the `connect.sid` cookie |
| `POST /users` | Sign up |
| `POST /testData/seed`, `GET /testData/:entity` | Test-only seeding and lookup |

## Selectors

Use `cy.getBySel("<name>")`, which matches `[data-test=<name>]`.

| Element | `data-test` |
|---|---|
| Username / password inputs (MUI wrappers; use `.find("input")` to clear or blur) | `signin-username`, `signin-password` |
| Remember me checkbox | `signin-remember-me` |
| Submit (disabled while the form is invalid) | `signin-submit` |
| Error alert (only rendered when there is an error) | `signin-error` |
| Link to sign-up | `signup` |
| Sign-up fields | `signup-first-name`, `signup-last-name`, `signup-username`, `signup-password`, `signup-confirmPassword`, `signup-submit` |
| Sign out (on mobile widths, open `sidenav-toggle` first) | `sidenav-signout` |
| Field validation text | `#username-helper-text`, `#password-helper-text` (ids, not data-test) |

## Helpers (`cypress/support/commands.ts`)

- `cy.login(username, password, { rememberUser })` visits `/signin` only if not already there, types
  into both fields, ticks remember-me if asked, clicks submit, and waits for `POST /login` (`@loginUser`).
  It does not clear the fields first. That currently doesn't matter after a failed sign-in, because
  **the form comes back empty**: `App.tsx` renders `SignInForm` only in the `unauthorized` state, so
  `loading` unmounts it and the failure remounts it with fresh Formik values. A retry test should
  assert the fields are empty rather than "clearing" fields that are already blank. If you change that
  behavior, clear the inputs yourself.
  `cy.login` already consumes `cy.wait("@loginUser")`. To check the response afterwards, use
  `cy.get("@loginUser").its("response.statusCode")`. A second `cy.wait("@loginUser")` waits for a *new*
  request and times out.
- `cy.loginByApi(username, password?)` signs in with a direct API request, with no UI.
- `cy.database("find", "users")` returns the first seeded user, which is handy for valid credentials.

## Behaviors

| Behavior | Expected result | Covered by (`auth.spec.ts`) |
|---|---|---|
| Visit a protected page signed out | Redirected to `/signin` | "should redirect unauthenticated user to signin page" |
| Valid sign-in | Path becomes `/` | "should redirect to the home page after login" |
| Remember me | `connect.sid` cookie has an expiry (30 days); sign-out returns to `/signin` | "should remember a user for 30 days after login" |
| Sign up, sign in, onboarding, sign out | Onboarding dialog → bank account → "You're all set!" → transaction list | "should allow a visitor to sign-up, login, and logout" |
| Field validation | "Username is required", "Password must contain at least 4 characters", and submit disabled | "should display login errors" |
| Unknown username | `signin-error` has exactly "Username or password is invalid"; still on `/signin` | "should error for an invalid user" |
| Wrong password, existing user | Same error | "should error for an invalid password for existing user" |
| Fields after a failed attempt | Username and password inputs are empty (form remounts) | No repo test. Seen in a browser check on 2026-11-17 |
| Error after a page reload | The alert stays, because auth state, including the message, is saved in `localStorage` (`authState`) | No repo test. Seen in a browser check on 2026-11-17 |
| **Retry after a failed attempt, without reloading** | Entering valid credentials signs in (lands on `/`), and the error is gone | **No repo test** as of `0729f68`. A one-off scratch spec passed on 2026-11-17 |

Component test: `src/components/SignInForm.cy.tsx` (1 test). Run it with
`rwa.mjs cypress src/components/SignInForm.cy.tsx -- --component`. It passed 1/1 at `0729f68`.

## Quick API probes (supporting evidence)

```bash
# Invalid credentials -> 401
curl -s -o /dev/null -w "%{http_code}\n" -H "Content-Type: application/json" \
  -d '{"username":"invalidUserName","password":"invalidPa$$word"}' http://localhost:3001/login
# Valid credentials (first seeded user) -> 200
curl -s -o /dev/null -w "%{http_code}\n" -H "Content-Type: application/json" \
  -d '{"username":"Heath93","password":"s3cret"}' http://localhost:3001/login
```

The seeded usernames come from `data/database-seed.json`. Look them up instead of trusting the
example above if the seed has changed.

## Misleading results and failure conditions

- **The error message is produced by the frontend.** `authMachine.ts` turns *any* failed `/login`
  request into "Username or password is invalid", including when the API is down or unreachable.
  Seeing that message doesn't prove the credentials were checked, so make sure the doctor is healthy,
  and when it matters confirm the 401 (the `@loginUser` response status, or the API probe above).
- **Missing seed data:** if `/testData/users` is empty, `cy.database("find", "users")` returns nothing
  and the sign-in tests fail with type errors rather than a clear message. Run the doctor.
- **Error never appears:** check the `POST /login` response in the run's video or `cypress-*.log`, then
  `performLogin` in `authMachine.ts`.
- **Third-party auth env vars set** (`VITE_AUTH0`, `VITE_OKTA`, and so on): a different sign-in UI
  appears, and this map doesn't apply.
