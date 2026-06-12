# Integration guide — Friluftsportalen DataPack POC

End-to-end local demo flow.

## Prerequisites

- Node.js 20+
- npm

## 1. Start the dashboard + API

```bash
cd app
npm install
npm run dev
```

App runs at http://localhost:3000

## 2. Build DataPack files

From repo root:

```bash
node datapack/build.mjs
```

Or a single assortment:

```bash
node datapack/build.mjs friluftsportalen-spring-tents-001
```

Output: `packs/{packId}.html`

Optional — point at deployed API:

```bash
API_BASE=https://your-app.vercel.app node datapack/build.mjs
```

## 3. Open a DataPack

Open `packs/friluftsportalen-spring-tents-001.html` in your browser (double-click or drag into Chrome/Edge).

### Verify catalog

- Friluftsportalen logo and dark UI
- Language switcher (SV / NO / DA / FI)
- Search products
- Click a product for detail view

### Verify stale data + update

- Orange banner appears (embedded data is outdated vs `staleAfter`)
- Click **Update data** — fetches fresh manifest from `GET /api/packs/{packId}`
- Prices/stock should change; banner disappears

### Verify export

- Click **Download data** on main page → wizard → CSV with selected fields
- Or **Export product** on product detail page

### Verify telemetry

With `npm run dev` running, events POST to `/api/telemetry` and append to `app/data/telemetry.json`.

Refresh http://localhost:3000 — dashboard shows opens, exports, searches.

Pack detail: http://localhost:3000/packs/friluftsportalen-spring-tents-001

## 4. API smoke test (curl)

```bash
# Latest pack data
curl http://localhost:3000/api/packs/friluftsportalen-spring-tents-001

# Telemetry
curl -X POST http://localhost:3000/api/telemetry \
  -H "Content-Type: application/json" \
  -d '{"packId":"friluftsportalen-spring-tents-001","event":"open","timestamp":"2026-06-12T12:00:00Z"}'
```

## 5. Deploy to Vercel

1. Push repo to GitHub
2. Import project in Vercel
3. Set **Root Directory** → `app`
4. Deploy
5. Rebuild packs with `API_BASE=https://your-deployment.vercel.app`

> **Note:** Telemetry file writes work in local dev. Vercel serverless may not persist `telemetry.json` across invocations — acceptable for POC.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Update fails | Ensure `npm run dev` is running; check `meta.apiBase` in pack |
| CORS error | API routes must return `Access-Control-Allow-Origin: *` |
| Dashboard empty | Open a pack first to generate telemetry |
| Route 404 | Run `cd app && npm run generate-routes` |
