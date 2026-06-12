import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { api } from '../../../convex/_generated/api'
import { corsPreflightResponse, withCors } from '#/lib/cors'
import { getConvexClient } from '#/lib/convex/server'

export const Route = createFileRoute('/api/packs/$packId')({
  server: {
    handlers: {
      OPTIONS: () => corsPreflightResponse(),
      GET: async ({ params }) => {
        const client = getConvexClient()
        const pack = await client.query(api.packs.getByPackId, {
          packId: params.packId,
        })
        if (!pack) {
          return new Response(JSON.stringify({ error: 'Pack not found' }), {
            status: 404,
            headers: withCors({ 'Content-Type': 'application/json' }),
          })
        }
        return json(pack, {
          headers: withCors(),
        })
      },
    },
  },
})
