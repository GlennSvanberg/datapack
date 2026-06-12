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
| Serve latest pack data | `GET /api/packs/:packId` → `data/packs/{packId}.json` |
| Record telemetry | `POST /api/telemetry` → append to `data/telemetry.json` |
| Usage dashboard | React routes under `src/routes/` |
| Vercel deployment | This directory is the Vercel **Root Directory** |

Every telemetry event and pack fetch is keyed by **`packId`** so we know which assortment file triggered the action.

## Scaffolding commands

```bash
cd app
npm run dev
npm run generate-routes   # after adding/removing routes
npx @tanstack/intent@latest list
```

Repo root: `datapack/`. Sibling folders: `datapack/` (pack runtime), `sample-data/`, `packs/`.

## Stack

| Choice | Value |
|--------|-------|
| Framework | React 19 |
| Router | File-based (`src/routes/`) |
| Toolchain | TanStack CLI, Vite 8, TypeScript, npm |
| Styling | Tailwind CSS v4 |
| Data (POC) | Static JSON in `data/` — no database |

## Environment variables

| Variable | Purpose |
|----------|---------|
| `VITE_API_BASE` | Optional; public app URL for client-side links |

Server routes read/write `data/telemetry.json` and `data/packs/*.json`. On Vercel serverless, file writes may be ephemeral — acceptable for POC demos; document if switching to Vercel KV / Blob later.

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Dev server on port 3000 |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run generate-routes` | Regenerate `src/routeTree.gen.ts` |
| `npm run test` | Vitest |

## Architecture

```
app/
├── data/
│   ├── packs/              # {packId}.json — latest manifest per assortment
│   └── telemetry.json      # Appended events from DataPack files
├── src/
│   ├── routes/
│   │   ├── __root.tsx
│   │   ├── index.tsx       # Dashboard home
│   │   └── api/            # API routes (packs, telemetry)
│   ├── router.tsx
│   ├── routeTree.gen.ts    # Generated — do not edit
│   └── styles.css
├── vite.config.ts
└── tsr.config.json
```

### Patterns

- `getRouter()` in `src/router.tsx` wires the generated route tree
- Root route uses `shellComponent` for the HTML document shell
- Use `createServerFn` or file-based API routes for server-only logic (telemetry append, pack read)
- API routes must return **CORS headers** so MHTML files opened locally can `fetch` the hosted API

### API routes to implement

```
GET  /api/packs/$packId     → read data/packs/{packId}.json
POST /api/telemetry         → append to data/telemetry.json
```

Request/response shapes: see [`../CONTEXT.md`](../CONTEXT.md).

## Design

- Dark, Notion-inspired dashboard — high contrast, clean typography
- Accent color for charts, badges, and primary actions
- Align visually with DataPack catalog where reasonable (shared CSS variables optional)

## Vercel deployment

1. Create Vercel project linked to this repo
2. Set **Root Directory** → `app`
3. Build command: `npm run build` (default)
4. Deploy; use production URL as `apiBase` when building MHTML packs

TanStack Start builds for Node/serverless targets. See `@tanstack/start-client-core#start-core/deployment` for adapter details if needed.

## Known gotchas

1. **Route generation** — run `npm run generate-routes` if `routeTree.gen.ts` is missing
2. **Vite plugin order** — `tanstackStart()` before `viteReact()` in `vite.config.ts`
3. **Do not edit** `routeTree.gen.ts`
4. **CORS** — required for local `.mhtml` → hosted API calls
5. **Serverless writes** — `telemetry.json` append works locally; may not persist on Vercel without external storage (POC limitation)

## Related directories (outside this package)

| Path | Purpose |
|------|---------|
| `../datapack/` | Vanilla JS catalog runtime embedded in MHTML |
| `../sample-data/` | Source JSON (often intentionally outdated) |
| `../packs/` | Built `.mhtml` files |

When changing manifest shape, update **both** `sample-data/`, `data/packs/`, and the pack runtime in `../datapack/`.
