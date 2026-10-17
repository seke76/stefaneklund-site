# Konkurrentanalys – Whenworks

> **Ögonblicksbild från oktober 2026.** Till skillnad från [`README.md`](README.md), som alltid beskriver hur appen fungerar *nu*, är den här filen en analys vid ett visst datum. Marknad och priser ändras, så uppdatera datumet ovan när analysen görs om. Priserna kommer främst från tredjepartssidor, varav flera säljer konkurrerande produkter. Kontrollera dem på respektive tjänsts egen sida innan de används.

## Två olika kategorier

1. **Gruppomröstningar**, *"Vilken av de här tiderna passar flest?"* Hit hör Whenworks, Doodle, Rallly och When2meet.
2. **Bokningslänkar**, *"Här är min kalender, boka en tid."* Hit hör Calendly och Cal.com. De löser ett annat problem, nämligen att andra bokar tid hos dig, så de är inte direkta konkurrenter.

## Konkurrenterna

| Tjänst | Typ | Pris | Konto | Kännetecken |
|---|---|---|---|---|
| **Doodle** | Omröstning (Ja/Kanske/Nej) | Gratis **med reklam**. Pro ca 7–15 USD/mån | Arrangören behöver konto för det mesta | Marknadsledare med huvudkontor i Zürich (51–200 anställda enligt Gartner). Mycket fokus på betalfunktioner för företag. Användare klagar på reklam och gränssnitt. |
| **Rallly** | Omröstning (Ja/Om det behövs/Nej) | Gratis. Pro ca 4,67 USD/mån | Nej, varken för arrangör eller gäster | Den närmaste kopian av Doodle. Öppen källkod (AGPL) och går att köra på egen server. Skickar kalenderinbjudan när tiden är bestämd. Tidszoner hanteras automatiskt. |
| **When2meet** | Rutnät där man "målar" sin tillgänglighet | Gratis | Nej | Gammal och väldigt enkel. Ingen kalenderkoppling. |
| **Crab Fit** | Rutnät med värmekarta | Gratis | – | Modern When2meet med öppen källkod och tidszoner. |
| **LettuceMeet** | Rutnät | Gratis, ingen reklam | Nej | Kan visa ens Google-kalender bredvid rutnätet. Bokar inget. |
| **Xoyondo** | Omröstning | Gratis och en betalnivå | Inte för deltagare | Klassisk Doodle-stil, enkel. |
| **Outlook Scheduling Poll** | Omröstning inbyggd i Outlook | Ingår i Microsoft 365 | Arrangören behöver M365 | Ersatte FindTime 2023. Bra för den som redan sitter i Outlook. |
| **WhenAvailable** | Omröstning | Gratis | – | Riktar sig till vänner och familj. Har en egen jämförelselista som lyfter fram den egna produkten. |

Andra namn som dyker upp i jämförelser: OurCalendar, AreYouFree, PollThem, Nextcloud Polls och Framadate.

## Var Whenworks står sig bra

- **Rundor tills alla kan.** *"Alla måste kunna"* kombinerat med *"Fråga efter nya tider"* och vilka som saknas hittade vi inte hos någon annan. De flesta stannar vid en enda omröstning.
- **Flerdagsevent.** Startdagar som täcker flera dagar (*"17–18 okt"*), till exempel för resor och stugveckor. Omröstningsverktygen vi tittade på bygger på klockslag eller enskilda dagar.
- **Låsta namn och personlig länk.** De flesta gratistjänster låter vem som helst ändra någon annans svar.
- **Svenska först**, utan konto, utan reklam, och **automatisk radering efter 60 dagar.** Det är ett bra integritetsargument.
- **Arrangören kan ändra allas svar** direkt i tabellen, till exempel när någon svarat via sms.

## Där vi ligger efter

1. **Mejl och påminnelser.** Rallly och Doodle mejlar deltagarna och skickar inbjudan när tiden är bestämd. Hos Whenworks är det byggt men avstängt tills Resend är uppsatt. Det här är den största luckan.
2. **Kalenderkoppling.** LettuceMeet och Doodle Pro kan visa ens egen kalender. Det kräver inloggning hos Google eller Microsoft och går emot "inga konton", så det kan vara ett medvetet val att avstå.
3. **Tidszoner.** Rallly och Crab Fit räknar om tider automatiskt. Det spelar liten roll för svenska grupper men stor roll internationellt.
4. **Synlighet.** Konkurrenterna lever på att synas i sökresultat som "Doodle alternativ".

## Rekommenderad prioritering

1. **Koppla in Resend.** Det låser upp inbjudningar via mejl, "tiden är bestämd"-mejl och senare påminnelser till dem som inte svarat. Koden finns redan.
2. **Dela-knappar för WhatsApp och SMS** på "Ditt event är klart". De flesta grupper planerar i chattar, och det kostar lite att bygga.
3. **Positionera tydligt:** *"Doodle-alternativet utan reklam och konto, på svenska, som frågar igen tills alla kan."* Lägg det på landningssidan och använd det för sökbarhet.
4. **Vänta med tidszoner och kalenderkoppling** tills någon faktiskt efterfrågar dem.

## Källor

- [ToolRadar – 10 Best Doodle Poll Alternatives (2026)](https://www.toolradar.com/blog/doodle-poll-alternative)
- [SchedulingKit – 17 Best Doodle Alternatives](https://schedulingkit.com/blog/17-best-doodle-alternatives)
- [Cal.com – Doodle alternatives](https://cal.com/blog/doodle-alternatives)
- [SchedulingKit – Doodle pricing](https://schedulingkit.com/pricing-guides/doodle-pricing)
- [Koalendar – Doodle pricing](https://koalendar.com/blog/doodle-pricing)
- [Rallly – pricing](https://rallly.co/en-GB/pricing)
- [Rallly – llms.txt](https://rallly.co/llms.txt)
- [Toolradar – Rallly](https://toolradar.com/tools/rallly)
- [Usecarly – LettuceMeet alternatives](https://www.usecarly.com/blog/lettucemeet-alternatives/)
- [Usecarly – Crab Fit alternatives](https://www.usecarly.com/blog/crab-fit-alternatives/)
- [Toolradar – LettuceMeet](https://www.toolradar.com/tools/lettucemeet)
- [Microsoft – FindTime ersätts av Scheduling Poll](https://support.microsoft.com/en-gb/office/findtime-in-outlook-a1154e49-da9a-4088-9126-97bf6b8337be)
- [Imperial College – FindTime is dead](https://blogs.imperial.ac.uk/office365/?p=369)
- [FitGap – Xoyondo](https://us.fitgap.com/products/061301/xoyondo)
- [WhenAvailable – Doodle alternatives](https://whenavailable.com/blog/doodle-alternatives)
- [WhenAvailable vs Doodle](https://whenavailable.com/blog/whenavailable-vs-doodle)
- [AlternativeTo – WhenAvailable](https://alternativeto.net/software/whenavailable)
- [SurveySparrow – Doodle alternatives](https://surveysparrow.com/blog/doodle-alternatives)
- [Capterra – Doodle](https://capterra.com/p/142620/Doodle/)
- [Gartner – Doodle](https://www.gartner.com/reviews/product/doodle)
- [G2 – Doodle reviews](https://www.g2.com/products/doodle/reviews?facet2=pdf)
