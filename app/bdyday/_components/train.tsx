'use client'

import { useState } from 'react'
import { byId } from '../_lib/exercises'
import { buildPool, canSwap, defaults, doseOf, ENERGIES, FOCUSES, fitSets, fitTimer, MINUTES, PLACES, SET_COUNTS, SET_RESTS, swapIn, TIMER_PRESETS, totalSeconds, warmupSeconds } from '../_lib/plan'
import type { Answers, Exercise, Plan } from '../_lib/types'
import Figure from './figure'
import Player from './player'
import { useBdy } from './shell'

const newSeed = () => Math.floor(Math.random() * 2 ** 31)

/** Builds a plan with suggested settings for both modes. */
function makePlan(a: Answers, warmup = false): Plan {
  return { answers: a, pool: buildPool(a, newSeed()), warmup, ...defaults(a) }
}

/* ---------- Questions ---------- */

type Option<T> = { value: T; label: string; desc?: string }

function Question<T extends string | number>({ title, step, options, value, onPick, onBack }: {
  title: string; step: number; options: Option<T>[]; value?: T; onPick: (v: T) => void; onBack?: () => void
}) {
  const { S } = useBdy()
  return (
    <section className="q">
      <div className="q-top">
        {onBack ? <button className="q-back" onClick={onBack}>← {S.back}</button> : <a className="q-back" href="/bdyday">← {S.back}</a>}
        <span className="q-step">{S.q_of(step, 4)}</span>
      </div>
      <div className="q-bar"><i style={{ width: `${(step / 4) * 100}%` }} /></div>
      <h1 className="display sm">{title}</h1>
      <div className={'tiles' + (options.length > 4 ? ' two' : '')}>
        {options.map((o) => (
          <button key={String(o.value)} className={'tile' + (o.value === value ? ' on' : '')} onClick={() => onPick(o.value)}>
            <b>{o.label}</b>
            {o.desc && <span>{o.desc}</span>}
          </button>
        ))}
      </div>
    </section>
  )
}

/* ---------- Proposal ---------- */

function Row({ ex, plan, onSwap }: { ex: Exercise; plan: Plan; onSwap?: () => void }) {
  const { lang, S } = useBdy()
  const amount =
    plan.mode === 'timer'
      ? S.sec(plan.timer.work) + (ex.sides === 'each' ? ` ${S.per_side}` : '')
      : `${plan.sets.sets} × ${ex.metric === 'hold' ? S.sec(doseOf(ex)) : doseOf(ex)}` + (ex.sides === 'each' ? ` ${S.per_side}` : '')
  return (
    <li className="ex-row">
      <div className="ex-thumb"><Figure ex={ex} playing={false} /></div>
      <div className="ex-row-txt">
        <b>{ex.name[lang]}</b>
        <span>{amount}</span>
      </div>
      {onSwap && <button className="swap" onClick={onSwap} aria-label={S.swap}>↻</button>}
    </li>
  )
}

function Proposal({ plan, setPlan, onStart, onEdit }: { plan: Plan; setPlan: (p: Plan) => void; onStart: () => void; onEdit: () => void }) {
  const { S } = useBdy()
  const a = plan.answers
  const timer = fitTimer(plan.pool, a.minutes, plan.timer)
  const sets = fitSets(plan.pool, a.minutes, plan.sets)
  const ids = plan.mode === 'timer' ? timer.ids : sets.ids
  const swappable = canSwap(plan)
  const set = (p: Partial<Plan>) => setPlan({ ...plan, ...p })
  return (
    <section className="proposal">
      <span className="eyebrow">{S.your_workout}</span>
      <h1 className="display sm">
        {S.focus[a.focus]} <em>{S.about_min(Math.round(totalSeconds(plan) / 60))}</em>
      </h1>
      <div className="summary">
        <span className="badge">{S.min(a.minutes)}</span>
        <span className="badge">{S.energy[a.energy]}</span>
        <span className="badge">{S.place[a.place]}</span>
        <button className="link" onClick={onEdit}>{S.change_answers}</button>
      </div>

      <div className="panel">
        <div className="seg" role="tablist">
          <button className={plan.mode === 'timer' ? 'on' : ''} onClick={() => set({ mode: 'timer' })}>{S.mode_timer}</button>
          <button className={plan.mode === 'sets' ? 'on' : ''} onClick={() => set({ mode: 'sets' })}>{S.mode_sets}</button>
        </div>
        <p className="muted small">{plan.mode === 'timer' ? S.mode_timer_d : S.mode_sets_d}</p>
        {plan.mode === 'timer' ? (
          <div className="opts">
            {TIMER_PRESETS.map((t) => (
              <button key={t.work} className={'chip' + (t.work === plan.timer.work ? ' on' : '')} onClick={() => set({ timer: t })}>
                {S.work_rest(t.work, t.rest)}
              </button>
            ))}
            {timer.rounds > 1 && <span className="badge ac">{S.rounds(timer.rounds)}</span>}
          </div>
        ) : (
          <>
            <div className="opts">
              {SET_COUNTS.map((n) => (
                <button key={n} className={'chip' + (n === plan.sets.sets ? ' on' : '')} onClick={() => set({ sets: { ...plan.sets, sets: n } })}>
                  {S.n_sets(n)}
                </button>
              ))}
            </div>
            <div className="opts">
              {SET_RESTS.map((r) => (
                <button key={r} className={'chip' + (r === plan.sets.rest ? ' on' : '')} onClick={() => set({ sets: { ...plan.sets, rest: r } })}>
                  {S.rest_s(r)}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <label className="toggle">
        <input type="checkbox" checked={plan.warmup} onChange={(e) => set({ warmup: e.target.checked })} />
        <span>
          <b>{S.warmup_toggle}</b>
          <small>{S.warmup_d(Math.round(warmupSeconds(a.focus) / 60))}</small>
        </span>
      </label>

      <ol className="ex-list">
        {ids.map((id) => (
          <Row key={id} ex={byId(id)!} plan={plan} onSwap={swappable ? () => setPlan(swapIn(plan, id)) : undefined} />
        ))}
      </ol>

      <div className="sticky-cta">
        <button className="btn btn-ghost" onClick={() => setPlan({ ...plan, pool: buildPool(a, newSeed()) })}>{S.new_plan}</button>
        <button className="btn btn-primary" onClick={onStart}>{S.start}</button>
      </div>
    </section>
  )
}

/* ---------- Flow ---------- */

/** Questions → proposal → player. Everything happens on one page so nothing has to be stored. */
export default function Train() {
  const { S } = useBdy()
  const [step, setStep] = useState(0)
  const [a, setA] = useState<Partial<Answers>>({})
  const [plan, setPlan] = useState<Plan | null>(null)
  const [playing, setPlaying] = useState(false)

  const pick = (p: Partial<Answers>) => {
    const next = { ...a, ...p }
    setA(next)
    if (step < 3) setStep(step + 1)
    else {
      setPlan(makePlan(next as Answers, plan?.warmup))
      setStep(4)
    }
    window.scrollTo(0, 0)
  }
  const back = step > 0 ? () => setStep(step - 1) : undefined

  if (playing && plan) return <Player plan={plan} onExit={() => setPlaying(false)} onRestart={() => { setPlaying(false); setPlan(null); setStep(0) }} />
  if (step === 4 && plan) return <Proposal plan={plan} setPlan={setPlan} onStart={() => setPlaying(true)} onEdit={() => setStep(0)} />
  if (step === 0)
    return <Question title={S.q_time} step={1} value={a.minutes} onPick={(minutes) => pick({ minutes })} options={MINUTES.map((m) => ({ value: m, label: S.min(m) }))} />
  if (step === 1)
    return <Question title={S.q_focus} step={2} value={a.focus} onBack={back} onPick={(focus) => pick({ focus })} options={FOCUSES.map((f) => ({ value: f, label: S.focus[f], desc: S.focus_d[f] }))} />
  if (step === 2)
    return <Question title={S.q_energy} step={3} value={a.energy} onBack={back} onPick={(energy) => pick({ energy })} options={ENERGIES.map((e) => ({ value: e, label: S.energy[e], desc: S.energy_d[e] }))} />
  return <Question title={S.q_place} step={4} value={a.place} onBack={back} onPick={(place) => pick({ place })} options={PLACES.map((p) => ({ value: p, label: S.place[p], desc: S.place_d[p] }))} />
}
