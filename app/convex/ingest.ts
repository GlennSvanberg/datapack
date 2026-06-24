import { v } from 'convex/values'
import { internal } from './_generated/api'
import { internalMutation, mutation } from './_generated/server'
import {
  isV2PackRow,
  slugifyPackId,
  splitRecordsIntoPages,
} from './lib/packManifest'
import { STORAGE_EMBED_THRESHOLD } from '../../shared/manifest.types'
import {
  inferStorageMode,
  inferViewProfile,
  validateManifest,
} from '../../shared/manifest.validate'
import type {
  DataRecord,
  IngestConfig,
  PackMeta,
  SchemaField,
} from '../../shared/manifest.types'

const schemaFieldValidator = v.object({
  name: v.string(),
  label: v.string(),
  type: v.union(
    v.literal('string'),
    v.literal('number'),
    v.literal('boolean'),
    v.literal('date'),
    v.literal('url'),
  ),
  role: v.optional(
    v.union(
      v.literal('id'),
      v.literal('title'),
      v.literal('description'),
      v.literal('image'),
      v.literal('price'),
      v.literal('stock'),
    ),
  ),
  searchable: v.optional(v.boolean()),
  exportable: v.optional(v.boolean()),
})

const ingestConfigValidator = v.object({
  sourceType: v.union(v.literal('csv'), v.literal('xlsx')),
  primarySheet: v.string(),
  sheets: v.array(
    v.object({
      name: v.string(),
      joinKey: v.string(),
      fieldMap: v.record(v.string(), v.string()),
      headerRowIndex: v.optional(v.number()),
    }),
  ),
  csvDelimiter: v.optional(
    v.union(v.literal(','), v.literal(';'), v.literal('\t'), v.literal('|')),
  ),
  createdAt: v.string(),
  lastIngestedAt: v.string(),
})

export const replacePackRecords = internalMutation({
  args: {
    packId: v.string(),
    pages: v.array(
      v.object({
        pageIndex: v.number(),
        records: v.array(v.any()),
      }),
    ),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('packRecordPages')
      .withIndex('by_packId_page', (q) => q.eq('packId', args.packId))
      .collect()

    for (const page of existing) {
      await ctx.db.delete(page._id)
    }

    for (const page of args.pages) {
      await ctx.db.insert('packRecordPages', {
        packId: args.packId,
        pageIndex: page.pageIndex,
        records: page.records,
      })
    }

    return null
  },
})

function resolvePrimaryKey(schema: SchemaField[]): string {
  const idField = schema.find((f) => f.role === 'id')
  return idField?.name ?? schema[0]?.name ?? 'id'
}

function buildMeta(
  packId: string,
  title: string,
  brand: string | undefined,
  version: string,
  recordCount: number,
  primaryKey: string,
  schema: SchemaField[],
  embedThreshold: number,
): PackMeta {
  const now = new Date().toISOString()
  const stale = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  const storageMode = inferStorageMode(recordCount, embedThreshold)

  return {
    packId,
    title,
    brand,
    version,
    generatedAt: now,
    staleAfter: stale,
    storageMode,
    embedThreshold,
    recordCount,
    primaryKey,
    viewProfile: inferViewProfile(schema),
  }
}

export const createPackInternal = internalMutation({
  args: {
    packId: v.string(),
    title: v.string(),
    brand: v.optional(v.string()),
    schema: v.array(schemaFieldValidator),
    ingestConfig: ingestConfigValidator,
    records: v.array(v.any()),
    embedThreshold: v.optional(v.number()),
  },
  returns: v.string(),
  handler: async (ctx, args) => {
    const embedThreshold = args.embedThreshold ?? STORAGE_EMBED_THRESHOLD
    const primaryKey = resolvePrimaryKey(args.schema as SchemaField[])
    const meta = buildMeta(
      args.packId,
      args.title,
      args.brand,
      '1.0.0',
      args.records.length,
      primaryKey,
      args.schema as SchemaField[],
      embedThreshold,
    )

    const manifest = {
      meta,
      schema: args.schema,
      records:
        meta.storageMode === 'embedded'
          ? (args.records as DataRecord[])
          : undefined,
    }

    const validation = validateManifest(manifest as Parameters<typeof validateManifest>[0])
    if (!validation.valid) {
      throw new Error(validation.errors.join('; '))
    }

    const existing = await ctx.db
      .query('packs')
      .withIndex('by_packId', (q) => q.eq('packId', args.packId))
      .unique()
    if (existing) {
      throw new Error(`Pack already exists: ${args.packId}`)
    }

    await ctx.db.insert('packs', {
      packId: args.packId,
      meta,
      schema: args.schema,
      ingestConfig: args.ingestConfig,
      embeddedRecords:
        meta.storageMode === 'embedded' ? args.records : undefined,
    })

    if (meta.storageMode === 'remote') {
      const pages = splitRecordsIntoPages(args.records as DataRecord[])
      await ctx.runMutation(internal.ingest.replacePackRecords, {
        packId: args.packId,
        pages: pages.map((records, pageIndex) => ({ pageIndex, records })),
      })
    }

    return args.packId
  },
})

export const reingestPackInternal = internalMutation({
  args: {
    packId: v.string(),
    records: v.array(v.any()),
    warnings: v.optional(v.array(v.string())),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const row = await ctx.db
      .query('packs')
      .withIndex('by_packId', (q) => q.eq('packId', args.packId))
      .unique()
    if (!row || !isV2PackRow(row)) {
      throw new Error('Pack not found or not a v2 pack')
    }

    const meta = row.meta as PackMeta
    const embedThreshold = meta.embedThreshold ?? STORAGE_EMBED_THRESHOLD
    const storageMode = inferStorageMode(args.records.length, embedThreshold)
    const schema = row.schema as SchemaField[]

    const versionParts = meta.version.split('.')
    const patch = parseInt(versionParts[2] ?? '0', 10) + 1
    const newVersion = `${versionParts[0]}.${versionParts[1]}.${patch}`

    const updatedMeta: PackMeta = {
      ...meta,
      version: newVersion,
      generatedAt: new Date().toISOString(),
      recordCount: args.records.length,
      storageMode,
      viewProfile: inferViewProfile(schema),
    }

    const ingestConfig = row.ingestConfig as IngestConfig
    if (ingestConfig) {
      ingestConfig.lastIngestedAt = new Date().toISOString()
    }

    await ctx.db.patch(row._id, {
      meta: updatedMeta,
      ingestConfig,
      embeddedRecords:
        storageMode === 'embedded' ? args.records : undefined,
    })

    const pages = splitRecordsIntoPages(args.records as DataRecord[])
    await ctx.runMutation(internal.ingest.replacePackRecords, {
      packId: args.packId,
      pages: pages.map((records, pageIndex) => ({ pageIndex, records })),
    })

    return null
  },
})

export const createPack = mutation({
  args: {
    title: v.string(),
    brand: v.optional(v.string()),
    packId: v.optional(v.string()),
    schema: v.array(schemaFieldValidator),
    ingestConfig: ingestConfigValidator,
    records: v.array(v.any()),
    embedThreshold: v.optional(v.number()),
  },
  returns: v.string(),
  handler: async (ctx, args): Promise<string> => {
    const packId = args.packId ?? slugifyPackId(args.title)
    return await ctx.runMutation(internal.ingest.createPackInternal, {
      packId,
      title: args.title,
      brand: args.brand,
      schema: args.schema,
      ingestConfig: args.ingestConfig,
      records: args.records,
      embedThreshold: args.embedThreshold,
    })
  },
})

export const reingestPack = mutation({
  args: {
    packId: v.string(),
    records: v.array(v.any()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.runMutation(internal.ingest.reingestPackInternal, {
      packId: args.packId,
      records: args.records,
    })
    return null
  },
})
