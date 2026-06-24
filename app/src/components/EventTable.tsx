import { formatTimestamp } from '#/lib/format'
import type { TelemetryEvent } from '#/lib/types'

interface EventTableProps {
  events: TelemetryEvent[]
}

const scopeLabels: Record<string, string> = {
  all: 'all products',
  filtered: 'filtered',
  one: 'single product',
}

function formatExportPayload(event: TelemetryEvent): string {
  const p = event.payload
  if (!p) return '—'

  const parts: string[] = []

  if (p.format) parts.push(p.format.toUpperCase())
  if (p.scope) parts.push(scopeLabels[p.scope] ?? p.scope)
  if (p.productCount != null) {
    parts.push(
      p.catalogTotal != null && p.scope === 'all'
        ? `${p.productCount}/${p.catalogTotal} products`
        : `${p.productCount} product${p.productCount === 1 ? '' : 's'}`,
    )
  }
  if (p.fields?.length) {
    const fieldSummary =
      p.allFieldsSelected && p.totalFields
        ? `all ${p.totalFields} fields`
        : `${p.fieldCount ?? p.fields.length} fields (${p.fields.join(', ')})`
    parts.push(fieldSummary)
  }
  if (p.searchQuery) parts.push(`search: "${p.searchQuery}"`)
  if (p.productSku) parts.push(p.productSku)
  if (p.source) parts.push(`from ${p.source}`)
  if (p.language) parts.push(p.language)
  if (p.filename) parts.push(p.filename)

  return parts.join(' · ') || '—'
}

function formatPayload(event: TelemetryEvent): string {
  const p = event.payload
  if (!p) return '—'

  if (event.event === 'export') {
    return formatExportPayload(event)
  }

  const parts: string[] = []
  if (p.query) parts.push(`"${p.query}"`)
  if (p.format) parts.push(p.format.toUpperCase())
  if (p.productSku) parts.push(p.productSku)
  if (p.distributor) parts.push(`distributor: ${p.distributor}`)
  if (p.language) parts.push(p.language)
  return parts.join(' · ') || '—'
}

export function EventTable({ events }: EventTableProps) {
  if (events.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-[var(--text-muted)]">
        No events recorded yet. Embed a widget on the demo retailer page to generate telemetry.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--border)] text-left text-[var(--text-secondary)]">
            <th className="pb-3 pr-4 font-medium">Time</th>
            <th className="pb-3 pr-4 font-medium">Pack</th>
            <th className="pb-3 pr-4 font-medium">Event</th>
            <th className="pb-3 font-medium">Details</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event, i) => (
            <tr
              key={`${event.timestamp}-${i}`}
              className="border-b border-[var(--border)]/50 text-[var(--text-primary)]"
            >
              <td className="py-3 pr-4 whitespace-nowrap text-[var(--text-secondary)]">
                {formatTimestamp(event.timestamp)}
              </td>
              <td className="py-3 pr-4 font-mono text-xs">{event.packId}</td>
              <td className="py-3 pr-4">
                <span className="rounded bg-[var(--bg-tertiary)] px-2 py-0.5 text-xs uppercase">
                  {event.event}
                </span>
              </td>
              <td className="py-3 text-[var(--text-secondary)]">{formatPayload(event)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
