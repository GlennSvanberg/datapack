import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { api } from '../../../convex/_generated/api'
import { corsPreflightResponse, withCors } from '#/lib/cors'
import { getConvexClient } from '#/lib/convex/server'
import type { TelemetryEvent, TelemetryEventType } from '#/lib/types'

const VALID_EVENTS: TelemetryEventType[] = [
  'open',
  'search',
  'export',
  'update',
  'embed_view',
]

function isValidEvent(body: unknown): body is TelemetryEvent {
  if (!body || typeof body !== 'object') return false
  const b = body as Record<string, unknown>
  return (
    typeof b.packId === 'string' &&
    typeof b.event === 'string' &&
    VALID_EVENTS.includes(b.event as TelemetryEventType) &&
    typeof b.timestamp === 'string'
  )
}

export const Route = createFileRoute('/api/telemetry')({
  server: {
    handlers: {
      OPTIONS: () => corsPreflightResponse(),
      POST: async ({ request }) => {
        let body: unknown
        try {
          body = await request.json()
        } catch {
          return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
            status: 400,
            headers: withCors({ 'Content-Type': 'application/json' }),
          })
        }

        if (!isValidEvent(body)) {
          return new Response(
            JSON.stringify({ error: 'Missing packId, event, or timestamp' }),
            {
              status: 400,
              headers: withCors({ 'Content-Type': 'application/json' }),
            },
          )
        }

        const client = getConvexClient()
        await client.mutation(api.telemetry.append, {
          packId: body.packId,
          event: body.event,
          timestamp: body.timestamp,
          payload: body.payload,
        })

        return json(
          { ok: true },
          { status: 201, headers: withCors() },
        )
      },
    },
  },
})
