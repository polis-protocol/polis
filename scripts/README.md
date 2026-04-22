# Deploy scripts

Helpers for deploying and verifying the Polis Protocol stack. Each script is idempotent and prints the command it's about to run before running it, so nothing surprising happens.

## Prerequisites

Before running any deploy script:

1. Complete account setup in [`docs/ENVIRONMENT.md`](../docs/ENVIRONMENT.md).
2. Install CLI tools: `terraform`, `fly`, `doppler`, `gh`, `forge`, `jq`, `curl`.
3. Run `./scripts/preflight.sh` — validates your local environment.

## Order of operations

Deploys are layered; later ones depend on earlier ones. Target order for a fresh deploy:

```
preflight.sh              → validates tools & credentials
deploy-discourse.sh       → Hetzner VPS + Discourse container (~25 min)
deploy-contracts.sh       → PolisArchive.sol on Base Sepolia (~3 min)
deploy-bff.sh             → BFF on Fly.io (needs Discourse done first)
smoke-test.sh             → curl health checks end-to-end
```

## Scripts

| Script | Purpose | Idempotent | Duration |
|--------|---------|------------|----------|
| `preflight.sh` | Check tools + credentials are set | ✓ | ~5s |
| `deploy-discourse.sh` | Provision Hetzner + initial Discourse config | partial (terraform is, SSH step is not) | ~25 min first time |
| `deploy-contracts.sh` | Forge deploy PolisArchive to Base (Sepolia or mainnet) | ✗ (each run = new deployment) | ~3 min |
| `deploy-bff.sh` | Fly deploy BFF with secrets from Doppler | ✓ | ~5 min |
| `smoke-test.sh` | curl health/GraphQL/contract endpoints | ✓ | ~30s |

## Environment

Scripts read from:

1. **Shell env** — exported vars (`export HCLOUD_TOKEN=...`)
2. **Doppler** — if `doppler` is configured, secrets are pulled at runtime
3. **`.env.local`** — at repo root, gitignored

Preferred flow: **Doppler** for prod secrets, `.env.local` for dev overrides, shell env for one-off experiments.

## Rollback

Each deploy script prints the rollback command on exit. For quick reference:

- **Discourse:** `terraform -chdir=infra/terraform/hetzner destroy` (destroys VPS, keeps backups)
- **Contracts:** immutable — deploy a new version and call `transferAdmin` if needed
- **BFF:** `fly releases --app polis-bff-ipe list` → `fly deploy --image <previous>`
