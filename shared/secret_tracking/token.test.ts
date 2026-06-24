import { describe, expect, it } from 'vitest'
import {
  decodeSecretToken,
  embedInText,
  encodeSecretToken,
  extractTokensFromText,
} from '../../secret_tracking/token.mjs'

describe('secret tracking tokens', () => {
  it('encodes and decodes a recipient id', () => {
    const marker = encodeSecretToken({ recipientId: 5 })
    const decoded = decodeSecretToken(marker)
    expect(decoded).toEqual({ version: 1, recipientId: 5, valid: true })
  })

  it('survives embedding in visible product text', () => {
    const marker = encodeSecretToken({ recipientId: 42 })
    const embedded = embedInText('SKF Explorer 6204-2Z', marker, 'after-first-token')
    expect(embedded).toBe(`SKF${marker} Explorer 6204-2Z`)
    expect(extractTokensFromText(embedded)).toEqual([
      { version: 1, recipientId: 42, valid: true },
    ])
  })

  it('rejects tampered checksums', () => {
    const marker = encodeSecretToken({ recipientId: 1 })
    const last = marker.at(-1)
    const tampered = marker.slice(0, -1) + (last === '\u200B' ? '\u200C' : '\u200B')
    const decoded = decodeSecretToken(tampered)
    expect(decoded).toEqual({ version: 0, recipientId: 0, valid: false })
  })

  it('finds multiple tokens in one string', () => {
    const a = encodeSecretToken({ recipientId: 3 })
    const b = encodeSecretToken({ recipientId: 9 })
    const text = `Alpha${a} Beta${b}`
    expect(extractTokensFromText(text).map((t) => t.recipientId)).toEqual([3, 9])
  })

  it('throws for out-of-range recipient ids', () => {
    expect(() => encodeSecretToken({ recipientId: -1 })).toThrow(RangeError)
    expect(() => encodeSecretToken({ recipientId: 70000 })).toThrow(RangeError)
  })
})
