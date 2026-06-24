import { useCallback, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import type {
  CsvDelimiter,
  IngestConfig,
  IngestPreview,
  SchemaField,
} from '@shared/manifest.types'
import { inferViewProfile } from '@shared/manifest.validate'

type Step = 0 | 1 | 2 | 3

interface SheetJoin {
  name: string
  joinKey: string
  headerRowIndex: number
}

const DELIMITER_OPTIONS: { value: CsvDelimiter; label: string }[] = [
  { value: ',', label: 'Comma (,)' },
  { value: ';', label: 'Semicolon (;)' },
  { value: '\t', label: 'Tab' },
  { value: '|', label: 'Pipe (|)' },
]

function buildFieldMap(
  schema: SchemaField[],
  headers: string[] | undefined,
): Record<string, string> {
  const fieldMap: Record<string, string> = {}
  for (const field of schema) {
    const srcCol =
      headers?.find((h) => h === field.label) ??
      headers?.find(
        (h) => h.toLowerCase().replace(/[^a-z0-9]+/g, '_') === field.name,
      )
    if (srcCol) fieldMap[srcCol] = field.name
  }
  return fieldMap
}

function buildIngestConfig(
  file: File,
  primarySheet: string,
  sheetJoins: SheetJoin[],
  schema: SchemaField[],
  preview: IngestPreview | null,
  csvDelimiter: CsvDelimiter | undefined,
): IngestConfig {
  const now = new Date().toISOString()
  const primaryHeaders = preview?.sheets.find((s) => s.name === primarySheet)?.headers

  return {
    sourceType: file.name.toLowerCase().endsWith('.csv') ? 'csv' : 'xlsx',
    primarySheet,
    csvDelimiter,
    sheets: sheetJoins.map((s) => ({
      name: s.name,
      joinKey: s.joinKey,
      headerRowIndex: s.headerRowIndex,
      fieldMap:
        s.name === primarySheet ? buildFieldMap(schema, primaryHeaders) : {},
    })),
    createdAt: now,
    lastIngestedAt: now,
  }
}

export function PackIngestWizard() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>(0)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<IngestPreview | null>(null)
  const [primarySheet, setPrimarySheet] = useState('')
  const [sheetJoins, setSheetJoins] = useState<SheetJoin[]>([])
  const [schema, setSchema] = useState<SchemaField[]>([])
  const [csvDelimiter, setCsvDelimiter] = useState<CsvDelimiter | undefined>()
  const [title, setTitle] = useState('')
  const [brand, setBrand] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isCsv = file?.name.toLowerCase().endsWith('.csv') ?? false

  const runPreview = useCallback(
    async (f: File, cfg?: IngestConfig, sch?: SchemaField[]) => {
      const form = new FormData()
      form.append('file', f)
      const headers: HeadersInit = {}
      if (cfg) headers['x-ingest-config'] = JSON.stringify(cfg)
      if (sch) headers['x-ingest-schema'] = JSON.stringify(sch)
      const res = await fetch('/api/packs/ingest/preview', {
        method: 'POST',
        body: form,
        headers,
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Preview failed')
      }
      return (await res.json()) as IngestPreview
    },
    [],
  )

  async function handleFileSelect(f: File) {
    setFile(f)
    setError(null)
    setLoading(true)
    try {
      const result = await runPreview(f)
      setPreview(result)
      const first = result.sheets[0]
      setPrimarySheet(first?.name ?? '')
      setSheetJoins(
        result.sheets.map((s) => ({
          name: s.name,
          joinKey: s.headers[0] ?? '',
          headerRowIndex: s.headerRowIndex ?? 0,
        })),
      )
      setSchema(result.suggestedSchema)
      if (result.detectedCsvDelimiter) {
        setCsvDelimiter(result.detectedCsvDelimiter as CsvDelimiter)
      }
      if (!title) setTitle(f.name.replace(/\.(csv|xlsx|xls)$/i, ''))
      setStep(1)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  async function refreshPreviewWithConfig(
    nextJoins: SheetJoin[],
    nextDelimiter?: CsvDelimiter,
    nextSchema?: SchemaField[],
  ) {
    if (!file) return
    const sch = nextSchema ?? schema
    const ingestConfig = buildIngestConfig(
      file,
      primarySheet,
      nextJoins,
      sch,
      preview,
      nextDelimiter ?? csvDelimiter,
    )

    setLoading(true)
    try {
      const result = await runPreview(file, ingestConfig, sch)
      setPreview(result)
      setSchema(result.suggestedSchema.length ? result.suggestedSchema : sch)
      setSheetJoins(
        nextJoins.map((sj) => {
          const sheet = result.sheets.find((s) => s.name === sj.name)
          return {
            ...sj,
            joinKey:
              sheet?.headers.includes(sj.joinKey) && sj.joinKey
                ? sj.joinKey
                : (sheet?.headers[0] ?? sj.joinKey),
          }
        }),
      )
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Preview failed')
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate() {
    if (!file) return
    setLoading(true)
    setError(null)

    const ingestConfig = buildIngestConfig(
      file,
      primarySheet,
      sheetJoins,
      schema,
      preview,
      csvDelimiter,
    )

    const form = new FormData()
    form.append('file', file)
    form.append(
      'payload',
      JSON.stringify({ title, brand: brand || undefined, schema, ingestConfig }),
    )

    try {
      const res = await fetch('/api/packs', { method: 'POST', body: form })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Create failed')
      }
      const { packId } = await res.json()
      await navigate({ to: '/packs/$packId', params: { packId } })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Create failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2 text-sm text-[var(--text-secondary)]">
        {['Upload', 'Sheets', 'Mapping', 'Settings'].map((label, i) => (
          <span
            key={label}
            className={step === i ? 'font-medium text-[var(--accent)]' : ''}
          >
            {i + 1}. {label}
          </span>
        ))}
      </div>

      {error && (
        <p className="rounded border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-300">
          {error}
        </p>
      )}

      {step === 0 && (
        <section className="rounded-lg border border-dashed border-[var(--border)] p-12 text-center">
          <p className="mb-4 text-[var(--text-secondary)]">
            Drop a CSV or Excel file to create a new DataPack
          </p>
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            disabled={loading}
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) void handleFileSelect(f)
            }}
          />
        </section>
      )}

      {step === 1 && preview && (
        <section className="space-y-4 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-6">
          <h2 className="text-lg font-medium">Sheets &amp; structure</h2>

          {isCsv && (
            <label className="block text-sm">
              CSV delimiter
              <select
                className="mt-1 w-full rounded border border-[var(--border)] bg-[var(--bg-primary)] px-3 py-2"
                value={csvDelimiter ?? preview.detectedCsvDelimiter ?? ','}
                onChange={(e) => {
                  const delim = e.target.value as CsvDelimiter
                  setCsvDelimiter(delim)
                  void refreshPreviewWithConfig(sheetJoins, delim)
                }}
              >
                {DELIMITER_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                    {preview.detectedCsvDelimiter === opt.value ? ' (detected)' : ''}
                  </option>
                ))}
              </select>
            </label>
          )}

          <label className="block text-sm">
            Primary sheet
            <select
              className="mt-1 w-full rounded border border-[var(--border)] bg-[var(--bg-primary)] px-3 py-2"
              value={primarySheet}
              onChange={(e) => setPrimarySheet(e.target.value)}
            >
              {preview.sheets.map((s) => (
                <option key={s.name} value={s.name}>
                  {s.name} ({s.rowCount} rows)
                </option>
              ))}
            </select>
          </label>

          {sheetJoins.map((sj, idx) => {
            const sheetPreview = preview.sheets.find((s) => s.name === sj.name)
            const rawRows = sheetPreview?.rawPreviewRows ?? []
            return (
              <div
                key={sj.name}
                className="space-y-2 rounded border border-[var(--border)]/60 p-4"
              >
                <p className="text-sm font-medium">{sj.name}</p>

                <label className="block text-sm">
                  Header row
                  <select
                    className="mt-1 w-full rounded border border-[var(--border)] bg-[var(--bg-primary)] px-3 py-2"
                    value={sj.headerRowIndex}
                    onChange={(e) => {
                      const next = [...sheetJoins]
                      next[idx] = {
                        ...sj,
                        headerRowIndex: Number(e.target.value),
                      }
                      setSheetJoins(next)
                      void refreshPreviewWithConfig(next)
                    }}
                  >
                    {rawRows.map((row, rowIdx) => (
                      <option key={rowIdx} value={rowIdx}>
                        Row {rowIdx + 1}: {row.filter(Boolean).slice(0, 4).join(' · ') || '(empty)'}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block text-sm">
                  Join key
                  <select
                    className="mt-1 w-full rounded border border-[var(--border)] bg-[var(--bg-primary)] px-3 py-2"
                    value={sj.joinKey}
                    onChange={(e) => {
                      const next = [...sheetJoins]
                      next[idx] = { ...sj, joinKey: e.target.value }
                      setSheetJoins(next)
                    }}
                  >
                    {(sheetPreview?.headers ?? []).map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            )
          })}

          <button
            type="button"
            className="btn-accent rounded px-4 py-2 text-sm"
            disabled={loading}
            onClick={() => {
              void refreshPreviewWithConfig(sheetJoins).then(() => setStep(2))
            }}
          >
            Continue
          </button>
        </section>
      )}

      {step === 2 && preview && (
        <section className="space-y-4 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-6">
          <h2 className="text-lg font-medium">Column mapping</h2>
          <p className="text-sm text-[var(--text-secondary)]">
            View profile: {inferViewProfile(schema)}
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[var(--text-secondary)]">
                  <th className="pb-2 pr-4">Field</th>
                  <th className="pb-2 pr-4">Label</th>
                  <th className="pb-2 pr-4">Type</th>
                  <th className="pb-2">Role</th>
                </tr>
              </thead>
              <tbody>
                {schema.map((field, idx) => (
                  <tr key={field.name} className="border-t border-[var(--border)]/50">
                    <td className="py-2 pr-4 font-mono text-xs">{field.name}</td>
                    <td className="py-2 pr-4">
                      <input
                        className="w-full rounded border border-[var(--border)] bg-[var(--bg-primary)] px-2 py-1"
                        value={field.label}
                        onChange={(e) => {
                          const next = [...schema]
                          next[idx] = { ...field, label: e.target.value }
                          setSchema(next)
                        }}
                      />
                    </td>
                    <td className="py-2 pr-4">
                      <select
                        className="rounded border border-[var(--border)] bg-[var(--bg-primary)] px-2 py-1"
                        value={field.type}
                        onChange={(e) => {
                          const next = [...schema]
                          next[idx] = {
                            ...field,
                            type: e.target.value as SchemaField['type'],
                          }
                          setSchema(next)
                        }}
                      >
                        {['string', 'number', 'boolean', 'date', 'url'].map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2">
                      <select
                        className="rounded border border-[var(--border)] bg-[var(--bg-primary)] px-2 py-1"
                        value={field.role ?? ''}
                        onChange={(e) => {
                          const next = [...schema]
                          next[idx] = {
                            ...field,
                            role: (e.target.value || undefined) as SchemaField['role'],
                          }
                          setSchema(next)
                        }}
                      >
                        <option value="">—</option>
                        {['id', 'title', 'description', 'image', 'price', 'stock'].map(
                          (r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ),
                        )}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            type="button"
            className="mr-2 rounded border border-[var(--border)] px-4 py-2 text-sm"
            onClick={() => void refreshPreviewWithConfig(sheetJoins)}
            disabled={loading}
          >
            Refresh preview
          </button>
          <button
            type="button"
            className="btn-accent rounded px-4 py-2 text-sm"
            onClick={() => setStep(3)}
          >
            Continue
          </button>
          {preview.previewRecords.length > 0 && (
            <pre className="max-h-40 overflow-auto rounded bg-[var(--bg-primary)] p-3 text-xs">
              {JSON.stringify(preview.previewRecords.slice(0, 3), null, 2)}
            </pre>
          )}
        </section>
      )}

      {step === 3 && (
        <section className="space-y-4 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-6">
          <h2 className="text-lg font-medium">Pack settings</h2>
          <label className="block text-sm">
            Title
            <input
              className="mt-1 w-full rounded border border-[var(--border)] bg-[var(--bg-primary)] px-3 py-2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>
          <label className="block text-sm">
            Brand (optional)
            <input
              className="mt-1 w-full rounded border border-[var(--border)] bg-[var(--bg-primary)] px-3 py-2"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
            />
          </label>
          <button
            type="button"
            className="btn-accent rounded px-4 py-2 text-sm disabled:opacity-50"
            disabled={loading || !title.trim()}
            onClick={() => void handleCreate()}
          >
            {loading ? 'Creating…' : 'Create pack'}
          </button>
        </section>
      )}
    </div>
  )
}
