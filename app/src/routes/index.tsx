import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from 'convex/react'
import { Activity, Download, ExternalLink, Package, RefreshCw } from 'lucide-react'
import { api } from '../../convex/_generated/api'
import { EventTable } from '#/components/EventTable'
import { ExportInsights } from '#/components/ExportInsights'
import { PackTable } from '#/components/PackTable'
import { StatCard } from '#/components/StatCard'

export const Route = createFileRoute('/')({
  component: DashboardHome,
})

function DashboardHome() {
  const stats = useQuery(api.telemetry.dashboardStats)
  const packs = useQuery(api.packs.list)
  const events = useQuery(api.telemetry.recent, { limit: 20 })

  if (stats === undefined || packs === undefined || events === undefined) {
    return (
      <div className="py-16 text-center text-[var(--text-secondary)]">
        Loading dashboard…
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Live Data Syndication</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Monitor embedded widget usage across catalogs — updates live
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/report/product-data-future"
            className="inline-flex items-center gap-1.5 rounded border border-[var(--border)] px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            Future report
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
          <Link
            to="/demo/retailer"
            className="inline-flex items-center gap-1.5 rounded border border-[var(--border)] px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            Demo retailer
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
          <Link
            to="/packs/new"
            className="rounded bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Create catalog
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Embed views"
          value={stats.totalEmbedViews}
          icon={Activity}
          accent="blue"
        />
        <StatCard label="Exports" value={stats.totalExports} icon={Download} accent="green" />
        <StatCard label="Updates" value={stats.totalUpdates} icon={RefreshCw} accent="orange" />
        <StatCard label="Active packs" value={stats.activePacks} icon={Package} />
      </div>

      <section className="rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-6">
        <h2 className="mb-4 text-lg font-medium">Export insights</h2>
        <ExportInsights
          exportsByFormat={stats.exportsByFormat}
          exportsByScope={stats.exportsByScope}
          topExportFields={stats.topExportFields}
        />
      </section>

      <section className="rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-6">
        <h2 className="mb-4 text-lg font-medium">Assortments</h2>
        <PackTable packs={packs} />
      </section>

      <section className="rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-6">
        <h2 className="mb-4 text-lg font-medium">Recent activity</h2>
        <EventTable events={events} />
      </section>
    </div>
  )
}
