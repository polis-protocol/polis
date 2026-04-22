# Internal Documentation

Contributor-facing documentation for Polis Protocol. These docs describe **how the project is built** — architecture, decisions, environment, testing, deployment.

For **user-facing** documentation (how to use the protocol), see [`apps/docs/`](../apps/docs/) — published at [docs.polis-protocol.org](https://docs.polis-protocol.org).

## Index

| File | Purpose |
|------|---------|
| [`ARCHITECTURE.md`](./ARCHITECTURE.md) | System design, package boundaries, request flow |
| [`DECISIONS.md`](./DECISIONS.md) | Architecture Decision Records (ADRs) |
| [`DEVELOPMENT_PLAN.md`](./DEVELOPMENT_PLAN.md) | Sprint plan, task breakdown, scope freeze rules |
| [`ENVIRONMENT.md`](./ENVIRONMENT.md) | Accounts, env vars, local stack setup |
| [`DEPLOYMENT.md`](./DEPLOYMENT.md) | Production deployment steps (Hetzner, Fly, Vercel, Base) |
| [`TEST_STRATEGY.md`](./TEST_STRATEGY.md) | Unit, integration, E2E, contract testing approach |
| [`GLOSSARY.md`](./GLOSSARY.md) | Domain terms and acronyms |

## Contribution

When landing a non-trivial change, update the relevant doc in the same PR. Docs here rot faster than the user-facing Mintlify site, so keep them tight and link to source of truth (code) rather than duplicating it.
