const DataPackApi = (() => {
  async function fetchLatestPack(manifest) {
    const base = DataPackTelemetry.getApiBase(manifest)
    const url = `${base}/api/packs/${encodeURIComponent(manifest.meta.packId)}`
    const res = await fetch(url, { mode: 'cors' })
    if (!res.ok) throw new Error(`Update failed: ${res.status}`)
    return res.json()
  }

  return { fetchLatestPack }
})()
