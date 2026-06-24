export type {
  NordicLang,
  TelemetryEventType,
  PackMeta,
  LegacyPackMeta,
  SchemaField,
  DataRecord,
  PackManifest,
  PackManifestV2,
  LegacyPackManifest,
  IngestConfig,
  ExportScope,
  ExportSource,
  ExportLayout,
  ExportStructure,
  TelemetryPayload,
  TelemetryEvent,
  PackRegistryEntry,
  StorageMode,
  ViewProfile,
} from '@shared/manifest.types'

export { isLegacyManifest, isV2Manifest } from '@shared/manifest.types'

export type { IngestPreview } from '@shared/ingest/previewIngest'

export interface DashboardStats {
  totalOpens: number
  totalExports: number
  totalUpdates: number
  totalEmbedViews: number
  exportsByFormat: Record<string, number>
  exportsByScope: Record<string, number>
  topExportFields: Array<{ field: string; count: number }>
  activePacks: number
}

export interface PackStats {
  packId: string
  opens: number
  exports: number
  updates: number
  embedViews: number
  lastSeen: string | null
  exportsByFormat: Record<string, number>
  exportsByScope: Record<string, number>
  topExportFields: Array<{ field: string; count: number }>
  topSearches: Array<{ query: string; count: number }>
}

export type { LegacyPackManifest } from '@shared/manifest.types'
