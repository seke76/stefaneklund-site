import { COURSES, JOBS, QUEUE_POINTS_NEEDED, RENT_EVERY } from './data'
import { actionsAt, clock, current, endTurn, jobOf, meetsJob, moveTo, perform, travelHours } from './engine'
import { nextRandom } from './rng'
import type { GameState, PlaceId } from './types'

/*
 * Egon, the computer player. He goes down a priority list (survive, home, work, study, have fun)
 * and takes the first thing he can do. One weakness: spare money becomes furniture.
 * 'latt' wanders off to the pub now and then; 'svar' also saves money on the bank.
 */

type Plan = { place: PlaceId; action: string }

export type AiStep = { place: PlaceId; action: string }

function wishes(s: GameState): Plan[] {
  const p = current(s)
  const job = jobOf(p)
  const hour = clock(p.hoursLeft).hour
  const rentSoon = (RENT_EVERY - (s.week % RENT_EVERY)) % RENT_EVERY <= 1
  const money = p.cash + p.bank
  const out: Plan[] = []
  const w = (place: PlaceId, action: string) => out.push({ place, action })

  if (p.foodWeeks === 0) w('kvickkop', 'food')
  if (p.health < 40) w('lagenheten', 'sleep4')
  if (p.housing === 'soffa') {
    if (p.queuePoints >= QUEUE_POINTS_NEEDED) w('bostad', 'hyresratt')
    w('bostad', 'andrahand')
  }
  if (p.inkasso > 0 && money > p.inkasso) w('banken', 'payinkasso')

  // Best job he qualifies for, if better than the current one.
  const better = [...JOBS].reverse().find((j) => j.level > (job?.level ?? 0) && !meetsJob(s, p, j))
  if (better && hour < 16.5) w('jobbtorget', `apply:${better.id}`)
  // Clothes for the next job up.
  const next = JOBS.find((j) => j.level === (job?.level ?? 0) + 1)
  if (next && p.clothes < next.clothes) w('kvickkop', `clothes:${next.clothes}`)
  if (!p.inQueue) w('bostad', 'queue')
  if (p.queuePoints >= QUEUE_POINTS_NEEDED && p.housing === 'andrahand') w('bostad', 'hyresratt')

  if (job && (p.workedThisWeek < 24 || (rentSoon && money < p.rent * 1.5))) w(job.place, p.hoursLeft >= 8 ? 'work8' : 'work4')
  if (p.relations < 45) w(hour >= 16 ? 'puben' : 'lagenheten', hour >= 16 ? 'quiz' : 'call')
  if (p.enrolled && p.studiedThisWeek < 12) w('hogskolan', p.hoursLeft >= 8 ? 'study8' : 'study4')
  if (!p.enrolled && job) {
    const c = COURSES.find((x) => !p.degrees.includes(x.id) && x.requires.every((r) => p.degrees.includes(r)))
    if (c) w('hogskolan', `csn:${c.id}`)
  }
  if (p.health < 70) w('gymmet', 'train')
  // The weakness.
  if (p.cash > 2500) {
    const item = ['lampa', 'tavla', 'soffa', 'sang'].find((id) => !p.items.includes(id))
    if (item) w('mobel', `buy:${item}`)
  }
  const relGoal = s.settings.goals.relations + 5
  if (p.relations < relGoal) w(hour >= 16 ? 'puben' : 'lagenheten', hour >= 16 ? 'afterwork' : 'call')
  if (p.ai === 'svar' && p.cash > 4000) w('banken', 'deposit')
  if (job) w(job.place, 'work4')
  w('lagenheten', 'rest2')
  return out
}

/** Plays Egon's whole week. Returns the state after his weekend and what he did. */
export function playAiTurn(start: GameState): { state: GameState; steps: AiStep[] } {
  let s = start
  const steps: AiStep[] = []
  const failed = new Set<string>()
  for (let guard = 0; guard < 60; guard++) {
    const p = current(s)
    if (p.hoursLeft < 0.5) break
    let options = wishes(s).filter((x) => !failed.has(x.action))
    if (p.ai === 'latt') {
      const [r, next] = nextRandom(s.rng)
      s = { ...s, rng: next }
      if (r < 0.3) options = [{ place: 'puben', action: 'quiz' }, ...options]
    }
    let done = false
    for (const o of options) {
      if (travelHours(s, current(s), o.place) > current(s).hoursLeft) continue
      const there = moveTo(s, o.place)
      const a = actionsAt(there).find((x) => x.id === o.action)
      if (!a || a.disabled) {
        // Short of cash but money on the bank: fetch it first.
        if (a?.disabled === 'Du har inte råd' && current(s).bank >= a.cost) {
          s = moveTo(s, 'banken')
          const wd = current(s).bank >= a.cost + 5000 ? 'withdrawbig' : 'withdraw'
          s = perform(s, wd)
          steps.push({ place: 'banken', action: 'Tog ut pengar' })
          done = true
          break
        }
        failed.add(o.action)
        continue
      }
      s = perform(there, a.id)
      steps.push({ place: o.place, action: a.label })
      done = true
      break
    }
    if (!done) break
  }
  return { state: endTurn(s), steps }
}
