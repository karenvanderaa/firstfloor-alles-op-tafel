## Doel
Tabbladen in de sectie "Onze edities" opvallender maken en per afgelopen editie een eigen tabblad voorzien.

## Wijzigingen (allemaal in `src/pages/Index.tsx`, plus lichte styling)

**1. Tabbladen**
- Tab 1: `Komende edities` (blijft, standaard actief)
- Tab 2: `Afgelopen editie "AI in HR" + whitepaper` — bevat de bestaande past-whitepaper kaart
- Structuur wordt zo opgezet dat elke volgende afgelopen editie simpelweg één extra tab wordt (één array van past-edities → tabs gerenderd in een loop), zodat toekomstige edities zonder herstructurering bijkomen.

**2. Opvallender actief tabblad**
- Actieve tab krijgt een duidelijke merkkleur (primary blauw met witte tekst, subtiele schaduw) i.p.v. het huidige zachte grijs.
- Inactieve tabs blijven neutraal met hover-effect.
- Op mobiel: tabs scrollen horizontaal i.p.v. samengeperst grid, want de nieuwe tab-titel is lang.
- Styling gebeurt via de bestaande design tokens (geen hardcoded kleuren) op de `TabsTrigger` in `Index.tsx`.

**3. Deeplink blijft werken**
- `#tafel-ai-in-hr` activeert nog steeds automatisch het juiste (AI in HR) tabblad en scrollt ernaartoe.

## Technisch
- Geen wijziging aan `RondeTafelCard`, formulieren, teller of backend.
- Tab-waarden krijgen stabiele id's (`upcoming`, `ai-in-hr`) zodat hash-mapping netjes blijft.