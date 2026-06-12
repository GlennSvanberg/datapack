# DataPack runtime

Vanilla JS product catalog embedded in a single HTML/MHTML file.

## Structure

- `template.html` — page shell with placeholders
- `styles.css` — dark Notion-style UI
- `runtime/` — JS modules (concatenated at build time)
- `logo.svg` — Friluftsportalen mark
- `build.mjs` — assembles final pack (see repo root `packs/`)

## Views

- **Catalog** — search + product grid
- **Product detail** — `#product/{sku}`
- **Export wizard** — modal with format, scope, field steps

## Configuration

`meta.apiBase` in the embedded manifest points at the hosted TanStack app (default `http://localhost:3000`).
