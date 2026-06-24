'use node'

import { v } from 'convex/values'
import { internal } from './_generated/api'
import { action } from './_generated/server'
import { ingestFull } from './lib/ingestFull'
import { slugifyPackId } from './lib/packManifest'
import { Buffer } from 'node:buffer'
import type { IngestConfig, SchemaField } from '../../shared/manifest.types'

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

export const ingestFromUpload = action({
  args: {
    fileBase64: v.string(),
    fileName: v.string(),
    title: v.string(),
    brand: v.optional(v.string()),
    packId: v.optional(v.string()),
    schema: v.array(schemaFieldValidator),
    ingestConfig: ingestConfigValidator,
    reingestPackId: v.optional(v.string()),
    embedThreshold: v.optional(v.number()),
  },
  returns: v.object({
    packId: v.string(),
    recordCount: v.number(),
    warnings: v.array(v.string()),
  }),
  handler: async (ctx, args) => {
    const buffer = Buffer.from(args.fileBase64, 'base64')
    const arrayBuffer = buffer.buffer.slice(
      buffer.byteOffset,
      buffer.byteOffset + buffer.byteLength,
    )

    const { records, warnings } = ingestFull(
      arrayBuffer,
      args.fileName,
      args.ingestConfig as IngestConfig,
      args.schema as SchemaField[],
    )

    if (args.reingestPackId) {
      await ctx.runMutation(internal.ingest.reingestPackInternal, {
        packId: args.reingestPackId,
        records,
        warnings,
      })
      return {
        packId: args.reingestPackId,
        recordCount: records.length,
        warnings,
      }
    }

    const packId = args.packId ?? slugifyPackId(args.title)
    await ctx.runMutation(internal.ingest.createPackInternal, {
      packId,
      title: args.title,
      brand: args.brand,
      schema: args.schema,
      ingestConfig: args.ingestConfig,
      records,
      embedThreshold: args.embedThreshold,
    })

    return { packId, recordCount: records.length, warnings }
  },
})
