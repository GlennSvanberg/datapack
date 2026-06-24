import { v } from 'convex/values'

export const exportScopeValidator = v.union(
  v.literal('all'),
  v.literal('filtered'),
  v.literal('one'),
)

export const exportSourceValidator = v.union(
  v.literal('catalog'),
  v.literal('product'),
)

export const telemetryPayload = v.optional(
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
    scope: v.optional(exportScopeValidator),
    productCount: v.optional(v.number()),
    fieldCount: v.optional(v.number()),
    totalFields: v.optional(v.number()),
    allFieldsSelected: v.optional(v.boolean()),
    searchQuery: v.optional(v.string()),
    source: v.optional(exportSourceValidator),
    filename: v.optional(v.string()),
    catalogTotal: v.optional(v.number()),
    distributor: v.optional(v.string()),
    referer: v.optional(v.string()),
  }),
)
