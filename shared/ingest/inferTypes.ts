import type { SchemaFieldType } from '../manifest.types'

const URL_RE = /^https?:\/\//i
const DATE_RE = /^\d{4}-\d{2}-\d{2}/

export function inferType(samples: string[]): SchemaFieldType {
  const nonEmpty = samples
    .map((s) => s?.trim())
    .filter((s) => s !== undefined && s !== '')

  if (nonEmpty.length === 0) return 'string'

  if (nonEmpty.every((s) => s === 'true' || s === 'false')) {
    return 'boolean'
  }

  if (nonEmpty.every((s) => !Number.isNaN(Number(s)) && s !== '')) {
    return 'number'
  }

  if (nonEmpty.every((s) => DATE_RE.test(s))) {
    return 'date'
  }

  if (nonEmpty.every((s) => URL_RE.test(s))) {
    return 'url'
  }

  return 'string'
}

export function coerceValue(
  raw: string,
  type: SchemaFieldType,
): string | number | boolean | null {
  const trimmed = raw?.trim() ?? ''
  if (trimmed === '') return null

  switch (type) {
    case 'number': {
      const n = Number(trimmed)
      return Number.isNaN(n) ? null : n
    }
    case 'boolean':
      return trimmed.toLowerCase() === 'true'
    case 'date':
    case 'url':
    case 'string':
    default:
      return trimmed
  }
}
