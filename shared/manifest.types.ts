export type NordicLang = 'sv' | 'no' | 'da' | 'fi'

export type LocalizedString = Record<NordicLang, string>

export type TelemetryEventType =
  | 'open'
  | 'search'
  | 'export'
  | 'update'
  | 'embed_view'

export type StorageMode = 'embedded' | 'remote'

export type ViewProfile = 'catalog' | 'table'

export type SchemaFieldType = 'string' | 'number' | 'boolean' | 'date' | 'url'

export type SchemaFieldRole =
  | 'id'
  | 'title'
  | 'description'
  | 'image'
  | 'price'
  | 'stock'

/** Default row count below which packs are embedded in HTML */
export const STORAGE_EMBED_THRESHOLD = 500

/** Default records per API page / Convex chunk */
export const RECORD_PAGE_SIZE = 250

// --- Legacy v1 types (Friluftsportalen demos) ---

export interface LegacyPackMeta {
  packId: string
  brand: string
  assortment: string
  version: string
  generatedAt: string
  staleAfter: string
  apiBase?: string
  contactEmail?: string
}

export interface LegacySchemaField {
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

/** @deprecated Use DataRecord in v2 manifests */
export interface Product {
  sku: string
  texts: Record<NordicLang, ProductTexts>
  imageUrl: string
  attributes: ProductAttribute[]
  price: number
  stock: number
}

export interface LegacyPackManifest {
  meta: LegacyPackMeta
  schema: LegacySchemaField[]
  attributeSchema?: AttributeDefinition[]
  products: Product[]
}

// --- Manifest v2 ---

export interface PackMeta {
  packId: string
  title: string
  brand?: string
  /** @deprecated Use title — kept for legacy compat reads */
  assortment?: string
  version: string
  generatedAt: string
  staleAfter: string
  apiBase?: string
  contactEmail?: string
  storageMode: StorageMode
  embedThreshold?: number
  recordCount: number
  primaryKey: string
  viewProfile: ViewProfile
}

export interface SchemaField {
  name: string
  label: string
  type: SchemaFieldType
  role?: SchemaFieldRole
  searchable?: boolean
  exportable?: boolean
}

export type DataRecord = Record<string, string | number | boolean | null>

export interface IngestSheetConfig {
  name: string
  joinKey: string
  fieldMap: Record<string, string>
  /** 0-based row index for column headers (after empty rows are removed) */
  headerRowIndex?: number
}

export type CsvDelimiter = ',' | ';' | '\t' | '|'

export interface IngestConfig {
  sourceType: 'csv' | 'xlsx'
  primarySheet: string
  sheets: IngestSheetConfig[]
  /** CSV field separator — auto-detected when omitted */
  csvDelimiter?: CsvDelimiter
  createdAt: string
  lastIngestedAt: string
}

export interface PackManifestV2 {
  meta: PackMeta
  schema: SchemaField[]
  records?: DataRecord[]
}

/** Union of legacy and v2 manifests as stored or embedded */
export type PackManifest = LegacyPackManifest | PackManifestV2

export function isLegacyManifest(
  manifest: PackManifest,
): manifest is LegacyPackManifest {
  return 'products' in manifest && Array.isArray(manifest.products)
}

export function isV2Manifest(manifest: PackManifest): manifest is PackManifestV2 {
  return (
    'meta' in manifest &&
    'primaryKey' in manifest.meta &&
    !('products' in manifest)
  )
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
  recordId?: string
  language?: NordicLang
  scope?: ExportScope
  productCount?: number
  recordCount?: number
  fieldCount?: number
  attributeCount?: number
  totalFields?: number
  allFieldsSelected?: boolean
  searchQuery?: string
  source?: ExportSource
  filename?: string
  catalogTotal?: number
  distributor?: string
  referer?: string
}

export interface TelemetryEvent {
  packId: string
  event: TelemetryEventType
  timestamp: string
  payload?: TelemetryPayload
}

export interface PackRegistryEntry {
  packId: string
  title: string
  /** @deprecated */
  assortment?: string
  recordCount: number
  productCount?: number
  version: string
  storageMode: StorageMode
}

export interface RecordsPage {
  records: DataRecord[]
  continueCursor: string | null
  isDone: boolean
  totalCount: number
}
