# Agent guide — Friluftsportalen DataPack POC

**Read [`CONTEXT.md`](./CONTEXT.md) first** for product vision, data model, API contract, and scope.

## What this repo is

Two deliverables in one monorepo:

| Deliverable | Directory | Tech |
|-------------|-----------|------|
| **Hosted app** — dashboard + API | `app/` | TanStack Start, React 19, Tailwind v4 |
| **DataPack** — single-file catalog | `datapack/`, `sample-data/`, `packs/` | Vanilla JS inside `.mhtml` |

**Convex** for pack data and telemetry (`app/convex/`). `app/data/` is seed fixtures only.

## Where to look

| Task | Location |
|------|----------|
| Product vision, manifest shape, API | [`CONTEXT.md`](./CONTEXT.md) |
| Dashboard UI, routes, server API | [`app/src/`](./app/src/) |
| Pack JSON served by API | [`app/data/packs/`](./app/data/packs/) |
| Convex backend (packs + telemetry) | [`app/convex/`](./app/convex/) |
| Seed fixtures | [`app/data/`](./app/data/) |
| TanStack-specific gotchas | [`app/AGENTS.md`](./app/AGENTS.md) |
| Sample / outdated source data | [`sample-data/`](./sample-data/) |
| Pack HTML template + runtime JS | [`datapack/`](./datapack/) |
| Built pack HTML (local + prod) | [`packs/local/`](./packs/local/), [`packs/prod/`](./packs/prod/) |

## Commands

```bash
# Dashboard + API (from repo root)
cd app
npm run dev:all          # Convex + dashboard http://localhost:4040
npm run convex:seed      # once after first convex dev
npm run generate-routes  # after adding/removing route files
npm run build
npm run preview

# DataPack HTML (from repo root) — always builds BOTH environments
npm run build:packs
# → packs/local/{packId}.html  (apiBase http://localhost:4040)
# → packs/prod/{packId}.html   (apiBase https://datapack-one.vercel.app)
```

**Always run `npm run build:packs` after changing `datapack/` runtime, styles, or sample data.** One command writes local and prod outputs; do not build only one environment unless the user explicitly asks for a single target.

## Vercel deployment

- **Root Directory:** `app` (set in Vercel project settings)
- **Framework:** Vite / TanStack Start (auto-detected or Other)
- **Build:** `npm run build`
- Pack files embed `apiBase` per environment — see `npm run build:packs` (always produces `packs/local/` + `packs/prod/`)

Do not put secrets in client bundles. POC APIs are open; no auth required yet.

## Conventions

### Product

- **Brand:** Friluftsportalen (fictional outdoor retailer)
- **Assortments:** small (roughly 3–8 products per `.mhtml`)
- **Languages:** SV, NO, DA, FI — language switcher inside each pack
- **Exports:** CSV, Excel, JSON, XML — field picker wizard; optimize for ease of use
- **packId:** every pack, telemetry event, and API call must include it

### Code

- **DataPack = vanilla JS** — no React inside `.mhtml`; must work offline
- **App = React + TanStack** — dashboard and server routes only
- **Keep POC simple** — polished UI, minimal moving parts
- **Telemetry** — real `POST /api/telemetry` → Convex; never block UI on failure
- **Updates** — `GET /api/packs/:packId`; pack stores `packId` + `apiBase` in manifest meta

### Design

- Dark, Notion-like UI — high contrast, clean spacing
- Accent color on primary CTAs only (export, update, wizard steps)
- Friluftsportalen logo in pack header
- Shared visual language between pack and dashboard where practical

## Do not

- Edit `app/src/routeTree.gen.ts` — run `npm run generate-routes`
- Add Postgres or auth unless explicitly requested
- Use huge product lists in sample data
- Rely on CDN scripts in MHTML if avoidable (prefer inlined assets for single-file portability)
- Block catalog or export when offline or when telemetry fails

## Typical tasks

| User asks for… | Work in… |
|----------------|----------|
| Export wizard, catalog UI, stale banner | `datapack/` |
| New sample assortment | `sample-data/` + `app/data/packs/{packId}.json` + `npm run convex:seed` |
| Telemetry API, pack update API | `app/src/routes/api/` or server functions |
| Dashboard / insights UI | `app/src/routes/` |
| Rebuild pack HTML | `npm run build:packs` → `packs/local/` + `packs/prod/` (always both) |

## API quick reference

```
GET  /api/packs/:packId     → latest manifest JSON
POST /api/telemetry         → Convex append { packId, event, timestamp, payload }
```

See [`CONTEXT.md`](./CONTEXT.md) for full request/response shapes.

## Before large changes

1. Re-read [`CONTEXT.md`](./CONTEXT.md)
2. For TanStack work: see [`app/AGENTS.md`](./app/AGENTS.md) and run `npx @tanstack/intent@latest list` from `app/`
3. Match patterns in the folder you are editing
