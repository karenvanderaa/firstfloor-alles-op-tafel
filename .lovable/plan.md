

## Plan: Brevo API-integratie configureren

Je redenering klopt. Twee aanpassingen nodig:

### 1. API key veilig opslaan
De Brevo API key is een **private key** en mag niet in de broncode. We slaan hem op als secret via Lovable, zodat hij beschikbaar is als `VITE_BREVO_API_KEY` in de build.

> **Let op**: omdat dit een client-side app is zonder backend, wordt de key zichtbaar in de browser. Voor een productie-omgeving zou een edge function beter zijn, maar voor nu werkt dit.

### 2. listIds aanpassen in AanmeldenSection.tsx

**Hoofdformulier (RegistrationFormFull)** — regel ~100:
- `listIds: []` → `listIds: [61]`

**Mini-formulier (KeepMePosted)** — regel ~175:
- `listIds: []` → `listIds: [60]`

Dat is alles. De rest van de Brevo-integratie (velden, attributes, API-call) staat er al correct in.

### Technische details
- Bestand: `src/components/AanmeldenSection.tsx`
- Twee kleine wijzigingen: beide `listIds` arrays vullen
- API key opslaan via Lovable's secret management tool

