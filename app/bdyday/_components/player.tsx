'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { byId } from '../_lib/exercises'
import { buildSteps } from '../_lib/plan'
import type { Plan, Step } from '../_lib/types'
import Figure from './figure'
import { useBdy } from './shell'

/* ---------- Sound, vibration and screen ---------- */

let audio: AudioContext | null = null
/** Must first be called from a tap, or browsers keep the audio muted. */
function unlockAudio() {
  try {
    audio ??= new AudioContext()
    if (audio.state === 'suspended') void audio.resume()
  } catch {}
}
function beep(freq: number, ms = 120) {
  if (!audio) return
  const o = audio.createOscillator(), g = audio.createGain()
  o.frequency.value = freq
  g.gain.setValueAtTime(0.25, audio.currentTime)
  g.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + ms / 1000)
  o.connect(g).connect(audio.destination)
  o.start()
  o.stop(audio.currentTime + ms / 1000)
}
const buzz = (ms: number | number[]) => navigator.vibrate?.(ms)

/** Keeps the screen on while the workout runs, where the browser allows it. */
function useWakeLock(on: boolean) {
  useEffect(() => {
    if (!on || !('wakeLock' in navigator)) return
    let lock: WakeLockSentinel | null = null
    const get = () => navigator.wakeLock.request('screen').then((l) => (lock = l)).catch(() => {})
    void get()
    const vis = () => document.visibilityState === 'visible' && void get()
    document.addEventListener('visibilitychange', vis)
    return () => {
      document.removeEventListener('visibilitychange', vis)
      void lock?.release()
    }
  }, [on])
}

const timed = (s: Step) => s.kind !== 'work' || s.secs !== undefined
const secsOf = (s: Step) => (s.kind === 'work' ? s.secs ?? 0 : s.secs)

/* ---------- Player ---------- */

export default function Player({ plan, onExit, onRestart }: { plan: Plan; onExit: () => void; onRestart: () => void }) {
  const { lang, S } = useBdy()
  const steps = useMemo(() => buildSteps(plan), [plan])
  const [i, setI] = useState(0)
  const [left, setLeft] = useState(secsOf(steps[0])) // seconds left in a timed step
  const [paused, setPaused] = useState(false)
  const [done, setDone] = useState(false)
  const started = useRef(Date.now())
  const endsAt = useRef(Date.now() + secsOf(steps[0]) * 1000)
  const step = steps[i]

  useWakeLock(!done)
  useEffect(() => unlockAudio(), [])

  const go = useCallback(
    (n: number) => {
      if (n >= steps.length) {
        setDone(true)
        beep(1320, 400)
        buzz([200, 100, 200])
        return
      }
      const k = Math.max(0, n)
      setI(k)
      setLeft(secsOf(steps[k]))
      endsAt.current = Date.now() + secsOf(steps[k]) * 1000
      if (steps[k].kind === 'work') beep(1320, 220)
      buzz(steps[k].kind === 'work' ? 250 : 120)
    },
    [steps],
  )

  // Count down timed steps against the clock, so the timer doesn't drift.
  useEffect(() => {
    if (done || paused || !timed(step)) return
    const id = setInterval(() => {
      const ms = endsAt.current - Date.now()
      const s = Math.ceil(ms / 1000)
      setLeft((prev) => {
        if (s !== prev && s > 0 && s <= 3) beep(880)
        return s
      })
      if (ms <= 0) go(i + 1)
    }, 100)
    return () => clearInterval(id)
  }, [i, step, paused, done, go])

  const togglePause = () => {
    unlockAudio()
    if (paused) endsAt.current = Date.now() + left * 1000
    setPaused(!paused)
  }
  const end = () => {
    if (confirm(S.end_confirm)) onExit()
  }

  if (done) {
    const n = new Set(steps.filter((s) => s.kind === 'work' && !s.warmup).map((s) => (s as { ex: string }).ex)).size
    return (
      <section className="done">
        <span className="eyebrow">BDY DAY</span>
        <h1 className="display">{S.done_title}</h1>
        <p className="lede">{S.done_sub(n, Math.max(1, Math.round((Date.now() - started.current) / 60000)))}</p>
        <p className="muted small" style={{ marginTop: 8 }}>{S.log_soon}</p>
        <div className="cta">
          <button className="btn btn-primary btn-block" onClick={onRestart}>{S.again}</button>
          <a className="btn btn-ghost btn-block" href="/bdyday">{S.home}</a>
        </div>
      </section>
    )
  }

  const work = step.kind === 'work' ? step : null
  // During rest, show what comes next.
  const showId = step.kind === 'work' ? step.ex : step.next
  const side = step.kind === 'work' ? step.side : step.nextSide
  const ex = byId(showId)!
  const total = steps.length
  const label =
    step.kind === 'work'
      ? step.warmup ? S.warmup : step.set ? S.set_of(step.set, step.sets!) : null
      : step.kind === 'ready' ? S.get_ready : step.switchSide ? S.switch_side : S.rest

  return (
    <section className={'player ' + (work ? 'is-work' : 'is-rest')}>
      <div className="pl-top">
        <button className="q-back" onClick={end}>✕ {S.end}</button>
        <span className="q-step">{i + 1}/{total}</span>
      </div>
      <div className="q-bar"><i style={{ width: `${((i + 1) / total) * 100}%` }} /></div>

      <div className="pl-label">
        {label && <span className={work ? 'badge' : 'badge ac'}>{label}</span>}
        {side && <span className="badge">{S.side[side]}</span>}
      </div>

      <div className={'pl-fig' + (side === 'R' ? ' flip' : '')}>
        <Figure ex={ex} playing={!paused} />
      </div>

      <div className="pl-name">
        {!work && <small>{S.next}</small>}
        <h1 className="h2">{ex.name[lang]}</h1>
        {work && <p className="cue">{ex.cue[lang]}</p>}
      </div>

      <div className="pl-count">
        {timed(step) ? (
          <span className={'big' + (left <= 3 ? ' hot' : '')}>{paused ? S.paused : left}</span>
        ) : (
          <>
            <span className="big">{work!.target}</span>
            <small>{ex.metric === 'hold' ? 's' : 'reps'}{ex.sides === 'each' ? ` · ${S.per_side}` : ''}</small>
          </>
        )}
      </div>

      <div className="pl-controls">
        <button className="ctl" onClick={() => go(i - 1)} disabled={i === 0} aria-label={S.prev}>⏮</button>
        {timed(step) ? (
          <button className="btn btn-primary ctl-main" onClick={togglePause}>{paused ? S.resume : S.pause}</button>
        ) : (
          <button className="btn btn-primary ctl-main" onClick={() => { unlockAudio(); go(i + 1) }}>✓ {S.done_set}</button>
        )}
        <button className="ctl" onClick={() => go(i + 1)} aria-label={S.skip}>⏭</button>
      </div>
    </section>
  )
}
