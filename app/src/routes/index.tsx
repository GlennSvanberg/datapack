import { createFileRoute } from '@tanstack/react-router'
import { Activity, Download, Package, RefreshCw } from 'lucide-react'
import { EventTable } from '#/components/EventTable'
import { FormatBadges } from '#/components/FormatBadges'
import { PackTable } from '#/components/PackTable'
import { StatCard } from '#/components/StatCard'
import {
  getDashboardStats,
  getPackRegistry,
  getRecentActivity,
} from '#/lib/dashboard/server'

export const Route = createFileRoute('/')({
  loader: async () => {
    const [stats, packs, events] = await Promise.all([
      getDashboardStats(),
      getPackRegistry(),
      getRecentActivity(),
    ])
    return { stats, packs, events }
  },
  component: DashboardHome,
})

function DashboardHome() {
  const { stats, packs, events } = Route.useLoaderData()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Overview</h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Monitor DataPack usage across assortments
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total opens" value={stats.totalOpens} icon={Activity} accent="blue" />
        <StatCard label="Exports" value={stats.totalExports} icon={Download} accent="green" />
        <StatCard label="Updates" value={stats.totalUpdates} icon={RefreshCw} accent="orange" />
        <StatCard label="Active packs" value={stats.activePacks} icon={Package} />
      </div>

      <section className="rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-6">
        <h2 className="mb-4 text-lg font-medium">Export formats</h2>
        <FormatBadges exportsByFormat={stats.exportsByFormat} />
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
