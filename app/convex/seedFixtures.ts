export const SEED_PACKS = [
  {
    "packId": "friluftsportalen-spring-tents-001",
    "manifest": {
      "meta": {
        "packId": "friluftsportalen-spring-tents-001",
        "brand": "Friluftsportalen",
        "assortment": "Spring Tents 2026",
        "version": "1.0.1",
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
              "key": {
                "sv": "Vikt",
                "no": "Vekt",
                "da": "Vægt",
                "fi": "Paino"
              },
              "value": "2.1 kg"
            },
            {
              "key": {
                "sv": "Kapacitet",
                "no": "Kapasitet",
                "da": "Kapacitet",
                "fi": "Kapasiteetti"
              },
              "value": "2 personer"
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
              "key": {
                "sv": "Vikt",
                "no": "Vekt",
                "da": "Vægt",
                "fi": "Paino"
              },
              "value": "4.8 kg"
            },
            {
              "key": {
                "sv": "Kapacitet",
                "no": "Kapasitet",
                "da": "Kapacitet",
                "fi": "Kapaciteetti"
              },
              "value": "4 personer"
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
              "key": {
                "sv": "Vikt",
                "no": "Vekt",
                "da": "Vægt",
                "fi": "Paino"
              },
              "value": "0.9 kg"
            },
            {
              "key": {
                "sv": "Kapacitet",
                "no": "Kapasitet",
                "da": "Kapacitet",
                "fi": "Kapaciteetti"
              },
              "value": "1 person"
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
              "key": {
                "sv": "Vikt",
                "no": "Vekt",
                "da": "Vægt",
                "fi": "Paino"
              },
              "value": "3.2 kg"
            },
            {
              "key": {
                "sv": "Säsong",
                "no": "Sesong",
                "da": "Sæson",
                "fi": "Kausi"
              },
              "value": "4-säsong"
            }
          ],
          "price": 4099,
          "stock": 31
        }
      ]
    }
  },
  {
    "packId": "friluftsportalen-hiking-shoes-001",
    "manifest": {
      "meta": {
        "packId": "friluftsportalen-hiking-shoes-001",
        "brand": "Friluftsportalen",
        "assortment": "Hiking Shoes 2026",
        "version": "1.0.1",
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
              "key": {
                "sv": "Vikt",
                "no": "Vekt",
                "da": "Vægt",
                "fi": "Paino"
              },
              "value": "980 g"
            },
            {
              "key": {
                "sv": "Storlekar",
                "no": "Størrelser",
                "da": "Størrelser",
                "fi": "Koot"
              },
              "value": "36-48"
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
              "key": {
                "sv": "Vikt",
                "no": "Vekt",
                "da": "Vægt",
                "fi": "Paino"
              },
              "value": "1150 g"
            },
            {
              "key": {
                "sv": "Sula",
                "no": "Såle",
                "da": "Sål",
                "fi": "Pohja"
              },
              "value": "Vibram Megagrip"
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
              "key": {
                "sv": "Vikt",
                "no": "Vekt",
                "da": "Vægt",
                "fi": "Paino"
              },
              "value": "620 g"
            },
            {
              "key": {
                "sv": "Drop",
                "no": "Drop",
                "da": "Drop",
                "fi": "Drop"
              },
              "value": "6 mm"
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
    "packId": "friluftsportalen-spring-tents-001",
    "event": "open",
    "timestamp": "2026-06-12T12:00:00Z"
  },
  {
    "packId": "friluftsportalen-spring-tents-001",
    "event": "export",
    "timestamp": "2026-06-12T12:01:00Z",
    "payload": {
      "format": "csv",
      "fields": [
        "sku",
        "price"
      ]
    }
  },
  {
    "packId": "friluftsportalen-spring-tents-001",
    "event": "open",
    "timestamp": "2026-06-12T12:00:00Z"
  }
] as const;
