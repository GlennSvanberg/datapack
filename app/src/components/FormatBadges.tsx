interface FormatBadgesProps {
  exportsByFormat?: Record<string, number> | null
}

const formatColors: Record<string, string> = {
  csv: 'bg-[var(--accent-green)]/20 text-[var(--accent-green)]',
  xlsx: 'bg-[var(--accent)]/20 text-[var(--accent)]',
  json: 'bg-[var(--accent-orange)]/20 text-[var(--accent-orange)]',
  xml: 'bg-purple-500/20 text-purple-400',
}

export function FormatBadges({ exportsByFormat }: FormatBadgesProps) {
  const entries = Object.entries(exportsByFormat ?? {})
  if (entries.length === 0) {
    return <span className="text-sm text-[var(--text-muted)]">No exports yet</span>
  }

  return (
    <div className="flex flex-wrap gap-2">
      {entries.map(([format, count]) => (
        <span
          key={format}
          className={`rounded px-2 py-1 text-xs font-medium uppercase ${
            formatColors[format] ?? 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'
          }`}
        >
          {format} ({count})
        </span>
      ))}
    </div>
  )
}
