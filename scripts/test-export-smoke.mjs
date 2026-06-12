#!/usr/bin/env node
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import vm from 'node:vm'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const RUNTIME = path.join(ROOT, 'datapack/runtime')

async function loadRuntime(manifest) {
  const files = ['i18n.js', 'attributes.js', 'xlsx-writer.js', 'export.js']
  let code = `const window = { DATAPACK_MANIFEST: ${JSON.stringify(manifest)} }; const localStorage = { getItem: () => null, setItem: () => {} }; const document = { addEventListener: () => {} };`
  for (const f of files) {
    code += '\n' + (await readFile(path.join(RUNTIME, f), 'utf-8'))
  }
  code += '\n;({ DataPackExport, DataPackI18n, DataPackAttributes });'
  const ctx = { console, Blob: globalThis.Blob, URL: globalThis.URL, TextEncoder: globalThis.TextEncoder }
  vm.createContext(ctx)
  return vm.runInContext(code, ctx)
}

async function main() {
  const packPath = path.join(ROOT, 'sample-data/friluftsportalen-spring-tents-001.json')
  const manifest = JSON.parse(await readFile(packPath, 'utf-8'))

  if (!manifest.attributeSchema || manifest.attributeSchema.length < 18) {
    throw new Error(`Expected ~20 attributes, got ${manifest.attributeSchema?.length}`)
  }
  const first = manifest.products[0]
  if (!first.attributes[0].id) throw new Error('Product attributes should use id')

  const ctx = await loadRuntime(manifest)
  const { DataPackExport } = ctx
  const products = manifest.products.slice(0, 2)
  const productFields = ['sku', 'name', 'price']
  const attributeFields = manifest.attributeSchema.slice(0, 5).map((a) => a.id)

  const wide = DataPackExport.prepareExport(products, {
    productFields,
    attributeFields,
    format: 'csv',
    layout: 'wide',
    manifest,
  })
  if (!wide.content.includes('TENT-001')) throw new Error('Wide CSV missing product sku value')

  const split = DataPackExport.prepareExport(products, {
    productFields,
    attributeFields,
    format: 'csv',
    layout: 'split',
    manifest,
  })
  if (!(split.content instanceof Uint8Array) && !(split.content?.buffer)) {
    // Uint8Array from vm might be plain object
    if (!split.content || split.content.length < 100) throw new Error('Split CSV should be ZIP bytes')
  }

  const xlsxSplit = DataPackExport.prepareExport(products, {
    productFields,
    attributeFields,
    format: 'xlsx',
    layout: 'split',
    manifest,
  })
  if (!xlsxSplit.content || xlsxSplit.content.length < 500) throw new Error('XLSX split too small')

  const jsonNested = DataPackExport.prepareExport(products, {
    productFields,
    attributeFields,
    format: 'json',
    structure: 'nested',
    manifest,
  })
  if (!jsonNested.content.includes('"attributes"')) throw new Error('JSON nested missing attributes')

  console.log('Export smoke tests passed')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
