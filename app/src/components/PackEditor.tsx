import { useMutation } from 'convex/react'
import { useEffect, useState } from 'react'
import { api } from '../../convex/_generated/api'
import type { PackManifest } from '#/lib/types'

interface PackEditorProps {
  packId: string
  pack: PackManifest
}

function toDatetimeLocal(iso: string): string {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function fromDatetimeLocal(value: string): string {
  return new Date(value).toISOString()
}

export function PackEditor({ packId, pack }: PackEditorProps) {
  const updateMeta = useMutation(api.packs.updateMeta)
  const updateProduct = useMutation(api.packs.updateProduct)

  const [version, setVersion] = useState(pack.meta.version)
  const [generatedAt, setGeneratedAt] = useState(toDatetimeLocal(pack.meta.generatedAt))
  const [staleAfter, setStaleAfter] = useState(toDatetimeLocal(pack.meta.staleAfter))
  const [products, setProducts] = useState(
    pack.products.map((p) => ({ sku: p.sku, price: p.price, stock: p.stock })),
  )
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    setVersion(pack.meta.version)
    setGeneratedAt(toDatetimeLocal(pack.meta.generatedAt))
    setStaleAfter(toDatetimeLocal(pack.meta.staleAfter))
    setProducts(pack.products.map((p) => ({ sku: p.sku, price: p.price, stock: p.stock })))
  }, [pack])

  async function handleSave() {
    setSaving(true)
    setMessage(null)
    try {
      await updateMeta({
        packId,
        version,
        generatedAt: fromDatetimeLocal(generatedAt),
        staleAfter: fromDatetimeLocal(staleAfter),
      })
      for (const product of products) {
        await updateProduct({
          packId,
          sku: product.sku,
          price: product.price,
          stock: product.stock,
        })
      }
      setMessage('Saved — open the pack file and click Update to pull fresh data.')
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-6">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-medium">Edit pack data</h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Demo controls — changes apply immediately to the API
          </p>
        </div>
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={saving}
          className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>

      {message && (
        <p
          className={`mb-4 text-sm ${message.startsWith('Saved') ? 'text-[var(--accent-green)]' : 'text-[var(--accent-orange)]'}`}
        >
          {message}
        </p>
      )}

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <label className="block text-sm">
          <span className="mb-1 block text-[var(--text-secondary)]">Version</span>
          <input
            type="text"
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            className="w-full rounded border border-[var(--border)] bg-[var(--bg-primary)] px-3 py-2 text-[var(--text-primary)]"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-[var(--text-secondary)]">Generated at</span>
          <input
            type="datetime-local"
            value={generatedAt}
            onChange={(e) => setGeneratedAt(e.target.value)}
            className="w-full rounded border border-[var(--border)] bg-[var(--bg-primary)] px-3 py-2 text-[var(--text-primary)]"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-[var(--text-secondary)]">Stale after</span>
          <input
            type="datetime-local"
            value={staleAfter}
            onChange={(e) => setStaleAfter(e.target.value)}
            className="w-full rounded border border-[var(--border)] bg-[var(--bg-primary)] px-3 py-2 text-[var(--text-primary)]"
          />
        </label>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-left text-[var(--text-secondary)]">
              <th className="pb-2 pr-4 font-medium">SKU</th>
              <th className="pb-2 pr-4 font-medium">Price (SEK)</th>
              <th className="pb-2 font-medium">Stock</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product, index) => (
              <tr key={product.sku} className="border-b border-[var(--border)]">
                <td className="py-2 pr-4 font-mono text-[var(--text-muted)]">{product.sku}</td>
                <td className="py-2 pr-4">
                  <input
                    type="number"
                    value={product.price}
                    onChange={(e) => {
                      const next = [...products]
                      next[index] = { ...product, price: Number(e.target.value) }
                      setProducts(next)
                    }}
                    className="w-28 rounded border border-[var(--border)] bg-[var(--bg-primary)] px-2 py-1"
                  />
                </td>
                <td className="py-2">
                  <input
                    type="number"
                    value={product.stock}
                    onChange={(e) => {
                      const next = [...products]
                      next[index] = { ...product, stock: Number(e.target.value) }
                      setProducts(next)
                    }}
                    className="w-24 rounded border border-[var(--border)] bg-[var(--bg-primary)] px-2 py-1"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
