# Agent guide — Friluftsportalen DataPack POC

**Read [`CONTEXT.md`](./CONTEXT.md) first** for product vision, embed architecture, API contract, and scope.

## What this repo is

One monorepo with a hosted app and a distributable embed widget:

| Deliverable | Location | Tech |
|-------------|----------|------|
| **Hosted app** — dashboard + embed API | `app/` | TanStack Start, React 19, Tailwind v4 |
| **Embed widget** — live product card | `app/public/v1/widget.js` | Web Component + htmx |

**Convex** for pack data and telemetry (`app/convex/`). `app/data/` is seed fixtures only.

## Where to look

| Task | Location |
|------|----------|
| Product vision, embed API, telemetry | [`CONTEXT.md`](./CONTEXT.md) |
| Dashboard UI, routes, server API | [`app/src/`](./app/src/) |
| Embed widget loader | [`app/public/v1/widget.js`](./app/public/v1/widget.js) |
| Embed HTML renderer | [`app/src/lib/embed/`](./app/src/lib/embed/) |
| Embed API route | [`app/src/routes/v1/embed/`](./app/src/routes/v1/embed/) |
| Demo distributor page | [`app/src/routes/demo.retailer.tsx`](./app/src/routes/demo.retailer.tsx) |
| Pack JSON / seed fixtures | [`app/data/packs/`](./app/data/packs/) |
| Convex backend (packs + telemetry) | [`app/convex/`](./app/convex/) |
| TanStack-specific gotchas | [`app/AGENTS.md`](./app/AGENTS.md) |
| Ingest library (CSV/XLSX) | [`shared/ingest/`](./shared/ingest/) |
| Manifest v2 types | [`shared/manifest.types.ts`](./shared/manifest.types.ts) |
| Operator upload guide | [`docs/ingest-guide.md`](./docs/ingest-guide.md) |

## Commands

```bash
# Dashboard + API (from repo root)
cd app
npm run dev:all          # Convex + dashboard http://localhost:4040
npm run convex:seed      # once after first convex dev
npm run generate-routes  # after adding/removing route files
npm run build
npm run preview
```

## Vercel deployment

- **Root Directory:** `app` (set in Vercel project settings)
- **Framework:** Vite / TanStack Start (auto-detected or Other)
- **Build:** `npm run build`
- Widget served at `/v1/widget.js` on the deployed origin

Do not put secrets in client bundles. POC APIs are open; no auth required yet.

## Conventions

### Product

- **Brand:** Friluftsportalen (fictional outdoor retailer)
- **Assortments:** small (roughly 3–8 products per pack)
- **Languages:** SV, NO, DA, FI — via `lang` attribute on `<fp-product>`
- **packId:** every pack, telemetry event, and API call must include it
- **distributor:** optional partner id on embed for telemetry segmentation

### Code

- **Widget = vanilla JS** — Web Component in `public/v1/widget.js`; no React in embed
- **App = React + TanStack** — dashboard and server routes only
- **Keep POC simple** — polished UI, minimal moving parts
- **Telemetry** — real `POST /api/telemetry` → Convex; never block embed on failure
- **Live data** — embed API renders HTML from Convex; htmx polls for updates

### Design

- Dark, Notion-like UI on dashboard — high contrast, clean spacing
- Accent color on primary CTAs only
- Embed card is compact and brand-consistent
- Demo retailer page uses a light distributor-site aesthetic

## Do not

- Edit `app/src/routeTree.gen.ts` — run `npm run generate-routes`
- Add Postgres or auth unless explicitly requested
- Use huge product lists in sample data
- Block embed rendering when telemetry fails

## Typical tasks

| User asks for… | Work in… |
|----------------|----------|
| Embed widget, product card HTML | `app/public/v1/widget.js`, `app/src/lib/embed/` |
| Embed API route | `app/src/routes/v1/embed/` |
| Demo retailer page | `app/src/routes/demo.retailer.tsx` |
| New sample assortment | `app/data/packs/{packId}.json` + `npm run convex:seed` |
| Telemetry API | `app/src/routes/api/telemetry.ts`, `app/convex/telemetry.ts` |
| Upload / ingest / mapping UI | `app/src/routes/packs.new.tsx`, `app/src/components/ingest/` |
| Ingest library (CSV/XLSX) | `shared/ingest/` |
| Manifest v2 types | `shared/manifest.types.ts` |
| Dashboard / insights UI | `app/src/routes/` |

## API quick reference

```
GET  /v1/embed/products/:packId/:sku?lang=sv&distributor=…  → HTML fragment
GET  /api/packs/:packId                                      → manifest JSON
POST /api/telemetry                                          → { packId, event, … }
```

See [`CONTEXT.md`](./CONTEXT.md) for full request/response shapes.

## Before large changes

1. Re-read [`CONTEXT.md`](./CONTEXT.md)
2. For TanStack work: see [`app/AGENTS.md`](./app/AGENTS.md) and run `npx @tanstack/intent@latest list` from `app/`
3. Match patterns in the folder you are editing
