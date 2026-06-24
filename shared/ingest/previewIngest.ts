import type { DataRecord, IngestConfig, SchemaField } from '../manifest.types'
import { applyMapping } from './applyMapping'
import { detectCsvDelimiter } from './detectDelimiter'
import { inferType } from './inferTypes'
import { joinSheets } from './joinSheets'
import { parseCsvRaw, type ParsedSheet } from './parseCsv'
import { parseXlsxRaw } from './parseXlsx'
import { rawToParsedSheet, type RawSheet } from './sheetFromRows'

export interface IngestPreview {
  sheets: Array<{
    name: string
    headers: string[]
    rowCount: number
    sampleRows: string[][]
    /** First rows before header selection — for UI picker */
    rawPreviewRows: string[][]
    headerRowIndex: number
  }>
  suggestedSchema: SchemaField[]
  previewRecords: DataRecord[]
  warnings: string[]
  /** Detected delimiter for CSV uploads */
  detectedCsvDelimiter?: string
}

function headerIndexForSheet(
  ingestConfig: IngestConfig | undefined,
  sheetName: string,
): number {
  return (
    ingestConfig?.sheets.find((s) => s.name === sheetName)?.headerRowIndex ?? 0
  )
}

export async function parseUploadToRawSheets(
  buffer: ArrayBuffer,
  fileName: string,
  ingestConfig?: Pick<IngestConfig, 'csvDelimiter'>,
): Promise<RawSheet[]> {
  const lower = fileName.toLowerCase()
  if (lower.endsWith('.csv')) {
    const text = new TextDecoder('utf-8').decode(buffer)
    const delimiter =
      ingestConfig?.csvDelimiter ?? detectCsvDelimiter(text.slice(0, 4096))
    const sheetName = fileName.replace(/\.csv$/i, '') || 'Sheet1'
    return [parseCsvRaw(text, sheetName, delimiter)]
  }
  if (lower.endsWith('.xlsx') || lower.endsWith('.xls')) {
    return parseXlsxRaw(buffer)
  }
  throw new Error('Unsupported file type. Use CSV or XLSX.')
}

export async function parseUploadToSheets(
  buffer: ArrayBuffer,
  fileName: string,
  ingestConfig?: IngestConfig,
): Promise<ParsedSheet[]> {
  const rawSheets = await parseUploadToRawSheets(buffer, fileName, ingestConfig)
  return rawSheets.map((raw) =>
    rawToParsedSheet(raw, headerIndexForSheet(ingestConfig, raw.name)),
  )
}

export function suggestSchemaFromSheet(sheet: ParsedSheet): SchemaField[] {
  return sheet.headers
    .filter((h) => h.trim() !== '')
    .map((header) => {
      const colIndex = sheet.headers.indexOf(header)
      const samples = sheet.rows.slice(0, 20).map((r) => r[colIndex] ?? '')
      const type = inferType(samples)
      const lower = header.toLowerCase()
      let role: SchemaField['role'] | undefined
      if (/^(sku|id|article|artikel|artno)/i.test(lower)) role = 'id'
      else if (/^(name|title|namn)/i.test(lower)) role = 'title'
      else if (/desc/i.test(lower)) role = 'description'
      else if (/image|img|url|bild/i.test(lower)) role = 'image'
      else if (/price|pris/i.test(lower)) role = 'price'
      else if (/stock|lager/i.test(lower)) role = 'stock'

      return {
        name: header
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '_')
          .replace(/^_|_$/g, '') || 'field',
        label: header.trim(),
        type,
        role,
        searchable: role === 'title' || type === 'string',
        exportable: true,
      }
    })
}

export async function previewIngest(
  buffer: ArrayBuffer,
  fileName: string,
  ingestConfig: IngestConfig,
  schema: SchemaField[],
  limit = 50,
): Promise<IngestPreview> {
  const parsed = await parseUploadToSheets(buffer, fileName, ingestConfig)
  const rawSheets = await parseUploadToRawSheets(buffer, fileName, ingestConfig)
  const warnings: string[] = []

  const sheets = parsed.map((s) => {
    const raw = rawSheets.find((r) => r.name === s.name)
    return {
      name: s.name,
      headers: s.headers,
      rowCount: s.rows.length,
      sampleRows: s.rows.slice(0, 5),
      rawPreviewRows: (raw?.rows ?? []).slice(0, 8),
      headerRowIndex: headerIndexForSheet(ingestConfig, s.name),
    }
  })

  const { rows, warnings: joinWarnings } = joinSheets(
    parsed,
    ingestConfig.sheets,
    ingestConfig.primarySheet,
  )
  warnings.push(...joinWarnings)

  const records = applyMapping(rows, ingestConfig.sheets, schema)
  const primarySheet = parsed.find((s) => s.name === ingestConfig.primarySheet)

  const lower = fileName.toLowerCase()
  let detectedCsvDelimiter: string | undefined
  if (lower.endsWith('.csv')) {
    const text = new TextDecoder('utf-8').decode(buffer)
    detectedCsvDelimiter =
      ingestConfig.csvDelimiter ?? detectCsvDelimiter(text.slice(0, 4096))
  }

  return {
    sheets,
    suggestedSchema: primarySheet
      ? suggestSchemaFromSheet(primarySheet)
      : [],
    previewRecords: records.slice(0, limit),
    warnings,
    detectedCsvDelimiter,
  }
}

export async function ingestFull(
  buffer: ArrayBuffer,
  fileName: string,
  ingestConfig: IngestConfig,
  schema: SchemaField[],
): Promise<{ records: DataRecord[]; warnings: string[] }> {
  const parsed = await parseUploadToSheets(buffer, fileName, ingestConfig)
  const { rows, warnings } = joinSheets(
    parsed,
    ingestConfig.sheets,
    ingestConfig.primarySheet,
  )
  const records = applyMapping(rows, ingestConfig.sheets, schema)
  return { records, warnings }
}
