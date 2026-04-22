#!/usr/bin/env bash
# smoke-test.sh — verify the deployed stack responds correctly.
# Run after any deploy. Exits non-zero if any check fails.

set -u

DISCOURSE_URL="${DISCOURSE_URL:-https://forum.ipehub.xyz}"
BFF_URL="${BFF_URL:-https://api.ipehub.xyz}"
ARCHIVE_CONTRACT="${ARCHIVE_CONTRACT:-}"
BASE_RPC_URL="${BASE_RPC_URL:-https://base-mainnet.public.blastapi.io}"

YELLOW='\033[1;33m'
GREEN='\033[0;32m'
RED='\033[0;31m'
DIM='\033[2m'
RESET='\033[0m'

section() { echo; echo -e "${YELLOW}━ $1${RESET}"; }
ok()      { echo -e "  ${GREEN}✓${RESET} $1"; }
fail()    { echo -e "  ${RED}✗${RESET} $1"; FAIL_COUNT=$((FAIL_COUNT + 1)); }

FAIL_COUNT=0

check_http() {
  local name=$1 url=$2 expected_status=${3:-200}
  local status
  status=$(curl -s -o /dev/null -w "%{http_code}" "$url" --max-time 10 || echo "000")
  if [ "$status" = "$expected_status" ]; then
    ok "$name — $url → $status"
  else
    fail "$name — $url → $status (expected $expected_status)"
  fi
}

check_json() {
  local name=$1 url=$2 jq_expr=$3 expected=$4
  local actual
  actual=$(curl -s --max-time 10 "$url" | jq -r "$jq_expr" 2>/dev/null || echo "")
  if [ "$actual" = "$expected" ]; then
    ok "$name — $jq_expr = $expected"
  else
    fail "$name — expected $expected, got '$actual'"
  fi
}

# ── Discourse ──────────────────────────────────────────────────────
section "Discourse ($DISCOURSE_URL)"
check_http "homepage"     "$DISCOURSE_URL/"                200
check_http "categories"   "$DISCOURSE_URL/categories.json" 200
check_http "admin denied" "$DISCOURSE_URL/admin/"          302

# ── BFF ────────────────────────────────────────────────────────────
section "BFF ($BFF_URL)"
check_http "health"   "$BFF_URL/health"   200
check_http "graphql"  "$BFF_URL/graphql"  200

# GraphQL query
if command -v jq >/dev/null 2>&1; then
  response=$(curl -s "$BFF_URL/graphql" \
    -H "Content-Type: application/json" \
    -d '{"query":"{ categories { id name slug } }"}' \
    --max-time 15 || echo "{}")
  count=$(echo "$response" | jq -r '.data.categories | length' 2>/dev/null || echo "0")
  if [ "$count" -gt 0 ] 2>/dev/null; then
    ok "GraphQL categories query returned $count categories"
  else
    fail "GraphQL categories query returned 0 or errored — response: $(echo "$response" | head -c 200)"
  fi
fi

# ── Contracts ──────────────────────────────────────────────────────
if [ -n "$ARCHIVE_CONTRACT" ] && command -v cast >/dev/null 2>&1; then
  section "PolisArchive ($ARCHIVE_CONTRACT on Base)"
  owner=$(cast call "$ARCHIVE_CONTRACT" "owner()(address)" --rpc-url "$BASE_RPC_URL" 2>/dev/null || echo "")
  if [[ "$owner" =~ ^0x ]]; then
    ok "owner() = $owner"
  else
    fail "owner() call failed"
  fi

  # Try getCity(1) — may revert if no city registered yet
  if cast call "$ARCHIVE_CONTRACT" "getCity(uint256)(string,address)" 1 --rpc-url "$BASE_RPC_URL" >/dev/null 2>&1; then
    ok "getCity(1) returned data"
  else
    echo -e "  ${DIM}○ getCity(1) reverted (probably no city registered yet — run registerCity)${RESET}"
  fi
else
  section "PolisArchive — skipped"
  echo -e "  ${DIM}(set ARCHIVE_CONTRACT and install foundry to check)${RESET}"
fi

# ── Summary ────────────────────────────────────────────────────────
echo
if [ $FAIL_COUNT -eq 0 ]; then
  echo -e "${GREEN}All smoke tests passed.${RESET}"
  exit 0
else
  echo -e "${RED}${FAIL_COUNT} check(s) failed.${RESET}"
  exit 1
fi
