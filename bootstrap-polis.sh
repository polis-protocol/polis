#!/usr/bin/env bash
# bootstrap-polis.sh
# Automates Sprint 1 Day 1 foundation tasks for Polis Protocol.
# Run after: GitHub org `polis-protocol` created, npm org `@polis` created,
# gh CLI authenticated, pnpm installed.
#
# Usage:
#   chmod +x bootstrap-polis.sh
#   ./bootstrap-polis.sh

set -euo pipefail

# ============================================================
# CONFIG
# ============================================================
ORG="polis-protocol"
REPO="polis"
DESCRIPTION="Open protocol for pop-up cities. One stack, many cities."
HOMEPAGE="https://polis-protocol.org"
NODE_VERSION="22"
PNPM_VERSION="9.12.0"

WORK_DIR="$HOME/work"
REPO_PATH="$WORK_DIR/$REPO"

# ============================================================
# HELPERS
# ============================================================
info()  { echo -e "\033[1;36m→\033[0m $*"; }
ok()    { echo -e "\033[1;32m✓\033[0m $*"; }
warn()  { echo -e "\033[1;33m!\033[0m $*"; }
err()   { echo -e "\033[1;31m✗\033[0m $*" >&2; }

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || { err "Missing command: $1"; exit 1; }
}

# ============================================================
# PRE-FLIGHT
# ============================================================
info "Pre-flight checks..."
require_cmd git
require_cmd gh
require_cmd pnpm
require_cmd node

NODE_MAJOR=$(node -p "process.versions.node.split('.')[0]")
if [ "$NODE_MAJOR" -lt "$NODE_VERSION" ]; then
  err "Node $NODE_VERSION+ required (found $NODE_MAJOR). Run: nvm use $NODE_VERSION"
  exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
  err "gh CLI not authenticated. Run: gh auth login"
  exit 1
fi

if ! gh api "/orgs/$ORG" >/dev/null 2>&1; then
  err "GitHub org '$ORG' not accessible. Create it first at https://github.com/organizations/new"
  exit 1
fi

ok "Pre-flight passed."

# ============================================================
# T1.1 — CREATE REPO + CLONE
# ============================================================
info "Creating repo $ORG/$REPO..."
mkdir -p "$WORK_DIR"
cd "$WORK_DIR"

if gh repo view "$ORG/$REPO" >/dev/null 2>&1; then
  warn "Repo $ORG/$REPO already exists. Cloning existing."
else
  gh repo create "$ORG/$REPO" \
    --public \
    --license apache-2.0 \
    --description "$DESCRIPTION" \
    --homepage "$HOMEPAGE" \
    --clone
  ok "Repo created."
fi

if [ ! -d "$REPO_PATH" ]; then
  git clone "git@github.com:$ORG/$REPO.git" "$REPO_PATH"
fi

cd "$REPO_PATH"
ok "Working directory: $REPO_PATH"

# ============================================================
# T1.2 — MONOREPO SCAFFOLD
# ============================================================
info "Initializing monorepo structure..."

mkdir -p packages/{core,react,bff,cli,contracts,theme-default,web-starter,tsconfig,eslint-config}
mkdir -p apps/docs
mkdir -p examples/minimal
mkdir -p infra/{docker,terraform}
mkdir -p docs/reference
mkdir -p scripts
mkdir -p .github/{ISSUE_TEMPLATE,workflows}

# Root package.json
cat > package.json << 'EOF'
{
  "name": "polis-protocol",
  "version": "0.0.0",
  "private": true,
  "description": "Open protocol for pop-up cities",
  "license": "Apache-2.0",
  "packageManager": "pnpm@9.12.0",
  "engines": {
    "node": ">=22"
  },
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "typecheck": "turbo run typecheck",
    "clean": "turbo run clean && rm -rf node_modules"
  },
  "devDependencies": {
    "@changesets/cli": "^2.27.9",
    "turbo": "^2.3.0",
    "typescript": "^5.6.3"
  }
}
EOF

# pnpm workspace
cat > pnpm-workspace.yaml << 'EOF'
packages:
  - 'packages/*'
  - 'apps/*'
  - 'examples/*'
EOF

# .npmrc
cat > .npmrc << 'EOF'
strict-peer-dependencies=false
auto-install-peers=true
EOF

# turbo.json
cat > turbo.json << 'EOF'
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "!.next/cache/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"]
    },
    "lint": {},
    "typecheck": {
      "dependsOn": ["^build"]
    },
    "clean": {
      "cache": false
    }
  }
}
EOF

# Root tsconfig.base.json
cat > tsconfig.base.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": false,
    "declaration": true,
    "sourceMap": true
  }
}
EOF

# .gitignore
cat > .gitignore << 'EOF'
# Dependencies
node_modules
.pnpm-store

# Build outputs
dist
build
.next
.turbo
out
coverage

# Env files
.env
.env.*
!.env.example

# IDE
.vscode/*
!.vscode/extensions.json
!.vscode/settings.json
.idea

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
pnpm-debug.log*

# Misc
*.tsbuildinfo
EOF

# .editorconfig
cat > .editorconfig << 'EOF'
root = true

[*]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true

[*.md]
trim_trailing_whitespace = false
EOF

ok "Monorepo scaffold written."

# ============================================================
# T1.6 — GOVERNANCE FILES
# ============================================================
info "Writing governance files..."

cat > README.md << 'EOF'
<div align="center">

# Polis Protocol

### Open protocol for pop-up cities. One stack, many cities.

[![CI](https://github.com/polis-protocol/polis/actions/workflows/ci.yml/badge.svg)](https://github.com/polis-protocol/polis/actions)
[![License: Apache 2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)
[![npm](https://img.shields.io/npm/v/@polis/core.svg)](https://www.npmjs.com/package/@polis/core)

[Docs](https://polis-protocol.org) · [Architecture](./docs/reference/architecture-v0.2.html) · [Development plan](./DEVELOPMENT-PLAN.md)

</div>

---

## What is Polis?

Polis is the open-source community layer for pop-up cities — Zuzalu, Edge City, Cabin, Vitalia, and the next ones. Drop-in forum, wallet-native identity, real-time community feed, and onchain archive that outlives any single city.

**Reference implementation**: [Ipê Hub](https://ipehub.xyz) — the Ipê City 2026 pop-up in Florianópolis, Brazil.

## Quickstart

```bash
npx create-polis-city my-city
cd my-city
pnpm install
pnpm dev
```

30 minutes from zero to live community. See [docs](https://polis-protocol.org) for deploy guides.

## Architecture

Four planes: client, aggregation (BFF + GraphQL), sources of truth (Discourse + Postgres + onchain), decentralization (IPFS + Base). See the [full spec](./docs/reference/architecture-v0.2.html).

## Packages

| Package | Purpose |
|---------|---------|
| `@polis/core` | Types, schemas, `defineConfig` |
| `@polis/react` | Components + hooks (framework-agnostic) |
| `@polis/bff` | Fastify + GraphQL gateway |
| `@polis/cli` | `create-polis-city` scaffolder |
| `@polis/contracts` | Solidity contracts (Base) |
| `@polis/theme-default` | Baseline theme tokens |
| `@polis/web-starter` | Next.js starter used by CLI |

## Status

Pre-v0.1.0 — targeting release **May 1, 2026** alongside Ipê City closing day.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md). RFCs via [Discussions](https://github.com/polis-protocol/polis/discussions).

## Governance

BDFL light → steering committee. See [GOVERNANCE.md](./GOVERNANCE.md).

## License

[Apache 2.0](./LICENSE) — initiated by [DeegaLabs](https://deegalabs.com.br).
EOF

cat > CONTRIBUTING.md << 'EOF'
# Contributing to Polis Protocol

Thanks for your interest! Contributions of any size are welcome — code, docs, RFCs, bug reports.

## Before you start

- Check existing [issues](https://github.com/polis-protocol/polis/issues) and [discussions](https://github.com/polis-protocol/polis/discussions).
- For non-trivial changes, open an RFC in Discussions first.
- Read [CLAUDE.md](./CLAUDE.md) for project conventions.

## Development setup

Requirements: Node 22+, pnpm 9.12+, Foundry (for contracts).

```bash
git clone https://github.com/polis-protocol/polis.git
cd polis
pnpm install
pnpm build
pnpm test
```

## Commit convention

[Conventional Commits](https://www.conventionalcommits.org/):

```
feat(react): add LiveBanner component
fix(bff): handle null in createTopic
docs: update quickstart
```

Scopes: `core`, `react`, `bff`, `cli`, `contracts`, `theme`, `docs`, `infra`.

## Pull request workflow

1. Fork and branch from `main`.
2. Make changes. Keep PRs focused.
3. Add tests. Update docs if relevant.
4. Run `pnpm lint && pnpm typecheck && pnpm test`.
5. Open a Changeset: `pnpm changeset`.
6. Open PR with a clear title + description.
7. Squash merge once approved.

## RFC process

Substantial changes (new packages, breaking API, architectural shifts) go through RFC:

1. Open a Discussion under "Ideas" with the RFC template.
2. 7-day minimum comment period.
3. Maintainer decision: accept / revise / reject, with rationale.
4. Accepted RFCs become issues to implement.

## Code of conduct

See [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md). Be kind. Assume good faith.
EOF

cat > GOVERNANCE.md << 'EOF'
# Governance

## Current phase: BDFL light

Maintained by **DeegaLabs** (Daniel Gorgonha + Dayane Gorgonha).

- Small decisions: via PR review.
- Significant decisions: via RFC in Discussions, 7-day comment minimum, maintainer call.
- Emergency fixes (security, broken main): maintainers act first, discuss after.

## Next phase: Steering committee

Once **3+ pop-up cities are in production** running Polis, governance transitions to a steering committee:

- 5 seats total
- 1 seat reserved for DeegaLabs
- 4 seats elected by implementing cities
- Term: 12 months, staggered
- Charter documented here

## Funding

No token, no ICO, no pre-sale, ever.

Sustainable funding via:

- Public goods funding (Gitcoin, Optimism RetroPGF, Octant)
- Grants (ZCG, Ethereum Foundation ESP, protocol-specific)
- Implementation services by maintainers and contributors
- Optional managed hosting (future "Polis Cloud")

## Trademark

"Polis Protocol" and the logo are maintained in good faith by DeegaLabs for the benefit of the community. Will be transferred to a neutral foundation if/when one is established.
EOF

cat > CODE_OF_CONDUCT.md << 'EOF'
# Code of Conduct

This project follows the [Contributor Covenant v2.1](https://www.contributor-covenant.org/version/2/1/code_of_conduct/).

Reports to: conduct@polis-protocol.org (or daniel@deegalabs.com.br as fallback).
EOF

cat > SECURITY.md << 'EOF'
# Security Policy

## Reporting a vulnerability

Email: **security@polis-protocol.org**

Please do not open a public issue for security reports.

We aim to respond within 72 hours and coordinate disclosure.

## Scope

- `@polis/bff` — auth, session handling, input validation
- `@polis/contracts` — smart contracts on Base
- Default Discourse configuration
- Official Docker images

## Out of scope

- Third-party implementations (each city's deployment is their responsibility)
- Known Discourse CVEs (report upstream)
EOF

cat > .github/PULL_REQUEST_TEMPLATE.md << 'EOF'
## What

<!-- Brief description of what this PR does -->

## Why

<!-- Motivation / context / linked issue -->

## How

<!-- Approach, trade-offs, alternatives considered -->

## Checklist

- [ ] Tests added / updated
- [ ] Docs updated (if relevant)
- [ ] Changeset added (`pnpm changeset`)
- [ ] `pnpm lint && pnpm typecheck && pnpm test` passes
- [ ] PR title follows Conventional Commits
EOF

cat > .github/ISSUE_TEMPLATE/bug.md << 'EOF'
---
name: Bug report
about: Something isn't working
labels: bug
---

## Description

## Reproduction steps

1.
2.
3.

## Expected

## Actual

## Environment

- Polis version:
- Node version:
- OS:
EOF

cat > .github/ISSUE_TEMPLATE/feature.md << 'EOF'
---
name: Feature request
about: Propose something new
labels: enhancement
---

## Problem

## Proposed solution

## Alternatives considered

## Additional context
EOF

cat > .github/ISSUE_TEMPLATE/rfc.md << 'EOF'
---
name: RFC
about: Substantial change requiring discussion
labels: rfc
---

## Motivation

## Design

## Alternatives

## Risks

## Rollout
EOF

ok "Governance files written."

# ============================================================
# T1.4 — CHANGESETS
# ============================================================
info "Configuring Changesets..."

pnpm add -Dw @changesets/cli 2>/dev/null || true

mkdir -p .changeset
cat > .changeset/config.json << 'EOF'
{
  "$schema": "https://unpkg.com/@changesets/config@3.0.4/schema.json",
  "changelog": "@changesets/cli/changelog",
  "commit": false,
  "fixed": [],
  "linked": [],
  "access": "public",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": ["docs", "minimal"]
}
EOF

ok "Changesets configured."

# ============================================================
# T1.5 — CI WORKFLOW
# ============================================================
info "Writing CI workflow..."

cat > .github/workflows/ci.yml << 'EOF'
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [20, 22]
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 9.12.0

      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: pnpm

      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm typecheck
      - run: pnpm test
      - run: pnpm build
EOF

cat > .github/workflows/release.yml << 'EOF'
name: Release

on:
  push:
    branches: [main]

concurrency: ${{ github.workflow }}-${{ github.ref }}

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: pnpm/action-setup@v4
        with:
          version: 9.12.0

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
          registry-url: https://registry.npmjs.org

      - run: pnpm install --frozen-lockfile
      - run: pnpm build

      - uses: changesets/action@v1
        with:
          publish: pnpm -r publish --access public --no-git-checks
          version: pnpm changeset version
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
EOF

ok "CI workflows written."

# ============================================================
# FIRST COMMIT
# ============================================================
info "Creating first commit..."

git add -A
git commit -m "chore: bootstrap monorepo

- Turborepo + pnpm workspaces
- TypeScript strict, Node 22+
- Governance: LICENSE (Apache 2.0), README, CONTRIBUTING, GOVERNANCE, CODE_OF_CONDUCT, SECURITY
- GitHub templates: bug, feature, RFC, PR
- CI + Release workflows
- Changesets configured

Refs: DEVELOPMENT-PLAN.md Sprint 1 T1.2–T1.6"

git branch -M main
git push -u origin main

ok "First commit pushed to main."

# ============================================================
# NEXT STEPS
# ============================================================
echo ""
echo "════════════════════════════════════════════════"
echo "  ✓ Sprint 1 Day 1 foundation complete."
echo "════════════════════════════════════════════════"
echo ""
echo "Next:"
echo "  1. Copy CLAUDE.md from /mnt/user-data/outputs/CLAUDE.polis-protocol.md to $REPO_PATH/CLAUDE.md"
echo "  2. Copy DEVELOPMENT-PLAN.md to $REPO_PATH/DEVELOPMENT-PLAN.md"
echo "  3. Add NPM_TOKEN secret in GitHub repo settings"
echo "  4. Add your GitHub co-maintainer (Dayane) as admin: gh api -X PUT /orgs/$ORG/memberships/<user> -f role=admin"
echo "  5. Start T1.7 (Mintlify docs scaffold) — follow the plan"
echo ""
echo "Repo: https://github.com/$ORG/$REPO"
echo "Local: $REPO_PATH"
echo ""
