# Contributing to Polis Protocol

Thank you for your interest in contributing to Polis Protocol! This document outlines the process for contributing.

## Getting started

1. Fork the repository
2. Clone your fork
3. Install dependencies: `pnpm install`
4. Create a feature branch: `git checkout -b feat/my-feature`

## Development

```bash
pnpm install        # Install dependencies
pnpm build          # Build all packages
pnpm dev            # Start development servers
pnpm test           # Run tests
pnpm lint           # Lint code
pnpm typecheck      # Type check
```

## Pull request process

1. Follow [Conventional Commits](https://www.conventionalcommits.org/): `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`
2. Include scope when relevant: `feat(bff): add SSE endpoint`
3. Add a [Changeset](https://github.com/changesets/changesets) for non-trivial changes: `pnpm changeset`
4. Ensure `pnpm lint && pnpm typecheck && pnpm test` passes
5. Write tests for new logic
6. Fill out the PR template

## Code conventions

- TypeScript strict mode everywhere
- `any` is banned — use `unknown` + type guards
- All external input is Zod-validated at the boundary
- File naming: `kebab-case.ts`, `PascalCase` for React components
- Explicit return types on exported functions

## Package boundaries

- `@polisprotocol/core` — zero runtime deps beyond Zod + Drizzle
- `@polisprotocol/react` — no Next.js imports, framework-agnostic
- `@polisprotocol/bff` — deployable Fastify server
- Nothing Ipe-specific goes in this repo

## License

By contributing, you agree that your contributions will be licensed under the Apache License 2.0.
