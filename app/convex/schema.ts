import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'
import { telemetryPayload } from './lib/telemetryPayload'

export default defineSchema({
  packs: defineTable({
    packId: v.string(),
    /** v2: split storage */
    meta: v.optional(v.any()),
    schema: v.optional(v.any()),
    ingestConfig: v.optional(v.any()),
    embeddedRecords: v.optional(v.any()),
    /** Legacy seed packs — full manifest blob */
    manifest: v.optional(v.any()),
  }).index('by_packId', ['packId']),

  packRecordPages: defineTable({
    packId: v.string(),
    pageIndex: v.number(),
    records: v.array(v.any()),
  }).index('by_packId_page', ['packId', 'pageIndex']),

  telemetryEvents: defineTable({
    packId: v.string(),
    event: v.union(
      v.literal('open'),
      v.literal('search'),
      v.literal('export'),
      v.literal('update'),
      v.literal('embed_view'),
    ),
    timestamp: v.string(),
    payload: telemetryPayload,
  })
    .index('by_packId', ['packId'])
    .index('by_timestamp', ['timestamp']),
})
