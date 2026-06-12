export type NordicLang = 'sv' | 'no' | 'da' | 'fi'

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

export interface PackManifest {
  meta: PackMeta
  schema: Array<{
    name: string
    label: Record<NordicLang, string>
    type: 'string' | 'number'
    exportable: boolean
  }>
  products: Array<{
    sku: string
    texts: Record<NordicLang, { name: string; description: string }>
    imageUrl: string
    attributes: Array<{
      key: Record<NordicLang, string>
      value: string
    }>
    price: number
    stock: number
  }>
}

export interface TelemetryPayload {
  query?: string
  format?: string
  fields?: string[]
  productSku?: string
  language?: NordicLang
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

export interface DashboardStats {
  totalOpens: number
  totalExports: number
  totalUpdates: number
  exportsByFormat: Record<string, number>
  activePacks: number
}

export interface PackStats {
  packId: string
  opens: number
  exports: number
  updates: number
  lastSeen: string | null
  exportsByFormat: Record<string, number>
  topSearches: Array<{ query: string; count: number }>
}
