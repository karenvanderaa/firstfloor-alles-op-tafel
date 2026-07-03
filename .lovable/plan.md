Ik stel voor om de admin-toegang robuuster te maken zodat je geen kortstondig “Geen toegang”-scherm of blanco pagina meer krijgt.

Plan:
1. **Auth-state scheiden**
   - In de auth-hook een expliciete admin-status voorzien: `checking`, `admin`, `not-admin`.
   - De adminpagina pas laten beslissen nadat de rolcontrole volledig klaar is.

2. **Geen tijdelijke foutstatus tonen**
   - “Geen toegang” alleen tonen wanneer de backend expliciet bevestigt dat de ingelogde gebruiker géén adminrol heeft.
   - Tijdens sessieherstel en rolcontrole een neutrale laadstatus tonen.

3. **Redirect-loop vermijden**
   - `/admin` niet laten renderen als admin voordat `user` én adminrol bevestigd zijn.
   - `/auth` pas naar `/admin` laten doorsturen wanneer de sessie stabiel is.

4. **Admin-data ophalen pas na adminbevestiging**
   - `registrations`, `subscribers` en `whitepaper_downloads` pas laden zodra adminrechten bevestigd zijn.
   - Data-fetch fouten tonen als melding, maar niet de hele adminpagina laten verdwijnen.

5. **Verifiëren**
   - De route `/admin` testen op de preview: eerst laadstatus, daarna admin backoffice of stabiele toegangsmelding; geen blanco scherm meer.