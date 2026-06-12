<!-- intent-skills:start -->
## Skill Loading

Before substantial work:
- Skill check: run `npx @tanstack/intent@latest list`, or use skills already listed in context.
- Skill guidance: if one local skill clearly matches the task, run `npx @tanstack/intent@latest load <package>#<skill>` and follow the returned `SKILL.md`.
- Monorepos: when working across packages, run the skill check from the workspace root and prefer the local skill for the package being changed.
- Multiple matches: prefer the most specific local skill for the package or concern you are changing; load additional skills only when the task spans multiple packages or concerns.
<!-- intent-skills:end -->

# App — TanStack Start (dashboard + API)

**Product context:** read [`../CONTEXT.md`](../CONTEXT.md) and [`../AGENTS.md`](../AGENTS.md) at the repo root.

This package is the **hosted mothership**: dashboard for pack usage and HTTP API for pack updates + telemetry. DataPack `.mhtml` files (in `../datapack/` and `../packs/`) call into this app when online.

## Role in the system

| Responsibility | Implementation |
|----------------|----------------|
| Serve latest pack data | `GET /api/packs/:packId` → Convex `packs.getByPackId` |
| Record telemetry | `POST /api/telemetry` → Convex `telemetry.append` |
| Usage dashboard | React routes with `useQuery` (live Convex subscriptions) |
| Pack editing (demo) | `PackEditor` on pack detail → Convex mutations |
| Vercel deployment | This directory is the Vercel **Root Directory** |

Every telemetry event and pack fetch is keyed by **`packId`** so we know which assortment file triggered the action.

## Scaffolding commands

```bash
cd app
npm run dev:all          # Convex + Vite (recommended)
# or two terminals:
npm run convex:dev       # terminal 1
npm run dev              # terminal 2 (port 4040)
npm run convex:seed      # once, after first convex dev
npm run generate-routes  # after adding/removing routes
```

Repo root: `datapack/`. Sibling folders: `datapack/` (pack runtime), `sample-data/`, `packs/`.

## Stack

| Choice | Value |
|--------|-------|
| Framework | React 19 |
| Router | File-based (`src/routes/`) |
| Toolchain | TanStack CLI, Vite 8, TypeScript, npm |
| Styling | Tailwind CSS v4 |
| Persistence | Convex (`convex/`) — packs + telemetry |

## Environment variables

| Variable | Purpose |
|----------|---------|
| `CONVEX_URL` | Server-side Convex HTTP client (API routes) |
| `VITE_CONVEX_URL` | Client-side Convex React subscriptions |
| `CONVEX_DEPLOYMENT` | Set by `npx convex dev` |

Copy `.env.example` → `.env.local` after `npx convex dev`.

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Vite dev server on port 4040 |
| `npm run dev:all` | Convex dev + Vite together |
| `npm run convex:dev` | Convex dev only |
| `npm run convex:seed` | Import `data/` fixtures into Convex |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run generate-routes` | Regenerate `src/routeTree.gen.ts` |
| `npm run test` | Vitest |

## Architecture

```
app/
├── convex/
│   ├── schema.ts           # packs + telemetryEvents
│   ├── packs.ts            # queries + edit mutations
│   ├── telemetry.ts        # append + aggregate queries
│   └── seed.ts             # seed from data/ fixtures
├── data/                   # Seed fixtures only (not read at runtime)
├── src/
│   ├── routes/
│   │   ├── __root.tsx      # ConvexProvider + Live badge
│   │   ├── index.tsx       # Live dashboard home
│   │   ├── packs.$packId.tsx  # Live stats + PackEditor
│   │   └── api/            # CORS API → Convex proxy
│   ├── components/
│   │   ├── PackEditor.tsx
│   │   └── LiveBadge.tsx
│   └── lib/convex/         # client + server Convex helpers
└── vite.config.ts
```

### Patterns

- Dashboard uses **`useQuery` / `useMutation`** from `convex/react` for live data
- API routes use **`ConvexHttpClient`** via `src/lib/convex/server.ts`
- API routes must return **CORS headers** so pack HTML files can `fetch` the hosted API
- Regenerate `convex/seedFixtures.ts` from `data/` when fixtures change:
  `node scripts/generate-seed-fixtures.mjs`

### API routes

```
GET  /api/packs/$packId     → Convex packs.getByPackId
POST /api/telemetry         → Convex telemetry.append
```

Request/response shapes: see [`../CONTEXT.md`](../CONTEXT.md).

## Vercel + Convex deployment

1. `npx convex login` and `npx convex deploy` from `app/`
2. Set Vercel env vars: `CONVEX_URL`, `VITE_CONVEX_URL` (same Convex deployment URL)
3. Vercel project **Root Directory** → `app`
4. Build: `npm run build`
5. Run `npx convex run seed:runSeed` on production deployment once
6. Rebuild pack HTML with `API_BASE=https://your-app.vercel.app`

## Known gotchas

1. **Route generation** — run `npm run generate-routes` if `routeTree.gen.ts` is missing
2. **Convex must be running** — dashboard and API need `CONVEX_URL`; use `dev:all`
3. **Do not edit** `routeTree.gen.ts` or `convex/_generated/`
4. **CORS** — required for local pack HTML → hosted API calls
5. **Seed** — after resetting Convex, run `npm run convex:seed`

## Related directories (outside this package)

| Path | Purpose |
|------|---------|
| `../datapack/` | Vanilla JS catalog runtime embedded in MHTML |
| `../sample-data/` | Source JSON for building pack files |
| `../packs/` | Built `.html` pack files |

When changing manifest shape, update **sample-data**, **app/data** (seed fixtures), regenerate seed, and the pack runtime in `../datapack/`.

<!-- convex-ai-start -->

This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read
`convex/_generated/ai/guidelines.md` first** for important guidelines on
how to correctly use Convex APIs and patterns. The file contains rules that
override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running
`npx convex ai-files install`.

<!-- convex-ai-end -->
