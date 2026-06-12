import type { Doc } from '../_generated/dataModel'

export type TelemetryEventDoc = Doc<'telemetryEvents'>

export function countByEvent(
  events: TelemetryEventDoc[],
  type: TelemetryEventDoc['event'],
): number {
  return events.filter((e) => e.event === type).length
}

export function buildExportsByFormat(
  events: TelemetryEventDoc[],
): Record<string, number> {
  const exportsByFormat: Record<string, number> = {}
  for (const event of events) {
    if (event.event === 'export' && event.payload?.format) {
      const fmt = event.payload.format
      exportsByFormat[fmt] = (exportsByFormat[fmt] ?? 0) + 1
    }
  }
  return exportsByFormat
}

export function buildExportsByScope(
  events: TelemetryEventDoc[],
): Record<string, number> {
  const exportsByScope: Record<string, number> = {}
  for (const event of events) {
    if (event.event === 'export' && event.payload?.scope) {
      const scope = event.payload.scope
      exportsByScope[scope] = (exportsByScope[scope] ?? 0) + 1
    }
  }
  return exportsByScope
}

export function buildTopExportFields(
  events: TelemetryEventDoc[],
  limit = 10,
): Array<{ field: string; count: number }> {
  const fieldCounts: Record<string, number> = {}
  for (const event of events) {
    if (event.event === 'export' && event.payload?.fields) {
      for (const field of event.payload.fields) {
        fieldCounts[field] = (fieldCounts[field] ?? 0) + 1
      }
    }
  }
  return Object.entries(fieldCounts)
    .map(([field, count]) => ({ field, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}

export function buildPackStats(packId: string, events: TelemetryEventDoc[]) {
  const exportsByFormat = buildExportsByFormat(events)
  const searchCounts: Record<string, number> = {}
  let lastSeen: string | null = null

  for (const event of events) {
    if (!lastSeen || event.timestamp > lastSeen) {
      lastSeen = event.timestamp
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
    exportsByScope: buildExportsByScope(events),
    topExportFields: buildTopExportFields(events),
    topSearches,
  }
}
