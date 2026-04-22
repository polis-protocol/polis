# Architecture

## System overview

Polis Protocol is a three-tier stack:

```
┌─────────────────────┐      ┌──────────────────┐      ┌──────────────────┐
│  Consumer app       │─────▶│  @polisprotocol/ │─────▶│  Discourse       │
│  (Next.js, Vite,    │ HTTP │  bff             │ HTTP │  (self-hosted)   │
│   Remix, etc.)      │◀─────│  (Fastify)       │◀─────│  forum backend   │
│  @polisprotocol/    │      │                  │      │                  │
│  react              │      └──────────────────┘      └──────────────────┘
└─────────────────────┘              │
                                     ▼
                          ┌──────────────────────┐
                          │  Postgres (Neon)     │
                          │  user registry +     │
                          │  Lucia sessions      │
                          └──────────────────────┘
                                     │
                                     ▼
                          ┌──────────────────────┐
                          │  Redis (Upstash)     │
                          │  SIWE nonces,        │
                          │  SSE pub/sub         │
                          └──────────────────────┘
                                     │
                                     ▼
                          ┌──────────────────────┐
                          │  Base (L2)           │
                          │  PolisArchive.sol    │
                          │  IPFS snapshot refs  │
                          └──────────────────────┘
```

## Package graph

```
@polisprotocol/core
  ├── Types, Zod schemas, defineConfig, Drizzle schema
  └── Zero runtime deps beyond zod + drizzle-orm. Works in Node + browser.
         │
         ├──▶ @polisprotocol/theme-default  (pure token export, no JS runtime)
         │
         ├──▶ @polisprotocol/bff             (Fastify + GraphQL Yoga + Pothos)
         │         │
         │         └──▶ consumed over HTTP by:
         │
         ├──▶ @polisprotocol/react           (components + hooks, no Next.js imports)
         │         │
         │         └──▶ @polisprotocol/web-starter  (Next.js 15 template, private)
         │                    │
         │                    └──▶ create-polis-city  (clones via degit + patches placeholders)
         │
         └── standalone: @polisprotocol/contracts (Solidity + Foundry, no JS runtime)
```

## Package responsibilities

### `@polisprotocol/core`

Foundation. Exports:

- Zod schemas for every domain entity (`City`, `Category`, `User`, `Post`, `Topic`, `PolisConfig`)
- `defineConfig()` helper — validates a `polis.config.ts` at load time
- Drizzle table definitions (`cities`, `users`, `sessions`)
- `Theme` type + `injectThemeCSS()` helper
- `definePlugin()` helper for BFF plugin authors

Never imports from a runtime — pure types + validation. Must work in Node and in the browser.

### `@polisprotocol/react`

Framework-agnostic React library. Exports:

- `<PolisProvider config>` — sets up QueryClient, GraphQL client, injects theme CSS variables
- Hooks: `useCategories`, `useTopics`, `useTopic`, `useCreateTopic`, `useCreateReply`, `useMe`, `useSIWE`, `useRealtime`
- Components: `CommunityHero`, `CategoryList`, `LatestTopics`, `CategoryView`, `TopicView`, `ReplyBar`, `ComposeDialog`, `PostItem`, `LiveBanner`, `TopicCard`

**Hard rule:** no imports from `next/*`. Works in any React 18+ framework.

### `@polisprotocol/bff`

Backend-for-Frontend. Fastify server that:

- Proxies Discourse REST API behind a typed GraphQL surface
- Handles SIWE auth (nonce → sign → verify → Lucia session)
- Creates Discourse users via DiscourseConnect SSO on first sign-in
- Publishes SSE events from Discourse webhooks via Redis pub/sub
- Enforces rate limits, validates env at startup

Deployable as a Docker image (see `infra/docker/Dockerfile.bff`).

### `@polisprotocol/theme-default`

Pure token export (`defaultTheme` object + CSS generator). No JS runtime.

### `@polisprotocol/web-starter`

Next.js 15 App Router template. Not published to npm — cloned by the CLI via degit. Placeholders (`{{CITY_NAME}}`, `{{CITY_SLUG}}`) are replaced at scaffold time.

### `@polisprotocol/contracts`

Foundry workspace. `PolisArchive.sol` is a multi-tenant registry deployed on Base:

- `registerCity(slug)` — anyone can register a city, returns cityId
- `recordSnapshot(cityId, ipfsHash)` — only city admin, appends an IPFS content hash
- `transferAdmin(cityId, newAdmin)` — city admin can hand off
- Ownable + Pausable for emergency stop

### `create-polis-city`

Published unscoped to match npm's `create-*` convention (`pnpm create polis-city my-city`). Wraps citty + @clack/prompts + degit.

## Request flow

### Fetching categories

```
Browser              @polisprotocol/react            @polisprotocol/bff       Discourse
  │                        │                                │                     │
  ├── render page          │                                │                     │
  │                        ├── useCategories()              │                     │
  │                        │   (TanStack Query,             │                     │
  │                        │    60s staleTime)              │                     │
  │                        │                                │                     │
  │                        ├── GraphQL { categories { .. }} │                     │
  │                        │  via graphql-request client ──▶│                     │
  │                        │                                ├── DiscourseClient   │
  │                        │                                │   .listCategories()─▶
  │                        │                                │                     │
  │                        │                                │◀── JSON response ───│
  │                        │                                │                     │
  │                        │◀── typed GraphQL response ─────│                     │
  │                        │                                │                     │
  │◀── rendered grid ──────│                                │                     │
```

### SIWE sign-in

```
Browser            useSIWE hook           /auth/nonce       /auth/verify      Lucia + Postgres    Discourse SSO
  │                    │                       │                 │                   │                  │
  ├── click Sign In    │                       │                 │                   │                  │
  │                    ├── POST /auth/nonce ──▶│                 │                   │                  │
  │                    │                       ├── store in      │                   │                  │
  │                    │                       │   Redis 5min    │                   │                  │
  │                    │◀── { nonce } ─────────│                 │                   │                  │
  │                    │                                                                                │
  │                    ├── constructs SIWE message with nonce                                           │
  │                    ├── wagmi signMessage() ──▶ wallet signs ──▶                                    │
  │                    │                                                                                │
  │                    ├── POST /auth/verify                                                            │
  │                    │        {message, signature}────────────▶│                   │                  │
  │                    │                                         ├── viem.verifyMessage                 │
  │                    │                                         ├── upsert user ───▶│                  │
  │                    │                                         ├── DiscourseConnect SSO ─────────────▶│
  │                    │                                         │                   │                  ├── creates
  │                    │                                         │                   │                  │   Discourse user
  │                    │                                         │◀─── user.id ──────│                  │
  │                    │                                         ├── lucia.createSession                 │
  │                    │◀──── Set-Cookie: session ────────────── │                                      │
  │                                                                                                      │
  ├── subsequent requests include cookie automatically                                                    │
```

## State management

| State kind | Lives in | Lifetime |
|------------|----------|----------|
| Session cookies | BFF → Lucia + Postgres | 30 days |
| SIWE nonces | Redis | 5 min TTL |
| Forum content | Discourse (source of truth) | forever |
| User profile (wallet ↔ discourseUserId mapping) | Postgres `users` table | forever |
| Real-time events | Redis pub/sub, SSE stream | per-connection |
| Client cache | TanStack Query in browser | session |
| Community snapshots | IPFS (content-addressed) + onchain ref | permanent |

## Key design decisions

See [`DECISIONS.md`](./DECISIONS.md) for the detailed rationale. High-level:

1. **BFF pattern** — consumers never call Discourse directly; API key stays server-side.
2. **GraphQL over REST** — typed, stable contract regardless of Discourse version.
3. **Framework-agnostic `@polisprotocol/react`** — no Next.js lock-in.
4. **CSS variable theming** — `--polis-*` prefix prevents conflicts with the consumer app's design system.
5. **Onchain archive, not onchain forum** — day-to-day forum is centralized for UX; only snapshots go onchain for permanence and exit rights.
6. **SIWE over OAuth/magic-link** — wallet identity is user-owned. Sessions are still server-side (Lucia) for UX.
