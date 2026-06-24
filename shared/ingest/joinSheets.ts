import type { IngestSheetConfig } from '../manifest.types'
import type { ParsedSheet } from './parseCsv'

export interface JoinedRow {
  [column: string]: string
}

export interface JoinResult {
  rows: JoinedRow[]
  warnings: string[]
}

function sheetByName(sheets: ParsedSheet[], name: string): ParsedSheet | undefined {
  return sheets.find((s) => s.name === name)
}

function rowsToMaps(
  sheet: ParsedSheet,
  joinKey: string,
): { maps: Map<string, JoinedRow>; warnings: string[] } {
  const warnings: string[] = []
  const keyIndex = sheet.headers.indexOf(joinKey)
  if (keyIndex === -1) {
    throw new Error(`Join key "${joinKey}" not found in sheet "${sheet.name}"`)
  }

  const maps = new Map<string, JoinedRow>()
  for (const row of sheet.rows) {
    const key = row[keyIndex]?.trim()
    if (!key) continue

    const record: JoinedRow = {}
    for (let i = 0; i < sheet.headers.length; i++) {
      const header = sheet.headers[i]
      if (header) record[`${sheet.name}.${header}`] = row[i] ?? ''
      record[header] = row[i] ?? ''
    }

    if (maps.has(key)) {
      warnings.push(
        `Duplicate join key "${key}" in sheet "${sheet.name}" — last row wins`,
      )
    }
    maps.set(key, record)
  }

  return { maps, warnings }
}

/**
 * Left-join sheets on configured join keys.
 * Primary sheet defines the record set; secondary sheets merge columns.
 */
export function joinSheets(
  sheets: ParsedSheet[],
  config: Pick<IngestSheetConfig, 'name' | 'joinKey'>[],
  primarySheetName: string,
): JoinResult {
  const warnings: string[] = []
  const primaryConfig = config.find((c) => c.name === primarySheetName)
  if (!primaryConfig) {
    throw new Error(`Primary sheet "${primarySheetName}" not in config`)
  }

  const primary = sheetByName(sheets, primarySheetName)
  if (!primary) {
    throw new Error(`Sheet "${primarySheetName}" not found`)
  }

  const { maps: primaryMap, warnings: pw } = rowsToMaps(
    primary,
    primaryConfig.joinKey,
  )
  warnings.push(...pw)

  for (const sheetConfig of config) {
    if (sheetConfig.name === primarySheetName) continue

    const sheet = sheetByName(sheets, sheetConfig.name)
    if (!sheet) {
      warnings.push(`Sheet "${sheetConfig.name}" not found — skipped`)
      continue
    }

    const { maps: secondaryMap, warnings: sw } = rowsToMaps(
      sheet,
      sheetConfig.joinKey,
    )
    warnings.push(...sw)

    for (const [key, primaryRow] of primaryMap) {
      const secondaryRow = secondaryMap.get(key)
      if (!secondaryRow) continue

      for (const [col, val] of Object.entries(secondaryRow)) {
        if (col.includes('.')) {
          primaryRow[col] = val
        } else if (!(col in primaryRow) || primaryRow[col] === '') {
          primaryRow[col] = val
        } else {
          primaryRow[`${sheetConfig.name}.${col}`] = val
        }
      }
    }
  }

  return { rows: [...primaryMap.values()], warnings }
}
