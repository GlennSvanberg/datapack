import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from 'convex/react'
import { Activity, Download, Package, RefreshCw } from 'lucide-react'
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
      <div>
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Overview</h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Monitor DataPack usage across assortments — updates live
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total opens" value={stats.totalOpens} icon={Activity} accent="blue" />
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
