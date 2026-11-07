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
