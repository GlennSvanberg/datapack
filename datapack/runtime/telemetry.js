const DataPackTelemetry = (() => {
  function getApiBase(manifest) {
    return manifest.meta.apiBase || 'http://localhost:4040'
  }

  function send(manifest, event, payload = {}) {
    const body = {
      packId: manifest.meta.packId,
      event,
      timestamp: new Date().toISOString(),
      payload: { ...payload, language: DataPackI18n.getLang() },
    }

    const url = `${getApiBase(manifest)}/api/telemetry`

    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      mode: 'cors',
    }).catch(() => {
      // Best-effort — never block UI
    })
  }

  return { send, getApiBase }
})()
