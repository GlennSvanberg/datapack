import { ConvexHttpClient } from 'convex/browser'

let client: ConvexHttpClient | null = null

export function getConvexClient(): ConvexHttpClient {
  const url = process.env.CONVEX_URL ?? process.env.VITE_CONVEX_URL
  if (!url) {
    throw new Error('CONVEX_URL is not configured')
  }
  if (!client) {
    client = new ConvexHttpClient(url)
  }
  return client
}
