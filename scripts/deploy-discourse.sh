#!/usr/bin/env bash
# deploy-discourse.sh — provision Hetzner VPS and bootstrap Discourse.
# First run takes ~25 min (terraform + cloud-init + launcher rebuild).
# Subsequent runs are fast — terraform is idempotent, SSH step is a no-op if already set up.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TF_DIR="$REPO_ROOT/infra/terraform/hetzner"

YELLOW='\033[1;33m'
GREEN='\033[0;32m'
RED='\033[0;31m'
DIM='\033[2m'
RESET='\033[0m'

log()  { echo -e "${YELLOW}▸${RESET} $1"; }
ok()   { echo -e "${GREEN}✓${RESET} $1"; }
fail() { echo -e "${RED}✗${RESET} $1" >&2; }

# ── 1. Validate inputs ──────────────────────────────────────────────
if [ ! -f "$TF_DIR/terraform.tfvars" ]; then
  fail "terraform.tfvars not found at $TF_DIR/terraform.tfvars"
  echo "Copy the example and fill it in:"
  echo "  cp $TF_DIR/terraform.tfvars.example $TF_DIR/terraform.tfvars"
  echo "  \$EDITOR $TF_DIR/terraform.tfvars"
  exit 1
fi

# ── 2. Terraform apply ──────────────────────────────────────────────
log "terraform init"
terraform -chdir="$TF_DIR" init -upgrade -input=false

log "terraform plan"
terraform -chdir="$TF_DIR" plan -out=tfplan -input=false

echo
read -p "Apply this plan? (yes/no) " -r reply
if [ "$reply" != "yes" ]; then
  echo "Aborted."
  exit 0
fi

log "terraform apply"
terraform -chdir="$TF_DIR" apply -input=false tfplan
rm -f "$TF_DIR/tfplan"

SERVER_IP=$(terraform -chdir="$TF_DIR" output -raw server_ip)
ok "server provisioned: $SERVER_IP"

# ── 3. Post-install Discourse ───────────────────────────────────────
echo
log "Next step (manual): SSH in and run the Discourse container."
echo
echo "    ssh root@$SERVER_IP"
echo "    cd /var/discourse"
echo "    ./launcher rebuild app     # takes ~20 min the first time"
echo
echo "After the rebuild completes, visit https://forum.<your-domain>/ and:"
echo "  1. Create the admin account"
echo "  2. Admin → API → generate API key (user: system)"
echo "  3. Admin → Customize → Categories → create your polis.config categories"
echo "  4. Admin → Settings → Login → enable DiscourseConnect, set URL + SSO secret"
echo
echo "Store the API key in Doppler:"
echo "    doppler secrets set DISCOURSE_API_KEY=<paste>"
echo
echo -e "${DIM}Rollback: terraform -chdir=$TF_DIR destroy${RESET}"
