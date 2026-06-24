import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { api } from '../../../convex/_generated/api'
import { corsPreflightResponse, withCors } from '#/lib/cors'
import { getConvexClient } from '#/lib/convex/server'

export const Route = createFileRoute('/api/packs/$packId/source')({
  server: {
    handlers: {
      OPTIONS: () => corsPreflightResponse(),
      PUT: async ({ params, request }) => {
        try {
          const form = await request.formData()
          const file = form.get('file')

          if (!(file instanceof File)) {
            return new Response(JSON.stringify({ error: 'Missing file' }), {
              status: 400,
              headers: withCors({ 'Content-Type': 'application/json' }),
            })
          }

          const client = getConvexClient()
          const ingestConfig = await client.query(api.packs.getIngestConfig, {
            packId: params.packId,
          })

          if (!ingestConfig) {
            return new Response(
              JSON.stringify({ error: 'Pack has no ingest config' }),
              { status: 400, headers: withCors({ 'Content-Type': 'application/json' }) },
            )
          }

          const pack = await client.query(api.packs.getByPackId, {
            packId: params.packId,
          })

          if (!pack || !pack.schema) {
            return new Response(JSON.stringify({ error: 'Pack not found' }), {
              status: 404,
              headers: withCors({ 'Content-Type': 'application/json' }),
            })
          }

          const buffer = await file.arrayBuffer()
          const base64 = Buffer.from(buffer).toString('base64')

          const meta = pack.meta ?? {}
          const result = await client.action(api.ingestActions.ingestFromUpload, {
            fileBase64: base64,
            fileName: file.name,
            title: meta.title || meta.assortment || params.packId,
            brand: meta.brand,
            schema: pack.schema,
            ingestConfig,
            reingestPackId: params.packId,
          })

          return json(result, { headers: withCors() })
        } catch (err) {
          return new Response(
            JSON.stringify({
              error: err instanceof Error ? err.message : 'Re-ingest failed',
            }),
            { status: 500, headers: withCors({ 'Content-Type': 'application/json' }) },
          )
        }
      },
    },
  },
})
