Doel: de "Onze edities"-sectie op de homepage herstructureren naar een tabblad-interface zodat komende edities altijd bovenaan en prominent staan, terwijl de afgelopen AI-editie + whitepaper toch vindbaar blijven.

### Aanpak

1. **Tabblad-interface inbouwen**
   - Gebruik het bestaande shadcn/ui `Tabs`-component (`src/components/ui/tabs.tsx`).
   - Vervang de huidige gestapelde kaartenlijst in `src/pages/Index.tsx` door een `<Tabs defaultValue="upcoming">` blok.
   - Tab 1: **"Komende edities"** (`value="upcoming"`).
   - Tab 2: **"Terugblik & whitepapers"** (`value="past"`).

2. **Inhoud per tab**
   - **Komende edities**: de bestaande `<VeranderingCard />` en `<GeneratiesCard />` (Augustus en September 2026).
   - **Terugblik & whitepapers**: de bestaande AI-editie kaart (`variant="past-whitepaper"`) met whitepaper-formulier.

3. **Deeplinks behouden**
   - Behoud het `anchorId="tafel-ai-in-hr"` op de past-whitepaper kaart.
   - Bij pagina-load: als de URL hash `#tafel-ai-in-hr` bevat, activeer programmatisch de "Terugblik & whitepapers"-tab en scroll naar het anker.
   - Op die manier blijven bestaande links naar `/whitepaper` en sociale shares werken.

4. **Visuele afwerking**
   - Tabs krijgen de huidige site-styling: subtiele onderlijn/pill-stijl in lijn met bestaande knoppen en badges.
   - Behoud `space-y-10` binnen elke tab zodat de kaarten niet visueel samenklonteren.
   - Mobiel: tabs blijven horizontaal scrollbaar of stacken netjes; kaarten houden hun huidige responsive gedrag.

5. **Functionaliteit behouden**
   - Alle bestaande props, seat counters, `onSelectTheme`, whitepaper-formulier en Brevo-sync blijven ongewijzigd werken.
   - Geen wijzigingen aan de individuele kaartcomponenten (`RondeTafelCard`) zelf, enkel hun ordening in de sectie.

### Bestanden die gewijzigd worden
- `src/pages/Index.tsx` — herstructurering van de edities-sectie naar tabs + deeplink-logica.
- Eventueel lichte aanpassingen in `src/index.css` als de standaard tab-styling niet voldoende aansluit (alleen indien nodig).

### Niet in scope
- Geen wijzigingen aan de admin backend, Brevo-sync, registratieformulier of individuele kaartinhoud.
- Geen nieuwe pagina's of routes.