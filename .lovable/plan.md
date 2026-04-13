

## Logo-integratie: Ronde Tafels visueel doorleven op de pagina

### Analyse

Het Ronde Tafels logo bevat drie sterke visuele elementen:
1. **De blauwe cirkel** (#315eff)
2. **Het roze accent-lijntje** (#f9b8c4) — subtiel maar onderscheidend
3. **De tagline "Alles op tafel."** — al in de navbar, maar niet visueel gekoppeld aan het logo

Het logo verschijnt nu alleen als klein overlay-element op de hero-foto. Dat is te weinig — het merk wordt niet "beleefd".

### Voorgestelde integratie-punten

**1. Footer — Logo als visueel anker**
Plaats het Ronde Tafels logo (klein, ~48px) boven de footer-tekst. Dit sluit de pagina af met het merk, net zoals de hero hem opent. Optioneel in een subtielere wit-op-donker variant.

**2. Sectie-dividers — Het roze lijntje als motief**
De huidige divider tussen hero en edities gebruikt vier gekleurde balkjes. Vervang of verrijk dit met het roze accent-lijntje uit het logo — datzelfde dunne, elegante streepje (#f9b8c4). Gebruik dit consequent als visueel scheidingsteken tussen secties, zodat het logo-element terugkomt zonder het logo zelf te herhalen.

**3. Aanmelden-sectie — Logo naast de titel**
Plaats een kleine versie van het logo (32-40px) naast de "Erbij zijn?" titel of bovenaan het formulier. Dit versterkt het gevoel dat je je aanmeldt voor iets exclusiefs met een eigen identiteit.

**4. RondeTafelCards — Subtiel watermerk**
Voeg het logo toe als licht watermerk (opacity ~5-8%) rechtsonder in elke RondeTafelCard. Dit geeft de kaarten meer eigen identiteit zonder de leesbaarheid te verstoren.

**5. "Over First Floor" sectie — Logo in de overgang**
Omdat deze sectie al de primary-blue achtergrond (#315eff) heeft — dezelfde kleur als het logo — kan het logo hier wit-op-blauw verschijnen als subtiel decoratief element, bijvoorbeeld naast de titel of als achtergrond-element.

### Technische aanpak

- **Footer.tsx**: Import logo SVG, toon boven copyright-tekst met `w-12 h-12 mx-auto mb-4 opacity-70`
- **Index.tsx**: Vervang de vier balkjes-divider door een enkel roze lijntje (`w-24 h-[2px] bg-accent-pink mx-auto`)
- **AanmeldenSection.tsx**: Voeg logo toe naast "Erbij zijn?" heading, `w-8 h-8 inline-block`
- **RondeTafelCard.tsx**: Voeg logo toe als absolute positioned watermerk `absolute bottom-4 right-4 w-16 h-16 opacity-[0.06]`
- **AboutSection.tsx**: Voeg logo toe naast "Over First Floor" heading of als decoratief element, `w-10 h-10 opacity-80` in wit variant (filter invert)

### Aanbeveling

Begin met punten **1, 2 en 3** — die hebben het meeste impact met het minste risico op visuele ruis. Punt 4 (watermerk) is subtiel maar effectief. Punt 5 hangt af van of je de "Over"-sectie visueel drukker wilt maken.

