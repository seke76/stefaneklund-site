// Ekorrhjulet: shared types. See ../README.md for how the game works.

export type Era = '1994' | 'nutid'
export type BoardId = 'smastaden' | 'pixelstaden'
export type Difficulty = 'snall' | 'normal' | 'elak'
export type GoalPreset = 'kort' | 'mellan' | 'lang'
export type CityMode = 'enkel' | 'full' | 'anpassad'

/** The ten places of the basic city, in ring order (clockwise from top left). */
export type PlaceId =
  | 'lagenheten'
  | 'jobbtorget'
  | 'hogskolan'
  | 'banken'
  | 'kvickkop'
  | 'mobel'
  | 'pryl'
  | 'bostad'
  | 'puben'
  | 'gymmet'

export type Housing = 'andrahand' | 'hyresratt' | 'bostadsratt' | 'soffa'

/** 0 = none/rags, 1 = everyday, 2 = smart, 3 = suit. */
export type ClothesLevel = 0 | 1 | 2 | 3

export type Goals = {
  money: number // net worth in kr
  education: number // number of degrees
  career: number // career level 1–9
  relations: number // 0–100
  happiness: number // 0–100
}

export type Settings = {
  board: BoardId
  era: Era
  difficulty: Difficulty
  goals: Goals
  goalPreset: GoalPreset | 'egen'
  weekCap: number | null // game ends after this many weeks; highest score wins
  startCash: number
  city: CityMode // only 'enkel' is playable for now
  seed: number
}

export type PlayerSetup = { name: string; color: string; ai: null | 'latt' | 'svar' }

export type Installment = { item: string; weekly: number; weeksLeft: number }

export type Player = {
  id: number
  name: string
  color: string
  ai: null | 'latt' | 'svar'
  location: PlaceId
  hoursLeft: number
  // Money (kr). Funds are stored as current value.
  cash: number
  bank: number
  indexFund: number
  techStock: number
  loan: number // private loan at the bank
  csnDebt: number
  inkasso: number // unpaid rent etc.; 50 % of wages go here until paid
  installments: Installment[]
  // Meters 0–100 (Trygghet, Status, Utveckling and Lycka are derived; see engine.ts)
  health: number
  relations: number
  partner: boolean
  goodRelationWeeks: number // consecutive weeks with relations > 70
  // Education
  degrees: string[]
  enrolled: string | null // course id
  studyHours: Record<string, number>
  studiedThisWeek: number
  // Work
  jobId: string | null
  wage: number // kr/h, may differ from the job's base after raises
  experience: number // weeks with ≥ 10 h worked
  dependability: number // 0–100
  workedThisWeek: number
  overworkStreak: number
  askedRaiseThisWeek: boolean
  // Life
  clothes: ClothesLevel
  clothesWeeksLeft: number
  housing: Housing
  rent: number // kr per month for current housing
  inQueue: boolean
  queuePoints: number
  missedRents: number
  mortgage: number
  items: string[] // item ids
  insurance: boolean
  foodWeeks: number // weeks of groceries at home
  ateThisWeek: boolean // ate a cooked meal or fast food this week
  gymCard: boolean
  sickHoursNextWeek: number
  funThisWeek: number // pub/date etc. used by weekend events
  // Bookkeeping for the weekly summary
  earnedThisWeek: number
  spentThisWeek: number
}

export type SummaryLine = { text: string; amount?: number; tone?: 'good' | 'bad' | 'neutral' }

export type WeekSummary = {
  playerId: number
  week: number
  lines: SummaryLine[]
  event: { title: string; text: string } | null
  quip?: string // Egon's comment
}

export type GameState = {
  version: 1
  settings: Settings
  week: number
  turn: number // index into players
  players: Player[]
  rng: number // RNG state (see rng.ts)
  priceLevel: number // 1 = start prices; drifts each week
  crisisWeeks: number // > 0 while an economic crisis lasts
  rentRaiseWeeks: number // countdown to the next landlord letter
  summary: WeekSummary | null // shown between turns
  winner: number | null
  over: boolean
  log: string[] // short messages for the current turn (toasts)
}

/** Something a player can do at a place. Built fresh from state by engine.actionsAt(). */
export type Action = {
  id: string
  label: string
  hours: number
  cost: number // kr, positive = pay, negative = earn
  note?: string // effects shown under the button
  disabled?: string // why it can't be done right now
  short?: string // button text when shown as one of two choices on a card (Betala / CSN-lån, Köp / Avbetala)
  group?: string
}
