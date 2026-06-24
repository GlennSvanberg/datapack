import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import type { Doc } from './_generated/dataModel'
import type { MutationCtx, QueryCtx } from './_generated/server'
import {
  assembleManifest,
  isV2PackRow,
  loadAllRecords,
  loadRecordPage,
  RECORD_PAGE_SIZE,
} from './lib/packManifest'
import type {
  DataRecord,
  LegacyPackMeta,
  NordicLang,
  PackMeta,
  Product,
  SchemaField,
} from '../../shared/manifest.types'

const nordicLangValidator = v.union(
  v.literal('sv'),
  v.literal('no'),
  v.literal('da'),
  v.literal('fi'),
)

const embedProductValidator = v.object({
  packId: v.string(),
  sku: v.string(),
  name: v.string(),
  description: v.string(),
  imageUrl: v.string(),
  price: v.number(),
  stock: v.number(),
  inStock: v.boolean(),
  attributes: v.array(
    v.object({
      label: v.string(),
      value: v.string(),
    }),
  ),
  brand: v.string(),
  assortment: v.string(),
  version: v.string(),
})

const STANDARD_ROLES = new Set([
  'id',
  'title',
  'description',
  'image',
  'price',
  'stock',
])

function fieldNameByRole(
  schema: SchemaField[],
  role: SchemaField['role'],
): string | undefined {
  return schema.find((field) => field.role === role)?.name
}

function findRecordBySku(
  records: DataRecord[],
  sku: string,
  primaryKey: string,
): DataRecord | undefined {
  return records.find(
    (record) =>
      record.sku === sku ||
      String(record[primaryKey] ?? '') === sku ||
      String(record.sku ?? '') === sku,
  )
}

function legacyProductToEmbed(
  packId: string,
  product: Product,
  meta: LegacyPackMeta,
  lang: NordicLang,
) {
  const texts =
    product.texts[lang] ??
    product.texts.sv ??
    ({ name: '', description: '' } as Product['texts'][NordicLang])

  const attributes = (product.attributes ?? []).map((attr) => {
    const legacyAttr = attr as Product['attributes'][number] & {
      key?: Record<NordicLang, string>
    }
    const label =
      legacyAttr.key?.[lang] ??
      legacyAttr.key?.sv ??
      legacyAttr.id ??
      'attr'
    return {
      label: String(label),
      value: String(legacyAttr.value ?? ''),
    }
  })

  return {
    packId,
    sku: product.sku,
    name: texts.name,
    description: texts.description,
    imageUrl: product.imageUrl ?? '',
    price: product.price,
    stock: product.stock,
    inStock: product.stock > 0,
    attributes,
    brand: meta.brand ?? '',
    assortment: meta.assortment ?? '',
    version: meta.version,
  }
}

function v2RecordToEmbed(
  packId: string,
  record: DataRecord,
  meta: PackMeta,
  schema: SchemaField[],
  lang: NordicLang,
) {
  const primaryKey = meta.primaryKey ?? 'sku'
  const sku = String(record.sku ?? record[primaryKey] ?? '')

  const titleField = fieldNameByRole(schema, 'title') ?? 'name'
  const descriptionField =
    fieldNameByRole(schema, 'description') ?? 'description'
  const imageField = fieldNameByRole(schema, 'image') ?? 'imageUrl'
  const priceField = fieldNameByRole(schema, 'price') ?? 'price'
  const stockField = fieldNameByRole(schema, 'stock') ?? 'stock'

  const standardFields = new Set(
    [
      primaryKey,
      'sku',
      titleField,
      descriptionField,
      imageField,
      priceField,
      stockField,
    ].filter(Boolean),
  )

  const attributes = schema
    .filter((field) => !field.role || !STANDARD_ROLES.has(field.role))
    .filter((field) => !standardFields.has(field.name))
    .map((field) => ({
      label: field.label || field.name,
      value: String(record[field.name] ?? ''),
    }))
    .filter((attr) => attr.value !== '')

  const stock = Number(record[stockField] ?? 0)

  return {
    packId,
    sku,
    name: String(record[titleField] ?? ''),
    description: String(record[descriptionField] ?? ''),
    imageUrl: String(record[imageField] ?? ''),
    price: Number(record[priceField] ?? 0),
    stock,
    inStock: stock > 0,
    attributes,
    brand: meta.brand ?? '',
    assortment: meta.assortment ?? meta.title ?? '',
    version: meta.version,
  }
}

async function loadV2Records(
  ctx: QueryCtx,
  packId: string,
  row: Doc<'packs'>,
): Promise<DataRecord[]> {
  const meta = row.meta as PackMeta
  if (meta.storageMode === 'embedded') {
    return (
      (row.embeddedRecords as DataRecord[] | undefined) ??
      (await loadAllRecords(ctx, packId))
    )
  }

  return loadAllRecords(ctx, packId)
}

async function updateV2RecordFields(
  ctx: MutationCtx,
  packId: string,
  row: Doc<'packs'>,
  sku: string,
  fields: Record<string, string | number | boolean | null>,
): Promise<void> {
  const meta = row.meta as PackMeta
  const primaryKey = meta.primaryKey ?? 'sku'

  if (meta.storageMode === 'embedded') {
    const records =
      (row.embeddedRecords as DataRecord[] | undefined) ??
      (await loadAllRecords(ctx, packId))
    const record = findRecordBySku(records, sku, primaryKey)
    if (!record) throw new Error('Record not found')

    Object.assign(record, fields)
    await ctx.db.patch(row._id, { embeddedRecords: records })
    return
  }

  const pages = await ctx.db
    .query('packRecordPages')
    .withIndex('by_packId_page', (q) => q.eq('packId', packId))
    .collect()

  for (const page of pages) {
    const records = page.records as DataRecord[]
    const record = findRecordBySku(records, sku, primaryKey)
    if (!record) continue

    Object.assign(record, fields)
    await ctx.db.patch(page._id, { records })
    return
  }

  throw new Error('Record not found')
}

export const getByPackId = query({
  args: { packId: v.string() },
  returns: v.union(v.any(), v.null()),
  handler: async (ctx, args) => {
    const row = await ctx.db
      .query('packs')
      .withIndex('by_packId', (q) => q.eq('packId', args.packId))
      .unique()
    if (!row) return null

    if (isV2PackRow(row)) {
      const meta = row.meta as PackMeta
      if (meta.storageMode === 'embedded') {
        const records =
          (row.embeddedRecords as unknown[]) ??
          (await loadAllRecords(ctx, args.packId))
        return assembleManifest(row, records as Parameters<typeof assembleManifest>[1])
      }
      return assembleManifest(row)
    }

    return row.manifest ?? null
  },
})

export const getProductForEmbed = query({
  args: {
    packId: v.string(),
    sku: v.string(),
    lang: v.optional(nordicLangValidator),
  },
  returns: v.union(embedProductValidator, v.null()),
  handler: async (ctx, args) => {
    const lang = (args.lang ?? 'sv') as NordicLang
    const row = await ctx.db
      .query('packs')
      .withIndex('by_packId', (q) => q.eq('packId', args.packId))
      .unique()
    if (!row) return null

    if (isV2PackRow(row)) {
      const meta = row.meta as PackMeta
      const schema = row.schema as SchemaField[]
      const primaryKey = meta.primaryKey ?? 'sku'
      const records = await loadV2Records(ctx, args.packId, row)
      const record = findRecordBySku(records, args.sku, primaryKey)
      if (!record) return null

      return v2RecordToEmbed(args.packId, record, meta, schema, lang)
    }

    const manifest = row.manifest as {
      meta: LegacyPackMeta
      products: Product[]
    } | null
    if (!manifest?.products) return null

    const product = manifest.products.find((p) => p.sku === args.sku)
    if (!product) return null

    return legacyProductToEmbed(args.packId, product, manifest.meta, lang)
  },
})

export const getIngestConfig = query({
  args: { packId: v.string() },
  returns: v.union(v.any(), v.null()),
  handler: async (ctx, args) => {
    const row = await ctx.db
      .query('packs')
      .withIndex('by_packId', (q) => q.eq('packId', args.packId))
      .unique()
    return row?.ingestConfig ?? null
  },
})

export const getRecordsPage = query({
  args: {
    packId: v.string(),
    cursor: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  returns: v.object({
    records: v.array(v.any()),
    continueCursor: v.union(v.string(), v.null()),
    isDone: v.boolean(),
    totalCount: v.number(),
  }),
  handler: async (ctx, args) => {
    const row = await ctx.db
      .query('packs')
      .withIndex('by_packId', (q) => q.eq('packId', args.packId))
      .unique()
    if (!row) {
      return { records: [], continueCursor: null, isDone: true, totalCount: 0 }
    }

    const meta = isV2PackRow(row) ? (row.meta as PackMeta) : null
    const totalCount =
      meta?.recordCount ??
      (row.manifest as { products?: unknown[] })?.products?.length ??
      0

    if (meta?.storageMode === 'embedded') {
      const records =
        (row.embeddedRecords as unknown[]) ??
        (await loadAllRecords(ctx, args.packId))
      return {
        records: records as unknown[],
        continueCursor: null,
        isDone: true,
        totalCount,
      }
    }

    const pageIndex = args.cursor ?? 0
    const limit = args.limit ?? RECORD_PAGE_SIZE
    const pageRecords = await loadRecordPage(ctx, args.packId, pageIndex)

    const totalPages = Math.ceil(totalCount / RECORD_PAGE_SIZE)
    const nextPage = pageIndex + 1
    const isDone = nextPage >= totalPages || pageRecords.length === 0

    return {
      records: pageRecords.slice(0, limit),
      continueCursor: isDone ? null : String(nextPage),
      isDone,
      totalCount,
    }
  },
})

export const list = query({
  args: {},
  returns: v.array(
    v.object({
      packId: v.string(),
      title: v.string(),
      assortment: v.optional(v.string()),
      recordCount: v.number(),
      productCount: v.optional(v.number()),
      version: v.string(),
      storageMode: v.union(v.literal('embedded'), v.literal('remote')),
    }),
  ),
  handler: async (ctx) => {
    const rows = await ctx.db.query('packs').collect()
    return rows.map((row) => {
      if (isV2PackRow(row)) {
        const meta = row.meta as PackMeta
        return {
          packId: row.packId,
          title: meta.title,
          assortment: meta.assortment,
          recordCount: meta.recordCount,
          version: meta.version,
          storageMode: meta.storageMode,
        }
      }

      const manifest = row.manifest as {
        meta: { assortment: string; version: string }
        products: unknown[]
      }
      return {
        packId: row.packId,
        title: manifest.meta.assortment,
        assortment: manifest.meta.assortment,
        recordCount: manifest.products.length,
        productCount: manifest.products.length,
        version: manifest.meta.version,
        storageMode: 'embedded' as const,
      }
    })
  },
})

export const updateMeta = mutation({
  args: {
    packId: v.string(),
    version: v.string(),
    generatedAt: v.string(),
    staleAfter: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const row = await ctx.db
      .query('packs')
      .withIndex('by_packId', (q) => q.eq('packId', args.packId))
      .unique()
    if (!row) throw new Error('Pack not found')

    if (isV2PackRow(row)) {
      const meta = row.meta as PackMeta
      meta.version = args.version
      meta.generatedAt = args.generatedAt
      meta.staleAfter = args.staleAfter
      await ctx.db.patch(row._id, { meta })
      return null
    }

    const manifest = row.manifest as {
      meta: {
        version: string
        generatedAt: string
        staleAfter: string
      }
    }
    manifest.meta.version = args.version
    manifest.meta.generatedAt = args.generatedAt
    manifest.meta.staleAfter = args.staleAfter

    await ctx.db.patch(row._id, { manifest })
    return null
  },
})

export const updateProduct = mutation({
  args: {
    packId: v.string(),
    sku: v.string(),
    price: v.number(),
    stock: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const row = await ctx.db
      .query('packs')
      .withIndex('by_packId', (q) => q.eq('packId', args.packId))
      .unique()
    if (!row) throw new Error('Pack not found')

    if (isV2PackRow(row)) {
      throw new Error('Use updateRecord for v2 packs')
    }

    if (!row.manifest) {
      throw new Error('Legacy manifest not found')
    }

    const manifest = row.manifest as {
      products: Array<{ sku: string; price: number; stock: number }>
    }
    if (!Array.isArray(manifest.products)) {
      throw new Error('Legacy manifest has no products')
    }

    const product = manifest.products.find((p) => p.sku === args.sku)
    if (!product) throw new Error('Product not found')

    product.price = args.price
    product.stock = args.stock

    await ctx.db.patch(row._id, { manifest })
    return null
  },
})

export const updateRecord = mutation({
  args: {
    packId: v.string(),
    sku: v.string(),
    fields: v.object({
      price: v.optional(v.number()),
      stock: v.optional(v.number()),
    }),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const row = await ctx.db
      .query('packs')
      .withIndex('by_packId', (q) => q.eq('packId', args.packId))
      .unique()
    if (!row) throw new Error('Pack not found')

    if (!isV2PackRow(row)) {
      throw new Error('Use updateProduct for legacy packs')
    }

    const updates: Record<string, string | number | boolean | null> = {}
    if (args.fields.price !== undefined) {
      updates.price = args.fields.price
    }
    if (args.fields.stock !== undefined) {
      updates.stock = args.fields.stock
    }
    if (Object.keys(updates).length === 0) {
      throw new Error('No fields to update')
    }

    const schema = row.schema as SchemaField[]
    const priceField = fieldNameByRole(schema, 'price')
    const stockField = fieldNameByRole(schema, 'stock')

    const mappedUpdates: Record<string, string | number | boolean | null> = {}
    if (updates.price !== undefined) {
      mappedUpdates[priceField ?? 'price'] = updates.price
    }
    if (updates.stock !== undefined) {
      mappedUpdates[stockField ?? 'stock'] = updates.stock
    }

    await updateV2RecordFields(
      ctx,
      args.packId,
      row,
      args.sku,
      mappedUpdates,
    )
    return null
  },
})
