import type { GameState } from './types'

/** The game is saved in the browser after every move. Only one saved game at a time. */
const KEY = 'ekorrhjulet-save-v1'
const PREFS = 'ekorrhjulet-prefs-v1'

export function loadGame(): GameState | null {
  try {
    const raw = localStorage.getItem(KEY)
    const s = raw ? (JSON.parse(raw) as GameState) : null
    return s && s.version === 1 && !s.over ? s : null
  } catch {
    return null
  }
}

export function saveGame(s: GameState) {
  try {
    if (s.over) localStorage.removeItem(KEY)
    else localStorage.setItem(KEY, JSON.stringify(s))
  } catch {
    /* private mode or full storage: the game still works, it just isn't saved */
  }
}

export function clearGame() {
  try {
    localStorage.removeItem(KEY)
  } catch {}
}

export type Prefs = { music: boolean; sfx: boolean }

export function loadPrefs(): Prefs {
  try {
    return { music: true, sfx: true, ...JSON.parse(localStorage.getItem(PREFS) ?? '{}') }
  } catch {
    return { music: true, sfx: true }
  }
}

export function savePrefs(p: Prefs) {
  try {
    localStorage.setItem(PREFS, JSON.stringify(p))
  } catch {}
}

/** "Bästa liv" on the title screen: the fastest human wins in this browser. */
const BEST = 'ekorrhjulet-best-v1'
export type Best = { name: string; weeks: number; era: string }

export function loadBest(): Best[] {
  try {
    return (JSON.parse(localStorage.getItem(BEST) ?? '[]') as Best[]).slice(0, 5)
  } catch {
    return []
  }
}

export function addBest(b: Best) {
  try {
    const list = [...loadBest(), b].sort((x, y) => x.weeks - y.weeks).slice(0, 5)
    localStorage.setItem(BEST, JSON.stringify(list))
  } catch {}
}
