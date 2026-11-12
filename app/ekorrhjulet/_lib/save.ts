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

/** Saves to this browser. Returns false if the browser refused (private mode, storage full or blocked). */
export function saveGame(s: GameState): boolean {
  try {
    if (s.over) localStorage.removeItem(KEY)
    else localStorage.setItem(KEY, JSON.stringify(s))
    return true
  } catch {
    return false // the game still works, it just isn't saved
  }
}

/** Downloads the game as a file, to keep it or move it to another browser or computer. */
export function downloadSave(s: GameState) {
  const blob = new Blob([JSON.stringify(s)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `ekorrhjulet-vecka-${s.week}.json`
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/** Reads a save file. Returns the game, or an error message in Swedish. */
export function parseSave(text: string): GameState | string {
  try {
    const s = JSON.parse(text) as GameState
    const ok =
      s && s.version === 1 && typeof s.week === 'number' && Array.isArray(s.players) && s.players.length > 0 && !!s.settings && typeof s.turn === 'number'
    if (!ok) return 'Det där ser inte ut som en sparfil från Ekorrhjulet.'
    if (s.over) return 'Det spelet är redan slut.'
    return s
  } catch {
    return 'Filen gick inte att läsa.'
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
