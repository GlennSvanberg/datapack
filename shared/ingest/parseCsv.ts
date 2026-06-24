import { detectCsvDelimiter } from './detectDelimiter'
import { filterEmptyRows, rawToParsedSheet, type RawSheet } from './sheetFromRows'

export interface ParsedSheet {
  name: string
  headers: string[]
  rows: string[][]
}

export interface CsvParseOptions {
  delimiter?: string
  headerRowIndex?: number
}

/** Parse CSV text into raw rows (no header assumption). */
export function parseCsvRaw(
  text: string,
  sheetName = 'Sheet1',
  delimiter = ',',
): RawSheet {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    const next = text[i + 1]

    if (inQuotes) {
      if (c === '"' && next === '"') {
        field += '"'
        i++
      } else if (c === '"') {
        inQuotes = false
      } else {
        field += c
      }
      continue
    }

    if (c === '"') {
      inQuotes = true
    } else if (c === delimiter) {
      row.push(field)
      field = ''
    } else if (c === '\r' && next === '\n') {
      row.push(field)
      rows.push(row)
      row = []
      field = ''
      i++
    } else if (c === '\n' || c === '\r') {
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else {
      field += c
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field)
    rows.push(row)
  }

  return { name: sheetName, rows: filterEmptyRows(rows) }
}

/** Parse CSV text into a single sheet (name = filename or "Sheet1") */
export function parseCsv(
  text: string,
  sheetName = 'Sheet1',
  options: CsvParseOptions = {},
): ParsedSheet {
  const delimiter =
    options.delimiter ?? detectCsvDelimiter(text.slice(0, 4096))
  const raw = parseCsvRaw(text, sheetName, delimiter)
  return rawToParsedSheet(raw, options.headerRowIndex ?? 0)
}
