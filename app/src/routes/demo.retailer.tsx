import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect } from 'react'

export const Route = createFileRoute('/demo/retailer')({
  component: DemoRetailerPage,
})

const PACK_ID = 'friluftsportalen-spring-tents-001'
const SKUS = ['TENT-001', 'TENT-002', 'TENT-003'] as const

function DemoRetailerPage() {
  useEffect(() => {
    const script = document.createElement('script')
    script.src = '/v1/widget.js'
    script.defer = true
    document.body.appendChild(script)
    return () => {
      document.body.removeChild(script)
    }
  }, [])

  return (
    <div className="-mx-6 -my-8 min-h-[calc(100vh-4rem)] bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold tracking-tight text-emerald-800">NordTrail Outdoors</span>
            <span className="hidden text-xs text-slate-500 sm:inline">Demo distributor</span>
          </div>
          <nav className="flex items-center gap-4 text-sm text-slate-600">
            <span>Tents</span>
            <span>Backpacks</span>
            <Link to="/" className="text-emerald-700 hover:underline">
              ← Dashboard
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <p className="mb-8 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          This page simulates a distributor&apos;s product detail site. Each card below embeds a live{' '}
          <code className="rounded bg-amber-100 px-1">&lt;fp-product&gt;</code> widget that pulls
          catalog data from Friluftsportalen via the syndication API — no static copy to maintain.
        </p>

        <h1 className="mb-2 text-2xl font-semibold text-slate-900">Spring Tents 2026</h1>
        <p className="mb-8 text-sm text-slate-600">
          Live product data syndicated from Friluftsportalen · distributor{' '}
          <code className="rounded bg-slate-200 px-1">demo-retailer</code>
        </p>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SKUS.map((sku) => (
            <article
              key={sku}
              className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="border-b border-slate-100 bg-slate-100 px-4 py-3">
                <span className="font-mono text-xs text-slate-500">{sku}</span>
              </div>
              <div className="p-4">
                <fp-product
                  pack-id={PACK_ID}
                  sku={sku}
                  distributor="demo-retailer"
                  lang="sv"
                />
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  )
}

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'fp-product': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          'pack-id'?: string
          sku?: string
          distributor?: string
          lang?: string
          poll?: string
        },
        HTMLElement
      >
    }
  }
}
