import { readFile, writeFile } from 'node:fs/promises'
import type {
  DashboardStats,
  PackStats,
  TelemetryEvent,
  TelemetryEventType,
} from '#/lib/types'
import { TELEMETRY_PATH } from '#/lib/server/paths'

// POC: file append works in local dev. Vercel serverless may not persist writes.

export async function readEvents(): Promise<TelemetryEvent[]> {
  try {
    const raw = await readFile(TELEMETRY_PATH, 'utf-8')
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as TelemetryEvent[]) : []
  } catch {
    return []
  }
}

export async function appendEvent(event: TelemetryEvent): Promise<void> {
  const events = await readEvents()
  events.push(event)
  await writeFile(TELEMETRY_PATH, JSON.stringify(events, null, 2), 'utf-8')
}

function countByEvent(events: TelemetryEvent[], type: TelemetryEventType): number {
  return events.filter((e) => e.event === type).length
}

export async function aggregateStats(): Promise<DashboardStats> {
  const events = await readEvents()
  const packIds = new Set(events.map((e) => e.packId))
  const exportsByFormat: Record<string, number> = {}

  for (const event of events) {
    if (event.event === 'export' && event.payload?.format) {
      const fmt = event.payload.format
      exportsByFormat[fmt] = (exportsByFormat[fmt] ?? 0) + 1
    }
  }

  return {
    totalOpens: countByEvent(events, 'open'),
    totalExports: countByEvent(events, 'export'),
    totalUpdates: countByEvent(events, 'update'),
    exportsByFormat,
    activePacks: packIds.size,
  }
}

export async function aggregatePackStats(packId: string): Promise<PackStats> {
  const events = await readEvents().then((all) =>
    all.filter((e) => e.packId === packId),
  )

  const exportsByFormat: Record<string, number> = {}
  const searchCounts: Record<string, number> = {}
  let lastSeen: string | null = null

  for (const event of events) {
    if (!lastSeen || event.timestamp > lastSeen) {
      lastSeen = event.timestamp
    }
    if (event.event === 'export' && event.payload?.format) {
      const fmt = event.payload.format
      exportsByFormat[fmt] = (exportsByFormat[fmt] ?? 0) + 1
    }
    if (event.event === 'search' && event.payload?.query) {
      const q = event.payload.query.toLowerCase()
      searchCounts[q] = (searchCounts[q] ?? 0) + 1
    }
  }

  const topSearches = Object.entries(searchCounts)
    .map(([query, count]) => ({ query, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  return {
    packId,
    opens: countByEvent(events, 'open'),
    exports: countByEvent(events, 'export'),
    updates: countByEvent(events, 'update'),
    lastSeen,
    exportsByFormat,
    topSearches,
  }
}

export async function getRecentEvents(
  packId?: string,
  limit = 50,
): Promise<TelemetryEvent[]> {
  const events = await readEvents()
  const filtered = packId ? events.filter((e) => e.packId === packId) : events
  return filtered
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, limit)
}
