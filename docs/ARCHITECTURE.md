# Architecture

## Mental model: coordination layer, not super-app

Polis Protocol is **not** a monolithic community app. It is a **coordination layer** that provides:

1. A shared identity primitive (SIWE)
2. A shared theming system (`--polis-*` CSS variables)
3. A composable set of React components that each consume a **separate best-of-breed system**
4. A BFF that unifies those systems behind a typed GraphQL surface

Each "community primitive" (forum, chat, microblog, DMs, governance, livestream) is a separate sovereign system. The consumer app picks which primitives to surface. See [ADR-011](./DECISIONS.md) for the rationale.

## System overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                       Consumer App (ipehub, etc.)                   │
│                        @polisprotocol/react                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────┐  │
│  │ Forum    │  │ Chat     │  │ Pulse    │  │ Live     │  │ ...   │  │
│  │ (Topic,  │  │ Channels │  │ Feed     │  │ Banner   │  │       │  │
│  │  Reply)  │  │          │  │          │  │          │  │       │  │
│  └────┬─────┘  └─────┬────┘  └────┬─────┘  └────┬─────┘  └───┬───┘  │
└───────┼──────────────┼────────────┼─────────────┼────────────┼──────┘
        │              │            │             │            │
        │       ┌──────┴──────────  HTTP  ─────────┼────────────┘
        │       │                   │              │
   ┌────▼───────▼────┐  ┌───────────▼───┐   ┌──────▼──────────┐
   │ @polisprotocol  │  │   Farcaster   │   │ Ipê Livestream  │
   │ bff (Fastify)   │  │  (via Neynar) │   │ (separate prod) │
   └────┬────────────┘  └───────────────┘   └─────────────────┘
        │
   ┌────┴───────────────────────────────────────────────┐
   │                                                    │
   ▼                         ▼                          ▼
┌──────────┐  ┌──────────────────┐  ┌────────────────────────┐
│Discourse │  │Postgres (Neon)   │  │Base (L2)               │
│forum +   │  │user registry,    │  │PolisArchive.sol,       │
│chat pl.  │  │Lucia sessions    │  │IPFS snapshot refs      │
└──────────┘  └──────────────────┘  └────────────────────────┘
      │
      ▼
┌──────────────────┐
│Redis (Upstash)   │
│SIWE nonces,      │
│SSE pub/sub       │
└──────────────────┘
```

The BFF is the gateway for things that need a server (Discourse, Postgres, Base reads). Other primitives (Farcaster, Livestream) are consumed directly from `@polisprotocol/react` components against their own public APIs.

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

## Community primitives

Each capability is its own system, chosen as best-of-category. Polis composes — it doesn't rebuild.

| Primitive | Implementation | Consumed via |
|-----------|---------------|--------------|
| **Forum** (async, threaded) | Discourse (self-hosted) | BFF → GraphQL |
| **Chat** (channels, sync) | Discourse Chat plugin (v0.1) → Matrix (future) | BFF → GraphQL |
| **Microblog / Pulse** | Farcaster channel-based | Neynar API, direct from `@polisprotocol/react` |
| **DMs** | XMTP (opt-in) | XMTP SDK, direct from consumer app |
| **Governance / Voting** | Snapshot or Tally | Via wagmi, direct from consumer app |
| **Social profiles** | Farcaster / Lens / ENS | SIWE-addressable identity |
| **Livestream** | Ipê Livestream (separate product) | 3 HTTP surfaces, see below |
| **Onchain archive** | PolisArchive.sol on Base | viem, via consumer app or BFF |

Each appears as an optional component in `@polisprotocol/react`. The consumer's `polis.config.ts` declares which integrations are enabled.

## Integration surfaces

### Livestream (Ipê Livestream) — see [ADR-012](./DECISIONS.md)

Livestream is a **separate product** with its own repo, domain (`tv.yourcity.xyz`), and ops. Polis integrates via three HTTP contracts:

1. **Live status** — `GET /api/status` → `{ live, title, viewerCount, startedAt }`.
   `<LiveBanner>` polls this; renders "live now" or nothing.

2. **Post-VOD webhook** — Livestream POSTs to BFF when stream ends:
   ```
   POST /webhooks/livestream/vod-finalized
   { title, vodUrl, durationSec, transcript?, summary?, keyMoments?, categorySlug }
   ```
   BFF creates a topic in the referenced category (default `openmic`) linking to the VOD.

3. **Timestamp deep-link** — URL convention: `/community/t/{topicId}#t=14m32s` auto-seeks the embedded player. Bidirectional (livestream chat can reference `#t42`).

### Auth (Privy / RainbowKit / custom) — see [ADR-013](./DECISIONS.md)

BFF stays **SIWE-only** — it verifies EIP-4361 signatures and doesn't care which wallet created them. Client-side auth connector is pluggable via `polis.config.ts`:

```typescript
integrations: {
  auth: {
    provider: 'privy',  // or 'rainbowkit' or 'custom'
    appId: '<privy-app-id>',
    loginMethods: ['email', 'google', 'farcaster', 'wallet'],
    embeddedWallets: 'users-without-wallets',
  },
}
```

- **`rainbowkit`** — default for crypto-native cities. Pure wagmi + RainbowKit.
- **`privy`** — radically simpler onboarding: email/social login auto-creates an embedded wallet that signs SIWE. Used by Ipê Hub.
- **`custom`** — consumer provides their own wagmi connector.

## Key design decisions

See [`DECISIONS.md`](./DECISIONS.md) for the detailed rationale. High-level:

1. **BFF pattern** — consumers never call Discourse directly; API key stays server-side.
2. **GraphQL over REST** — typed, stable contract regardless of Discourse version.
3. **Framework-agnostic `@polisprotocol/react`** — no Next.js lock-in.
4. **CSS variable theming** — `--polis-*` prefix prevents conflicts with the consumer app's design system.
5. **Onchain archive, not onchain forum** — day-to-day forum is centralized for UX; only snapshots go onchain for permanence and exit rights.
6. **SIWE over OAuth/magic-link** — wallet identity is user-owned. Sessions are still server-side (Lucia) for UX.
