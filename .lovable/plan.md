
## Doel

De "Houd me op de hoogte"-conversie verhogen door het inschrijfblok niet alleen onderaan te tonen, maar actief naar voren te brengen via een pop-up en een knop in de navbar.

## Wat we bouwen

### 1. Nieuwe pop-up component `KeepMePostedDialog`
Een Radix Dialog met dezelfde inhoud/logica als het bestaande `KeepMePosted`-blok (subscribers-tabel + Brevo lijst 60), maar in modal-vorm.

**Inhoud:**
- Titel: *"Kan je er niet bij zijn? Niet het juiste thema?"*
- Subtitel: *"Blijf op de hoogte van de tafels en ontvang als eerste de key insights van elke editie."*
- Velden: Voornaam & naam, E-mail
- Knop: "Houd me op de hoogte" (primaire kleur #315eff)
- Succes-state met bevestiging
- Discrete sluit-knop (X) — sluiten = "later misschien"

### 2. Triggers (alle drie actief)
- **Exit-intent**: `mouseleave` event aan top van viewport (desktop)
- **Timer**: na 15 seconden op de pagina (mobile-fallback voor exit-intent)
- **Navbar-knop**: nieuwe knop "Blijf op de hoogte" rechts in de Navbar — opent direct de pop-up

Eerste van timer/exit-intent wint; daarna gedeactiveerd voor de sessie.

### 3. Frequentie-logica
- Bij sluiten of succesvolle inschrijving: `localStorage.setItem('keepPostedDismissedAt', Date.now())`
- Bij paginalaad: pop-up alleen automatisch tonen als laatste dismiss > 7 dagen geleden (of nooit getoond)
- Navbar-knop werkt **altijd** (negeert frequentie-cap) — zo kan de bezoeker zelf altijd opnieuw

### 4. Bestaand footer-blok
Blijft staan als backup, ongewijzigd.

## Technische details

**Nieuwe/aangepaste files:**
- `src/components/KeepMePostedDialog.tsx` (nieuw) — Dialog wrapper met formulier, herbruikt submit-logica
- `src/hooks/useKeepMePostedTrigger.ts` (nieuw) — beheert exit-intent + timer + 7-dagen localStorage
- `src/components/Navbar.tsx` — knop toevoegen die `setOpen(true)` triggert via context of prop-drilling
- `src/pages/Index.tsx` — `<KeepMePostedDialog>` mounten, `open`-state delen met Navbar
- (optioneel kleine refactor) submit-logica in `AanmeldenSection.tsx` extraheren naar shared util zodat dialog en footer-blok dezelfde code gebruiken

**State management:**
Eenvoudige `useState` in `Index.tsx` + context (of prop) zodat Navbar de dialog kan openen. Geen extra library nodig.

**Brevo & DB:**
Hergebruik exact dezelfde call: `subscribers` insert + `brevo-contact` edge function met `listIds: [60]`, `ext_id: "ronde-tafel-updates"`.

## Niet in scope
- A/B testen van varianten
- Aanpassen van Brevo-templates
- Wijzigen van de inhoud van het bestaande footer-blok
