const DataPackApp = (() => {
  let manifest = window.DATAPACK_MANIFEST
  let searchQuery = ''
  let selectedSku = null
  let searchTelemetryTimer = null

  const FORMAT_ICONS = { csv: '📊', xlsx: '📗', json: '{ }', xml: '<>' }

  let wizard = {
    open: false,
    step: 0,
    format: 'csv',
    scope: 'all',
    fields: [],
    singleSku: null,
    source: 'catalog',
    downloaded: false,
  }

  const $ = (id) => document.getElementById(id)

  function getFilteredProducts() {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return manifest.products
    return manifest.products.filter((p) => {
      const texts = p.texts[DataPackI18n.getLang()] || p.texts.sv
      return (
        p.sku.toLowerCase().includes(q) ||
        texts.name.toLowerCase().includes(q) ||
        texts.description.toLowerCase().includes(q)
      )
    })
  }

  function formatPrice(price) {
    return `${price.toLocaleString('sv-SE')} SEK`
  }

  function escHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
  }

  function renderLangSwitcher() {
    const el = $('lang-switcher')
    el.innerHTML = ''
    for (const lang of DataPackI18n.LANGS) {
      const btn = document.createElement('button')
      btn.type = 'button'
      btn.className = 'lang-btn' + (DataPackI18n.getLang() === lang ? ' active' : '')
      btn.textContent = lang.toUpperCase()
      btn.addEventListener('click', () => {
        DataPackI18n.setLang(lang)
        renderAll()
      })
      el.appendChild(btn)
    }
  }

  function renderStaticLabels() {
    $('btn-download').textContent = DataPackI18n.t('download')
    $('btn-update').textContent = DataPackI18n.t('update')
    $('stale-message').textContent = DataPackI18n.t('stale')
    $('search').placeholder = DataPackI18n.t('search')
    $('btn-back').textContent = '← ' + DataPackI18n.t('back')
    $('btn-export-product').textContent = DataPackI18n.t('exportProduct')
    $('wizard-title').textContent = DataPackI18n.t('wizardTitle')
    $('wizard-subtitle').textContent = DataPackI18n.t('wizardSubtitle')
    $('preview-title').textContent = DataPackI18n.t('previewTitle')
    $('preview-hint').textContent = DataPackI18n.t('previewHint')
    $('wizard-back').textContent = DataPackI18n.t('back_btn')
    $('wizard-close').setAttribute('aria-label', DataPackI18n.t('close'))
  }

  function renderStaleBanner() {
    const stale = new Date(manifest.meta.staleAfter) < new Date()
    $('stale-banner').classList.toggle('visible', stale)
  }

  function renderCatalog() {
    const products = getFilteredProducts()
    const grid = $('catalog-grid')
    grid.innerHTML = ''

    if (products.length === 0) {
      grid.innerHTML = `<p class="empty-state">${DataPackI18n.t('noResults')}</p>`
      return
    }

    for (const product of products) {
      const texts = product.texts[DataPackI18n.getLang()] || product.texts.sv
      const card = document.createElement('article')
      card.className = 'product-card'
      card.innerHTML = `
        <img src="${product.imageUrl}" alt="${escHtml(texts.name)}" loading="lazy">
        <div class="product-card-body">
          <p class="sku">${escHtml(product.sku)}</p>
          <h3>${escHtml(texts.name)}</h3>
          <p class="price">${formatPrice(product.price)}</p>
        </div>
      `
      card.addEventListener('click', () => showProduct(product.sku))
      grid.appendChild(card)
    }
  }

  function showCatalog() {
    selectedSku = null
    $('catalog-view').classList.remove('hidden')
    $('product-detail').classList.remove('active')
    location.hash = ''
    renderCatalog()
  }

  function showProduct(sku) {
    const product = manifest.products.find((p) => p.sku === sku)
    if (!product) return
    selectedSku = sku
    $('catalog-view').classList.add('hidden')
    $('product-detail').classList.add('active')
    location.hash = `product/${sku}`

    const texts = product.texts[DataPackI18n.getLang()] || product.texts.sv
    $('detail-image').src = product.imageUrl
    $('detail-image').alt = texts.name
    $('detail-sku').textContent = product.sku
    $('detail-name').textContent = texts.name
    $('detail-price').textContent = formatPrice(product.price)
    $('detail-desc').textContent = texts.description

    const attrs = $('detail-attrs')
    attrs.innerHTML = ''
    for (const attr of product.attributes) {
      const li = document.createElement('li')
      li.innerHTML = `<span>${escHtml(DataPackI18n.attrKey(attr))}</span><span>${escHtml(attr.value)}</span>`
      attrs.appendChild(li)
    }
    const stockLi = document.createElement('li')
    stockLi.innerHTML = `<span>${DataPackI18n.t('stock')}</span><span>${product.stock}</span>`
    attrs.appendChild(stockLi)
  }

  function getScopeProductCount(scope) {
    if (scope === 'one') return wizard.singleSku || selectedSku ? 1 : 0
    if (scope === 'filtered') return getFilteredProducts().length
    return manifest.products.length
  }

  function getExportProducts() {
    if (wizard.scope === 'one') {
      const sku = wizard.singleSku || selectedSku
      const p = manifest.products.find((x) => x.sku === sku)
      return p ? [p] : []
    }
    if (wizard.scope === 'filtered') return getFilteredProducts()
    return manifest.products
  }

  function getExportFields() {
    const exportable = manifest.schema.filter((f) => f.exportable).map((f) => f.name)
    return wizard.fields.length ? wizard.fields : exportable
  }

  function openWizard(singleSku) {
    wizard = {
      open: true,
      step: 0,
      format: 'csv',
      scope: singleSku ? 'one' : 'all',
      fields: manifest.schema.filter((f) => f.exportable).map((f) => f.name),
      singleSku: singleSku || null,
      source: singleSku ? 'product' : 'catalog',
      downloaded: false,
    }
    $('wizard-overlay').classList.add('open')
    renderWizard()
  }

  function closeWizard() {
    wizard.open = false
    $('wizard-overlay').classList.remove('open')
  }

  function renderWizardStepper() {
    const steps = $('wizard-steps')
    steps.innerHTML = ''
    const stepNames = DataPackI18n.t('stepNames')
    const names = Array.isArray(stepNames) ? stepNames : ['Format', 'Products', 'Fields', 'Download']

    for (let i = 0; i < 4; i++) {
      const item = document.createElement('div')
      item.className = 'wizard-step-item'
      if (i < wizard.step) item.classList.add('done')
      if (i === wizard.step) item.classList.add('current')
      item.innerHTML = `
        <span class="wizard-step-num">${i < wizard.step ? '✓' : i + 1}</span>
        <span class="wizard-step-label">${escHtml(names[i] || '')}</span>
      `
      steps.appendChild(item)
    }
  }

  function renderFormatStep(content) {
    content.innerHTML = `
      <h3 class="step-heading">${escHtml(DataPackI18n.t('stepFormat'))}</h3>
      <p class="step-desc">${escHtml(DataPackI18n.t('stepFormatDesc'))}</p>
    `
    const opts = document.createElement('div')
    opts.className = 'format-options'
    const descs = DataPackI18n.t('formatDesc')

    for (const fmt of ['csv', 'xlsx', 'json', 'xml']) {
      const card = document.createElement('button')
      card.type = 'button'
      card.className = 'format-card' + (wizard.format === fmt ? ' selected' : '')
      card.innerHTML = `
        <div class="format-card-icon">${FORMAT_ICONS[fmt]}</div>
        <div class="format-card-title">${escHtml(DataPackI18n.t('formats')[fmt] || fmt)}</div>
        <div class="format-card-desc">${escHtml(descs[fmt] || '')}</div>
      `
      card.addEventListener('click', () => {
        wizard.format = fmt
        wizard.downloaded = false
        renderWizard()
      })
      opts.appendChild(card)
    }
    content.appendChild(opts)
  }

  function renderScopeStep(content) {
    content.innerHTML = `
      <h3 class="step-heading">${escHtml(DataPackI18n.t('stepScope'))}</h3>
      <p class="step-desc">${escHtml(DataPackI18n.t('stepScopeDesc'))}</p>
    `
    const opts = document.createElement('div')
    opts.className = 'scope-options'

    const scopes = wizard.singleSku
      ? [['one', DataPackI18n.t('scopeOne'), DataPackI18n.t('scopeOneDesc')]]
      : [
          ['all', DataPackI18n.t('scopeAll'), DataPackI18n.t('scopeAllDesc')],
          ['filtered', DataPackI18n.t('scopeFiltered'), DataPackI18n.t('scopeFilteredDesc')],
          ['one', DataPackI18n.t('scopeOne'), DataPackI18n.t('scopeOneDesc')],
        ]

    for (const [scope, title, desc] of scopes) {
      const count = getScopeProductCount(scope)
      const card = document.createElement('button')
      card.type = 'button'
      card.className = 'scope-card' + (wizard.scope === scope ? ' selected' : '')
      card.innerHTML = `
        <div class="scope-card-body">
          <div class="scope-card-title">${escHtml(title)}</div>
          <div class="scope-card-desc">${escHtml(desc)}</div>
        </div>
        <span class="scope-badge">${escHtml(DataPackI18n.t('productCount', { n: count }))}</span>
      `
      card.addEventListener('click', () => {
        wizard.scope = scope
        wizard.downloaded = false
        renderWizard()
      })
      opts.appendChild(card)
    }
    content.appendChild(opts)
  }

  function renderFieldsStep(content) {
    const exportable = manifest.schema.filter((f) => f.exportable)
    content.innerHTML = `
      <h3 class="step-heading">${escHtml(DataPackI18n.t('stepFields'))}</h3>
      <p class="step-desc">${escHtml(DataPackI18n.t('stepFieldsDesc'))}</p>
    `

    const toolbar = document.createElement('div')
    toolbar.className = 'field-toolbar'
    toolbar.innerHTML = `
      <span class="field-count-label">${escHtml(DataPackI18n.t('fieldsSelected', { n: wizard.fields.length, total: exportable.length }))}</span>
      <div class="field-toolbar-actions">
        <button type="button" class="btn-link" data-action="all">${escHtml(DataPackI18n.t('selectAll'))}</button>
        <button type="button" class="btn-link" data-action="none">${escHtml(DataPackI18n.t('selectNone'))}</button>
      </div>
    `
    toolbar.querySelector('[data-action="all"]').addEventListener('click', () => {
      wizard.fields = exportable.map((f) => f.name)
      wizard.downloaded = false
      renderWizard()
    })
    toolbar.querySelector('[data-action="none"]').addEventListener('click', () => {
      wizard.fields = []
      wizard.downloaded = false
      renderWizard()
    })
    content.appendChild(toolbar)

    const list = document.createElement('div')
    list.className = 'field-list'
    for (const field of exportable) {
      const label = document.createElement('label')
      label.className = 'field-item'
      const checked = wizard.fields.includes(field.name)
      label.innerHTML = `<input type="checkbox" ${checked ? 'checked' : ''}> <span>${escHtml(DataPackI18n.schemaLabel(field))}</span>`
      label.querySelector('input').addEventListener('change', (e) => {
        if (e.target.checked) wizard.fields.push(field.name)
        else wizard.fields = wizard.fields.filter((f) => f !== field.name)
        wizard.downloaded = false
        renderWizard()
      })
      list.appendChild(label)
    }
    content.appendChild(list)
  }

  function renderReviewStep(content) {
    content.innerHTML = `
      <div class="review-step">
        <div class="review-icon">${wizard.downloaded ? '✅' : '📥'}</div>
        <h3 class="review-title">${escHtml(wizard.downloaded ? DataPackI18n.t('downloadSuccess') : DataPackI18n.t('readyToDownload'))}</h3>
        <p class="review-desc">${escHtml(DataPackI18n.t('stepReviewDesc'))}</p>
      </div>
    `
  }

  function renderPreviewPanel() {
    const summaryEl = $('preview-summary')
    const contentEl = $('preview-content')
    const fields = getExportFields()
    const products = getExportProducts()

    if (!fields.length || !products.length) {
      summaryEl.innerHTML = ''
      contentEl.innerHTML = `<p class="preview-empty">${escHtml(DataPackI18n.t('previewEmpty'))}</p>`
      return
    }

    const preview = DataPackExport.buildPreview(products, fields, wizard.format, manifest)
    const formatLabel = DataPackI18n.t('formats')[wizard.format] || wizard.format

    summaryEl.innerHTML = `
      <span class="summary-chip"><strong>${escHtml(DataPackI18n.t('summaryProducts', { n: preview.totalRows }))}</strong></span>
      <span class="summary-chip"><strong>${escHtml(DataPackI18n.t('summaryFields', { n: preview.fieldCount }))}</strong></span>
      <span class="summary-chip">${escHtml(DataPackI18n.t('summaryFormat'))}: <strong>${escHtml(formatLabel)}</strong></span>
      <span class="summary-chip">${escHtml(DataPackI18n.t('summaryFilename'))}: <strong>${escHtml(preview.filename)}</strong></span>
    `

    if (preview.isTabular && preview.previewRows.length) {
      const thead = preview.fields.map((f) => `<th>${escHtml(preview.labels[f] || f)}</th>`).join('')
      const tbody = preview.previewRows.map((row) => {
        const cells = preview.fields.map((f) => {
          const val = row[f] ?? ''
          return `<td title="${escHtml(val)}">${escHtml(String(val))}</td>`
        }).join('')
        return `<tr>${cells}</tr>`
      }).join('')

      let moreHtml = ''
      if (preview.totalRows > preview.previewRows.length) {
        moreHtml = `<div class="preview-more">${escHtml(DataPackI18n.t('previewMore', { n: preview.totalRows - preview.previewRows.length }))}</div>`
      }

      contentEl.innerHTML = `
        <div class="preview-table-wrap">
          <table class="preview-table">
            <thead><tr>${thead}</tr></thead>
            <tbody>${tbody}</tbody>
          </table>
        </div>
        ${moreHtml}
      `
    } else {
      let note = ''
      if (preview.previewTruncated) {
        note = `<div class="preview-more">${escHtml(DataPackI18n.t('previewTruncated'))}</div>`
      }
      contentEl.innerHTML = `
        <pre class="preview-code">${escHtml(preview.previewText)}</pre>
        ${note}
      `
    }
  }

  function renderWizard() {
    renderWizardStepper()

    const content = $('wizard-content')
    content.innerHTML = ''

    if (wizard.step === 0) renderFormatStep(content)
    else if (wizard.step === 1) renderScopeStep(content)
    else if (wizard.step === 2) renderFieldsStep(content)
    else renderReviewStep(content)

    renderPreviewPanel()

    const backBtn = $('wizard-back')
    const nextBtn = $('wizard-next')

    backBtn.style.visibility = wizard.step === 0 ? 'hidden' : 'visible'

    nextBtn.classList.remove('is-ready', 'is-success')
    if (wizard.step < 3) {
      nextBtn.textContent = DataPackI18n.t('next')
      nextBtn.disabled = wizard.step === 2 && wizard.fields.length === 0
    } else {
      nextBtn.textContent = wizard.downloaded
        ? DataPackI18n.t('downloadAgain')
        : DataPackI18n.t('download_btn')
      nextBtn.classList.add('is-ready')
      if (wizard.downloaded) nextBtn.classList.add('is-success')
      nextBtn.disabled = getExportFields().length === 0 || getExportProducts().length === 0
    }
  }

  function wizardNext() {
    if (wizard.step < 3) {
      if (wizard.step === 2 && wizard.fields.length === 0) return
      wizard.step++
      wizard.downloaded = false
      renderWizard()
      return
    }
    doExport()
    wizard.downloaded = true
    renderWizard()
  }

  function wizardBack() {
    if (wizard.step > 0) {
      wizard.step--
      wizard.downloaded = false
      renderWizard()
    }
  }

  function doExport() {
    const products = getExportProducts()
    const fields = getExportFields()
    const exportable = manifest.schema.filter((f) => f.exportable)
    const prepared = DataPackExport.exportData(products, fields, wizard.format, manifest)
    DataPackTelemetry.send(manifest, 'export', {
      format: wizard.format,
      fields,
      scope: wizard.scope,
      productCount: products.length,
      fieldCount: fields.length,
      totalFields: exportable.length,
      allFieldsSelected: fields.length === exportable.length,
      searchQuery:
        wizard.scope === 'filtered' && searchQuery.trim()
          ? searchQuery.trim()
          : undefined,
      productSku:
        wizard.scope === 'one'
          ? wizard.singleSku || selectedSku || undefined
          : undefined,
      source: wizard.source,
      filename: prepared.filename,
      catalogTotal: manifest.products.length,
    })
  }

  async function updateData() {
    const btn = $('btn-update')
    btn.disabled = true
    btn.textContent = '...'
    try {
      const fresh = await DataPackApi.fetchLatestPack(manifest)
      manifest = fresh
      window.DATAPACK_MANIFEST = fresh
      DataPackTelemetry.send(manifest, 'update', {})
      renderAll()
    } catch (err) {
      alert(err.message || 'Update failed')
    } finally {
      btn.disabled = false
      btn.textContent = DataPackI18n.t('update')
    }
  }

  function handleHash() {
    const hash = location.hash.slice(1)
    if (hash.startsWith('product/')) {
      showProduct(hash.replace('product/', ''))
    } else {
      showCatalog()
    }
  }

  function renderAll() {
    renderLangSwitcher()
    renderStaticLabels()
    renderStaleBanner()
    if (selectedSku) showProduct(selectedSku)
    else renderCatalog()
    if (wizard.open) renderWizard()
  }

  function bindEvents() {
    $('search').addEventListener('input', (e) => {
      searchQuery = e.target.value
      renderCatalog()
      if (searchQuery.trim()) {
        clearTimeout(searchTelemetryTimer)
        searchTelemetryTimer = setTimeout(() => {
          DataPackTelemetry.send(manifest, 'search', { query: searchQuery.trim() })
        }, 600)
      }
    })

    $('btn-download').addEventListener('click', () => openWizard(null))
    $('btn-export-product').addEventListener('click', () => openWizard(selectedSku))
    $('btn-back').addEventListener('click', showCatalog)
    $('btn-update').addEventListener('click', updateData)
    $('wizard-close').addEventListener('click', closeWizard)
    $('wizard-overlay').addEventListener('click', (e) => {
      if (e.target === $('wizard-overlay')) closeWizard()
    })
    $('wizard-next').addEventListener('click', wizardNext)
    $('wizard-back').addEventListener('click', wizardBack)
    window.addEventListener('hashchange', handleHash)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && wizard.open) closeWizard()
    })
  }

  function init() {
    if (!manifest || !manifest.products) {
      document.body.innerHTML = '<p style="padding:2rem;color:#e03e3e">Invalid DataPack manifest</p>'
      return
    }
    bindEvents()
    renderAll()
    handleHash()
    DataPackTelemetry.send(manifest, 'open', {})
  }

  return { init }
})()

document.addEventListener('DOMContentLoaded', () => DataPackApp.init())
