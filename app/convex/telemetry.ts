import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import {
  buildExportsByFormat,
  buildExportsByScope,
  buildPackStats,
  buildTopExportFields,
  countByEvent,
} from './lib/aggregates'
import { telemetryPayload } from './lib/telemetryPayload'

const eventValidator = v.union(
  v.literal('open'),
  v.literal('search'),
  v.literal('export'),
  v.literal('update'),
)

export const append = mutation({
  args: {
    packId: v.string(),
    event: eventValidator,
    timestamp: v.string(),
    payload: telemetryPayload,
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.insert('telemetryEvents', {
      packId: args.packId,
      event: args.event,
      timestamp: args.timestamp,
      payload: args.payload,
    })
    return null
  },
})

export const recent = query({
  args: {
    packId: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  returns: v.array(
    v.object({
      packId: v.string(),
      event: eventValidator,
      timestamp: v.string(),
      payload: telemetryPayload,
    }),
  ),
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50
    const events = args.packId
      ? await ctx.db
          .query('telemetryEvents')
          .withIndex('by_packId', (q) => q.eq('packId', args.packId!))
          .collect()
      : await ctx.db.query('telemetryEvents').collect()

    return events
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
      .slice(0, limit)
      .map(({ packId, event, timestamp, payload }) => ({
        packId,
        event,
        timestamp,
        payload,
      }))
  },
})

export const dashboardStats = query({
  args: {},
  returns: v.object({
    totalOpens: v.number(),
    totalExports: v.number(),
    totalUpdates: v.number(),
    exportsByFormat: v.record(v.string(), v.number()),
    exportsByScope: v.record(v.string(), v.number()),
    topExportFields: v.array(
      v.object({
        field: v.string(),
        count: v.number(),
      }),
    ),
    activePacks: v.number(),
  }),
  handler: async (ctx) => {
    const events = await ctx.db.query('telemetryEvents').collect()
    const packIds = new Set(events.map((e) => e.packId))

    return {
      totalOpens: countByEvent(events, 'open'),
      totalExports: countByEvent(events, 'export'),
      totalUpdates: countByEvent(events, 'update'),
      exportsByFormat: buildExportsByFormat(events),
      exportsByScope: buildExportsByScope(events),
      topExportFields: buildTopExportFields(events),
      activePacks: packIds.size,
    }
  },
})

export const packStats = query({
  args: { packId: v.string() },
  returns: v.object({
    packId: v.string(),
    opens: v.number(),
    exports: v.number(),
    updates: v.number(),
    lastSeen: v.union(v.string(), v.null()),
    exportsByFormat: v.record(v.string(), v.number()),
    exportsByScope: v.record(v.string(), v.number()),
    topExportFields: v.array(
      v.object({
        field: v.string(),
        count: v.number(),
      }),
    ),
    topSearches: v.array(
      v.object({
        query: v.string(),
        count: v.number(),
      }),
    ),
  }),
  handler: async (ctx, args) => {
    const events = await ctx.db
      .query('telemetryEvents')
      .withIndex('by_packId', (q) => q.eq('packId', args.packId))
      .collect()

    return buildPackStats(args.packId, events)
  },
})
