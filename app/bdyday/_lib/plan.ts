import { byId, EXERCISES } from './exercises'
import type { Answers, Energy, Exercise, Focus, Mode, Place, Plan, SetSettings, Side, Step, TimerSettings } from './types'

/*
 * Turns the answers into a workout. The generator ranks exercises (one per family, mixed across
 * body parts); timer mode and set mode then each take as many from the top as fit in the time.
 */

export const MINUTES = [5, 10, 15, 20] as const
export const FOCUSES: Focus[] = ['full', 'legs', 'upper', 'core', 'power', 'runner']
export const ENERGIES: Energy[] = ['low', 'normal', 'high']
export const PLACES: Place[] = ['floor', 'bar', 'step', 'both']
export const TIMER_PRESETS: TimerSettings[] = [
  { work: 30, rest: 30 },
  { work: 40, rest: 20 },
  { work: 45, rest: 15 },
]
export const SET_COUNTS = [2, 3, 4, 5]
export const SET_RESTS = [30, 45, 60, 90]
const WARMUP_WORK = 30
const WARMUP_REST = 10
const READY = 5
const SWITCH = 5
/** Time to move on to the next exercise in set mode, seconds. */
const NEXT_EX = 25

/** Suggested settings for both modes. Runner strength defaults to sets × reps, the rest to the timer. */
export function defaults(a: Answers): { mode: Mode; timer: TimerSettings; sets: SetSettings } {
  return {
    mode: a.focus === 'runner' ? 'sets' : 'timer',
    timer: { work: 40, rest: 20 },
    sets: { sets: a.energy === 'low' ? 2 : 3, rest: a.energy === 'low' ? 60 : a.energy === 'high' ? 30 : 45 },
  }
}

/** Reps per set in set mode (seconds for holds; per side for one-sided exercises). Default 10 / 30 s. */
const DOSE: Record<string, number> = {
  'triangle-pushup': 8, 'pike-pushup': 8, hang: 20, 'negative-pullup': 4, pullup: 5,
  'jump-squat': 4, 'single-leg-squat': 6, 'split-jump': 6, 'speed-skater': 16,
  'dead-bug': 12, 'bicycle-crunch': 20, 'hollow-hold': 20, plank: 40, 'mountain-climber': 20,
  'side-plank-rotation': 8, 'side-leg-raise': 12, 'calf-raise': 15, 'single-leg-calf-raise': 12,
  'step-calf-raise': 12, 'fast-calf-raise': 40, 'single-leg-hop': 10, burpee: 8,
}
export const doseOf = (ex: Exercise) => DOSE[ex.id] ?? (ex.metric === 'hold' ? 30 : 10)

const LEVEL: Record<Energy, number> = { low: 1, normal: 2, high: 3 }
const CATEGORY_ORDER = ['legs', 'upper', 'core', 'power', 'runner']

/** Small seeded random generator, so "new suggestion" can reshuffle. */
function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const allowed = (ex: Exercise, place: Place) => !ex.needs || place === 'both' || ex.needs === place
const category = (ex: Exercise) => ex.focus[0]

/** Mixes exercises so the same body part doesn't come twice in a row (legs, upper, core, power …). */
function interleave(list: Exercise[], rand: () => number) {
  const groups = CATEGORY_ORDER.map((c) => list.filter((e) => category(e) === c).sort(() => rand() - 0.5))
  const out: Exercise[] = []
  while (groups.some((g) => g.length)) for (const g of groups) if (g.length) out.push(g.shift()!)
  return out
}

/** One exercise per family (closest to today's level) first, then the other versions. */
function byFamily(list: Exercise[], target: number, rand: () => number, jumpy: boolean) {
  const fams = new Map<string, Exercise[]>()
  for (const e of list) fams.set(e.family, [...(fams.get(e.family) ?? []), e])
  const first: Exercise[] = [], rest: Exercise[] = []
  for (const f of fams.values()) {
    // Jumping versions count as a step harder unless jumping is the point.
    const k = (e: Exercise) => Math.abs(e.level - target) + (e.tempo === 'explosive' && !jumpy ? 1 : 0) + rand() * 0.5
    const sorted = f.map((e) => ({ e, k: k(e) })).sort((x, y) => x.k - y.k).map((x) => x.e)
    first.push(sorted[0])
    rest.push(...sorted.slice(1))
  }
  return { first, rest }
}

/** Ranked exercise ids for the answers. The same seed gives the same list. */
export function buildPool(a: Answers, seed: number): string[] {
  const rand = rng(seed)
  let cands = EXERCISES.filter((e) => e.role === 'main' && allowed(e, a.place))
  // A tired body gets no jumping, unless jumping is the point.
  if (a.energy === 'low' && a.focus !== 'power') cands = cands.filter((e) => e.tempo !== 'explosive')
  const main = a.focus === 'full' ? cands : cands.filter((e) => e.focus.includes(a.focus as Exclude<Focus, 'full'>))
  // Upper body alone has few families; core work fills the gaps.
  const fill = a.focus === 'upper' ? cands.filter((e) => category(e) === 'core' && !main.includes(e)) : []
  const jumpy = a.focus === 'power'
  const m = byFamily(main, LEVEL[a.energy], rand, jumpy)
  const f = byFamily(fill, LEVEL[a.energy], rand, jumpy)
  const ranked = [...merge(interleave(m.first, rand), interleave(f.first, rand)), ...interleave(m.rest, rand), ...interleave(f.rest, rand)]
  return (jumpy ? ranked : capJumps(ranked, a.energy === 'high' ? 3 : 4)).map((e) => e.id)
}

/** Two from the main list, then one filler, and so on. */
function merge(main: Exercise[], fill: Exercise[]) {
  const out: Exercise[] = []
  while (main.length || fill.length) {
    out.push(...main.splice(0, 2))
    if (fill.length) out.push(fill.shift()!)
  }
  return out
}

/** At most one jumping exercise per `every` exercises; the rest move further down. */
function capJumps(list: Exercise[], every: number) {
  const out: Exercise[] = [], later: Exercise[] = []
  for (const e of list) {
    const jumps = out.filter((x) => x.tempo === 'explosive').length
    if (e.tempo === 'explosive' && jumps >= Math.ceil((out.length + 1) / every)) later.push(e)
    else out.push(e)
  }
  return [...out, ...later]
}

const ex = (id: string) => byId(id)!
const blocksOf = (e: Exercise) => (e.sides === 'each' ? 2 : 1)

/** Timer mode: as many exercises as fit; repeated in rounds when the list is short. */
export function fitTimer(pool: string[], minutes: number, t: TimerSettings) {
  const max = Math.max(1, Math.floor((minutes * 60) / (t.work + t.rest)))
  const ids: string[] = []
  let used = 0
  for (const id of pool) {
    const c = blocksOf(ex(id))
    if (used + c > max) continue
    ids.push(id)
    used += c
    if (used === max) break
  }
  const rounds = Math.max(1, Math.floor(max / Math.max(used, 1)))
  return { ids, rounds, seconds: rounds * used * (t.work + t.rest) - t.rest }
}

const secsPerRep = (e: Exercise) => (e.tempo === 'slow' ? 3 : e.tempo === 'explosive' ? 1.2 : 2)
/** Rough duration of one set, seconds. */
function setSeconds(e: Exercise) {
  const one = e.metric === 'hold' ? doseOf(e) : doseOf(e) * secsPerRep(e)
  return e.sides === 'each' ? one * 2 + (e.metric === 'hold' ? SWITCH : 0) : one
}

/** Set mode: as many exercises as fit in the time (at least three). */
export function fitSets(pool: string[], minutes: number, s: SetSettings) {
  const ids: string[] = []
  let seconds = 0
  for (const id of pool) {
    const e = ex(id)
    const t = s.sets * setSeconds(e) + (s.sets - 1) * s.rest + (ids.length ? Math.max(s.rest, NEXT_EX) : 0)
    if (ids.length >= 3 && seconds + t > minutes * 60) break
    ids.push(id)
    seconds += t
  }
  return { ids, seconds }
}

/** The exercises shown for the plan's current mode. */
export const visible = (p: Plan) => (p.mode === 'timer' ? fitTimer(p.pool, p.answers.minutes, p.timer).ids : fitSets(p.pool, p.answers.minutes, p.sets).ids)

/** Swaps one exercise for an unused one, preferring the same body part and a new family. */
export function swapIn(p: Plan, id: string): Plan {
  const shown = visible(p)
  const i = p.pool.indexOf(id)
  const fams = new Set(shown.map((s) => ex(s).family))
  const spare = p.pool.slice(shown.length).filter((s) => !shown.includes(s))
  const score = (s: string) => (category(ex(s)) === category(ex(id)) ? 0 : 2) + (fams.has(ex(s).family) ? 1 : 0)
  const pick = spare.sort((x, y) => score(x) - score(y))[0]
  if (!pick || i < 0) return p
  const pool = [...p.pool]
  const j = pool.indexOf(pick)
  ;[pool[i], pool[j]] = [pool[j], pool[i]]
  return { ...p, pool }
}

export const canSwap = (p: Plan) => p.pool.length > visible(p).length

export function warmupIds(focus: Focus) {
  if (focus === 'upper') return ['jumping-jacks', 'arm-circles', 'high-knees', 'lunge-rotation']
  if (focus === 'legs' || focus === 'runner') return ['high-knees', 'leg-swings', 'lunge-rotation', 'jumping-jacks']
  return ['jumping-jacks', 'high-knees', 'arm-circles', 'lunge-rotation']
}

export const warmupSeconds = (focus: Focus) =>
  warmupIds(focus).reduce((s, id) => s + blocksOf(ex(id)) * (WARMUP_WORK + WARMUP_REST), 0)

/** Total seconds for the plan in its current mode, warm-up included. */
export function totalSeconds(p: Plan) {
  const main = p.mode === 'timer' ? fitTimer(p.pool, p.answers.minutes, p.timer).seconds : fitSets(p.pool, p.answers.minutes, p.sets).seconds
  return main + (p.warmup ? warmupSeconds(p.answers.focus) : 0)
}

/** Work steps for one exercise, one per side when the exercise is one-sided. */
const sides = (e: Exercise): (Side | undefined)[] => (e.sides === 'each' ? ['L', 'R'] : [undefined])

/** The full list of steps for the player. */
export function buildSteps(p: Plan): Step[] {
  const work: Step[] = []
  if (p.warmup)
    for (const id of warmupIds(p.answers.focus))
      for (const side of sides(ex(id))) work.push({ kind: 'work', ex: id, side, secs: WARMUP_WORK, warmup: true })

  if (p.mode === 'timer') {
    const { ids, rounds } = fitTimer(p.pool, p.answers.minutes, p.timer)
    for (let r = 0; r < rounds; r++)
      for (const id of ids) for (const side of sides(ex(id))) work.push({ kind: 'work', ex: id, side, secs: p.timer.work })
  } else {
    for (const id of fitSets(p.pool, p.answers.minutes, p.sets).ids) {
      const e = ex(id)
      for (let set = 1; set <= p.sets.sets; set++) {
        const base = { kind: 'work' as const, ex: id, set, sets: p.sets.sets, target: doseOf(e) }
        // Holds are timed; one-sided holds get one step per side. Reps are counted by the user.
        if (e.metric === 'hold') for (const side of sides(e)) work.push({ ...base, side, secs: doseOf(e) })
        else work.push(base)
      }
    }
  }

  // Rests go between work steps; their length depends on what comes next.
  const steps: Step[] = []
  const first = work[0] as Extract<Step, { kind: 'work' }>
  steps.push({ kind: 'ready', secs: READY, next: first.ex, nextSide: first.side })
  work.forEach((w, i) => {
    steps.push(w)
    const nx = work[i + 1] as Extract<Step, { kind: 'work' }> | undefined
    const cur = w as Extract<Step, { kind: 'work' }>
    if (!nx) return
    const switchSide = nx.ex === cur.ex && nx.side !== cur.side && nx.set === cur.set
    const secs = cur.warmup
      ? WARMUP_REST
      : switchSide && p.mode === 'sets'
        ? SWITCH
        : p.mode === 'timer'
          ? p.timer.rest
          : nx.ex === cur.ex
            ? p.sets.rest
            : Math.max(p.sets.rest, NEXT_EX)
    steps.push({ kind: 'rest', secs, next: nx.ex, nextSide: nx.side, switchSide })
  })
  return steps
}
