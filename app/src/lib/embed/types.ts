import type { NordicLang } from '@shared/manifest.types'

/** Flat product shape returned by Convex `packs.getProductForEmbed`. */
export interface EmbedProductAttribute {
  label: string
  value: string
}

export interface EmbedProduct {
  packId: string
  sku: string
  name: string
  description: string
  imageUrl: string
  price: number
  stock: number
  inStock: boolean
  attributes: EmbedProductAttribute[]
  /** Pack manifest version — used for `data-fp-version` cache busting. */
  version: string
}

export interface RenderProductEmbedOptions {
  lang?: NordicLang
  distributor?: string
}
