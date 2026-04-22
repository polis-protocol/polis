# CLAUDE.md · Polis Protocol

> Read this file before every Claude Code invocation in this repo. It encodes the conventions and context.

## Project context

Polis Protocol is an open-source stack for pop-up cities. This monorepo (`polis-protocol/polis`) contains the generic protocol. Reference implementations live in separate repos — the first one is `deegalabs/ipehub` (the existing Ipê Hub app, integrated via the `@polis/react` library).

Maintained by **DeegaLabs** (Daniel Gorgonha + Dayane Gorgonha). Apache 2.0.

Target: `v0.1.0` shipped by **May 1, 2026**, coinciding with Ipê City 2026 closing day.

## Stack

- **TypeScript** strict mode everywhere
- **pnpm** workspaces + **Turborepo**
- **Next.js 15** (App Router, RSC) — used inside `@polis/web-starter` only, not in consuming apps
- **Fastify** + **GraphQL Yoga** + **Pothos** (code-first schema) — the BFF
- **Drizzle ORM** + **Postgres** (Neon) — User Registry
- **Lucia v3** for sessions, **SIWE** (EIP-4361) for wallet sign-in
- **Discourse** (self-hosted via Docker) as forum backend
- **Foundry** + **Solidity 0.8.24** — smart contracts
- **Base mainnet** + Base Sepolia
- **Vitest** (unit), **Playwright** (e2e), **Forge** (contracts)
- **tsup** for package builds, **Changesets** for versioning

## Monorepo layout

```
packages/
  core/             # Types, Zod schemas, defineConfig, Drizzle schema
  react/            # Components + hooks (framework-agnostic React)
  bff/              # Fastify + GraphQL Yoga gateway (deployable)
  cli/              # create-polis-city + polis CLI
  contracts/        # Foundry workspace (PolisArchive.sol)
  theme-default/    # Baseline theme tokens
  web-starter/      # Next.js scaffold (used by CLI via degit, not published to npm)
  tsconfig/         # Shared tsconfig presets (internal)
  eslint-config/    # Shared ESLint config (internal)

apps/
  docs/             # Mintlify docs site

examples/
  minimal/          # Smallest viable deployment (uses web-starter)

infra/
  docker/           # docker-compose stacks
  terraform/        # Hetzner + Fly.io modules
```

## Package responsibilities

Critical to keep the boundaries clean — these are the contracts:

- **`@polis/core`** — zero runtime dependencies beyond Zod + Drizzle. Types, schemas, `defineConfig()`. Must work in Node + browser.
- **`@polis/react`** — components + hooks only. NO Next.js imports. NO framework code. Peer deps: react ^18 || ^19, wagmi ^2, viem ^2. Must be importable from any React app (Next, Vite, Remix, Astro).
- **`@polis/bff`** — Fastify server. Deployable as Docker image. Loads `polis.config.ts` at startup. Plugin system via Pothos plugin loader.
- **`@polis/theme-default`** — pure CSS-variable theme tokens. No JS runtime — just exports the `Theme` object.
- **`@polis/web-starter`** — Next.js 15 app template. Private (not published). Cloned via degit by the CLI.
- **`@polis/cli`** — published as `create-polis-city`. Thin wrapper around Clack + degit + string replacement.
- **`@polis/contracts`** — Solidity contracts + Foundry tests. No JS runtime code here.

## Conventions

### Code

- `any` is banned. Use `unknown` + type guards or discriminated unions.
- All external input (HTTP body, env vars, config files, webhook payloads) is Zod-validated at the boundary.
- Prefer `const` over `let`. No `var`.
- Explicit return types on exported functions.
- File naming: `kebab-case.ts` for files, `PascalCase` for React component default exports.
- Import order: node built-ins → external → internal (`@polis/*`) → relative.

### Commits & PRs

- **Conventional Commits**: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`.
- Scope when relevant: `feat(bff): add SSE endpoint`.
- Squash merge to main. Main is protected.
- PR title = commit title. PR description fills template.
- Every non-trivial PR opens a Changeset via `pnpm changeset`.

### Testing

- Tests are **not optional** for new logic.
- Unit: Vitest, colocated in `__tests__/` or `.test.ts` next to source.
- Integration: MSW for mocking external HTTP (Discourse API, Neynar).
- E2E: Playwright against running stack, one scenario per critical flow.
- Contracts: Forge, target >95% coverage, include fuzz + invariant tests.
- Coverage reported via Codecov.

### Error handling

- Never throw raw strings. Always `Error` subclasses.
- BFF: typed GraphQL errors via Pothos error plugin (`NotFoundError`, `UnauthorizedError`, `ValidationError`, `RateLimitError`).
- React: error boundaries around top-level components. Hooks return `{ data, error, status }` from TanStack Query.
- Logs: structured (pino), never log secrets, redact PII.

### Config & secrets

- `polis.config.ts` loaded via `defineConfig()` from `@polis/core`. All fields validated at runtime by Zod.
- Env vars validated at BFF startup — fail fast if missing.
- Secrets via Doppler in prod, `.env.local` in dev. `.env.example` always committed up-to-date.
- Never commit real keys. Never invent them.

## Guardrails

- **This is a PROTOCOL repo.** Nothing Ipê-specific goes here. Ipê-only code lives in `deegalabs/ipehub`.
- **No new deps without asking.** Each dependency is a maintenance burden.
- **No framework coupling in `@polis/react`.** If you need Next.js features, make it a prop or a separate package.
- **Don't break the build.** Run `pnpm lint && pnpm typecheck && pnpm test` before every commit.
- **Migrations are forever.** When writing a Drizzle migration, include both up and down.
- **Plugin system stays minimal.** No god-plugins. A plugin extends the schema, it doesn't rewrite the core.
- If a task is ambiguous, **ask one clarifying question** before writing code.

## Common patterns

### Adding a new entity

1. Define Zod schema in `packages/core/src/schema.ts`
2. Add Drizzle table in `packages/core/src/db/schema.ts`
3. Generate migration: `pnpm --filter @polis/core db:generate`
4. Add GraphQL type + resolvers in `packages/bff/src/graphql/<entity>.ts`
5. Add React hook wrapping the query/mutation in `packages/react/src/hooks/`
6. Add component (if UI needed) in `packages/react/src/components/`
7. Export from both `src/index.ts` barrels
8. Changeset for each affected package

### Adding a new route to consuming app

Consuming app (e.g. ipehub) uses `@polis/react` directly:

```tsx
import { TopicView } from '@polis/react';
export default function Page({ params }) {
  return <TopicView id={params.id} />;
}
```

No server-side GraphQL calls needed — TanStack Query handles fetching from `PolisProvider` context.

## Reference

- Full task plan: [`DEVELOPMENT-PLAN.md`](./DEVELOPMENT-PLAN.md) in repo root
- Architecture spec: `docs/reference/architecture-v0.2.html`
- Design mockup: `docs/reference/ipe-forum-mockup.html`
- Ecosystem vision: `docs/reference/ecosystem-vision.html`

When in doubt, check the DEVELOPMENT-PLAN and the current task's Claude Code prompt before acting.
