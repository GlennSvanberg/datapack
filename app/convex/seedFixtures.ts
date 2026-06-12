export const SEED_PACKS = [
  {
    "id": "friluftsportalen-spring-tents-001",
    "manifest": {
      "meta": {
        "packId": "friluftsportalen-spring-tents-001",
        "brand": "Friluftsportalen",
        "assortment": "Spring Tents 2026",
        "version": "1.1.0",
        "generatedAt": "2026-06-12T10:00:00Z",
        "staleAfter": "2026-07-12T00:00:00Z",
        "apiBase": "http://localhost:4040"
      },
      "schema": [
        {
          "name": "sku",
          "label": {
            "sv": "Artikelnummer",
            "no": "Artikkelnummer",
            "da": "Varenummer",
            "fi": "Tuotenumero"
          },
          "type": "string",
          "exportable": true
        },
        {
          "name": "name",
          "label": {
            "sv": "Produktnamn",
            "no": "Produktnavn",
            "da": "Produktnavn",
            "fi": "Tuotenimi"
          },
          "type": "string",
          "exportable": true
        },
        {
          "name": "description",
          "label": {
            "sv": "Beskrivning",
            "no": "Beskrivelse",
            "da": "Beskrivelse",
            "fi": "Kuvaus"
          },
          "type": "string",
          "exportable": true
        },
        {
          "name": "price",
          "label": {
            "sv": "Pris (SEK)",
            "no": "Pris (SEK)",
            "da": "Pris (SEK)",
            "fi": "Hinta (SEK)"
          },
          "type": "number",
          "exportable": true
        },
        {
          "name": "stock",
          "label": {
            "sv": "Lagersaldo",
            "no": "Lagerbeholdning",
            "da": "Lagerbeholdning",
            "fi": "Varasto"
          },
          "type": "number",
          "exportable": true
        }
      ],
      "attributeSchema": [
        {
          "id": "weight",
          "label": {
            "sv": "Vikt",
            "no": "Vekt",
            "da": "Vægt",
            "fi": "Paino"
          }
        },
        {
          "id": "capacity",
          "label": {
            "sv": "Kapacitet",
            "no": "Kapasitet",
            "da": "Kapacitet",
            "fi": "Kapasiteetti"
          }
        },
        {
          "id": "seasons",
          "label": {
            "sv": "Säsong",
            "no": "Sesong",
            "da": "Sæson",
            "fi": "Kausi"
          }
        },
        {
          "id": "waterproofing",
          "label": {
            "sv": "Vattentäthet",
            "no": "Vanntetthet",
            "da": "Vandtæthed",
            "fi": "Vedenpitävyys"
          }
        },
        {
          "id": "poleMaterial",
          "label": {
            "sv": "Stomme",
            "no": "Stenger",
            "da": "Stænger",
            "fi": "Kaaret"
          }
        },
        {
          "id": "floorMaterial",
          "label": {
            "sv": "Golv",
            "no": "Gulv",
            "da": "Gulv",
            "fi": "Lattia"
          }
        },
        {
          "id": "flysheetMaterial",
          "label": {
            "sv": "Ytterduk",
            "no": "Yttertelt",
            "da": "Ydertelt",
            "fi": "Ulkokangas"
          }
        },
        {
          "id": "packedSize",
          "label": {
            "sv": "Packmått",
            "no": "Pakkemål",
            "da": "Pakkemål",
            "fi": "Pakkauskoko"
          }
        },
        {
          "id": "vestibule",
          "label": {
            "sv": "Vestibül",
            "no": "Fortelt",
            "da": "Fortelt",
            "fi": "Eteinen"
          }
        },
        {
          "id": "doors",
          "label": {
            "sv": "Dörrar",
            "no": "Dører",
            "da": "Døre",
            "fi": "Ovet"
          }
        },
        {
          "id": "color",
          "label": {
            "sv": "Färg",
            "no": "Farge",
            "da": "Farve",
            "fi": "Väri"
          }
        },
        {
          "id": "warranty",
          "label": {
            "sv": "Garanti",
            "no": "Garanti",
            "da": "Garanti",
            "fi": "Takuu"
          }
        },
        {
          "id": "innerHeight",
          "label": {
            "sv": "Inre takhöjd",
            "no": "Innvendig høyde",
            "da": "Indvendig højde",
            "fi": "Sisäkorkeus"
          }
        },
        {
          "id": "floorArea",
          "label": {
            "sv": "Golvyta",
            "no": "Gulvareal",
            "da": "Gulvareal",
            "fi": "Lattia-ala"
          }
        },
        {
          "id": "setupTime",
          "label": {
            "sv": "Uppställningstid",
            "no": "Oppstillingstid",
            "da": "Opsætningstid",
            "fi": "Pystytysaika"
          }
        },
        {
          "id": "windResistance",
          "label": {
            "sv": "Vindmotstånd",
            "no": "Vindmotstand",
            "da": "Vindmodstand",
            "fi": "Tuulenkestävyys"
          }
        },
        {
          "id": "condensationRating",
          "label": {
            "sv": "Kondens",
            "no": "Kondens",
            "da": "Kondens",
            "fi": "Kondensaatio"
          }
        },
        {
          "id": "repairKit",
          "label": {
            "sv": "Reparationssats",
            "no": "Reparasjonssett",
            "da": "Reparationssæt",
            "fi": "Korjaussarja"
          }
        },
        {
          "id": "guyLines",
          "label": {
            "sv": "Stormlinor",
            "no": "Stormliner",
            "da": "Stormliner",
            "fi": "Kiinnitysköydet"
          }
        },
        {
          "id": "storagePockets",
          "label": {
            "sv": "Fickor",
            "no": "Lommer",
            "da": "Lommer",
            "fi": "Taskut"
          }
        }
      ],
      "products": [
        {
          "sku": "TENT-001",
          "texts": {
            "sv": {
              "name": "Nordvind 2",
              "description": "Lättvikts tält för två personer. 3-säsongs, vattentät 3000 mm."
            },
            "no": {
              "name": "Nordvind 2",
              "description": "Lettvektstelt for to personer. 3-sesongs, vanntett 3000 mm."
            },
            "da": {
              "name": "Nordvind 2",
              "description": "Letvægtstelt til to personer. 3-sæsons, vandtæt 3000 mm."
            },
            "fi": {
              "name": "Nordvind 2",
              "description": "Kevyt kahden hengen teltta. 3-vuodenaikaista, vedenpitävä 3000 mm."
            }
          },
          "imageUrl": "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=400&h=300&fit=crop",
          "attributes": [
            {
              "id": "weight",
              "value": "2.1 kg"
            },
            {
              "id": "capacity",
              "value": "2 personer"
            },
            {
              "id": "seasons",
              "value": "3-säsong"
            },
            {
              "id": "waterproofing",
              "value": "3000 mm"
            },
            {
              "id": "poleMaterial",
              "value": "DAC aluminium"
            },
            {
              "id": "floorMaterial",
              "value": "70D nylon"
            },
            {
              "id": "flysheetMaterial",
              "value": "20D silnylon"
            },
            {
              "id": "packedSize",
              "value": "48 × 15 cm"
            },
            {
              "id": "vestibule",
              "value": "0.8 m²"
            },
            {
              "id": "doors",
              "value": "2"
            },
            {
              "id": "color",
              "value": "Grön"
            },
            {
              "id": "warranty",
              "value": "5 år"
            },
            {
              "id": "innerHeight",
              "value": "105 cm"
            },
            {
              "id": "floorArea",
              "value": "2.6 m²"
            },
            {
              "id": "setupTime",
              "value": "8 min"
            },
            {
              "id": "windResistance",
              "value": "Klass 6"
            },
            {
              "id": "condensationRating",
              "value": "Bra"
            },
            {
              "id": "repairKit",
              "value": "Ja"
            },
            {
              "id": "guyLines",
              "value": "6 st"
            },
            {
              "id": "storagePockets",
              "value": "4"
            }
          ],
          "price": 3299,
          "stock": 28
        },
        {
          "sku": "TENT-002",
          "texts": {
            "sv": {
              "name": "Fjällheim 4",
              "description": "Rymligt familjetält med stort vestibül. Perfekt för basläger."
            },
            "no": {
              "name": "Fjällheim 4",
              "description": "Romslig familietelt med stort fortelt. Perfekt for basecamp."
            },
            "da": {
              "name": "Fjällheim 4",
              "description": "Rummeligt familietelt med stort fortelt. Perfekt til basecamp."
            },
            "fi": {
              "name": "Fjällheim 4",
              "description": "Tilava perhe teltta suurella eteisellä. Täydellinen tukikohtaan."
            }
          },
          "imageUrl": "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400&h=300&fit=crop",
          "attributes": [
            {
              "id": "weight",
              "value": "4.8 kg"
            },
            {
              "id": "capacity",
              "value": "4 personer"
            },
            {
              "id": "seasons",
              "value": "3-säsong"
            },
            {
              "id": "waterproofing",
              "value": "4000 mm"
            },
            {
              "id": "poleMaterial",
              "value": "Fiberglas"
            },
            {
              "id": "floorMaterial",
              "value": "150D polyester"
            },
            {
              "id": "flysheetMaterial",
              "value": "75D polyester"
            },
            {
              "id": "packedSize",
              "value": "62 × 22 cm"
            },
            {
              "id": "vestibule",
              "value": "2.2 m²"
            },
            {
              "id": "doors",
              "value": "2"
            },
            {
              "id": "color",
              "value": "Blå/Grå"
            },
            {
              "id": "warranty",
              "value": "5 år"
            },
            {
              "id": "innerHeight",
              "value": "130 cm"
            },
            {
              "id": "floorArea",
              "value": "5.8 m²"
            },
            {
              "id": "setupTime",
              "value": "15 min"
            },
            {
              "id": "windResistance",
              "value": "Klass 5"
            },
            {
              "id": "condensationRating",
              "value": "Medel"
            },
            {
              "id": "repairKit",
              "value": "Ja"
            },
            {
              "id": "guyLines",
              "value": "8 st"
            },
            {
              "id": "storagePockets",
              "value": "6"
            }
          ],
          "price": 5799,
          "stock": 19
        },
        {
          "sku": "TENT-003",
          "texts": {
            "sv": {
              "name": "Bivack Solo",
              "description": "Ultralätt ett-mannatält för snabba vandringsturer."
            },
            "no": {
              "name": "Bivack Solo",
              "description": "Ultralett ett-mannstelt for raske fotturer."
            },
            "da": {
              "name": "Bivack Solo",
              "description": "Ultralet et-mands telt til hurtige vandreture."
            },
            "fi": {
              "name": "Bivack Solo",
              "description": "Ultrakevyt yhden hengen teltta nopeille vaelluksille."
            }
          },
          "imageUrl": "https://images.unsplash.com/photo-1523987352923-7a1c7a1c4c1e?w=400&h=300&fit=crop",
          "attributes": [
            {
              "id": "weight",
              "value": "0.9 kg"
            },
            {
              "id": "capacity",
              "value": "1 person"
            },
            {
              "id": "seasons",
              "value": "3-säsong"
            },
            {
              "id": "waterproofing",
              "value": "2500 mm"
            },
            {
              "id": "poleMaterial",
              "value": "DAC aluminium"
            },
            {
              "id": "floorMaterial",
              "value": "15D silnylon"
            },
            {
              "id": "flysheetMaterial",
              "value": "7D silnylon"
            },
            {
              "id": "packedSize",
              "value": "28 × 10 cm"
            },
            {
              "id": "vestibule",
              "value": "0.4 m²"
            },
            {
              "id": "doors",
              "value": "1"
            },
            {
              "id": "color",
              "value": "Orange"
            },
            {
              "id": "warranty",
              "value": "3 år"
            },
            {
              "id": "innerHeight",
              "value": "95 cm"
            },
            {
              "id": "floorArea",
              "value": "1.8 m²"
            },
            {
              "id": "setupTime",
              "value": "5 min"
            },
            {
              "id": "windResistance",
              "value": "Klass 4"
            },
            {
              "id": "condensationRating",
              "value": "Bra"
            },
            {
              "id": "repairKit",
              "value": "Nej"
            },
            {
              "id": "guyLines",
              "value": "4 st"
            },
            {
              "id": "storagePockets",
              "value": "2"
            }
          ],
          "price": 1999,
          "stock": 42
        },
        {
          "sku": "TENT-004",
          "texts": {
            "sv": {
              "name": "Skärgård Dome",
              "description": "Kupoltält med utmärkt vindmotstånd för kustvandring."
            },
            "no": {
              "name": "Skjærgård Dome",
              "description": "Kuppeltelt med utmerket vindmotstand for kystvandring."
            },
            "da": {
              "name": "Skærgård Dome",
              "description": "Kuppeltelt med fremragende vindmodstand til kystvandring."
            },
            "fi": {
              "name": "Saaristo Dome",
              "description": "Kupoliteltta erinomaisella tuulenkestolla rannikkovaellyksille."
            }
          },
          "imageUrl": "https://images.unsplash.com/photo-1454496522488-7a8e488e5fef?w=400&h=300&fit=crop",
          "attributes": [
            {
              "id": "weight",
              "value": "3.2 kg"
            },
            {
              "id": "capacity",
              "value": "3 personer"
            },
            {
              "id": "seasons",
              "value": "4-säsong"
            },
            {
              "id": "waterproofing",
              "value": "5000 mm"
            },
            {
              "id": "poleMaterial",
              "value": "DAC aluminium"
            },
            {
              "id": "floorMaterial",
              "value": "70D nylon"
            },
            {
              "id": "flysheetMaterial",
              "value": "40D ripstop"
            },
            {
              "id": "packedSize",
              "value": "52 × 18 cm"
            },
            {
              "id": "vestibule",
              "value": "1.2 m²"
            },
            {
              "id": "doors",
              "value": "2"
            },
            {
              "id": "color",
              "value": "Röd"
            },
            {
              "id": "warranty",
              "value": "7 år"
            },
            {
              "id": "innerHeight",
              "value": "115 cm"
            },
            {
              "id": "floorArea",
              "value": "3.9 m²"
            },
            {
              "id": "setupTime",
              "value": "10 min"
            },
            {
              "id": "windResistance",
              "value": "Klass 7"
            },
            {
              "id": "condensationRating",
              "value": "Utmärkt"
            },
            {
              "id": "repairKit",
              "value": "Ja"
            },
            {
              "id": "guyLines",
              "value": "10 st"
            },
            {
              "id": "storagePockets",
              "value": "5"
            }
          ],
          "price": 4099,
          "stock": 31
        }
      ]
    }
  },
  {
    "id": "friluftsportalen-hiking-shoes-001",
    "manifest": {
      "meta": {
        "packId": "friluftsportalen-hiking-shoes-001",
        "brand": "Friluftsportalen",
        "assortment": "Hiking Shoes 2026",
        "version": "1.1.0",
        "generatedAt": "2026-06-12T10:00:00Z",
        "staleAfter": "2026-07-12T00:00:00Z",
        "apiBase": "http://localhost:4040"
      },
      "schema": [
        {
          "name": "sku",
          "label": {
            "sv": "Artikelnummer",
            "no": "Artikkelnummer",
            "da": "Varenummer",
            "fi": "Tuotenumero"
          },
          "type": "string",
          "exportable": true
        },
        {
          "name": "name",
          "label": {
            "sv": "Produktnamn",
            "no": "Produktnavn",
            "da": "Produktnavn",
            "fi": "Tuotenimi"
          },
          "type": "string",
          "exportable": true
        },
        {
          "name": "description",
          "label": {
            "sv": "Beskrivning",
            "no": "Beskrivelse",
            "da": "Beskrivelse",
            "fi": "Kuvaus"
          },
          "type": "string",
          "exportable": true
        },
        {
          "name": "price",
          "label": {
            "sv": "Pris (SEK)",
            "no": "Pris (SEK)",
            "da": "Pris (SEK)",
            "fi": "Hinta (SEK)"
          },
          "type": "number",
          "exportable": true
        },
        {
          "name": "stock",
          "label": {
            "sv": "Lagersaldo",
            "no": "Lagerbeholdning",
            "da": "Lagerbeholdning",
            "fi": "Varasto"
          },
          "type": "number",
          "exportable": true
        }
      ],
      "attributeSchema": [
        {
          "id": "weight",
          "label": {
            "sv": "Vikt",
            "no": "Vekt",
            "da": "Vægt",
            "fi": "Paino"
          }
        },
        {
          "id": "sizes",
          "label": {
            "sv": "Storlekar",
            "no": "Størrelser",
            "da": "Størrelser",
            "fi": "Koot"
          }
        },
        {
          "id": "upperMaterial",
          "label": {
            "sv": "Ovandel",
            "no": "Overdel",
            "da": "Overdel",
            "fi": "Yläosa"
          }
        },
        {
          "id": "sole",
          "label": {
            "sv": "Sula",
            "no": "Såle",
            "da": "Sål",
            "fi": "Pohja"
          }
        },
        {
          "id": "waterproof",
          "label": {
            "sv": "Vattentät",
            "no": "Vanntett",
            "da": "Vandtæt",
            "fi": "Vedenpitävä"
          }
        },
        {
          "id": "drop",
          "label": {
            "sv": "Drop",
            "no": "Drop",
            "da": "Drop",
            "fi": "Drop"
          }
        },
        {
          "id": "lastWidth",
          "label": {
            "sv": "Lästbredd",
            "no": "Lestbredde",
            "da": "Lestbredde",
            "fi": "Leveys"
          }
        },
        {
          "id": "gender",
          "label": {
            "sv": "Kön",
            "no": "Kjønn",
            "da": "Køn",
            "fi": "Sukupuoli"
          }
        },
        {
          "id": "color",
          "label": {
            "sv": "Färg",
            "no": "Farge",
            "da": "Farve",
            "fi": "Väri"
          }
        },
        {
          "id": "lining",
          "label": {
            "sv": "Foder",
            "no": "Fôr",
            "da": "Foer",
            "fi": "Vuori"
          }
        },
        {
          "id": "ankleSupport",
          "label": {
            "sv": "Ankelstöd",
            "no": "Ankelstøtte",
            "da": "Ankelstøtte",
            "fi": "Nilkkatuki"
          }
        },
        {
          "id": "toeProtection",
          "label": {
            "sv": "Tåskydd",
            "no": "Tåbeskyttelse",
            "da": "Tåbeskyttelse",
            "fi": "Varvassuoja"
          }
        },
        {
          "id": "breathability",
          "label": {
            "sv": "Andningsförmåga",
            "no": "Pusteevne",
            "da": "Åndbarhed",
            "fi": "Hengittävyys"
          }
        },
        {
          "id": "outsoleCompound",
          "label": {
            "sv": "Yttersula",
            "no": "Yttersåle",
            "da": "Ydersål",
            "fi": "Ulkopohja"
          }
        },
        {
          "id": "midsole",
          "label": {
            "sv": "Mellansula",
            "no": "Mellomsåle",
            "da": "Mellemsål",
            "fi": "Välipohja"
          }
        },
        {
          "id": "lacing",
          "label": {
            "sv": "Snörning",
            "no": "Snøring",
            "da": "Snøring",
            "fi": "Nauhoitus"
          }
        },
        {
          "id": "insole",
          "label": {
            "sv": "Innersula",
            "no": "Innersåle",
            "da": "Indersål",
            "fi": "Pohjallinen"
          }
        },
        {
          "id": "terrain",
          "label": {
            "sv": "Terräng",
            "no": "Terreng",
            "da": "Terræn",
            "fi": "Maasto"
          }
        },
        {
          "id": "warranty",
          "label": {
            "sv": "Garanti",
            "no": "Garanti",
            "da": "Garanti",
            "fi": "Takuu"
          }
        },
        {
          "id": "vegan",
          "label": {
            "sv": "Vegansk",
            "no": "Vegansk",
            "da": "Vegansk",
            "fi": "Vegaaninen"
          }
        }
      ],
      "products": [
        {
          "sku": "SHOE-001",
          "texts": {
            "sv": {
              "name": "Trailmaster GTX",
              "description": "Vattentäta vandringskängor med Gore-Tex membran och Vibram-sula."
            },
            "no": {
              "name": "Trailmaster GTX",
              "description": "Vanntette tursko med Gore-Tex membran og Vibram-såle."
            },
            "da": {
              "name": "Trailmaster GTX",
              "description": "Vandtætte vandrestøvler med Gore-Tex membran og Vibram-sål."
            },
            "fi": {
              "name": "Trailmaster GTX",
              "description": "Vedenpitävät vaelluskengät Gore-Tex-kalvon ja Vibram-pohjan kanssa."
            }
          },
          "imageUrl": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop",
          "attributes": [
            {
              "id": "weight",
              "value": "980 g"
            },
            {
              "id": "sizes",
              "value": "36-48"
            },
            {
              "id": "upperMaterial",
              "value": "Nubuckläder"
            },
            {
              "id": "sole",
              "value": "Vibram Megagrip"
            },
            {
              "id": "waterproof",
              "value": "Gore-Tex"
            },
            {
              "id": "drop",
              "value": "10 mm"
            },
            {
              "id": "lastWidth",
              "value": "Normal"
            },
            {
              "id": "gender",
              "value": "Unisex"
            },
            {
              "id": "color",
              "value": "Brun"
            },
            {
              "id": "lining",
              "value": "Gore-Tex"
            },
            {
              "id": "ankleSupport",
              "value": "Medel"
            },
            {
              "id": "toeProtection",
              "value": "Gummi"
            },
            {
              "id": "breathability",
              "value": "Hög"
            },
            {
              "id": "outsoleCompound",
              "value": "Megagrip"
            },
            {
              "id": "midsole",
              "value": "EVA"
            },
            {
              "id": "lacing",
              "value": "Snabbsnörning"
            },
            {
              "id": "insole",
              "value": "Ortopedisk"
            },
            {
              "id": "terrain",
              "value": "Blandad"
            },
            {
              "id": "warranty",
              "value": "2 år"
            },
            {
              "id": "vegan",
              "value": "Nej"
            }
          ],
          "price": 1799,
          "stock": 52
        },
        {
          "sku": "SHOE-002",
          "texts": {
            "sv": {
              "name": "Alpine Pro Mid",
              "description": "Stödjande mellanhöga kängor för fjällvandring och stenig terräng."
            },
            "no": {
              "name": "Alpine Pro Mid",
              "description": "Støttende mellomhøye støvler for fjellvandring og steinete terreng."
            },
            "da": {
              "name": "Alpine Pro Mid",
              "description": "Støttende mellemhøje støvler til bjergvandring og stenet terræn."
            },
            "fi": {
              "name": "Alpine Pro Mid",
              "description": "Tukevat puolikorkeat kengät vuoristovaellukseen ja kiviselle maastolle."
            }
          },
          "imageUrl": "https://images.unsplash.com/photo-1606107557195-0a29b4b4b4aa?w=400&h=300&fit=crop",
          "attributes": [
            {
              "id": "weight",
              "value": "1150 g"
            },
            {
              "id": "sizes",
              "value": "37-47"
            },
            {
              "id": "upperMaterial",
              "value": "Fullnarvsläder"
            },
            {
              "id": "sole",
              "value": "Vibram Megagrip"
            },
            {
              "id": "waterproof",
              "value": "Nej"
            },
            {
              "id": "drop",
              "value": "12 mm"
            },
            {
              "id": "lastWidth",
              "value": "Bred"
            },
            {
              "id": "gender",
              "value": "Herr"
            },
            {
              "id": "color",
              "value": "Svart"
            },
            {
              "id": "lining",
              "value": "Mesh"
            },
            {
              "id": "ankleSupport",
              "value": "Hög"
            },
            {
              "id": "toeProtection",
              "value": "PU-kappa"
            },
            {
              "id": "breathability",
              "value": "Medel"
            },
            {
              "id": "outsoleCompound",
              "value": "Megagrip"
            },
            {
              "id": "midsole",
              "value": "PU"
            },
            {
              "id": "lacing",
              "value": "Klassisk"
            },
            {
              "id": "insole",
              "value": "Stödjande"
            },
            {
              "id": "terrain",
              "value": "Fjäll"
            },
            {
              "id": "warranty",
              "value": "3 år"
            },
            {
              "id": "vegan",
              "value": "Nej"
            }
          ],
          "price": 2299,
          "stock": 34
        },
        {
          "sku": "SHOE-003",
          "texts": {
            "sv": {
              "name": "Speedlite Trail",
              "description": "Ultralätta trailskor för snabba dagsturer och löpning i terräng."
            },
            "no": {
              "name": "Speedlite Trail",
              "description": "Ultralette trailsko for raske dagsturer og terrengløping."
            },
            "da": {
              "name": "Speedlite Trail",
              "description": "Ultralette trailsko til hurtige dagsture og terrænløb."
            },
            "fi": {
              "name": "Speedlite Trail",
              "description": "Ultrakevyet polkujuoksukengät nopeille päiväretkille."
            }
          },
          "imageUrl": "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&h=300&fit=crop",
          "attributes": [
            {
              "id": "weight",
              "value": "620 g"
            },
            {
              "id": "sizes",
              "value": "36-46"
            },
            {
              "id": "upperMaterial",
              "value": "Mesh/syntet"
            },
            {
              "id": "sole",
              "value": "Vibram Litebase"
            },
            {
              "id": "waterproof",
              "value": "Nej"
            },
            {
              "id": "drop",
              "value": "6 mm"
            },
            {
              "id": "lastWidth",
              "value": "Normal"
            },
            {
              "id": "gender",
              "value": "Dam"
            },
            {
              "id": "color",
              "value": "Turkos"
            },
            {
              "id": "lining",
              "value": "Mesh"
            },
            {
              "id": "ankleSupport",
              "value": "Låg"
            },
            {
              "id": "toeProtection",
              "value": "Tåbump"
            },
            {
              "id": "breathability",
              "value": "Mycket hög"
            },
            {
              "id": "outsoleCompound",
              "value": "Litebase"
            },
            {
              "id": "midsole",
              "value": "EVA"
            },
            {
              "id": "lacing",
              "value": "Snabbsnörning"
            },
            {
              "id": "insole",
              "value": "Lätt"
            },
            {
              "id": "terrain",
              "value": "Trail/löpning"
            },
            {
              "id": "warranty",
              "value": "1 år"
            },
            {
              "id": "vegan",
              "value": "Ja"
            }
          ],
          "price": 1199,
          "stock": 67
        }
      ]
    }
  }
] as const;

export const SEED_EVENTS = [
  {
    packId: 'friluftsportalen-spring-tents-001',
    event: 'open',
    timestamp: '2026-06-12T12:00:00Z',
  },
  {
    packId: 'friluftsportalen-spring-tents-001',
    event: 'export',
    timestamp: '2026-06-12T12:01:00Z',
    payload: {
      format: 'csv',
      fields: ['sku', 'price'],
    },
  },
  {
    packId: 'friluftsportalen-spring-tents-001',
    event: 'open',
    timestamp: '2026-06-12T12:00:00Z',
  },
] as const;
