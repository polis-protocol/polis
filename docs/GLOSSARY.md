# Glossary

Domain terms and acronyms used across Polis Protocol.

## Protocol concepts

**Pop-up city**
A temporary in-person community gathering that mixes conference, co-living, and network-state experimentation. Examples: Zuzalu (2023), Edge City, Vitalia, Cabin, Ipê City (2026).

**Network state**
Balaji Srinivasan's term for a digital-first, geographically distributed community that may eventually acquire land and diplomatic recognition. Polis targets the tooling layer for these communities.

**Pop-up protocol**
The set of packages, contracts, and conventions Polis provides so any pop-up city can spin up community infrastructure quickly.

**Consumer app**
An application (typically Next.js) that depends on `@polisprotocol/*` packages. The first reference is [Ipê Hub](https://ipehub.xyz).

**Reference implementation**
A consumer app maintained by the protocol team as a live example. Currently: Ipê Hub.

## Architecture

**BFF (Backend-for-Frontend)**
A server that sits between consumer apps and backing services (Discourse, Postgres, etc.), exposing a unified typed API. In Polis, this is `@polisprotocol/bff` (Fastify + GraphQL Yoga).

**SIWE (Sign-In with Ethereum, EIP-4361)**
Standard for wallet-based authentication. User signs a structured message; server verifies the signature.

**DiscourseConnect SSO**
Discourse's built-in single-sign-on protocol. Polis uses it to create Discourse users on the fly when someone authenticates via SIWE.

**Lucia (v3)**
Lightweight TypeScript auth library. In Polis, handles session storage and cookie issuance after SIWE verification.

**Drizzle**
Type-safe SQL ORM for TypeScript. Used for the user registry schema (`cities`, `users`, `sessions`).

**Pothos**
Code-first GraphQL schema builder. Used in `@polisprotocol/bff` for typed GraphQL resolvers.

**SSE (Server-Sent Events)**
One-way streaming protocol over HTTP. Used for real-time forum updates.

**Degit**
Tool for cloning a Git repo as a plain directory (no history). Used by the CLI to scaffold new cities from `@polisprotocol/web-starter`.

## Blockchain

**PolisArchive**
The Solidity contract (`packages/contracts/src/PolisArchive.sol`) that records IPFS content hashes onchain. Multi-tenant — each city has an isolated namespace.

**Base**
Coinbase's Ethereum L2. Polis deploys to Base mainnet and Base Sepolia (testnet). Chosen for low fees and Coinbase integration.

**IPFS (InterPlanetary File System)**
Content-addressed distributed file system. Polis pins community snapshots to IPFS, then records the resulting CID onchain.

**CID (Content Identifier)**
A self-verifying hash-based address for content on IPFS.

**Snapshot**
A bundle of community state (posts, decisions, vote results) pinned to IPFS at a point in time. The CID is recorded in `PolisArchive.recordSnapshot`.

**SSO secret (DiscourseConnect)**
Shared HMAC key between BFF and Discourse used to sign SSO payloads.

## Infrastructure

**Hetzner**
Cloud VPS provider (Germany). Hosts the Discourse instance for each city.

**Fly.io**
App platform for running Docker containers close to users. Hosts the BFF in `gru` (São Paulo).

**Neon**
Serverless Postgres. Hosts the user registry and Lucia sessions.

**Upstash**
Serverless Redis. Hosts SIWE nonces (5min TTL) and SSE pub/sub channels.

**Cloudflare R2**
S3-compatible object storage with zero egress fees. Hosts user uploads.

**Doppler**
Secrets manager. Single source of truth for env vars across dev/staging/prod.

## Tooling

**Turborepo**
Monorepo task runner with remote caching. Orchestrates `build`, `test`, `lint`, `typecheck` across packages.

**pnpm workspaces**
Monorepo dependency manager. Links workspace packages without publishing.

**Changesets**
Versioning + changelog tool for monorepos. Each non-trivial PR opens a changeset describing semver impact.

**tsup**
Zero-config TypeScript bundler. Used to produce ESM + CJS + `.d.ts` for all publishable packages.

**Foundry / Forge**
Solidity toolchain. `forge build`, `forge test`, `forge script` for contracts.

**MSW (Mock Service Worker)**
HTTP mocking library. Used in BFF integration tests to mock Discourse responses.

## Ipê-specific (reference implementation)

**Ipê City**
Pop-up city in Florianópolis, Brazil, running April 23 – May 1, 2026.

**Ipê Hub**
The Next.js app at [ipehub.xyz](https://ipehub.xyz) that serves as the community's primary touchpoint. Already live with People, Events, Apps. Adding `/community` via `@polisprotocol/react` for v0.1.

**OpenMic**
A live-streamed Ipê category where residents share ideas over a scheduled slot. The `LiveBanner` component surfaces the current live session.

**DeegaLabs**
Company maintaining Polis Protocol and Ipê Hub. Run by Daniel Gorgonha and Dayane Gorgonha.
