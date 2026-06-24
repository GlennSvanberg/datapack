# Sender guide — embed syndication

Operators share **live embed snippets** with distributors instead of static HTML files.

## What distributors receive

A short HTML snippet per product SKU:

```html
<script src="https://your-host/v1/widget.js" defer></script>
<fp-product
  pack-id="friluftsportalen-spring-tents-001"
  sku="TENT-001"
  lang="sv"
  distributor="their-retailer-id"
></fp-product>
```

The script may appear anywhere on the page (body is fine). The widget loads htmx automatically — distributors do not add anything to `<head>`.

## Where to copy snippets

1. Open the pack in the dashboard → **Embed** tab
2. Copy the snippet and replace `your-distributor-id` with the retailer's tracking id
3. Share one snippet per SKU they display

## Demo pages

| URL | Purpose |
|-----|---------|
| `/demo/retailer` | In-app mock distributor storefront |
| `/embed-sandbox.html` | Plain HTML page simulating a third-party site |

## Live updates

When you edit prices or stock in the dashboard, embedded widgets refresh within the poll interval (default 30 seconds).

## Telemetry

Each first successful embed load records an `embed_view` event with `packId`, `sku`, `distributor`, and `lang`.
