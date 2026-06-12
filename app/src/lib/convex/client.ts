import { ConvexReactClient } from 'convex/react'

const url = import.meta.env.VITE_CONVEX_URL as string | undefined

if (!url) {
  console.warn('VITE_CONVEX_URL is not set — Convex live features will not work')
}

export const convex = new ConvexReactClient(url ?? 'https://placeholder.convex.cloud')
