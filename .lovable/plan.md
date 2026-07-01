# Grote update — implementatieplan

Voor ik alles bouw, hieronder de aanpak zodat je kan bevestigen. Ik werk in de volgorde van je briefing en houd de code generiek zodat toekomstige "afgelopen edities" makkelijk toegevoegd kunnen worden.

## Actiepunten voor Karen (nog manueel)

- **Whitepaper PDF** → uploaden naar Supabase Storage bucket `whitepapers` (die ik nu aanmaak). Ik voorzie een constante `WHITEPAPER_PDF_URL` met placeholder.
- **Pelckmans-logo** → nette lege slot, geen kapotte image.
- **Eigen og:image whitepaper** → fallback op huidige og-image tot beeld beschikbaar is.
- **Brevo-lijst "Whitepaper - AI in HR"** → placeholder-constante `WHITEPAPER_LIST_ID = 0` in `sync-to-brevo`.

## 1. AI in HR → whitepaper lead magnet

**RondeTafelCard.tsx** — herbouw als generieke component met varianten:
- `variant: "upcoming"` (huidig gedrag, behouden voor Verandering-kaart)
- `variant: "past-whitepaper"` (nieuw): "Afgelopen editie"-badge, takeaways-blok, inline whitepaper-formulier, Tafelgast-credit met foto+bio+label

**Nieuwe files/edits:**
- Migratie: `whitepaper_downloads` tabel + bucket `whitepapers` (publieke read) + trigger op `sync-to-brevo`
- `sync-to-brevo/index.ts`: derde case `whitepaper_downloads` → list #WHITEPAPER_LIST_ID + tag "Whitepaper" + eigen mail-template (`buildWhitepaperHtml`) met downloadlink
- `Index.tsx`: AI-kaart met variant `past-whitepaper`, tafel1Body ongewijzigd, takeaways + Ellen-blok als props
- `AanmeldenSection.tsx`: AI verwijderd als thema-optie, praktisch-blok toont "AI in HR: bekijk de whitepaper hierboven"
- `Admin.tsx`: derde tab "Whitepaper-downloads"

## 2. Tafelgast als USP

- **Hero.tsx**: pill "🎙️ Telkens een tafelgast" + extra intro-zin
- **FacilitatorsSection.tsx**: Ellen verwijderd, titel wordt "Karen aan tafel, telkens met een expert tafelgast" + nieuwe intro
- Label "Tafelgast" hergebruikbaar in card-component

## 3. Verandering-editie update

- Enige sessie: **do 27/8 8u–10u**, editielabel "Editie | Augustus 2026"
- Locatie: Pelckmans, Mechelsesteenweg 271, 2018 Antwerpen + badge "In samenwerking met Pelckmans Uitgevers" + logo-slot
- **Foto's**: skyline-vergadertafel (hoofdbeeld bovenaan card), boekenkast (secundair), Anke portret (tafelgast) — assets via `lovable-assets` uploaden vanuit `/mnt/user-uploads/`
- Layout: hoofdbeeld full-width bovenaan met afgeronde hoeken (matcht card radius), boekenkast als kleiner beeld in tafelgast/partner-blok, responsive stack op mobiel
- tafel2Body één zin verbreed (HR → "wie de verandering moet dragen")
- Anke Tafelgast-blok met bio + boekcredit (target=_blank rel=noopener noreferrer)
- `AanmeldenSection.tsx`: 1 moment-optie, praktisch-blok Pelckmans-locatie

## 4. Site-brede consistentie

- Hero eyebrow: "Ronde Tafels | by First Floor"
- `index.html` title/og:title/twitter:title: idem
- Editielabels op kaarten blijven per-maand

## 5. Extra

- **Live schaarste-teller**: Supabase count-query op `registrations` (thema+moment), toont "Nog X van 6 plekken vrij" of "Volzet" badge bij 0. Realtime channel voor live update.
- **og:image whitepaper**: `<Helmet>` niet nodig — SPA. Ik zet een generieke aparte `<meta>`-slot in index.html met commentaar dat het later per-route via helmet kan (huidig: fallback op bestaande og-image).

## Technische keuzes

- **Card refactor**: één component met discriminated union props (`variant`), niet twee losse components — voorkomt duplicatie en houdt het patroon herbruikbaar voor toekomstige afgelopen edities
- **Tafelgast**: gedeelde sub-component `TafelgastCredit` (foto + label + naam + bio + optionele boekcredit) — hergebruikt in beide kaartvarianten
- **Storage bucket**: publieke read policy zodat de mail-downloadlink direct werkt
- **Consent-vinkje**: alleen bij whitepaper-formulier, gevalideerd voor submit (button disabled tot aangevinkt)
- **Theme-type**: literal union in `AanmeldenSection.tsx` beperkt tot alleen Verandering; Index.tsx preselect-logica voor AI verwijderd (kaart heeft eigen inline flow)

Zeg maar "go" (of eventuele bijsturing) en ik voer alles in één beweging uit.
