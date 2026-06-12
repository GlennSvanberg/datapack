const DataPackApp = (() => {
  let manifest = window.DATAPACK_MANIFEST
  let searchQuery = ''
  let selectedSku = null
  let searchTelemetryTimer = null

  const FORMAT_ICONS = { csv: '📊', xlsx: '📗', json: '{ }', xml: '<>' }
  const WIZARD_STEPS = 5

  let wizard = createWizardState()

  const $ = (id) => document.getElementById(id)

  function createWizardState(overrides = {}) {
    const exportableFields = manifest.schema.filter((f) => f.exportable).map((f) => f.name)
    const exportableAttrs = DataPackExport.getExportableAttributes(manifest).map((a) => a.id)
    const format = 'csv'
    return {
      open: false,
      step: 0,
      format,
      layout: DataPackExport.getDefaultLayout(format, exportableAttrs.length > 0),
      structure: 'nested',
      scope: 'all',
      productFields: [...exportableFields],
      attributeFields: [...exportableAttrs],
      attributeSearch: '',
      singleSku: null,
      source: 'catalog',
      downloaded: false,
      ...overrides,
    }
  }

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

  function isStructuredFormat() {
    return wizard.format === 'json' || wizard.format === 'xml'
  }

  function getLayoutLabel() {
    const key = isStructuredFormat()
      ? `structure${wizard.structure.charAt(0).toUpperCase()}${wizard.structure.slice(1)}`
      : `layout${wizard.layout.charAt(0).toUpperCase()}${wizard.layout.slice(1)}`
    return DataPackI18n.t(key)
  }

  function hasValidExportSelection() {
    return wizard.productFields.length > 0 || wizard.attributeFields.length > 0
  }

  function isStale() {
    return new Date(manifest.meta.staleAfter) < new Date()
  }

  function formatHeroDate() {
    return DataPackI18n.formatDate(manifest.meta.generatedAt)
  }

  function getQuickExportOptions(format) {
    const exportableFields = manifest.schema.filter((f) => f.exportable).map((f) => f.name)
    const exportableAttrs = DataPackExport.getExportableAttributes(manifest).map((a) => a.id)
    const hasAttrs = exportableAttrs.length > 0
    if (format === 'json') {
      return {
        productFields: exportableFields,
        attributeFields: exportableAttrs,
        format: 'json',
        layout: 'wide',
        structure: 'nested',
        manifest,
      }
    }
    return {
      productFields: exportableFields,
      attributeFields: exportableAttrs,
      format,
      layout: DataPackExport.getDefaultLayout(format, hasAttrs),
      structure: 'nested',
      manifest,
    }
  }

  function quickExport(preset) {
    const formatMap = { excel: 'xlsx', csv: 'csv', json: 'json' }
    const format = formatMap[preset]
    const products = manifest.products
    const options = getQuickExportOptions(format)
    const prepared = DataPackExport.exportData(products, options, format, manifest)

    const successEl = $('hero-success')
    successEl.hidden = false
    successEl.textContent = DataPackI18n.t('quickExportSuccess')

    DataPackTelemetry.send(manifest, 'export', {
      format,
      source: 'quick',
      preset,
      filename: prepared.filename,
      productCount: products.length,
      fieldCount: options.productFields.length,
      attributeCount: options.attributeFields.length,
    })
  }

  function renderPageTitle() {
    const brand = manifest.meta.brand || 'Friluftsportalen'
    const assortment = manifest.meta.assortment || manifest.meta.packId
    document.title = `${brand} — ${assortment}`
    document.documentElement.lang = DataPackI18n.getLang()
  }

  function renderHero() {
    $('hero-title').textContent = manifest.meta.assortment || manifest.meta.packId
    $('hero-subline').textContent = DataPackI18n.t('heroSubline')
    $('hero-trust').textContent = DataPackI18n.t('heroTrust')

    const count = manifest.products.length
    const metaParts = [
      DataPackI18n.t('summaryProducts', { n: count }),
      DataPackI18n.t('heroUpdated', { date: formatHeroDate() }),
      DataPackI18n.t('heroWorksOffline'),
    ]
    $('hero-meta').textContent = metaParts.join(' · ')

    const staleEl = $('hero-stale')
    if (isStale()) {
      staleEl.hidden = false
      $('hero-stale-msg').textContent =
        DataPackI18n.t('staleCalm') + ' ' + DataPackI18n.t('staleReassurance')
    } else {
      staleEl.hidden = true
    }

    $('quick-excel').innerHTML = `${escHtml(DataPackI18n.t('quickExcel'))}<span class="quick-export-badge">${escHtml(DataPackI18n.t('recommended'))}</span>`
    $('quick-csv').textContent = DataPackI18n.t('quickCsv')
    $('quick-json').textContent = DataPackI18n.t('quickJson')
    $('hero-customize').textContent = DataPackI18n.t('heroBrowseCustomize')
  }

  function renderFooter() {
    const footer = $('pack-footer')
    const email = manifest.meta.contactEmail
    if (!email) {
      footer.hidden = true
      footer.innerHTML = ''
      return
    }
    footer.hidden = false
    footer.innerHTML = `${escHtml(DataPackI18n.t('contactQuestions'))} <a href="mailto:${escHtml(email)}">${escHtml(email)}</a>`
  }

  function hideHeroSuccess() {
    $('hero-success').hidden = true
  }

  function getExportOptions() {
    return {
      productFields: wizard.productFields,
      attributeFields: wizard.attributeFields,
      format: wizard.format,
      layout: wizard.layout,
      structure: wizard.structure,
      manifest,
    }
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
    $('btn-download').textContent = DataPackI18n.t('customizeExport')
    $('btn-update').textContent = DataPackI18n.t('update')
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

  function renderAll() {
    renderPageTitle()
    renderLangSwitcher()
    renderStaticLabels()
    renderHero()
    renderFooter()
    if (selectedSku) showProduct(selectedSku)
    else renderCatalog()
    if (wizard.open) renderWizard()
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
    $('pack-hero').hidden = false
    location.hash = ''
    renderCatalog()
  }

  function showProduct(sku) {
    const product = manifest.products.find((p) => p.sku === sku)
    if (!product) return
    selectedSku = sku
    $('catalog-view').classList.add('hidden')
    $('product-detail').classList.add('active')
    $('pack-hero').hidden = true
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
      li.innerHTML = `<span>${escHtml(DataPackI18n.attrKey(attr, manifest))}</span><span>${escHtml(attr.value)}</span>`
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

  function openWizard(singleSku) {
    hideHeroSuccess()
    wizard = createWizardState({
      open: true,
      scope: singleSku ? 'one' : 'all',
      singleSku: singleSku || null,
      source: singleSku ? 'product' : 'catalog',
    })
    $('wizard-overlay').classList.add('open')
    renderWizard()
  }

  function closeWizard() {
    if (wizard.open && !wizard.downloaded) {
      DataPackTelemetry.send(manifest, 'wizard_abandon', { step: wizard.step })
    }
    wizard.open = false
    $('wizard-overlay').classList.remove('open')
  }

  function renderWizardStepper() {
    const steps = $('wizard-steps')
    steps.innerHTML = ''
    const names = DataPackI18n.t('stepNames')

    for (let i = 0; i < WIZARD_STEPS; i++) {
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

  function renderLayoutCard(container, id, titleKey, descKey, selected, recommended, onClick) {
    const card = document.createElement('button')
    card.type = 'button'
    card.className = 'format-card layout-card' + (selected ? ' selected' : '')
    card.innerHTML = `
      <div class="format-card-title">${escHtml(DataPackI18n.t(titleKey))}</div>
      <div class="format-card-desc">${escHtml(DataPackI18n.t(descKey))}</div>
      ${recommended ? `<span class="layout-badge">${escHtml(DataPackI18n.t('recommended'))}</span>` : ''}
    `
    card.addEventListener('click', onClick)
    container.appendChild(card)
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
        const hasAttrs = wizard.attributeFields.length > 0
        if (fmt === 'json' || fmt === 'xml') {
          wizard.structure = 'nested'
        } else {
          wizard.layout = DataPackExport.getDefaultLayout(fmt, hasAttrs)
        }
        wizard.downloaded = false
        renderWizard()
      })
      opts.appendChild(card)
    }
    content.appendChild(opts)
  }

  function renderLayoutStep(content) {
    content.innerHTML = `
      <h3 class="step-heading">${escHtml(DataPackI18n.t('stepLayout'))}</h3>
      <p class="step-desc">${escHtml(DataPackI18n.t('stepLayoutDesc'))}</p>
    `
    const opts = document.createElement('div')
    opts.className = 'layout-options'

    if (isStructuredFormat()) {
      const structures = [
        ['flat', 'structureFlat', 'structureFlatDesc'],
        ['nested', 'structureNested', 'structureNestedDesc'],
        ['tall', 'structureTall', 'structureTallDesc'],
      ]
      for (const [id, titleKey, descKey] of structures) {
        renderLayoutCard(
          opts,
          id,
          titleKey,
          descKey,
          wizard.structure === id,
          id === 'nested',
          () => {
            wizard.structure = id
            wizard.downloaded = false
            renderWizard()
          },
        )
      }
    } else {
      const layouts = [
        ['wide', 'layoutWide', 'layoutWideDesc'],
        ['tall', 'layoutTall', 'layoutTallDesc'],
        ['split', 'layoutSplit', 'layoutSplitDesc'],
      ]
      for (const [id, titleKey, descKey] of layouts) {
        const disabled = id === 'split' && wizard.attributeFields.length === 0
        if (disabled) continue
        renderLayoutCard(
          opts,
          id,
          titleKey,
          descKey,
          wizard.layout === id,
          id === 'split' && (wizard.format === 'xlsx' || wizard.format === 'csv'),
          () => {
            wizard.layout = id
            wizard.downloaded = false
            renderWizard()
          },
        )
      }
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

  function renderFieldGroup(content, title, fields, selected, searchQuery, onToggle, onSelectAll, onSelectNone, countLabelFn) {
    const group = document.createElement('section')
    group.className = 'field-group'

    const header = document.createElement('div')
    header.className = 'field-group-header'
    header.innerHTML = `<h4>${escHtml(title)}</h4>`
    group.appendChild(header)

    const toolbar = document.createElement('div')
    toolbar.className = 'field-toolbar'
    toolbar.innerHTML = `
      <span class="field-count-label">${escHtml(countLabelFn())}</span>
      <div class="field-toolbar-actions">
        <button type="button" class="btn-link" data-action="all">${escHtml(DataPackI18n.t('selectAll'))}</button>
        <button type="button" class="btn-link" data-action="none">${escHtml(DataPackI18n.t('selectNone'))}</button>
      </div>
    `
    toolbar.querySelector('[data-action="all"]').addEventListener('click', onSelectAll)
    toolbar.querySelector('[data-action="none"]').addEventListener('click', onSelectNone)
    group.appendChild(toolbar)

    if (searchQuery !== null) {
      const searchWrap = document.createElement('div')
      searchWrap.className = 'attribute-search-wrap'
      searchWrap.innerHTML = `<input type="search" class="attribute-search" placeholder="${escHtml(DataPackI18n.t('searchAttributes'))}" value="${escHtml(searchQuery)}">`
      const input = searchWrap.querySelector('input')
      input.addEventListener('input', (e) => {
        wizard.attributeSearch = e.target.value
        renderWizard()
      })
      group.appendChild(searchWrap)
    }

    const list = document.createElement('div')
    list.className = 'field-list'
    const q = (searchQuery || '').toLowerCase().trim()

    for (const field of fields) {
      if (q && !field.label.toLowerCase().includes(q) && !field.id.toLowerCase().includes(q)) continue
      const label = document.createElement('label')
      label.className = 'field-item'
      const checked = selected.includes(field.id)
      label.innerHTML = `<input type="checkbox" ${checked ? 'checked' : ''}> <span>${escHtml(field.label)}</span>`
      label.querySelector('input').addEventListener('change', (e) => onToggle(field.id, e.target.checked))
      list.appendChild(label)
    }

    if (!list.children.length) {
      list.innerHTML = `<p class="field-empty">${escHtml(DataPackI18n.t('noResults'))}</p>`
    }

    group.appendChild(list)
    content.appendChild(group)
  }

  function renderFieldsStep(content) {
    const exportable = manifest.schema.filter((f) => f.exportable)
    const attrCatalog = DataPackExport.getExportableAttributes(manifest)

    content.innerHTML = `
      <h3 class="step-heading">${escHtml(DataPackI18n.t('stepFields'))}</h3>
      <p class="step-desc">${escHtml(DataPackI18n.t('stepFieldsDesc'))}</p>
    `

    renderFieldGroup(
      content,
      DataPackI18n.t('fieldGroupProducts'),
      exportable.map((f) => ({ id: f.name, label: DataPackI18n.schemaLabel(f) })),
      wizard.productFields,
      null,
      (id, checked) => {
        if (checked) {
          if (!wizard.productFields.includes(id)) wizard.productFields.push(id)
        } else wizard.productFields = wizard.productFields.filter((f) => f !== id)
        wizard.downloaded = false
        renderWizard()
      },
      () => {
        wizard.productFields = exportable.map((f) => f.name)
        wizard.downloaded = false
        renderWizard()
      },
      () => {
        wizard.productFields = []
        wizard.downloaded = false
        renderWizard()
      },
      () => DataPackI18n.t('fieldsSelected', { n: wizard.productFields.length, total: exportable.length }),
    )

    renderFieldGroup(
      content,
      DataPackI18n.t('fieldGroupAttributes'),
      attrCatalog.map((def) => ({ id: def.id, label: DataPackAttributes.attrLabel(def) })),
      wizard.attributeFields,
      wizard.attributeSearch,
      (id, checked) => {
        if (checked) {
          if (!wizard.attributeFields.includes(id)) wizard.attributeFields.push(id)
        } else wizard.attributeFields = wizard.attributeFields.filter((f) => f !== id)
        if (wizard.attributeFields.length === 0 && wizard.layout === 'split') {
          wizard.layout = 'wide'
        }
        wizard.downloaded = false
        renderWizard()
      },
      () => {
        wizard.attributeFields = attrCatalog.map((a) => a.id)
        wizard.downloaded = false
        renderWizard()
      },
      () => {
        wizard.attributeFields = []
        if (wizard.layout === 'split') wizard.layout = 'wide'
        wizard.downloaded = false
        renderWizard()
      },
      () =>
        DataPackI18n.t('attributesSelected', {
          n: wizard.attributeFields.length,
          total: attrCatalog.length,
        }),
    )
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

  function renderPreviewTable(rows, fields, labels, maxRows = 5) {
    const previewRows = rows.slice(0, maxRows)
    const thead = fields.map((f) => `<th>${escHtml(labels[f] || f)}</th>`).join('')
    const tbody = previewRows
      .map((row) => {
        const cells = fields
          .map((f) => {
            const val = row[f] ?? ''
            return `<td title="${escHtml(val)}">${escHtml(String(val))}</td>`
          })
          .join('')
        return `<tr>${cells}</tr>`
      })
      .join('')

    let moreHtml = ''
    if (rows.length > previewRows.length) {
      moreHtml = `<div class="preview-more">${escHtml(DataPackI18n.t('previewMore', { n: rows.length - previewRows.length }))}</div>`
    }

    return `
      <div class="preview-table-wrap">
        <table class="preview-table">
          <thead><tr>${thead}</tr></thead>
          <tbody>${tbody}</tbody>
        </table>
      </div>
      ${moreHtml}
    `
  }

  function renderPreviewPanel() {
    const summaryEl = $('preview-summary')
    const contentEl = $('preview-content')
    const products = getExportProducts()

    if (!hasValidExportSelection() || !products.length) {
      summaryEl.innerHTML = ''
      contentEl.innerHTML = `<p class="preview-empty">${escHtml(DataPackI18n.t('previewEmpty'))}</p>`
      return
    }

    const preview = DataPackExport.buildPreview(products, getExportOptions(), wizard.format, manifest)
    const formatLabel = DataPackI18n.t('formats')[wizard.format] || wizard.format

    summaryEl.innerHTML = `
      <span class="summary-chip"><strong>${escHtml(DataPackI18n.t('summaryProducts', { n: products.length }))}</strong></span>
      <span class="summary-chip"><strong>${escHtml(DataPackI18n.t('summaryFields', { n: preview.fieldCount }))}</strong></span>
      <span class="summary-chip"><strong>${escHtml(DataPackI18n.t('summaryAttributes', { n: preview.attributeCount }))}</strong></span>
      <span class="summary-chip">${escHtml(DataPackI18n.t('summaryFormat'))}: <strong>${escHtml(formatLabel)}</strong></span>
      <span class="summary-chip">${escHtml(DataPackI18n.t('summaryLayout'))}: <strong>${escHtml(getLayoutLabel())}</strong></span>
      <span class="summary-chip">${escHtml(DataPackI18n.t('summaryFilename'))}: <strong>${escHtml(preview.filename)}</strong></span>
    `

    if (preview.previewMode === 'split' && preview.splitPreview) {
      const p = preview.splitPreview.products
      const a = preview.splitPreview.attributes
      contentEl.innerHTML = `
        <div class="preview-split">
          <div class="preview-split-block">
            <h4 class="preview-split-title">${escHtml(DataPackI18n.t('previewSheetProducts'))}</h4>
            ${renderPreviewTable(p.rows, p.fields, p.labels)}
          </div>
          <div class="preview-split-block">
            <h4 class="preview-split-title">${escHtml(DataPackI18n.t('previewSheetAttributes'))}</h4>
            ${renderPreviewTable(a.rows, a.fields, a.labels)}
          </div>
        </div>
      `
      return
    }

    if (preview.isTabular && preview.previewRows.length) {
      contentEl.innerHTML = renderPreviewTable(
        preview.previewRows,
        preview.fields,
        preview.labels,
        preview.previewRows.length,
      )
      return
    }

    let note = ''
    if (preview.previewTruncated) {
      note = `<div class="preview-more">${escHtml(DataPackI18n.t('previewTruncated'))}</div>`
    }
    contentEl.innerHTML = `
      <pre class="preview-code">${escHtml(preview.previewText)}</pre>
      ${note}
    `
  }

  function renderWizard() {
    renderWizardStepper()

    const content = $('wizard-content')
    content.innerHTML = ''

    if (wizard.step === 0) renderFormatStep(content)
    else if (wizard.step === 1) renderLayoutStep(content)
    else if (wizard.step === 2) renderScopeStep(content)
    else if (wizard.step === 3) renderFieldsStep(content)
    else renderReviewStep(content)

    renderPreviewPanel()

    const backBtn = $('wizard-back')
    const nextBtn = $('wizard-next')
    const lastStep = WIZARD_STEPS - 1

    backBtn.style.visibility = wizard.step === 0 ? 'hidden' : 'visible'

    nextBtn.classList.remove('is-ready', 'is-success')
    if (wizard.step < lastStep) {
      nextBtn.textContent = DataPackI18n.t('next')
      nextBtn.disabled = wizard.step === 3 && !hasValidExportSelection()
    } else {
      nextBtn.textContent = wizard.downloaded
        ? DataPackI18n.t('downloadAgain')
        : DataPackI18n.t('download_btn')
      nextBtn.classList.add('is-ready')
      if (wizard.downloaded) nextBtn.classList.add('is-success')
      nextBtn.disabled = !hasValidExportSelection() || getExportProducts().length === 0
    }
  }

  function wizardNext() {
    const lastStep = WIZARD_STEPS - 1
    if (wizard.step < lastStep) {
      if (wizard.step === 3 && !hasValidExportSelection()) return
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
    const options = getExportOptions()
    const exportable = manifest.schema.filter((f) => f.exportable)
    const attrCatalog = DataPackExport.getExportableAttributes(manifest)
    const prepared = DataPackExport.exportData(products, options, wizard.format, manifest)
    const allProductFields = wizard.productFields.length === exportable.length
    DataPackTelemetry.send(manifest, 'export', {
      format: wizard.format,
      fields: [...wizard.productFields, ...wizard.attributeFields.map((id) => `attr:${id}`)],
      productFields: wizard.productFields,
      attributeFields: wizard.attributeFields,
      layout: isStructuredFormat() ? undefined : wizard.layout,
      structure: isStructuredFormat() ? wizard.structure : undefined,
      scope: wizard.scope,
      productCount: products.length,
      fieldCount: wizard.productFields.length,
      attributeCount: wizard.attributeFields.length,
      totalFields: exportable.length + attrCatalog.length,
      allFieldsSelected: allProductFields && wizard.attributeFields.length === attrCatalog.length,
      searchQuery:
        wizard.scope === 'filtered' && searchQuery.trim() ? searchQuery.trim() : undefined,
      productSku:
        wizard.scope === 'one' ? wizard.singleSku || selectedSku || undefined : undefined,
      source: wizard.singleSku ? 'product' : 'wizard',
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
    $('hero-customize').addEventListener('click', () => openWizard(null))
    $('quick-excel').addEventListener('click', () => quickExport('excel'))
    $('quick-csv').addEventListener('click', () => quickExport('csv'))
    $('quick-json').addEventListener('click', () => quickExport('json'))
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
