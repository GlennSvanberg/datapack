const CANDIDATES = [',', ';', '\t', '|'] as const

function countOutsideQuotes(line: string, delimiter: string): number {
  let count = 0
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const c = line[i]
    if (c === '"') {
      if (inQuotes && line[i + 1] === '"') {
        i++
        continue
      }
      inQuotes = !inQuotes
    } else if (!inQuotes && c === delimiter) {
      count++
    }
  }
  return count
}

/** Guess CSV delimiter from the first few non-empty lines. */
export function detectCsvDelimiter(text: string): string {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
    .slice(0, 8)

  if (lines.length === 0) return ','

  let best = ','
  let bestScore = -1

  for (const delim of CANDIDATES) {
    const counts = lines.map((l) => countOutsideQuotes(l, delim))
    const first = counts[0] ?? 0
    if (first === 0) continue
    const consistent = counts.every((c) => c === first)
    if (consistent && first > bestScore) {
      bestScore = first
      best = delim
    }
  }

  return best
}
