/**
 * Friluftsportalen product embed — Web Component
 *
 *   <script src="https://your-host/v1/widget.js" defer></script>
 *   <fp-product pack-id="…" sku="…"></fp-product>
 *
 * Optional attributes:
 *   lang          — sv | no | da | fi (default sv)
 *   distributor   — retailer id for telemetry
 *   poll          — refresh interval in seconds (default 30)
 *   theme         — card (default) | inherit (match host page fonts/colors)
 *   target        — CSS selector; moves the widget into that container
 */
;(function () {
  'use strict'

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

  function buildEmbedUrl(apiBase, packId, sku, lang, distributor, theme) {
    var params = new URLSearchParams()
    params.set('lang', lang || 'sv')
    if (distributor) params.set('distributor', distributor)
    if (theme === 'inherit') params.set('theme', 'inherit')
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

  function loadingHtml(theme) {
    if (theme === 'inherit') {
      return '<div class="fp-embed fp-embed--inherit fp-embed--loading" data-fp-version="0"><span>Loading product…</span></div>'
    }
    return (
      '<div class="fp-embed fp-embed--loading" data-fp-version="0">' +
      '<style>.fp-embed{box-sizing:border-box;font-family:ui-sans-serif,system-ui,sans-serif;font-size:13px;color:#9ca3af;background:#1a1a1a;border:1px solid #2e2e2e;border-radius:10px;padding:16px;min-height:120px;display:flex;align-items:center;justify-content:center;max-width:360px;}</style>' +
      '<span>Loading product…</span></div>'
    )
  }

  function errorHtml(message, theme) {
    if (theme === 'inherit') {
      return '<div class="fp-embed fp-embed--inherit fp-embed--error" data-fp-version="0"><span>' + message + '</span></div>'
    }
    return (
      '<div style="color:#fca5a5;font:13px sans-serif;padding:12px;max-width:360px;">' +
      message +
      '</div>'
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

  function mountHtml(mountRoot, html, useShadow) {
    var template = document.createElement('template')
    template.innerHTML = html.trim()
    var node = template.content.firstElementChild
    if (useShadow) {
      mountRoot.replaceChildren(node || document.createTextNode(html))
    } else {
      mountRoot.innerHTML = html
      node = mountRoot.firstElementChild
    }
    return node
  }

  function relocateToTarget(host) {
    var selector = host.getAttribute('target')
    if (!selector) return
    try {
      var container = document.querySelector(selector)
      if (container && container !== host.parentElement) {
        container.appendChild(host)
      }
    } catch (_err) {
      /* invalid selector */
    }
  }

  class FpProduct extends HTMLElement {
    connectedCallback() {
      if (this._fpReady) return
      this._fpReady = true

      relocateToTarget(this)

      var packId = this.getAttribute('pack-id')
      var sku = this.getAttribute('sku')
      if (!packId || !sku) {
        this.innerHTML = errorHtml('Missing pack-id or sku', 'card')
        return
      }

      var lang = this.getAttribute('lang') || 'sv'
      var distributor = this.getAttribute('distributor') || ''
      var theme = this.getAttribute('theme') === 'inherit' ? 'inherit' : 'card'
      var poll = parseInt(this.getAttribute('poll') || '30', 10)
      if (!poll || poll < 1) poll = 30

      var useShadow = theme !== 'inherit'
      var apiBase = detectApiBase()
      var embedUrl = buildEmbedUrl(apiBase, packId, sku, lang, distributor, theme)
      var host = this
      var pollTimer = null
      var mountRoot

      if (useShadow) {
        mountRoot = this.attachShadow({ mode: 'open' })
        mountRoot.innerHTML = loadingHtml(theme)
      } else {
        this.style.display = 'block'
        this.style.width = '100%'
        mountRoot = this
        mountRoot.innerHTML = loadingHtml(theme)
      }

      function refresh() {
        return fetch(embedUrl, { credentials: 'omit' })
          .then(function (response) {
            return response.text().then(function (html) {
              if (!response.ok) {
                mountHtml(mountRoot, html || errorHtml('Product not found', theme), useShadow)
                return null
              }
              var root = mountHtml(mountRoot, html, useShadow)
              if (
                root &&
                !host._fpTelemetrySent &&
                root.getAttribute('data-fp-version') !== '0' &&
                !root.classList.contains('fp-embed--error')
              ) {
                host._fpTelemetrySent = true
                sendEmbedTelemetry(host, apiBase)
              }
              return root
            })
          })
          .catch(function () {
            var hasContent = useShadow
              ? mountRoot.querySelector('.fp-embed[data-fp-version]:not([data-fp-version="0"])')
              : host.querySelector('.fp-embed[data-fp-version]:not([data-fp-version="0"])')
            if (!hasContent) {
              if (useShadow) {
                mountRoot.innerHTML = errorHtml('Failed to load product data', theme)
              } else {
                host.innerHTML = errorHtml('Failed to load product data', theme)
              }
            }
          })
      }

      refresh()
      pollTimer = window.setInterval(refresh, poll * 1000)

      host._fpCleanup = function () {
        if (pollTimer !== null) {
          window.clearInterval(pollTimer)
          pollTimer = null
        }
      }
    }

    disconnectedCallback() {
      if (typeof this._fpCleanup === 'function') {
        this._fpCleanup()
      }
    }
  }

  if (!customElements.get('fp-product')) {
    customElements.define('fp-product', FpProduct)
  }
})()
