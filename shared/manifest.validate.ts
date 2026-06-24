import {
  STORAGE_EMBED_THRESHOLD,
  type PackManifestV2,
  type SchemaField,
  type ViewProfile,
} from './manifest.types'

export interface ValidationResult {
  valid: boolean
  errors: string[]
}

export function inferViewProfile(schema: SchemaField[]): ViewProfile {
  const hasTitle = schema.some((f) => f.role === 'title')
  const hasImage = schema.some((f) => f.role === 'image')
  return hasTitle && hasImage ? 'catalog' : 'table'
}

export function inferStorageMode(
  recordCount: number,
  embedThreshold = STORAGE_EMBED_THRESHOLD,
): 'embedded' | 'remote' {
  return recordCount <= embedThreshold ? 'embedded' : 'remote'
}

export function validateManifest(manifest: PackManifestV2): ValidationResult {
  const errors: string[] = []

  if (!manifest.meta?.packId?.trim()) {
    errors.push('meta.packId is required')
  }
  if (!manifest.meta?.title?.trim()) {
    errors.push('meta.title is required')
  }
  if (!manifest.meta?.primaryKey?.trim()) {
    errors.push('meta.primaryKey is required')
  }
  if (!manifest.meta?.version?.trim()) {
    errors.push('meta.version is required')
  }
  if (!manifest.schema?.length) {
    errors.push('schema must have at least one field')
  }

  const idField = manifest.schema?.find((f) => f.role === 'id')
  const pkField = manifest.schema?.find(
    (f) => f.name === manifest.meta?.primaryKey,
  )
  if (!idField && !pkField) {
    errors.push('schema must include a field with role "id" or matching primaryKey')
  }

  if (manifest.meta?.storageMode === 'embedded' && !manifest.records?.length) {
    errors.push('embedded packs must include records')
  }

  if (manifest.records) {
    const pk = manifest.meta.primaryKey
    const seen = new Set<string>()
    for (let i = 0; i < manifest.records.length; i++) {
      const row = manifest.records[i]
      const id = row[pk]
      if (id === null || id === undefined || id === '') {
        errors.push(`record at index ${i} missing primary key "${pk}"`)
      } else {
        const key = String(id)
        if (seen.has(key)) {
          errors.push(`duplicate primary key "${key}" at index ${i}`)
        }
        seen.add(key)
      }
    }
  }

  return { valid: errors.length === 0, errors }
}
