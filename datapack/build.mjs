#!/usr/bin/env node
/**
 * Build a self-contained DataPack HTML file from sample-data + runtime.
 *
 * Usage:
 *   node datapack/build.mjs [packId]
 *   node datapack/build.mjs                    # builds all packs in sample-data/
 *
 * Env:
 *   API_BASE — apiBase injected into manifest (default http://localhost:4040)
 */

import { readFile, writeFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const SAMPLE_DIR = path.join(ROOT, 'sample-data')
const PACKS_OUT = path.join(ROOT, 'packs')
const RUNTIME_DIR = path.join(__dirname, 'runtime')
const API_BASE = process.env.API_BASE || 'http://localhost:4040'

const RUNTIME_FILES = [
  'i18n.js',
  'telemetry.js',
  'api.js',
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

async function buildPack(packId) {
  const samplePath = path.join(SAMPLE_DIR, `${packId}.json`)
  const templatePath = path.join(__dirname, 'template.html')
  const stylesPath = path.join(__dirname, 'styles.css')
  const logoPath = path.join(__dirname, 'logo.svg')

  const [manifestRaw, template, styles, logo, runtime] = await Promise.all([
    readFile(samplePath, 'utf-8'),
    readFile(templatePath, 'utf-8'),
    readFile(stylesPath, 'utf-8'),
    readFile(logoPath, 'utf-8'),
    readRuntimeBundle(),
  ])

  const manifest = JSON.parse(manifestRaw)
  manifest.meta.apiBase = API_BASE

  let html = template
  html = html.replace('/* MANIFEST */', JSON.stringify(manifest))
  html = html.replace('<!-- STYLES -->', `<style>\n${styles}\n</style>`)
  html = html.replace('<!-- LOGO -->', logo)
  html = html.replace('<!-- SCRIPTS -->', `<script>\n${runtime}\n</script>`)

  const outPath = path.join(PACKS_OUT, `${packId}.html`)
  await writeFile(outPath, html, 'utf-8')
  console.log(`Built ${outPath}`)
}

async function main() {
  const packArg = process.argv[2]

  if (packArg) {
    await buildPack(packArg)
    return
  }

  const files = await readdir(SAMPLE_DIR)
  const packIds = files.filter((f) => f.endsWith('.json')).map((f) => f.replace(/\.json$/, ''))

  if (packIds.length === 0) {
    console.error('No sample-data/*.json files found')
    process.exit(1)
  }

  for (const packId of packIds) {
    await buildPack(packId)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
