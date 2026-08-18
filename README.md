# GRIDTWIN AI

Energy Decision Platform for Building Owners.

Competition MVP that helps small building owners decide how to allocate an
energy-transition budget by combining deterministic energy/financial simulation,
budget-aware optimization, and AI-assisted explanation.

## Repository layout

```
gridtwin/
├── apps/
│   ├── api/          # Express + TypeScript REST API
│   └── web/          # Next.js + TypeScript + Tailwind CSS frontend
├── packages/
│   └── shared/       # Shared TypeScript contracts (API/web)
├── .gitignore
├── package.json
├── pnpm-workspace.yaml
└── README.md
```

## Requirements

- Node.js >= 20
- pnpm >= 10 (repository is pinned via `packageManager`)

## Getting started

```bash
pnpm install

# development
pnpm dev:api        # API on http://localhost:4000 (health check: GET /health)
pnpm dev:web        # Web on http://localhost:3000
```

Environment variables: copy `apps/api/.env.example` → `apps/api/.env` and
`apps/web/.env.example` → `apps/web/.env`, then fill in your own values.
Real `.env` files are gitignored and must never be committed.

## Scripts

| Command | Purpose |
| --- | --- |
| `pnpm lint` | ESLint over the whole workspace |
| `pnpm typecheck` | Strict TypeScript checks for all packages |
| `pnpm test` | Vitest unit tests |
| `pnpm build` | Build shared package, API, and web app |

## Security notes

- Server-side secrets (database service keys, AI API keys) belong only to the
  API process environment and are never exposed to the browser.
- The web app only ever receives browser-safe (`NEXT_PUBLIC_*`) variables.
- `.env` files and credentials are excluded from version control.

## Status

Phase 1 scaffold: monorepo, tooling, and boot verification only.
Feature development proceeds phase by phase.
