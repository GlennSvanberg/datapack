import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { api } from '../../../convex/_generated/api'
import { corsPreflightResponse, withCors } from '#/lib/cors'
import { getConvexClient } from '#/lib/convex/server'

export const Route = createFileRoute('/api/packs/$packId/records')({
  server: {
    handlers: {
      OPTIONS: () => corsPreflightResponse(),
      GET: async ({ params, request }) => {
        const url = new URL(request.url)
        const cursorParam = url.searchParams.get('cursor')
        const limitParam = url.searchParams.get('limit')

        const client = getConvexClient()
        const page = await client.query(api.packs.getRecordsPage, {
          packId: params.packId,
          cursor: cursorParam ? Number(cursorParam) : undefined,
          limit: limitParam ? Number(limitParam) : undefined,
        })

        return json(page, { headers: withCors() })
      },
    },
  },
})
