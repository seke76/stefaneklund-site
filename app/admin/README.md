# Admin

En privat sida på [stefaneklund.se/admin](https://stefaneklund.se/admin) där du ser om apparna fungerar och hur de används.

> **Håll den här filen aktuell.** Ändras inloggningen, vad som mäts eller vad sidan visar ska filen uppdateras i samma commit.

## Vad sidan visar

- **Hälsa:**
  - om databasen svarar, och hur snabbt
  - om mejl är påslaget, och hur många mejl som skickats eller misslyckats i dag
  - antal fel i dag
  - vilken version (commit) som ligger live
- **Whenworks:**
  - skapade event, nya deltagare och bekräftade tider, jämfört med perioden innan
  - hur stor andel av besöken på startsidan som blir ett event
  - stapeldiagram per dag
  - vilka val arrangörerna gör
  - aktivitet: svar, rundor, besök och mejl
- **Hemsidan:** besök per dag.
- **Senaste fel:** de 20 senaste felen, med tid, var de hände och felmeddelandet.

Du väljer period (7, 30 eller 90 dagar) uppe till höger.

## Inloggning

Du loggar in med GitHub, och **bara kontot i `ADMIN_GITHUB_USER` släpps in**. Lösenord och tvåstegsverifiering sköts alltså av GitHub.

```mermaid
sequenceDiagram
  Webbläsare->>/admin/login: Logga in med GitHub
  /admin/login->>Webbläsare: cookie adm_state + vidare till GitHub
  Webbläsare->>GitHub: loggar in, godkänner
  GitHub->>/admin/callback: tillbaka med code + state
  /admin/callback->>GitHub: byter code mot token, frågar vem det är
  /admin/callback->>Webbläsare: rätt konto? cookie adm_session → /admin
```

- **`state`** är ett engångsvärde som skyddar mot att någon annan startar inloggningen åt dig.
- **Sessionen** är en signerad cookie (`adm_session`) som innehåller GitHub-namnet och ett utgångsdatum. Signaturen är en HMAC med `ADMIN_SESSION_SECRET`, så den går inte att förfalska eller ändra.
- Cookien är `httpOnly`, vilket betyder att JavaScript inte kan läsa den. Den skickas bara via https och bara till `/admin`, och den gäller i 7 dagar.
- Åtkomsten kontrolleras **på servern**:
  - Sidan kör `verifySession()` (i `_lib/session.ts`).
  - Datafunktionen `loadDashboard()` (i `_lib/data.ts`) kontrollerar själv igen.
  - Utan giltig session visas bara inloggningsknappen och ingen data alls.
- Inloggningen sparar inte GitHubs token.
- Sidan är blockerad för sökmotorer.
- *Logga ut* raderar cookien. Byter du `ADMIN_SESSION_SECRET` loggas alla sessioner ut direkt.

## Statistik

Räknarna finns i [`lib/stats.ts`](../../lib/stats.ts) och sparas i **samma Upstash Redis-databas** som Whenworks.

- **Bara räknare:** en per app, mätvärde och dag, i nyckeln `st:{app}:{mätvärde}:{åååå-mm-dd}` (svensk tid). Namn, mejladresser, IP-adresser och cookies på besökarna sparas aldrig.
- Räknarna sparas i **400 dagar**, så statistiken lever kvar efter att eventen raderats (efter 60 dagar).
- **Fel** sparas i listan `st:errors`. Där ligger de 50 senaste, med bara tid, app, plats och felmeddelande. De raderas efter 90 dagar.
- **Sidvisningar** räknas med en liten "beacon" (`components/PageView.tsx`) som anropar `/api/hit`.
  - Bara sidnamn som står i listan i `app/api/hit/route.ts` räknas.
  - Botar och automatiska webbläsare filtreras bort.
  - Eftersom vem som helst kan anropa `/api/hit` ska besöksräknarna ses som ungefärliga.
- **Whenworks** räknar i `app/whenworks/actions.ts` (skapade event och vad som valdes, svar, nya deltagare, rundor, bekräftade tider). Mejl räknas i `sendEmails` och fel i `run()`.

Ny app? Lägg till den i typen `AppId` i `lib/stats.ts`, anropa `track()` där saker händer och lägg till en sektion i `page.tsx`.

## Kodens delar

| Fil | Ansvar |
|---|---|
| `page.tsx` | Inloggningsrutan eller dashboarden |
| `_lib/session.ts` | Konfiguration, signerad session, `verifySession()` |
| `_lib/data.ts` | Hämtar allt dashboarden visar (efter sessionskontroll) |
| `login/route.ts`, `callback/route.ts` | GitHub-inloggningen |
| `actions.ts` | Logga ut |
| `_components/ui.tsx` | Nyckeltal, stapeldiagram, andelar och statusrutor |
| `lib/stats.ts`, `lib/redis.ts` | Räknare, fellogg och databaskopplingen (delas med apparna) |

## Konfiguration

| Miljövariabel | Vad |
|---|---|
| `GITHUB_CLIENT_ID` + `GITHUB_CLIENT_SECRET` | Från en *OAuth App* på GitHub (Settings → Developer settings → OAuth Apps). Callback-adressen ska vara `https://www.stefaneklund.se/admin/callback`. |
| `ADMIN_GITHUB_USER` | GitHub-kontot som får logga in, t.ex. `seke76`. |
| `ADMIN_SESSION_SECRET` | En lång slumpad sträng (minst 32 tecken) som signerar sessionen. Skapa den med `openssl rand -base64 32`. |

Saknas någon av dem kan ingen logga in, och sidan säger att inloggningen inte är konfigurerad. Versionsrutan använder Vercels systemvariabler (`VERCEL_GIT_COMMIT_SHA` med flera).
