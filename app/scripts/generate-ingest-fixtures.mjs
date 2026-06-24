#!/usr/bin/env node
/** Generate binary ingest fixtures (xlsx) for tests. */
import { writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import * as XLSX from 'xlsx'

const fixturesDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../shared/ingest/fixtures',
)

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

const out = path.join(fixturesDir, 'multi-header.xlsx')
await writeFile(out, buf)
console.log('Wrote', out)
