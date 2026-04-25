## Doel

Een knop in het admin-dashboard waarmee je in één klik alle bestaande Brevo-contacten met de tag `RondeTafel` ophaalt en in de Lovable Cloud `registrations` tabel zet — zodat de 4 bestaande inschrijvingen (en alle eventuele toekomstige die buiten de site om in Brevo komen) zichtbaar worden.

## Hoe het werkt

1. In het admin-dashboard komt naast "Export CSV" een nieuwe knop **"Importeer uit Brevo"**.
2. Klik → een edge function `brevo-import` haalt alle contacten op met tag `RondeTafel` én attribuut `OUTBOUND_CAMPAIGN = "Ronde Tafel LP"` (zodat we andere Brevo-contacten met dezelfde tag niet per ongeluk meepakken).
3. Per contact wordt gemapt:
   - `email` → `email`
   - `FIRSTNAME` + `LASTNAME` → `voornaam` (zelfde formaat als nu)
   - `COMPANY` (of `BEDRIJF`) → `bedrijf`
   - `JOB_TITLE` (of `FUNCTIE`) → `functie`
   - `SMS` of `WHATSAPP` → `telefoon`
   - `TAFEL` → `thema`
   - `SESSIE` → `moment`
   - `TOELICHTING` → `toelichting`
4. Duplicaten worden vermeden via `upsert` op `email` (één rij per inschrijving). Bestaande rijen met admin-edits (status, notitie) blijven behouden.
5. Resultaat: toast met "X geïmporteerd, Y al aanwezig, Z overgeslagen (incomplete data)".

## Belangrijke beslissingen

- **Welke Brevo-attributen exact bestaan** weet ik nog niet 100% zeker. De edge function logt per contact welke velden ontbreken, en overgeslagen contacten worden in de response getoond — dan kan jij die handmatig aanvullen of ik pas de mapping aan.
- **Veiligheid**: edge function is alleen aanroepbaar door ingelogde admins (we checken `has_role` server-side met de user JWT).
- **Geen wijziging aan Brevo zelf**: puur leesactie op Brevo + insert in Lovable Cloud.
- **Email-uniqueness**: er komt een `UNIQUE` constraint op `registrations.email` zodat upsert werkt en dubbele inschrijvingen voor dezelfde persoon worden voorkomen. ⚠️ Als iemand zich twee keer voor verschillende thema's inschrijft, krijgt diegene maar één rij — laatst geïmporteerde wint. Alternatief: unique op `(email, thema)`. **Mijn voorstel: unique op `(email, thema)`** zodat dezelfde persoon wel voor beide thema's kan inschrijven.

## Technisch

**Migratie:**
```sql
ALTER TABLE registrations
  ADD CONSTRAINT registrations_email_thema_unique UNIQUE (email, thema);
```

**Nieuwe edge function `supabase/functions/brevo-import/index.ts`:**
- Verifieert JWT en checkt admin-rol via service role client + `has_role`.
- Paginates door `GET https://api.brevo.com/v3/contacts?limit=100&offset=...&modifiedSince=...` (geen filter op tag in deze endpoint, dus filteren we client-side op `tags.includes('RondeTafel')` en `attributes.OUTBOUND_CAMPAIGN === 'Ronde Tafel LP'`).
- Upsert via service role naar `registrations` met `onConflict: 'email,thema'`, `ignoreDuplicates: false` maar enkel velden updaten als ze nog leeg zijn (zodat admin-status/notitie behouden blijven — gebeurt in code, niet in SQL).
- Returns `{ imported, skipped, errors[] }`.

**Frontend (`src/pages/Admin.tsx`):**
- Knop "Importeer uit Brevo" naast "Export CSV".
- Bij klik: `supabase.functions.invoke('brevo-import')` → toast met resultaat → `fetchRows()`.

**Geen wijziging** aan bestaande `brevo-contact` function of formulier.

## Wat je daarna ziet

- 4 bestaande inschrijvingen (of zoveel als er bruikbare data hebben) verschijnen in `/admin`.
- Voor wie incomplete data heeft (bv. geen `TAFEL` attribuut in Brevo), krijg je een lijst in de toast — die kan je dan handmatig toevoegen of we passen de mapping aan.
- Knop blijft beschikbaar voor toekomstige re-syncs (idempotent dankzij upsert).
