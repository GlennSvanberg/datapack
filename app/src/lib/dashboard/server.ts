import { createServerFn } from '@tanstack/react-start'
import { listPacks, readPack } from '#/lib/server/packs'
import {
  aggregatePackStats,
  aggregateStats,
  getRecentEvents,
} from '#/lib/server/telemetry'

export const getDashboardStats = createServerFn({ method: 'GET' }).handler(
  async () => aggregateStats(),
)

export const getPackRegistry = createServerFn({ method: 'GET' }).handler(
  async () => listPacks(),
)

export const getPackDetail = createServerFn({ method: 'GET' })
  .validator((packId: string) => packId)
  .handler(async ({ data: packId }) => {
    const [pack, stats, events] = await Promise.all([
      readPack(packId),
      aggregatePackStats(packId),
      getRecentEvents(packId, 30),
    ])
    return { pack, stats, events }
  })

export const getRecentActivity = createServerFn({ method: 'GET' }).handler(
  async () => getRecentEvents(undefined, 20),
)
