const DataPackExport = (() => {
  const ATTR_PREFIX = 'attr_'

  function attrColumnName(attrId) {
    return `${ATTR_PREFIX}${attrId}`
  }

  function flattenProduct(product, fields, lang) {
    const row = {}
    const texts = product.texts[lang] || product.texts.sv
    for (const field of fields) {
      if (field === 'sku') row.sku = product.sku
      else if (field === 'name') row.name = texts.name
      else if (field === 'description') row.description = texts.description
      else if (field === 'price') row.price = product.price
      else if (field === 'stock') row.stock = product.stock
      else row[field] = product[field]
    }
    return row
  }

  function buildWideRows(products, productFields, attributeFields, manifest, lang) {
    return products.map((product) => {
      const row = flattenProduct(product, productFields, lang)
      for (const attrId of attributeFields) {
        row[attrColumnName(attrId)] = DataPackAttributes.getAttributeValue(product, attrId)
      }
      return row
    })
  }

  function buildTallRows(products, attributeFields, manifest, lang, includeSku = true) {
    const catalog = DataPackAttributes.getAttributeCatalog(manifest)
    const rows = []
    for (const product of products) {
      for (const attrId of attributeFields) {
        const def = DataPackAttributes.findDefinition(catalog, attrId)
        const row = {}
        if (includeSku) row.sku = product.sku
        row.attributeId = attrId
        row.attributeLabel = def ? DataPackAttributes.attrLabel(def) : attrId
        row.value = DataPackAttributes.getAttributeValue(product, attrId)
        rows.push(row)
      }
    }
    return rows
  }

  function getProductLabels(manifest, fields) {
    const labels = {}
    for (const f of manifest.schema) {
      if (fields.includes(f.name)) labels[f.name] = DataPackI18n.schemaLabel(f)
    }
    return labels
  }

  function getWideLabels(manifest, productFields, attributeFields) {
    const labels = getProductLabels(manifest, productFields)
    const catalog = DataPackAttributes.getAttributeCatalog(manifest)
    for (const attrId of attributeFields) {
      const def = DataPackAttributes.findDefinition(catalog, attrId)
      labels[attrColumnName(attrId)] = def ? DataPackAttributes.attrLabel(def) : attrId
    }
    return labels
  }

  function getTallFields(includeSku) {
    return includeSku
      ? ['sku', 'attributeId', 'attributeLabel', 'value']
      : ['attributeId', 'attributeLabel', 'value']
  }

  function getTallLabels(includeSku) {
    const labels = {
      attributeId: DataPackI18n.t('colAttributeId'),
      attributeLabel: DataPackI18n.t('colAttributeLabel'),
      value: DataPackI18n.t('colValue'),
    }
    if (includeSku) labels.sku = DataPackI18n.t('colSku')
    return labels
  }

  function toCsv(rows, fields, labels) {
    const header = fields.map((f) => labels[f] || f).join(',')
    const lines = rows.map((row) =>
      fields
        .map((f) => {
          const val = row[f] ?? ''
          const str = String(val).replace(/"/g, '""')
          return str.includes(',') || str.includes('"') || str.includes('\n')
            ? `"${str}"`
            : str
        })
        .join(','),
    )
    return [header, ...lines].join('\n')
  }

  function toJson(data) {
    return JSON.stringify(data, null, 2)
  }

  function escXml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
  }

  function toXmlFlat(rows, rootName) {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
    xml += `<${rootName}>\n`
    for (const row of rows) {
      xml += '  <product>\n'
      for (const [key, val] of Object.entries(row)) {
        const tag = key.startsWith(ATTR_PREFIX) ? key.slice(ATTR_PREFIX.length) : key
        xml += `    <${tag}>${escXml(val)}</${tag}>\n`
      }
      xml += '  </product>\n'
    }
    xml += `</${rootName}>`
    return xml
  }

  function toXmlNested(products, productFields, attributeFields, manifest, lang) {
    const catalog = DataPackAttributes.getAttributeCatalog(manifest)
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<products>\n'
    for (const product of products) {
      const row = flattenProduct(product, productFields, lang)
      xml += '  <product>\n'
      for (const [key, val] of Object.entries(row)) {
        xml += `    <${key}>${escXml(val)}</${key}>\n`
      }
      if (attributeFields.length) {
        xml += '    <attributes>\n'
        for (const attrId of attributeFields) {
          const def = DataPackAttributes.findDefinition(catalog, attrId)
          const label = def ? DataPackAttributes.attrLabel(def) : attrId
          const value = DataPackAttributes.getAttributeValue(product, attrId)
          xml += `      <attribute id="${escXml(attrId)}" label="${escXml(label)}">${escXml(value)}</attribute>\n`
        }
        xml += '    </attributes>\n'
      }
      xml += '  </product>\n'
    }
    xml += '</products>'
    return xml
  }

  function toXmlTall(rows) {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<attributeRecords>\n'
    for (const row of rows) {
      xml += '  <record>\n'
      for (const [key, val] of Object.entries(row)) {
        xml += `    <${key}>${escXml(val)}</${key}>\n`
      }
      xml += '  </record>\n'
    }
    xml += '</attributeRecords>'
    return xml
  }

  function buildJsonFlat(wideRows) {
    return wideRows.map((row) => {
      const out = {}
      for (const [key, val] of Object.entries(row)) {
        const outKey = key.startsWith(ATTR_PREFIX) ? key.slice(ATTR_PREFIX.length) : key
        out[outKey] = val
      }
      return out
    })
  }

  function buildJsonNested(products, productFields, attributeFields, manifest, lang) {
    const catalog = DataPackAttributes.getAttributeCatalog(manifest)
    return products.map((product) => {
      const item = flattenProduct(product, productFields, lang)
      if (attributeFields.length) {
        item.attributes = attributeFields.map((attrId) => {
          const def = DataPackAttributes.findDefinition(catalog, attrId)
          return {
            id: attrId,
            label: def ? DataPackAttributes.attrLabel(def) : attrId,
            value: DataPackAttributes.getAttributeValue(product, attrId),
          }
        })
      }
      return item
    })
  }

  function getFieldType(manifest, fieldName) {
    const field = manifest.schema.find((f) => f.name === fieldName)
    return field?.type || 'string'
  }

  function columnWidth(field, label, rows, fieldType) {
    const presets = {
      sku: 96,
      name: 200,
      description: 340,
      price: 88,
      stock: 72,
      attributeId: 120,
      attributeLabel: 160,
      value: 140,
    }
    if (presets[field]) return presets[field]

    const headerLen = (label || field).length
    let maxLen = headerLen
    for (const row of rows) {
      const val = row[field]
      if (val != null) {
        maxLen = Math.max(maxLen, Math.min(String(val).length, 48))
      }
    }
    if (fieldType === 'number') return Math.max(72, maxLen * 8 + 24)
    return Math.max(88, Math.min(maxLen * 8 + 32, 280))
  }

  function pxToExcelWidth(px) {
    return Math.max(8, Math.round(((px - 5) / 7) * 100) / 100)
  }

  function dataCellStyle(fieldName, val, fieldType) {
    if (fieldType !== 'number' && typeof val !== 'number') return 0
    if (fieldName === 'price') return 2
    if (fieldName === 'stock') return 3
    return Number.isInteger(Number(val)) ? 3 : 2
  }

  function rowsToXlsxData(rows, fields, manifest) {
    return rows.map((row) =>
      fields.map((f) => {
        const val = row[f] ?? ''
        const fieldType = getFieldType(manifest, f)
        if (fieldType === 'number' || typeof val === 'number') {
          return {
            type: 'number',
            value: val === '' ? 0 : Number(val),
            style: dataCellStyle(f, val, fieldType),
          }
        }
        return {
          type: 'string',
          value: String(val),
          style: 0,
        }
      }),
    )
  }

  function buildXlsxSheet(rows, fields, labels, manifest, sheetName) {
    const columns = fields.map((f) => ({
      header: labels[f] || f,
      width: pxToExcelWidth(columnWidth(f, labels[f] || f, rows, getFieldType(manifest, f))),
    }))
    return {
      name: sheetName,
      columns,
      rows: rowsToXlsxData(rows, fields, manifest),
    }
  }

  function resolveTabularLayout(format, layout, attributeFields) {
    if (format === 'json' || format === 'xml') return layout
    if (!attributeFields.length) return 'wide'
    if (layout === 'split') return 'split'
    return layout === 'tall' ? 'tall' : 'wide'
  }

  function getFilename(packId, format, layout) {
    if (format === 'csv' && layout === 'split') return `${packId}-export.zip`
    return `${packId}-export.${format}`
  }

  function getMime(format, layout) {
    if (format === 'csv' && layout === 'split') return 'application/zip'
    switch (format) {
      case 'csv':
        return 'text/csv;charset=utf-8'
      case 'json':
        return 'application/json'
      case 'xml':
        return 'application/xml'
      case 'xlsx':
        return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      default:
        return 'application/octet-stream'
    }
  }

  function buildExportPayload(products, options) {
    const {
      productFields = [],
      attributeFields = [],
      format,
      layout = 'wide',
      structure = 'nested',
      manifest,
    } = options
    const lang = DataPackI18n.getLang()
    const isStructured = format === 'json' || format === 'xml'
    const effectiveLayout = isStructured ? structure : resolveTabularLayout(format, layout, attributeFields)

    const productRows = products.map((p) => flattenProduct(p, productFields, lang))
    const wideRows = buildWideRows(products, productFields, attributeFields, manifest, lang)
    const tallRows = buildTallRows(products, attributeFields, manifest, lang, true)
    const wideFields = [...productFields, ...attributeFields.map(attrColumnName)]
    const wideLabels = getWideLabels(manifest, productFields, attributeFields)
    const tallFields = getTallFields(true)
    const tallLabels = getTallLabels(true)

    let content = null
    let filename = getFilename(manifest.meta.packId, format, effectiveLayout)
    let mime = getMime(format, effectiveLayout)
    let previewMode = 'wide'
    let previewRows = wideRows
    let previewFields = wideFields
    let previewLabels = wideLabels
    let splitPreview = null

    if (format === 'csv') {
      if (effectiveLayout === 'split') {
        const productsCsv = toCsv(productRows, productFields, getProductLabels(manifest, productFields))
        const attrsCsv = toCsv(tallRows, tallFields, tallLabels)
        const enc = new TextEncoder()
        content = DataPackXlsxWriter.buildZip([
          { name: 'products.csv', data: enc.encode(productsCsv) },
          { name: 'attributes.csv', data: enc.encode(attrsCsv) },
        ])
        previewMode = 'split'
        splitPreview = {
          products: { rows: productRows, fields: productFields, labels: getProductLabels(manifest, productFields) },
          attributes: { rows: tallRows, fields: tallFields, labels: tallLabels },
        }
      } else if (effectiveLayout === 'tall') {
        content = toCsv(tallRows, tallFields, tallLabels)
        previewMode = 'tall'
        previewRows = tallRows
        previewFields = tallFields
        previewLabels = tallLabels
      } else {
        content = toCsv(wideRows, wideFields, wideLabels)
      }
    } else if (format === 'xlsx') {
      if (effectiveLayout === 'split') {
        const sheets = [
          buildXlsxSheet(productRows, productFields, getProductLabels(manifest, productFields), manifest, DataPackI18n.t('sheetProducts')),
          buildXlsxSheet(tallRows, tallFields, tallLabels, manifest, DataPackI18n.t('sheetAttributes')),
        ]
        content = DataPackXlsxWriter.buildWorkbook(sheets)
        previewMode = 'split'
        splitPreview = {
          products: { rows: productRows, fields: productFields, labels: getProductLabels(manifest, productFields) },
          attributes: { rows: tallRows, fields: tallFields, labels: tallLabels },
        }
      } else if (effectiveLayout === 'tall') {
        const tallSheet = buildXlsxSheet(
          tallRows,
          tallFields,
          tallLabels,
          manifest,
          DataPackI18n.t('sheetAttributes'),
        )
        content = DataPackXlsxWriter.build({
          sheetName: tallSheet.name,
          columns: tallSheet.columns,
          rows: tallSheet.rows,
        })
        previewMode = 'tall'
        previewRows = tallRows
        previewFields = tallFields
        previewLabels = tallLabels
      } else {
        const wideSheet = buildXlsxSheet(
          wideRows,
          wideFields,
          wideLabels,
          manifest,
          DataPackI18n.t('sheetProducts'),
        )
        content = DataPackXlsxWriter.build({
          sheetName: wideSheet.name,
          columns: wideSheet.columns,
          rows: wideSheet.rows,
        })
      }
    } else if (format === 'json') {
      if (effectiveLayout === 'tall') {
        content = toJson(tallRows)
        previewMode = 'tall'
        previewRows = tallRows
        previewFields = tallFields
        previewLabels = tallLabels
      } else if (effectiveLayout === 'nested') {
        content = toJson(buildJsonNested(products, productFields, attributeFields, manifest, lang))
        previewMode = 'code'
      } else {
        content = toJson(buildJsonFlat(wideRows))
      }
    } else if (format === 'xml') {
      if (effectiveLayout === 'tall') {
        content = toXmlTall(tallRows)
        previewMode = 'tall'
        previewRows = tallRows
        previewFields = tallFields
        previewLabels = tallLabels
      } else if (effectiveLayout === 'nested') {
        content = toXmlNested(products, productFields, attributeFields, manifest, lang)
        previewMode = 'code'
      } else {
        content = toXmlFlat(wideRows, 'products')
      }
    }

    return {
      content,
      filename,
      mime,
      effectiveLayout,
      previewMode,
      previewRows,
      previewFields,
      previewLabels,
      splitPreview,
      productRows,
      wideRows,
      tallRows,
      productFields,
      attributeFields,
      wideFields,
      wideLabels,
    }
  }

  function prepareExport(products, optionsOrFields, format, manifest, legacyOptions = {}) {
    const options =
      typeof optionsOrFields === 'object' && !Array.isArray(optionsOrFields) && optionsOrFields.manifest
        ? optionsOrFields
        : {
            productFields: optionsOrFields,
            attributeFields: [],
            format,
            layout: 'wide',
            structure: 'nested',
            manifest,
            ...legacyOptions,
          }

    const { productFields, attributeFields, format: fmt, layout, structure, manifest: m } = options
    const skipContent = options.skipContent === true
    const built = buildExportPayload(products, options)

    return {
      rows: built.previewRows,
      fields: built.previewFields,
      labels: built.previewLabels,
      content: skipContent ? null : built.content,
      filename: built.filename,
      mime: built.mime,
      format: fmt,
      layout: built.effectiveLayout,
      structure,
      productCount: products.length,
      fieldCount: productFields.length,
      attributeCount: attributeFields.length,
      previewMode: built.previewMode,
      splitPreview: built.splitPreview,
      productFields,
      attributeFields,
    }
  }

  function truncateText(text, maxLen = 1200) {
    if (text.length <= maxLen) return { text, truncated: false }
    return { text: text.slice(0, maxLen) + '\n…', truncated: true }
  }

  function buildPreview(products, options, format, manifest, maxRows = 5) {
    const normalized =
      typeof options === 'object' && !Array.isArray(options)
        ? options
        : {
            productFields: options?.length ? options : manifest.schema.filter((f) => f.exportable).map((f) => f.name),
            attributeFields: [],
            format,
            layout: 'wide',
            structure: 'nested',
            manifest,
          }

    if (!normalized.productFields?.length && !normalized.attributeFields?.length) {
      normalized.productFields = manifest.schema.filter((f) => f.exportable).map((f) => f.name)
    }

    const prepared = prepareExport(products, { ...normalized, manifest, skipContent: format === 'xlsx' }, format, manifest)
    const previewRows = prepared.rows.slice(0, maxRows)
    const isTabular = format === 'csv' || format === 'xlsx'
    let previewText = ''
    let previewTruncated = prepared.rows.length > maxRows

    if (prepared.previewMode === 'code' && !isTabular) {
      const built = buildExportPayload(products, { ...normalized, manifest })
      const truncated = truncateText(
        typeof built.content === 'string' ? built.content : '',
        1400,
      )
      previewText = truncated.text
      previewTruncated = truncated.truncated || previewTruncated
    } else if (prepared.previewMode === 'split' && prepared.splitPreview) {
      previewTruncated = false
    } else if (!isTabular) {
      const built = buildExportPayload(products, { ...normalized, manifest })
      const truncated = truncateText(
        typeof built.content === 'string' ? built.content : '',
        1400,
      )
      previewText = truncated.text
      previewTruncated = truncated.truncated || previewTruncated
    } else if (format === 'csv') {
      const truncated = truncateText(
        toCsv(previewRows, prepared.fields, prepared.labels),
        2000,
      )
      previewText = truncated.text
      previewTruncated = truncated.truncated || previewTruncated
    }

    return {
      ...prepared,
      previewRows,
      previewText,
      previewTruncated,
      totalRows: prepared.rows.length,
      isTabular,
    }
  }

  function download(content, filename, mime) {
    const blob = new Blob([content], { type: mime })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  function exportData(products, options, format, manifest) {
    const prepared = prepareExport(products, options, format, manifest)
    download(prepared.content, prepared.filename, prepared.mime)
    return prepared
  }

  function getDefaultLayout(format, hasAttributes) {
    if (format === 'json' || format === 'xml') return 'nested'
    if (hasAttributes && (format === 'xlsx' || format === 'csv')) return 'split'
    return 'wide'
  }

  function getExportableAttributes(manifest) {
    return DataPackAttributes.getAttributeCatalog(manifest)
  }

  return {
    flattenProduct,
    prepareExport,
    buildPreview,
    exportData,
    getFilename,
    getDefaultLayout,
    getExportableAttributes,
    buildWideRows,
    buildTallRows,
  }
})()
