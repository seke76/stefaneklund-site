# BDY Day

En träningsapp för kroppsviktsträning. Den ligger på [stefaneklund.se/bdyday](https://stefaneklund.se/bdyday).

Idén är **"Vad vill du träna idag?"**: man svarar på några snabba frågor och får ett färdigt pass med bara kroppsvikt. Varje övning visas som en animerad figur. Appen är gratis, kräver inget konto och sparar all data i telefonen. Den går att installera på hemskärmen (PWA).

> **Håll den här filen aktuell.** Den beskriver hur appen fungerar *nu*. Ändras beteendet, datamodellen eller övningsbiblioteket ska filen uppdateras i samma commit (se `AGENTS.md` i repots rot). Exakta fält och typer finns i [`_lib/types.ts`](_lib/types.ts).

## Status

Version 1 byggs i steg. Det som finns nu:

- **Startsidan** (`/bdyday`): rubriken, streak och veckomål (fortfarande 0, eftersom pass inte loggas än) och knappen *Träna*. Knappen är avstängd tills passflödet finns.
- **Övningsbiblioteket** (`/bdyday/ovningar`): alla övningar med animerade figurer, filter per fokus och ett blad med instruktion och länkar till lättare och svårare varianter.
- **PWA**: manifest och ikoner. Appen kan läggas till på hemskärmen.

Kvar till v1: frågorna och passgeneratorn, passläget med timer, loggning av reps, progression, historik och inställningar.

## Sidor

| Adress | Vad | Fil |
|---|---|---|
| `/bdyday` | Startsidan "Idag" | `page.tsx` → `_components/home.tsx` |
| `/bdyday/ovningar` | Övningsbiblioteket | `ovningar/page.tsx` → `_components/library.tsx` |
| `/bdyday/manifest.webmanifest` | PWA-manifestet | `public/bdyday/manifest.webmanifest` |
| `/bdyday/pwa-icon/192`, `/512` | Appikoner till manifestet | `pwa-icon/[size]/route.tsx` |
| `/bdyday/apple-icon` | Ikon för iPhone-hemskärmen | `apple-icon.tsx` |

BDY Day har en **egen root-layout** (`layout.tsx`, `bdyday.css`), precis som Whenworks. Huvudsajtens stil påverkar den alltså inte.

## Utseende

Mörkt och sportigt: nästan svart bakgrund och **Hammarbygrönt** (`#00A651`) som accent. Rubrikerna använder *Barlow Condensed* (kursiv, versaler) och brödtexten *Inter*. Färgerna är variabler överst i `bdyday.css`.

## Språk

Svenska och engelska. Ett sparat val vinner, annars följer appen webbläsaren (svenska för `sv-*`, engelska för allt annat). Valet sparas i `localStorage` (`bdy_lang`). Gränssnittets texter finns i `_lib/i18n.ts`, och övningarnas namn och instruktioner finns i `_lib/exercises.ts`.

## Övningsbiblioteket

Alla övningar finns i [`_lib/exercises.ts`](_lib/exercises.ts). Varje övning har:

- **Familj och nivå (1–3).** Övningar i samma familj är lättare och svårare varianter av samma rörelse, till exempel *armhävning på knä → armhävning → triangelarmhävning*. Progressionen kommer att flytta upp och ner inom en familj.
- **Fokus.** Ben, överkropp, core, explosivt och löparstyrka. En övning kan ha flera. "Helkropp" är inget fokus på en övning utan en blandning i passet.
- **Roll.** Antingen en vanlig övning eller en *uppvärmningsövning*, som bara används i det valfria uppvärmningsblocket.
- **Mått.** Reps eller hålltid (plankor, häng).
- **Sidor.** Symmetrisk, växla sida, eller *per sida* (till exempel sidoplanka och enbensknäböj), som ger ett block per sida i passet.
- **Kräver.** Det mesta görs på golvet. Några övningar kräver en **räck/gren** eller en **trappa/kant**. Platsfrågan i passet styr om de får vara med.
- **Tempo.** *Långsamt* (löparstyrka) eller *explosivt* (hopp). Det visas som en hint och styr animationens takt.

Källor:
- Grundpasset kommer från Outside Online, *The 15-Minute Bodyweight Workout You Can Do Anywhere*: 15 övningar, 40 s arbete och 20 s vila.
- Löparstyrkan kommer från Runner's World, *Så kan du minska skaderisken som veteranlöpare* (Jimmy Englund, fysioterapeut). Därifrån är bara övningarna för kroppsvikt med (steg 1 och hoppen i steg 3). Steg 2 med vikter är utelämnat.
- Resten (`source: 'bdy'`) är vanliga basövningar som fyller ut familjerna med lättare och svårare varianter.

Ett nytt fokus eller en ny övning läggs till i `exercises.ts`. Biblioteket och filtren uppdateras då automatiskt.

## Figurerna

Figurerna är **SVG-streckgubbar som ritas i kod**, inte bilder. De är skarpa i alla storlekar, väger nästan ingenting och följer appens färger.

- En övning består av 1–5 **nyckelposer**. Animationen glider mellan dem i en loop. Med en enda pose (häng, planka) blir bilden stilla.
- En pose anges som **vinklar per kroppsdel**: 0° = rakt ner, 90° = framåt, 180° = rakt upp. Figuren tittar åt höger i sidovy. Därför behåller armar och ben alltid sin längd. Motorn finns i [`_lib/figure.ts`](_lib/figure.ts).
- **Sidovy eller framvy.** Sidrörelser (sidoutfall, hampelmannen, sidoplanka) visas framifrån.
- **Förankring.** Den första posen står på marken, eller hänger i stången för övningar med räck. Senare poser kan hålla en led på samma ställe, till exempel händerna i armhävningar eller bakre foten i utfall, så att figuren inte glider.
- **Låda.** Övningar med trappa/kant ritar en låda under den fot som står på den.
- I biblioteket animeras bara kort som syns på skärmen. Om telefonen har *minska rörelse* påslaget hoppar figuren mellan poserna i stället för att glida.

## Data

Inget sparas på servern. Historik och inställningar kommer att sparas lokalt i telefonen (IndexedDB), med export och import som backup. Just nu sparas bara språkvalet.
