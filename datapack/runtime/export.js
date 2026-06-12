const DataPackExport = (() => {
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

  function toCsv(rows, fields, labels) {
    const header = fields.map((f) => labels[f] || f).join(',')
    const lines = rows.map((row) =>
      fields.map((f) => {
        const val = row[f] ?? ''
        const str = String(val).replace(/"/g, '""')
        return str.includes(',') || str.includes('"') || str.includes('\n')
          ? `"${str}"`
          : str
      }).join(','),
    )
    return [header, ...lines].join('\n')
  }

  function toJson(rows) {
    return JSON.stringify(rows, null, 2)
  }

  function toXml(rows, rootName) {
    const esc = (s) =>
      String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
    xml += `<${rootName}>\n`
    for (const row of rows) {
      xml += '  <product>\n'
      for (const [key, val] of Object.entries(row)) {
        xml += `    <${key}>${esc(val)}</${key}>\n`
      }
      xml += '  </product>\n'
    }
    xml += `</${rootName}>`
    return xml
  }

  function toXlsx(rows, fields, labels) {
    const esc = (s) =>
      String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
    let xml = '<?xml version="1.0"?>\n'
    xml += '<?mso-application progid="Excel.Sheet"?>\n'
    xml += '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet">\n'
    xml += '<Worksheet ss:Name="Products" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">\n'
    xml += '<Table>\n'
    xml += '<Row>' + fields.map((f) => `<Cell><Data ss:Type="String">${esc(labels[f] || f)}</Data></Cell>`).join('') + '</Row>\n'
    for (const row of rows) {
      xml += '<Row>'
      for (const f of fields) {
        const val = row[f] ?? ''
        const type = typeof val === 'number' ? 'Number' : 'String'
        xml += `<Cell><Data ss:Type="${type}">${esc(val)}</Data></Cell>`
      }
      xml += '</Row>\n'
    }
    xml += '</Table></Worksheet></Workbook>'
    return xml
  }

  function getLabels(manifest, fields) {
    const labels = {}
    for (const f of manifest.schema) {
      if (fields.includes(f.name)) labels[f.name] = DataPackI18n.schemaLabel(f)
    }
    return labels
  }

  function getFilename(packId, format) {
    const ext = format === 'xlsx' ? 'xls' : format
    return `${packId}-export.${ext}`
  }

  function buildContent(rows, fields, labels, format) {
    switch (format) {
      case 'csv':
        return toCsv(rows, fields, labels)
      case 'json':
        return toJson(rows)
      case 'xml':
        return toXml(rows, 'products')
      case 'xlsx':
        return toXlsx(rows, fields, labels)
      default:
        return ''
    }
  }

  function getMime(format) {
    switch (format) {
      case 'csv':
        return 'text/csv;charset=utf-8'
      case 'json':
        return 'application/json'
      case 'xml':
        return 'application/xml'
      case 'xlsx':
        return 'application/vnd.ms-excel'
      default:
        return 'application/octet-stream'
    }
  }

  function prepareExport(products, fields, format, manifest) {
    const lang = DataPackI18n.getLang()
    const labels = getLabels(manifest, fields)
    const rows = products.map((p) => flattenProduct(p, fields, lang))
    const packId = manifest.meta.packId
    return {
      rows,
      fields,
      labels,
      content: buildContent(rows, fields, labels, format),
      filename: getFilename(packId, format),
      mime: getMime(format),
      format,
      productCount: products.length,
      fieldCount: fields.length,
    }
  }

  function truncateText(text, maxLen = 1200) {
    if (text.length <= maxLen) return { text, truncated: false }
    return { text: text.slice(0, maxLen) + '\n…', truncated: true }
  }

  function buildPreview(products, fields, format, manifest, maxRows = 5) {
    const exportableFields = fields.length
      ? fields
      : manifest.schema.filter((f) => f.exportable).map((f) => f.name)
    const prepared = prepareExport(products, exportableFields, format, manifest)
    const previewRows = prepared.rows.slice(0, maxRows)
    const isTabular = format === 'csv' || format === 'xlsx'
    const previewContent = isTabular
      ? buildContent(previewRows, prepared.fields, prepared.labels, format)
      : buildContent(prepared.rows, prepared.fields, prepared.labels, format)
    const { text, truncated } = truncateText(previewContent, isTabular ? 2000 : 1400)

    return {
      ...prepared,
      previewRows,
      previewText: text,
      previewTruncated: truncated || prepared.rows.length > maxRows,
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

  function exportData(products, fields, format, manifest) {
    const prepared = prepareExport(products, fields, format, manifest)
    download(prepared.content, prepared.filename, prepared.mime)
    return prepared
  }

  return { flattenProduct, prepareExport, buildPreview, exportData, getFilename }
})()
