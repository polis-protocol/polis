# Polis Protocol · Development Plan

> Ship `v0.1.0` by **May 1, 2026** — Ipê Hub Community live em `ipehub.xyz/community`, protocolo público em `github.com/polis-protocol`, usável via `npx create-polis-city`.

**Scope:** 2 devs (Daniel + Dayane) × 10 dias × foco quase total. Claude Code como acelerador principal.

## Estrutura de repos

Dois repos separados, cada um com propósito claro:

| Repo | Visibilidade | Conteúdo | Owner |
|------|--------------|----------|-------|
| `polis-protocol/polis` | **Público** (Apache 2.0) | Monorepo do protocolo: `@polisprotocol/core`, `@polisprotocol/react`, `@polisprotocol/bff`, `@polisprotocol/cli`, `@polisprotocol/theme-default`, `@polisprotocol/web-starter`, contracts, docs, `examples/minimal` | Org `polis-protocol` |
| `deegalabs/ipehub` | App existente (Vercel) | App Next.js do Ipê Hub que já roda em produção (People, Events, Apps). Vai ganhar rota `/community` consumindo `@polisprotocol/react` + `@polisprotocol/core`. | Org `deegalabs` existente |

**Por quê**: protocolo aberto + app cliente separado é o padrão (Vercel/Next.js, Automattic/WordPress, Prisma). O ipehub já existe e funciona — não tem sentido reescrever. Adicionamos `/community` como nova rota consumindo `@polisprotocol/react`. O monorepo `polis-protocol/polis` mantém atomic changes nos packages do protocolo. Outras pop-up cities sem app existente usam `npx create-polis-city` (que gera Next.js novo via `@polisprotocol/web-starter`).

---

## Índice

- [Pre-flight · Decisões](#pre-flight--decisões)
- [Pre-flight · Accounts](#pre-flight--accounts)
- [Pre-flight · Toolchain local](#pre-flight--toolchain-local)
- [Pre-flight · CLAUDE.md template](#pre-flight--claudemd-template)
- [Sprint 0 · Day 0 (Apr 22 evening)](#sprint-0--day-0-apr-22-evening)
- [Sprint 1 · Days 1-2 (Apr 23-24) · Foundation](#sprint-1--days-1-2-apr-23-24--foundation)
- [Sprint 2 · Days 3-4 (Apr 25-26) · Backend](#sprint-2--days-3-4-apr-25-26--backend)
- [Sprint 3 · Days 5-6 (Apr 27-28) · Frontend](#sprint-3--days-5-6-apr-27-28--frontend)
- [Sprint 4 · Days 7-8 (Apr 29-30) · Decentralization](#sprint-4--days-7-8-apr-29-30--decentralization)
- [Sprint 5 · Days 9-10 (May 1-2) · Launch](#sprint-5--days-9-10-may-1-2--launch)
- [Release checklist](#release-checklist)
- [Appendix A · Claude Code prompt library](#appendix-a--claude-code-prompt-library)
- [Appendix B · Scope freeze rules](#appendix-b--scope-freeze-rules)

---

## Pre-flight · Decisões

Bloqueantes. Resolver **hoje** antes de qualquer commit.

- [ ] **Nome do protocolo**: `Polis Protocol` (recomendado) ou alternativa
- [ ] **GitHub org (nova)**: `polis-protocol` (check: `gh api /orgs/polis-protocol` deve retornar 404)
- [ ] **GitHub org (existente)**: `deegalabs` — confirmar ambos Daniel e Dayane têm owner access
- [ ] **Estratégia ipehub**: integração via rota `/community` no app existente, consumindo `@polisprotocol/react` como dep npm. Sem repo novo.
- [ ] **Domínio primário**: `polis-protocol.org` (check com `whois`)
- [ ] **npm scope**: `@polis` (check: `npm view @polis` retorna 404) — org criada manualmente em npmjs.com/org/create
- [ ] **Domain Ipê Hub**: confirmar `ipehub.xyz` aponta pra Vercel e ambos têm acesso
- [ ] **License Polis**: Apache 2.0 (confirmado)
- [ ] **Primary maintainer emails**: daniel@deegalabs.com.br, dayane@deegalabs.com.br
- [ ] **Ipê Guardian integration**: compartilha User Registry ou fica independente? *(default recomendado: compartilha a partir do v0.2; v0.1 foca só em Community)*

---

## Pre-flight · Accounts

Criar todas antes de começar. Maioria free tier.

- [ ] **GitHub**: 
  - Nova org `polis-protocol` (Daniel owner, Dayane admin) → vai hospedar o monorepo `polis-protocol/polis`
  - Org existente `deegalabs` → vai hospedar `deegalabs/ipehub`
- [ ] **npm**: org `@polis` (npmjs.com/org/create, Daniel owner, Dayane admin, 2FA obrigatório)
- [ ] **Vercel** · connect GitHub (ambas orgs), setup ipehub.xyz + docs.polis-protocol.org
- [ ] **Fly.io** · org, region GRU (São Paulo), CC cadastrado
- [ ] **Hetzner Cloud** · CC cadastrado, SSH key uploaded
- [ ] **Neon** · projeto `polis-ipe-registry`, region us-east-2
- [ ] **Upstash Redis** · database `polis-cache`, region global
- [ ] **Cloudflare** · account, R2 bucket `polis-uploads`, DNS pra domains
- [ ] **Pinata** · API key + secret
- [ ] **web3.storage** · API token
- [ ] **Alchemy** · app pra Base mainnet + Base Sepolia
- [ ] **Mintlify** · docs site vinculado ao GitHub
- [ ] **Sentry** · projetos `polis-bff`, `polis-web`
- [ ] **Axiom** · dataset `polis-logs`
- [ ] **Doppler** · projeto `polis-protocol`, envs `dev`/`staging`/`prod`
- [ ] **npmjs.com** · org `@polis`, 2FA ativado, token gerado
- [ ] **Farcaster** · conta `@polis` ou `@ipe-bot` com signer key
- [ ] **Neynar** · API key pra Farcaster bridge

**Tempo total:** 1.5h · pode paralelizar entre Daniel e Dayane.

---

## Pre-flight · Toolchain local

```bash
# Node 22 via nvm
nvm install 22 && nvm use 22 && nvm alias default 22

# pnpm via corepack
corepack enable
corepack prepare pnpm@9.12.0 --activate

# Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Fly CLI
curl -L https://fly.io/install.sh | sh

# GitHub CLI
brew install gh && gh auth login

# Docker (confirma running)
docker --version

# Claude Code (já instalado)
claude --version

# age (encryption pros backups)
brew install age

# jq (util pra scripts)
brew install jq

# Vercel CLI
pnpm add -g vercel

# Doppler CLI
brew install dopplerhq/cli/doppler
```

Validação:
```bash
node --version   # v22.x
pnpm --version   # 9.12.x
forge --version  # 0.2.x
flyctl version
claude --version
```

---

## Pre-flight · CLAUDE.md template

São **dois arquivos** — um pra cada repo. Claude Code lê automaticamente em cada invocação dentro do repo respectivo.

### Arquivo 1: `polis-protocol/polis/CLAUDE.md`

```markdown
# CLAUDE.md · Polis Protocol

## Project context
Polis Protocol is an open-source stack for pop-up cities. This repo (`polis-protocol/polis`) is the monorepo containing the generic protocol. Reference implementations (like `deegalabs/ipehub`) live in separate repos and consume `@polisprotocol/*` as npm dependencies.

## Stack
- TypeScript (strict mode everywhere)
- pnpm workspaces + Turborepo
- Next.js 15 (App Router, RSC) for web
- Fastify + GraphQL Yoga + Pothos for BFF
- Drizzle ORM + Postgres (Neon)
- Lucia for auth, SIWE for wallet sign-in
- Discourse (self-hosted) as forum backend
- Foundry + Solidity 0.8.24 for contracts
- Base mainnet + Base Sepolia
- Vitest (unit), Playwright (e2e), Forge (contracts)

## Conventions
- Package names: @polisprotocol/<name> for libraries, no scope for apps
- Commits: Conventional Commits (feat:, fix:, chore:, docs:)
- Branches: main (protected) + feature branches
- PRs required, squash merge
- Changesets for versioning
- Files: kebab-case for filenames, PascalCase for React components
- Never use `any` — use `unknown` + type guards
- Always Zod-validate external input (API, env, config)
- GraphQL schema-first via Pothos code-first builder

## Key files
- `packages/core/src/schema.ts` — canonical Zod schemas
- `packages/core/src/db/schema.ts` — Drizzle schema
- `packages/bff/src/server.ts` — Fastify entrypoint
- `packages/react/src` — components + hooks library
- `packages/web-starter` — Next.js scaffold for new cities (used by CLI)

## Guardrails
- Don't introduce new dependencies without asking
- Don't invent API keys — use process.env and .env.example
- When writing migrations, always include both up and down
- Tests are not optional for new logic
- If a task is ambiguous, ask one question before writing code
- **This is a PROTOCOL repo — nothing Ipê-specific should land here.** Ipê-specific code goes to `deegalabs/ipehub`.
```

### Arquivo 2: `deegalabs/ipehub/CLAUDE.md`

```markdown
# CLAUDE.md · Ipê Hub

## Project context
Ipê Hub is the existing app for Ipê City (network state pop-up in Florianópolis). Already in production showing People, Events, Apps. Adding `/community` route as new feature, consuming `@polisprotocol/react` from npm. Built + maintained by DeegaLabs / Peerbase.

Protocol repo: github.com/polis-protocol/polis

## Stack
- Next.js 15 (existing app — already in production)
- TypeScript strict
- Consumes: @polisprotocol/core, @polisprotocol/react, @polisprotocol/theme-default
- BFF consumed via HTTP (api.ipehub.xyz)
- Tailwind + shadcn/ui (existing) — extend with Polis tokens
- Wagmi + RainbowKit for wallet (add if not present)

## Conventions
- Commits: Conventional Commits
- Theme: extend @polisprotocol/theme-default via overrides, don't fork
- Plugins: add under `src/plugins/`, register in `polis.config.ts`
- All Ipê-specific customizations live HERE, not upstream

## Key files
- `polis.config.ts` — city config (city, theme, integrations, features, categories, plugins)
- `src/plugins/verify-resident.ts` — Ipê-specific plugin
- `src/theme/` — theme overrides
- `.env.local` — secrets (not committed)

## Guardrails
- Don't patch @polisprotocol/* by forking — file issues upstream or extend via plugins
- Existing ipehub features (People, Events, Apps) stay as-is — we're adding, not refactoring
- Keep the `/community` integration clean enough to serve as "how to build on Polis" reference for other cities
```

**Tempo:** 15min (ambos arquivos).

---

## Sprint 0 · Day 0 (Apr 22 evening)

Setup final. Alinhamento antes do modo beast mode.

- [ ] **T0.1** Confirmar todas as decisões da seção "Pre-flight · Decisões"
- [ ] **T0.2** Criar todas as contas da seção "Pre-flight · Accounts"
- [ ] **T0.3** Instalar toolchain local em ambas máquinas (Daniel + Dayane)

### T0.4 · Criar GitHub org `polis-protocol`

**Time:** 20min · **Owner:** Daniel

Via browser (GitHub não permite criar org via CLI):

```
1. https://github.com/organizations/plan → Create a free organization
2. Name: polis-protocol
3. Contact email: daniel@deegalabs.com.br
4. Type: My personal account
5. Não fazer parte de empresa (org pública independente, mantida pela DeegaLabs)
```

Após criação, via CLI:

```bash
# Add Dayane as admin
gh api -X PUT /orgs/polis-protocol/memberships/<dayane-github-username> \
  -f role=admin

# Settings essenciais (via browser, Settings → ...)
# - Require 2FA for all members
# - Default branch: main
# - Dependabot alerts: on
# - Secret scanning: on
# - Fork policy: allow forks of all types (important for OSS)

# Criar org profile repo
gh repo create polis-protocol/.github --public --description "Org profile"
cd /tmp && git clone git@github.com:polis-protocol/.github.git
cd .github && mkdir profile
cat > profile/README.md << 'EOF'
# Polis Protocol

Open protocol for pop-up cities. One stack, many cities.

→ [github.com/polis-protocol/polis](https://github.com/polis-protocol/polis)  
→ [polis-protocol.org](https://polis-protocol.org) · docs  
→ Initiated by [DeegaLabs](https://deegalabs.com.br)
EOF
git add -A && git commit -m "init: org profile" && git push
```

### T0.5 · Criar npm org `@polis`

**Time:** 10min · **Owner:** Daniel

```
1. https://www.npmjs.com/org/create
2. Org name: polis
3. Plan: Free (unlimited public packages)
4. Add Dayane as admin via Team settings
5. Enable 2FA requirement for all members
6. Generate automation token for CI:
   Profile → Access Tokens → Generate New Token → Automation
   Copy → add as GitHub secret NPM_TOKEN in polis-protocol/polis repo
```

### T0.6 · Setup restante

- [ ] **T0.6** Registrar domínios: `polis-protocol.org`, opcional `polisprotocol.xyz`
- [ ] **T0.7** Confirmar acesso a `deegalabs` org (onde vai ficar `deegalabs/ipehub`)
- [ ] **T0.8** Criar canal `#polis-dev` no Telegram/Slack pra coordenação
- [ ] **T0.9** Bloquear agenda dos 10 dias no Google Calendar

---

## Sprint 1 · Days 1-2 (Apr 23-24) · Foundation

**Goal:** Monorepo bootstrapped, CI verde, repo público, docs scaffold, release pipeline.

### T1.1 · Criar repo do protocolo + clone
**Time:** 15min · **Owner:** Daniel

```bash
# Monorepo do protocolo vai em polis-protocol/polis
gh repo create polis-protocol/polis --public --license apache-2.0 \
  --description "Open protocol for pop-up cities. One stack, many cities." \
  --homepage "https://polis-protocol.org"
git clone git@github.com:polis-protocol/polis.git
cd polis
```

**DoD:** Repo público visível em `github.com/polis-protocol/polis`, Apache 2.0 aplicado, description + homepage configurados.

---

### T1.2 · Bootstrap monorepo
**Deps:** T1.1 · **Time:** 1h · **Owner:** Daniel

```bash
pnpm init
# edit package.json: set private: true, name: polis-protocol
```

**Claude Code prompt:**
> Bootstrap a Turborepo monorepo. Create `pnpm-workspace.yaml` with packages under `packages/*`, `apps/*`, `examples/*`, `infra/*`. Create `turbo.json` with pipelines for `build`, `test`, `lint`, `dev` (persistent), `typecheck`. Create root `package.json` scripts that proxy to turbo. Add `.npmrc` with `strict-peer-dependencies=false` and `auto-install-peers=true`. Add root `tsconfig.base.json` with strict mode, module `NodeNext`, target `ES2022`. Add root `.eslintrc.cjs` with `@typescript-eslint/recommended` and `prettier`. Add `.gitignore` covering node_modules, dist, .turbo, .env*, .DS_Store.

**DoD:**
- [ ] `pnpm install` runs without error
- [ ] `pnpm turbo run build` executes (even if no packages yet)
- [ ] `tree -L 2 -I node_modules` shows expected structure

---

### T1.3 · Shared tooling packages
**Deps:** T1.2 · **Time:** 45min · **Owner:** Daniel

```bash
mkdir -p packages/tsconfig packages/eslint-config
```

**Claude Code prompt:**
> Create two internal packages: `@polisprotocol/tsconfig` with three tsconfig variants (`base.json`, `nextjs.json`, `node.json`); and `@polisprotocol/eslint-config` with shared ESLint flat config for TypeScript + React + Next. Both packages should be workspace-internal only (`"private": true`), published as pnpm workspaces.

**DoD:** `packages/tsconfig` e `packages/eslint-config` existem e `pnpm install` resolve.

---

### T1.4 · Changesets + release automation
**Deps:** T1.2 · **Time:** 30min · **Owner:** Dayane

```bash
pnpm add -Dw @changesets/cli
pnpm changeset init
```

**Claude Code prompt:**
> Configure Changesets in `.changeset/config.json` for a monorepo where packages under `@polisprotocol/*` are published to npm. Set `access: public`, `commit: false`, ignore pattern for `apps/*` and `examples/*`. Add GitHub Action `.github/workflows/release.yml` that runs on push to `main`, calls `changesets/action` with publish script `pnpm -r publish --access public`. Require `NPM_TOKEN` and `GITHUB_TOKEN` secrets.

**DoD:** `pnpm changeset status` roda OK; workflow visible na UI do repo.

---

### T1.5 · CI pipeline
**Deps:** T1.2 · **Time:** 45min · **Owner:** Dayane

**Claude Code prompt:**
> Create `.github/workflows/ci.yml` that runs on PR and push to main. Matrix: Node 20 + 22. Steps: checkout, setup pnpm@9.12, install, lint, typecheck, test, build. Cache pnpm store and turbo remote cache via `actions/cache`. Add separate workflow `.github/workflows/contracts.yml` that only runs when `packages/contracts/**` changes — runs `forge fmt --check`, `forge test -vvv`, `forge coverage` with Foundry setup via `foundry-rs/foundry-toolchain@v1`. Add status badge snippets for README.

**DoD:** Abrir PR dummy e ver ambos workflows passando.

---

### T1.6 · Governance + community files
**Deps:** T1.1 · **Time:** 30min · **Owner:** Daniel

Criar no root:
- `README.md` com hero + what is Polis + quickstart + links
- `CONTRIBUTING.md` com workflow de PR + commit convention
- `CODE_OF_CONDUCT.md` (Contributor Covenant v2.1)
- `GOVERNANCE.md` com modelo BDFL light → steering committee
- `SECURITY.md` com disclosure policy (email: security@polis-protocol.org)
- `.github/ISSUE_TEMPLATE/` com bug, feature, rfc templates
- `.github/PULL_REQUEST_TEMPLATE.md`

**Claude Code prompt:**
> Generate all governance files for an open-source protocol project. Apache 2.0 license. Maintained by DeegaLabs (Daniel Gorgonha, Dayane Gorgonha). Based on the Ipê Hub reference implementation. BDFL light → steering committee model once 3+ cities in production. Contributor Covenant 2.1 CoC. Issue templates should include: bug, feature request, RFC (with template sections Motivation, Design, Alternatives, Risks, Rollout). PR template requires DoD checklist.

**DoD:** Todos arquivos criados, visíveis na homepage do repo no GitHub.

---

### T1.7 · Mintlify docs scaffold
**Deps:** T1.1 · **Time:** 1h · **Owner:** Dayane

```bash
mkdir -p apps/docs && cd apps/docs
npx mintlify@latest init
```

**Claude Code prompt:**
> Configure Mintlify docs in `apps/docs/`. Set up navigation with groups: Introduction (what is polis, quickstart), Architecture (overview, bff, frontend, contracts, decentralization), Customization (theming, plugins, categories), Deploy (self-hosted, terraform, cloud), Reference (GraphQL API, CLI, SDK). Create `mint.json` with dark theme, primary color `#BFFF3F`, font `Instrument Serif` for display and `Manrope` for body. Add placeholder pages with only frontmatter for now — content fills later.

**DoD:** `cd apps/docs && mintlify dev` sobe local em `localhost:3000`.

---

### T1.8 · Domínios + DNS
**Deps:** T0.5 · **Time:** 30min · **Owner:** Daniel

Via Cloudflare dashboard, apontar:
- `polis-protocol.org` → Vercel (future docs)
- `docs.polis-protocol.org` → Mintlify
- `forum.ipehub.xyz` → Hetzner VPS (vai ser criado no Sprint 2)
- `api.ipehub.xyz` → Fly.io (vai ser criado no Sprint 2)

**DoD:** `dig docs.polis-protocol.org` retorna o CNAME correto.

---

**Sprint 1 End-of-day 2 check:**
- ✅ Repo público, CI verde, pelo menos 5 commits
- ✅ Docs roda local com navegação estruturada
- ✅ Issue templates + governance files no GitHub
- ✅ Domínios apontados

---

## Sprint 2 · Days 3-4 (Apr 25-26) · Backend

**Goal:** `@polisprotocol/core` + `@polisprotocol/bff` funcionando, Discourse self-hosted live, SIWE login end-to-end criando Discourse user.

### T2.1 · @polisprotocol/core — types + Zod schemas
**Time:** 1.5h · **Owner:** Daniel

```bash
mkdir -p packages/core/src && cd packages/core
pnpm init
pnpm add zod
pnpm add -D typescript @polisprotocol/tsconfig @polisprotocol/eslint-config tsup
```

**Claude Code prompt:**
> Create `@polisprotocol/core` package exporting canonical domain types and Zod schemas. Entities: `City`, `Category`, `User`, `Post`, `Reply`, `Plugin`, `Theme`, `Integration`. Each entity has TypeScript type + Zod schema. Also export `defineConfig` helper that accepts a `PolisConfig` object (city, theme, integrations, features, categories, plugins) and returns it typed. Use tsup to build ESM + CJS + d.ts. Set up `package.json` exports field correctly. Add unit tests in `src/__tests__/` validating schemas with valid + invalid inputs using Vitest.

**DoD:**
- [ ] `pnpm build` produces `dist/`
- [ ] `pnpm test` passes
- [ ] `import { defineConfig } from "@polisprotocol/core"` works from another package

---

### T2.2 · @polisprotocol/core — Drizzle schema
**Deps:** T2.1 · **Time:** 1h · **Owner:** Daniel

```bash
cd packages/core
pnpm add drizzle-orm postgres
pnpm add -D drizzle-kit
```

**Claude Code prompt:**
> Add Drizzle ORM schema for the User Registry in `packages/core/src/db/schema.ts`. Tables:  
> `cities(id serial pk, slug text unique, name text, on_chain_city_id integer, created_at timestamptz)`  
> `users(id serial pk, city_id integer fk, wallet_address text, luma_user_id text, discourse_user_id integer, farcaster_fid integer, display_name text, resident_verified_at timestamptz, created_at timestamptz)`  
> `sessions(id text pk, user_id integer fk, expires_at timestamptz)`  
> Include indexes on wallet_address, luma_user_id, discourse_user_id. Configure `drizzle.config.ts` for migrations output to `packages/core/migrations/`. Add scripts `db:generate`, `db:migrate`, `db:studio`.

**DoD:**
- [ ] `pnpm db:generate` creates first migration
- [ ] `pnpm db:migrate` runs against Neon dev branch
- [ ] `pnpm db:studio` opens Drizzle Studio

---

### T2.3 · @polisprotocol/bff — Fastify + plugin system
**Deps:** T2.1 · **Time:** 1.5h · **Owner:** Dayane

```bash
mkdir -p packages/bff/src && cd packages/bff
pnpm init
pnpm add fastify @fastify/cors @fastify/cookie @fastify/helmet @fastify/rate-limit
pnpm add graphql graphql-yoga @pothos/core @pothos/plugin-scope-auth
pnpm add @polisprotocol/core pino pino-pretty
pnpm add -D tsx @types/node
```

**Claude Code prompt:**
> Create `@polisprotocol/bff` Fastify server with GraphQL Yoga + Pothos. Entry point at `src/server.ts`. Register plugins: helmet, cors (configurable), rate-limit (100 req/min per IP), cookie. Load config from `polis.config.ts` via `defineConfig`. Mount GraphQL Yoga at `/graphql`. Setup Pothos SchemaBuilder with plugin slots for future extension. Add healthcheck at `/health` returning status + version. Environment validation via Zod (`DATABASE_URL`, `REDIS_URL`, `DISCOURSE_URL`, `DISCOURSE_API_KEY`, `SESSION_SECRET`, `SIWE_DOMAIN`, `NODE_ENV`). Export `createServer(config)` factory so tests can instantiate without listening. Add dev script with tsx watch.

**DoD:**
- [ ] `pnpm dev` sobe em `localhost:4000`
- [ ] GET `/health` retorna 200
- [ ] POST `/graphql` com query `{ __typename }` retorna OK

---

### T2.4 · @polisprotocol/bff — Discourse client adapter
**Deps:** T2.3 · **Time:** 2h · **Owner:** Dayane

**Claude Code prompt:**
> In `packages/bff/src/adapters/discourse.ts`, build a typed Discourse API client wrapping these endpoints (all JSON):  
> GET `/categories.json`  
> GET `/c/:slug/:id.json` (topics in category)  
> GET `/t/:id.json` (topic with posts)  
> POST `/posts.json` (create post)  
> POST `/t/:id/posts.json` (reply to topic)  
> GET `/users/:username.json`  
> POST `/users.json` (create user via SSO)  
> Use native fetch (Node 22 has it). Headers: `Api-Key`, `Api-Username`. Add retry with exponential backoff for 5xx (max 3). Wrap responses in Zod validators. Export a `DiscourseClient` class taking `baseUrl` + `apiKey` in constructor. Add integration tests using MSW that mock Discourse responses.

**DoD:**
- [ ] `DiscourseClient.listCategories()` typed + tested
- [ ] `DiscourseClient.createPost({...})` tested
- [ ] Coverage > 80% on adapter

---

### T2.5 · @polisprotocol/bff — Auth via SIWE + Lucia
**Deps:** T2.3, T2.2 · **Time:** 2.5h · **Owner:** Daniel

```bash
cd packages/bff
pnpm add lucia siwe viem @lucia-auth/adapter-drizzle
```

**Claude Code prompt:**
> Implement SIWE auth flow in BFF. Routes:  
> POST `/auth/nonce` → generates + stores nonce in Redis (5min TTL), returns `{ nonce }`  
> POST `/auth/verify` → accepts `{ message, signature }`, verifies SIWE with viem `verifyMessage`, looks up/creates user in registry, upserts Discourse user via SSO, creates Lucia session, sets httpOnly cookie  
> POST `/auth/logout` → invalidates session  
> GET `/auth/me` → returns current user or 401  
>   
> Lucia v3 with Drizzle adapter. Session cookie: `SameSite=Lax`, `Secure` in prod, 30 day TTL. The Discourse SSO creation uses DiscourseConnect — generate signed SSO payload with `DISCOURSE_SSO_SECRET`, POST to `/admin/users/sync_sso.json`. Create users in Discourse with username derived from wallet address (first 8 chars + `_w`). Store `discourseUserId` in registry after creation.

**DoD:**
- [ ] Curl flow: nonce → sign (manual test wallet) → verify → cookie set → `/auth/me` returns user
- [ ] New user appears in Discourse admin panel
- [ ] Session invalidation works

---

### T2.6 · @polisprotocol/bff — First GraphQL resolvers
**Deps:** T2.4, T2.5 · **Time:** 1.5h · **Owner:** Dayane

**Claude Code prompt:**
> Using Pothos, expose GraphQL types + queries + mutations:  
> Types: `Category`, `Topic`, `Post`, `User`  
> Queries: `categories`, `category(slug)`, `topics(categorySlug, limit, offset)`, `topic(id)`, `me`  
> Mutations: `createTopic(categoryId, title, body)`, `createReply(topicId, body)`  
>   
> All resolvers call DiscourseClient internally. Use DataLoader for batching user lookups across posts. Return typed errors via Pothos error plugin (`NotFoundError`, `UnauthorizedError`, `ValidationError`). Tests with Vitest + MSW mocked Discourse.

**DoD:**
- [ ] GraphQL playground shows all types + ops
- [ ] Query `{ categories { id name slug } }` returns real Discourse data
- [ ] Mutation `createTopic` creates real topic

---

### T2.7 · Deploy Discourse to Hetzner
**Time:** 2h · **Owner:** Daniel

```bash
# via Hetzner Console, spin up CCX13 (2vCPU, 8GB, €13/mo), Helsinki or Nuremberg
# SSH in
ssh root@<ip>
apt update && apt upgrade -y
```

**Claude Code prompt (run locally as reference):**
> Provide step-by-step script to install Discourse via official Docker method: clone discourse/discourse_docker, run `./discourse-setup`, configure SMTP (use SendGrid/Mailgun free tier), point DNS `forum.ipehub.xyz` to the IP, setup Let's Encrypt. Configure admin account `daniel@deegalabs.com.br`. Enable DiscourseConnect (Admin → Settings → Login). Set `enable_discourse_connect` true, `discourse_connect_url` to `https://api.ipehub.xyz/auth/sso`, generate + store secret. Enable `api_key` for bff usage under Admin → API. Install plugin discourse-graphql (optional, we use REST in v0.1).

**DoD:**
- [ ] `https://forum.ipehub.xyz` loads Discourse homepage
- [ ] Admin login works
- [ ] `curl -H "Api-Key: ..." https://forum.ipehub.xyz/categories.json` returns JSON

---

### T2.8 · Create Ipê categories in Discourse
**Deps:** T2.7 · **Time:** 30min · **Owner:** Dayane

Via Admin UI, criar as 9 categorias do mockup com cores corretas:
Network State & Theory (amber), Ipê City (neon), Builders (blue), Civic Governance (violet), OpenMic Live (orange), Show & Tell (pink), Floripa Local (cyan), Operations (gray), Lounge (red).

**DoD:** Categorias visíveis via `/categories.json`.

---

### T2.9 · Deploy BFF to Fly.io
**Deps:** T2.6 · **Time:** 1h · **Owner:** Dayane

```bash
cd packages/bff
flyctl launch --region gru --no-deploy --name polis-bff-ipe
```

**Claude Code prompt:**
> Generate `fly.toml` for the BFF. Region `gru` (São Paulo). App name `polis-bff-ipe`. Internal port 4000. Autostart on requests, autostop after 5min idle. Memory 512MB. Configure health check `/health`. Add `Dockerfile` optimized for Node 22 (multi-stage build, pnpm deploy, production only). Set secrets via `flyctl secrets set` for all env vars. Add deploy script to `package.json`: `"deploy": "flyctl deploy --ha=false"`.

**DoD:**
- [ ] `curl https://polis-bff-ipe.fly.dev/health` returns 200
- [ ] GraphQL playground accessible at `/graphql`
- [ ] Can query real Discourse data through Fly-hosted BFF

---

### T2.10 · E2E smoke test
**Deps:** T2.9 · **Time:** 45min · **Owner:** Daniel

Manual + `scripts/smoke-test.ts`:
1. Generate test wallet (viem)
2. POST `/auth/nonce` → get nonce
3. Sign SIWE message
4. POST `/auth/verify` → session cookie returned
5. Query `me` via GraphQL → user data
6. Check Discourse admin → new user present
7. Mutation `createTopic` → appears in Discourse

**DoD:** Script passa sem erro 3x seguidas.

---

**Sprint 2 End-of-day 4 check:**
- ✅ BFF deployed em GRU, responding em `api.ipehub.xyz`
- ✅ Discourse live em `forum.ipehub.xyz` com 9 categorias
- ✅ SIWE flow end-to-end funcionando
- ✅ GraphQL API operacional

---

## Sprint 3 · Days 5-6 (Apr 27-28) · Frontend

**Goal:** `@polisprotocol/react` library publicada (components + hooks), integrada no ipehub existente como rota `/community`, live em produção.

### T3.1 · @polisprotocol/react package scaffold
**Time:** 1.5h · **Owner:** Daniel

```bash
mkdir -p packages/react/src && cd packages/react
pnpm init
pnpm add react react-dom @tanstack/react-query graphql-request siwe wagmi viem @rainbow-me/rainbowkit
pnpm add @polisprotocol/core
pnpm add -D typescript @polisprotocol/tsconfig @polisprotocol/eslint-config tsup react@18 @types/react vitest @testing-library/react jsdom
```

**Claude Code prompt:**
> Create `@polisprotocol/react` package — framework-agnostic React library exporting components + hooks for Polis Community feature. Structure:
> - `src/components/` — UI components (CategoryList, TopicCard, TopicView, ComposeDialog, ReplyBar, LiveBanner, CommunityHero)
> - `src/hooks/` — data hooks (useCategories, useTopic, useTopics, useCreateTopic, useCreateReply, useSIWE, useRealtime)
> - `src/providers/` — `<PolisProvider config={...}>` wrapper that sets up GQL client + WagmiProvider + QueryClientProvider internally
> - `src/styles/` — theme CSS variables (consumed via `@polisprotocol/theme-default`)
> - `src/index.ts` — barrel export
> 
> Build with tsup (ESM + CJS + d.ts), peer deps: react ^18 || ^19, wagmi ^2, viem ^2. Make sure components don't import next/* or any framework-specific code — they must work in any React app. Add Vitest + @testing-library/react setup with jsdom. Configure `package.json` exports field correctly.

**DoD:**
- [ ] `pnpm build` produces dist/
- [ ] `pnpm test` passes
- [ ] `import { CategoryList } from "@polisprotocol/react"` works from a fresh app

---

### T3.2 · Hooks: data layer
**Deps:** T3.1 · **Time:** 2h · **Owner:** Daniel

**Claude Code prompt:**
> Implement data hooks in `packages/react/src/hooks/`:
> - `useGqlClient()` — returns memoized graphql-request client pointing to `config.bffUrl`
> - `useCategories()` — TanStack Query wrapper for `categories` query, 60s staleTime
> - `useTopics(categorySlug, opts?)` — paginated topics in category, infinite query
> - `useTopic(id)` — single topic with replies
> - `useCreateTopic()` — mutation, optimistic update, invalidates topics query
> - `useCreateReply()` — mutation, optimistic update, invalidates topic query
> - `useSIWE()` — full SIWE flow (nonce → sign → verify), exposes `signIn()`, `signOut()`, `user`, `status`
> - `useMe()` — current authenticated user
> 
> All hooks read config via `usePolisConfig()` (from PolisProvider context). Tests with MSW mocking the BFF endpoints.

**DoD:**
- [ ] All hooks tested
- [ ] Type inference works end-to-end (no `any`)

---

### T3.3 · Components: home + category list
**Deps:** T3.2 · **Time:** 2h · **Owner:** Dayane

**Claude Code prompt:**
> Implement components in `packages/react/src/components/`:
> - `<CommunityHero>` — serif title from props, stats row (topics, posts, active members)
> - `<LiveBanner>` — pulse dot, shows when livestream feature enabled and active
> - `<CategoryList>` — fetches via useCategories, renders cards with color dot + name + description + count
> - `<LatestTopics limit={4}>` — recent topics across categories
> - `<TopicCard>` — single topic preview (used by LatestTopics + CategoryView)
> 
> Match the visual from `docs/reference/ipe-forum-mockup.html` (commit the mockup HTML to docs/reference/ first). Use Tailwind utilities — assume host app has Tailwind 3+ configured. Theme via CSS variables consumed from `@polisprotocol/theme-default`. Loading skeletons via shimmer animation. No shadcn dependency — keep components self-contained.

**DoD:**
- [ ] Components render in Storybook (add Storybook setup)
- [ ] Visual matches mockup mobile + desktop

---

### T3.4 · Components: category + topic views
**Deps:** T3.3 · **Time:** 2h · **Owner:** Dayane

**Claude Code prompt:**
> Implement:
> - `<CategoryView slug={...}>` — header with category color/name/desc, paginated topic list using useTopics, FAB that opens compose dialog when authenticated
> - `<TopicView id={...}>` — serif title, meta (views/replies/time), markdown body via react-markdown + remark-gfm, replies list, ReplyBar fixed bottom
> - `<Post>` — single post (used by TopicView for OP + replies)
> - `<ReplyBar>` — input + send button, calls useCreateReply, optimistic UI
> 
> Same visual + theme conventions as T3.3.

**DoD:** Componentes navegáveis em Storybook.

---

### T3.5 · Components: compose dialog
**Deps:** T3.4 · **Time:** 1.5h · **Owner:** Dayane

```bash
cd packages/react
pnpm add @tiptap/react @tiptap/starter-kit @tiptap/extension-link @tiptap/extension-placeholder
```

**Claude Code prompt:**
> Implement `<ComposeDialog open={...} onClose={...} defaultCategory={...}>`:
> - Full-screen modal (use Radix Dialog primitive, no shadcn dep)
> - Category chip selector (horizontal scroll, picks from useCategories)
> - Serif title input
> - TipTap editor with markdown serialization
> - Toolbar: bold, italic, code, link, image upload (POST to bff /uploads → R2)
> - Publish button calls useCreateTopic
> - On success: closes dialog, navigates via callback prop `onSuccess(topicId)` (host app handles routing)

**DoD:** Componente funcional, criar topic end-to-end via Storybook.

---

### T3.6 · Hook: useRealtime (SSE)
**Deps:** T3.2 · **Time:** 1.5h · **Owner:** Daniel

**Claude Code prompt:**
> In `packages/react/src/hooks/useRealtime.ts`, implement SSE client hook `useRealtime(channel: string)`:
> - Opens `EventSource(${config.bffUrl}/stream/${channel})`
> - Auto-reconnect with Last-Event-ID header
> - On event `post_created` or `topic_created`, invalidates relevant TanStack Query keys
> - Returns `{ status: 'connecting' | 'open' | 'closed', lastEvent }`
> - Cleanup on unmount
> 
> In BFF (`packages/bff`), add SSE endpoint `/stream/:channel` that subscribes to Redis pub/sub. Discourse webhook receiver at `/webhooks/discourse` validates signature (HMAC) and publishes to Redis channel `community:<id>`. Register webhook in Discourse admin for events: `post_created`, `topic_created`.

**DoD:**
- [ ] 2 browsers abertos no mesmo tópico — post em um aparece no outro em <2s
- [ ] Reconexão automática ao perder rede

---

### T3.7 · Theme system
**Deps:** T3.1 · **Time:** 1h · **Owner:** Dayane

**Claude Code prompt:**
> Implement theme system:
> 1. In `@polisprotocol/core/src/theme.ts`, define `Theme` type with tokens: colors (primary, bg-deep, bg-card, text-primary, text-secondary, accent-cyan, accent-amber, accent-violet, accent-pink, accent-orange, accent-blue, accent-red), fonts (serif, sans, mono), radius (sm, md, lg, xl).
> 2. Create `@polisprotocol/theme-default` package exporting baseline dark theme + a `injectThemeCSS(theme)` helper that returns a CSS string of variables.
> 3. In `@polisprotocol/react`, the `<PolisProvider>` injects theme CSS variables via `<style>` tag in head, consumed by all components via `var(--polis-*)`.
> 4. Tailwind plugin `@polisprotocol/tailwind-preset` (lightweight) maps `--polis-*` vars to Tailwind theme keys for utilities like `bg-polis-card`, `text-polis-primary`.

**DoD:**
- [ ] Mudar tema na config → Storybook reflete imediatamente
- [ ] Override de cor única funciona via `theme.overrides`

---

### T3.8 · Integrar `@polisprotocol/react` no ipehub existente
**Deps:** T3.7 · **Time:** 2h · **Owner:** Daniel

O ipehub já está em produção. **Não criar repo novo** — adicionar feature como rota nova no app existente.

```bash
cd ~/work/ipehub  # ou onde quer que o repo já clonado esteja

# Durante dev local, usa pnpm link pra trabalhar contra @polisprotocol/react sem publicar
cd ~/work/polis-protocol/polis/packages/react
pnpm link --global
cd ~/work/ipehub
pnpm link --global @polisprotocol/react @polisprotocol/core @polisprotocol/theme-default

# Quando @polisprotocol/* estiver publicado em npm:
# pnpm add @polisprotocol/core @polisprotocol/react @polisprotocol/theme-default
```

Criar `~/work/ipehub/polis.config.ts`:

```typescript
import { defineConfig } from '@polisprotocol/core';
import themeDefault from '@polisprotocol/theme-default';

export default defineConfig({
  city: { name: 'Ipê City', slug: 'ipe', cityId: 1 },
  bffUrl: process.env.NEXT_PUBLIC_BFF_URL!,
  theme: {
    tokens: themeDefault,
    overrides: { primary: '#BFFF3F', serif: 'Instrument Serif', sans: 'Manrope' },
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

**Claude Code prompt** (rodar dentro de `~/work/ipehub`):
> Add Polis Community feature to this existing Next.js app. Don't refactor existing routes (People, Events, Apps). Steps:
> 1. Wrap root layout (`src/app/layout.tsx`) with `<PolisProvider config={polisConfig}>` (import from `@polisprotocol/react`). Keep existing providers around it.
> 2. Create `src/app/community/page.tsx` rendering `<CommunityHero>` + `<LiveBanner>` + `<CategoryList>` + `<LatestTopics>` from `@polisprotocol/react`. Pass any layout/spacing as wrapper divs.
> 3. Create `src/app/community/c/[slug]/page.tsx` rendering `<CategoryView slug={params.slug}>`.
> 4. Create `src/app/community/t/[id]/page.tsx` rendering `<TopicView id={params.id}>`.
> 5. Add nav link "Community" alongside existing People/Events/Apps in main nav.
> 6. Add env vars to `.env.local`: `NEXT_PUBLIC_BFF_URL`, `LUMA_EVENT_ID`, `ARCHIVE_CONTRACT`, `DISCOURSE_SSO_SECRET`.
> 7. Update `src/app/community/c/[slug]/page.tsx` to handle the FAB onSuccess callback by calling `router.push(/community/t/${id})`.
> 
> Do NOT modify existing People/Events/Apps code. Do NOT change top-level theme tokens — Polis components scope themselves under `--polis-*` CSS vars. If existing nav uses different patterns (server component, client component), match the existing convention.

**DoD:**
- [ ] `pnpm dev` no ipehub → `localhost:3000/community` renderiza com dados reais do BFF
- [ ] Existing routes (`/`, `/people`, `/events`, `/apps`) continuam funcionando sem regressão
- [ ] SIWE flow completo

---

### T3.9 · Deploy `ipehub.xyz/community`
**Deps:** T3.8 · **Time:** 30min · **Owner:** Dayane

O ipehub já tem deploy contínuo via Vercel — push pra main já dispara.

```bash
cd ~/work/ipehub
# Adicionar env vars no Vercel
vercel env add NEXT_PUBLIC_BFF_URL https://api.ipehub.xyz production
vercel env add LUMA_EVENT_ID <id> production
vercel env add ARCHIVE_CONTRACT 0x... production
vercel env add DISCOURSE_SSO_SECRET <secret> production
# Commit e push
git add . && git commit -m "feat(community): integrate @polisprotocol/react"
git push origin main
# Vercel deploy auto
```

**DoD:**
- [ ] `https://ipehub.xyz/community` retorna 200 em produção
- [ ] SIWE login end-to-end funciona em prod
- [ ] Criação de topic aparece em `forum.ipehub.xyz`
- [ ] Real-time SSE conectado
- [ ] Existing routes (People, Events, Apps) sem regressão

---

**Sprint 3 End-of-day 6 check:**
- ✅ `@polisprotocol/react` publicado (ou linkado localmente) com components + hooks
- ✅ ipehub existente integrado, rota `/community` live em produção
- ✅ Auth wallet → post end-to-end
- ✅ Real-time funcionando
- ✅ Tema Ipê aplicado via overrides
- ✅ Existing ipehub features sem regressão

---

## Sprint 4 · Days 7-8 (Apr 29-30) · Decentralization

**Goal:** Contract em Base, backup pipeline rodando, plugin system operacional.

### T4.1 · @polisprotocol/contracts — Foundry setup
**Time:** 1h · **Owner:** Daniel

```bash
mkdir -p packages/contracts && cd packages/contracts
forge init --no-commit .
```

**Claude Code prompt:**
> Configure Foundry workspace for Polis contracts. `foundry.toml` with Solidity 0.8.24, optimizer enabled (runs 200), fuzz runs 256, invariant runs 256. Remappings for OpenZeppelin via `forge install OpenZeppelin/openzeppelin-contracts --no-commit`. Set `src/`, `test/`, `script/` directories. Add `.env.example` for `BASE_SEPOLIA_RPC`, `BASE_MAINNET_RPC`, `DEPLOYER_PRIVATE_KEY`, `ETHERSCAN_API_KEY`. Add scripts in `package.json`: `build`, `test`, `coverage`, `deploy:sepolia`, `deploy:mainnet`, `verify`.

**DoD:** `forge build` + `forge test` passam.

---

### T4.2 · PolisArchive.sol contract
**Deps:** T4.1 · **Time:** 2h · **Owner:** Daniel

**Claude Code prompt:**
> Write `packages/contracts/src/PolisArchive.sol`. Purpose: multi-tenant registry for pop-up city archives. Public state:  
> - `struct City { string slug; address admin; uint256 registeredAt; }`  
> - `mapping(uint256 => City) public cities` (cityId → City)  
> - `mapping(uint256 => mapping(uint256 => bytes32)) public snapshots` (cityId → timestamp → ipfsHash)  
> - `uint256 public nextCityId`  
>   
> Functions:  
> - `registerCity(string slug) returns (uint256)` — anyone can register, emits `CityRegistered`  
> - `recordSnapshot(uint256 cityId, bytes32 ipfsHash)` — only city admin, emits `SnapshotRecorded(cityId, blockTimestamp, ipfsHash)`  
> - `transferAdmin(uint256 cityId, address newAdmin)` — only current admin  
> - `getLatestSnapshot(uint256 cityId) returns (bytes32, uint256)` — read latest  
>   
> Access control via OpenZeppelin Ownable for emergency pause. Use `IERC173` pattern. Write comprehensive Forge tests: happy paths, access control, fuzz testing for slug uniqueness, gas snapshots. Target: < 80k gas per recordSnapshot.

**DoD:**
- [ ] `forge test` all pass, coverage >95%
- [ ] Gas report generated in `gas-snapshot`
- [ ] No compiler warnings

---

### T4.3 · Deploy PolisArchive to Base Sepolia + Mainnet
**Deps:** T4.2 · **Time:** 1h · **Owner:** Daniel

**Claude Code prompt:**
> Write deployment script `packages/contracts/script/DeployPolisArchive.s.sol` using Foundry Script. Reads env for RPC + private key. Deploys contract, logs address, verifies on Basescan. Add helper script `script/RegisterIpe.s.sol` that calls `registerCity("ipe")` after deploy to claim cityId=1. Run Sepolia first for smoke test, then mainnet.

Shell:
```bash
cd packages/contracts
forge script script/DeployPolisArchive.s.sol --rpc-url $BASE_SEPOLIA_RPC --private-key $DEPLOYER_PRIVATE_KEY --broadcast --verify
# verify on basescan, test manually
forge script script/DeployPolisArchive.s.sol --rpc-url $BASE_MAINNET_RPC --private-key $DEPLOYER_PRIVATE_KEY --broadcast --verify
forge script script/RegisterIpe.s.sol --rpc-url $BASE_MAINNET_RPC --broadcast
```

**DoD:**
- [ ] Contract verificado em basescan.org
- [ ] cityId=1 alocado pra "ipe"
- [ ] Address adicionado a `examples/ipe-hub/polis.config.ts`

---

### T4.4 · Backup pipeline (GitHub Actions)
**Deps:** T4.3, T2.7 · **Time:** 2h · **Owner:** Dayane

Gerar chave age pra encriptar:
```bash
age-keygen -o ~/.polis-backup.key
# public key goes in GitHub secret BACKUP_PUBKEY
# private key stays with Daniel + Dayane
```

**Claude Code prompt:**
> Create `.github/workflows/backup.yml`. Schedule: daily at 03:00 UTC. Job steps:  
> 1. Checkout  
> 2. Install age, curl, jq  
> 3. SSH to Hetzner via GitHub secret SSH_KEY, run `docker exec discourse_app /sbin/discourse backup --s3-upload=false` to generate .tar.gz  
> 4. scp backup file locally  
> 5. Encrypt with age: `age -r $BACKUP_PUBKEY -o backup.tar.gz.age backup.tar.gz`  
> 6. Upload to web3.storage via `npx w3 up backup.tar.gz.age`  
> 7. Pin redundancy to Pinata via curl  
> 8. Call `PolisArchive.recordSnapshot(1, ipfsHash)` via `cast send` (foundry)  
> 9. Notify Telegram via bot webhook  
>   
> All secrets from GitHub Actions secrets. Log IPFS hash + tx hash in summary. Fail loudly if any step errors.

**DoD:**
- [ ] Workflow roda com sucesso 1x manual (via `workflow_dispatch`)
- [ ] Tx confirmada em basescan
- [ ] IPFS hash recuperável via gateway

---

### T4.5 · Plugin system in BFF
**Deps:** T2.6 · **Time:** 2h · **Owner:** Daniel

**Claude Code prompt:**
> Implement plugin system for BFF. A plugin is a module exporting:  
> ```ts  
> export default definePlugin({  
>   name: 'verify-resident',  
>   schema: (builder) => { /* add Pothos types/queries/mutations */ },  
>   hooks: { onPostCreated?: async (ctx, post) => {} }  
> })  
> ```  
> Plugins listed in `polis.config.ts` under `plugins` array. BFF reads config at startup, dynamically imports each plugin, registers its schema contributions with the Pothos builder, and wires hooks into the relevant flows. Provide `definePlugin` helper + `PluginContext` type in `@polisprotocol/core`.

**DoD:** Plugin toy "hello-world" adicionado a config estende GraphQL com query `hello`.

---

### T4.6 · First real plugin: verify-resident *(optional para v0.1)*
**Deps:** T4.5 · **Time:** 1.5h · **Owner:** Dayane

Plugin opcional — útil pra cidades que precisam de gating de membership (residentes verificados podem postar em categorias específicas). Não obrigatório pro Ipê v0.1 mas serve como prova de que o plugin system funciona end-to-end. Se tempo apertar, vira `v0.2-candidate`.

Vive como example dentro do monorepo: `polis-protocol/polis/examples/plugins/verify-resident/`.

**Claude Code prompt:**
> Write verify-resident plugin for Ipê. Adds mutation `verifyResidency(proof)` that accepts a proof object (for v0.1: manual admin verification — a city admin sets `residentVerifiedAt` for a user). Adds User field `isVerifiedResident: Boolean`. Adds Category directive `@residentsOnly` that checks user has `residentVerifiedAt` set before allowing createTopic/createReply. Admin interface route to bulk-verify via CSV upload (simple form).

**DoD:**
- [ ] Plugin registrado via config
- [ ] Categoria marcada `residentsOnly` bloqueia post de non-resident
- [ ] Admin pode verificar via UI

---

### T4.7 · Farcaster bridge
**Deps:** T3.6 · **Time:** 1.5h · **Owner:** Daniel

```bash
cd packages/bff
pnpm add @neynar/nodejs-sdk
```

**Claude Code prompt:**
> In BFF, add webhook receiver `/webhooks/discourse/farcaster-bridge`. When Discourse fires `post_created`, if category is not private, publish a cast to Farcaster channel configured in `polis.config.ts.integrations.farcaster.channel`. Cast content: title + link to topic + category. Use Neynar SDK with a bot signer (setup: create signer via Neynar dashboard, paste uuid in secrets). Add opt-out via user setting `crossPostToFarcaster` (default true).

**DoD:** Novo post no forum aparece como cast em /ipecity channel.

---

### T4.8 · Observability wiring
**Time:** 1h · **Owner:** Dayane

```bash
cd packages/bff
pnpm add @sentry/node @axiomhq/js
```

**Claude Code prompt:**
> Wire Sentry in BFF: init in server.ts with DSN from env, automatic error capture, performance tracing sampleRate 0.1 in prod. Wire Axiom: pino transport that ships structured logs to Axiom dataset. In the ipehub Next.js app, add `@sentry/nextjs` with source maps upload via Sentry webpack plugin.

**DoD:** Error intencional (throw) aparece no Sentry dashboard.

---

### T4.9 · Bug fixing marathon
**Time:** 4h · **Owner:** Both

Lista de issues found durante sprints anteriores. Trabalhar em paralelo. Scope freeze já — NÃO adicionar novas features.

---

**Sprint 4 End-of-day 8 check:**
- ✅ Contrato live em Base, primeira snapshot registrada
- ✅ Backup pipeline rodou com sucesso
- ✅ Plugin system operacional + verify-resident funcional
- ✅ Farcaster cross-post working
- ✅ Sentry + Axiom capturando dados

---

## Sprint 5 · Days 9-10 (May 1-2) · Launch

**Goal:** CLI funcional, docs completa, release v0.1.0, launch público.

### T5.1 · @polisprotocol/web-starter scaffold
**Time:** 1.5h · **Owner:** Daniel

Next.js 15 starter já configurado com `@polisprotocol/react`, Wagmi, Tailwind, shadcn — usado pelo CLI pra novas cidades. Ipê não usa isso (já tem app), mas Cabin/Vitalia/futuras sim.

```bash
mkdir -p packages/web-starter && cd packages/web-starter
pnpm dlx create-next-app@latest . --ts --tailwind --app --eslint --src-dir --import-alias "@/*" --use-pnpm
pnpm add @polisprotocol/core @polisprotocol/react @polisprotocol/theme-default
pnpm add wagmi viem @rainbow-me/rainbowkit @tanstack/react-query
```

**Claude Code prompt:**
> Configure `@polisprotocol/web-starter` as a Next.js 15 template that the CLI clones. Structure:
> - `src/app/layout.tsx` — wraps children in `<PolisProvider>`, loads polis.config.ts
> - `src/app/page.tsx` — landing page with placeholder "Welcome to {city.name}" + link to /community
> - `src/app/community/page.tsx` — renders `<CommunityHero>` + `<CategoryList>` + `<LatestTopics>` from `@polisprotocol/react`
> - `src/app/community/c/[slug]/page.tsx` — renders `<CategoryView>`
> - `src/app/community/t/[id]/page.tsx` — renders `<TopicView>`
> - `polis.config.ts.template` — config with `{{city.name}}`, `{{city.slug}}` placeholders for CLI to replace
> - `.env.local.example` — required env vars
> - `tailwind.config.ts` — extends `@polisprotocol/tailwind-preset`
> - `README.md.template` — onboarding for new city operators
> 
> Mark as `private: true` in package.json — this isn't published to npm; it's cloned via degit by the CLI.

**DoD:**
- [ ] `cd packages/web-starter && pnpm dev` sobe app placeholder funcional
- [ ] Navegação entre rotas funciona

---

### T5.2 · @polisprotocol/cli scaffolder
**Deps:** T5.1 · **Time:** 2h · **Owner:** Daniel

```bash
mkdir -p packages/cli && cd packages/cli
pnpm init
pnpm add citty @clack/prompts degit chalk
```

**Claude Code prompt:**
> Build CLI `create-polis-city` using Citty + Clack prompts. Flow:
> 1. Prompt for city name + slug
> 2. Prompt for theme (default, custom)
> 3. Prompt for features (siwe, farcaster, livestream)
> 4. Prompt for deploy target (local dev, hetzner, fly+vercel)
> 5. Clone `@polisprotocol/web-starter` template via degit (`degit polis-protocol/polis/packages/web-starter`)
> 6. Replace placeholders ({{city.name}}, {{city.slug}}) with user input via simple sed-like substitution
> 7. Generate `polis.config.ts` from prompts
> 8. Generate `.env.local` with placeholders
> 9. Print next steps (install, dev, deploy)
> 
> Bin entry `polis` with subcommands: `init`, `deploy <target>`, `doctor` (checks env). Publish as `create-polis-city` for `npm create` compatibility.

**DoD:**
- [ ] `npx create-polis-city my-city` functional end-to-end
- [ ] Generated project runs with `pnpm dev`

---

### T5.3 · examples/minimal
**Deps:** T5.1 · **Time:** 1h · **Owner:** Dayane

Único example dentro do monorepo — instância **completa** que usa `@polisprotocol/web-starter` como base, deployable. Mostra como uma cidade rodaria do zero. Serve como sanity check do template + lugar pra contributors testarem mudanças no `@polisprotocol/react` antes de virar PR.

Cria `examples/minimal/`:
- Clona `packages/web-starter` como ponto de partida
- `polis.config.ts` com cidade fictícia ("Demo City", slug `demo`)
- Sem features Ipê-specific (sem Luma, sem Farcaster, sem onchain)
- `docker-compose.yml` com Discourse + Postgres + Redis local
- README com 3 comandos pra subir tudo

**Nota**: o ipehub real **não vive aqui** — ele é o app existente em `deegalabs/ipehub` que importa `@polisprotocol/react`. Esse `examples/minimal` é só pedagógico.

**DoD:** `cd examples/minimal && docker compose up && pnpm dev` sobe stack completo local em <5min, navegável.

---

### T5.4 · Terraform modules
**Time:** 2h · **Owner:** Daniel

```bash
mkdir -p infra/terraform/hetzner infra/terraform/fly
```

**Claude Code prompt:**
> Write two Terraform modules:  
> `infra/terraform/hetzner/` — provisions Hetzner Cloud server (CCX13 default, configurable), installs Docker + Discourse, points DNS via Cloudflare provider, sets up Let's Encrypt via Caddy.  
> `infra/terraform/fly/` — deploys BFF app to Fly.io, configures secrets from Doppler, sets up Postgres attachment.  
> Both modules have `variables.tf`, `main.tf`, `outputs.tf`, `README.md`. Example `terraform.tfvars.example`.

**DoD:** `terraform init && terraform plan` roda sem erro em ambos.

---

### T5.5 · Docs quickstart
**Deps:** T5.1 · **Time:** 2h · **Owner:** Dayane

**Claude Code prompt:**
> Write docs pages in `apps/docs/`:  
> - `introduction/what-is-polis.mdx` — 1-page overview with constellation diagram  
> - `introduction/quickstart.mdx` — 30-minute deploy guide using `npx create-polis-city`  
> - `architecture/overview.mdx` — based on the arch v0.2 spec (provide summary pointing to full spec)  
> - `customization/theming.mdx` — how to swap theme  
> - `customization/plugins.mdx` — how to write + install plugins  
> - `customization/categories.mdx` — config reference  
> - `reference/cli.mdx` — all CLI commands with examples  
> - `reference/graphql.mdx` — auto-generated from schema via graphql-markdown-cli  
>   
> Each page has: overview, prerequisites, step-by-step, troubleshooting. Real code examples, no lorem ipsum.

**DoD:**
- [ ] `mintlify dev` mostra todos menus
- [ ] Quickstart testada por terceiro (ask Ernesto? Jean?) em máquina limpa

---

### T5.6 · README hero + constellation embed
**Time:** 30min · **Owner:** Daniel

README do repo: hero com title + tagline + constellation SVG embedded + badges (CI, npm, license) + quickstart block + links pra docs + contributing + governance.

**DoD:** README visualmente forte na homepage do GitHub.

---

### T5.7 · Pre-launch content
**Time:** 2h · **Owner:** Both

Drafts em paralelo:
- [ ] Farcaster cast pra /ipecity channel
- [ ] LinkedIn post pessoal Daniel
- [ ] Twitter/X thread
- [ ] Post no fórum Zcash (thread do Michael sobre ZAL)
- [ ] Post no Edge City / Cabin Discord

Template geral: o problema (pop-up cities fragmentadas) + a solução (Polis) + convite (try it, contribute).

---

### T5.8 · Release v0.1.0
**Deps:** todas · **Time:** 1h · **Owner:** Daniel

```bash
# create changesets for all pkgs
pnpm changeset
# select all @polisprotocol/* packages, minor bump
pnpm changeset version
git add -A && git commit -m "chore: release v0.1.0"
git tag v0.1.0
git push origin main --tags
# action publica automaticamente
```

**Claude Code prompt:**
> Generate `CHANGELOG.md` entry for v0.1.0 listing all packages + what they do. Reference Ipê Hub deployment as reference implementation. Credit DeegaLabs + all contributors from git log. Include link to docs + demo.

**DoD:**
- [ ] Tag v0.1.0 visível no GitHub
- [ ] Pacotes @polisprotocol/* publicados em npmjs.com
- [ ] CHANGELOG.md atualizado

---

### T5.9 · Launch day
**Owner:** Both

1. **09:00** — Check que ipehub.xyz/community está green
2. **09:30** — Ativa crossposts Farcaster
3. **10:00** — Publish todos os posts (Farcaster, LinkedIn, X, Zcash forum)
4. **11:00** — Submit buildathon (Ipê City track + Veritas Village track)
5. **Durante o OpenMic de encerramento** — Show & Tell live, demo do /community, anuncia open-source
6. **Tarde** — monitor Sentry, responder issues no GitHub, estar presente no Farcaster channel
7. **Noite** — retrospectiva Daniel + Dayane, drinks

---

## Release checklist

Definition of Done v0.1.0 — todos os itens abaixo antes de declarar "done":

**Polis Protocol (`polis-protocol/polis`)**
- [ ] Repo público, Apache 2.0
- [ ] CI workflows passando (ci.yml, contracts.yml, release.yml)
- [ ] Tag `v0.1.0` criada
- [ ] Pacotes npm publicados: `@polisprotocol/core`, `@polisprotocol/react`, `@polisprotocol/bff`, `@polisprotocol/cli`, `@polisprotocol/theme-default`, `create-polis-city`
- [ ] `@polisprotocol/web-starter` versionado (não publicado em npm — clonado via degit pelo CLI)
- [ ] Docker image `ghcr.io/polis-protocol/bff:0.1.0` disponível
- [ ] `docs.polis-protocol.org` live com Quickstart testado por terceiro
- [ ] Contrato `PolisArchive` verificado em basescan
- [ ] `npx create-polis-city test-city` funciona em máquina limpa
- [ ] `examples/minimal` sobe localmente em <5min
- [ ] README hero visualmente forte

**Ipê Hub (`deegalabs/ipehub`) — app existente**
- [ ] Rota `/community` adicionada sem regressão em People/Events/Apps
- [ ] Consome `@polisprotocol/react` + `@polisprotocol/core` + `@polisprotocol/theme-default` via npm (não link local)
- [ ] `ipehub.xyz/community` live e estável por 24h
- [ ] `forum.ipehub.xyz` live (Discourse)
- [ ] `api.ipehub.xyz` healthy (BFF Fly.io)
- [ ] Farcaster cross-post ativo para /ipecity
- [ ] Primeira snapshot IPFS referenciada onchain
- [ ] Backup pipeline rodou com sucesso 3+ dias consecutivos
- [ ] 5+ contributors reais posting
- [ ] Sentry + Axiom dashboards configurados

---

## Appendix A · Claude Code prompt library

Prompts reutilizáveis. Colar no Claude Code trocando `[BRACKETS]`.

### Criar novo package
> Create a new package `@polisprotocol/[NAME]` in `packages/[NAME]/`. Use `@polisprotocol/tsconfig` for base config. Use `tsup` for build (ESM + CJS + d.ts). Add Vitest for testing. Export public API from `src/index.ts`. Add README with purpose + usage example.

### Criar novo GraphQL resolver
> In `packages/bff/src/graphql/[DOMAIN].ts`, add Pothos resolver for [OPERATION]. Use DataLoader for any N+1 risk. Validate input with Zod. Call DiscourseClient for data fetching. Add integration test with MSW mocks.

### Criar nova página Next.js
> Add a new React component `<[NAME]>` to `packages/react/src/components/`. Keep it framework-agnostic (no next/*, no framework-specific imports). Use Tailwind classes with `var(--polis-*)` theme vars. Export via `src/index.ts` barrel. Add Storybook story + Vitest test. Match visual pattern of existing community components.

### Adicionar nova tabela Drizzle
> In `packages/core/src/db/schema.ts`, add table `[NAME]`. Include foreign keys, indexes, timestamps. Run `pnpm db:generate` after to create migration. Add relations if needed.

### Deploy novo smart contract
> Write `packages/contracts/src/[NAME].sol` with [PURPOSE]. Solidity 0.8.24, optimizer 200 runs. Use OZ where applicable. Write comprehensive Forge tests covering happy paths, access control, fuzz, invariants. Target <80k gas per state-changing call. Then write `script/Deploy[NAME].s.sol` for sepolia + mainnet.

### Fix failing test
> Test `[FILE]::[TEST_NAME]` is failing with: `[ERROR]`. Read the test + implementation, identify root cause, fix without adding scope. Don't skip the test. Don't expand the fix beyond what's needed.

### Upgrade dependency
> Upgrade `[PACKAGE]` from `[OLD]` to `[NEW]` across the monorepo. Check changelog for breaking changes. Update imports/API usage where needed. Run tests after.

---

## Appendix B · Scope freeze rules

A partir de **Apr 26 · 18:00 BRT** aplicar:

✅ **Permitido:**
- Bug fixes em features existentes
- Polish visual sem mudar estrutura
- Docs improvements
- Test coverage
- Performance

❌ **Proibido até v0.2:**
- Novas features que não estão nessa lista de tasks
- Trocar tecnologia em camada já implementada
- Refactor grande sem bug reportado
- "Vou só adicionar rapidinho..."

**Se surgir ideia boa:** abrir issue no GitHub com label `v0.2-candidate`. Não codar no main.

---

## Appendix C · Troubleshooting

**Problema:** `pnpm install` fails with `ERR_PNPM_PEER_DEP_ISSUES`  
**Fix:** `.npmrc` precisa `strict-peer-dependencies=false`

**Problema:** Fly deploy falha com OOM  
**Fix:** Aumentar memory no `fly.toml` pra 1GB temporariamente

**Problema:** Discourse SSO não cria user  
**Fix:** Checar `DISCOURSE_SSO_SECRET` é idêntico dos dois lados + `discourse_connect_url` HTTPS

**Problema:** SIWE verification falha com "Invalid signature"  
**Fix:** Domain na message precisa match EXATO `SIWE_DOMAIN` env

**Problema:** GitHub Action backup falha em step IPFS  
**Fix:** web3.storage token pode ter expirado — regenerar + atualizar secret

**Problema:** Base tx reverts em recordSnapshot  
**Fix:** Checar admin de cityId=1 é o mesmo wallet do deployer; se não, `transferAdmin` primeiro

---

**FIM.**

Polis Protocol · v0.1.0 · Target May 1, 2026  
Mantido por DeegaLabs · Apache 2.0
