import type { Frame, Joint, Limb, View } from './types'

/*
 * Stick-figure engine for the exercise animations.
 *
 * A pose is a set of absolute segment angles in degrees: 0 points down, 90 points forward
 * (to the right on screen), 180 points up and -90 points back. Forward kinematics turns the
 * angles into joint positions, so limbs always keep their length. In the side view the figure
 * faces right; in the front view "near" limbs are on the right of the screen.
 */

export type Pt = [number, number]
export type Posed = Record<Joint, Pt>

const LEN = { torso: 50, neck: 15, thigh: 38, shin: 38, foot: 11, upper: 28, fore: 26 }
export const HEAD_R = 11
export const STROKE = 9
export const GROUND = 200
export const BAR_Y = 20

const dir = (deg: number): Pt => {
  const r = (deg * Math.PI) / 180
  return [Math.sin(r), Math.cos(r)]
}
const add = (p: Pt, deg: number, len: number): Pt => {
  const [dx, dy] = dir(deg)
  return [p[0] + dx * len, p[1] + dy * len]
}

/** Joint positions for one frame, before it is placed in the scene. */
function pose(f: Frame, view: View): Posed {
  const hip: Pt = [0, 0]
  const neck = add(hip, f.t, LEN.torso)
  const head = add(neck, f.h ?? f.t, LEN.neck)
  // Shoulder and hip width, perpendicular to the torso. Only visible from the front.
  const half = view === 'front' ? 1 : 0.12
  const sOff = (side: 1 | -1, w: number) => add([0, 0], f.t - 90 * side, w * half)
  const ns = sOff(1, 14), fs = sOff(-1, 14), nhOff = sOff(1, 9), fhOff = sOff(-1, 9)
  const shoulder = (o: Pt): Pt => [neck[0] + o[0], neck[1] + o[1]]
  const hipAt = (o: Pt): Pt => [hip[0] + o[0], hip[1] + o[1]]

  const leg = (from: Pt, l: Limb, side: 1 | -1) => {
    const k = add(from, l[0], LEN.thigh)
    const a = add(k, l[1], LEN.shin)
    const footDeg = l[2] ?? (view === 'front' ? l[1] + 90 * side : l[1] + 90)
    const t = add(a, footDeg, view === 'front' ? 5 : LEN.foot)
    return [k, a, t] as const
  }
  const arm = (from: Pt, l: Limb) => {
    const e = add(from, l[0], LEN.upper)
    return [e, add(e, l[1], LEN.fore)] as const
  }

  const nhp = hipAt(nhOff), fhp = hipAt(fhOff)
  const nsp = shoulder(ns), fsp = shoulder(fs)
  const [nk, na, nt] = leg(nhp, f.n, 1)
  const [fk, fa, ft] = leg(fhp, f.f ?? f.n, -1)
  const [ne, nw] = arm(nsp, f.an)
  const [fe, fw] = arm(fsp, f.af ?? f.an)
  return { hip, neck, head, nhp, fhp, nsp, fsp, nk, na, nt, fk, fa, ft, ne, nw, fe, fw }
}

const BODY: Joint[] = ['neck', 'hip', 'nhp', 'fhp', 'nsp', 'fsp', 'nk', 'na', 'nt', 'fk', 'fa', 'ft', 'ne', 'nw', 'fe', 'fw']
const shift = (p: Posed, dx: number, dy: number): Posed =>
  Object.fromEntries(Object.entries(p).map(([k, v]) => [k, [v[0] + dx, v[1] + dy]])) as Posed

/** Lowest point of the drawn figure, counting stroke width and head radius. */
const lowest = (p: Posed) => Math.max(p.head[1] + HEAD_R, ...BODY.map((j) => p[j][1])) + STROKE / 2

export type Scene = {
  frames: Posed[]
  view: View
  viewBox: [number, number, number, number]
  bar: boolean
  /** A box (bench, step) the figure stands or rests on: x, top y, width. */
  box?: [number, number, number]
}

/**
 * Places every frame of an exercise in one scene. The first frame stands on the ground
 * (or hangs from the bar). Later frames either keep a pinned joint where it was in the
 * first frame (hands in a push-up, the back foot in a lunge) or stand on the ground.
 */
export function buildScene(frames: Frame[], view: View, opts: { bar?: boolean; box?: Joint } = {}): Scene {
  const raw = frames.map((f) => pose(f, view))
  const first = raw[0]
  const placed0 = opts.bar
    ? shift(first, -first.nw[0], BAR_Y - first.nw[1])
    : shift(first, 0, GROUND - lowest(first) - (frames[0].lift ?? 0))
  const placed = raw.map((p, i) => {
    if (i === 0) return placed0
    const f = frames[i]
    const pin = f.pin ?? (opts.bar ? 'nw' : undefined)
    if (pin) return shift(p, placed0[pin][0] - p[pin][0], placed0[pin][1] - p[pin][1] - (f.lift ?? 0))
    return shift(p, placed0.hip[0] - p.hip[0], GROUND - lowest(p) - (f.lift ?? 0))
  })

  let box: Scene['box']
  if (opts.box) {
    const j = placed0[opts.box]
    box = [j[0] - 22, j[1] + STROKE / 2, 44]
  }

  // A viewBox that fits every frame, centred on the figure, with the ground at the bottom.
  const xs: number[] = [], ys: number[] = []
  for (const p of placed) {
    for (const j of BODY) xs.push(p[j][0]), ys.push(p[j][1])
    xs.push(p.head[0] - HEAD_R, p.head[0] + HEAD_R)
    ys.push(p.head[1] - HEAD_R)
  }
  if (box) xs.push(box[0], box[0] + box[2])
  if (opts.bar) ys.push(BAR_Y - 8)
  const pad = 18
  const minX = Math.min(...xs) - pad, maxX = Math.max(...xs) + pad
  const minY = Math.min(...ys) - pad, maxY = GROUND + 10
  // Keep a calm, roughly square stage so cards line up in a grid.
  const w = Math.max(maxX - minX, maxY - minY, 150)
  const h = Math.max(maxY - minY, w * 0.8)
  const cx = (minX + maxX) / 2
  return { frames: placed, view, bar: !!opts.bar, box, viewBox: [cx - w / 2, maxY - h, w, h] }
}

/** Linear blend between two placed frames. */
export function mix(a: Posed, b: Posed, t: number): Posed {
  const out = {} as Posed
  for (const k of Object.keys(a) as Joint[]) out[k] = [a[k][0] + (b[k][0] - a[k][0]) * t, a[k][1] + (b[k][1] - a[k][1]) * t]
  return out
}
