import type { ParsedSheet } from './parseCsv'

export interface RawSheet {
  name: string
  rows: string[][]
}

/** Drop fully empty rows; trim cell values. */
export function filterEmptyRows(rows: string[][]): string[][] {
  return rows
    .map((r) => r.map((c) => String(c ?? '').trim()))
    .filter((r) => r.some((cell) => cell !== ''))
}

/** Pick header row and return a parsed sheet. */
export function rawToParsedSheet(
  raw: RawSheet,
  headerRowIndex = 0,
): ParsedSheet {
  const rows = filterEmptyRows(raw.rows)
  if (rows.length === 0) {
    return { name: raw.name, headers: [], rows: [] }
  }

  const idx = Math.min(Math.max(0, headerRowIndex), rows.length - 1)
  const headers = rows[idx].map((h, i) => {
    const label = String(h ?? '').trim()
    return label || `column_${i + 1}`
  })

  const dataRows = rows.slice(idx + 1).map((r) =>
    headers.map((_, i) => String(r[i] ?? '').trim()),
  )

  return { name: raw.name, headers, rows: dataRows }
}
