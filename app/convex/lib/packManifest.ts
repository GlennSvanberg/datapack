import { RECORD_PAGE_SIZE } from '../../../shared/manifest.types'
import type { DataRecord, PackManifestV2 } from '../../../shared/manifest.types'
import type { Doc } from '../_generated/dataModel'
import type { QueryCtx } from '../_generated/server'

export { RECORD_PAGE_SIZE }

export function splitRecordsIntoPages(
  records: DataRecord[],
  pageSize = RECORD_PAGE_SIZE,
): DataRecord[][] {
  const pages: DataRecord[][] = []
  for (let i = 0; i < records.length; i += pageSize) {
    pages.push(records.slice(i, i + pageSize))
  }
  return pages
}

type PackRow = Doc<'packs'>

export function isV2PackRow(row: PackRow): boolean {
  return row.meta !== undefined && row.schema !== undefined
}

/** Assemble API manifest from pack row (+ optional embedded records) */
export function assembleManifest(
  row: PackRow,
  records?: DataRecord[],
): PackManifestV2 | Record<string, unknown> {
  if (isV2PackRow(row)) {
    const manifest: PackManifestV2 = {
      meta: row.meta as PackManifestV2['meta'],
      schema: row.schema as PackManifestV2['schema'],
    }
    if (records && records.length > 0) {
      manifest.records = records
    } else if (
      row.meta &&
      typeof row.meta === 'object' &&
      'storageMode' in row.meta &&
      row.meta.storageMode === 'embedded' &&
      row.embeddedRecords
    ) {
      manifest.records = row.embeddedRecords as DataRecord[]
    }
    return manifest
  }

  return row.manifest as Record<string, unknown>
}

export async function loadAllRecords(
  ctx: QueryCtx,
  packId: string,
): Promise<DataRecord[]> {
  const pages = await ctx.db
    .query('packRecordPages')
    .withIndex('by_packId_page', (q) => q.eq('packId', packId))
    .collect()

  pages.sort((a, b) => a.pageIndex - b.pageIndex)
  const records: DataRecord[] = []
  for (const page of pages) {
    records.push(...(page.records as DataRecord[]))
  }
  return records
}

export async function loadRecordPage(
  ctx: QueryCtx,
  packId: string,
  pageIndex: number,
): Promise<DataRecord[]> {
  const page = await ctx.db
    .query('packRecordPages')
    .withIndex('by_packId_page', (q) =>
      q.eq('packId', packId).eq('pageIndex', pageIndex),
    )
    .unique()
  return (page?.records as DataRecord[]) ?? []
}

export function slugifyPackId(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48)
  const suffix = Math.random().toString(36).slice(2, 8)
  return `${base || 'pack'}-${suffix}`
}
