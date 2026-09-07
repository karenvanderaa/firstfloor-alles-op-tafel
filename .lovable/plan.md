# Whitepaper "Change & Adoption" toevoegen

Naar analogie met de AI-whitepaper krijgt de Ronde Tafel van 27/8 over verandering haar eigen whitepaper: downloadbaar bij de afgelopen editie én via een eigen landingspagina voor campagnes.

## Wat de bezoeker krijgt

- **Bij de afgelopen editie "Verandering & draagvlak"**: de melding "Whitepaper volgt binnenkort" wordt vervangen door het downloadformulier.
- **Nieuwe landingspagina** op `/whitepaper/change-adoption`, opgebouwd zoals de AI-pagina: titel "Change & Adoption — veranderen zonder je organisatie onderweg kwijt te raken", intro, drie kernpunten uit de whitepaper (tien principes, CARRP-framework, change-check van tien vragen), tafelgast Anke Ulens als sociale bewijskracht, en het formulier.
- Na het invullen: bevestiging op het scherm en een e-mail met een downloadlink naar deze whitepaper (niet de AI-versie).
- Aanvragers gaan naar dezelfde Brevo-lijst **#65**, met een veld dat aangeeft om welke whitepaper het gaat.

## Deelbeeld

De landingspagina en de sociale preview krijgen voorlopig het Ronde Tafels-beeld als plaatshouder. Zodra jij de cover doorstuurt, zet ik die erin — daar hoeft verder niets voor veranderd te worden.

## Technische uitvoering

1. **Opslag**: PDF uploaden naar de bestaande `whitepapers`-bucket als `change-adoption.pdf`.
2. **Database**: kolom `whitepaper` (tekst, standaard `ai-in-hr`) toevoegen aan `whitepaper_downloads`, zodat elke aanvraag weet om welke whitepaper het gaat. Bestaande rijen blijven op `ai-in-hr`.
3. **`WhitepaperForm.tsx`**: nieuwe prop `whitepaper` (`ai-in-hr` | `change-adoption`) plus aanpasbare titel/omschrijving; de waarde wordt mee opgeslagen.
4. **`sync-to-brevo`**: whitepaper-config per sleutel (bestandsnaam in storage, e-mailtitel, onderwerp, intro-tekst, Brevo-attribuut `WHITEPAPER`). Signed URL wordt gemaakt voor het juiste bestand. Lijst blijft #65.
5. **Nieuwe pagina** `src/pages/WhitepaperChangeAdoption.tsx` met Helmet-meta (title, description, canonical, og/twitter) en route in `App.tsx`.
6. **`Index.tsx` / `RondeTafelCard.tsx`**: `whitepaperPending` weghalen bij de editie "Verandering & draagvlak" en het formulier daar tonen met `whitepaper="change-adoption"`.
7. **Admin**: kolom "Whitepaper" tonen in het overzicht van downloads, zodat je beide van elkaar kan onderscheiden.
