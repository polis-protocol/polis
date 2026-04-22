#!/usr/bin/env bash
# deploy-contracts.sh — deploy PolisArchive.sol to Base Sepolia or mainnet.
# Not idempotent — each run creates a new deployment. For upgrades to an
# existing contract, use transferAdmin or deploy a new version and migrate.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CONTRACTS_DIR="$REPO_ROOT/packages/contracts"

YELLOW='\033[1;33m'
GREEN='\033[0;32m'
RED='\033[0;31m'
DIM='\033[2m'
RESET='\033[0m'

log()  { echo -e "${YELLOW}▸${RESET} $1"; }
ok()   { echo -e "${GREEN}✓${RESET} $1"; }
fail() { echo -e "${RED}✗${RESET} $1" >&2; }

# ── 1. Pick network ─────────────────────────────────────────────────
NETWORK="${1:-sepolia}"
case "$NETWORK" in
  sepolia)
    RPC_VAR="BASE_SEPOLIA_RPC_URL"
    CHAIN_ID=84532
    EXPLORER="https://sepolia.basescan.org"
    ;;
  mainnet)
    RPC_VAR="BASE_RPC_URL"
    CHAIN_ID=8453
    EXPLORER="https://basescan.org"
    ;;
  *)
    fail "Usage: $0 [sepolia|mainnet]"
    exit 1
    ;;
esac

log "target network: Base $NETWORK (chainId=$CHAIN_ID)"

# ── 2. Load env ─────────────────────────────────────────────────────
# Precedence: Doppler > shell env > .env file in contracts dir
if [ -f "$CONTRACTS_DIR/.env" ]; then
  # shellcheck disable=SC1091
  set -a; source "$CONTRACTS_DIR/.env"; set +a
fi

: "${PRIVATE_KEY:?PRIVATE_KEY not set — add to $CONTRACTS_DIR/.env or export in shell}"
: "${!RPC_VAR:?$RPC_VAR not set}"
: "${BASESCAN_API_KEY:?BASESCAN_API_KEY not set (needed for --verify)}"

RPC_URL="${!RPC_VAR}"

# ── 3. Final confirmation for mainnet ──────────────────────────────
if [ "$NETWORK" = "mainnet" ]; then
  echo
  echo "⚠  You are deploying to Base MAINNET. This costs real ETH."
  read -p "Type 'DEPLOY TO MAINNET' to proceed: " -r reply
  if [ "$reply" != "DEPLOY TO MAINNET" ]; then
    echo "Aborted."
    exit 0
  fi
fi

# ── 4. Build + deploy ───────────────────────────────────────────────
log "forge build"
cd "$CONTRACTS_DIR"
forge build --sizes

log "forge script DeployPolisArchive.s.sol"
forge script script/DeployPolisArchive.s.sol \
  --rpc-url "$RPC_URL" \
  --broadcast \
  --verify \
  --etherscan-api-key "$BASESCAN_API_KEY" \
  -vvv

# ── 5. Extract deployed address ─────────────────────────────────────
BROADCAST_FILE="$CONTRACTS_DIR/broadcast/DeployPolisArchive.s.sol/$CHAIN_ID/run-latest.json"
if [ -f "$BROADCAST_FILE" ]; then
  ADDR=$(jq -r '.transactions[] | select(.contractName=="PolisArchive") | .contractAddress' "$BROADCAST_FILE" | head -1)
  ok "deployed: $ADDR"
  echo
  echo "Explorer: $EXPLORER/address/$ADDR"
  echo
  echo "Save to Doppler:"
  if [ "$NETWORK" = "mainnet" ]; then
    echo "    doppler secrets set ARCHIVE_CONTRACT=$ADDR"
  else
    echo "    doppler secrets set ARCHIVE_CONTRACT_SEPOLIA=$ADDR"
  fi
else
  fail "broadcast file not found at $BROADCAST_FILE"
  exit 1
fi

echo
echo -e "${DIM}Next: register your city with ./scripts/deploy-contracts.sh register $ADDR${RESET}"
