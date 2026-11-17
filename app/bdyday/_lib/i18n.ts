import type { Focus, Lang } from './types'

/* UI copy for BDY Day. Exercise names and cues live in exercises.ts. */
const sv = {
  tagline: 'Din dagliga dos kroppsvikt.',
  today: 'Idag',
  train: 'Träna',
  soon: 'Kommer snart',
  streak: (n: number) => `${n} ${n === 1 ? 'dag' : 'dagar'} i rad`,
  week: (n: number, goal: number) => `${n} av ${goal} pass den här veckan`,
  hero: 'Vad vill du träna idag?',
  hero_sub: 'Svara på fyra snabba frågor så får du ett färdigt pass. Bara kroppsvikt, var som helst.',
  library: 'Övningar',
  library_sub: (n: number) => `${n} övningar med lättare och svårare varianter.`,
  all: 'Alla',
  warmup: 'Uppvärmning',
  focus: { full: 'Helkropp', legs: 'Ben', upper: 'Överkropp', core: 'Core', power: 'Explosivt', runner: 'Löparstyrka' } satisfies Record<Focus, string>,
  level: ['', 'Lätt', 'Medel', 'Svår'],
  reps: 'Reps', hold: 'Håll',
  needs_bar: 'Räck/gren', needs_step: 'Trappa/kant',
  sides_each: 'Per sida', sides_alternate: 'Växla sida',
  tempo_slow: 'Långsamt', tempo_explosive: 'Explosivt',
  easier: 'Lättare', harder: 'Svårare',
  close: 'Stäng',
  back: 'Tillbaka',
  footer: 'Inget konto. All data stannar i din telefon.',
  other_lang: 'In English',
}

export type Strings = typeof sv

const en: Strings = {
  tagline: 'Your daily dose of bodyweight.',
  today: 'Today',
  train: 'Train',
  soon: 'Coming soon',
  streak: (n) => `${n}-day streak`,
  week: (n, goal) => `${n} of ${goal} workouts this week`,
  hero: 'What do you want to train today?',
  hero_sub: 'Answer four quick questions and get a ready-made workout. Just bodyweight, anywhere.',
  library: 'Exercises',
  library_sub: (n) => `${n} exercises with easier and harder versions.`,
  all: 'All',
  warmup: 'Warm-up',
  focus: { full: 'Full body', legs: 'Legs', upper: 'Upper body', core: 'Core', power: 'Explosive', runner: 'Runner strength' },
  level: ['', 'Easy', 'Medium', 'Hard'],
  reps: 'Reps', hold: 'Hold',
  needs_bar: 'Bar/branch', needs_step: 'Step/edge',
  sides_each: 'Each side', sides_alternate: 'Alternate',
  tempo_slow: 'Slow', tempo_explosive: 'Explosive',
  easier: 'Easier', harder: 'Harder',
  close: 'Close',
  back: 'Back',
  footer: 'No account. Your data stays on your phone.',
  other_lang: 'På svenska',
}

export const STR: Record<Lang, Strings> = { sv, en }
