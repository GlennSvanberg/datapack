import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { api } from '../../../convex/_generated/api'
import { corsPreflightResponse, withCors } from '#/lib/cors'
import { getConvexClient } from '#/lib/convex/server'

export const Route = createFileRoute('/api/packs/')({
  server: {
    handlers: {
      OPTIONS: () => corsPreflightResponse(),
      POST: async ({ request }) => {
        try {
          const form = await request.formData()
          const file = form.get('file')
          const payloadRaw = form.get('payload')

          if (!(file instanceof File) || typeof payloadRaw !== 'string') {
            return new Response(
              JSON.stringify({ error: 'Expected multipart file and payload JSON' }),
              { status: 400, headers: withCors({ 'Content-Type': 'application/json' }) },
            )
          }

          const payload = JSON.parse(payloadRaw)

          const buffer = await file.arrayBuffer()
          const base64 = Buffer.from(buffer).toString('base64')

          const client = getConvexClient()
          const result = await client.action(api.ingestActions.ingestFromUpload, {
            fileBase64: base64,
            fileName: file.name,
            title: payload.title,
            brand: payload.brand,
            packId: payload.packId,
            schema: payload.schema,
            ingestConfig: payload.ingestConfig,
            embedThreshold: payload.embedThreshold,
          })

          return json(result, { status: 201, headers: withCors() })
        } catch (err) {
          return new Response(
            JSON.stringify({
              error: err instanceof Error ? err.message : 'Create pack failed',
            }),
            { status: 500, headers: withCors({ 'Content-Type': 'application/json' }) },
          )
        }
      },
    },
  },
})
