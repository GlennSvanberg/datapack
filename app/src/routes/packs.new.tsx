import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { PackIngestWizard } from '#/components/ingest/PackIngestWizard'

export const Route = createFileRoute('/packs/new')({
  component: NewPackPage,
})

function NewPackPage() {
  return (
    <div className="space-y-8">
      <div>
        <Link
          to="/"
          className="mb-4 inline-flex items-center gap-1 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Overview
        </Link>
        <h1 className="text-2xl font-semibold">Create DataPack</h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Upload a CSV or Excel file, map columns, and generate a distributable catalog
        </p>
      </div>
      <PackIngestWizard />
    </div>
  )
}
