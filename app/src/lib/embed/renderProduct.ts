import type { EmbedProduct, RenderProductEmbedOptions } from './types'

const DESCRIPTION_MAX = 140

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function escapeAttr(value: string): string {
  return escapeHtml(value)
}

function truncate(text: string, max: number): string {
  const trimmed = text.trim()
  if (trimmed.length <= max) return trimmed
  return `${trimmed.slice(0, max - 1).trimEnd()}…`
}

function formatPriceSek(price: number): string {
  return new Intl.NumberFormat('sv-SE', {
    style: 'currency',
    currency: 'SEK',
    maximumFractionDigits: 0,
  }).format(price)
}

function stockLabel(inStock: boolean, stock: number): string {
  if (inStock) return stock > 0 ? `I lager (${stock})` : 'I lager'
  return 'Slut i lager'
}

const EMBED_STYLES = `
.fp-embed {
  box-sizing: border-box;
  font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  font-size: 14px;
  line-height: 1.5;
  color: #e8e8e8;
  background: #1a1a1a;
  border: 1px solid #2e2e2e;
  border-radius: 10px;
  padding: 16px;
  max-width: 360px;
}
.fp-embed *, .fp-embed *::before, .fp-embed *::after { box-sizing: border-box; }
.fp-embed__layout { display: flex; gap: 14px; align-items: flex-start; }
.fp-embed__media {
  flex: 0 0 88px;
  width: 88px;
  height: 88px;
  border-radius: 8px;
  overflow: hidden;
  background: #252525;
  border: 1px solid #333;
}
.fp-embed__image { display: block; width: 100%; height: 100%; object-fit: cover; }
.fp-embed__body { flex: 1; min-width: 0; }
.fp-embed__name {
  margin: 0 0 6px;
  font-size: 15px;
  font-weight: 600;
  color: #f5f5f5;
  line-height: 1.3;
}
.fp-embed__description {
  margin: 0 0 10px;
  font-size: 13px;
  color: #a8a8a8;
}
.fp-embed__price {
  margin: 0 0 6px;
  font-size: 18px;
  font-weight: 700;
  color: #6ee7b7;
  letter-spacing: -0.02em;
}
.fp-embed__stock {
  margin: 0 0 10px;
  font-size: 12px;
  color: #9ca3af;
}
.fp-embed__stock--available { color: #86efac; }
.fp-embed__stock--unavailable { color: #fca5a5; }
.fp-embed__attrs {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 4px;
}
.fp-embed__attr {
  display: flex;
  gap: 6px;
  font-size: 12px;
  color: #bdbdbd;
}
.fp-embed__attr-label { color: #8b8b8b; flex: 0 0 auto; }
.fp-embed__attr-value { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.fp-embed--loading, .fp-embed--error {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 120px;
  color: #9ca3af;
  font-size: 13px;
}
.fp-embed--error { color: #fca5a5; }
.fp-embed__distributor {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
`.trim()

function renderStyles(): string {
  return `<style>${EMBED_STYLES}</style>`
}

function renderDistributorMarker(distributor: string | undefined): string {
  if (!distributor) return ''
  return `<span class="fp-embed__distributor" data-fp-distributor="${escapeAttr(distributor)}" aria-hidden="true"></span>`
}

function renderAttributes(
  attributes: EmbedProduct['attributes'],
): string {
  const items = attributes.slice(0, 4)
  if (items.length === 0) return ''

  const lis = items
    .map(
      (attr) =>
        `<li class="fp-embed__attr"><span class="fp-embed__attr-label">${escapeHtml(attr.label)}:</span><span class="fp-embed__attr-value">${escapeHtml(attr.value)}</span></li>`,
    )
    .join('')

  return `<ul class="fp-embed__attrs">${lis}</ul>`
}

/** HTML fragment for htmx `outerHTML` swap on the widget container. */
export function renderProductEmbedHtml(
  product: EmbedProduct,
  options: RenderProductEmbedOptions = {},
): string {
  const distributor = options.distributor?.trim()
  const stockClass = product.inStock
    ? 'fp-embed__stock fp-embed__stock--available'
    : 'fp-embed__stock fp-embed__stock--unavailable'
  const image = product.imageUrl
    ? `<img class="fp-embed__image" src="${escapeAttr(product.imageUrl)}" alt="${escapeAttr(product.name)}" loading="lazy" />`
    : ''

  return `<div class="fp-embed" data-fp-version="${escapeAttr(product.version)}" data-fp-pack-id="${escapeAttr(product.packId)}" data-fp-sku="${escapeAttr(product.sku)}">
${renderStyles()}
${renderDistributorMarker(distributor)}
<div class="fp-embed__layout">
  <div class="fp-embed__media">${image}</div>
  <div class="fp-embed__body">
    <h3 class="fp-embed__name">${escapeHtml(product.name)}</h3>
    <p class="fp-embed__description">${escapeHtml(truncate(product.description, DESCRIPTION_MAX))}</p>
    <p class="fp-embed__price">${escapeHtml(formatPriceSek(product.price))}</p>
    <p class="${stockClass}">${escapeHtml(stockLabel(product.inStock, product.stock))}</p>
    ${renderAttributes(product.attributes)}
  </div>
</div>
</div>`
}

/** Small HTML error fragment for 404 / lookup failures. */
export function renderProductEmbedError(message: string): string {
  return `<div class="fp-embed fp-embed--error" data-fp-version="0">
${renderStyles()}
<p>${escapeHtml(message)}</p>
</div>`
}

/** Initial loading placeholder used by the web component before first fetch. */
export function renderProductEmbedLoading(): string {
  return `<div class="fp-embed fp-embed--loading" data-fp-version="0">
${renderStyles()}
<span>Loading product…</span>
</div>`
}
