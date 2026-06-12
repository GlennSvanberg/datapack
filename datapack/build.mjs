#!/usr/bin/env node
/**
 * Build self-contained DataPack HTML files from sample-data + runtime.
 *
 * Usage:
 *   node datapack/build.mjs [packId]
 *   node datapack/build.mjs                    # builds all packs for local + prod
 *
 * Output:
 *   packs/local/{packId}.html  → apiBase http://localhost:4040
 *   packs/prod/{packId}.html   → apiBase https://datapack-one.vercel.app
 *
 * Env overrides:
 *   API_BASE_LOCAL — local apiBase (default http://localhost:4040)
 *   API_BASE_PROD  — prod apiBase  (default https://datapack-one.vercel.app)
 */

import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const SAMPLE_DIR = path.join(ROOT, 'sample-data')
const PACKS_OUT = path.join(ROOT, 'packs')
const RUNTIME_DIR = path.join(__dirname, 'runtime')

const BUILD_TARGETS = [
  {
    name: 'local',
    apiBase: process.env.API_BASE_LOCAL || 'http://localhost:4040',
    outDir: path.join(PACKS_OUT, 'local'),
  },
  {
    name: 'prod',
    apiBase: process.env.API_BASE_PROD || 'https://datapack-one.vercel.app',
    outDir: path.join(PACKS_OUT, 'prod'),
  },
]

const RUNTIME_FILES = [
  'i18n.js',
  'telemetry.js',
  'api.js',
  'attributes.js',
  'xlsx-writer.js',
  'export.js',
  'main.js',
]

async function readRuntimeBundle() {
  const parts = []
  for (const file of RUNTIME_FILES) {
    parts.push(await readFile(path.join(RUNTIME_DIR, file), 'utf-8'))
  }
  return parts.join('\n\n')
}

function displayFilename(manifest) {
  const brand = manifest.meta.brand || 'DataPack'
  const assortment = manifest.meta.assortment || manifest.meta.packId
  return `${brand} — ${assortment}.html`.replace(/[<>:"/\\|?*\u0000-\u001f]/g, '-')
}

async function buildPack(packId, target, assets) {
  const { template, styles, logo, runtime } = assets
  const samplePath = path.join(SAMPLE_DIR, `${packId}.json`)

  const manifestRaw = await readFile(samplePath, 'utf-8')
  const manifest = JSON.parse(manifestRaw)
  manifest.meta.apiBase = target.apiBase

  let html = template
  html = html.replace('/* MANIFEST */', JSON.stringify(manifest))
  html = html.replace('<!-- STYLES -->', `<style>\n${styles}\n</style>`)
  html = html.replace('<!-- LOGO -->', logo)
  html = html.replace('<!-- SCRIPTS -->', `<script>\n${runtime}\n</script>`)

  await mkdir(target.outDir, { recursive: true })
  const outPath = path.join(target.outDir, `${packId}.html`)
  await writeFile(outPath, html, 'utf-8')
  console.log(`Built [${target.name}] ${outPath} (apiBase=${target.apiBase})`)

  const humanPath = path.join(target.outDir, displayFilename(manifest))
  if (humanPath !== outPath) {
    await writeFile(humanPath, html, 'utf-8')
    console.log(`Built [${target.name}] ${humanPath} (display name)`)
  }
}

async function main() {
  const packArg = process.argv[2]
  const templatePath = path.join(__dirname, 'template.html')
  const stylesPath = path.join(__dirname, 'styles.css')
  const logoPath = path.join(__dirname, 'logo.svg')

  const [template, styles, logo, runtime] = await Promise.all([
    readFile(templatePath, 'utf-8'),
    readFile(stylesPath, 'utf-8'),
    readFile(logoPath, 'utf-8'),
    readRuntimeBundle(),
  ])

  const assets = { template, styles, logo, runtime }

  let packIds
  if (packArg) {
    packIds = [packArg]
  } else {
    const files = await readdir(SAMPLE_DIR)
    packIds = files.filter((f) => f.endsWith('.json')).map((f) => f.replace(/\.json$/, ''))
  }

  if (packIds.length === 0) {
    console.error('No sample-data/*.json files found')
    process.exit(1)
  }

  for (const target of BUILD_TARGETS) {
    for (const packId of packIds) {
      await buildPack(packId, target, assets)
    }
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
