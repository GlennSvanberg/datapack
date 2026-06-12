import { v } from 'convex/values'
import { internalMutation, mutation } from './_generated/server'
import { internal } from './_generated/api'
import { SEED_EVENTS, SEED_PACKS } from './seedFixtures'

export const seedFromFiles = internalMutation({
  args: { force: v.optional(v.boolean()) },
  returns: v.object({
    packsInserted: v.number(),
    eventsInserted: v.number(),
    skipped: v.boolean(),
  }),
  handler: async (ctx, args) => {
    const existing = await ctx.db.query('packs').first()
    if (existing && !args.force) {
      return { packsInserted: 0, eventsInserted: 0, skipped: true }
    }

    if (args.force) {
      const packRows = await ctx.db.query('packs').collect()
      for (const row of packRows) {
        await ctx.db.delete(row._id)
      }
      const eventRows = await ctx.db.query('telemetryEvents').collect()
      for (const row of eventRows) {
        await ctx.db.delete(row._id)
      }
    }

    for (const { packId, manifest } of SEED_PACKS) {
      await ctx.db.insert('packs', { packId, manifest })
    }

    for (const event of SEED_EVENTS) {
      await ctx.db.insert('telemetryEvents', {
        packId: event.packId,
        event: event.event,
        timestamp: event.timestamp,
        payload:
          'payload' in event && event.payload
            ? {
                ...event.payload,
                fields: event.payload.fields
                  ? [...event.payload.fields]
                  : undefined,
              }
            : undefined,
      })
    }

    return {
      packsInserted: SEED_PACKS.length,
      eventsInserted: SEED_EVENTS.length,
      skipped: false,
    }
  },
})

/** Public entry point for `npx convex run seed:runSeed` */
export const runSeed = mutation({
  args: { force: v.optional(v.boolean()) },
  returns: v.object({
    packsInserted: v.number(),
    eventsInserted: v.number(),
    skipped: v.boolean(),
  }),
  handler: async (ctx, args): Promise<{
    packsInserted: number
    eventsInserted: number
    skipped: boolean
  }> => {
    return await ctx.runMutation(internal.seed.seedFromFiles, {
      force: args.force,
    })
  },
})
