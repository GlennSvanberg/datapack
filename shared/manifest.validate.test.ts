import { describe, expect, it } from 'vitest'
import {
  inferStorageMode,
  inferViewProfile,
  validateManifest,
} from './manifest.validate'
import type { PackManifestV2 } from './manifest.types'

function baseManifest(overrides: Partial<PackManifestV2> = {}): PackManifestV2 {
  return {
    meta: {
      packId: 'test-pack',
      title: 'Test Pack',
      version: '1.0.0',
      generatedAt: '2026-01-01T00:00:00Z',
      staleAfter: '2026-12-31T00:00:00Z',
      storageMode: 'embedded',
      recordCount: 1,
      primaryKey: 'sku',
      viewProfile: 'table',
    },
    schema: [
      {
        name: 'sku',
        label: 'SKU',
        type: 'string',
        role: 'id',
        exportable: true,
      },
      { name: 'name', label: 'Name', type: 'string', role: 'title', searchable: true },
    ],
    records: [{ sku: 'A1', name: 'Item' }],
    ...overrides,
  }
}

describe('validateManifest', () => {
  it('accepts valid embedded manifest', () => {
    const result = validateManifest(baseManifest())
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('rejects missing primaryKey field', () => {
    const result = validateManifest(
      baseManifest({
        schema: [{ name: 'name', label: 'Name', type: 'string' }],
      }),
    )
    expect(result.valid).toBe(false)
  })

  it('rejects embedded without records', () => {
    const result = validateManifest(
      baseManifest({ records: undefined }),
    )
    expect(result.valid).toBe(false)
  })
})

describe('inferViewProfile', () => {
  it('returns catalog when title and image mapped', () => {
    expect(
      inferViewProfile([
        { name: 'sku', label: 'SKU', type: 'string', role: 'id' },
        { name: 'name', label: 'Name', type: 'string', role: 'title' },
        { name: 'img', label: 'Image', type: 'url', role: 'image' },
      ]),
    ).toBe('catalog')
  })

  it('returns table without image', () => {
    expect(
      inferViewProfile([
        { name: 'sku', label: 'SKU', type: 'string', role: 'id' },
        { name: 'name', label: 'Name', type: 'string', role: 'title' },
      ]),
    ).toBe('table')
  })
})

describe('inferStorageMode', () => {
  it('embeds small datasets', () => {
    expect(inferStorageMode(100)).toBe('embedded')
  })

  it('uses remote for large datasets', () => {
    expect(inferStorageMode(1000)).toBe('remote')
  })
})
