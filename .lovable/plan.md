# Whitepaper landingspagina

Doel: één deelbare URL waar bezoekers vanuit externe campagnes (LinkedIn ads, e-mails, partnersites) rechtstreeks de AI-in-HR whitepaper kunnen aanvragen, zonder afleiding van de rest van de site.

## Nieuwe route

`/whitepaper/ai-in-hr` — publieke, standalone landingspagina.

Structuur (top → bottom):
1. **Compacte header** met logo (linkt naar `/`), geen volledige navbar → focus op conversie.
2. **Hero split-layout**
   - Links: badge "Gratis whitepaper", H1 "AI in HR: wat betekent dat nu écht?", korte intro (2 zinnen), 3 bullet-takeaways (hergebruik `aiTakeaways` uit `Index.tsx`), download-formulier (hergebruikt exact hetzelfde blauwe gradient-formulier dat nu in de kaart zit).
   - Rechts: whitepaper share-image (`whitepaper-ai-hr-share.png`) als mockup/cover.
3. **Tafelgast-blok** (Ellen Poppe) — social proof.
4. **Over Alles op Tafel** — 2-3 zinnen + CTA-link "Ontdek de volgende ronde tafels →" naar `/#edities`.
5. **Footer** (hergebruik bestaande `Footer`).

## Refactor voor hergebruik

De whitepaper-form zit nu ingebakken in `RondeTafelCard.tsx` als interne `WhitepaperForm`. Extraheer naar `src/components/WhitepaperForm.tsx` zodat zowel de kaart op de homepage als de nieuwe landingspagina exact hetzelfde formulier tonen (zelfde DB-insert → zelfde Brevo-trigger → zelfde list #65). Nul gedragsverandering.

Optioneel `source`-veld toevoegen aan het formulier (default `"homepage"` op de kaart, `"landing"` op de nieuwe pagina) → later handig om te zien welke campagne converteert. Vereist één extra kolom in `whitepaper_downloads` + doorgeven aan de sync-functie zodat het als attribuut mee naar Brevo gaat.

## SEO & deelbaarheid

- Per-route `<Helmet>` op de landingspagina met eigen `<title>`, `<meta description>`, canonical `https://allesoptafel.firstfloortalent.be/whitepaper/ai-in-hr`, en `og:image` = de bestaande whitepaper share-image.
- Vereist installatie van `react-helmet-async` + `HelmetProvider` in `main.tsx` (nog niet aanwezig).
- Route toevoegen aan `App.tsx`.

## Deelbare URL

Na deploy: `https://allesoptafel.firstfloortalent.be/whitepaper/ai-in-hr` — te gebruiken in LinkedIn, e-mailhandtekeningen, partnermailings, Google Ads. UTM-parameters (`?utm_source=linkedin&utm_campaign=...`) werken automatisch en kunnen later gelogd worden via het `source`-veld hierboven.

## Vragen voor jou

1. **URL-slug**: `/whitepaper/ai-in-hr` (aanbevolen, future-proof voor meer whitepapers) of korter `/whitepaper`?
2. **Source-tracking**: wil je nu al de `source`-kolom + Brevo-attribuut toevoegen, of pas als er echt meerdere campagnes lopen?
3. **Navbar op landing**: volledig weglaten (max conversie) of toch minimaal logo + link terug naar hoofdsite?
