export type NordicLang = 'sv' | 'no' | 'da' | 'fi'

export type LocalizedString = Record<NordicLang, string>

export type TelemetryEventType = 'open' | 'search' | 'export' | 'update'

export interface PackMeta {
  packId: string
  brand: string
  assortment: string
  version: string
  generatedAt: string
  staleAfter: string
  apiBase?: string
}

export interface SchemaField {
  name: string
  label: LocalizedString
  type: 'string' | 'number'
  exportable: boolean
}

export interface ProductTexts {
  name: string
  description: string
}

export interface AttributeDefinition {
  id: string
  label: LocalizedString
  exportable?: boolean
}

/** @deprecated Legacy packs used localized key objects */
export interface LegacyProductAttribute {
  key: LocalizedString
  value: string
}

export interface ProductAttribute {
  id: string
  value: string
}

export interface Product {
  sku: string
  texts: Record<NordicLang, ProductTexts>
  imageUrl: string
  attributes: ProductAttribute[]
  price: number
  stock: number
}

export interface PackManifest {
  meta: PackMeta
  schema: SchemaField[]
  attributeSchema?: AttributeDefinition[]
  products: Product[]
}

export type ExportScope = 'all' | 'filtered' | 'one'
export type ExportSource = 'catalog' | 'product'

export type ExportLayout = 'wide' | 'tall' | 'split'
export type ExportStructure = 'flat' | 'nested' | 'tall'

export interface TelemetryPayload {
  query?: string
  format?: string
  fields?: string[]
  productFields?: string[]
  attributeFields?: string[]
  layout?: ExportLayout
  structure?: ExportStructure
  productSku?: string
  language?: NordicLang
  scope?: ExportScope
  productCount?: number
  fieldCount?: number
  attributeCount?: number
  totalFields?: number
  allFieldsSelected?: boolean
  searchQuery?: string
  source?: ExportSource
  filename?: string
  catalogTotal?: number
}

export interface TelemetryEvent {
  packId: string
  event: TelemetryEventType
  timestamp: string
  payload?: TelemetryPayload
}

export interface PackRegistryEntry {
  packId: string
  assortment: string
  productCount: number
  version: string
}
