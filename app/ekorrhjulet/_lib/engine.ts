import {
  BRF_DOWN,
  BRF_PRICE,
  CLOTHES,
  CLOTHES_NAME,
  COURSES,
  EGON_QUIPS,
  ERA_PRICE,
  FOOD_PRICE,
  GYM_CARD,
  GYM_DAYPASS,
  HOURS_PER_STEP,
  HOURS_PER_WEEK,
  HOUSING,
  INSURANCE_WEEKLY,
  INTEREST,
  ITEMS,
  JOBS,
  PLACES,
  QUEUE_POINTS_NEEDED,
  RENT_EVERY,
  WEEKENDS,
  WEEK_START_HOUR,
  placeName,
  type Item,
  type Job,
} from './data'
import { nextRandom } from './rng'
import type { Action, GameState, PlaceId, Player, PlayerSetup, Settings, SummaryLine, WeekSummary } from './types'

/*
 * The rules of Ekorrhjulet. Everything here is pure: each exported function takes a state
 * and returns a new one (the input is never changed), so the UI can keep history and save.
 */

const clone = <T,>(x: T): T => JSON.parse(JSON.stringify(x))
const clamp = (x: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, x))
const round = (x: number) => Math.round(x)
export const kr = (n: number) => `${Math.round(n).toLocaleString('sv-SE')} kr`

/** Swedish genitive: "Anna" → "Annas", "Jonas" → "Jonas", "Spelare 1" → "Spelare 1:s". */
export const genitive = (name: string) => (/[sxz]$/i.test(name) ? name : /[^a-zåäöé]$/i.test(name) ? `${name}:s` : `${name}s`)

function rand(s: GameState) {
  const [v, next] = nextRandom(s.rng)
  s.rng = next
  return v
}
const chance = (s: GameState, p: number) => rand(s) < p
const pick = <T,>(s: GameState, xs: T[]) => xs[Math.floor(rand(s) * xs.length)]
const diffMul = (s: GameState) => ({ snall: 0.5, normal: 1, elak: 1.5 })[s.settings.difficulty]

/** A price in today's game money: base (nutid kr) × era × drift. */
export const price = (s: GameState, base: number) => round(base * ERA_PRICE[s.settings.era] * s.priceLevel)

export const current = (s: GameState) => s.players[s.turn]
export const jobOf = (p: Player): Job | null => JOBS.find((j) => j.id === p.jobId) ?? null
export const items = (s: GameState) => ITEMS[s.settings.era]
const itemOf = (s: GameState, id: string): Item | undefined => items(s).find((i) => i.id === id)

/* ---------- Setup ---------- */

export function newGame(settings: Settings, setups: PlayerSetup[]): GameState {
  const s: GameState = {
    version: 1,
    settings,
    week: 1,
    turn: 0,
    players: [],
    rng: settings.seed,
    priceLevel: 1,
    crisisWeeks: 0,
    rentRaiseWeeks: 13,
    summary: null,
    winner: null,
    over: false,
    log: [],
  }
  s.players = setups.map((x, id) => ({
    id,
    name: x.name,
    color: x.color,
    ai: x.ai,
    location: 'lagenheten',
    hoursLeft: HOURS_PER_WEEK,
    cash: round(settings.startCash * ERA_PRICE[settings.era]),
    bank: 0,
    indexFund: 0,
    techStock: 0,
    loan: 0,
    csnDebt: 0,
    inkasso: 0,
    installments: [],
    health: 70,
    relations: 40,
    partner: false,
    goodRelationWeeks: 0,
    degrees: [],
    enrolled: null,
    studyHours: {},
    studiedThisWeek: 0,
    jobId: null,
    wage: 0,
    experience: 0,
    dependability: 20,
    workedThisWeek: 0,
    overworkStreak: 0,
    askedRaiseThisWeek: false,
    clothes: 1,
    clothesWeeksLeft: 6,
    housing: 'andrahand',
    rent: round(HOUSING.andrahand.rent * ERA_PRICE[settings.era]),
    inQueue: false,
    queuePoints: 0,
    missedRents: 0,
    mortgage: 0,
    items: [],
    insurance: false,
    foodWeeks: 1,
    ateThisWeek: false,
    gymCard: false,
    sickHoursNextWeek: 0,
    funThisWeek: 0,
    earnedThisWeek: 0,
    spentThisWeek: 0,
  }))
  return s
}

/* ---------- Derived meters (see README: Maslow) ---------- */

export function trygghet(p: Player): number {
  const home = { andrahand: 10, hyresratt: 30, bostadsratt: 40, soffa: 0 }[p.housing]
  const monthly = p.rent + FOOD_PRICE * 4
  const job = jobOf(p)
  return clamp(
    home +
      (p.bank >= monthly ? 20 : 0) +
      (job ? (job.level >= 3 ? 20 : 10) : 0) +
      (p.insurance ? 10 : 0) +
      (p.partner ? 5 : 0) -
      (p.inkasso > 0 ? 20 : 0),
  )
}

export function status(s: GameState, p: Player): number {
  const itemStatus = Math.min(30, p.items.reduce((a, id) => a + (itemOf(s, id)?.status ?? 0), 0))
  return clamp((jobOf(p)?.level ?? 0) * 7 + p.clothes * 6 + itemStatus + (p.housing === 'bostadsratt' ? 8 : 0))
}

export function utveckling(p: Player): number {
  const studied = Object.values(p.studyHours).reduce((a, b) => a + b, 0)
  return clamp(Math.round(p.degrees.length * 20 + Math.min(10, studied / 20) + (p.enrolled ? 5 : 0)))
}

/** Lycka: weighted Maslow levels; a level under 40 halves every level above it. */
export function lycka(s: GameState, p: Player): number {
  const levels = [p.health, trygghet(p), p.relations, status(s, p), utveckling(p)]
  const weights = [0.3, 0.25, 0.2, 0.15, 0.1]
  let blocked = false
  let sum = 0
  levels.forEach((v, i) => {
    sum += (blocked ? v / 2 : v) * weights[i]
    if (v < 40) blocked = true
  })
  const comfort = Math.min(10, p.items.reduce((a, id) => a + (itemOf(s, id)?.happy ?? 0), 0))
  return clamp(round(sum + comfort + (p.partner ? 5 : 0) - (p.relations < 20 ? 10 : 0)))
}

export const netWorth = (p: Player) =>
  p.cash + p.bank + p.indexFund + p.techStock + (p.housing === 'bostadsratt' ? BRF_PRICE : 0) - p.mortgage - p.loan - p.csnDebt - p.inkasso

export type Progress = { money: number; education: number; career: number; relations: number; happiness: number; total: number }

export function progress(s: GameState, p: Player): Progress {
  const g = s.settings.goals
  const pr = (v: number, goal: number) => clamp(goal > 0 ? (v / goal) * 100 : 100)
  const x = {
    money: pr(netWorth(p), price(s, g.money)),
    education: pr(p.degrees.length, g.education),
    career: pr(jobOf(p)?.level ?? 0, g.career),
    relations: pr(p.relations, g.relations),
    happiness: pr(lycka(s, p), g.happiness),
  }
  return { ...x, total: round((x.money + x.education + x.career + x.relations + x.happiness) / 5) }
}

/* ---------- Time ---------- */

const DAYS = ['Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Fredag']

/** Clock for hours used so far this week (12 waking hours a day). */
export function clock(hoursLeft: number) {
  const used = HOURS_PER_WEEK - hoursLeft
  const day = Math.min(4, Math.floor(used / 12))
  const h = WEEK_START_HOUR + (used - day * 12)
  const hh = Math.floor(h)
  const mm = Math.round((h - hh) * 60)
  return { day: DAYS[day], hour: h, label: `${DAYS[day]} ${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}` }
}

const slow = (p: Player) => (p.health < 25 ? 1.25 : 1)
const withSlow = (p: Player, h: number) => Math.round(h * slow(p) * 4) / 4

export function steps(from: PlaceId, to: PlaceId) {
  const a = PLACES.findIndex((x) => x.id === from)
  const b = PLACES.findIndex((x) => x.id === to)
  const d = Math.abs(a - b)
  return Math.min(d, PLACES.length - d)
}

/** Ring positions walked from `from` to `to`, the short way, including both ends. */
export function route(from: PlaceId, to: PlaceId): PlaceId[] {
  const n = PLACES.length
  const a = PLACES.findIndex((x) => x.id === from)
  const b = PLACES.findIndex((x) => x.id === to)
  const fwd = (b - a + n) % n
  const dir = fwd <= n - fwd ? 1 : -1
  const out: PlaceId[] = [from]
  for (let i = a; i !== b; ) {
    i = (i + dir + n) % n
    out.push(PLACES[i].id)
  }
  return out
}

export function travelHours(s: GameState, p: Player, to: PlaceId) {
  const saved = Math.max(0, ...p.items.map((id) => itemOf(s, id)?.travel ?? 0))
  return withSlow(p, steps(p.location, to) * HOURS_PER_STEP * (1 - saved))
}

/* ---------- Moving ---------- */

export function moveTo(state: GameState, to: PlaceId): GameState {
  const s = clone(state)
  const p = current(s)
  s.log = []
  if (p.location === to) return s
  const h = travelHours(s, p, to)
  if (h > p.hoursLeft) {
    s.log.push('Du hinner inte dit den här veckan.')
    return s
  }
  const from = p.location
  p.hoursLeft -= h
  p.location = to
  // Långfingrade Leffe waits outside the bank for people carrying cash.
  const streetRisk = (s.settings.era === '1994' ? 0.12 : 0.05) * diffMul(s)
  if (from === 'banken' && p.cash > price(s, 2000) && chance(s, streetRisk)) {
    const stolen = round(p.cash * (0.5 + rand(s) * 0.5))
    p.cash -= stolen
    s.log.push(`Långfingrade Leffe snodde ${kr(stolen)} när du gick från banken!`)
  }
  return s
}

/* ---------- Actions ---------- */

function pay(p: Player, amount: number): boolean {
  if (amount <= 0) return true
  if (p.cash >= amount) {
    p.cash -= amount
    p.spentThisWeek += amount
    return true
  }
  return false
}

const ok = (p: Player, a: Action) => (a.hours > p.hoursLeft ? 'Du har inte tid' : a.cost > p.cash ? 'Du har inte råd' : undefined)

export function meetsJob(s: GameState, p: Player, j: Job): string | undefined {
  const missing = j.degrees.filter((d) => !p.degrees.includes(d))
  if (missing.length) return `Kräver ${missing.map((d) => COURSES.find((c) => c.id === d)!.name).join(' + ')}`
  if (p.experience < j.experience) return `Kräver ${j.experience} veckors erfarenhet (du har ${p.experience})`
  if (p.clothes < j.clothes) return `Kräver ${CLOTHES_NAME[j.clothes].toLowerCase()}`
  if (p.dependability < j.dependability) return `Kräver pålitlighet ${j.dependability} (du har ${p.dependability})`
  return undefined
}

/** Everything the current player can do where they stand. */
export function actionsAt(s: GameState): Action[] {
  const p = current(s)
  const era = s.settings.era
  const hour = clock(p.hoursLeft).hour
  const out: Action[] = []
  const add = (a: Action) => out.push({ ...a, disabled: a.disabled ?? ok(p, a) })
  const job = jobOf(p)

  if (job && job.place === p.location) {
    const w = p.wage
    const garnish = p.inkasso > 0 ? ' (hälften går till inkasso)' : ''
    add({ id: 'work4', group: 'Jobb', label: `Jobba 4 h som ${job.name[era].toLowerCase()}`, hours: withSlow(p, 4), cost: -w * 4, note: `+${kr(w * 4)}${garnish}` })
    add({ id: 'work8', group: 'Jobb', label: 'Jobba 8 h', hours: withSlow(p, 8), cost: -w * 8, note: `+${kr(w * 8)}${garnish}` })
    add({
      id: 'raise',
      group: 'Jobb',
      label: 'Be om löneförhöjning',
      hours: 1,
      cost: 0,
      note: `${Math.round(p.dependability / 4)} % chans, +8 % lön`,
      disabled: p.askedRaiseThisWeek ? 'Du har redan frågat den här veckan' : undefined,
    })
  }

  switch (p.location) {
    case 'lagenheten': {
      const rest = 2 + restBonus(s, p)
      add({ id: 'rest2', label: 'Vila 2 h', hours: 2, cost: 0, note: `Hälsa +${rest * 2}` })
      add({ id: 'sleep4', label: 'Sov ut 4 h', hours: 4, cost: 0, note: `Hälsa +${rest * 4}` })
      add({ id: 'cook', label: 'Laga en riktig middag', hours: 1, cost: 0, note: 'Hälsa +4', disabled: p.foodWeeks > 0 ? undefined : 'Kylskåpet är tomt' })
      add({ id: 'call', label: era === '1994' ? 'Ring mamma från fasta telefonen' : 'Ring familjen', hours: 0.5, cost: 0, note: 'Relationer +4' })
      break
    }
    case 'jobbtorget': {
      const closed = hour >= 17 ? 'Stängt efter 17:00' : undefined
      for (const j of JOBS) {
        if (j.id === p.jobId) continue
        add({
          id: `apply:${j.id}`,
          group: 'Lediga jobb',
          label: `${j.name[era]} · ${placeName(j.place, era)}`,
          hours: 1,
          cost: 0,
          note: `${kr(price(s, j.wage))}/h · nivå ${j.level}`,
          disabled: closed ?? meetsJob(s, p, j),
        })
      }
      if (job) add({ id: 'quit', group: 'Ditt jobb', label: `Säg upp dig som ${job.name[era].toLowerCase()}`, hours: 0.5, cost: 0 })
      break
    }
    case 'hogskolan': {
      if (p.enrolled) {
        const c = COURSES.find((x) => x.id === p.enrolled)!
        const left = c.hours - (p.studyHours[c.id] ?? 0)
        add({ id: 'study4', group: c.name, label: 'Plugga 4 h', hours: withSlow(p, 4), cost: 0, note: `${left} h kvar till examen` })
        add({ id: 'study8', group: c.name, label: 'Plugga 8 h', hours: withSlow(p, 8), cost: 0, note: `${left} h kvar till examen` })
      }
      for (const c of COURSES) {
        if (p.degrees.includes(c.id) || p.enrolled === c.id) continue
        const missing = c.requires.filter((r) => !p.degrees.includes(r))
        const blocked = missing.length
          ? `Kräver ${missing.map((r) => COURSES.find((x) => x.id === r)!.name).join(' + ')}`
          : p.enrolled
            ? 'Du läser redan en kurs'
            : undefined
        const fee = price(s, c.fee)
        add({ id: `enroll:${c.id}`, group: 'Kurser', label: `${c.name} (${c.hours} h)`, hours: 1, cost: fee, note: `Avgift ${kr(fee)}`, disabled: blocked })
        add({
          id: `csn:${c.id}`,
          group: 'Kurser',
          label: `${c.name} med CSN-lån`,
          hours: 1,
          cost: 0,
          note: `Lånar avgiften + ${kr(price(s, 1200))}/vecka när du pluggar 20 h`,
          disabled: blocked,
        })
      }
      break
    }
    case 'banken': {
      const big = price(s, 5000)
      add({ id: 'deposit', group: 'Konto', label: 'Sätt in alla kontanter', hours: 0, cost: 0, note: `Sparränta ${INTEREST[era].save * 100} %/år`, disabled: p.cash <= 0 ? 'Inga kontanter' : undefined })
      add({ id: 'withdraw', group: 'Konto', label: `Ta ut ${kr(price(s, 1000))}`, hours: 0, cost: 0, disabled: p.bank < price(s, 1000) ? 'För lite på kontot' : undefined })
      add({ id: 'withdrawbig', group: 'Konto', label: `Ta ut ${kr(big)}`, hours: 0, cost: 0, disabled: p.bank < big ? 'För lite på kontot' : undefined })
      const maxLoan = job ? p.wage * 160 * 3 : 0
      add({
        id: 'loan',
        group: 'Lån',
        label: `Låna ${kr(price(s, 10000))}`,
        hours: 0.5,
        cost: 0,
        note: `${INTEREST[era].loan * 100} % ränta/år`,
        disabled: !job ? 'Banken lånar inte ut till arbetslösa' : p.loan + price(s, 10000) > maxLoan ? 'Du får inte låna mer' : undefined,
      })
      add({ id: 'repay', group: 'Lån', label: 'Betala av på lånet', hours: 0, cost: 0, note: `Skuld ${kr(p.loan)}`, disabled: p.loan <= 0 ? 'Inget lån' : p.cash <= 0 ? 'Inga kontanter' : undefined })
      if (p.inkasso > 0) add({ id: 'payinkasso', group: 'Lån', label: `Betala inkassoskulden ${kr(p.inkasso)}`, hours: 0, cost: 0, disabled: p.cash + p.bank <= 0 ? 'Inga pengar' : undefined })
      add({ id: 'buyindex', group: 'Fonder', label: `Köp indexfond för ${kr(big)}`, hours: 0, cost: big, note: 'Stiger oftast lite, svajar' })
      add({ id: 'sellindex', group: 'Fonder', label: `Sälj indexfond (${kr(p.indexFund)})`, hours: 0, cost: 0, disabled: p.indexFund <= 0 ? 'Du äger ingen' : undefined })
      add({ id: 'buytech', group: 'Fonder', label: `Köp ${era === '1994' ? 'IT-aktier' : 'teknikaktier'} för ${kr(big)}`, hours: 0, cost: big, note: 'Kan rusa, kan krascha' })
      add({ id: 'selltech', group: 'Fonder', label: `Sälj aktierna (${kr(p.techStock)})`, hours: 0, cost: 0, disabled: p.techStock <= 0 ? 'Du äger inga' : undefined })
      add({
        id: 'insurance',
        group: 'Försäkring',
        label: p.insurance ? 'Säg upp hemförsäkringen' : 'Teckna hemförsäkring',
        hours: 0.5,
        cost: 0,
        note: `${kr(price(s, INSURANCE_WEEKLY))}/vecka, ersätter stulna prylar`,
      })
      break
    }
    case 'kvickkop': {
      add({ id: 'food', group: 'Mat', label: 'Handla mat för en vecka', hours: 0.5, cost: price(s, FOOD_PRICE), note: p.foodWeeks ? `Du har mat för ${p.foodWeeks} veckor` : 'Kylskåpet är tomt!' })
      for (const c of CLOTHES) {
        add({ id: `clothes:${c.level}`, group: 'Kläder', label: `Köp ${c.name.toLowerCase()}`, hours: 0.5, cost: price(s, c.price), note: `Håller ca ${c.weeks} veckor` })
      }
      break
    }
    case 'mobel':
    case 'pryl': {
      for (const it of items(s).filter((i) => i.place === p.location)) {
        const owned = p.items.includes(it.id) ? 'Du har redan en' : undefined
        const pr = price(s, it.price)
        const effects = [`Status +${it.status}`, it.happy ? `trivsel +${it.happy}` : '', it.rest ? 'bättre vila' : '', it.travel ? 'kortare restid' : '']
          .filter(Boolean)
          .join(', ')
        add({ id: `buy:${it.id}`, group: 'Köp', label: `${it.name}`, hours: 0.5, cost: pr, note: effects, disabled: owned })
        if (p.location === 'pryl') {
          const weekly = round((pr * 1.2) / 24 + price(s, 39))
          add({ id: `inst:${it.id}`, group: 'Avbetalning', label: `${it.name} på avbetalning`, hours: 0.5, cost: 0, note: `0 kr idag, ${kr(weekly)}/vecka i 24 veckor`, disabled: owned })
        }
      }
      break
    }
    case 'bostad': {
      if (p.housing === 'soffa') {
        const first = price(s, HOUSING.andrahand.rent)
        add({ id: 'andrahand', label: `Hyr en andrahandsetta (${kr(first)}/mån)`, hours: 2, cost: first, note: 'Första månaden betalas direkt' })
      }
      add({ id: 'queue', label: 'Ställ dig i bostadskön', hours: 0.5, cost: 0, note: '1 köpoäng per vecka', disabled: p.inQueue ? `Du står i kön (${p.queuePoints} poäng)` : undefined })
      add({
        id: 'hyresratt',
        label: `Skriv kontrakt på en hyresrätt (${kr(price(s, HOUSING.hyresratt.rent))}/mån)`,
        hours: 1,
        cost: 0,
        note: `Kräver ${QUEUE_POINTS_NEEDED} köpoäng`,
        disabled: p.housing === 'hyresratt' || p.housing === 'bostadsratt' ? 'Du har redan eget kontrakt' : p.queuePoints < QUEUE_POINTS_NEEDED ? `Du har ${p.queuePoints} av ${QUEUE_POINTS_NEEDED} köpoäng` : undefined,
      })
      const down = price(s, BRF_PRICE * BRF_DOWN)
      add({
        id: 'brf',
        label: `Köp bostadsrätt (${kr(price(s, BRF_PRICE))})`,
        hours: 2,
        cost: 0,
        note: `Insats ${kr(down)} från banken, resten bolån`,
        disabled: p.housing === 'bostadsratt' ? 'Du äger redan' : !job || job.level < 4 ? 'Banken kräver fast jobb på nivå 4' : p.bank < down ? `Du behöver ${kr(down)} på banken` : undefined,
      })
      break
    }
    case 'puben': {
      if (hour < 16) {
        add({ id: 'wait16', label: 'Vänta tills puben öppnar 16:00', hours: Math.round((16 - hour) * 4) / 4, cost: 0 })
        break
      }
      add({ id: 'afterwork', label: 'Afterwork med kollegor', hours: 3, cost: price(s, 400), note: 'Relationer +10, Hälsa −2' })
      add({ id: 'quiz', label: 'Pubquiz', hours: 2, cost: price(s, 150), note: 'Relationer +6' })
      add({ id: 'date', label: p.partner ? 'Dejt med din partner' : 'Gå på dejt', hours: 3, cost: price(s, 600), note: 'Relationer +12' })
      break
    }
    case 'gymmet': {
      add({ id: 'gymcard', label: 'Köp årskort', hours: 0.5, cost: price(s, GYM_CARD), note: 'Träna utan dagsavgift', disabled: p.gymCard ? 'Du har redan årskort' : undefined })
      add({ id: 'train', label: 'Träna 2 h', hours: 2, cost: p.gymCard ? 0 : price(s, GYM_DAYPASS), note: 'Hälsa +8' })
      break
    }
  }
  return out
}

function restBonus(s: GameState, p: Player) {
  return p.items.reduce((a, id) => a + (itemOf(s, id)?.rest ?? 0), 0) * 0.5
}

export function perform(state: GameState, id: string): GameState {
  const s = clone(state)
  const p = current(s)
  s.log = []
  const a = actionsAt(s).find((x) => x.id === id)
  if (!a || a.disabled) return s
  const era = s.settings.era
  const say = (m: string) => s.log.push(m)
  const [verb, arg] = id.split(':')
  p.hoursLeft = Math.max(0, p.hoursLeft - a.hours)

  switch (verb) {
    case 'work4':
    case 'work8': {
      const h = verb === 'work4' ? 4 : 8
      let pay = p.wage * h
      if (p.inkasso > 0) {
        const g = Math.min(p.inkasso, round(pay / 2))
        p.inkasso -= g
        pay -= g
      }
      p.cash += pay
      p.earnedThisWeek += pay
      p.workedThisWeek += h
      const job = jobOf(p)!
      if (job.healthPerShift) p.health = clamp(p.health + (job.healthPerShift * h) / 4)
      say(`Du jobbade ${h} h och tjänade ${kr(pay)}.`)
      break
    }
    case 'raise': {
      p.askedRaiseThisWeek = true
      if (chance(s, p.dependability / 400)) {
        p.wage = round(p.wage * 1.08)
        say(`Chefen sa ja! Ny lön: ${kr(p.wage)}/h.`)
      } else say('Chefen skrattade vänligt och bytte samtalsämne.')
      break
    }
    case 'rest2':
    case 'sleep4': {
      const h = verb === 'rest2' ? 2 : 4
      p.health = clamp(p.health + (2 + restBonus(s, p)) * h)
      say(verb === 'rest2' ? 'Du vilade i soffan.' : 'Du sov som en stock.')
      break
    }
    case 'cook':
      p.health = clamp(p.health + 4)
      p.ateThisWeek = true
      say('Riktig mat! Kroppen tackar.')
      break
    case 'call':
      p.relations = clamp(p.relations + 4)
      say('Mamma undrade när du ska skaffa ett riktigt jobb. Men det var trevligt.')
      break
    case 'apply': {
      const j = JOBS.find((x) => x.id === arg)!
      const odds = 0.85 - (j.level >= 7 ? 0.15 : 0)
      if (chance(s, odds)) {
        p.jobId = j.id
        p.wage = price(s, j.wage)
        say(`Grattis! Du är anställd som ${j.name[era].toLowerCase()} på ${placeName(j.place, era)}.`)
      } else say('”Vi har valt att gå vidare med en annan kandidat.” Försök igen.')
      break
    }
    case 'quit':
      say('Du sa upp dig. Det kändes fantastiskt i tio minuter.')
      p.jobId = null
      p.wage = 0
      break
    case 'enroll':
    case 'csn': {
      const c = COURSES.find((x) => x.id === arg)!
      if (verb === 'enroll') pay(p, price(s, c.fee))
      else p.csnDebt += price(s, c.fee)
      p.enrolled = c.id
      say(`Du är antagen till ${c.name}!`)
      break
    }
    case 'study4':
    case 'study8': {
      const h = verb === 'study4' ? 4 : 8
      const c = COURSES.find((x) => x.id === p.enrolled)!
      p.studyHours[c.id] = (p.studyHours[c.id] ?? 0) + h
      p.studiedThisWeek += h
      if (p.studyHours[c.id] >= c.hours) {
        p.degrees.push(c.id)
        p.enrolled = null
        say(`Examen! Du är klar med ${c.name}.`)
      } else say(`Du pluggade ${h} h. ${c.hours - p.studyHours[c.id]} h kvar.`)
      break
    }
    case 'deposit':
      p.bank += p.cash
      say(`Du satte in ${kr(p.cash)}.`)
      p.cash = 0
      break
    case 'withdraw':
    case 'withdrawbig': {
      const amt = price(s, verb === 'withdraw' ? 1000 : 5000)
      p.bank -= amt
      p.cash += amt
      say(`Du tog ut ${kr(amt)}.`)
      break
    }
    case 'loan': {
      const amt = price(s, 10000)
      p.loan += amt
      p.cash += amt
      say(`Banken lånade ut ${kr(amt)}. Räntan börjar ticka.`)
      break
    }
    case 'repay': {
      const amt = Math.min(p.cash, p.loan)
      p.cash -= amt
      p.loan -= amt
      say(`Du betalade av ${kr(amt)}.`)
      break
    }
    case 'payinkasso': {
      const fromCash = Math.min(p.cash, p.inkasso)
      p.cash -= fromCash
      p.inkasso -= fromCash
      const fromBank = Math.min(p.bank, p.inkasso)
      p.bank -= fromBank
      p.inkasso -= fromBank
      if (p.inkasso === 0) p.missedRents = 0
      say(p.inkasso === 0 ? 'Inkassoskulden är betald. Puh.' : `Kvar att betala: ${kr(p.inkasso)}.`)
      break
    }
    case 'buyindex':
    case 'buytech':
      pay(p, a.cost)
      if (verb === 'buyindex') p.indexFund += a.cost
      else p.techStock += a.cost
      say('Köpt. Nu är du investerare.')
      break
    case 'sellindex':
      p.cash += p.indexFund
      say(`Du sålde fonden för ${kr(p.indexFund)}.`)
      p.indexFund = 0
      break
    case 'selltech':
      p.cash += p.techStock
      say(`Du sålde aktierna för ${kr(p.techStock)}.`)
      p.techStock = 0
      break
    case 'insurance':
      p.insurance = !p.insurance
      say(p.insurance ? 'Du har hemförsäkring. Leffe får leta någon annanstans.' : 'Försäkringen är uppsagd.')
      break
    case 'food':
      pay(p, a.cost)
      p.foodWeeks += 1
      say('Kylskåpet är fyllt.')
      break
    case 'clothes': {
      const c = CLOTHES.find((x) => x.level === Number(arg))!
      pay(p, a.cost)
      p.clothes = c.level
      p.clothesWeeksLeft = c.weeks
      say(`Du har nya ${c.name.toLowerCase()}.`)
      break
    }
    case 'buy': {
      const it = itemOf(s, arg)!
      pay(p, a.cost)
      p.items.push(it.id)
      say(`Du köpte ${it.name.toLowerCase()}.`)
      break
    }
    case 'inst': {
      const it = itemOf(s, arg)!
      const pr = price(s, it.price)
      p.items.push(it.id)
      p.installments.push({ item: it.name, weekly: round((pr * 1.2) / 24 + price(s, 39)), weeksLeft: 24 })
      say(`${it.name} är din! Första avbetalningen dras i helgen.`)
      break
    }
    case 'queue':
      p.inQueue = true
      say('Du står i bostadskön. Om ungefär 30 veckor händer det kanske något.')
      break
    case 'andrahand':
      pay(p, a.cost)
      p.housing = 'andrahand'
      p.rent = a.cost
      p.missedRents = 0
      say('Du har tak över huvudet igen. Kontraktet är skrivet på en servett.')
      break
    case 'hyresratt':
      p.housing = 'hyresratt'
      p.rent = price(s, HOUSING.hyresratt.rent)
      p.missedRents = 0
      say('Eget kontrakt! Hyran är låst så länge du bor kvar.')
      break
    case 'brf': {
      const total = price(s, BRF_PRICE)
      const down = price(s, BRF_PRICE * BRF_DOWN)
      p.bank -= down
      p.mortgage = total - down
      p.housing = 'bostadsratt'
      p.rent = price(s, HOUSING.bostadsratt.rent)
      say('Du äger din bostad! Och banken äger 85 procent av den.')
      break
    }
    case 'wait16':
      say('Du satt på en bänk och väntade. Duvorna var trevliga.')
      break
    case 'afterwork':
      pay(p, a.cost)
      p.relations = clamp(p.relations + 10)
      p.health = clamp(p.health - 2)
      p.funThisWeek += 1
      say('Afterwork! Någon pratade om sin bostadsrätt hela kvällen.')
      break
    case 'quiz':
      pay(p, a.cost)
      p.relations = clamp(p.relations + 6)
      p.funThisWeek += 1
      say(chance(s, 0.3) ? 'Ni vann pubquizen!' : 'Ni kom näst sist. Frågan om Melodifestivalen sänkte er.')
      break
    case 'date':
      pay(p, a.cost)
      p.relations = clamp(p.relations + 12)
      p.funThisWeek += 1
      say(p.partner ? 'En mysig kväll med din partner.' : 'Dejten gick bra! Eller, ni pratade i alla fall.')
      break
    case 'gymcard':
      pay(p, a.cost)
      p.gymCard = true
      say('Årskort! Nu finns inga ursäkter.')
      break
    case 'train':
      pay(p, a.cost)
      p.health = clamp(p.health + 8)
      say('Du tränade och känner dig som en ny ekorre.')
      break
  }
  return s
}

/* ---------- End of a player's week ---------- */

/** Weekend for the current player, then hand the turn to the next one. */
export function endTurn(state: GameState): GameState {
  const s = clone(state)
  const p = current(s)
  const era = s.settings.era
  const mul = diffMul(s)
  const lines: SummaryLine[] = []
  const add = (text: string, amount?: number, tone?: SummaryLine['tone']) => lines.push({ text, amount, tone })
  let event: WeekSummary['event'] = null
  s.log = []

  if (p.earnedThisWeek) add('Lön', p.earnedThisWeek, 'good')

  // Payments from cash first, then the bank; what can't be paid goes to inkasso.
  const charge = (amount: number) => {
    const fromCash = Math.min(p.cash, amount)
    p.cash -= fromCash
    const fromBank = Math.min(p.bank, amount - fromCash)
    p.bank -= fromBank
    return amount - fromCash - fromBank
  }

  // Food
  if (p.foodWeeks > 0) p.foodWeeks -= 1
  else if (!p.ateThisWeek) {
    p.health = clamp(p.health - 15)
    p.sickHoursNextWeek += 6
    add('Du hade ingen mat hemma och svalt. Hälsa −15', undefined, 'bad')
  }

  // Body and relations
  p.health = clamp(p.health - 10)
  if (p.workedThisWeek > 45) {
    p.health = clamp(p.health - 10)
    add('Du jobbade över 45 timmar. Hälsa −10', undefined, 'bad')
  }
  p.overworkStreak = p.workedThisWeek > 50 ? p.overworkStreak + 1 : 0
  if (p.overworkStreak >= 2) {
    p.health = clamp(p.health - 30)
    p.overworkStreak = 0
    event = { title: 'Utbränd', text: 'Två veckor med över 50 timmars jobb. Kroppen säger ifrån. Hälsa −30.' }
  }
  p.relations = clamp(p.relations - 5 - (p.partner && p.funThisWeek === 0 ? 3 : 0))
  p.goodRelationWeeks = p.relations > 70 ? p.goodRelationWeeks + 1 : 0
  if (!p.partner && p.goodRelationWeeks >= 2) {
    p.partner = true
    event = { title: 'Kärlek!', text: 'Du har träffat någon. Trygghet +5, men relationen kräver tid varje vecka.' }
  } else if (p.partner && p.relations < 30 && chance(s, 0.2 * mul)) {
    p.partner = false
    event = { title: 'Uppbrott', text: 'Din partner tyckte att du hann med jobbet men inte med hen. Det tog slut.' }
  }

  // Work
  const job = jobOf(p)
  if (job) {
    if (p.workedThisWeek > 0) p.dependability = clamp(p.dependability + 5)
    else {
      p.dependability = clamp(p.dependability - 15)
      if (chance(s, 0.3 * mul)) {
        add(`Du kom inte till jobbet en enda gång och fick sparken som ${job.name[era].toLowerCase()}.`, undefined, 'bad')
        p.jobId = null
        p.wage = 0
      }
    }
    if (p.workedThisWeek >= 10) p.experience += 1
  }

  // Studies (CSN)
  if (p.enrolled && p.csnDebt > 0 && p.studiedThisWeek >= 20) {
    const csn = price(s, 1200)
    p.cash += csn
    p.csnDebt += csn
    add('Studiemedel från CSN (lån)', csn, 'good')
  }
  if (!p.enrolled && p.csnDebt > 0 && p.earnedThisWeek > 0) {
    const back = Math.min(p.csnDebt, round(p.earnedThisWeek * 0.04))
    p.csnDebt -= back
    p.inkasso += charge(back)
    add('CSN-återbetalning', -back)
  }

  // Clothes wear out
  if (p.clothes > 0) {
    p.clothesWeeksLeft -= 1
    if (p.clothesWeeksLeft <= 0) {
      p.clothes = (p.clothes - 1) as Player['clothes']
      p.clothesWeeksLeft = 8
      add(`Kläderna är utslitna. Nu har du ${CLOTHES_NAME[p.clothes].toLowerCase()}.`, undefined, 'bad')
    }
  }

  // Money that moves every week
  const rates = INTEREST[era]
  if (p.bank > 0) p.bank = round(p.bank * (1 + rates.save / 52))
  if (p.loan > 0) p.loan = round(p.loan * (1 + rates.loan / 52))
  const idx = 0.0015 + (rand(s) - 0.5) * 0.06 - (s.crisisWeeks > 0 ? 0.02 : 0)
  p.indexFund = round(p.indexFund * (1 + idx))
  let tech = 0.003 + (rand(s) - 0.5) * 0.2 - (s.crisisWeeks > 0 ? 0.04 : 0)
  if (p.techStock > 0 && chance(s, 0.02)) {
    tech = -0.5
    add('Aktiekrasch! Dina aktier halverades.', undefined, 'bad')
  }
  p.techStock = round(p.techStock * (1 + tech))
  if (p.insurance) {
    const c = price(s, INSURANCE_WEEKLY)
    p.inkasso += charge(c)
    add('Hemförsäkring', -c)
  }
  p.installments = p.installments.filter((i) => {
    p.inkasso += charge(i.weekly)
    add(`Avbetalning: ${i.item}`, -i.weekly)
    i.weeksLeft -= 1
    return i.weeksLeft > 0
  })

  // Rent every fourth week
  if (s.week % RENT_EVERY === 0 && p.housing !== 'soffa') {
    const mortgageInterest = p.housing === 'bostadsratt' ? round((p.mortgage * rates.mortgage) / 12) : 0
    const due = p.rent + mortgageInterest
    const unpaid = charge(due)
    add(p.housing === 'bostadsratt' ? 'Avgift och bolåneränta' : 'Hyra', -due, 'neutral')
    if (unpaid > 0) {
      p.inkasso += unpaid
      p.missedRents += 1
      add(`Du kunde inte betala ${kr(unpaid)}. Ärendet går till inkasso.`, undefined, 'bad')
      if (p.missedRents >= 2 && p.housing !== 'bostadsratt') {
        p.housing = 'soffa'
        p.rent = 0
        event = { title: 'Vräkt', text: 'Två missade hyror. Du bor nu på en kompis soffa. Relationer och hälsa sjunker varje vecka tills du hittar något nytt.' }
      }
    } else p.missedRents = 0
  }
  if (p.housing === 'soffa') {
    p.relations = clamp(p.relations - 5)
    p.health = clamp(p.health - 5)
  }
  if (p.inQueue) p.queuePoints += 1

  // Långfingrade Leffe at home
  if ((p.housing === 'andrahand' || p.housing === 'soffa') && p.items.length && chance(s, 0.1 * mul)) {
    const stolen = pick(s, p.items)
    const name = itemOf(s, stolen)?.name ?? stolen
    if (p.insurance) add(`Långfingrade Leffe stal din ${name.toLowerCase()}, men försäkringen ersatte den.`, undefined, 'neutral')
    else {
      p.items = p.items.filter((x) => x !== stolen)
      event = event ?? { title: 'Inbrott!', text: `Långfingrade Leffe har varit hemma hos dig och tagit din ${name.toLowerCase()}. Hemförsäkring hade hjälpt.` }
    }
  }

  // Weekend activity: cash in the pocket gets spent
  if (p.cash > 0 && chance(s, 0.7)) {
    const amt = Math.min(p.cash, round(price(s, 200) + rand(s) * price(s, 1300)))
    p.cash -= amt
    add(`Helgen: ${pick(s, WEEKENDS[era])}`, -amt)
  }

  // Random event
  if (!event) event = randomEvent(s, p)

  // Sickness
  if (p.health <= 0) {
    p.health = 40
    p.sickHoursNextWeek = HOURS_PER_WEEK
    p.inkasso += charge(price(s, 1500))
    event = { title: 'Inlagd', text: 'Du kollapsade och lades in. Hela nästa vecka går förlorad, och vården kostar.' }
  } else if (p.health < 40 && chance(s, 0.15 * mul)) {
    p.sickHoursNextWeek += 20
    event = event ?? { title: 'Sjuk', text: 'Feber och snorig näsa. Du förlorar 20 timmar nästa vecka (och en karensdag).' }
  }

  s.summary = {
    playerId: p.id,
    week: s.week,
    lines,
    event,
    quip: p.ai ? pick(s, EGON_QUIPS) : undefined,
  }

  // Reset for next week
  p.hoursLeft = Math.max(0, HOURS_PER_WEEK - p.sickHoursNextWeek)
  p.sickHoursNextWeek = 0
  p.workedThisWeek = 0
  p.studiedThisWeek = 0
  p.ateThisWeek = false
  p.askedRaiseThisWeek = false
  p.funThisWeek = 0
  p.earnedThisWeek = 0
  p.spentThisWeek = 0
  p.location = 'lagenheten'

  // Winner?
  if (progressAll(s, p)) {
    s.winner = p.id
    s.over = true
    return s
  }

  // Next player, or next week
  s.turn += 1
  if (s.turn >= s.players.length) {
    s.turn = 0
    s.week += 1
    worldWeek(s)
    if (s.settings.weekCap && s.week > s.settings.weekCap) {
      const best = [...s.players].sort((a, b) => progress(s, b).total - progress(s, a).total)[0]
      s.winner = best.id
      s.over = true
    }
  }
  return s
}

const progressAll = (s: GameState, p: Player) => {
  const x = progress(s, p)
  return x.money >= 100 && x.education >= 100 && x.career >= 100 && x.relations >= 100 && x.happiness >= 100
}

function randomEvent(s: GameState, p: Player): WeekSummary['event'] {
  const era = s.settings.era
  const mul = diffMul(s)
  const r = rand(s)
  if (r < 0.04) {
    const amt = price(s, 3000)
    p.cash += amt
    return { title: 'Skatteåterbäring', text: `Skatteverket har räknat och du får tillbaka ${kr(amt)}. Brevet luktade lite gott.` }
  }
  if (r < 0.06) {
    const amt = price(s, 10000)
    p.cash += amt
    return { title: 'Bingolotto!', text: `Du vann ${kr(amt)} på Bingolotto. Loket själv ringde och grattade.` }
  }
  if (r < 0.06 + 0.03 * mul && era === 'nutid' && p.bank > price(s, 5000)) {
    const amt = round(p.bank * 0.1)
    p.bank -= amt
    return { title: 'Bedragarsamtal', text: `”Hej, det är från banken.” Det var det inte. ${kr(amt)} försvann från kontot.` }
  }
  if (r < 0.14) {
    p.relations = clamp(p.relations + 5)
    return { title: 'Middagsbjudning', text: 'En vän bjöd på middag och vägrade ta betalt. Relationer +5.' }
  }
  if (r < 0.17 && era === 'nutid') {
    const amt = price(s, 1500)
    const unpaid = Math.max(0, amt - p.cash)
    p.cash = Math.max(0, p.cash - amt)
    p.inkasso += unpaid
    return { title: 'Elpriset rusar', text: `Elräkningen blev ${kr(amt)}. Du funderar på att bo i bastun.` }
  }
  if (r < 0.17 && era === '1994') {
    p.relations = clamp(p.relations + 5)
    return { title: 'VM-brons!', text: 'Sverige tar brons i fotbolls-VM. Hela gatan firar och du kramar en främling. Relationer +5.' }
  }
  if (s.crisisWeeks > 0 && (jobOf(p)?.level ?? 99) <= 5 && chance(s, 0.1 * mul)) {
    p.jobId = null
    p.wage = 0
    return { title: 'Varsel', text: 'Krisen slog till och du blev uppsagd. Jobbtorget väntar.' }
  }
  return null
}

/** Things that happen to the whole town once every player has had their week. */
function worldWeek(s: GameState) {
  s.priceLevel = Math.round(s.priceLevel * (1 + (rand(s) * 0.03 - 0.01)) * 1000) / 1000
  if (s.crisisWeeks > 0) s.crisisWeeks -= 1
  else if (chance(s, 0.03)) {
    s.crisisWeeks = 8
    s.log.push(s.settings.era === '1994' ? 'Kronan faller och räntan rusar. Kris i landet!' : 'Räntechock! Det är kris i ekonomin.')
  }
  s.rentRaiseWeeks -= 1
  if (s.rentRaiseWeeks <= 0) {
    s.rentRaiseWeeks = 13
    for (const p of s.players) {
      if (p.housing === 'andrahand' || p.housing === 'bostadsratt') p.rent = round(p.rent * 1.03)
    }
    s.log.push('Brev från hyresvärden: hyran höjs med 3 % på grund av ”ökade kostnader för fikabröd till styrelsemötena”.')
  }
}
