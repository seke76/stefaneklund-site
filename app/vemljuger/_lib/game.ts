import type { Round, Saved, Settings, SpyChoice } from './types'
import { CATEGORIES, categoryById } from './words'

export const MIN_PLAYERS = 3
export const MAX_PLAYERS = 12
export const STORAGE_KEY = 'vl:v1'

export const DEFAULT_SETTINGS: Settings = {
  players: 4,
  names: [],
  categories: [],
  spies: 1,
  mode: 'classic',
  hint: true,
}

export const freshState = (): Saved => ({
  v: 1,
  settings: DEFAULT_SETTINGS,
  round: null,
  screen: { name: 'setup' },
  results: [],
  used: [],
})

/** Unbiased random integer in [0, n). */
export function rand(n: number): number {
  const buf = new Uint32Array(1)
  const limit = Math.floor(0x1_0000_0000 / n) * n
  do crypto.getRandomValues(buf)
  while (buf[0] >= limit)
  return buf[0] % n
}

export function shuffle<T>(xs: T[]): T[] {
  const a = [...xs]
  for (let i = a.length - 1; i > 0; i--) {
    const j = rand(i + 1)
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Most spies that still make a fair game: 3–5 players 1, 6–8 players 2, 9+ players 3. */
export const maxSpies = (players: number) => (players <= 5 ? 1 : players <= 8 ? 2 : 3)

/** Odds for the "Slumpa" spy count, by player count. One spy is always the most likely. */
function randomSpyCount(players: number): number {
  const weights = players <= 5 ? [1] : players <= 8 ? [65, 35] : [45, 35, 20]
  let r = rand(weights.reduce((a, b) => a + b, 0))
  for (let i = 0; i < weights.length; i++) {
    if (r < weights[i]) return i + 1
    r -= weights[i]
  }
  return 1
}

export const spyCount = (choice: SpyChoice, players: number) =>
  choice === 'random' ? randomSpyCount(players) : Math.min(choice, maxSpies(players))

export const playerName = (names: string[], seat: number) => names[seat]?.trim() || `Spelare ${seat + 1}`

/** Deals a new round and returns it with the updated list of used words. */
export function deal(settings: Settings, used: string[]): { round: Round; used: string[] } {
  const pool = settings.categories.map(categoryById).filter((c) => !!c)
  const category = (pool.length ? pool : CATEGORIES)[rand((pool.length ? pool : CATEGORIES).length)]

  // Prefer words not played yet on this phone; start over in a category once all are used.
  const key = (word: string) => `${category.id}:${word}`
  let fresh = category.words.filter((x) => !used.includes(key(x.word)))
  let nextUsed = used
  if (!fresh.length) {
    fresh = category.words
    nextUsed = used.filter((k) => !k.startsWith(category.id + ':'))
  }
  const word = fresh[rand(fresh.length)]

  const n = settings.players
  const spies = shuffle([...Array(n).keys()]).slice(0, spyCount(settings.spies, n)).sort((a, b) => a - b)

  // Each spy gets a different clue while there are enough.
  const hints: Record<number, string> = {}
  if (settings.mode === 'classic' && settings.hint) {
    const pick = shuffle(word.hints)
    spies.forEach((seat, i) => (hints[seat] = pick[i % pick.length]))
  }

  return {
    round: {
      categoryId: category.id,
      word: word.word,
      decoy: word.decoy,
      spies,
      hints,
      starter: rand(n),
      secretCount: settings.spies === 'random',
      names: [...Array(n).keys()].map((i) => playerName(settings.names, i)),
      mode: settings.mode,
    },
    used: [...nextUsed, key(word.word)],
  }
}

/** Reads saved state. Falls back to a fresh game if storage is blocked or the data is old. */
export function load(): Saved {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return freshState()
    const s = JSON.parse(raw) as Saved
    if (s?.v !== 1) return freshState()
    return { ...freshState(), ...s, settings: { ...DEFAULT_SETTINGS, ...s.settings } }
  } catch {
    return freshState()
  }
}

export function save(s: Saved) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
  } catch {
    // Private mode or full storage: the game still works, it just isn't remembered.
  }
}
