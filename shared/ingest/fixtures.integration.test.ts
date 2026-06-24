import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import type { IngestConfig, SchemaField } from '../manifest.types'
import { inferStorageMode, validateManifest } from '../manifest.validate'
import { ingestFull } from './previewIngest'

const fixturesDir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  'fixtures',
)

const productSchema: SchemaField[] = [
  { name: 'sku', label: 'sku', type: 'string', role: 'id' },
  { name: 'name', label: 'name', type: 'string', role: 'title' },
  { name: 'price', label: 'price', type: 'number', role: 'price' },
]

async function loadFixture(name: string): Promise<ArrayBuffer> {
  const buf = await readFile(path.join(fixturesDir, name))
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
}

describe('fixture ingest → manifest', () => {
  it('ingests simple-comma.csv', async () => {
    const buffer = await loadFixture('simple-comma.csv')
    const sheetName = 'simple-comma'
    const ingestConfig: IngestConfig = {
      sourceType: 'csv',
      primarySheet: sheetName,
      sheets: [
        {
          name: sheetName,
          joinKey: 'sku',
          headerRowIndex: 0,
          fieldMap: { sku: 'sku', name: 'name', price: 'price' },
        },
      ],
      createdAt: new Date().toISOString(),
      lastIngestedAt: new Date().toISOString(),
    }

    const { records } = await ingestFull(
      buffer,
      'simple-comma.csv',
      ingestConfig,
      productSchema,
    )
    expect(records.length).toBeGreaterThanOrEqual(3)
    expect(records[0]).toHaveProperty('sku')
    expect(records[0]).toHaveProperty('name')
  })

  it('ingests semicolon-headers.csv with title row', async () => {
    const buffer = await loadFixture('semicolon-headers.csv')
    const sheetName = 'semicolon-headers'
    const ingestConfig: IngestConfig = {
      sourceType: 'csv',
      primarySheet: sheetName,
      csvDelimiter: ';',
      sheets: [
        {
          name: sheetName,
          joinKey: 'sku',
          headerRowIndex: 1,
          fieldMap: { sku: 'sku', name: 'name', price: 'price' },
        },
      ],
      createdAt: new Date().toISOString(),
      lastIngestedAt: new Date().toISOString(),
    }

    const { records } = await ingestFull(
      buffer,
      'semicolon-headers.csv',
      ingestConfig,
      productSchema,
    )
    expect(records.length).toBeGreaterThanOrEqual(3)
    expect(typeof records[0].price).toBe('number')
  })

  it('ingests multi-header.csv with preamble rows', async () => {
    const buffer = await loadFixture('multi-header.csv')
    const sheetName = 'multi-header'
    const ingestConfig: IngestConfig = {
      sourceType: 'csv',
      primarySheet: sheetName,
      sheets: [
        {
          name: sheetName,
          joinKey: 'sku',
          headerRowIndex: 2,
          fieldMap: { sku: 'sku', name: 'name', price: 'price' },
        },
      ],
      createdAt: new Date().toISOString(),
      lastIngestedAt: new Date().toISOString(),
    }

    const { records } = await ingestFull(
      buffer,
      'multi-header.csv',
      ingestConfig,
      productSchema,
    )
    expect(records.length).toBeGreaterThanOrEqual(3)
  })

  it('produces a valid embedded manifest for small fixtures', async () => {
    const buffer = await loadFixture('simple-comma.csv')
    const sheetName = 'simple-comma'
    const ingestConfig: IngestConfig = {
      sourceType: 'csv',
      primarySheet: sheetName,
      sheets: [
        {
          name: sheetName,
          joinKey: 'sku',
          headerRowIndex: 0,
          fieldMap: { sku: 'sku', name: 'name', price: 'price' },
        },
      ],
      createdAt: new Date().toISOString(),
      lastIngestedAt: new Date().toISOString(),
    }

    const { records } = await ingestFull(
      buffer,
      'simple-comma.csv',
      ingestConfig,
      productSchema,
    )

    const manifest = {
      meta: {
        packId: 'test-fixture',
        title: 'Fixture Pack',
        version: '1.0.0',
        generatedAt: new Date().toISOString(),
        staleAfter: new Date(Date.now() + 86400000).toISOString(),
        storageMode: inferStorageMode(records.length),
        recordCount: records.length,
        primaryKey: 'sku',
        viewProfile: 'catalog' as const,
      },
      schema: productSchema,
      records,
    }

    const validation = validateManifest(manifest)
    expect(validation.valid).toBe(true)
  })
})
