# Friluftsportalen DataPack — POC

Interactive, single-file product catalogs for B2B data distribution.

**Sender** ships one smart pack. **Receiver** browses a product catalog and exports data in the format and shape they choose. The hosted app records what happens when a connection is available.

## Problem

Traditional exports (Excel, CSV, XML, JSON) lock format and columns at send time. Receivers rework data manually. Senders learn nothing about what was actually used.

## Solution (this POC)

| Piece | What it is |
|-------|------------|
| **DataPack** | One `.mhtml` per assortment — offline catalog + export wizard |
| **App** | TanStack Start dashboard + API — pack updates, telemetry, usage views |

**Brand (fictional):** Friluftsportalen — outdoor equipment (hiking shoes, tents, backpacks, etc.)

## Core principles

- **Receiver-driven export** — CSV, Excel, JSON, XML; user picks fields via a simple wizard
- **Client-side compute** — browse, search, filter, and export run in the browser
- **Offline-first** — full catalog works without network; sync and telemetry when online
- **Small assortments** — a few products per file, not full catalogs
- **POC scope** — Convex cloud for pack data + telemetry; live dashboard; must look polished, stay simple

## User journeys

### Receiver (opens MHTML)

1. Open assortment file (email, file share, etc.)
2. See Friluftsportalen logo and product catalog
3. Switch display language (SV / NO / DA / FI) via in-file language switcher
4. If data is stale → banner warns data may be outdated → **Update** fetches fresh manifest from the app API
5. Browse and search products (texts, image URLs, attributes)
6. Export via:
   - **Main page** — “Download data” opens a step-by-step wizard (format + fields)
   - **Product page** — export this product only
7. If online → POST telemetry events to the app (pack id included on every event)

### Sender / operator (POC)

1. Manually build a pack with slightly outdated embedded data
2. Send `.mhtml` to a recipient
3. View dashboard for pack activity (insights UI evolves; data comes from telemetry JSON)

## Architecture

```
┌─────────────────────────────┐         ┌──────────────────────────────────┐
│  DataPack (.mhtml)          │         │  app/ (TanStack Start on Vercel) │
│  ─────────────────          │  HTTPS  │  ──────────────────────────────  │
│  • Embedded manifest        │ ──────► │  GET  /api/packs/:packId         │
│  • Catalog UI (vanilla JS)  │         │       → latest product JSON    │
│  • Export wizard            │ ──────► │  POST /api/telemetry             │
│  • Language switcher        │         │       → Convex telemetryEvents  │
│  • Works offline            │         │  Dashboard routes (static read) │
└─────────────────────────────┘         └──────────────────────────────────┘
```

Every pack carries a **`packId`**. All API calls and telemetry include it so the server knows which assortment file triggered the action.

## Product data model

Each product includes:

- **SKU** / article number
- **Texts** — name, description, etc. in all Nordic languages (`sv`, `no`, `da`, `fi`)
- **Image URL** — external or placeholder URLs (no image hosting required for POC)
- **Attributes** — key/value list (weight, material, sizes, etc.)

### Manifest (embedded in pack)

```javascript
window.DATAPACK_MANIFEST = {
  meta: {
    packId: "friluftsportalen-spring-tents-001",
    brand: "Friluftsportalen",
    assortment: "Spring Tents 2026",
    version: "1.0.0",
    generatedAt: "2026-06-01T08:00:00Z",
    staleAfter: "2026-06-10T00:00:00Z",
    apiBase: "https://your-app.vercel.app"  // set at build time
  },
  schema: [
    { name: "sku", label: { sv: "Artikelnummer", no: "...", da: "...", fi: "..." }, type: "string", exportable: true },
    { name: "price", label: { sv: "Pris (SEK)", ... }, type: "number", exportable: true }
  ],
  products: [
    {
      sku: "TENT-001",
      texts: {
        sv: { name: "...", description: "..." },
        no: { name: "...", description: "..." },
        da: { ... },
        fi: { ... }
      },
      imageUrl: "https://...",
      attributes: [
        { key: { sv: "Vikt", no: "Vekt", ... }, value: "2.1 kg" }
      ],
      price: 3499,
      stock: 42
    }
  ]
};
```

### Stale data + update

- On load, compare `generatedAt` / `staleAfter` (or optionally `version` against API).
- Show a non-blocking banner when data is outdated.
- **Update** button: `GET {apiBase}/api/packs/{packId}` → replace local manifest / IndexedDB cache.
- Catalog re-renders with fresh data; banner dismisses.

## API contract (app)

All routes live under `app/`. Implement with TanStack Start server routes or `createServerFn`.

### `GET /api/packs/:packId`

Returns the latest manifest JSON for that pack (same shape as embedded manifest).

- Source: Convex `packs` table (editable from dashboard; seeded from `app/data/packs/`)
- Pack file only needs to know its `packId` and `apiBase`

### `POST /api/telemetry`

Append one event to Convex `telemetryEvents` (via TanStack API route proxy).

**Request body:**

```json
{
  "packId": "friluftsportalen-spring-tents-001",
  "event": "open | search | export | update",
  "timestamp": "ISO-8601",
  "payload": {
    "query": "hiking",
    "format": "csv",
    "fields": ["sku", "price"],
    "productSku": "TENT-001",
    "language": "sv"
  }
}
```

**Response:** `201` with `{ "ok": true }`

Telemetry is best-effort from the pack (fire-and-forget `fetch`). Failures must not block the UI.

### Insights (TBD)

Dashboard subscribes to Convex queries for live stats and events:

- Opens per pack
- Export formats used
- Search terms (if tracked)
- Last seen per pack

Exact charts and filters are not fixed yet.

## DataPack features (MVP)

| Feature | Priority |
|---------|----------|
| Header with Friluftsportalen logo | Must |
| Language switcher (SV / NO / DA / FI) | Must |
| Catalog grid + search | Must |
| Product detail page | Must |
| Stale data banner + Update | Must |
| Export wizard (format + field picker) | Must |
| Per-product export | Must |
| Offline catalog + export | Must |
| Telemetry when online | Must |

### Export formats

- CSV
- Excel (`.xlsx`)
- JSON
- XML

Wizard steps (keep very simple):

1. Choose format
2. Choose products (all / filtered / current product)
3. Choose fields (checkboxes from `schema`)
4. Download

## Design

- **Style:** Notion-inspired — dark background, high contrast, clean typography
- **Accents:** sparing use of color on primary actions (export, update, wizard continue)
- **DataPack:** customer-facing catalog
- **Dashboard:** same design family, more compact admin layout
- **Logo:** Friluftsportalen mark in each MHTML header

## Tech stack

| Layer | Choice | Location |
|-------|--------|----------|
| Dashboard + API | TanStack Start, React 19, Tailwind v4 | `app/` |
| DataPack runtime | Vanilla JS in self-contained MHTML | `datapack/` |
| Sample manifests | JSON per assortment | `sample-data/` |
| Built packs | Output `.mhtml` files | `packs/` |
| Persistence | Convex (`app/convex/`) | packs + telemetryEvents tables |
| Seed fixtures | `app/data/` | imported once via `npm run convex:seed` |
| Local cache (optional) | Dexie.js / IndexedDB | inside pack |

## Repo layout

```
datapack/
├── CONTEXT.md              # Product vision, data model, API (this file)
├── AGENTS.md               # Agent instructions
├── app/                    # TanStack Start — dashboard + API (Vercel root)
│   ├── convex/             # Schema, queries, mutations, seed
│   ├── data/               # Seed fixtures only (not runtime)
│   └── src/routes/
├── datapack/               # MHTML template, CSS, vanilla JS runtime
├── sample-data/            # Source JSON used to build packs (may be outdated)
└── packs/                  # Built .mhtml outputs
```

## Hosting (Vercel)

- Set **Root Directory** to `app` in the Vercel project settings
- Build command: `npm run build`
- Output: TanStack Start default (see `app/AGENTS.md`)
- Pack files use `apiBase` pointing at the deployed URL
- CORS: API routes must allow `POST` from `file://` origins is not possible — packs opened as local files use absolute URL to hosted API (works for `fetch`)

> **Note:** MHTML opened from disk can call a hosted HTTPS API. Ensure telemetry and pack endpoints send appropriate CORS headers (`Access-Control-Allow-Origin: *` is fine for POC).

## Out of scope (POC)

- Authentication
- PIM / ERP integration
- Automated pack compiler pipeline
- GDPR / consent flows
- Large catalogs (1000+ SKUs)
## Demo narrative

Friluftsportalen sends a spring tent assortment (3–5 products) as an MHTML file. The recipient opens it, sees outdated data, clicks Update, browses in Swedish, exports a CSV with SKU + price + description, and the operator later sees an `open` and `export` event for `friluftsportalen-spring-tents-001` on the dashboard.
