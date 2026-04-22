# CLAUDE.md · Ipê Hub

> Read this file before every Claude Code invocation in this repo.

## Project context

Ipê Hub is the existing Next.js app for **Ipê City** — network state pop-up in Florianópolis, April 23 – May 1, 2026. Already in production at **ipehub.xyz** showing People, Events, Apps.

We're adding a `/community` route as a new feature, consuming `@polis/react` from npm. Built + maintained by **DeegaLabs / Peerbase**.

Protocol repo (upstream): [github.com/polis-protocol/polis](https://github.com/polis-protocol/polis)

## Stack

- **Next.js 15** (existing app, App Router)
- **TypeScript** strict
- **Tailwind** + **shadcn/ui** (existing — do not replace)
- **Wagmi v2** + **RainbowKit** (add if not already present, for SIWE)

### From Polis (added via npm)

- `@polis/core` — types, schemas, `defineConfig`
- `@polis/react` — components + hooks for community feature
- `@polis/theme-default` — baseline theme tokens (overridden via config)

### Infrastructure

- BFF hosted separately at `api.ipehub.xyz` (Fly.io GRU) — this app only consumes HTTP
- Discourse backend at `forum.ipehub.xyz` (Hetzner) — never called directly, always through BFF
- Onchain archive in Base mainnet — read-only from this app
- Hosted on Vercel, auto-deploy on push to `main`

## Guardrails

Read carefully — these prevent regressions:

- **Existing routes (`/`, `/people`, `/events`, `/apps`) stay as-is.** We're adding, not refactoring.
- **Don't touch top-level theme tokens.** Polis components scope themselves under `--polis-*` CSS vars. Conflicts are prevented by the prefix.
- **Don't replace the existing nav system** — add the "Community" link following whatever convention is already there (server component, client component, config file, etc).
- **Don't fork `@polis/*`.** If something needs fixing upstream, open an issue at `polis-protocol/polis`. If something is genuinely Ipê-specific, add it as a local plugin or component wrapper.
- **The ipehub is the reference implementation** — keep the integration clean enough that other pop-up cities can look at it for guidance.

## How to integrate

Three steps:

### 1. Wrap layout

```tsx
// src/app/layout.tsx
import { PolisProvider } from '@polis/react';
import polisConfig from '@/polis.config';

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        {/* keep existing providers */}
        <PolisProvider config={polisConfig}>
          {children}
        </PolisProvider>
      </body>
    </html>
  );
}
```

### 2. Create community routes

```tsx
// src/app/community/page.tsx
'use client';
import { CommunityHero, LiveBanner, CategoryList, LatestTopics } from '@polis/react';

export default function CommunityPage() {
  return (
    <>
      <CommunityHero />
      <LiveBanner />
      <CategoryList />
      <LatestTopics limit={4} />
    </>
  );
}
```

```tsx
// src/app/community/c/[slug]/page.tsx
'use client';
import { CategoryView } from '@polis/react';
import { useRouter } from 'next/navigation';

export default function CategoryPage({ params }) {
  const router = useRouter();
  return (
    <CategoryView
      slug={params.slug}
      onTopicCreated={(id) => router.push(`/community/t/${id}`)}
    />
  );
}
```

```tsx
// src/app/community/t/[id]/page.tsx
'use client';
import { TopicView } from '@polis/react';

export default function TopicPage({ params }) {
  return <TopicView id={params.id} />;
}
```

### 3. Config at repo root

```typescript
// polis.config.ts
import { defineConfig } from '@polis/core';
import themeDefault from '@polis/theme-default';

export default defineConfig({
  city: { name: 'Ipê City', slug: 'ipe', cityId: 1 },
  bffUrl: process.env.NEXT_PUBLIC_BFF_URL!,
  theme: {
    tokens: themeDefault,
    overrides: {
      primary: '#BFFF3F',
      serif: 'Instrument Serif',
      sans: 'Manrope',
    },
  },
  integrations: {
    discourse: { url: 'https://forum.ipehub.xyz' },
    luma: { enabled: true, eventId: process.env.LUMA_EVENT_ID! },
    farcaster: { channel: 'ipecity' },
    onchain: { chain: 'base', archive: process.env.ARCHIVE_CONTRACT! },
  },
  features: { siwe: true, livestream: true },
  categories: [
    { slug: 'network-state', name: 'Network State & Theory', color: '#F59E0B' },
    { slug: 'ipe-city', name: 'Ipê City — General', color: '#BFFF3F' },
    { slug: 'builders', name: 'Builders & Buildathon', color: '#60A5FA' },
    { slug: 'governance', name: 'Civic Governance', color: '#C084FC' },
    { slug: 'openmic', name: 'OpenMic Live', color: '#FB923C', live: true },
    { slug: 'show-tell', name: 'Show & Tell', color: '#F472B6' },
    { slug: 'floripa', name: 'Floripa Local', color: '#22D3EE' },
    { slug: 'ops', name: 'Operations', color: '#94A3B8' },
    { slug: 'lounge', name: 'Lounge', color: '#EF4444' }
  ],
});
```

## Environment vars

Add to `.env.local` (and Vercel env for production):

```
NEXT_PUBLIC_BFF_URL=https://api.ipehub.xyz
LUMA_EVENT_ID=evt_xxx
ARCHIVE_CONTRACT=0x...
```

Optional (prod only):

```
SENTRY_DSN=...
SENTRY_AUTH_TOKEN=...
```

## Development workflow

During protocol dev (before `@polis/react` is published to npm):

```bash
# In monorepo
cd ~/work/polis-protocol/polis/packages/react
pnpm link --global

# In this repo
cd ~/work/ipehub
pnpm link --global @polis/react @polis/core @polis/theme-default
pnpm dev
```

After v0.1.0 release:

```bash
pnpm add @polis/core @polis/react @polis/theme-default
pnpm dev
```

## Commits

- Conventional Commits: `feat(community):`, `fix(community):`, `chore:` etc
- Prefer small PRs that add one thing at a time
- Never commit `.env.local` or real keys
- Feature branches, squash merge to `main`

## Testing

Keep existing test setup — just add Playwright specs for the new community routes:

- `/community` loads and shows categories
- SIWE sign-in completes end-to-end
- Creating a topic navigates to topic view
- Replying to a topic shows reply without page reload

## When in doubt

- Protocol question → check `polis-protocol/polis/DEVELOPMENT-PLAN.md`
- Visual question → check `docs/reference/ipe-forum-mockup.html` in the protocol repo
- Existing ipehub question → read the relevant existing file before modifying
- Ambiguous task → ask one clarifying question before writing code
