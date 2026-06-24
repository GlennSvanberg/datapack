import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from 'convex/react'
import { useState } from 'react'
import { ArrowLeft, Activity, Download, RefreshCw, Search } from 'lucide-react'
import { api } from '../../convex/_generated/api'
import { EventTable } from '#/components/EventTable'
import { ExportInsights } from '#/components/ExportInsights'
import { PackDataTab } from '#/components/ingest/PackDataTab'
import { EmbedSnippet } from '#/components/EmbedSnippet'
import { PackEditor } from '#/components/PackEditor'
import { StatCard } from '#/components/StatCard'
import { formatTimestamp } from '#/lib/format'
import { isLegacyManifest, type PackManifest } from '#/lib/types'

export const Route = createFileRoute('/packs/$packId')({
  component: PackDetailPage,
})

type Tab = 'overview' | 'data' | 'embed'

function exampleSkus(pack: PackManifest): string[] {
  if (isLegacyManifest(pack)) {
    return pack.products.map((p) => p.sku)
  }
  const key = pack.meta.primaryKey
  if (pack.records?.length) {
    return pack.records
      .map((r) => String(r[key] ?? ''))
      .filter((sku) => sku.length > 0)
  }
  return []
}

function PackDetailPage() {
  const { packId } = Route.useParams()
  const [tab, setTab] = useState<Tab>('overview')
  const pack = useQuery(api.packs.getByPackId, { packId }) as PackManifest | null | undefined
  const stats = useQuery(api.telemetry.packStats, { packId })
  const events = useQuery(api.telemetry.recent, { packId, limit: 30 })

  if (pack === undefined || stats === undefined || events === undefined) {
    return (
      <div className="py-16 text-center text-[var(--text-secondary)]">
        Loading pack…
      </div>
    )
  }

  if (!pack) {
    return (
      <div className="py-16 text-center">
        <p className="text-[var(--text-secondary)]">Pack not found: {packId}</p>
        <Link to="/" className="mt-4 inline-block text-[var(--accent)]">
          ← Back to overview
        </Link>
      </div>
    )
  }

  const legacy = isLegacyManifest(pack)
  const meta = pack.meta
  const title = meta.title || meta.assortment || packId
  const recordCount =
    meta.recordCount ??
    (legacy ? pack.products.length : 0)
  const skus = exampleSkus(pack)

  return (
    <div className="space-y-8">
      <div>
        <Link
          to="/"
          className="mb-4 inline-flex items-center gap-1 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Overview
        </Link>
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="mt-1 font-mono text-sm text-[var(--text-muted)]">{packId}</p>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Version {meta.version} · {recordCount} records
          {meta.storageMode ? ` · ${meta.storageMode}` : ''} · Last seen{' '}
          {stats.lastSeen ? formatTimestamp(stats.lastSeen) : 'never'}
        </p>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Syndicate this catalog to distributor sites via the embed widget — see the Embed tab for
          integration snippets.
        </p>
      </div>

      <div className="flex gap-2 border-b border-[var(--border)]">
        {(
          [
            ['overview', 'Overview'],
            ['data', 'Data'],
            ['embed', 'Embed'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={`border-b-2 px-4 py-2 text-sm ${
              tab === id
                ? 'border-[var(--accent)] text-[var(--text-primary)]'
                : 'border-transparent text-[var(--text-secondary)]'
            }`}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Embed views" value={stats.embedViews} icon={Activity} accent="blue" />
            <StatCard label="Exports" value={stats.exports} icon={Download} accent="green" />
            <StatCard label="Updates" value={stats.updates} icon={RefreshCw} accent="orange" />
            <StatCard
              label="Top search"
              value={stats.topSearches[0]?.query ?? '—'}
              icon={Search}
            />
          </div>

          {legacy && <PackEditor packId={packId} pack={pack} />}

          <section className="rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-6">
            <h2 className="mb-4 text-lg font-medium">Export insights</h2>
            <ExportInsights
              exportsByFormat={stats.exportsByFormat}
              exportsByScope={stats.exportsByScope}
              topExportFields={stats.topExportFields}
            />
          </section>

          {(stats.topSearches ?? []).length > 0 && (
            <section className="rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-6">
              <h2 className="mb-4 text-lg font-medium">Top searches</h2>
              <div className="flex flex-wrap gap-2">
                {(stats.topSearches ?? []).map(({ query, count }) => (
                  <span
                    key={query}
                    className="rounded bg-[var(--bg-tertiary)] px-3 py-1 text-sm text-[var(--text-secondary)]"
                  >
                    {query} ({count})
                  </span>
                ))}
              </div>
            </section>
          )}

          <section className="rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-6">
            <h2 className="mb-4 text-lg font-medium">Event timeline</h2>
            <EventTable events={events} />
          </section>
        </>
      )}

      {tab === 'data' && (
        <section className="rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-6">
          <h2 className="mb-4 text-lg font-medium">Source data</h2>
          <PackDataTab packId={packId} />
        </section>
      )}

      {tab === 'embed' && (
        <section className="space-y-6 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-6">
          <div>
            <h2 className="mb-2 text-lg font-medium">Embed widget</h2>
            <p className="text-sm text-[var(--text-secondary)]">
              Distributors paste a script tag and one{' '}
              <code className="rounded bg-[var(--bg-tertiary)] px-1 text-xs">&lt;fp-product&gt;</code>{' '}
              element per SKU. Data refreshes automatically when you publish catalog updates.
            </p>
          </div>
          <EmbedSnippet packId={packId} sku={skus[0] ?? 'SKU-001'} />
          {skus.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-medium text-[var(--text-primary)]">Example SKUs</h3>
              <div className="flex flex-wrap gap-2">
                {skus.map((sku) => (
                  <span
                    key={sku}
                    className="rounded bg-[var(--bg-tertiary)] px-3 py-1 font-mono text-sm text-[var(--text-secondary)]"
                  >
                    {sku}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  )
}
