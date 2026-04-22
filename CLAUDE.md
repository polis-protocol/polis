# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project context

Polis Protocol is an open-source stack for pop-up cities (Zuzalu, Edge City, Cabin, Vitalia, etc.). This directory is the planning and bootstrapping workspace. The actual monorepo (`polis-protocol/polis`) is bootstrapped via `bootstrap-polis.sh` to `~/work/polis/`. The first reference implementation is **Ipê Hub** (`deegalabs/ipehub`), an existing Next.js app at ipehub.xyz that integrates via `@polisprotocol/react`.

Maintained by **DeegaLabs** (Daniel Gorgonha + Dayane Gorgonha). Apache 2.0 license.

Target: `v0.1.0` by **May 1, 2026** (Ipê City 2026 closing day).

## Key files in this directory

- `bootstrap-polis.sh` — creates the monorepo at `~/work/polis/` (scaffold, CI, governance files, first commit)
- `DEVELOPMENT-PLAN.md` — full sprint plan (Sprints 0-5), task breakdown, Claude Code prompt library, scope freeze rules
- `CLAUDE.polis-protocol.md` — CLAUDE.md template to copy into the protocol monorepo
- `CLAUDE.ipehub.md` — CLAUDE.md template to copy into the ipehub app repo

## Two-repo architecture

| Repo | Purpose | Deployment |
|------|---------|------------|
| `polis-protocol/polis` | Public monorepo — protocol packages (`@polisprotocol/*`), contracts, docs | npm, GHCR, Fly.io, Hetzner |
| `deegalabs/ipehub` | Existing Next.js app — adds `/community` route consuming `@polisprotocol/react` | Vercel (ipehub.xyz) |

**Critical boundary**: nothing Ipê-specific goes into the protocol repo. Ipê-only code lives in `deegalabs/ipehub`.

## Stack

- **TypeScript** strict mode everywhere
- **pnpm 9.12** workspaces + **Turborepo**
- **Next.js 15** (App Router, RSC) — in `@polisprotocol/web-starter` only
- **Fastify** + **GraphQL Yoga** + **Pothos** (code-first) — the BFF
- **Drizzle ORM** + **Postgres** (Neon) — User Registry
- **Lucia v3** sessions, **SIWE** (EIP-4361) wallet sign-in
- **Discourse** (self-hosted Docker) as forum backend
- **Foundry** + **Solidity 0.8.24** — smart contracts on **Base**
- **Vitest** (unit), **Playwright** (e2e), **Forge** (contracts)
- **tsup** for package builds, **Changesets** for versioning

## Monorepo layout (post-bootstrap)

```
packages/
  core/             # Types, Zod schemas, defineConfig, Drizzle schema
  react/            # Components + hooks (framework-agnostic React, NO next/* imports)
  bff/              # Fastify + GraphQL Yoga gateway (deployable)
  cli/              # create-polis-city + polis CLI
  contracts/        # Foundry workspace (PolisArchive.sol)
  theme-default/    # Baseline theme tokens (CSS variables, no JS runtime)
  web-starter/      # Next.js scaffold (private, cloned via degit by CLI)
  tsconfig/         # Shared tsconfig presets (internal)
  eslint-config/    # Shared ESLint config (internal)
apps/docs/          # Mintlify docs site
examples/minimal/   # Smallest viable deployment
infra/              # docker-compose stacks + Terraform (Hetzner, Fly.io)
```

## Commands (monorepo)

```bash
# Bootstrap (run once from this directory)
chmod +x bootstrap-polis.sh && ./bootstrap-polis.sh

# Development (from ~/work/polis/)
pnpm install
pnpm build                    # Build all packages (turbo)
pnpm dev                      # Dev mode all packages (turbo, persistent)
pnpm test                     # Run all tests
pnpm lint                     # Lint all packages
pnpm typecheck                # Type-check all packages

# Single package
pnpm --filter @polisprotocol/core build
pnpm --filter @polisprotocol/core test
pnpm --filter @polisprotocol/bff dev

# Database (in @polisprotocol/core)
pnpm --filter @polisprotocol/core db:generate    # Generate Drizzle migration
pnpm --filter @polisprotocol/core db:migrate     # Run migrations
pnpm --filter @polisprotocol/core db:studio      # Open Drizzle Studio

# Contracts (in @polisprotocol/contracts)
forge build
forge test -vvv
forge coverage

# Changesets
pnpm changeset                # Create a changeset
pnpm changeset version        # Bump versions
pnpm changeset status         # Check pending changesets

# Link for local ipehub development (before npm publish)
cd packages/react && pnpm link --global
cd ~/work/ipehub && pnpm link --global @polisprotocol/react @polisprotocol/core @polisprotocol/theme-default
```

## Package boundaries

- **`@polisprotocol/core`** — zero runtime deps beyond Zod + Drizzle. Must work in Node + browser.
- **`@polisprotocol/react`** — components + hooks only. NO Next.js imports. Peer deps: react ^18 || ^19, wagmi ^2, viem ^2.
- **`@polisprotocol/bff`** — Fastify server. Loads `polis.config.ts` via `defineConfig()`. Plugin system via Pothos.
- **`@polisprotocol/theme-default`** — pure CSS-variable tokens. No JS runtime.
- **`@polisprotocol/web-starter`** — private (not published to npm). Cloned via degit.
- **`@polisprotocol/contracts`** — Solidity + Forge tests only. No JS runtime code.

## Conventions

- `any` is banned — use `unknown` + type guards or discriminated unions.
- All external input Zod-validated at the boundary.
- Explicit return types on exported functions.
- File naming: `kebab-case.ts`, `PascalCase` for React component default exports.
- Import order: node built-ins > external > internal (`@polisprotocol/*`) > relative.
- Conventional Commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:` with scope when relevant (`feat(bff): ...`).
- Squash merge to main. PRs required. Every non-trivial PR opens a Changeset.
- Drizzle migrations include both up and down.
- No new dependencies without asking.

## Adding a new entity (common pattern)

1. Zod schema in `packages/core/src/schema.ts`
2. Drizzle table in `packages/core/src/db/schema.ts`
3. Generate migration: `pnpm --filter @polisprotocol/core db:generate`
4. GraphQL type + resolvers in `packages/bff/src/graphql/<entity>.ts`
5. React hook in `packages/react/src/hooks/`
6. Component (if needed) in `packages/react/src/components/`
7. Export from `src/index.ts` barrels
8. Changeset for each affected package

## Infrastructure

- **BFF**: Fly.io GRU (api.ipehub.xyz)
- **Discourse**: Hetzner Docker (forum.ipehub.xyz)
- **DB**: Neon Postgres (user registry)
- **Cache**: Upstash Redis
- **Uploads**: Cloudflare R2
- **IPFS**: web3.storage + Pinata (backup pipeline)
- **Onchain**: Base mainnet + Base Sepolia (PolisArchive contract)
- **Secrets**: Doppler (prod), `.env.local` (dev)
- **Monitoring**: Sentry + Axiom

## Sprint reference

Development follows 5 sprints in `DEVELOPMENT-PLAN.md`:
- Sprint 0 (Day 0): Setup and decisions
- Sprint 1 (Days 1-2): Monorepo bootstrap, CI, docs scaffold
- Sprint 2 (Days 3-4): @polisprotocol/core + @polisprotocol/bff, Discourse, SIWE auth
- Sprint 3 (Days 5-6): @polisprotocol/react, ipehub integration, deploy
- Sprint 4 (Days 7-8): Contracts, backup pipeline, plugin system
- Sprint 5 (Days 9-10): CLI, docs, v0.1.0 release

Scope freeze after Apr 26 18:00 BRT — only bug fixes, polish, docs, tests, performance.
