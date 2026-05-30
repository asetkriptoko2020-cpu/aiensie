# Aiensie

Aiensie is a behavioral analytics platform for traders. It analyzes trading history (imported via CSV from exchanges like Binance, Bybit, OKX, and Hyperliquid) to compute an "Aiensie Score" based on trading discipline, risk control, consistency, and emotional stability. It detects patterns like Overtrading, Revenge Trading, and Loss Holding Bias to give actionable feedback.

## Run & Operate

- Run button / "Start application" workflow — starts the Vite dev server at port 5000
- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string (needed when the API server or DB layer is used)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 19, Vite, Tailwind CSS 4, Wouter (routing), Radix UI, Framer Motion
- API: Express 5
- DB: PostgreSQL + Drizzle ORM (schema currently empty — no tables defined yet)
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/aiensie/` — main React frontend app
- `artifacts/api-server/` — Express API backend (health check only currently)
- `lib/aiensie/` — core scoring engine and CSV parsers (used directly in the browser)
- `lib/db/` — Drizzle DB layer and schema
- `lib/api-spec/` — OpenAPI spec + Orval codegen config
- `lib/api-client-react/` — generated React hooks
- `lib/api-zod/` — generated Zod schemas

## Architecture decisions

- All heavy CSV analysis and scoring runs locally in the browser via `@workspace/aiensie-engine` — no data is uploaded to external servers.
- The login page (`/login`) is currently a UI mock — clicking "Continue" navigates directly to the dashboard without real authentication.
- The DB schema is scaffolded but empty — no tables are defined yet. The API server only exposes a `/api/healthz` endpoint.

## Product

Aiensie gives traders a behavioral score across 4 dimensions: Discipline, Risk Control, Consistency, and Emotional Stability. Users upload a CSV from their exchange, and the app parses and scores their trading history locally.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- The workflow runs from `artifacts/aiensie` with `PORT=5000 BASE_PATH=/` — both env vars are required by `vite.config.ts`.
- Use Node.js 24 (already configured). The pnpm workspace `minimumReleaseAge: 1440` setting prevents installing packages published less than 1 day ago (supply-chain defense).

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
