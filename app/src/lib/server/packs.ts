import { readFile } from 'node:fs/promises'
import type { PackManifest, PackRegistryEntry } from '#/lib/types'
import { PACKS_DIR, REGISTRY_PATH } from '#/lib/server/paths'

export async function readPack(packId: string): Promise<PackManifest | null> {
  try {
    const raw = await readFile(`${PACKS_DIR}/${packId}.json`, 'utf-8')
    return JSON.parse(raw) as PackManifest
  } catch {
    return null
  }
}

export async function listPacks(): Promise<PackRegistryEntry[]> {
  try {
    const raw = await readFile(REGISTRY_PATH, 'utf-8')
    return JSON.parse(raw) as PackRegistryEntry[]
  } catch {
    return []
  }
}
