# Test Strategy

Testing guarantees for Polis Protocol, by layer.

## Layers

| Layer | Tool | Scope |
|-------|------|-------|
| Unit | Vitest | Pure functions, schemas, hooks (with mocked fetch) |
| Integration | Vitest + MSW | BFF ↔ Discourse adapter, GraphQL resolvers |
| Component | Vitest + @testing-library/react + jsdom | React components |
| E2E | Playwright | Full stack via browser against running services |
| Contract | Forge | Solidity tests (unit + fuzz + invariant) |

## Per-package responsibilities

### `@polisprotocol/core`

- All Zod schemas have tests with valid and invalid inputs.
- `defineConfig()` tests cover required field enforcement and defaults.
- `injectThemeCSS()` tests verify correct CSS output.
- Coverage target: 90%+.

Current: 24 tests, 100% pass rate.

### `@polisprotocol/bff`

- `DiscourseClient` tests use MSW to mock Discourse responses.
- Retry/backoff behavior is explicitly tested (5xx triggers retry, 4xx doesn't).
- GraphQL resolvers are tested with a built Pothos schema and mocked Discourse client.
- SIWE auth: unit-test message verification, integration-test the full nonce → verify → session flow.
- Env validation: test that missing required vars fail fast.
- Coverage target: 80%+ on business logic, 100% on env/config validation.

Current: 13 tests, including retry scenarios.

### `@polisprotocol/react`

- `PolisProvider` is tested for theme CSS injection and context propagation.
- Each component has a minimal smoke test rendering with mocked hooks.
- Hooks are tested in isolation with MSW mocking the BFF endpoints.
- E2E-ish interactions (compose topic, submit reply) are covered in the consumer app's Playwright suite, not here.

Current: 8 tests.

### `@polisprotocol/contracts`

- Every public function has a happy-path test.
- Every revert branch (custom error) has a negative test.
- Fuzz tests for state-changing functions.
- Gas snapshot test with a soft budget (e.g., `recordSnapshot` < 80k gas).
- Coverage target: 100% branches.

Current: 20 tests, including 2 fuzz tests (256 runs each), gas snapshot.

### `create-polis-city`

- Smoke test importing all command modules.
- Full E2E scaffolding test (runs against real templates) is run manually before release.

Current: 1 smoke test.

## E2E (Playwright) — to implement

Lives in `packages/web-starter/e2e/` (and mirrored in `ipehub` for its specifics).

Scenarios to cover:

1. **Landing** — `/community` loads, shows categories from real BFF.
2. **Category navigation** — click category card → land on `/community/c/[slug]` → see topic list.
3. **SIWE sign-in** — connect wallet → sign → session cookie set → `/auth/me` returns user.
4. **Create topic** — authenticated user opens compose dialog → submit → redirects to new topic.
5. **Reply to topic** — submit reply via `ReplyBar` → appears without page reload.
6. **Real-time** — open two browsers on the same topic → reply in one → appears in the other within 2 seconds.

Run against a local stack (`docker compose up` in `infra/docker/`) with seeded Discourse categories.

## CI

Workflows in `.github/workflows/`:

- `ci.yml` — lint + typecheck + test + build on every PR and push to main
- `contracts.yml` — Forge tests + gas report, only when `packages/contracts/**` changes
- `release.yml` — on push to main, open/merge Changesets release PR, publish to npm
- `backup.yml` — weekly Discourse backup download to GitHub artifacts

## Conventions

- Tests co-located with source: `src/foo.ts` → `src/__tests__/foo.test.ts` or `src/foo.test.ts`.
- No tests skipped on main. Failing tests block merge.
- New logic without tests = incomplete PR.
- Flaky tests are treated as bugs — either fix or delete.
- Coverage reports go to Codecov (once wired).

## What we intentionally don't test

- Third-party libraries (Fastify, GraphQL Yoga, Drizzle, viem). We trust their own suites.
- Discourse itself. Treated as a vendored API.
- Infra (Terraform, Docker). Tested manually on first deploy, smoke-tested via healthchecks thereafter.
- Visual regression. Covered by design review, not automation (for v0.1).
