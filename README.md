# Polis Protocol

Open-source infrastructure for pop-up cities. Forum, identity, governance, and onchain archival — configurable per city.

## Packages

| Package | Description |
|---------|-------------|
| `@polis/core` | Types, Zod schemas, Drizzle schema, `defineConfig()` |
| `@polis/react` | React components + hooks (framework-agnostic) |
| `@polis/bff` | Fastify + GraphQL Yoga gateway |
| `@polis/theme-default` | Default dark theme tokens |
| `@polis/cli` | `create-polis-city` scaffolder |
| `@polis/contracts` | Solidity contracts (Foundry) |
| `@polis/web-starter` | Next.js 15 template |

## Quick start

```bash
pnpm create polis-city my-city
cd my-city
pnpm dev
```

## Development

```bash
git clone https://github.com/polis-protocol/polis.git
cd polis
pnpm install
pnpm build
pnpm test
```

## Stack

TypeScript, pnpm workspaces, Turborepo, Next.js 15, Fastify, GraphQL Yoga, Pothos, Drizzle ORM, Postgres, Lucia v3, SIWE, Discourse, Foundry, Base (L2).

## Reference implementation

[Ipê Hub](https://ipehub.xyz) — community platform for Ipê City, Florianópolis, Brazil.

## License

Apache 2.0 — see [LICENSE](./LICENSE).

Maintained by [DeegaLabs](https://deegalabs.com).
