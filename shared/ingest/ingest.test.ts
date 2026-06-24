import { describe, expect, it } from 'vitest'
import * as XLSX from 'xlsx'
import { parseCsv, parseCsvRaw } from './parseCsv'
import { detectCsvDelimiter } from './detectDelimiter'
import { rawToParsedSheet } from './sheetFromRows'
import { joinSheets } from './joinSheets'
import { applyMapping } from './applyMapping'
import { ingestFull } from './previewIngest'
import { parseXlsx, parseXlsxRaw } from './parseXlsx'
import type { IngestConfig, SchemaField } from '../manifest.types'

function xlsxBuffer(rows: string[][], sheetName = 'Sheet1'): ArrayBuffer {
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.aoa_to_sheet(rows)
  XLSX.utils.book_append_sheet(wb, ws, sheetName)
  const bytes = XLSX.write(wb, { type: 'array', bookType: 'xlsx' }) as number[]
  const buf = new Uint8Array(bytes)
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
}

describe('CSV delimiter', () => {
  it('detects semicolon-separated files', () => {
    const text = 'sku;name;price\nA1;Tent;99\nA2;Bag;49'
    expect(detectCsvDelimiter(text)).toBe(';')
  })

  it('detects tab-separated files', () => {
    const text = 'sku\tname\tprice\nA1\tTent\t99'
    expect(detectCsvDelimiter(text)).toBe('\t')
  })

  it('parses semicolon CSV with explicit delimiter', () => {
    const sheet = parseCsv('sku;name\n1;Alpha\n2;Beta', 'Products', {
      delimiter: ';',
    })
    expect(sheet.headers).toEqual(['sku', 'name'])
    expect(sheet.rows).toHaveLength(2)
    expect(sheet.rows[0]).toEqual(['1', 'Alpha'])
  })

  it('auto-detects semicolon when delimiter omitted', () => {
    const sheet = parseCsv('sku;name\n1;Alpha')
    expect(sheet.headers).toEqual(['sku', 'name'])
    expect(sheet.rows[0]).toEqual(['1', 'Alpha'])
  })
})

describe('Excel parsing', () => {
  it('parses xlsx with preamble header row', async () => {
    const buffer = xlsxBuffer(
      [
        ['Report title', '', ''],
        ['sku', 'name', 'price'],
        ['T1', 'Tent', '1999'],
      ],
      'Products',
    )
    const raw = await parseXlsxRaw(buffer)
    expect(raw[0].name).toBe('Products')
    expect(raw[0].rows).toHaveLength(3)

    const sheets = await parseXlsx(buffer, {
      headerRowBySheet: { Products: 1 },
    })
    expect(sheets[0].headers).toEqual(['sku', 'name', 'price'])
    expect(sheets[0].rows).toHaveLength(1)
    expect(sheets[0].rows[0][1]).toBe('Tent')
  })
})

describe('header row selection', () => {
  it('skips preamble rows before headers', () => {
    const raw = parseCsvRaw(
      'Report title,,,\nExported 2024-01-01,,,\nsku,name,price\nA1,Tent,99\nA2,Bag,49',
      'Products',
    )
    const sheet = rawToParsedSheet(raw, 2)
    expect(sheet.headers).toEqual(['sku', 'name', 'price'])
    expect(sheet.rows).toHaveLength(2)
    expect(sheet.rows[0][0]).toBe('A1')
  })

  it('fills blank header cells with column_N', () => {
    const raw = parseCsvRaw('a,,c\n1,2,3', 'S')
    const sheet = rawToParsedSheet(raw, 0)
    expect(sheet.headers).toEqual(['a', 'column_2', 'c'])
  })
})

describe('ingest pipeline', () => {
  it('joins two logical sheets on id', () => {
    const primary = parseCsv('id,name\n1,Alpha\n2,Beta', 'Products')
    const extras = parseCsv('id,color\n1,Red\n2,Blue', 'Colors')
    const { rows } = joinSheets(
      [primary, extras],
      [
        { name: 'Products', joinKey: 'id' },
        { name: 'Colors', joinKey: 'id' },
      ],
      'Products',
    )
    expect(rows).toHaveLength(2)
    expect(rows[0].name).toBe('Alpha')
    expect(rows[0].color).toBe('Red')
  })

  it('maps columns to schema fields', () => {
    const schema: SchemaField[] = [
      { name: 'sku', label: 'SKU', type: 'string', role: 'id' },
      { name: 'title', label: 'Title', type: 'string', role: 'title' },
    ]
    const records = applyMapping(
      [{ id: 'A1', name: 'Tent' }],
      [
        {
          name: 'Products',
          joinKey: 'id',
          fieldMap: { id: 'sku', name: 'title' },
        },
      ],
      schema,
    )
    expect(records[0]).toEqual({ sku: 'A1', title: 'Tent' })
  })

  it('ingests full CSV with header row offset and semicolon delimiter', async () => {
    const csv = [
      'Product export v2',
      'sku;title;price',
      'T1;Winter tent;1999',
      'T2;Summer tent;899',
    ].join('\n')
    const buffer = new TextEncoder().encode(csv).buffer

    const schema: SchemaField[] = [
      { name: 'sku', label: 'sku', type: 'string', role: 'id' },
      { name: 'title', label: 'title', type: 'string', role: 'title' },
      { name: 'price', label: 'price', type: 'number', role: 'price' },
    ]

    const ingestConfig: IngestConfig = {
      sourceType: 'csv',
      primarySheet: 'data',
      csvDelimiter: ';',
      sheets: [
        {
          name: 'data',
          joinKey: 'sku',
          headerRowIndex: 1,
          fieldMap: { sku: 'sku', title: 'title', price: 'price' },
        },
      ],
      createdAt: new Date().toISOString(),
      lastIngestedAt: new Date().toISOString(),
    }

    const { records } = await ingestFull(buffer, 'data.csv', ingestConfig, schema)
    expect(records).toHaveLength(2)
    expect(records[0]).toMatchObject({ sku: 'T1', title: 'Winter tent', price: 1999 })
  })
})
