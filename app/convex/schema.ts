import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'
import { telemetryPayload } from './lib/telemetryPayload'

export default defineSchema({
  packs: defineTable({
    packId: v.string(),
    manifest: v.any(),
  }).index('by_packId', ['packId']),

  telemetryEvents: defineTable({
    packId: v.string(),
    event: v.union(
      v.literal('open'),
      v.literal('search'),
      v.literal('export'),
      v.literal('update'),
    ),
    timestamp: v.string(),
    payload: telemetryPayload,
  })
    .index('by_packId', ['packId'])
    .index('by_timestamp', ['timestamp']),
})
