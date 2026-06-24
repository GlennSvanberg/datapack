import type { ParsedSheet } from './parseCsv'
import { filterEmptyRows, rawToParsedSheet, type RawSheet } from './sheetFromRows'

async function loadXlsx() {
  return import('xlsx')
}

export interface XlsxParseOptions {
  /** Per-sheet header row index (0-based in non-empty rows) */
  headerRowBySheet?: Record<string, number>
  defaultHeaderRowIndex?: number
}

export async function parseXlsxRaw(buffer: ArrayBuffer): Promise<RawSheet[]> {
  const XLSX = await loadXlsx()
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

export async function parseXlsx(
  buffer: ArrayBuffer,
  options: XlsxParseOptions = {},
): Promise<ParsedSheet[]> {
  const rawSheets = await parseXlsxRaw(buffer)
  const defaultIdx = options.defaultHeaderRowIndex ?? 0

  return rawSheets.map((raw) =>
    rawToParsedSheet(
      raw,
      options.headerRowBySheet?.[raw.name] ?? defaultIdx,
    ),
  )
}

export async function listXlsxSheetNames(buffer: ArrayBuffer): Promise<string[]> {
  const XLSX = await loadXlsx()
  const workbook = XLSX.read(buffer, { type: 'array', bookSheets: true })
  return workbook.SheetNames
}
