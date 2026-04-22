# Architecture Decision Records

Decisions that shape Polis Protocol. Each entry is self-contained: context, choice, rationale, trade-offs.

## ADR-001 · Two-repo architecture (protocol + consumer)

**Context:** Polis Protocol is meant to serve many pop-up cities. The first reference consumer (Ipê Hub) is already in production on Vercel.

**Decision:** Protocol lives in public monorepo `polis-protocol/polis` (this repo). Consumers live in separate repos (e.g. `deegalabs/ipehub`) and depend on `@polisprotocol/*` from npm.

**Rationale:**
- Standard OSS pattern (Vercel/Next.js, Automattic/WordPress, Prisma).
- Atomic changes across protocol packages without dragging consumer repos along.
- New cities can bootstrap fast via `pnpm create polis-city` without copying the whole protocol.
- Existing Ipê Hub keeps its deploy pipeline unchanged.

**Trade-off:** Version coordination between protocol and consumer. Mitigated by Changesets + semver discipline.

---

## ADR-002 · BFF (Backend-for-Frontend) pattern

**Context:** Consumers need a stable API contract to Discourse. Discourse's REST API drifts between versions and exposes admin surface.

**Decision:** Interpose a Fastify + GraphQL Yoga server (`@polisprotocol/bff`) between consumers and Discourse.

**Rationale:**
- Discourse API key never leaves the BFF.
- GraphQL gives a single typed endpoint.
- Rate limiting, auth, and caching happen in one place.
- Plugins can extend the GraphQL schema without touching Discourse.

**Trade-off:** Extra hop. Latency cost ~10–30ms (BFF in same region as Discourse). Accepted — the alternative (raw Discourse) leaks admin risk and couples consumers to Discourse versions.

---

## ADR-003 · Framework-agnostic `@polisprotocol/react`

**Context:** The ipehub consumer is Next.js, but future pop-up cities may use Vite, Remix, Astro, or React Native Web.

**Decision:** `@polisprotocol/react` has zero `next/*` imports. Framework-specific concerns (routing, SSR, metadata) are handled by the consumer app or `@polisprotocol/web-starter`.

**Rationale:**
- Don't lock adopters to Next.js.
- Next.js-specific callbacks (e.g. `router.push` after topic creation) are passed as props (`onTopicCreated`).
- tsup emits a `"use client"` banner so the package works cleanly inside Next.js App Router.

**Trade-off:** Some conveniences (Next.js Link) are missing. Consumer must provide them.

---

## ADR-004 · CSS variable theming with `--polis-*` prefix

**Context:** Consumer apps often have their own design system (Tailwind, shadcn/ui, existing CSS). Injecting our tokens could clobber theirs.

**Decision:** All Polis component styles reference variables prefixed `--polis-*`. `PolisProvider` injects a `<style>` block scoped to these names only.

**Rationale:**
- No collision with consumer tokens (`--background`, `--primary`, etc.).
- Runtime theme switching works (just update the `<style>` content).
- Easy to override per-city via `theme.overrides` in `polis.config.ts`.

**Trade-off:** Slightly more verbose token names in component CSS. Accepted.

---

## ADR-005 · SIWE for auth, Lucia for sessions

**Context:** Pop-up cities care about wallet-based identity (network state ethos). But every request hitting a wallet popup would destroy UX.

**Decision:** First sign-in uses SIWE (EIP-4361). After verification, a server-side Lucia session (httpOnly cookie, 30-day TTL) carries subsequent requests.

**Rationale:**
- Wallet identity is user-owned (can't be deplatformed from address).
- Session is still server-side, so we can invalidate, rate-limit, and attach richer user data.
- Lucia v3 + Drizzle adapter is minimal and typed.

**Trade-off:** Session is a centralized primitive — not pure web3. Mitigated by exit rights (user can re-sign from another service with same wallet).

---

## ADR-006 · Onchain archive, not onchain forum

**Context:** Web3 purists would say "put the whole forum onchain." But UX collapses — gas costs, finality delays, moderation impossibility.

**Decision:** Day-to-day forum runs on Discourse (centralized, battle-tested). Critical artifacts (governance decisions, end-of-pop-up snapshots) are pinned to IPFS and their content hashes recorded onchain via `PolisArchive.sol` on Base.

**Rationale:**
- Fast UX for residents who expect forum-grade features.
- Permanent public record of what the community decided.
- "Credibly neutral + exit rights" model (Balaji's Network State playbook).

**Trade-off:** Not Bitcoin-level decentralization. Accepted for v0.1. Progressive path in `ROADMAP.md` toward more decentralization.

---

## ADR-007 · Discourse over Matrix / Farcaster / custom forum

**Context:** Needed a forum backend with categories, topics, replies, moderation, email notifications, mobile web UX, and plugin ecosystem.

**Decision:** Self-hosted Discourse via official Docker setup on Hetzner.

**Rationale:**
- Ships today with the UX residents expect.
- Mature moderation tools (we can't rebuild this in 10 days).
- Supports DiscourseConnect SSO out of the box (maps neatly to wallet-based users).
- Self-hosted = we control the data, backups, and exit.

**Trade-off:**
- Ruby stack we don't ship code to — treated as an API, not a fork.
- ~€13/mo fixed infra cost per city.
- Future option: build a Farcaster/Matrix bridge as a v0.2+ progressive decentralization step.

---

## ADR-008 · npm scope `@polisprotocol`

**Context:** `@polis` was already taken on npm. Needed a scope aligned with branding (Polis Protocol / polis-protocol.org / GitHub org polis-protocol).

**Decision:** `@polisprotocol` (no hyphen).

**Rationale:**
- Mirrors the GitHub org name `polis-protocol` and domain `polis-protocol.org`.
- Clean imports: `import { defineConfig } from '@polisprotocol/core'`.
- No hyphen follows npm scope convention and avoids typos.

**Trade-off:** Longer than `@polis`. Accepted for the unambiguous branding.

---

## ADR-009 · Turborepo + pnpm workspaces

**Context:** Monorepo with 8+ publishable packages that depend on each other.

**Decision:** pnpm 10 workspaces for package linking + Turborepo for task orchestration + caching.

**Rationale:**
- pnpm's content-addressable store avoids npm/yarn duplication.
- Turborepo's remote cache will pay off in CI as the repo grows.
- Both are standard in the TS monorepo ecosystem.

**Trade-off:** Extra config surface (turbo.json, pnpm-workspace.yaml). Accepted.

---

## ADR-010 · Changesets for versioning

**Context:** Multiple packages need independent versioning and a coherent changelog.

**Decision:** `@changesets/cli` + GitHub Action that opens release PRs.

**Rationale:**
- Standard for TS monorepos (Next.js, pnpm itself, Astro, TanStack).
- Forces contributors to declare intent (patch/minor/major) per change.
- Auto-generates changelogs per package.

**Trade-off:** Extra step per non-trivial PR. Mitigated by the existing CI reminder.

---

## ADR-011 · Community primitives stay federated, not bundled

**Context:** A "community" can mean many things — forum, chat, microblog, DMs, governance, social profiles, livestream. Tempting to bundle all of them into a single "community super-app." Each has a mature category winner with very different UX and technical requirements.

**Decision:** Polis Protocol is a **coordination layer**, not a super-app. Each primitive stays as its own system with a best-of-breed implementation. Polis provides identity (SIWE), theming, and composable React components that consume each system. Consumer apps pick which primitives to surface.

**Primitive map:**

| Primitive | Implementation | Reason |
|-----------|---------------|--------|
| Forum (async, threaded) | Discourse | Maturity, moderation, plugins, SSO |
| Chat (channels, sync) | Discourse Chat plugin (v0.1), Matrix (future) | Reuses Discourse infra for v0.1 |
| Microblog / pulse | Farcaster (channel-based), consumed via Neynar | Wallet-native, federated, already standard |
| DMs | XMTP (opt-in) | Wallet-native, decentralized |
| Governance / voting | Snapshot or Tally | Standard, integrable |
| Social profiles | Farcaster / Lens / ENS | Identity is already SIWE-addressable |
| Livestream | Ipê Livestream (separate product) | See ADR-012 |

**Rationale:**
- Each primitive has dedicated teams, open protocols, and momentum. Rebuilding any of them is a 6+ month sink that Polis shouldn't absorb.
- Separation of concerns means each primitive can be swapped or upgraded without refactoring the whole stack.
- Consumer apps (Ipê Hub, future cities) get to choose which primitives matter for their community.

**Trade-off:** Users face multiple UIs instead of one. Mitigated by Polis providing a cohesive "home" that aggregates signals from each primitive, and by deep-linking between them when it makes sense.

---

## ADR-012 · Livestream as standalone product with three integration surfaces

**Context:** Ipê needs real-time video (OpenMic, workshops, talks) with sovereignty, privacy, and LGPD compliance. A full self-hosted livestream stack is documented in the Ipê Livestream architecture — significantly more complex than the forum (WebRTC SFU, RTMP ingest, HLS distribution, PeerTube federation, WebAuthn admin, onchain VOD integrity). Tempting to fuse into the Polis monorepo.

**Decision:** Ipê Livestream stays as a **separate product** with its own repo, domain (`tv.ipevillage.xyz`, `tela.ipevillage.xyz`), deployment pipeline, and threat model. Polis Protocol integrates via three well-defined HTTP/webhook contracts — no shared code.

**The three integration surfaces:**

1. **Live status banner.**
   Livestream exposes `GET /api/status` returning `{ live: bool, title, viewerCount, startedAt }`. Polis `<LiveBanner>` component polls this (or SSE-subscribes) and renders the "live now" state in the community home.

2. **Post-VOD webhook.**
   When livestream finalizes, it POSTs to BFF:
   ```
   POST /webhooks/livestream/vod-finalized
   { title, vodUrl, durationSec, transcript?, summary?, keyMoments?, speakers?, categorySlug }
   ```
   BFF creates a topic in the referenced category (default: `openmic`) linking to the VOD. This turns ephemeral streams into searchable archive.

3. **Deep-linking with timestamps.**
   URL convention: `/community/t/{topicId}#t=14m32s` → topic page auto-seeks the embedded player. And livestream chat messages referencing `#t42` auto-link to the corresponding topic. Bidirectional, no backend coupling.

**Rationale:**
- Livestream and forum have different operational profiles. Coupling them in code would mean the forum team has to understand WebRTC, TURN servers, and HLS segmentation. No.
- HTTP contracts let each side evolve independently.
- Other pop-up cities can use different livestream tooling (YouTube Live, Restream, custom) by implementing the same three surfaces.

**Trade-off:** Integration work is distributed — both teams need to honor the contract. Mitigated by versioning the contract in `docs/` and treating it like any other public API.

---

## ADR-013 · Auth connector is pluggable; BFF stays SIWE-only

**Context:** Farcaster migrated onboarding to Privy (email / social / SMS → embedded wallet auto-created). Many pop-up city residents are not crypto-natives and will never install MetaMask. Forcing external wallet ownership kills conversion. But forcing Privy on the protocol creates SaaS lock-in for every consumer city.

**Decision:** The **BFF stays SIWE-only** — it verifies an EIP-4361 signature and doesn't care how the wallet was created. The **client-side auth connector is pluggable** via `polis.config.ts`:

```ts
integrations: {
  auth: {
    provider: 'privy',               // | 'rainbowkit' | 'custom'
    appId: '<privy-app-id>',
    loginMethods: ['email', 'google', 'farcaster', 'wallet'],
    embeddedWallets: 'users-without-wallets',
  },
}
```

`@polisprotocol/react`'s `PolisProvider` reads the config and mounts the right wagmi connector. SIWE flow is identical from there.

**Provider defaults:**
- **`rainbowkit`** (default for crypto-native cities) — standard wagmi + RainbowKit.
- **`privy`** (default for Ipê Hub and most pop-ups) — Privy for onboarding, embedded wallets auto-created for email/social signups, external wallets still supported.
- **`custom`** — consumer provides their own wagmi connector.

**Rationale:**
- The protocol cannot mandate a paid SaaS (Privy has free tier up to 1k MAU, then $99/mo).
- BFF unchanged means zero vendor-specific logic on the server. Swapping providers in the future costs a client library change, nothing more.
- Ipê gets radically simpler onboarding for non-crypto residents. Other cities get to choose.
- Privy also manages Farcaster signer keys natively, unlocking the `Forum → Farcaster` cross-posting integration (ADR-011) without running our own signer infra.

**Trade-off:** Initial setup for consumer cities is slightly more complex (pick a provider, configure it). Mitigated by providing `@polisprotocol/auth-privy` and `@polisprotocol/auth-rainbowkit` as plug-and-play packages (to extract when a second city adopts Polis).
