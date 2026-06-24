import { Check, Copy } from 'lucide-react'
import { useState } from 'react'

interface EmbedSnippetProps {
  packId: string
  sku: string
  distributor?: string
  lang?: string
}

function buildSnippet(
  packId: string,
  sku: string,
  origin: string,
  distributor: string,
  lang: string,
): string {
  return `<script src="${origin}/v1/widget.js" defer></script>
<!-- Place fp-product where you want it, or use target to mount into a container -->
<fp-product
  pack-id="${packId}"
  sku="${sku}"
  distributor="${distributor}"
  lang="${lang}"
  theme="inherit"
  target="#your-product-slot"
></fp-product>`
}

export function EmbedSnippet({
  packId,
  sku,
  distributor = 'your-distributor-id',
  lang = 'sv',
}: EmbedSnippetProps) {
  const [copied, setCopied] = useState(false)
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://your-api-host'
  const snippet = buildSnippet(packId, sku, origin, distributor, lang)

  async function handleCopy() {
    await navigator.clipboard.writeText(snippet)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-[var(--text-secondary)]">
        Paste the script once, add an empty container where the product should appear, then point{' '}
        <code className="rounded bg-[var(--bg-tertiary)] px-1 py-0.5 text-xs">target</code> at it.
        Use <code className="rounded bg-[var(--bg-tertiary)] px-1 py-0.5 text-xs">theme=&quot;inherit&quot;</code>{' '}
        to match the host page fonts and colors, or omit for the default card.
      </p>
      <div className="relative">
        <pre className="overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--bg-tertiary)] p-4 font-mono text-xs leading-relaxed text-[var(--text-primary)]">
          {snippet}
        </pre>
        <button
          type="button"
          onClick={() => void handleCopy()}
          className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded border border-[var(--border)] bg-[var(--bg-secondary)] px-2.5 py-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              Copy
            </>
          )}
        </button>
      </div>
    </div>
  )
}
