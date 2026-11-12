import { COURSES, INSURANCE_WEEKLY, QUEUE_POINTS_NEEDED, RENT_EVERY, placeName } from './data'
import { current, jobOf, kr, price } from './engine'
import type { GameState } from './types'

/*
 * Birgitta's advice in the park. She looks at the current player's situation and says the single
 * most important thing, so a new player always knows what to do next. Order = priority.
 */

export type Tip = { text: string; urgent: boolean }

export function birgittaTip(s: GameState): Tip {
  const p = current(s)
  const era = s.settings.era
  const job = jobOf(p)
  const rentIn = (RENT_EVERY - (s.week % RENT_EVERY)) % RENT_EVERY
  const money = p.cash + p.bank
  const urgent = (text: string): Tip => ({ text, urgent: true })
  const hint = (text: string): Tip => ({ text, urgent: false })

  if (p.hoursLeft < 0.5) return hint('Veckan är slut! Nu blir det helg.')

  // Survival first.
  if (p.health < 25) return urgent('Du ser helt slut ut! Gå hem till Lägenheten och sov, annars blir du sjuk och förlorar en hel vecka.')
  if (p.foodWeeks === 0 && !p.ateThisWeek) return urgent(`Kylskåpet är tomt. Handla mat på Kvickköp (${kr(price(s, 900))}) innan helgen, annars svälter du.`)
  if (p.housing === 'soffa') return urgent('Du sover på en kompis soffa. Gå till Bostadsbolaget och hyr något nytt så fort du kan.')
  if (rentIn <= 1 && money < p.rent) {
    const when = rentIn === 0 ? 'i helgen' : 'nästa helg'
    return urgent(`Hyran på ${kr(p.rent)} dras ${when} och du har bara ${kr(money)}. Jobba mer, annars går det till inkasso.`)
  }
  if (p.inkasso > 0) return urgent(`Du har ${kr(p.inkasso)} hos inkasso. Betala på banken när du kan, hälften av lönen försvinner tills dess.`)
  if (p.health < 40) return urgent('Du är trött. Sov ut hemma eller träna på Gymmet, annars kan du bli sjuk.')

  // A new player: explain the basics.
  if (s.week === 1 && p.hoursLeft === 60 && !job)
    return hint('Välkommen! Klicka på ett hus för att gå dit. Börja med Jobbtorget, Hyllplockare kräver ingenting.')
  if (!job) return hint('Du behöver ett jobb. Gå till Jobbtorget och sök det bästa du kan få.')
  if (p.workedThisWeek === 0 && p.experience === 0 && s.week <= 2)
    return hint(`Grattis till jobbet! Gå till ${placeName(job.place, era)} och jobba ett pass. Lönen betalas direkt.`)
  if (p.workedThisWeek === 0 && p.hoursLeft < 40)
    return urgent(`Du har inte varit på jobbet den här veckan! Gå till ${placeName(job.place, era)}, annars tappar du pålitlighet och kan få sparken.`)
  if (p.workedThisWeek > 45) return hint('Du har jobbat över 45 timmar. Det tär på hälsan. Kanske dags att vila?')

  // Things that will bite at the weekend.
  if (p.cash > price(s, 3000) && p.hoursLeft <= 12)
    return hint(`Du har ${kr(p.cash)} i fickan. Sätt in dem på banken före helgen, annars äter helgen upp dem.`)
  if (p.housing === 'andrahand' && p.items.length && !p.insurance)
    return hint(`Långfingrade Leffe gillar andrahandslägenheter. En hemförsäkring på banken kostar ${kr(price(s, INSURANCE_WEEKLY))} i veckan.`)
  if (p.clothes > 0 && p.clothesWeeksLeft <= 1) return hint('Kläderna är snart utslitna. Nya finns på Kvickköp.')
  if (p.relations < 30) return hint('Du har inte träffat någon på länge. Ring familjen hemifrån eller gå till Gyllene Ekorren efter 16.')

  // Long-term goals.
  if (!p.inQueue) return hint(`Ställ dig i bostadskön på Bostadsbolaget. Efter ${QUEUE_POINTS_NEEDED} veckor får du en egen hyresrätt.`)
  if (!p.enrolled && p.degrees.length < s.settings.goals.education) {
    const next = COURSES.find((c) => !p.degrees.includes(c.id) && c.requires.every((r) => p.degrees.includes(r)))
    if (next) return hint(`Vill du ha bättre jobb? Läs ${next.name} på Högskolan. Det går att betala med CSN.`)
  }
  if (p.enrolled && p.studiedThisWeek === 0) {
    const c = COURSES.find((x) => x.id === p.enrolled)!
    return hint(`Du läser ${c.name}. Glöm inte att plugga, ${c.hours - (p.studyHours[c.id] ?? 0)} timmar kvar till examen.`)
  }
  if (p.health < 60 && !p.gymCard) return hint('Träning på Gymmet ger hälsa. Ett årskort lönar sig om du går ofta.')
  return hint('Det går bra! Tänk på alla fem målen: pengar, utbildning, karriär, relationer och lycka.')
}
