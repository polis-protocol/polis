#!/usr/bin/env bash
# preflight.sh — verify local environment is ready for deploy scripts.
# Exits non-zero if anything is missing, with actionable hints.

set -u

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
DIM='\033[2m'
RESET='\033[0m'

FAIL_COUNT=0

ok()   { echo -e "  ${GREEN}✓${RESET} $1"; }
fail() { echo -e "  ${RED}✗${RESET} $1"; FAIL_COUNT=$((FAIL_COUNT + 1)); }
warn() { echo -e "  ${YELLOW}!${RESET} $1"; }
hint() { echo -e "    ${DIM}→ $1${RESET}"; }

section() { echo; echo -e "${YELLOW}━ $1${RESET}"; }

check_cli() {
  local name=$1
  local hint_cmd=${2:-""}
  if command -v "$name" >/dev/null 2>&1; then
    local version
    version=$("$name" --version 2>/dev/null | head -1 || echo "unknown")
    ok "$name ($version)"
  else
    fail "$name not found"
    [ -n "$hint_cmd" ] && hint "install: $hint_cmd"
  fi
}

check_env() {
  local name=$1
  local doppler_fallback=${2:-false}
  local value="${!name:-}"
  if [ -n "$value" ]; then
    ok "\$$name set (${#value} chars)"
  elif $doppler_fallback && command -v doppler >/dev/null 2>&1 && doppler secrets get "$name" --plain >/dev/null 2>&1; then
    ok "\$$name available via Doppler"
  else
    fail "\$$name not set"
  fi
}

# ──────────────────────────────────────────
echo -e "${YELLOW}Polis Protocol preflight check${RESET}"
echo -e "${DIM}Validates that your environment is ready for deploy scripts.${RESET}"

section "CLI tools"
check_cli "node" "nvm install 22"
check_cli "pnpm" "corepack enable && corepack prepare pnpm@10.28.1 --activate"
check_cli "gh" "sudo apt install gh"
check_cli "terraform" "sudo apt install terraform"
check_cli "fly" "curl -L https://fly.io/install.sh | sh"
check_cli "doppler" "curl -Ls https://cli.doppler.com/install.sh | sudo sh"
check_cli "forge" "curl -L https://foundry.paradigm.xyz | bash && foundryup"
check_cli "jq" "sudo apt install jq"
check_cli "curl" ""

section "GitHub auth"
if gh auth status >/dev/null 2>&1; then
  user=$(gh api user --jq .login 2>/dev/null)
  ok "gh logged in as $user"
  if gh api user/orgs --jq '.[].login' 2>/dev/null | grep -qx "polis-protocol"; then
    ok "access to polis-protocol org"
  else
    warn "polis-protocol org not in your gh org list (may be permission issue)"
  fi
else
  fail "gh not authenticated"
  hint "run: gh auth login"
fi

section "Doppler"
if command -v doppler >/dev/null 2>&1; then
  if doppler me >/dev/null 2>&1; then
    ok "doppler authenticated"
    if doppler configure get project --plain 2>/dev/null | grep -q polis-protocol; then
      ok "doppler project = polis-protocol"
    else
      warn "doppler project is not polis-protocol (cd into repo and run: doppler setup)"
    fi
  else
    warn "doppler installed but not logged in"
    hint "run: doppler login"
  fi
fi

section "Provider tokens (shell env or Doppler)"
check_env "HCLOUD_TOKEN" true
check_env "FLY_API_TOKEN" true
check_env "ALCHEMY_API_KEY" true

section "Deploy-time secrets (at least one of each)"
check_env "DATABASE_URL" true
check_env "DISCOURSE_URL" true
check_env "DISCOURSE_API_KEY" true

section "Optional (prod deploys)"
command -v doppler >/dev/null 2>&1 && doppler secrets get SENTRY_DSN --plain >/dev/null 2>&1 && ok "SENTRY_DSN (Doppler)" || warn "SENTRY_DSN not set (optional)"

echo
if [ $FAIL_COUNT -eq 0 ]; then
  echo -e "${GREEN}All preflight checks passed.${RESET}"
  echo "You can run the deploy scripts in order:"
  echo "  1. ./scripts/deploy-discourse.sh"
  echo "  2. ./scripts/deploy-contracts.sh"
  echo "  3. ./scripts/deploy-bff.sh"
  echo "  4. ./scripts/smoke-test.sh"
  exit 0
else
  echo -e "${RED}${FAIL_COUNT} check(s) failed.${RESET} Fix the issues above before deploying."
  exit 1
fi
