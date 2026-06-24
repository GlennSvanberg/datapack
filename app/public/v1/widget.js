/**
 * Friluftsportalen product embed — Web Component + htmx
 *
 * Usage on any external page (script may appear anywhere before the element):
 *
 *   <script src="https://your-host/v1/widget.js" defer></script>
 *   <fp-product pack-id="friluftsportalen-spring-tents-001" sku="TENT-001"></fp-product>
 *
 * Optional attributes: lang (default sv), distributor, poll (seconds, default 30)
 */
;(function () {
  'use strict'

  var HTMX_VERSION = '2.0.4'
  var HTMX_URL =
    'https://unpkg.com/htmx.org@' + HTMX_VERSION + '/dist/htmx.min.js'

  function findWidgetScript() {
    var scripts = document.querySelectorAll('script[src*="widget.js"]')
    return scripts.length ? scripts[scripts.length - 1] : null
  }

  function detectApiBase() {
    var script = findWidgetScript()
    if (!script || !script.src) return window.location.origin
    try {
      return new URL(script.src, window.location.href).origin
    } catch (_err) {
      return window.location.origin
    }
  }

  function loadHtmx() {
    if (window.htmx) return Promise.resolve(window.htmx)
    return new Promise(function (resolve, reject) {
      var existing = document.querySelector('script[data-fp-htmx]')
      if (existing) {
        existing.addEventListener('load', function () {
          resolve(window.htmx)
        })
        existing.addEventListener('error', function () {
          reject(new Error('Failed to load htmx'))
        })
        return
      }

      var script = document.createElement('script')
      script.src = HTMX_URL
      script.defer = true
      script.setAttribute('data-fp-htmx', '1')
      script.onload = function () {
        resolve(window.htmx)
      }
      script.onerror = function () {
        reject(new Error('Failed to load htmx'))
      }
      ;(document.head || document.documentElement).appendChild(script)
    })
  }

  function buildEmbedUrl(apiBase, packId, sku, lang, distributor) {
    var params = new URLSearchParams()
    params.set('lang', lang || 'sv')
    if (distributor) params.set('distributor', distributor)
    return (
      apiBase +
      '/v1/embed/products/' +
      encodeURIComponent(packId) +
      '/' +
      encodeURIComponent(sku) +
      '?' +
      params.toString()
    )
  }

  function loadingHtml() {
    return (
      '<div class="fp-embed fp-embed--loading" data-fp-version="0">' +
      '<style>.fp-embed{box-sizing:border-box;font-family:ui-sans-serif,system-ui,sans-serif;font-size:13px;color:#9ca3af;background:#1a1a1a;border:1px solid #2e2e2e;border-radius:10px;padding:16px;min-height:120px;display:flex;align-items:center;justify-content:center;max-width:360px;}</style>' +
      '<span>Loading product…</span></div>'
    )
  }

  function sendEmbedTelemetry(host, apiBase) {
    var packId = host.getAttribute('pack-id')
    var sku = host.getAttribute('sku')
    if (!packId || !sku) return

    var payload = {
      productSku: sku,
      language: host.getAttribute('lang') || 'sv',
    }
    var distributor = host.getAttribute('distributor')
    if (distributor) payload.distributor = distributor

    fetch(apiBase + '/api/telemetry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        packId: packId,
        event: 'embed_view',
        timestamp: new Date().toISOString(),
        payload: payload,
      }),
      keepalive: true,
    }).catch(function () {})
  }

  class FpProduct extends HTMLElement {
    connectedCallback() {
      if (this._fpReady) return
      this._fpReady = true

      var packId = this.getAttribute('pack-id')
      var sku = this.getAttribute('sku')
      if (!packId || !sku) {
        this.attachShadow({ mode: 'open' }).innerHTML =
          '<div style="color:#fca5a5;font:13px sans-serif;padding:12px;">Missing pack-id or sku</div>'
        return
      }

      var lang = this.getAttribute('lang') || 'sv'
      var distributor = this.getAttribute('distributor') || ''
      var poll = parseInt(this.getAttribute('poll') || '30', 10)
      if (!poll || poll < 1) poll = 30

      var apiBase = detectApiBase()
      var shadow = this.attachShadow({ mode: 'open' })
      shadow.innerHTML = loadingHtml()

      var host = this
      var container = shadow.firstElementChild

      loadHtmx()
        .then(function (htmx) {
          function wireContainer(el) {
            el.setAttribute('hx-get', buildEmbedUrl(apiBase, packId, sku, lang, distributor))
            el.setAttribute('hx-trigger', 'load, every ' + poll + 's')
            el.setAttribute('hx-swap', 'outerHTML')
            el.setAttribute('hx-target', 'this')
            htmx.process(el)
          }

          wireContainer(container)

          host.addEventListener('htmx:afterSwap', function onSwap(event) {
            var target = event.detail && event.detail.target
            if (!target || !shadow.contains(target)) return
            if (target.classList && target.classList.contains('fp-embed--error')) return
            if (!host._fpTelemetrySent && target.getAttribute('data-fp-version') !== '0') {
              host._fpTelemetrySent = true
              sendEmbedTelemetry(host, apiBase)
            }
            wireContainer(target)
          })
        })
        .catch(function () {
          shadow.innerHTML =
            '<div style="color:#fca5a5;font:13px sans-serif;padding:12px;">Failed to load embed</div>'
        })
    }
  }

  if (!customElements.get('fp-product')) {
    customElements.define('fp-product', FpProduct)
  }
})()
