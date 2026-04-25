## Wortel van het probleem

Brevo verwerpt onbekende attributen **stilzwijgend** (geen error, gewoon weg). De edge function `brevo-contact` stuurt op dit moment velden die niet bestaan in jouw Brevo-account:

| Wij sturen | Brevo kent | Resultaat |
|---|---|---|
| `COMPANY` | `BEDRIJF` | weggegooid |
| `FUNCTION` | `JOB_TITLE` | weggegooid |
| `PHONE` | `SMS` / `WHATSAPP` | weggegooid |
| `TAFEL` | bestaat niet | weggegooid |
| `SESSIE` | bestaat niet | weggegooid |
| `TOELICHTING` | bestaat niet | weggegooid |
| `OUTBOUND_CAMPAIGN` | `OUTBOUND_CAMPAGNES` (meervoud, multi-choice) | weggegooid |

Daarbovenop slaat de site de inschrijving **niet zelf op** in `registrations` — er wordt enkel naar Brevo gestuurd. Als Brevo iets verliest, is het voorgoed weg en het dashboard heeft niets om te tonen. De importknop is dus de enige manier om data te zien, en die kan enkel ophalen wat Brevo aanvaardde.

## Aanpak: beide combineren

### 1. Dashboard wordt primaire opslag

`AanmeldenSection.tsx` zal bij elke submit:
1. **Eerst** `INSERT` in `registrations` (volledige data: voornaam, bedrijf, functie, email, telefoon, thema, moment, toelichting, status `in_afwachting`).
2. **Dan pas** Brevo aanroepen voor de mailing-sync. Als Brevo faalt, blijft de inschrijving in het dashboard staan.

Idem voor de "op de hoogte"-flow → `subscribers`-tabel.

Hierdoor is de importknop niet meer nodig voor nieuwe inschrijvingen. Hij blijft bestaan voor het ophalen van bestaande contacten in list #61/#60 (handig voor mensen die je manueel toevoegt of historische data).

### 2. Brevo-attributen aligneren

`brevo-contact` stuurt voortaan de juiste namen:
- `BEDRIJF` ipv `COMPANY`
- `JOB_TITLE` ipv `FUNCTION`
- `SMS` en `WHATSAPP` ipv `PHONE` (telefoon wordt naar beide gemapt)
- `OUTBOUND_CAMPAGNES` als array (`["Ronde Tafel LP"]`) ipv string

Voor `TAFEL`, `SESSIE`, `TOELICHTING` zijn er twee opties:
- **A.** Aanmaken als nieuwe custom attributes via Brevo's `POST /v3/contacts/attributes/normal/{NAME}` endpoint (eenmalig, in een aparte stap of via de edge function bij eerste call).
- **B.** Niet doorsturen naar Brevo, want die info hoort thuis in het dashboard. Brevo krijgt enkel naam, bedrijf, functie, telefoon en de RondeTafel-tag/list.

→ Voorstel: **B** voor `TAFEL`/`SESSIE`/`TOELICHTING` (dashboard volstaat), wel `EXT_ID` blijven zetten met de tafel-slug zodat je in Brevo nog kan filteren op tafel.

### 3. Importknop blijft, maar wordt cosmetisch

`brevo-import` blijft bestaan voor handmatig toegevoegde contacten. Deduplicatie op email blijft, en de huidige "ontbrekende velden = fallback" logica blijft staan zodat oude contacten zoals Caro & Caroline nog binnenkomen met `Onbekend`/`Nog te bepalen` waar nodig.

### 4. Dashboard standaardfilter

`Admin.tsx` standaardfilter op "Alle statussen" (nu staat hij blijkbaar op "Wachtlijst"), zodat je na import/inschrijving altijd direct alles ziet.

## Technische wijzigingen

- `src/components/AanmeldenSection.tsx` — voeg `supabase.from('registrations').insert(...)` toe **vóór** de `brevo-contact`-invoke. Idem voor de op-de-hoogte-flow → `subscribers`.
- `supabase/functions/brevo-contact/index.ts` — hernoem attribuutkeys naar Brevo-conventies (`BEDRIJF`, `JOB_TITLE`, `SMS`, `WHATSAPP`, `OUTBOUND_CAMPAGNES` als array). Stop met `TAFEL`/`SESSIE`/`TOELICHTING` te sturen. `EXT_ID` blijft.
- `src/pages/Admin.tsx` — standaard statusfilter naar "alle".
- Geen DB-migratie nodig (tabellen bestaan al en zijn correct).

## Wat jij daarna ziet

- Iedere nieuwe inschrijving via de site verschijnt **onmiddellijk** in het dashboard, ongeacht wat Brevo doet.
- Brevo krijgt alle relevante mailing-velden correct gevuld (geen verloren `BEDRIJF`/`JOB_TITLE` meer).
- De 4 huidige inschrijvingen die je al manueel zag verschijnen via de import blijven zichtbaar; nieuwe inschrijvingen werken vanaf nu “gewoon”.
