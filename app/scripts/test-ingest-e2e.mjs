#!/usr/bin/env node
/**
 * E2E: preview → create pack → download HTML (+ re-upload)
 * Requires dev server at http://localhost:4040
 */
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import * as XLSX from 'xlsx'

const base = process.env.API_BASE ?? 'http://localhost:4040'
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const fixturesDir = path.join(repoRoot, 'shared/ingest/fixtures')

const productSchema = [
  { name: 'sku', label: 'sku', type: 'string', role: 'id' },
  { name: 'name', label: 'name', type: 'string', role: 'title' },
  { name: 'price', label: 'price', type: 'number', role: 'price' },
]

/** @type {Array<{ name: string, fileName: string, ingestConfig: object }>} */
const CASES = [
  {
    name: 'simple comma CSV',
    fileName: 'simple-comma.csv',
    ingestConfig: {
      sourceType: 'csv',
      primarySheet: 'simple-comma',
      sheets: [
        {
          name: 'simple-comma',
          joinKey: 'sku',
          headerRowIndex: 0,
          fieldMap: { sku: 'sku', name: 'name', price: 'price' },
        },
      ],
    },
  },
  {
    name: 'semicolon CSV with title row',
    fileName: 'semicolon-headers.csv',
    ingestConfig: {
      sourceType: 'csv',
      primarySheet: 'semicolon-headers',
      csvDelimiter: ';',
      sheets: [
        {
          name: 'semicolon-headers',
          joinKey: 'sku',
          headerRowIndex: 1,
          fieldMap: { sku: 'sku', name: 'name', price: 'price' },
        },
      ],
    },
  },
  {
    name: 'multi-header CSV with preamble',
    fileName: 'multi-header.csv',
    ingestConfig: {
      sourceType: 'csv',
      primarySheet: 'multi-header',
      sheets: [
        {
          name: 'multi-header',
          joinKey: 'sku',
          headerRowIndex: 2,
          fieldMap: { sku: 'sku', name: 'name', price: 'price' },
        },
      ],
    },
  },
  {
    name: 'Excel with preamble rows',
    fileName: 'multi-header.xlsx',
    ingestConfig: {
      sourceType: 'xlsx',
      primarySheet: 'Products',
      sheets: [
        {
          name: 'Products',
          joinKey: 'sku',
          headerRowIndex: 2,
          fieldMap: { sku: 'sku', name: 'name', price: 'price' },
        },
      ],
    },
  },
]

async function ensureXlsxFixture() {
  const out = path.join(fixturesDir, 'multi-header.xlsx')
  try {
    await readFile(out)
    return
  } catch {
    // generate below
  }

  const rows = [
    ['Friluftsportalen product export', '', ''],
    ['Generated 2026-06-12', '', ''],
    ['sku', 'name', 'price'],
    ['TENT-001', 'Arctic Dome 2', 1999],
    ['TENT-002', 'Fjord Lite 1', 899],
    ['TENT-003', 'Breeze Ultralight', 1249],
  ]
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.aoa_to_sheet(rows)
  XLSX.utils.book_append_sheet(wb, ws, 'Products')
  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
  await writeFile(out, buf)
}

async function previewFile(fileBuf, fileName, ingestConfig) {
  const form = new FormData()
  form.append('file', new Blob([fileBuf]), fileName)
  const res = await fetch(`${base}/api/packs/ingest/preview`, {
    method: 'POST',
    headers: {
      'x-ingest-config': JSON.stringify({
        ...ingestConfig,
        createdAt: new Date().toISOString(),
        lastIngestedAt: new Date().toISOString(),
      }),
      'x-ingest-schema': JSON.stringify(productSchema),
    },
    body: form,
  })
  if (!res.ok) {
    throw new Error(`Preview failed (${fileName}): ${res.status} ${await res.text()}`)
  }
  const preview = await res.json()
  if (!preview.previewRecords?.length) {
    throw new Error(`Preview returned no records for ${fileName}`)
  }
  if (!preview.sheets?.[0]?.rawPreviewRows?.length) {
    throw new Error(`Preview missing rawPreviewRows for ${fileName}`)
  }
  return preview
}

async function createPack(fileBuf, fileName, ingestConfig, title) {
  const now = new Date().toISOString()
  const config = {
    ...ingestConfig,
    createdAt: now,
    lastIngestedAt: now,
  }
  const form = new FormData()
  form.append('file', new Blob([fileBuf]), fileName)
  form.append(
    'payload',
    JSON.stringify({ title, schema: productSchema, ingestConfig: config }),
  )
  const res = await fetch(`${base}/api/packs`, { method: 'POST', body: form })
  if (!res.ok) {
    throw new Error(`Create failed (${fileName}): ${res.status} ${await res.text()}`)
  }
  return res.json()
}

async function downloadPack(packId) {
  const res = await fetch(`${base}/api/packs/${packId}/download`)
  if (!res.ok) {
    throw new Error(`Download failed: ${res.status} ${await res.text()}`)
  }
  const html = await res.text()
  if (!html.includes('<!DOCTYPE html>') || !html.includes(packId)) {
    throw new Error('Downloaded HTML missing pack manifest')
  }
  if (!html.includes('DataPackStore') || !html.includes('DataPackExport')) {
    throw new Error('Downloaded HTML missing runtime export/store')
  }
  if (!html.includes('Arctic Dome 2')) {
    throw new Error('Downloaded HTML missing embedded record data')
  }
  return html
}

async function reuploadSource(packId, fileBuf, fileName) {
  const form = new FormData()
  form.append('file', new Blob([fileBuf]), fileName)
  const res = await fetch(`${base}/api/packs/${encodeURIComponent(packId)}/source`, {
    method: 'PUT',
    body: form,
  })
  if (!res.ok) {
    throw new Error(`Re-upload failed: ${res.status} ${await res.text()}`)
  }
  const data = await res.json()
  if (!data.recordCount) {
    throw new Error('Re-upload returned no recordCount')
  }
  return data
}

async function runCase(testCase) {
  const filePath = path.join(fixturesDir, testCase.fileName)
  const fileBuf = await readFile(filePath)
  const title = `E2E ${testCase.name} ${Date.now()}`

  console.log(`\n▶ ${testCase.name}`)
  const preview = await previewFile(fileBuf, testCase.fileName, testCase.ingestConfig)
  console.log(`  preview: ${preview.previewRecords.length} records`)

  const { packId, recordCount } = await createPack(
    fileBuf,
    testCase.fileName,
    testCase.ingestConfig,
    title,
  )
  console.log(`  created: ${packId} (${recordCount} records)`)

  const html = await downloadPack(packId)
  console.log(`  download: ${html.length} bytes`)

  const re = await reuploadSource(packId, fileBuf, testCase.fileName)
  console.log(`  re-upload: ${re.recordCount} records`)
}

async function main() {
  console.log(`Testing against ${base}`)
  await ensureXlsxFixture()

  for (const testCase of CASES) {
    await runCase(testCase)
  }

  console.log('\n✓ All E2E cases passed')
}

main().catch((err) => {
  console.error('\n✗', err.message)
  process.exit(1)
})
