import { useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import type { IngestConfig } from '@shared/manifest.types'

interface PackDataTabProps {
  packId: string
}

export function PackDataTab({ packId }: PackDataTabProps) {
  const ingestConfig = useQuery(api.packs.getIngestConfig, { packId })
  const [message, setMessage] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  async function handleReupload(file: File) {
    setUploading(true)
    setMessage(null)
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch(`/api/packs/${encodeURIComponent(packId)}/source`, {
        method: 'PUT',
        body: form,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Re-upload failed')
      setMessage(
        `Updated ${data.recordCount} records. Version bumped — receivers can click Update in the pack.`,
      )
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Re-upload failed')
    } finally {
      setUploading(false)
    }
  }

  if (ingestConfig === undefined) {
    return <p className="text-sm text-[var(--text-secondary)]">Loading…</p>
  }

  if (!ingestConfig) {
    return (
      <p className="text-sm text-[var(--text-secondary)]">
        This pack was created from seed data. Create a new pack via upload to enable
        re-ingest.
      </p>
    )
  }

  const config = ingestConfig as IngestConfig

  return (
    <div className="space-y-4">
      <div className="text-sm text-[var(--text-secondary)]">
        <p>Source: {config.sourceType.toUpperCase()}</p>
        <p>Primary sheet: {config.primarySheet}</p>
        <p>Last ingested: {new Date(config.lastIngestedAt).toLocaleString()}</p>
      </div>

      <label className="block rounded-lg border border-dashed border-[var(--border)] p-8 text-center text-sm">
        <span className="text-[var(--text-secondary)]">
          Drop an updated file with the same column shape
        </span>
        <input
          type="file"
          accept=".csv,.xlsx,.xls"
          className="mt-4 block w-full"
          disabled={uploading}
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) void handleReupload(f)
          }}
        />
      </label>

      {message && (
        <p className="rounded border border-[var(--border)] bg-[var(--bg-tertiary)] px-4 py-2 text-sm">
          {message}
        </p>
      )}
    </div>
  )
}
