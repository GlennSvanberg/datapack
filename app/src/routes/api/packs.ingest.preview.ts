import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { corsPreflightResponse, withCors } from '#/lib/cors'
import { parseFilePreview, readUploadBuffer } from '#/lib/ingest/server'
import type { IngestConfig, SchemaField } from '@shared/manifest.types'

export const Route = createFileRoute('/api/packs/ingest/preview')({
  server: {
    handlers: {
      OPTIONS: () => corsPreflightResponse(),
      POST: async ({ request }) => {
        try {
          const { buffer, fileName } = await readUploadBuffer(request)

          let ingestConfig: IngestConfig | undefined
          let schema: SchemaField[] | undefined

          const configHeader = request.headers.get('x-ingest-config')
          const schemaHeader = request.headers.get('x-ingest-schema')
          if (configHeader) ingestConfig = JSON.parse(configHeader)
          if (schemaHeader) schema = JSON.parse(schemaHeader)

          const preview = await parseFilePreview(
            buffer,
            fileName,
            ingestConfig,
            schema,
          )

          return json(preview, { headers: withCors() })
        } catch (err) {
          return new Response(
            JSON.stringify({
              error: err instanceof Error ? err.message : 'Preview failed',
            }),
            { status: 400, headers: withCors({ 'Content-Type': 'application/json' }) },
          )
        }
      },
    },
  },
})
