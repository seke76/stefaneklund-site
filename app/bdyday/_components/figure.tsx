'use client'

import { useEffect, useMemo, useState } from 'react'
import { buildScene, mix, GROUND, HEAD_R, STROKE, BAR_Y, type Posed, type Pt } from '../_lib/figure'
import type { Exercise } from '../_lib/types'

const ease = (x: number) => (x < 0.5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2)

/** How long each move between key poses takes, and how long a pose is held, in ms. */
function timing(ex: Exercise) {
  if (ex.tempo === 'explosive') return { move: 420, hold: 120 }
  if (ex.tempo === 'slow') return { move: 1100, hold: 350 }
  return { move: 750, hold: 260 }
}

/** Animated stick figure for an exercise. Holds and reduced motion show a still pose. */
export default function Figure({ ex, playing = true, className }: { ex: Exercise; playing?: boolean; className?: string }) {
  const scene = useMemo(() => buildScene(ex.frames, ex.view, { bar: ex.needs === 'bar', box: ex.box }), [ex])
  const n = scene.frames.length
  const [pos, setPos] = useState(0) // 0..n, fractional while moving

  useEffect(() => {
    if (!playing || n < 2) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const { move, hold } = timing(ex)
    const step = move + hold
    let raf = 0
    const start = performance.now()
    const tick = (now: number) => {
      const el = (now - start) % (step * n)
      const i = Math.floor(el / step)
      const into = el - i * step
      // Reduced motion: jump between poses instead of moving.
      const f = reduce ? (into < step / 2 ? 0 : 1) : into < hold ? 0 : ease((into - hold) / move)
      setPos(i + f)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [playing, n, ex])

  const i = Math.floor(pos) % n
  const p: Posed = n < 2 ? scene.frames[0] : mix(scene.frames[i], scene.frames[(i + 1) % n], pos - Math.floor(pos))
  const [vx, vy, vw, vh] = scene.viewBox
  const line = (...pts: Pt[]) => 'M' + pts.map((q) => `${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join('L')
  const front = scene.view === 'front'

  return (
    <svg className={className} viewBox={`${vx} ${vy} ${vw} ${vh}`} role="img" aria-label={ex.name.en}>
      <line className="fig-ground" x1={vx} x2={vx + vw} y1={GROUND} y2={GROUND} />
      {scene.bar && <line className="fig-bar" x1={vx + 8} x2={vx + vw - 8} y1={BAR_Y} y2={BAR_Y} />}
      {scene.box && <rect className="fig-box" x={scene.box[0]} y={scene.box[1]} width={scene.box[2]} height={GROUND - scene.box[1]} rx={4} />}
      <g className="fig" strokeWidth={STROKE}>
        <g className={front ? 'fig-near' : 'fig-far'}>
          <path d={line(p.fhp, p.fk, p.fa, p.ft)} />
          <path d={line(p.fsp, p.fe, p.fw)} />
        </g>
        <path className="fig-near" d={front ? line(p.nsp, p.fsp) + line(p.nhp, p.fhp) + line(p.neck, p.hip) : line(p.neck, p.hip)} />
        <circle className="fig-head" cx={p.head[0]} cy={p.head[1]} r={HEAD_R} />
        <g className="fig-near">
          <path d={line(p.nhp, p.nk, p.na, p.nt)} />
          <path d={line(p.nsp, p.ne, p.nw)} />
        </g>
      </g>
    </svg>
  )
}
