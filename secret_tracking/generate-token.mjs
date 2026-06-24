#!/usr/bin/env node
/**
 * Generate invisible Unicode tracking tokens for product text.
 *
 * Examples:
 *   node secret_tracking/generate-token.mjs --recipient 5
 *   node secret_tracking/generate-token.mjs --recipient 5 --embed "SKF Explorer 6204-2Z"
 *   node secret_tracking/generate-token.mjs --recipient 5 --json --stdout
 *   node secret_tracking/generate-token.mjs --decode --text "pasted text from a web page"
 *   node secret_tracking/generate-token.mjs --scan-file ./sample.html
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  decodeSecretToken,
  describeToken,
  embedInText,
  encodeSecretToken,
  extractTokensFromText,
} from './token.mjs'

const OUT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'out')

function usage() {
  console.log(`Usage:
  node secret_tracking/generate-token.mjs --recipient <id> [--embed <text>] [--placement suffix|prefix|after-first-token]
  node secret_tracking/generate-token.mjs --decode --text <string>
  node secret_tracking/generate-token.mjs --scan-file <path>

Options:
  --recipient   Distributor / recipient ID (0–65535)
  --embed       Visible text to embed the token into
  --placement   Where to place the marker when using --embed (default: suffix)
  --out         Output file path (default: secret_tracking/out/recipient-<id>.txt)
  --decode      Decode tokens from --text instead of generating
  --text        Raw text to decode or inspect
  --scan-file   Read a file and scan for embedded tokens
  --json        Write machine-readable JSON instead of plain text
  --stdout      Also print full output to the terminal (default: summary only)
`)
}

function parseArgs(argv) {
  const args = {
    recipient: undefined,
    embed: undefined,
    placement: 'suffix',
    decode: false,
    text: undefined,
    scanFile: undefined,
    out: undefined,
    json: false,
    stdout: false,
    help: false,
  }

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    if (arg === '--help' || arg === '-h') {
      args.help = true
      continue
    }
    if (arg === '--json') {
      args.json = true
      continue
    }
    if (arg === '--stdout') {
      args.stdout = true
      continue
    }
    if (arg === '--out' || arg === '-o') {
      args.out = argv[++i]
      continue
    }
    if (arg === '--decode') {
      args.decode = true
      continue
    }
    if (arg === '--recipient') {
      args.recipient = Number(argv[++i])
      continue
    }
    if (arg === '--embed') {
      args.embed = argv[++i]
      continue
    }
    if (arg === '--placement') {
      args.placement = argv[++i]
      continue
    }
    if (arg === '--text') {
      args.text = argv[++i]
      continue
    }
    if (arg === '--scan-file') {
      args.scanFile = argv[++i]
      continue
    }
    throw new Error(`Unknown argument: ${arg}`)
  }

  return args
}

function printGenerateResult({ recipientId, marker, embedded, placement }) {
  const meta = describeToken(marker)
  const decoded = decodeSecretToken(marker)

  console.log('Secret tracking token')
  console.log('---------------------')
  console.log(`Recipient ID:  ${recipientId}`)
  console.log(`Version:       ${decoded?.version ?? '—'}`)
  console.log(`Invisible chars: ${meta.charCount} (${meta.bitCount} bits)`)
  console.log(`Code points:   ${meta.hex}`)
  console.log('')
  console.log('Marker (copy from next line — looks empty):')
  console.log(marker)
  console.log('')

  if (embedded) {
    console.log('Embedded text (visible portion unchanged):')
    console.log(embedded)
    console.log('')
    console.log('Round-trip check:', extractTokensFromText(embedded))
  }
}

function buildGeneratePayload({ recipientId, marker, embedded, placement }) {
  return {
    recipientId,
    marker,
    embedded,
    placement: embedded ? placement : undefined,
    meta: describeToken(marker),
    roundTrip: embedded ? extractTokensFromText(embedded) : undefined,
  }
}

function defaultOutPath(recipientId, { json, embedded }) {
  const suffix = embedded ? '-embedded' : ''
  const ext = json ? 'json' : 'txt'
  return path.join(OUT_DIR, `recipient-${recipientId}${suffix}.${ext}`)
}

async function writeOutput(filePath, content) {
  await mkdir(path.dirname(filePath), { recursive: true })
  await writeFile(filePath, content, 'utf8')
}

function printJson(payload) {
  console.log(JSON.stringify(payload, null, 2))
}

async function main() {
  const args = parseArgs(process.argv.slice(2))

  if (args.help) {
    usage()
    return
  }

  if (args.scanFile) {
    const content = await readFile(args.scanFile, 'utf8')
    const tokens = extractTokensFromText(content)
    if (args.json) {
      printJson({ file: args.scanFile, tokens })
      return
    }
    console.log(`Scanned: ${args.scanFile}`)
    console.log(`Found ${tokens.length} token(s):`)
    for (const token of tokens) {
      console.log(`  recipient=${token.recipientId} version=${token.version} valid=${token.valid}`)
    }
    return
  }

  if (args.decode) {
    if (!args.text) {
      console.error('Error: --decode requires --text <string>')
      process.exit(1)
    }
    const tokens = extractTokensFromText(args.text)
    if (args.json) {
      printJson({ tokens })
      return
    }
    console.log(`Found ${tokens.length} token(s) in text:`)
    for (const token of tokens) {
      console.log(`  recipient=${token.recipientId} version=${token.version}`)
    }
    return
  }

  if (args.recipient === undefined || Number.isNaN(args.recipient)) {
    usage()
    process.exit(1)
  }

  const marker = encodeSecretToken({ recipientId: args.recipient })
  const embedded = args.embed
    ? embedInText(args.embed, marker, args.placement)
    : undefined
  const outPath = path.resolve(
    args.out ?? defaultOutPath(args.recipient, { json: args.json, embedded: Boolean(embedded) }),
  )
  const payload = buildGeneratePayload({
    recipientId: args.recipient,
    marker,
    embedded,
    placement: args.placement,
  })
  const fileContent = args.json
    ? `${JSON.stringify(payload, null, 2)}\n`
    : `${embedded ?? marker}\n`

  await writeOutput(outPath, fileContent)

  console.log(`Wrote ${outPath}`)

  if (args.stdout) {
    if (args.json) {
      console.log(fileContent)
    } else {
      printGenerateResult({
        recipientId: args.recipient,
        marker,
        embedded,
        placement: args.placement,
      })
    }
  } else {
    const decoded = decodeSecretToken(marker)
    console.log(`Recipient ID: ${args.recipient} (version ${decoded?.version ?? '—'})`)
    if (embedded) console.log(`Embedded: yes (${args.placement})`)
    console.log('Use --stdout to print the full token to the terminal.')
  }
}

main().catch((err) => {
  console.error(err.message || err)
  process.exit(1)
})
