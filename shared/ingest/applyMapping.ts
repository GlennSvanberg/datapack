import type { DataRecord, SchemaField, IngestSheetConfig } from '../manifest.types'
import { coerceValue } from './inferTypes'
import type { JoinedRow } from './joinSheets'

export function applyMapping(
  rows: JoinedRow[],
  sheets: IngestSheetConfig[],
  schema: SchemaField[],
): DataRecord[] {
  const fieldTypes = new Map(schema.map((f) => [f.name, f.type]))
  const primarySheet = sheets[0]?.name

  const mergedFieldMap: Record<string, string> = {}
  for (const sheet of sheets) {
    for (const [src, dest] of Object.entries(sheet.fieldMap)) {
      mergedFieldMap[src] = dest
      if (sheet.name !== primarySheet) {
        mergedFieldMap[`${sheet.name}.${src}`] = dest
      }
    }
  }

  return rows.map((row) => {
    const record: DataRecord = {}
    for (const [srcCol, schemaField] of Object.entries(mergedFieldMap)) {
      const raw = row[srcCol] ?? row[srcCol.split('.').pop() ?? ''] ?? ''
      const type = fieldTypes.get(schemaField) ?? 'string'
      record[schemaField] = coerceValue(String(raw), type)
    }
    return record
  })
}
