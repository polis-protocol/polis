# Polis Protocol

Open-source **coordination layer** for pop-up cities. Not a monolithic community app — a composable set of React components, a typed BFF, and a pluggable auth model that wires each city to best-of-category community primitives (forum, chat, microblog, DMs, governance, livestream, onchain archive).

Target: `v0.1.0` shipped by **May 1, 2026**, coinciding with Ipê City 2026 closing day.

## Packages

| Package | Description |
|---------|-------------|
| `@polisprotocol/core` | Types, Zod schemas, Drizzle schema, `defineConfig()` |
| `@polisprotocol/react` | React components + hooks (framework-agnostic) |
| `@polisprotocol/bff` | Fastify + GraphQL Yoga gateway |
| `@polisprotocol/theme-default` | Default dark theme tokens |
| `@polisprotocol/contracts` | Solidity contracts (Foundry) on Base |
| `create-polis-city` | CLI scaffolder (unscoped, npm `create-*` convention) |
| `@polisprotocol/web-starter` | Next.js 15 template (private, cloned via degit) |

## Quick start

```bash
pnpm create polis-city my-city
cd my-city
pnpm dev
```

See [`docs/ENVIRONMENT.md`](./docs/ENVIRONMENT.md) for the full local setup.

## Development

```bash
git clone https://github.com/polis-protocol/polis.git
cd polis
pnpm install
pnpm build
pnpm test
```

## Documentation

- **Contributor docs:** [`docs/`](./docs/) — architecture, decisions, deployment, testing
- **User docs:** [docs.polis-protocol.org](https://docs.polis-protocol.org) (source: [`apps/docs/`](./apps/docs/))
- **Quickstart:** [`docs/ENVIRONMENT.md`](./docs/ENVIRONMENT.md)
- **Architecture:** [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md)
- **Deployment:** [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md)
- **Decisions (ADRs):** [`docs/DECISIONS.md`](./docs/DECISIONS.md)

## Stack

TypeScript · pnpm workspaces · Turborepo · Next.js 15 · Fastify · GraphQL Yoga · Pothos · Drizzle ORM · Postgres (Neon) · Lucia v3 · SIWE · Discourse · Foundry · Base (L2) · Vitest · Playwright · Forge

## Reference implementation

[Ipê Hub](https://ipehub.xyz) — community platform for Ipê City, Florianópolis, Brazil. Adds `/community` route consuming `@polisprotocol/react`.

## Contributing

See [`CONTRIBUTING.md`](./CONTRIBUTING.md). All commits follow Conventional Commits. Every non-trivial PR opens a Changeset.

## Governance & policies

- [`GOVERNANCE.md`](./GOVERNANCE.md) — decision making
- [`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md) — community standards
- [`SECURITY.md`](./SECURITY.md) — vulnerability disclosure

## License

[Apache 2.0](./LICENSE). Maintained by [DeegaLabs](https://deegalabs.com.br).
