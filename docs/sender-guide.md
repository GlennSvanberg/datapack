# Sender guide — delivering a DataPack to receivers

Use this when emailing or sharing a product catalog file with a B2B customer. The receiver gets a single `.html` file they open in a browser.

## Which file to send

After `npm run build:packs`, each assortment is built in two names under `packs/local/` and `packs/prod/`:

| File | Purpose |
|------|---------|
| `{packId}.html` | Technical name (dev/API reference) |
| `{Brand} — {Assortment}.html` | **Send this one** — human-readable name |

Example: `Friluftsportalen — Spring Tents 2026.html`

### Filename rules

- Lead with **brand + assortment title**
- Do not use internal `packId`, version slugs, or `-001` suffixes in the name the receiver sees
- Keep the `.html` extension (required for double-click open)
- In email body, call it a **product catalog file** — not "HTML attachment" or "DataPack"

## Email structure (5 blocks)

1. **Subject** — outcome, not technology  
   `Friluftsportalen — Spring Tents 2026 (product data & export)`

2. **What it is** — one sentence

3. **How to use** — three steps with bold actions

4. **Trust** — no login, offline, optional refresh

5. **Fallback** — blocked attachment + contact person

---

## Swedish (primary)

**Subject:** Friluftsportalen — Spring Tents 2026 (produktdata & export)

**Body:**

Hej!

Bifogat finner du produktkatalogen för **Spring Tents 2026** från Friluftsportalen. Du kan bläddra offline och exportera till Excel, CSV eller JSON.

**Så här gör du:**

1. Öppna den bifogade filen i **Chrome** eller **Edge** (dubbelklicka)
2. Klicka **Excel** (eller CSV / JSON) på första sidan
3. Filen sparas i din mapp **Hämtade filer** — öppna den i Excel som vanligt

**Bra att veta:**

- Ingen inloggning, inget installeras
- Fungerar offline
- Du kan **Uppdatera data** när du är online för senaste priser och lager

Om din e-post blockerar bilagan, svara på det här mailet så skickar vi filen via SharePoint/Teams.

Frågor? Kontakta [ditt namn] på [email@friluftsportalen.se]

Vänliga hälsningar,  
[Namn]  
Friluftsportalen

---

## Norwegian

**Emne:** Friluftsportalen — Spring Tents 2026 (produktdata & eksport)

Hei!

Vedlagt finner du produktkatalogen for **Spring Tents 2026** fra Friluftsportalen. Du kan bla offline og eksportere til Excel, CSV eller JSON.

**Slik gjør du:**

1. Åpne den vedlagte filen i **Chrome** eller **Edge** (dobbeltklikk)
2. Klikk **Excel** (eller CSV / JSON) på første side
3. Filen lagres i **Nedlastinger** — åpne den i Excel som vanlig

**Greit å vite:** Ingen innlogging, ingenting installeres, fungerer offline. **Oppdater data** når du er online for nyeste priser.

Spørsmål? Kontakt [navn] på [email@friluftsportalen.no]

---

## Danish

**Emne:** Friluftsportalen — Spring Tents 2026 (produktdata & eksport)

Hej!

Vedhæftet finder du produktkataloget for **Spring Tents 2026** fra Friluftsportalen. Du kan gennemse offline og eksportere til Excel, CSV eller JSON.

**Sådan gør du:**

1. Åbn den vedhæftede fil i **Chrome** eller **Edge** (dobbeltklik)
2. Klik **Excel** (eller CSV / JSON) på første side
3. Filen gemmes i **Overførsler** — åbn den i Excel som normalt

**Godt at vide:** Ingen login, intet installeres, virker offline. **Opdater data** når du er online for nyeste priser.

Spørgsmål? Kontakt [navn] på [email@friluftsportalen.dk]

---

## Finnish

**Aihe:** Friluftsportalen — Spring Tents 2026 (tuotetiedot & vienti)

Hei!

Liitteenä on **Spring Tents 2026** -tuoteluettelo Friluftsportalenilta. Voit selata offline-tilassa ja viedä Excel-, CSV- tai JSON-muodossa.

**Näin käytät:**

1. Avaa liitetiedosto **Chromessa** tai **Edgessä** (kaksoisnapsauta)
2. Napsauta **Excel** (tai CSV / JSON) etusivulla
3. Tiedosto tallentuu **Lataukset**-kansioon — avaa se Excelissä tavalliseen tapaan

**Hyvä tietää:** Ei kirjautumista, ei asennuksia, toimii offline-tilassa. **Päivitä tiedot** verkossa ollessasi uusimpien hintojen saamiseksi.

Kysymyksiä? Ota yhteyttä [nimi] — [email@friluftsportalen.fi]

---

## If email blocks the attachment

1. Upload the human-named file to SharePoint, Teams, or OneDrive
2. Send a link with the same 3-step instructions
3. Or zip the file with a short `README.txt` containing the Swedish template above (some filters allow `.zip` but block `.html`)

## Measuring success

After sending, check the dashboard for:

- `open` events — file was opened
- `export` with `source: "quick"` — used one-click Excel/CSV/JSON
- `export` with `source: "wizard"` — used Customize export

Low open rate → delivery/trust problem. Open without export → in-file framing problem.
