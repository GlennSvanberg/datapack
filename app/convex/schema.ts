import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

const telemetryPayload = v.optional(
  v.object({
    query: v.optional(v.string()),
    format: v.optional(v.string()),
    fields: v.optional(v.array(v.string())),
    productSku: v.optional(v.string()),
    language: v.optional(
      v.union(
        v.literal('sv'),
        v.literal('no'),
        v.literal('da'),
        v.literal('fi'),
      ),
    ),
  }),
)

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
