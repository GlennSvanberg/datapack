# Operator guide — upload & create packs

Use the dashboard to turn a CSV or Excel file into a live product pack syndicated via the embed widget.

## Create a new pack

1. Open the dashboard → **Create DataPack** (or `/packs/new`)
2. **Upload** — choose `.csv`, `.xlsx`, or `.xls`
3. **Sheets & join** — pick the primary sheet; for multi-sheet Excel, set a join key column on each sheet (same ID across sheets)
4. **Column mapping** — confirm field names, types, and roles:
   - **id** (required) — stable row identifier (SKU)
   - **title** — product name (shown in embed card)
   - **image**, **price**, **description**, etc. as needed
5. **Pack settings** — title, optional brand → **Create pack**

After creation you land on the pack detail page.

## Share with distributors

1. Open the pack → **Embed** tab
2. Copy the snippet for a sample SKU
3. Send the snippet to distributors — they paste it on their product pages

The widget loads live data from the hosted API. Large datasets use **remote** storage in Convex; small sets may be **embedded** inline (default threshold: 500 rows).

## Update data

1. Pack detail → **Data** tab
2. Drop a new file with the same column shape
3. Version bumps automatically; distributor embeds pick up changes on the next poll (default every 30 seconds)

## API (for automation later)

| Method | Route | Purpose |
|--------|-------|---------|
| `POST` | `/api/packs/ingest/preview` | Preview parse (no save) |
| `POST` | `/api/packs` | Create pack (multipart: `file` + `payload` JSON) |
| `PUT` | `/api/packs/:packId/source` | Re-upload source file |
| `GET` | `/api/packs/:packId` | Meta + schema (+ embedded records if small) |
| `GET` | `/api/packs/:packId/records` | Paginated records (`?cursor=&limit=`) |
| `GET` | `/v1/embed/products/:packId/:sku` | HTML fragment for widget |

## Storage modes

| Mode | When | Stored in | Embed experience |
|------|------|-----------|-------------------|
| `embedded` | ≤ embed threshold (default 500 rows) | Manifest + Convex | Live card from API |
| `remote` | Larger datasets | Convex `packRecordPages` | Live card from API |

## Tips

- Use consistent ID values across re-uploads
- Map **title** + **image** for product-style embed cards
- Set `distributor` on the widget for per-partner telemetry
- See [`../CONTEXT.md`](../CONTEXT.md) for full embed attribute reference
