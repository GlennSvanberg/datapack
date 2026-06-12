import { formatTimestamp } from '#/lib/format'
import type { TelemetryEvent } from '#/lib/types'

interface EventTableProps {
  events: TelemetryEvent[]
}

function formatPayload(event: TelemetryEvent): string {
  const p = event.payload
  if (!p) return '—'
  const parts: string[] = []
  if (p.query) parts.push(`"${p.query}"`)
  if (p.format) parts.push(p.format.toUpperCase())
  if (p.productSku) parts.push(p.productSku)
  if (p.language) parts.push(p.language)
  return parts.join(' · ') || '—'
}

export function EventTable({ events }: EventTableProps) {
  if (events.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-[var(--text-muted)]">
        No events recorded yet. Open a DataPack file to generate telemetry.
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
