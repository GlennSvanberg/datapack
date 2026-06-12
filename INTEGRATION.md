# Integration guide — Friluftsportalen DataPack POC

End-to-end local demo flow with **live Convex telemetry** and **editable pack data**.

## Prerequisites

- Node.js 20+
- npm

## 1. Start Convex + dashboard

```bash
cd app
npm install
npm run dev:all
```

Or two terminals:

```bash
cd app
npm run convex:dev    # terminal 1
npm run dev           # terminal 2
```

App runs at http://localhost:4040

**First time only** — seed Convex from fixtures:

```bash
cd app
npm run convex:seed
```

## 2. Build DataPack files

From repo root:

```bash
node datapack/build.mjs
```

Output: `packs/{packId}.html` with `apiBase` defaulting to `http://localhost:4040`.

For production:

```bash
API_BASE=https://your-app.vercel.app node datapack/build.mjs
```

## 3. Open a DataPack

Open `packs/friluftsportalen-spring-tents-001.html` in your browser.

### Verify catalog

- Friluftsportalen logo and dark UI
- Language switcher (SV / NO / DA / FI)
- Search products
- Click a product for detail view

### Verify stale data + update

- Edit **Stale after** to yesterday on the pack detail dashboard page, save
- Reload the pack file — orange stale banner appears
- Click **Update data** — fetches from `GET /api/packs/{packId}` (Convex-backed)
- Banner dismisses; prices reflect dashboard edits

### Verify export

- Click **Download data** → wizard → CSV
- Or **Export product** on product detail page

### Verify live telemetry

1. Open http://localhost:4040 in one tab (dashboard — watch the **Live** badge)
2. Open a pack file in another tab
3. Events appear in **Recent activity** without refreshing — opens, searches, exports

Pack detail: http://localhost:4040/packs/friluftsportalen-spring-tents-001

## 4. API smoke test (curl)

```bash
curl http://localhost:4040/api/packs/friluftsportalen-spring-tents-001

curl -X POST http://localhost:4040/api/telemetry \
  -H "Content-Type: application/json" \
  -d '{"packId":"friluftsportalen-spring-tents-001","event":"open","timestamp":"2026-06-12T12:00:00Z"}'
```

## 5. Deploy to Vercel + Convex Cloud

1. `cd app && npx convex login && npx convex deploy`
2. Note the deployment URL from Convex dashboard
3. Set Vercel env vars (`CONVEX_URL`, `VITE_CONVEX_URL`)
4. Push repo, import in Vercel, **Root Directory** → `app`
5. Deploy TanStack app
6. `npx convex run seed:runSeed --prod` (or `npm run convex:seed` with prod deployment selected)
7. Rebuild packs: `API_BASE=https://your-deployment.vercel.app node datapack/build.mjs`

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Dashboard stuck on Loading | Run `npm run convex:dev`; check `VITE_CONVEX_URL` in `.env.local` |
| Update fails | Ensure dev server + Convex running; check `meta.apiBase` in pack |
| CORS error | API routes return `Access-Control-Allow-Origin: *` |
| Dashboard empty stats | Run `npm run convex:seed`; open a pack to generate telemetry |
| API 500 on telemetry/packs | `CONVEX_URL` missing on server — add to `.env.local` / Vercel |
| Route 404 | Run `cd app && npm run generate-routes` |
