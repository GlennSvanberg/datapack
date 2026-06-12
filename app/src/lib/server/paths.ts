import path from 'node:path'
import { fileURLToPath } from 'node:url'

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..')

export const DATA_DIR = path.join(appRoot, 'data')
export const PACKS_DIR = path.join(DATA_DIR, 'packs')
export const TELEMETRY_PATH = path.join(DATA_DIR, 'telemetry.json')
export const REGISTRY_PATH = path.join(DATA_DIR, 'pack-registry.json')
