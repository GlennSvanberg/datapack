const DataPackAttributes = (() => {
  function slugify(text) {
    return String(text)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '')
  }

  function isLegacyAttribute(attr) {
    return attr && attr.key && typeof attr.key === 'object' && !attr.id
  }

  function getAttributeId(attr, fallbackIndex) {
    if (attr.id) return attr.id
    if (isLegacyAttribute(attr)) {
      const sv = attr.key.sv || attr.key.no || ''
      return slugify(sv) || `attr_${fallbackIndex}`
    }
    return `attr_${fallbackIndex}`
  }

  function getAttributeCatalog(manifest) {
    if (manifest.attributeSchema && manifest.attributeSchema.length) {
      return manifest.attributeSchema
        .filter((def) => def.exportable !== false)
        .map((def) => ({ id: def.id, label: def.label }))
    }

    const byId = new Map()
    let index = 0
    for (const product of manifest.products || []) {
      for (const attr of product.attributes || []) {
        const id = getAttributeId(attr, index)
        index += 1
        if (!byId.has(id)) {
          const label = isLegacyAttribute(attr)
            ? attr.key
            : { sv: id, no: id, da: id, fi: id }
          byId.set(id, { id, label })
        }
      }
    }
    return Array.from(byId.values())
  }

  function getAttributeValue(product, attrId) {
    for (const attr of product.attributes || []) {
      if (getAttributeId(attr, 0) === attrId) return attr.value ?? ''
    }
    return ''
  }

  function attrLabel(def) {
    if (!def || !def.label) return def?.id || ''
    const lang = DataPackI18n.getLang()
    return def.label[lang] || def.label.sv || def.id
  }

  function findDefinition(catalog, attrId) {
    return catalog.find((def) => def.id === attrId)
  }

  return {
    getAttributeCatalog,
    getAttributeValue,
    getAttributeId,
    isLegacyAttribute,
    attrLabel,
    findDefinition,
  }
})()
