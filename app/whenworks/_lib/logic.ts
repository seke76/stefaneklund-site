import type { Answer, EventDoc, Lang, Slot } from './types'
import type { Strings } from './i18n'

/* ---------- Dates ---------- */

const loc = (l: Lang) => (l === 'sv' ? 'sv-SE' : 'en-GB')
// Noon avoids the date shifting across time zones.
const d = (iso: string) => new Date(iso + 'T12:00:00')

export const fmt = {
  loc,
  d,
  day: (iso: string, l: Lang) => d(iso).toLocaleDateString(loc(l), { weekday: 'short' }).replace('.', ''),
  num: (iso: string) => d(iso).getDate(),
  mon: (iso: string, l: Lang) => d(iso).toLocaleDateString(loc(l), { month: 'short' }).replace('.', ''),
  long: (iso: string, l: Lang) =>
    d(iso).toLocaleDateString(loc(l), { weekday: 'long', day: 'numeric', month: 'long' }),
  slot: (s: Pick<Slot, 'date' | 'time'>, l: Lang) =>
    fmt.long(s.date, l) + (s.time ? (l === 'sv' ? ' kl. ' : ' at ') + s.time : ''),
  iso: (dt: Date) =>
    `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`,
  addDays: (iso: string, n: number) => {
    const x = d(iso)
    x.setDate(x.getDate() + n)
    return fmt.iso(x)
  },
  range: (a: string, b: string) => {
    const out: string[] = []
    for (let c = a; c <= b; c = fmt.addDays(c, 1)) out.push(c)
    return out
  },
}

export const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
export const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/

/* ---------- Slots and scoring ---------- */

export const slotKey = (s: Pick<Slot, 'date' | 'time'>) => s.date + '_' + (s.time ?? 'day')
const sortKey = (s: Slot) => s.date + (s.time ?? '')

/** Every visible slot: range days (open mode), organizer slots and guest suggestions, minus removed. */
export function visibleSlots(ev: EventDoc, suggestions: Slot[]): Slot[] {
  const base: Slot[] =
    ev.mode === 'open' && ev.range
      ? fmt.range(ev.range.start, ev.range.end || ev.range.start).map((date) => ({ id: date, date, time: null, round: 1 }))
      : []
  return [...base, ...ev.slots, ...suggestions]
    .filter((s) => !ev.removed.includes(s.id))
    .sort((a, b) => sortKey(a).localeCompare(sortKey(b)))
}

export const isNew = (s: Slot, round: number) => round > 1 && s.round === round

type WithAnswers = { name: string; answers: Record<string, Answer> }
export type Tally = { yes: string[]; maybe: string[]; no: string[]; none: string[]; score: number }

export function tally(slot: Slot, responses: WithAnswers[]): Tally {
  const r: Tally = { yes: [], maybe: [], no: [], none: [], score: 0 }
  responses.forEach((p) => r[p.answers[slot.id] || 'none'].push(p.name))
  r.score = r.yes.length * 2 + r.maybe.length
  return r
}

export const missingOf = (r: Tally): [string, Answer | 'none'][] => [
  ...r.maybe.map((n) => [n, 'maybe'] as [string, Answer]),
  ...r.no.map((n) => [n, 'no'] as [string, Answer]),
  ...r.none.map((n) => [n, 'none'] as [string, 'none']),
]

export type Best = {
  ranked: { s: Slot; r: Tally }[]
  full: { s: Slot; r: Tally } | undefined
  closest: { s: Slot; r: Tally }[]
  best: Slot | undefined
  tag: 'all' | 'closest' | 'best'
  n: number
}

/** Ranks slots by score (yes = 2, maybe = 1). Sort is stable, so ties go to the earlier slot. */
export function findBest(slots: Slot[], responses: WithAnswers[], mustAll: boolean): Best {
  const ranked = slots.map((s) => ({ s, r: tally(s, responses) })).sort((a, b) => b.r.score - a.r.score)
  const n = responses.length
  const full = ranked.find((x) => n > 0 && x.r.yes.length === n)
  const maxYes = ranked.length ? Math.max(...ranked.map((x) => x.r.yes.length)) : 0
  const closest = ranked.filter((x) => maxYes > 0 && x.r.yes.length === maxYes).slice(0, 3)
  return {
    ranked,
    full,
    closest,
    best: full ? full.s : ranked[0]?.s,
    tag: full ? 'all' : mustAll ? 'closest' : 'best',
    n,
  }
}

export const durLabel = (dur: string, unit: 'h' | 'd', S: Strings) =>
  dur + ' ' + (unit === 'h' ? S.hours : S.days).toLowerCase()
