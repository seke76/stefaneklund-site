/* Data types for BDY Day. See README.md for how they fit together. */

export type Lang = 'sv' | 'en'

/** Text in both languages. */
export type Text = { sv: string; en: string }

/** What a workout can focus on. "full" is a mix of everything and is not set on exercises. */
export type Focus = 'full' | 'legs' | 'upper' | 'core' | 'power' | 'runner'

/** How an exercise is measured: repetitions or seconds held. */
export type Metric = 'reps' | 'hold'

/**
 * How sides are handled.
 * - both: symmetric, nothing to think about
 * - alternate: switch side every rep (lunges, mountain climbers)
 * - each: one side at a time; a workout gets one block per side (side plank, single-leg squat)
 */
export type Sides = 'both' | 'alternate' | 'each'

/** Something besides the floor. Everything else is plain bodyweight. */
export type Needs = 'bar' | 'step'

/** main: part of the workout. warmup: only offered in the optional warm-up block. */
export type Role = 'main' | 'warmup'

/** Camera angle of the figure. */
export type View = 'side' | 'front'

/* ---------- Figure poses (see _lib/figure.ts) ---------- */

/** Joints of the stick figure: n = near/right side, f = far/left side. */
export type Joint =
  | 'hip' | 'neck' | 'head'
  | 'nhp' | 'fhp' // hip joints
  | 'nsp' | 'fsp' // shoulders
  | 'nk' | 'na' | 'nt' // knee, ankle, toe
  | 'fk' | 'fa' | 'ft'
  | 'ne' | 'nw' // elbow, wrist
  | 'fe' | 'fw'

/** Absolute angles of a limb in degrees: [upper, lower, foot?]. 0 = down, 90 = forward, 180 = up. */
export type Limb = [number, number, number?]

/** One key pose of an animation. */
export type Frame = {
  t: number // torso, hip to neck
  h?: number // neck to head, defaults to the torso angle
  n: Limb // near leg
  f?: Limb // far leg, defaults to the near leg
  an: Limb // near arm
  af?: Limb // far arm, defaults to the near arm
  lift?: number // pixels above the ground (jumps, raised heels)
  pin?: Joint // keep this joint where it was in the first frame
}

/* ---------- Exercise library (see _lib/exercises.ts) ---------- */

export type Exercise = {
  id: string
  /** Exercises in the same family are easier/harder versions of one movement. */
  family: string
  /** 1 = easier, 2 = standard, 3 = harder. Progression moves within a family. */
  level: 1 | 2 | 3
  role: Role
  name: Text
  /** One or two short coaching cues, shown during the workout. */
  cue: Text
  focus: Exclude<Focus, 'full'>[]
  metric: Metric
  sides: Sides
  needs?: Needs
  /** Perform slowly (runner strength) or explosively (jumps). Shown as a hint. */
  tempo?: 'slow' | 'explosive'
  view: View
  /** Key poses, played in a loop. One frame = a still image (holds). */
  frames: Frame[]
  /** Joint resting on a box (bench, step) in the first frame. */
  box?: Joint
  /** Where the exercise comes from, for the README and future credits. */
  source?: 'outside' | 'runnersworld' | 'bdy'
}
