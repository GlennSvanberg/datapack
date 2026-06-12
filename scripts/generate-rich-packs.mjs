#!/usr/bin/env node
/**
 * Generates enriched pack JSON with attributeSchema (~20 attrs) for tents + shoes.
 * Run: node scripts/generate-rich-packs.mjs
 */
import { writeFile, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const L = (sv, no, da, fi) => ({ sv, no, da, fi })

const CORE_SCHEMA = [
  { name: 'sku', label: L('Artikelnummer', 'Artikkelnummer', 'Varenummer', 'Tuotenumero'), type: 'string', exportable: true },
  { name: 'name', label: L('Produktnamn', 'Produktnavn', 'Produktnavn', 'Tuotenimi'), type: 'string', exportable: true },
  { name: 'description', label: L('Beskrivning', 'Beskrivelse', 'Beskrivelse', 'Kuvaus'), type: 'string', exportable: true },
  { name: 'price', label: L('Pris (SEK)', 'Pris (SEK)', 'Pris (SEK)', 'Hinta (SEK)'), type: 'number', exportable: true },
  { name: 'stock', label: L('Lagersaldo', 'Lagerbeholdning', 'Lagerbeholdning', 'Varasto'), type: 'number', exportable: true },
]

const TENT_ATTRIBUTE_SCHEMA = [
  { id: 'weight', label: L('Vikt', 'Vekt', 'Vægt', 'Paino') },
  { id: 'capacity', label: L('Kapacitet', 'Kapasitet', 'Kapacitet', 'Kapasiteetti') },
  { id: 'seasons', label: L('Säsong', 'Sesong', 'Sæson', 'Kausi') },
  { id: 'waterproofing', label: L('Vattentäthet', 'Vanntetthet', 'Vandtæthed', 'Vedenpitävyys') },
  { id: 'poleMaterial', label: L('Stomme', 'Stenger', 'Stænger', 'Kaaret') },
  { id: 'floorMaterial', label: L('Golv', 'Gulv', 'Gulv', 'Lattia') },
  { id: 'flysheetMaterial', label: L('Ytterduk', 'Yttertelt', 'Ydertelt', 'Ulkokangas') },
  { id: 'packedSize', label: L('Packmått', 'Pakkemål', 'Pakkemål', 'Pakkauskoko') },
  { id: 'vestibule', label: L('Vestibül', 'Fortelt', 'Fortelt', 'Eteinen') },
  { id: 'doors', label: L('Dörrar', 'Dører', 'Døre', 'Ovet') },
  { id: 'color', label: L('Färg', 'Farge', 'Farve', 'Väri') },
  { id: 'warranty', label: L('Garanti', 'Garanti', 'Garanti', 'Takuu') },
  { id: 'innerHeight', label: L('Inre takhöjd', 'Innvendig høyde', 'Indvendig højde', 'Sisäkorkeus') },
  { id: 'floorArea', label: L('Golvyta', 'Gulvareal', 'Gulvareal', 'Lattia-ala') },
  { id: 'setupTime', label: L('Uppställningstid', 'Oppstillingstid', 'Opsætningstid', 'Pystytysaika') },
  { id: 'windResistance', label: L('Vindmotstånd', 'Vindmotstand', 'Vindmodstand', 'Tuulenkestävyys') },
  { id: 'condensationRating', label: L('Kondens', 'Kondens', 'Kondens', 'Kondensaatio') },
  { id: 'repairKit', label: L('Reparationssats', 'Reparasjonssett', 'Reparationssæt', 'Korjaussarja') },
  { id: 'guyLines', label: L('Stormlinor', 'Stormliner', 'Stormliner', 'Kiinnitysköydet') },
  { id: 'storagePockets', label: L('Fickor', 'Lommer', 'Lommer', 'Taskut') },
]

const SHOE_ATTRIBUTE_SCHEMA = [
  { id: 'weight', label: L('Vikt', 'Vekt', 'Vægt', 'Paino') },
  { id: 'sizes', label: L('Storlekar', 'Størrelser', 'Størrelser', 'Koot') },
  { id: 'upperMaterial', label: L('Ovandel', 'Overdel', 'Overdel', 'Yläosa') },
  { id: 'sole', label: L('Sula', 'Såle', 'Sål', 'Pohja') },
  { id: 'waterproof', label: L('Vattentät', 'Vanntett', 'Vandtæt', 'Vedenpitävä') },
  { id: 'drop', label: L('Drop', 'Drop', 'Drop', 'Drop') },
  { id: 'lastWidth', label: L('Lästbredd', 'Lestbredde', 'Lestbredde', 'Leveys') },
  { id: 'gender', label: L('Kön', 'Kjønn', 'Køn', 'Sukupuoli') },
  { id: 'color', label: L('Färg', 'Farge', 'Farve', 'Väri') },
  { id: 'lining', label: L('Foder', 'Fôr', 'Foer', 'Vuori') },
  { id: 'ankleSupport', label: L('Ankelstöd', 'Ankelstøtte', 'Ankelstøtte', 'Nilkkatuki') },
  { id: 'toeProtection', label: L('Tåskydd', 'Tåbeskyttelse', 'Tåbeskyttelse', 'Varvassuoja') },
  { id: 'breathability', label: L('Andningsförmåga', 'Pusteevne', 'Åndbarhed', 'Hengittävyys') },
  { id: 'outsoleCompound', label: L('Yttersula', 'Yttersåle', 'Ydersål', 'Ulkopohja') },
  { id: 'midsole', label: L('Mellansula', 'Mellomsåle', 'Mellemsål', 'Välipohja') },
  { id: 'lacing', label: L('Snörning', 'Snøring', 'Snøring', 'Nauhoitus') },
  { id: 'insole', label: L('Innersula', 'Innersåle', 'Indersål', 'Pohjallinen') },
  { id: 'terrain', label: L('Terräng', 'Terreng', 'Terræn', 'Maasto') },
  { id: 'warranty', label: L('Garanti', 'Garanti', 'Garanti', 'Takuu') },
  { id: 'vegan', label: L('Vegansk', 'Vegansk', 'Vegansk', 'Vegaaninen') },
]

function attrs(entries) {
  return Object.entries(entries).map(([id, value]) => ({ id, value }))
}

const TENT_PRODUCTS = [
  {
    sku: 'TENT-001',
    texts: {
      sv: { name: 'Nordvind 2', description: 'Lättvikts tält för två personer. 3-säsongs, vattentät 3000 mm.' },
      no: { name: 'Nordvind 2', description: 'Lettvektstelt for to personer. 3-sesongs, vanntett 3000 mm.' },
      da: { name: 'Nordvind 2', description: 'Letvægtstelt til to personer. 3-sæsons, vandtæt 3000 mm.' },
      fi: { name: 'Nordvind 2', description: 'Kevyt kahden hengen teltta. 3-vuodenaikaista, vedenpitävä 3000 mm.' },
    },
    imageUrl: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=400&h=300&fit=crop',
    attributes: attrs({
      weight: '2.1 kg', capacity: '2 personer', seasons: '3-säsong', waterproofing: '3000 mm',
      poleMaterial: 'DAC aluminium', floorMaterial: '70D nylon', flysheetMaterial: '20D silnylon',
      packedSize: '48 × 15 cm', vestibule: '0.8 m²', doors: '2', color: 'Grön',
      warranty: '5 år', innerHeight: '105 cm', floorArea: '2.6 m²', setupTime: '8 min',
      windResistance: 'Klass 6', condensationRating: 'Bra', repairKit: 'Ja', guyLines: '6 st',
      storagePockets: '4',
    }),
    price: 3299, stock: 28,
  },
  {
    sku: 'TENT-002',
    texts: {
      sv: { name: 'Fjällheim 4', description: 'Rymligt familjetält med stort vestibül. Perfekt för basläger.' },
      no: { name: 'Fjällheim 4', description: 'Romslig familietelt med stort fortelt. Perfekt for basecamp.' },
      da: { name: 'Fjällheim 4', description: 'Rummeligt familietelt med stort fortelt. Perfekt til basecamp.' },
      fi: { name: 'Fjällheim 4', description: 'Tilava perhe teltta suurella eteisellä. Täydellinen tukikohtaan.' },
    },
    imageUrl: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400&h=300&fit=crop',
    attributes: attrs({
      weight: '4.8 kg', capacity: '4 personer', seasons: '3-säsong', waterproofing: '4000 mm',
      poleMaterial: 'Fiberglas', floorMaterial: '150D polyester', flysheetMaterial: '75D polyester',
      packedSize: '62 × 22 cm', vestibule: '2.2 m²', doors: '2', color: 'Blå/Grå',
      warranty: '5 år', innerHeight: '130 cm', floorArea: '5.8 m²', setupTime: '15 min',
      windResistance: 'Klass 5', condensationRating: 'Medel', repairKit: 'Ja', guyLines: '8 st',
      storagePockets: '6',
    }),
    price: 5799, stock: 19,
  },
  {
    sku: 'TENT-003',
    texts: {
      sv: { name: 'Bivack Solo', description: 'Ultralätt ett-mannatält för snabba vandringsturer.' },
      no: { name: 'Bivack Solo', description: 'Ultralett ett-mannstelt for raske fotturer.' },
      da: { name: 'Bivack Solo', description: 'Ultralet et-mands telt til hurtige vandreture.' },
      fi: { name: 'Bivack Solo', description: 'Ultrakevyt yhden hengen teltta nopeille vaelluksille.' },
    },
    imageUrl: 'https://images.unsplash.com/photo-1523987352923-7a1c7a1c4c1e?w=400&h=300&fit=crop',
    attributes: attrs({
      weight: '0.9 kg', capacity: '1 person', seasons: '3-säsong', waterproofing: '2500 mm',
      poleMaterial: 'DAC aluminium', floorMaterial: '15D silnylon', flysheetMaterial: '7D silnylon',
      packedSize: '28 × 10 cm', vestibule: '0.4 m²', doors: '1', color: 'Orange',
      warranty: '3 år', innerHeight: '95 cm', floorArea: '1.8 m²', setupTime: '5 min',
      windResistance: 'Klass 4', condensationRating: 'Bra', repairKit: 'Nej', guyLines: '4 st',
      storagePockets: '2',
    }),
    price: 1999, stock: 42,
  },
  {
    sku: 'TENT-004',
    texts: {
      sv: { name: 'Skärgård Dome', description: 'Kupoltält med utmärkt vindmotstånd för kustvandring.' },
      no: { name: 'Skjærgård Dome', description: 'Kuppeltelt med utmerket vindmotstand for kystvandring.' },
      da: { name: 'Skærgård Dome', description: 'Kuppeltelt med fremragende vindmodstand til kystvandring.' },
      fi: { name: 'Saaristo Dome', description: 'Kupoliteltta erinomaisella tuulenkestolla rannikkovaellyksille.' },
    },
    imageUrl: 'https://images.unsplash.com/photo-1454496522488-7a8e488e5fef?w=400&h=300&fit=crop',
    attributes: attrs({
      weight: '3.2 kg', capacity: '3 personer', seasons: '4-säsong', waterproofing: '5000 mm',
      poleMaterial: 'DAC aluminium', floorMaterial: '70D nylon', flysheetMaterial: '40D ripstop',
      packedSize: '52 × 18 cm', vestibule: '1.2 m²', doors: '2', color: 'Röd',
      warranty: '7 år', innerHeight: '115 cm', floorArea: '3.9 m²', setupTime: '10 min',
      windResistance: 'Klass 7', condensationRating: 'Utmärkt', repairKit: 'Ja', guyLines: '10 st',
      storagePockets: '5',
    }),
    price: 4099, stock: 31,
  },
]

const SHOE_PRODUCTS = [
  {
    sku: 'SHOE-001',
    texts: {
      sv: { name: 'Trailmaster GTX', description: 'Vattentäta vandringskängor med Gore-Tex membran och Vibram-sula.' },
      no: { name: 'Trailmaster GTX', description: 'Vanntette tursko med Gore-Tex membran og Vibram-såle.' },
      da: { name: 'Trailmaster GTX', description: 'Vandtætte vandrestøvler med Gore-Tex membran og Vibram-sål.' },
      fi: { name: 'Trailmaster GTX', description: 'Vedenpitävät vaelluskengät Gore-Tex-kalvon ja Vibram-pohjan kanssa.' },
    },
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop',
    attributes: attrs({
      weight: '980 g', sizes: '36-48', upperMaterial: 'Nubuckläder', sole: 'Vibram Megagrip',
      waterproof: 'Gore-Tex', drop: '10 mm', lastWidth: 'Normal', gender: 'Unisex',
      color: 'Brun', lining: 'Gore-Tex', ankleSupport: 'Medel', toeProtection: 'Gummi',
      breathability: 'Hög', outsoleCompound: 'Megagrip', midsole: 'EVA', lacing: 'Snabbsnörning',
      insole: 'Ortopedisk', terrain: 'Blandad', warranty: '2 år', vegan: 'Nej',
    }),
    price: 1799, stock: 52,
  },
  {
    sku: 'SHOE-002',
    texts: {
      sv: { name: 'Alpine Pro Mid', description: 'Stödjande mellanhöga kängor för fjällvandring och stenig terräng.' },
      no: { name: 'Alpine Pro Mid', description: 'Støttende mellomhøye støvler for fjellvandring og steinete terreng.' },
      da: { name: 'Alpine Pro Mid', description: 'Støttende mellemhøje støvler til bjergvandring og stenet terræn.' },
      fi: { name: 'Alpine Pro Mid', description: 'Tukevat puolikorkeat kengät vuoristovaellukseen ja kiviselle maastolle.' },
    },
    imageUrl: 'https://images.unsplash.com/photo-1606107557195-0a29b4b4b4aa?w=400&h=300&fit=crop',
    attributes: attrs({
      weight: '1150 g', sizes: '37-47', upperMaterial: 'Fullnarvsläder', sole: 'Vibram Megagrip',
      waterproof: 'Nej', drop: '12 mm', lastWidth: 'Bred', gender: 'Herr',
      color: 'Svart', lining: 'Mesh', ankleSupport: 'Hög', toeProtection: 'PU-kappa',
      breathability: 'Medel', outsoleCompound: 'Megagrip', midsole: 'PU', lacing: 'Klassisk',
      insole: 'Stödjande', terrain: 'Fjäll', warranty: '3 år', vegan: 'Nej',
    }),
    price: 2299, stock: 34,
  },
  {
    sku: 'SHOE-003',
    texts: {
      sv: { name: 'Speedlite Trail', description: 'Ultralätta trailskor för snabba dagsturer och löpning i terräng.' },
      no: { name: 'Speedlite Trail', description: 'Ultralette trailsko for raske dagsturer og terrengløping.' },
      da: { name: 'Speedlite Trail', description: 'Ultralette trailsko til hurtige dagsture og terrænløb.' },
      fi: { name: 'Speedlite Trail', description: 'Ultrakevyet polkujuoksukengät nopeille päiväretkille.' },
    },
    imageUrl: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&h=300&fit=crop',
    attributes: attrs({
      weight: '620 g', sizes: '36-46', upperMaterial: 'Mesh/syntet', sole: 'Vibram Litebase',
      waterproof: 'Nej', drop: '6 mm', lastWidth: 'Normal', gender: 'Dam',
      color: 'Turkos', lining: 'Mesh', ankleSupport: 'Låg', toeProtection: 'Tåbump',
      breathability: 'Mycket hög', outsoleCompound: 'Litebase', midsole: 'EVA', lacing: 'Snabbsnörning',
      insole: 'Lätt', terrain: 'Trail/löpning', warranty: '1 år', vegan: 'Ja',
    }),
    price: 1199, stock: 67,
  },
]

function buildPack(packId, assortment, attributeSchema, products) {
  return {
    meta: {
      packId,
      brand: 'Friluftsportalen',
      assortment,
      version: '1.1.0',
      generatedAt: '2026-06-12T10:00:00Z',
      staleAfter: '2026-07-12T00:00:00Z',
      apiBase: 'http://localhost:4040',
    },
    schema: CORE_SCHEMA,
    attributeSchema,
    products,
  }
}

const packs = [
  {
    id: 'friluftsportalen-spring-tents-001',
    manifest: buildPack('friluftsportalen-spring-tents-001', 'Spring Tents 2026', TENT_ATTRIBUTE_SCHEMA, TENT_PRODUCTS),
  },
  {
    id: 'friluftsportalen-hiking-shoes-001',
    manifest: buildPack('friluftsportalen-hiking-shoes-001', 'Hiking Shoes 2026', SHOE_ATTRIBUTE_SCHEMA, SHOE_PRODUCTS),
  },
]

for (const { id, manifest } of packs) {
  const json = JSON.stringify(manifest, null, 2) + '\n'
  await writeFile(path.join(ROOT, 'app/data/packs', `${id}.json`), json)
  await writeFile(path.join(ROOT, 'sample-data', `${id}.json`), json)
}

const seedContent = `export const SEED_PACKS = ${JSON.stringify(packs, null, 2)} as const;

export const SEED_EVENTS = [] as const;
`
await writeFile(path.join(ROOT, 'app/convex/seedFixtures.ts'), seedContent)

console.log('Generated', packs.length, 'packs with attributeSchema')
