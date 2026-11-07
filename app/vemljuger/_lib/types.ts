/** One secret word in a category. */
export type Word = {
  /** The secret word everyone except the spy gets. */
  word: string
  /** A similar word, given to the spy in the "Fel ord" mode. */
  decoy: string
  /** Clues a regular player could say out loud. The spy gets one of them in the classic mode. */
  hints: string[]
}

export type Category = {
  /** Stable id, stored in settings and used-word lists. Never rename. */
  id: string
  name: string
  words: Word[]
}

/** classic: the spy knows they are the spy and gets the category (+ a clue).
 *  decoy ("Fel ord"): the spy gets a similar word and doesn't know they are the spy. */
export type Mode = 'classic' | 'decoy'

/** A fixed number of spies, or 'random' (weighted by the number of players, see spyCount()). */
export type SpyChoice = 1 | 2 | 3 | 'random'

export type Settings = {
  /** 3–12. */
  players: number
  /** Optional names, by seat. Empty means "Spelare N". May be longer than `players`. */
  names: string[]
  /** Category ids to draw from. Empty means "Slumpa": all categories. */
  categories: string[]
  spies: SpyChoice
  mode: Mode
  /** Classic mode only: whether the spy gets a clue. */
  hint: boolean
}

/** One dealt round. Everything the phone needs to show each player their role. */
export type Round = {
  categoryId: string
  word: string
  decoy: string
  /** Seats (0-based) of the spies. */
  spies: number[]
  /** Clue per seat, only for spies in the classic mode with clues on. */
  hints: Record<number, string>
  /** Seat that gives the first clue. */
  starter: number
  /** True when the spy count was drawn at random, so the number is kept secret. */
  secretCount: boolean
  /** Player names at the time of dealing (already resolved to "Spelare N" where empty). */
  names: string[]
  mode: Mode
}

/** A finished round on the scoreboard. */
export type Result = {
  word: string
  categoryName: string
  spyNames: string[]
  winner: 'group' | 'spy'
}

export type Screen =
  | { name: 'setup' }
  /** Passing the phone round: `seat` is whose turn it is to look. */
  | { name: 'pass'; seat: number }
  | { name: 'play' }
  | { name: 'reveal' }
  | { name: 'score' }
  /** "Så spelar ni": how to install and play. */
  | { name: 'help' }

/** Everything kept in the browser (localStorage key in game.ts). */
export type Saved = {
  v: 1
  settings: Settings
  round: Round | null
  screen: Screen
  results: Result[]
  /** Words already played on this phone, as "categoryId:word", so they don't repeat. */
  used: string[]
}
