/** Deterministic date format for SSR/client hydration */
export function formatTimestamp(iso: string): string {
  return iso.replace('T', ' ').replace(/\.\d{3}Z$/, ' UTC').replace(/Z$/, ' UTC')
}
