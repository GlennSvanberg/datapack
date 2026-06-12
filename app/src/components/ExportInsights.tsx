import { FormatBadges } from '#/components/FormatBadges'

interface ExportInsightsProps {
  exportsByFormat?: Record<string, number> | null
  exportsByScope?: Record<string, number> | null
  topExportFields?: Array<{ field: string; count: number }> | null
}

const scopeLabels: Record<string, string> = {
  all: 'All products',
  filtered: 'Search filter',
  one: 'Single product',
}

const scopeColors: Record<string, string> = {
  all: 'bg-[var(--accent)]/20 text-[var(--accent)]',
  filtered: 'bg-[var(--accent-orange)]/20 text-[var(--accent-orange)]',
  one: 'bg-purple-500/20 text-purple-400',
}

function EmptyHint() {
  return <span className="text-sm text-[var(--text-muted)]">No exports yet</span>
}

export function ExportInsights({
  exportsByFormat = {},
  exportsByScope = {},
  topExportFields = [],
}: ExportInsightsProps) {
  const scopeEntries = Object.entries(exportsByScope ?? {})
  const hasData =
    Object.keys(exportsByFormat ?? {}).length > 0 ||
    scopeEntries.length > 0 ||
    (topExportFields ?? []).length > 0

  if (!hasData) {
    return <EmptyHint />
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-2 text-sm font-medium text-[var(--text-secondary)]">Formats</h3>
        <FormatBadges exportsByFormat={exportsByFormat ?? {}} />
      </div>

      {scopeEntries.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-medium text-[var(--text-secondary)]">
            Product scope
          </h3>
          <div className="flex flex-wrap gap-2">
            {scopeEntries.map(([scope, count]) => (
              <span
                key={scope}
                className={`rounded px-2 py-1 text-xs font-medium ${
                  scopeColors[scope] ?? 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'
                }`}
              >
                {scopeLabels[scope] ?? scope} ({count})
              </span>
            ))}
          </div>
        </div>
      )}

      {(topExportFields ?? []).length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-medium text-[var(--text-secondary)]">
            Most selected fields
          </h3>
          <div className="flex flex-wrap gap-2">
            {(topExportFields ?? []).map(({ field, count }) => (
              <span
                key={field}
                className="rounded bg-[var(--bg-tertiary)] px-2 py-1 font-mono text-xs text-[var(--text-secondary)]"
              >
                {field} ({count})
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
