import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from 'convex/react'
import { ArrowLeft, Activity, Download, RefreshCw, Search } from 'lucide-react'
import { api } from '../../convex/_generated/api'
import { EventTable } from '#/components/EventTable'
import { ExportInsights } from '#/components/ExportInsights'
import { PackEditor } from '#/components/PackEditor'
import { StatCard } from '#/components/StatCard'
import { formatTimestamp } from '#/lib/format'
import type { PackManifest } from '#/lib/types'

export const Route = createFileRoute('/packs/$packId')({
  component: PackDetailPage,
})

function PackDetailPage() {
  const { packId } = Route.useParams()
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
        <h1 className="text-2xl font-semibold">{pack.meta.assortment}</h1>
        <p className="mt-1 font-mono text-sm text-[var(--text-muted)]">{packId}</p>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Version {pack.meta.version} · {pack.products.length} products · Last seen{' '}
          {stats.lastSeen ? formatTimestamp(stats.lastSeen) : 'never'}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Opens" value={stats.opens} icon={Activity} accent="blue" />
        <StatCard label="Exports" value={stats.exports} icon={Download} accent="green" />
        <StatCard label="Updates" value={stats.updates} icon={RefreshCw} accent="orange" />
        <StatCard
          label="Top search"
          value={stats.topSearches[0]?.query ?? '—'}
          icon={Search}
        />
      </div>

      <PackEditor packId={packId} pack={pack} />

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
    </div>
  )
}
