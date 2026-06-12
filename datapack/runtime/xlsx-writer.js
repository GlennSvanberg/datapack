const DataPackXlsxWriter = (() => {
  const ENCODER = new TextEncoder()

  const CRC_TABLE = (() => {
    const table = new Uint32Array(256)
    for (let i = 0; i < 256; i += 1) {
      let c = i
      for (let k = 0; k < 8; k += 1) {
        c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
      }
      table[i] = c >>> 0
    }
    return table
  })()

  function crc32(bytes) {
    let crc = 0xffffffff
    for (let i = 0; i < bytes.length; i += 1) {
      crc = CRC_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8)
    }
    return (crc ^ 0xffffffff) >>> 0
  }

  function escXml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')
  }

  function colLetter(index) {
    let n = index + 1
    let letters = ''
    while (n > 0) {
      n -= 1
      letters = String.fromCharCode(65 + (n % 26)) + letters
      n = Math.floor(n / 26)
    }
    return letters
  }

  function cellRef(col, row) {
    return `${colLetter(col)}${row}`
  }

  function writeU16(view, offset, value) {
    view.setUint16(offset, value, true)
  }

  function writeU32(view, offset, value) {
    view.setUint32(offset, value, true)
  }

  function createZipStore(files) {
    const chunks = []
    const central = []
    let offset = 0

    for (const file of files) {
      const nameBytes = ENCODER.encode(file.name)
      const data = file.data
      const checksum = crc32(data)
      const local = new Uint8Array(30 + nameBytes.length + data.length)
      const lv = new DataView(local.buffer)

      writeU32(lv, 0, 0x04034b50)
      writeU16(lv, 4, 20)
      writeU16(lv, 6, 0)
      writeU16(lv, 8, 0)
      writeU16(lv, 10, 0)
      writeU16(lv, 12, 0)
      writeU32(lv, 14, checksum)
      writeU32(lv, 18, data.length)
      writeU32(lv, 22, data.length)
      writeU16(lv, 26, nameBytes.length)
      writeU16(lv, 28, 0)
      local.set(nameBytes, 30)
      local.set(data, 30 + nameBytes.length)
      chunks.push(local)

      const centralHeader = new Uint8Array(46 + nameBytes.length)
      const cv = new DataView(centralHeader.buffer)
      writeU32(cv, 0, 0x02014b50)
      writeU16(cv, 4, 20)
      writeU16(cv, 6, 20)
      writeU16(cv, 8, 0)
      writeU16(cv, 10, 0)
      writeU16(cv, 12, 0)
      writeU16(cv, 14, 0)
      writeU32(cv, 16, checksum)
      writeU32(cv, 20, data.length)
      writeU32(cv, 24, data.length)
      writeU16(cv, 28, nameBytes.length)
      writeU16(cv, 30, 0)
      writeU16(cv, 32, 0)
      writeU16(cv, 34, 0)
      writeU16(cv, 36, 0)
      writeU32(cv, 38, 0)
      writeU32(cv, 42, offset)
      centralHeader.set(nameBytes, 46)
      central.push(centralHeader)

      offset += local.length
    }

    const centralSize = central.reduce((sum, part) => sum + part.length, 0)
    const centralStart = offset
    const end = new Uint8Array(22)
    const ev = new DataView(end.buffer)
    writeU32(ev, 0, 0x06054b50)
    writeU16(ev, 4, 0)
    writeU16(ev, 6, 0)
    writeU16(ev, 8, files.length)
    writeU16(ev, 10, files.length)
    writeU32(ev, 12, centralSize)
    writeU32(ev, 16, centralStart)
    writeU16(ev, 20, 0)

    const total = offset + centralSize + end.length
    const out = new Uint8Array(total)
    let pos = 0
    for (const chunk of chunks) {
      out.set(chunk, pos)
      pos += chunk.length
    }
    for (const part of central) {
      out.set(part, pos)
      pos += part.length
    }
    out.set(end, pos)
    return out
  }

  function xmlFile(content) {
    return ENCODER.encode(content)
  }

  function stylesXml() {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="2">
    <font><sz val="11"/><name val="Calibri"/><family val="2"/></font>
    <font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/><family val="2"/></font>
  </fonts>
  <fills count="3">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FF1A3A2A"/><bgColor indexed="64"/></patternFill></fill>
  </fills>
  <borders count="2">
    <border><left/><right/><top/><bottom/><diagonal/></border>
    <border>
      <left style="thin"><color auto="1"/></left>
      <right style="thin"><color auto="1"/></right>
      <top style="thin"><color auto="1"/></top>
      <bottom style="thin"><color auto="1"/></bottom>
      <diagonal/>
    </border>
  </borders>
  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
  <cellXfs count="4">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1"/>
    <xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1"/>
    <xf numFmtId="4" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyBorder="1" applyAlignment="1"><alignment horizontal="right"/></xf>
    <xf numFmtId="1" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyBorder="1" applyAlignment="1"><alignment horizontal="right"/></xf>
  </cellXfs>
</styleSheet>`
  }

  function workbookXml(sheets) {
    const sheetTags = sheets
      .map(
        (sheet, i) =>
          `<sheet name="${escXml(sheet.name)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`,
      )
      .join('\n    ')
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    ${sheetTags}
  </sheets>
</workbook>`
  }

  function workbookRelsXml(sheetCount) {
    const rels = []
    for (let i = 0; i < sheetCount; i += 1) {
      rels.push(
        `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`,
      )
    }
    rels.push(
      `<Relationship Id="rId${sheetCount + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>`,
    )
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  ${rels.join('\n  ')}
</Relationships>`
  }

  function rootRelsXml() {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`
  }

  function contentTypesXml(sheetCount) {
    const overrides = [
      '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>',
      '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>',
    ]
    for (let i = 0; i < sheetCount; i += 1) {
      overrides.push(
        `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`,
      )
    }
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  ${overrides.join('\n  ')}
</Types>`
  }

  function sheetXml(columns, rows) {
    const lastCol = colLetter(columns.length - 1)
    const lastRow = Math.max(rows.length + 1, 1)
    const filterRef = `A1:${lastCol}${lastRow}`

    let xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetViews>
    <sheetView workbookViewId="0">
      <pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/>
      <selection pane="bottomLeft" activeCell="A2" sqref="A2"/>
    </sheetView>
  </sheetViews>
  <cols>
`

    for (let i = 0; i < columns.length; i += 1) {
      const width = columns[i].width || 12
      xml += `    <col min="${i + 1}" max="${i + 1}" width="${width}" customWidth="1"/>\n`
    }

    xml += `  </cols>
  <sheetData>
`

    xml += `    <row r="1">`
    for (let c = 0; c < columns.length; c += 1) {
      const ref = cellRef(c, 1)
      xml += `<c r="${ref}" s="1" t="inlineStr"><is><t>${escXml(columns[c].header)}</t></is></c>`
    }
    xml += `</row>\n`

    for (let r = 0; r < rows.length; r += 1) {
      const rowNum = r + 2
      xml += `    <row r="${rowNum}">`
      for (let c = 0; c < columns.length; c += 1) {
        const cell = rows[r][c]
        const ref = cellRef(c, rowNum)
        if (cell.type === 'number') {
          xml += `<c r="${ref}" s="${cell.style}"><v>${cell.value}</v></c>`
        } else {
          xml += `<c r="${ref}" s="${cell.style}" t="inlineStr"><is><t>${escXml(cell.value)}</t></is></c>`
        }
      }
      xml += `</row>\n`
    }

    xml += `  </sheetData>
  <autoFilter ref="${filterRef}"/>
</worksheet>`

    return xml
  }

  /**
   * @param {{ name: string, columns: object[], rows: object[][] }[]} sheets
   */
  function buildWorkbook(sheets) {
    const files = [
      { name: '[Content_Types].xml', data: xmlFile(contentTypesXml(sheets.length)) },
      { name: '_rels/.rels', data: xmlFile(rootRelsXml()) },
      { name: 'xl/workbook.xml', data: xmlFile(workbookXml(sheets)) },
      {
        name: 'xl/_rels/workbook.xml.rels',
        data: xmlFile(workbookRelsXml(sheets.length)),
      },
      { name: 'xl/styles.xml', data: xmlFile(stylesXml()) },
    ]

    for (let i = 0; i < sheets.length; i += 1) {
      const sheet = sheets[i]
      files.push({
        name: `xl/worksheets/sheet${i + 1}.xml`,
        data: xmlFile(sheetXml(sheet.columns, sheet.rows)),
      })
    }

    return createZipStore(files)
  }

  /**
   * @param {object} options
   * @param {string} options.sheetName
   * @param {{ header: string, width?: number }[]} options.columns
   * @param {{ value: string|number, type: 'string'|'number', style: number }[][]} options.rows
   */
  function build(options) {
    return buildWorkbook([
      {
        name: options.sheetName || 'Products',
        columns: options.columns,
        rows: options.rows,
      },
    ])
  }

  /**
   * @param {{ name: string, data: Uint8Array }[]} files
   */
  function buildZip(files) {
    return createZipStore(files)
  }

  return { build, buildWorkbook, buildZip, createZipStore, colLetter }
})()
