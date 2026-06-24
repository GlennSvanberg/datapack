/** @typedef {{ version: number; recipientId: number; valid: boolean }} DecodedToken */

export const BIT_ZERO = '\u200B' // ZWSP
export const BIT_ONE = '\u200C' // ZWNJ

const INVISIBLE_RE = /[\u200B\u200C]/g
const SYNC_BITS = '01010101'
const VERSION = 1
const VERSION_BITS = 4
const RECIPIENT_BITS = 16
const CHECKSUM_BITS = 8

function assertRecipientId(recipientId) {
  if (!Number.isInteger(recipientId) || recipientId < 0 || recipientId > 0xffff) {
    throw new RangeError('recipientId must be an integer between 0 and 65535')
  }
}

function toBits(value, width) {
  return value.toString(2).padStart(width, '0').slice(-width)
}

function bitsToInvisible(bits) {
  return [...bits].map((bit) => (bit === '0' ? BIT_ZERO : BIT_ONE)).join('')
}

function invisibleToBits(text) {
  return [...text]
    .filter((char) => char === BIT_ZERO || char === BIT_ONE)
    .map((char) => (char === BIT_ZERO ? '0' : '1'))
    .join('')
}

function checksum8(bits) {
  let sum = 0
  for (let i = 0; i < bits.length; i += 8) {
    sum ^= parseInt(bits.slice(i, i + 8).padEnd(8, '0'), 2)
  }
  return sum & 0xff
}

/**
 * Build an invisible marker string for a recipient (distributor) ID.
 * @param {{ recipientId: number }} payload
 * @returns {string}
 */
export function encodeSecretToken({ recipientId }) {
  assertRecipientId(recipientId)
  const body =
    SYNC_BITS +
    toBits(VERSION, VERSION_BITS) +
    toBits(recipientId, RECIPIENT_BITS)
  const marker =
    body + toBits(checksum8(body), CHECKSUM_BITS)
  return bitsToInvisible(marker)
}

/**
 * Decode a marker string (invisible chars only).
 * @param {string} marker
 * @returns {DecodedToken | null}
 */
export function decodeSecretToken(marker) {
  const bits = invisibleToBits(marker)
  if (bits.length < SYNC_BITS.length + VERSION_BITS + RECIPIENT_BITS + CHECKSUM_BITS) {
    return null
  }

  const syncAt = bits.indexOf(SYNC_BITS)
  if (syncAt === -1) return null

  const frame = bits.slice(syncAt)
  const bodyLen = SYNC_BITS.length + VERSION_BITS + RECIPIENT_BITS
  if (frame.length < bodyLen + CHECKSUM_BITS) return null

  const body = frame.slice(0, bodyLen)
  const checksumBits = frame.slice(bodyLen, bodyLen + CHECKSUM_BITS)
  const expected = toBits(checksum8(body), CHECKSUM_BITS)
  if (checksumBits !== expected) {
    return { version: 0, recipientId: 0, valid: false }
  }

  const version = parseInt(
    body.slice(SYNC_BITS.length, SYNC_BITS.length + VERSION_BITS),
    2,
  )
  const recipientId = parseInt(
    body.slice(SYNC_BITS.length + VERSION_BITS, bodyLen),
    2,
  )

  return { version, recipientId, valid: true }
}

/**
 * Find and decode all valid tokens embedded in plain text.
 * @param {string} text
 * @returns {DecodedToken[]}
 */
export function extractTokensFromText(text) {
  const bits = invisibleToBits(text)
  const results = []
  let searchFrom = 0

  while (searchFrom < bits.length) {
    const syncAt = bits.indexOf(SYNC_BITS, searchFrom)
    if (syncAt === -1) break

    const slice = bits.slice(syncAt)
    const decoded = decodeSecretToken(bitsToInvisible(slice))
    if (decoded?.valid) {
      results.push(decoded)
      searchFrom = syncAt + SYNC_BITS.length + VERSION_BITS + RECIPIENT_BITS + CHECKSUM_BITS
    } else {
      searchFrom = syncAt + 1
    }
  }

  return results
}

/**
 * @param {string} text
 * @param {string} marker
 * @param {'prefix' | 'suffix' | 'after-first-token'} [placement]
 * @returns {string}
 */
export function embedInText(text, marker, placement = 'suffix') {
  if (placement === 'prefix') return marker + text
  if (placement === 'suffix') return text + marker

  const match = text.match(/\S+/)
  if (!match || match.index === undefined) return text + marker
  const end = match.index + match[0].length
  return text.slice(0, end) + marker + text.slice(end)
}

/**
 * @param {string} marker
 * @returns {{ charCount: number; bitCount: number; hex: string }}
 */
export function describeToken(marker) {
  const bits = invisibleToBits(marker)
  return {
    charCount: marker.length,
    bitCount: bits.length,
    hex: [...marker].map((c) => c.codePointAt(0).toString(16).toUpperCase()).join(' '),
  }
}
