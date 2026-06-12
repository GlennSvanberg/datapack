import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { corsPreflightResponse, withCors } from '#/lib/cors'
import { readPack } from '#/lib/server/packs'

export const Route = createFileRoute('/api/packs/$packId')({
  server: {
    handlers: {
      OPTIONS: () => corsPreflightResponse(),
      GET: async ({ params }) => {
        const pack = await readPack(params.packId)
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
