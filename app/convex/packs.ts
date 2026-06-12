import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

export const getByPackId = query({
  args: { packId: v.string() },
  returns: v.union(v.any(), v.null()),
  handler: async (ctx, args) => {
    const row = await ctx.db
      .query('packs')
      .withIndex('by_packId', (q) => q.eq('packId', args.packId))
      .unique()
    return row?.manifest ?? null
  },
})

export const list = query({
  args: {},
  returns: v.array(
    v.object({
      packId: v.string(),
      assortment: v.string(),
      productCount: v.number(),
      version: v.string(),
    }),
  ),
  handler: async (ctx) => {
    const rows = await ctx.db.query('packs').collect()
    return rows.map((row) => {
      const manifest = row.manifest as {
        meta: { assortment: string; version: string }
        products: unknown[]
      }
      return {
        packId: row.packId,
        assortment: manifest.meta.assortment,
        productCount: manifest.products.length,
        version: manifest.meta.version,
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

    const manifest = row.manifest as {
      products: Array<{ sku: string; price: number; stock: number }>
    }
    const product = manifest.products.find((p) => p.sku === args.sku)
    if (!product) throw new Error('Product not found')

    product.price = args.price
    product.stock = args.stock

    await ctx.db.patch(row._id, { manifest })
    return null
  },
})
