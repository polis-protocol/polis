# Deployment

Step-by-step for taking Polis Protocol from local to production. Order matters — later steps depend on earlier ones.

## Pre-flight

Complete the account setup in [`ENVIRONMENT.md`](./ENVIRONMENT.md) before touching any of this.

## 1. Provision Discourse on Hetzner

```bash
cd infra/terraform/hetzner
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars: set hcloud_token, ssh_key_ids, discourse_hostname, admin_email

terraform init
terraform plan
terraform apply          # creates CCX13 VPS (~€13/mo)

# SSH into the server and run Discourse setup
ssh root@<ip-from-terraform-output>
cd /var/discourse
./launcher rebuild app    # first build takes ~20 minutes
```

DNS: point `forum.yourcity.xyz` → Hetzner IP (A record via Cloudflare).

Post-setup in Discourse admin:
1. Admin → API → generate API key for user `system` (all endpoints)
2. Admin → Settings → Login → enable DiscourseConnect, set URL to `https://api.yourcity.xyz/auth/sso`, copy the SSO secret
3. Admin → Customize → Categories → create the categories from your `polis.config.ts`
4. Admin → Settings → Webhooks → add webhook to `https://api.yourcity.xyz/webhooks/discourse` for events `post_created`, `topic_created`

## 2. Provision Postgres (Neon)

1. https://console.neon.tech → New Project → `polis-<city-slug>-registry`
2. Copy connection string → save as `DATABASE_URL`
3. Run migrations:

```bash
cd packages/core
DATABASE_URL="<neon-prod-url>" pnpm db:migrate
```

## 3. Provision Redis (Upstash)

1. https://console.upstash.com → Create Database → `polis-<city-slug>-cache`
2. Type: Global (replicated)
3. Copy REST URL + token → save as `REDIS_URL`

## 4. Store secrets in Doppler

```bash
doppler login
doppler setup                 # pick project `polis-protocol`, env `prod`

doppler secrets set DATABASE_URL="<neon>"
doppler secrets set REDIS_URL="<upstash>"
doppler secrets set DISCOURSE_URL="https://forum.yourcity.xyz"
doppler secrets set DISCOURSE_API_KEY="<from-step-1>"
doppler secrets set DISCOURSE_API_USERNAME="system"
doppler secrets set DISCOURSE_SSO_SECRET="<from-step-1>"
doppler secrets set SESSION_SECRET="$(openssl rand -hex 32)"
doppler secrets set SIWE_DOMAIN="yourcity.xyz"
doppler secrets set CORS_ORIGIN="https://yourcity.xyz"
```

## 5. Deploy BFF to Fly.io

```bash
cd packages/bff
fly launch --no-deploy --name polis-bff-<city-slug> --region gru

# Load secrets from Doppler
fly secrets set $(doppler secrets export --no-file --format env | tr '\n' ' ')

fly deploy
fly certs add api.yourcity.xyz

# Smoke test
curl https://api.yourcity.xyz/health
```

DNS: `api.yourcity.xyz` → CNAME → `polis-bff-<city-slug>.fly.dev`.

## 6. Deploy contracts to Base

First test on Sepolia:

```bash
cd packages/contracts
cat > .env <<EOF
PRIVATE_KEY=<deployer-key>
BASE_SEPOLIA_RPC_URL=https://base-sepolia.g.alchemy.com/v2/<key>
BASE_RPC_URL=https://base-mainnet.g.alchemy.com/v2/<key>
BASESCAN_API_KEY=<basescan-key>
EOF

forge script script/DeployPolisArchive.s.sol \
  --rpc-url $BASE_SEPOLIA_RPC_URL \
  --broadcast --verify

forge script script/RegisterIpe.s.sol \
  --rpc-url $BASE_SEPOLIA_RPC_URL \
  --broadcast
```

Verify on https://sepolia.basescan.org/. Test `getLatestSnapshot(1)` returns zero, then test `recordSnapshot` with a known IPFS hash.

When satisfied, deploy mainnet:

```bash
forge script script/DeployPolisArchive.s.sol \
  --rpc-url $BASE_RPC_URL \
  --broadcast --verify
```

Copy the deployed address → save as `ARCHIVE_CONTRACT` env var.

## 7. Publish npm packages

```bash
pnpm changeset               # describe changes
pnpm changeset version       # bump versions
git commit -am "chore: version packages for 0.1.0"
git push

# CI will auto-publish on merge to main, or manually:
pnpm build
pnpm changeset publish
```

Verify: https://www.npmjs.com/~polisprotocol

## 8. Deploy consumer app (Vercel)

For existing apps (like ipehub):

```bash
cd ~/development/deegalabs/ipehub

# After protocol packages are on npm:
pnpm add @polisprotocol/core @polisprotocol/react @polisprotocol/theme-default

# Add env vars
vercel env add NEXT_PUBLIC_BFF_URL production         # https://api.yourcity.xyz
vercel env add LUMA_EVENT_ID production               # optional
vercel env add ARCHIVE_CONTRACT production            # from step 6
vercel env add DISCOURSE_SSO_SECRET production        # from step 1

# Deploy (or just push to main for auto-deploy)
git commit -am "feat(community): integrate @polisprotocol/react"
git push origin main
```

## 9. Deploy docs (Mintlify)

```bash
# One-time setup
# 1. https://dashboard.mintlify.com → Connect repo polis-protocol/polis
# 2. Path: apps/docs
# 3. Custom domain: docs.polis-protocol.org
```

Pushes to `main` touching `apps/docs/**` auto-deploy.

## 10. Configure monitoring

### Sentry

```bash
# BFF
fly secrets set SENTRY_DSN="<bff-project-dsn>"

# Consumer app
vercel env add NEXT_PUBLIC_SENTRY_DSN "<web-project-dsn>" production
```

### Axiom (logs)

BFF uses pino with Axiom transport in prod. Set `AXIOM_TOKEN` + `AXIOM_DATASET=polis-logs` in Fly secrets.

## Smoke test checklist

After deploy, verify:

```bash
# Discourse responds
curl https://forum.yourcity.xyz/categories.json

# BFF healthy
curl https://api.yourcity.xyz/health

# GraphQL returns real data
curl -X POST https://api.yourcity.xyz/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ categories { id name slug } }"}'

# Contract accessible
cast call $ARCHIVE_CONTRACT "getCity(uint256)" 1 \
  --rpc-url $BASE_RPC_URL

# Frontend serves /community
curl -I https://yourcity.xyz/community
```

SIWE flow (manual, needs a wallet):
1. Visit `https://yourcity.xyz/community`
2. Click "Sign in"
3. Approve in wallet
4. Check Discourse admin → user appears with wallet-derived username
5. Create a test topic → appears on forum.yourcity.xyz

## DNS summary

Configure all records in Cloudflare:

| Subdomain | Type | Target |
|-----------|------|--------|
| `yourcity.xyz` | CNAME | `cname.vercel-dns.com` |
| `api.yourcity.xyz` | CNAME | `polis-bff-<slug>.fly.dev` |
| `forum.yourcity.xyz` | A | Hetzner IP |
| `polis-protocol.org` | CNAME | `cname.vercel-dns.com` |
| `docs.polis-protocol.org` | CNAME | `hosting.mintlify.com` |

## Rollback

- **BFF:** `fly releases` → `fly deploy --image <previous-image>`
- **Contracts:** Immutable. Deploy a new version and migrate via `transferAdmin`.
- **Frontend:** Vercel → Deployments → Promote a previous build.
- **Discourse:** Server snapshots via Hetzner console (hourly). Full DB backup weekly via `.github/workflows/backup.yml`.

## Cost summary

| Line item | Monthly |
|-----------|---------|
| Hetzner CCX13 (Discourse) | ~€13 |
| Fly.io shared-cpu-1x (BFF) | ~$5 |
| Neon + Upstash + Cloudflare + Vercel + Mintlify (free tiers) | $0 |
| Sentry + Axiom + Doppler (free/dev tiers) | $0 |
| Domain `.org` | ~R$4 |
| **Base gas per mainnet snapshot** | ~$0.05 |
| **Total** | **~€18/mo + gas** |
