#!/usr/bin/env bash
# deploy-bff.sh — deploy the BFF (Fastify + GraphQL) to Fly.io.
# Pulls secrets from Doppler and pushes to Fly.
# Idempotent: can be re-run safely to update secrets or deploy a new build.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BFF_DIR="$REPO_ROOT/packages/bff"
FLY_APP="${FLY_APP:-polis-bff-ipe}"
FLY_REGION="${FLY_REGION:-gru}"

YELLOW='\033[1;33m'
GREEN='\033[0;32m'
RED='\033[0;31m'
DIM='\033[2m'
RESET='\033[0m'

log()  { echo -e "${YELLOW}▸${RESET} $1"; }
ok()   { echo -e "${GREEN}✓${RESET} $1"; }
fail() { echo -e "${RED}✗${RESET} $1" >&2; }

# ── 1. Validate tooling ────────────────────────────────────────────
command -v fly >/dev/null 2>&1 || { fail "fly CLI not installed"; exit 1; }
command -v doppler >/dev/null 2>&1 || { fail "doppler CLI not installed"; exit 1; }
fly auth whoami >/dev/null 2>&1 || { fail "fly not logged in (run: fly auth login)"; exit 1; }
doppler me >/dev/null 2>&1 || { fail "doppler not logged in (run: doppler login)"; exit 1; }

# ── 2. Build locally first (catch issues before deploy) ────────────
log "building BFF locally (catch errors before deploy)"
cd "$REPO_ROOT"
pnpm --filter '@polisprotocol/bff' build

# ── 3. Ensure Fly app exists ────────────────────────────────────────
if ! fly status --app "$FLY_APP" >/dev/null 2>&1; then
  log "creating Fly app $FLY_APP in region $FLY_REGION"
  cd "$BFF_DIR"
  fly launch --no-deploy --name "$FLY_APP" --region "$FLY_REGION" --copy-config --yes
else
  ok "Fly app $FLY_APP exists"
fi

# ── 4. Sync secrets from Doppler to Fly ────────────────────────────
log "syncing secrets from Doppler to Fly"
REQUIRED_SECRETS=(
  DATABASE_URL
  REDIS_URL
  DISCOURSE_URL
  DISCOURSE_API_KEY
  DISCOURSE_API_USERNAME
  DISCOURSE_SSO_SECRET
  SESSION_SECRET
  SIWE_DOMAIN
  CORS_ORIGIN
)

FLY_SECRET_ARGS=()
MISSING=()
for key in "${REQUIRED_SECRETS[@]}"; do
  val=$(doppler secrets get "$key" --plain 2>/dev/null || true)
  if [ -z "$val" ]; then
    MISSING+=("$key")
  else
    FLY_SECRET_ARGS+=("$key=$val")
  fi
done

if [ ${#MISSING[@]} -gt 0 ]; then
  fail "missing secrets in Doppler: ${MISSING[*]}"
  echo "Set them with:"
  for key in "${MISSING[@]}"; do
    echo "    doppler secrets set $key=<value>"
  done
  exit 1
fi

cd "$BFF_DIR"
fly secrets set "${FLY_SECRET_ARGS[@]}" --app "$FLY_APP" --stage
ok "secrets staged"

# ── 5. Deploy ───────────────────────────────────────────────────────
log "fly deploy"
fly deploy --app "$FLY_APP" --remote-only --ha=false

# ── 6. Smoke test ───────────────────────────────────────────────────
log "smoke test /health endpoint"
URL="https://$FLY_APP.fly.dev/health"
for i in 1 2 3 4 5; do
  if curl -sf "$URL" >/dev/null; then
    ok "$URL returned 200"
    break
  fi
  echo "  attempt $i/5 failed, retrying in 3s..."
  sleep 3
done

echo
echo "Deployed: https://$FLY_APP.fly.dev"
echo "GraphQL:  https://$FLY_APP.fly.dev/graphql"
echo
echo -e "${DIM}Rollback: fly releases --app $FLY_APP list${RESET}"
echo -e "${DIM}         fly deploy --app $FLY_APP --image <previous-image>${RESET}"
