# Friluftsportalen DataPack — POC

Live product syndication for B2B distributors without API integrations.

**Brand (fictional):** Friluftsportalen — Nordic outdoor equipment (hiking shoes, tents, backpacks, etc.)

## Problem

Distributors need accurate, up-to-date product master data on their own websites. Traditional approaches require custom API integrations, manual copy-paste, or static exports that go stale immediately. Senders learn little about what distributors actually show to customers.

## Solution (this POC)

| Piece | What it is |
|-------|------------|
| **Embed widget** | `<fp-product>` Web Component + htmx — drops onto any distributor product page |
| **Hosted app** | TanStack Start dashboard + embed API + telemetry |

Operators upload catalog data once. Distributors paste a short script snippet. Product cards stay live, poll for updates, and report views back to the sender dashboard.

## Core principles

- **Receiver-driven export** — CSV, Excel, JSON, XML; user picks fields via a simple wizard
- **Client-side compute** — browse, search, filter, and export run in the browser
- **Offline-first** — full catalog works without network; sync and telemetry when online
- **Small assortments** — a few products per file, not full catalogs
- **POC scope** — Convex cloud for pack data + telemetry; live dashboard; must look polished, stay simple

## User journeys

### Distributor (embeds widget)

1. Receive embed snippet from Friluftsportalen (or copy from operator dashboard)
2. Paste on a product detail page:

```html
<script src="https://your-host/v1/widget.js" defer></script>
<fp-product
  pack-id="friluftsportalen-spring-tents-001"
  sku="TENT-001"
  lang="sv"
  distributor="nordtrail-outdoors"
  poll="30"
></fp-product>
```

3. Page loads → widget fetches HTML fragment from embed API
4. Product card shows name, image, price, attributes in chosen language
5. Widget polls every `poll` seconds (default 30) for fresh data
6. View is recorded as `embed_view` telemetry (best-effort, non-blocking)

### Operator (uploads & monitors)

1. Create or update a pack via dashboard (`/packs/new`) — CSV/XLSX upload, column mapping
2. Copy embed snippet from pack detail → **Embed** tab
3. Share snippet with distributors
4. Monitor dashboard: embed views, search/export events (legacy), per-pack stats

## Architecture

```
┌──────────────────────────────┐         ┌─────────────────────────────────────────┐
│  Distributor website         │         │  app/ (TanStack Start on Vercel)        │
│  ─────────────────────       │         │  ─────────────────────────────────────  │
│  <script src="…/widget.js">  │         │  GET  /v1/embed/products/:packId/:sku   │
│  <fp-product …>              │ ──────► │       → HTML fragment (htmx swap)       │
│    └─ htmx polls embed API   │         │  GET  /api/packs/:packId                │
│                              │ ──────► │       → manifest JSON (ingest/updates)  │
│                              │ ──────► │  POST /api/telemetry                    │
│                              │         │       → Convex telemetryEvents          │
│                              │         │  Dashboard + /demo/retailer             │
└──────────────────────────────┘         └─────────────────────────────────────────┘
                                              │
                                              ▼
                                    ┌──────────────────┐
                                    │  Convex            │
                                    │  packs             │
                                    │  packRecordPages   │
                                    │  telemetryEvents   │
                                    └──────────────────┘
```

Every pack, embed request, and telemetry event carries a **`packId`**. Optional **`distributor`** attribute tags which partner site rendered the widget.

## Widget integration

| Attribute | Required | Default | Purpose |
|-----------|----------|---------|---------|
| `pack-id` | yes | — | Assortment identifier |
| `sku` | yes | — | Product SKU within the pack |
| `lang` | no | `sv` | Display language: `sv`, `no`, `da`, `fi` |
| `distributor` | no | — | Partner id for telemetry segmentation |
| `poll` | no | `30` | Refresh interval in seconds |

**Files:**

- `app/public/v1/widget.js` — Web Component loader (registers `<fp-product>`, loads htmx)
- `app/src/routes/v1/embed/products.$packId.$sku.ts` — server-rendered HTML fragment
- `app/src/lib/embed/renderProduct.ts` — product card template

**Demo:** [`/demo/retailer`](http://localhost:4040/demo/retailer) — mock distributor page (NordTrail Outdoors) with three live tent embeds.

## Data model

Operators ingest CSV/Excel into manifest v2. See [`docs/ingest-guide.md`](docs/ingest-guide.md).

- **Manifest v2** — `meta` + `schema` + optional embedded `records`; types in [`shared/manifest.types.ts`](shared/manifest.types.ts)
- **Large data** — records in Convex `packRecordPages`; embed API reads from Convex directly
- **Legacy demos** — Friluftsportalen seed packs use `products` + Nordic `texts`; embed API normalizes both shapes

### Example record (v2)

```json
{
  "sku": "TENT-001",
  "name": "Arctic Dome 2",
  "price": 3499,
  "description": "Lightweight 2-person tent for spring trekking.",
  "image": "https://…"
}
```

## API contract

All routes live under `app/`.

### `GET /v1/embed/products/:packId/:sku`

Returns an HTML fragment for htmx swap (not JSON).

**Query params:**

| Param | Values | Default |
|-------|--------|---------|
| `lang` | `sv`, `no`, `da`, `fi` | `sv` |
| `distributor` | free text | — |

**Response:** `200` with `Content-Type: text/html`. CORS enabled for cross-origin embed.

### `GET /api/packs/:packId`

Returns pack metadata: `meta` + `schema`, and `records` when `storageMode` is `embedded`.

### `GET /api/packs/:packId/records`

Paginated records for remote packs. Query: `cursor`, `limit`.

### `POST /api/packs` / `PUT /api/packs/:packId/source`

Upload CSV/XLSX to create or re-ingest a pack (see ingest guide).

### `POST /api/telemetry`

Append one event to Convex `telemetryEvents`.

**Request body:**

```json
{
  "packId": "friluftsportalen-spring-tents-001",
  "event": "embed_view",
  "timestamp": "2026-06-01T10:00:00.000Z",
  "payload": {
    "productSku": "TENT-001",
    "language": "sv",
    "distributor": "nordtrail-outdoors"
  }
}
```

**Events:** `embed_view` (widget), plus legacy `open`, `search`, `export`, `update` where still tracked.

**Response:** `201` with `{ "ok": true }`

Telemetry is fire-and-forget from the widget. Failures must not block rendering.

## Design

- **Dashboard:** Notion-inspired — dark background, high contrast, clean typography
- **Embed card:** compact product panel — image, title, price, key attributes; matches Friluftsportalen brand
- **Demo retailer:** light distributor-site mock to contrast with the dark operator dashboard
- **Accents:** sparing color on primary CTAs only

## Tech stack

| Layer | Choice | Location |
|-------|--------|----------|
| Dashboard + API | TanStack Start, React 19, Tailwind v4 | `app/` |
| Embed widget | Web Component + htmx | `app/public/v1/widget.js` |
| Embed renderer | Server HTML fragments | `app/src/lib/embed/` |
| Ingest library | CSV/XLSX parsing | `shared/ingest/` |
| Persistence | Convex | `app/convex/` |
| Seed fixtures | JSON per assortment | `app/data/` |

## Repo layout

```
datapack/
├── CONTEXT.md              # Product vision (this file)
├── AGENTS.md               # Agent instructions
├── app/                    # TanStack Start — dashboard + embed API (Vercel root)
│   ├── convex/             # Schema, queries, mutations, seed
│   ├── data/               # Seed fixtures
│   ├── public/v1/widget.js # Embed loader script
│   └── src/
│       ├── routes/v1/embed/  # HTML fragment routes
│       └── routes/demo.retailer.tsx
├── shared/                 # Manifest types + ingest library
└── sample-data/            # Optional source JSON (legacy; seed uses app/data/)
```

## Hosting (Vercel)

- **Root Directory:** `app`
- **Build:** `npm run build`
- Set `CONVEX_URL` and `VITE_CONVEX_URL` to your Convex deployment
- Widget script is served statically at `/v1/widget.js`
- CORS on embed and telemetry routes for cross-origin distributor sites

## Out of scope (POC)

- Authentication / distributor onboarding flows
- Offline MHTML / single-file catalogs
- Export wizard (CSV, Excel, JSON, XML)
- PIM / ERP integrations
- GDPR / consent flows
- Large catalogs (1000+ SKUs)

## Demo narrative

Friluftsportalen uploads a spring tent assortment via the dashboard. NordTrail Outdoors (demo retailer) embeds `<fp-product>` on three product pages. Each page shows live tent data in Swedish, refreshes every 30 seconds, and sends `embed_view` events. The operator sees embed activity on the pack dashboard within seconds.
