const DataPackI18n = (() => {
  const LANGS = ['sv', 'no', 'da', 'fi']

  const EXTRA = {
    stepLayout: ['Layout', 'Oppsett', 'Layout', 'Rakenne'],
    stepLayoutDesc: [
      'Hur ska produktdata och attribut arrangeras i filen?',
      'Hvordan skal produktdata og attributter arrangeres i filen?',
      'Hvordan skal produktdata og attributter arrangeres i filen?',
      'Miten tuote- ja attribuuttidata järjestetään tiedostossa?',
    ],
    stepNames: [
      ['Format', 'Layout', 'Produkter', 'Fält', 'Ladda ner'],
      ['Format', 'Oppsett', 'Produkter', 'Felt', 'Last ned'],
      ['Format', 'Layout', 'Produkter', 'Felter', 'Download'],
      ['Muoto', 'Rakenne', 'Tuotteet', 'Kentät', 'Lataa'],
    ],
    layoutWide: ['Bred tabell', 'Bred tabell', 'Bred tabel', 'Leveä taulukko'],
    layoutWideDesc: [
      'En rad per produkt — attribut som kolumner',
      'Én rad per produkt — attributter som kolonner',
      'Én række per produkt — attributter som kolonner',
      'Yksi rivi per tuote — attribuutit sarakkeina',
    ],
    layoutTall: ['Lång tabell', 'Lang tabell', 'Lang tabel', 'Pitkä taulukko'],
    layoutTallDesc: [
      'En rad per attribut — bra för import och pivottabeller',
      'Én rad per attributt — bra for import og pivottabeller',
      'Én række per attribut — god til import og pivottabeller',
      'Yksi rivi per attribuutti — sopii tuontiin ja pivot-taulukoihin',
    ],
    layoutSplit: ['Delad / flera ark', 'Delt / flere ark', 'Delt / flere ark', 'Jaettu / useita arkkeja'],
    layoutSplitDesc: [
      'Produkter och attribut i separata ark (Excel) eller ZIP med två CSV-filer',
      'Produkter og attributter i separate ark (Excel) eller ZIP med to CSV-filer',
      'Produkter og attributter i separate ark (Excel) eller ZIP med to CSV-filer',
      'Tuotteet ja attribuutit erillisillä arkeilla (Excel) tai ZIP kahdella CSV:llä',
    ],
    structureFlat: ['Platt', 'Flat', 'Flad', 'Litteä'],
    structureFlatDesc: [
      'Allt på samma nivå — som en bred tabell',
      'Alt på samme nivå — som en bred tabell',
      'Alt på samme niveau — som en bred tabel',
      'Kaikki samalla tasolla — kuten leveä taulukko',
    ],
    structureNested: ['Kapslad', 'Nestet', 'Indlejret', 'Sisäkkäinen'],
    structureNestedDesc: [
      'Attribut grupperade under varje produkt — bäst för API och PIM',
      'Attributter gruppert under hvert produkt — best for API og PIM',
      'Attributter grupperet under hvert produkt — bedst til API og PIM',
      'Attribuutit ryhmiteltynä tuotteen alle — paras API:lle ja PIM:lle',
    ],
    structureTall: ['Lång lista', 'Lang liste', 'Lang liste', 'Pitkä lista'],
    structureTallDesc: [
      'Lista med rader per attribut — enkel att filtrera',
      'Liste med rader per attributt — enkel å filtrere',
      'Liste med rækker per attribut — nem at filtrere',
      'Lista riveittäin per attribuutti — helppo suodattaa',
    ],
    recommended: ['Rekommenderas', 'Anbefales', 'Anbefales', 'Suositeltu'],
    fieldGroupProducts: ['Produktdata', 'Produktdata', 'Produktdata', 'Tuotetiedot'],
    fieldGroupAttributes: ['Attribut', 'Attributter', 'Attributter', 'Attribuutit'],
    attributesSelected: ['{n} av {total} attribut valda', '{n} av {total} attributter valgt', '{n} af {total} attributter valgt', '{n} / {total} attribuuttia valittu'],
    searchAttributes: ['Sök attribut...', 'Søk attributter...', 'Søg attributter...', 'Hae attribuutteja...'],
    summaryLayout: ['Layout', 'Oppsett', 'Layout', 'Rakenne'],
    summaryAttributes: ['{n} attribut', '{n} attributter', '{n} attributter', '{n} attribuuttia'],
    sheetProducts: ['Produkter', 'Produkter', 'Produkter', 'Tuotteet'],
    sheetAttributes: ['Attribut', 'Attributter', 'Attributter', 'Attribuutit'],
    previewSheetProducts: ['Produktark', 'Produktark', 'Produktark', 'Tuotearkki'],
    previewSheetAttributes: ['Attributark', 'Attributtark', 'Attributark', 'Attribuuttiarkki'],
    colSku: ['Artikelnummer', 'Artikkelnummer', 'Varenummer', 'Tuotenumero'],
    colAttributeId: ['Attribut-ID', 'Attributt-ID', 'Attribut-ID', 'Attribuutti-ID'],
    colAttributeLabel: ['Attribut', 'Attributt', 'Attribut', 'Attribuutti'],
    colValue: ['Värde', 'Verdi', 'Værdi', 'Arvo'],
    previewEmpty: [
      'Välj minst ett produktfält eller attribut för att se förhandsgranskning',
      'Velg minst ett produktfelt eller attributt for forhåndsvisning',
      'Vælg mindst ét produktfelt eller attribut for forhåndsvisning',
      'Valitse vähintään yksi tuotekenttä tai attribuutti esikatselua varten',
    ],
    wizardSubtitle: [
      'Välj format, layout, produkter och fält — förhandsgranskningen uppdateras direkt.',
      'Velg format, oppsett, produkter og felt — forhåndsvisningen oppdateres med en gang.',
      'Vælg format, layout, produkter og felter — forhåndsvisningen opdateres med det samme.',
      'Valitse muoto, rakenne, tuotteet ja kentät — esikatselu päivittyy heti.',
    ],
  }

  const UI = {
    sv: {
      customizeExport: 'Anpassa export',
      exportProduct: 'Exportera produkt',
      search: 'Sök produkter...',
      staleCalm: 'En nyare version finns — uppdatera för senaste priser och lager.',
      staleReassurance: 'Du kan fortfarande bläddra och exportera den här filen.',
      update: 'Uppdatera data',
      back: 'Tillbaka till katalogen',
      wizardTitle: 'Anpassa export',
      heroSubline: 'Exportera produktdata till ditt system eller kalkylblad',
      heroTrust: 'Ingen inloggning · fungerar offline · filen sparas på din dator',
      heroUpdated: 'Uppdaterad {date}',
      heroWorksOffline: 'Fungerar offline',
      heroBrowseCustomize: 'Bläddra nedan eller anpassa fält →',
      quickExcel: 'Excel',
      quickCsv: 'CSV',
      quickJson: 'JSON',
      quickExportSuccess: 'Filen har laddats ner — kolla mappen Hämtade filer',
      contactQuestions: 'Frågor?',
      stepFormat: 'Välj format',
      stepScope: 'Välj produkter',
      stepFields: 'Välj fält',
      stepReview: 'Granska & ladda ner',
      stepFormatDesc: 'Vilket filformat ska datan sparas i?',
      stepScopeDesc: 'Vilka produkter ska ingå i exporten?',
      stepFieldsDesc: 'Välj produktfält och attribut. Du kan ändra när som helst.',
      stepReviewDesc: 'Allt ser bra ut? Klicka på ladda ner — filen sparas på din dator.',
      next: 'Fortsätt',
      back_btn: 'Tillbaka',
      download_btn: 'Ladda ner fil',
      close: 'Stäng',
      scopeAll: 'Alla produkter',
      scopeFiltered: 'Filtrerade resultat',
      scopeOne: 'Denna produkt',
      scopeAllDesc: 'Exportera hela sortimentet',
      scopeFilteredDesc: 'Bara det du sökt fram',
      scopeOneDesc: 'Bara den valda produkten',
      noResults: 'Inga produkter hittades',
      stock: 'I lager',
      formats: { csv: 'CSV', xlsx: 'Excel', json: 'JSON', xml: 'XML' },
      formatDesc: {
        csv: 'Perfekt för Excel, Google Sheets och de flesta system',
        xlsx: 'Öppnas direkt i Microsoft Excel',
        json: 'Strukturerad data för appar och integrationer',
        xml: 'Standardformat för system och PIM',
      },
      previewTitle: 'Förhandsgranskning',
      previewHint: 'Så här ser din fil ut',
      previewMore: '… och {n} rader till i den färdiga filen',
      previewTruncated: 'Förhandsgranskningen är förkortad',
      summaryProducts: '{n} produkter',
      summaryFields: '{n} fält',
      summaryFormat: 'Format',
      summaryFilename: 'Filnamn',
      selectAll: 'Markera alla',
      selectNone: 'Avmarkera alla',
      fieldsSelected: '{n} av {total} fält valda',
      productCount: '{n} st',
      readyToDownload: 'Redo att ladda ner',
      downloadAgain: 'Ladda ner igen',
      downloadSuccess: 'Filen har laddats ner!',
    },
    no: {
      customizeExport: 'Tilpass eksport',
      exportProduct: 'Eksporter produkt',
      search: 'Søk produkter...',
      staleCalm: 'En nyere versjon finnes — oppdater for nyeste priser og lager.',
      staleReassurance: 'Du kan fortsatt bla og eksportere denne filen.',
      update: 'Oppdater data',
      back: 'Tilbake til katalogen',
      wizardTitle: 'Tilpass eksport',
      heroSubline: 'Eksporter produktdata til systemet eller regnearket ditt',
      heroTrust: 'Ingen innlogging · fungerer offline · filen lagres på datamaskinen din',
      heroUpdated: 'Oppdatert {date}',
      heroWorksOffline: 'Fungerer offline',
      heroBrowseCustomize: 'Bla nedenfor eller tilpass felt →',
      quickExcel: 'Excel',
      quickCsv: 'CSV',
      quickJson: 'JSON',
      quickExportSuccess: 'Filen er lastet ned — sjekk Nedlastinger-mappen',
      contactQuestions: 'Spørsmål?',
      stepFormat: 'Velg format',
      stepScope: 'Velg produkter',
      stepFields: 'Velg felt',
      stepReview: 'Gjennomgå & last ned',
      stepFormatDesc: 'Hvilket filformat skal dataene lagres i?',
      stepScopeDesc: 'Hvilke produkter skal inkluderes i eksporten?',
      stepFieldsDesc: 'Velg produktfelt og attributter. Du kan endre når som helst.',
      stepReviewDesc: 'Ser alt bra ut? Klikk last ned — filen lagres på datamaskinen din.',
      next: 'Fortsett',
      back_btn: 'Tilbake',
      download_btn: 'Last ned fil',
      close: 'Lukk',
      scopeAll: 'Alle produkter',
      scopeFiltered: 'Filtrerte resultater',
      scopeOne: 'Dette produktet',
      scopeAllDesc: 'Eksporter hele sortimentet',
      scopeFilteredDesc: 'Bare det du har søkt frem',
      scopeOneDesc: 'Bare det valgte produktet',
      noResults: 'Ingen produkter funnet',
      stock: 'På lager',
      formats: { csv: 'CSV', xlsx: 'Excel', json: 'JSON', xml: 'XML' },
      formatDesc: {
        csv: 'Perfekt for Excel, Google Sheets og de fleste systemer',
        xlsx: 'Åpnes direkte i Microsoft Excel',
        json: 'Strukturert data for apper og integrasjoner',
        xml: 'Standardformat for systemer og PIM',
      },
      previewTitle: 'Forhåndsvisning',
      previewHint: 'Slik ser filen din ut',
      previewMore: '… og {n} rader til i den ferdige filen',
      previewTruncated: 'Forhåndsvisningen er forkortet',
      summaryProducts: '{n} produkter',
      summaryFields: '{n} felt',
      summaryFormat: 'Format',
      summaryFilename: 'Filnavn',
      selectAll: 'Merk alle',
      selectNone: 'Fjern alle',
      fieldsSelected: '{n} av {total} felt valgt',
      productCount: '{n} stk',
      readyToDownload: 'Klar til nedlasting',
      downloadAgain: 'Last ned igjen',
      downloadSuccess: 'Filen er lastet ned!',
    },
    da: {
      customizeExport: 'Tilpas eksport',
      exportProduct: 'Eksporter produkt',
      search: 'Søg produkter...',
      staleCalm: 'En nyere version findes — opdater for nyeste priser og lager.',
      staleReassurance: 'Du kan stadig gennemse og eksportere denne fil.',
      update: 'Opdater data',
      back: 'Tilbage til kataloget',
      wizardTitle: 'Tilpas eksport',
      heroSubline: 'Eksporter produktdata til dit system eller regneark',
      heroTrust: 'Ingen login · virker offline · filen gemmes på din computer',
      heroUpdated: 'Opdateret {date}',
      heroWorksOffline: 'Virker offline',
      heroBrowseCustomize: 'Gennemse nedenfor eller tilpas felter →',
      quickExcel: 'Excel',
      quickCsv: 'CSV',
      quickJson: 'JSON',
      quickExportSuccess: 'Filen er downloadet — tjek mappen Overførsler',
      contactQuestions: 'Spørgsmål?',
      stepFormat: 'Vælg format',
      stepScope: 'Vælg produkter',
      stepFields: 'Vælg felter',
      stepReview: 'Gennemse & download',
      stepFormatDesc: 'Hvilket filformat skal dataene gemmes i?',
      stepScopeDesc: 'Hvilke produkter skal med i eksporten?',
      stepFieldsDesc: 'Vælg produktfelter og attributter. Du kan ændre når som helst.',
      stepReviewDesc: 'Ser alt godt ud? Klik download — filen gemmes på din computer.',
      next: 'Fortsæt',
      back_btn: 'Tilbage',
      download_btn: 'Download fil',
      close: 'Luk',
      scopeAll: 'Alle produkter',
      scopeFiltered: 'Filtrerede resultater',
      scopeOne: 'Dette produkt',
      scopeAllDesc: 'Eksporter hele sortimentet',
      scopeFilteredDesc: 'Kun det du har søgt frem',
      scopeOneDesc: 'Kun det valgte produkt',
      noResults: 'Ingen produkter fundet',
      stock: 'På lager',
      formats: { csv: 'CSV', xlsx: 'Excel', json: 'JSON', xml: 'XML' },
      formatDesc: {
        csv: 'Perfekt til Excel, Google Sheets og de fleste systemer',
        xlsx: 'Åbnes direkte i Microsoft Excel',
        json: 'Struktureret data til apps og integrationer',
        xml: 'Standardformat til systemer og PIM',
      },
      previewTitle: 'Forhåndsvisning',
      previewHint: 'Sådan ser din fil ud',
      previewMore: '… og {n} rækker mere i den færdige fil',
      previewTruncated: 'Forhåndsvisningen er forkortet',
      summaryProducts: '{n} produkter',
      summaryFields: '{n} felter',
      summaryFormat: 'Format',
      summaryFilename: 'Filnavn',
      selectAll: 'Vælg alle',
      selectNone: 'Fravælg alle',
      fieldsSelected: '{n} af {total} felter valgt',
      productCount: '{n} stk',
      readyToDownload: 'Klar til download',
      downloadAgain: 'Download igen',
      downloadSuccess: 'Filen er downloadet!',
    },
    fi: {
      customizeExport: 'Mukauta vientiä',
      exportProduct: 'Vie tuote',
      search: 'Hae tuotteita...',
      staleCalm: 'Uudempi versio on saatavilla — päivitä uusimmat hinnat ja varasto.',
      staleReassurance: 'Voit silti selata ja viedä tämän tiedoston.',
      update: 'Päivitä tiedot',
      back: 'Takaisin luetteloon',
      wizardTitle: 'Mukauta vientiä',
      heroSubline: 'Vie tuotetiedot järjestelmääsi tai laskentataulukkoon',
      heroTrust: 'Ei kirjautumista · toimii offline-tilassa · tiedosto tallentuu tietokoneellesi',
      heroUpdated: 'Päivitetty {date}',
      heroWorksOffline: 'Toimii offline-tilassa',
      heroBrowseCustomize: 'Selaa alla tai mukauta kenttiä →',
      quickExcel: 'Excel',
      quickCsv: 'CSV',
      quickJson: 'JSON',
      quickExportSuccess: 'Tiedosto ladattu — tarkista Lataukset-kansio',
      contactQuestions: 'Kysymyksiä?',
      stepFormat: 'Valitse muoto',
      stepScope: 'Valitse tuotteet',
      stepFields: 'Valitse kentät',
      stepReview: 'Tarkista & lataa',
      stepFormatDesc: 'Missä tiedostomuodossa tiedot tallennetaan?',
      stepScopeDesc: 'Mitkä tuotteet sisällytetään vientiin?',
      stepFieldsDesc: 'Valitse tuotekentät ja attribuutit. Voit muuttaa valintoja milloin tahansa.',
      stepReviewDesc: 'Kaikki näyttää hyvältä? Napsauta lataa — tiedosto tallentuu tietokoneellesi.',
      next: 'Jatka',
      back_btn: 'Takaisin',
      download_btn: 'Lataa tiedosto',
      close: 'Sulje',
      scopeAll: 'Kaikki tuotteet',
      scopeFiltered: 'Suodatetut tulokset',
      scopeOne: 'Tämä tuote',
      scopeAllDesc: 'Vie koko valikoima',
      scopeFilteredDesc: 'Vain hakutulokset',
      scopeOneDesc: 'Vain valittu tuote',
      noResults: 'Tuotteita ei löytynyt',
      stock: 'Varastossa',
      formats: { csv: 'CSV', xlsx: 'Excel', json: 'JSON', xml: 'XML' },
      formatDesc: {
        csv: 'Sopii Exceliin, Google Sheetsiin ja useimpiin järjestelmiin',
        xlsx: 'Avautuu suoraan Microsoft Excelissä',
        json: 'Jäsennelty data sovelluksiin ja integraatioihin',
        xml: 'Vakiomuoto järjestelmille ja PIM:lle',
      },
      previewTitle: 'Esikatselu',
      previewHint: 'Näin tiedostosi näyttää',
      previewMore: '… ja {n} riviä lisää valmiissa tiedostossa',
      previewTruncated: 'Esikatselu on lyhennetty',
      summaryProducts: '{n} tuotetta',
      summaryFields: '{n} kenttää',
      summaryFormat: 'Muoto',
      summaryFilename: 'Tiedostonimi',
      selectAll: 'Valitse kaikki',
      selectNone: 'Poista valinnat',
      fieldsSelected: '{n} / {total} kenttää valittu',
      productCount: '{n} kpl',
      readyToDownload: 'Valmis ladattavaksi',
      downloadAgain: 'Lataa uudelleen',
      downloadSuccess: 'Tiedosto on ladattu!',
    },
  }

  const langIndex = { sv: 0, no: 1, da: 2, fi: 3 }
  for (const lang of LANGS) {
    const i = langIndex[lang]
    for (const [key, values] of Object.entries(EXTRA)) {
      if (key === 'stepNames') UI[lang][key] = values[i]
      else UI[lang][key] = values[i]
    }
  }

  let currentLang = localStorage.getItem('datapack-lang') || 'sv'

  function detectBrowserLang() {
    if (localStorage.getItem('datapack-lang')) return
    const nav = (navigator.language || 'sv').toLowerCase()
    if (nav.startsWith('no') || nav.startsWith('nb') || nav.startsWith('nn')) currentLang = 'no'
    else if (nav.startsWith('da')) currentLang = 'da'
    else if (nav.startsWith('fi')) currentLang = 'fi'
  }

  detectBrowserLang()

  const LOCALE_MAP = { sv: 'sv-SE', no: 'nb-NO', da: 'da-DK', fi: 'fi-FI' }

  function formatDate(iso) {
    const d = new Date(iso)
    const locale = LOCALE_MAP[currentLang] || 'sv-SE'
    return d.toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' })
  }

  function t(key, vars) {
    let str = UI[currentLang][key] ?? UI.sv[key] ?? key
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        str = str.replace(`{${k}}`, String(v))
      }
    }
    return str
  }

  function getLang() {
    return currentLang
  }

  function setLang(lang) {
    if (!LANGS.includes(lang)) return
    currentLang = lang
    localStorage.setItem('datapack-lang', lang)
  }

  function productText(product, field) {
    const texts = product.texts[currentLang] || product.texts.sv
    return texts[field] || ''
  }

  function schemaLabel(field) {
    return field.label[currentLang] || field.label.sv || field.name
  }

  function attrKey(attr, manifest) {
    if (attr.id && manifest) {
      const catalog = DataPackAttributes.getAttributeCatalog(manifest)
      const def = DataPackAttributes.findDefinition(catalog, attr.id)
      if (def) return DataPackAttributes.attrLabel(def)
      return attr.id
    }
    if (attr.key) return attr.key[currentLang] || attr.key.sv || ''
    return ''
  }

  return { LANGS, t, getLang, setLang, productText, schemaLabel, attrKey, formatDate }
})()
