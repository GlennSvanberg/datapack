import * as XLSX from 'xlsx'
import type { DataRecord, IngestConfig, SchemaField } from '../../../shared/manifest.types'
import { applyMapping } from '../../../shared/ingest/applyMapping'
import { detectCsvDelimiter } from '../../../shared/ingest/detectDelimiter'
import { joinSheets } from '../../../shared/ingest/joinSheets'
import { parseCsvRaw } from '../../../shared/ingest/parseCsv'
import {
  filterEmptyRows,
  rawToParsedSheet,
  type RawSheet,
} from '../../../shared/ingest/sheetFromRows'
import type { ParsedSheet } from '../../../shared/ingest/parseCsv'

function parseXlsxRaw(buffer: ArrayBuffer): RawSheet[] {
  const workbook = XLSX.read(buffer, { type: 'array' })
  const sheets: RawSheet[] = []

  for (const name of workbook.SheetNames) {
    const worksheet = workbook.Sheets[name]
    const raw: string[][] = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: '',
      raw: false,
    }) as string[][]

    sheets.push({ name, rows: filterEmptyRows(raw) })
  }

  return sheets
}

function headerIndexForSheet(ingestConfig: IngestConfig, sheetName: string): number {
  return (
    ingestConfig.sheets.find((s) => s.name === sheetName)?.headerRowIndex ?? 0
  )
}

function parseUploadToSheets(
  buffer: ArrayBuffer,
  fileName: string,
  ingestConfig: IngestConfig,
): ParsedSheet[] {
  const lower = fileName.toLowerCase()
  let rawSheets: RawSheet[]

  if (lower.endsWith('.csv')) {
    const text = new TextDecoder('utf-8').decode(buffer)
    const delimiter =
      ingestConfig.csvDelimiter ?? detectCsvDelimiter(text.slice(0, 4096))
    const sheetName = fileName.replace(/\.csv$/i, '') || 'Sheet1'
    rawSheets = [parseCsvRaw(text, sheetName, delimiter)]
  } else if (lower.endsWith('.xlsx') || lower.endsWith('.xls')) {
    rawSheets = parseXlsxRaw(buffer)
  } else {
    throw new Error('Unsupported file type. Use CSV or XLSX.')
  }

  return rawSheets.map((raw) =>
    rawToParsedSheet(raw, headerIndexForSheet(ingestConfig, raw.name)),
  )
}

export function ingestFull(
  buffer: ArrayBuffer,
  fileName: string,
  ingestConfig: IngestConfig,
  schema: SchemaField[],
): { records: DataRecord[]; warnings: string[] } {
  const parsed = parseUploadToSheets(buffer, fileName, ingestConfig)
  const { rows, warnings } = joinSheets(
    parsed,
    ingestConfig.sheets,
    ingestConfig.primarySheet,
  )
  const records = applyMapping(rows, ingestConfig.sheets, schema)
  return { records, warnings }
}
