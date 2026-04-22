# Environment

Accounts, secrets, and env vars needed to run Polis Protocol locally and in production.

## Local toolchain

```bash
# Node.js 22+ (via nvm or corepack)
nvm install 22 && nvm use 22

# pnpm (via corepack)
corepack enable
corepack prepare pnpm@10.28.1 --activate

# Foundry (Solidity toolkit)
curl -L https://foundry.paradigm.xyz | bash && foundryup

# Docker + Docker Compose
docker --version && docker compose version

# GitHub CLI, Fly CLI, Vercel CLI, Doppler CLI (production only)
sudo apt install gh
curl -L https://fly.io/install.sh | sh
pnpm add -g vercel
curl -Ls https://cli.doppler.com/install.sh | sudo sh
```

## Accounts needed

### Free tier sufficient

| Service | URL | Purpose |
|---------|-----|---------|
| GitHub org `polis-protocol` | https://github.com/organizations/plan | Public monorepo |
| npm org `@polisprotocol` | https://www.npmjs.com/org/create | Package publishing |
| Neon | https://console.neon.tech/signup | Postgres (user registry, sessions) |
| Upstash Redis | https://console.upstash.com/ | Nonces, SSE pub/sub |
| Cloudflare | https://dash.cloudflare.com/sign-up | DNS + R2 uploads |
| Mintlify | https://dashboard.mintlify.com/signup | User-facing docs |
| Sentry | https://sentry.io/signup/ | Error tracking |
| Axiom | https://app.axiom.co/register | Log aggregation |
| Doppler | https://dashboard.doppler.com/register | Secret management |
| Pinata | https://app.pinata.cloud/register | IPFS pinning |
| web3.storage | https://console.web3.storage/ | IPFS archival |
| Alchemy | https://dashboard.alchemy.com/signup | Base RPC |
| Neynar | https://dev.neynar.com/ | Farcaster bridge |
| Luma | https://lu.ma/home | Event integration |

### Paid (low cost)

| Service | URL | Est. cost | Purpose |
|---------|-----|-----------|---------|
| Hetzner Cloud | https://accounts.hetzner.com/signUp | ~€13/mo | Discourse VPS |
| Fly.io | https://fly.io/app/sign-up | ~$5/mo | BFF runtime |
| Domain registrar (Namecheap / Registro.br) | — | ~R$50/yr | `polis-protocol.org` |

## Env vars

### `@polisprotocol/bff`

```bash
# Core
NODE_ENV=development
PORT=4000

# Database (Neon in prod, local Postgres in dev)
DATABASE_URL=postgresql://polis:polis_dev@localhost:5432/polis

# Redis (Upstash in prod, local Redis in dev)
REDIS_URL=redis://localhost:6379

# Discourse
DISCOURSE_URL=http://localhost:3000
DISCOURSE_API_KEY=<generated-in-discourse-admin>
DISCOURSE_API_USERNAME=system
DISCOURSE_SSO_SECRET=<shared-with-discourse-connect-settings>

# Auth
SESSION_SECRET=<32+ chars random>
SIWE_DOMAIN=localhost:3000  # must match consumer domain

# CORS
CORS_ORIGIN=http://localhost:3000
```

### Consumer app (`@polisprotocol/web-starter` / `examples/minimal` / `ipehub`)

```bash
NEXT_PUBLIC_BFF_URL=http://localhost:4000  # or https://api.yourcity.xyz
```

Optional (prod only):

```bash
SENTRY_DSN=<from-sentry-dashboard>
NEXT_PUBLIC_SENTRY_DSN=<ditto>
LUMA_EVENT_ID=<from-luma-event-url>
ARCHIVE_CONTRACT=0x...  # Base mainnet PolisArchive address
```

### `@polisprotocol/contracts`

```bash
# Deploy scripts (keep out of git)
PRIVATE_KEY=<deployer-wallet-private-key>
BASE_RPC_URL=https://base-mainnet.g.alchemy.com/v2/<ALCHEMY_KEY>
BASE_SEPOLIA_RPC_URL=https://base-sepolia.g.alchemy.com/v2/<ALCHEMY_KEY>
BASESCAN_API_KEY=<basescan-verify-key>
```

## Local stack (Docker)

Smallest thing that runs end-to-end locally:

```bash
cd infra/docker
cp .env.example .env
docker compose up -d          # Postgres + Discourse + Redis

# Wait ~5min for Discourse to initialize, then:
# 1. Open http://localhost:3000, create admin account
# 2. Admin → API → New API Key (user: system, all users: yes) → save
# 3. Admin → Settings → Login → enable_discourse_connect=true, discourse_connect_url=http://localhost:4000/auth/sso
# 4. Admin → Customize → Categories → create 9 categories per your polis.config

# Run migrations
cd ../../packages/core
pnpm db:generate && pnpm db:migrate

# Start BFF
cd ../bff
cp .env.example .env.local    # fill with DISCOURSE_API_KEY from step 2
pnpm dev

# Start frontend
cd ../web-starter
echo 'NEXT_PUBLIC_BFF_URL=http://localhost:4000' > .env.local
pnpm dev
```

Open http://localhost:3001/community.

## Secrets management

- **Local dev:** `.env.local` per package, never committed (already gitignored).
- **Production:** Doppler project `polis-protocol` with environments `dev`, `staging`, `prod`. Load into Fly.io via `fly secrets set $(doppler secrets export)`.
- **CI:** GitHub Actions secrets — `NPM_TOKEN`, `NEON_API_KEY`, `DISCOURSE_API_KEY`, `DISCOURSE_URL`.

Never commit real keys. `.env.example` files must stay up to date.
