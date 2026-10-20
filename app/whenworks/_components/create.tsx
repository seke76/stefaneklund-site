'use client'

import { useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { createEvent } from '../actions'
import { fmt, isDayEvent, slotKey, spanOf } from '../_lib/logic'
import type { DurUnit, Invitee, Mode, Range } from '../_lib/types'
import {
  Actions,
  Calendar,
  Avatar,
  CardHead,
  Field,
  Ic,
  SlotLabel,
  SpanProvider,
  Steps,
  TimeSelect,
  Toggle,
  WhenworksShell,
  monthOf,
  todayIso,
  useWW,
} from './ui'

const TIMES = ['09:00', '12:00', '15:00', '18:00', '19:00', '20:00']

export type DraftSlot = { id: string; date: string; time: string | null }

type WhenProps = {
  slots: DraftSlot[]
  setSlots: (s: DraftSlot[]) => void
  taken?: { date: string; time: string | null }[]
  label?: string
  /** Events measured in days: pick start dates, each covering this many days. 0 = pick clock times. */
  days?: number
}

/** Picks the suggested times. Also used when asking again. */
export function WhenCalendar(props: WhenProps) {
  return props.days ? <WhenDays {...props} days={props.days} /> : <WhenTimes {...props} />
}

/** Multi-day events: tap the first day, the following days are marked too. No clock time. */
function WhenDays({ slots, setSlots, taken = [], label, days }: WhenProps & { days: number }) {
  const { S } = useWW()
  const [today] = useState(todayIso)
  const [month, setMonth] = useState(() => monthOf(slots[0]?.date ?? today))
  const has = (d: string) => slots.some((s) => s.date === d)
  const isTaken = (d: string) => taken.some((s) => s.date === d && s.time === null)
  const covered = (c: string) => slots.some((s) => c > s.date && c <= fmt.end(s.date, days))
  const toggle = (d: string) => {
    if (isTaken(d)) return
    setSlots(
      has(d)
        ? slots.filter((s) => s.date !== d)
        : [...slots, { id: slotKey({ date: d, time: null }), date: d, time: null }],
    )
  }
  const sorted = [...slots].sort((a, b) => a.date.localeCompare(b.date))
  return (
    <div className="when-cal">
      <div>
        <Calendar
          month={month}
          setMonth={setMonth}
          minDate={today}
          onPick={toggle}
          isOn={has}
          isMid={(c) => !has(c) && covered(c)}
        />
        <p className="hint cal-hint">{S.days_hint(days)}</p>
      </div>
      <div className="slot-col">
        <span className="lbl">
          {label || S.your_slots} <em>{sorted.length}</em>
        </span>
        {sorted.length === 0 ? (
          <p className="empty">{S.no_slots_days}</p>
        ) : (
          <ul className="slot-list">
            {sorted.map((s) => (
              <li key={s.id}>
                <SlotLabel s={s} />
                <button className="icon-btn" aria-label={S.remove} onClick={() => toggle(s.date)}>
                  {Ic.x}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

/** Calendar + time chips for picking clock times. */
function WhenTimes({ slots, setSlots, taken = [], label }: WhenProps) {
  const { S, lang } = useWW()
  const [today] = useState(todayIso)
  const [month, setMonth] = useState(() => monthOf(slots[0]?.date ?? today))
  const [sel, setSel] = useState<string | null>(slots[0]?.date ?? null)
  const [other, setOther] = useState('')
  const has = (d: string, t: string) => slots.some((s) => s.date === d && s.time === t)
  const isTaken = (d: string, t: string) => taken.some((s) => s.date === d && s.time === t)
  const toggle = (d: string, t: string) =>
    setSlots(
      has(d, t)
        ? slots.filter((s) => !(s.date === d && s.time === t))
        : [...slots, { id: slotKey({ date: d, time: t }), date: d, time: t }],
    )
  const sorted = [...slots].sort((a, b) => (a.date + a.time).localeCompare(b.date + (b.time ?? '')))
  return (
    <div className="when-cal">
      <div>
        <Calendar
          month={month}
          setMonth={setMonth}
          minDate={today}
          onPick={setSel}
          isOn={(c) => c === sel}
          dots={(c) => slots.filter((s) => s.date === c).length}
        />
        {sel && (
          <div className="time-pick">
            <span className="lbl">
              {S.times_on} · {fmt.long(sel, lang)}
            </span>
            <div className="chips">
              {TIMES.map((t) => (
                <button
                  key={t}
                  disabled={isTaken(sel, t)}
                  className={'chip' + (has(sel, t) ? ' on' : '')}
                  onClick={() => toggle(sel, t)}
                >
                  {t}
                </button>
              ))}
              <span className="chip-other">
                <TimeSelect value={other} onChange={setOther} label={S.other_time} />
                <button
                  className="chip"
                  disabled={!other}
                  aria-label={S.g_add}
                  onClick={() => {
                    if (!has(sel, other) && !isTaken(sel, other)) toggle(sel, other)
                    setOther('')
                  }}
                >
                  {Ic.plus}
                </button>
              </span>
            </div>
          </div>
        )}
      </div>
      <div className="slot-col">
        <span className="lbl">
          {label || S.your_slots} <em>{sorted.length}</em>
        </span>
        {sorted.length === 0 ? (
          <p className="empty">{S.no_slots}</p>
        ) : (
          <ul className="slot-list">
            {sorted.map((s) => (
              <li key={s.id}>
                <SlotLabel s={s} />
                <button className="icon-btn" aria-label={S.remove} onClick={() => toggle(s.date, s.time ?? '')}>
                  {Ic.x}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

function WhenRange({ range, setRange }: { range: Range; setRange: (r: Range) => void }) {
  const { S } = useWW()
  const [today] = useState(todayIso)
  const [month, setMonth] = useState(() => monthOf(range.start || today))
  const { start, end } = range
  const pick = (c: string) => {
    if (!start || end || c < start) setRange({ start: c, end: null })
    else setRange({ start, end: c })
  }
  const n = start ? fmt.range(start, end || start).length : 0
  return (
    <div className="when-cal">
      <Calendar
        month={month}
        setMonth={setMonth}
        minDate={today}
        onPick={pick}
        isOn={(c) => c === start || c === end}
        isMid={(c) => !!(start && end && c > start && c < end)}
      />
      <div className="slot-col">
        <span className="lbl">{n ? S.range_sel(n) : S.range_hint}</span>
        {start && (
          <div className="range-sum">
            <SlotLabel s={{ date: start, time: null }} compact />
            <span className="muted">→</span>
            <SlotLabel s={{ date: end || start, time: null }} compact />
          </div>
        )}
      </div>
    </div>
  )
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Step 3: people to email the link to. Optional. */
function GuestsStep({
  invitees,
  setInvitees,
  emailEnabled,
}: {
  invitees: Invitee[]
  setInvitees: (v: Invitee[]) => void
  emailEnabled: boolean
}) {
  const { S } = useWW()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [err, setErr] = useState('')
  const add = () => {
    const n = name.trim()
    const e = email.trim()
    if (e && !EMAIL_RE.test(e)) return setErr(S.invalid_email)
    if (invitees.some((i) => i.name.toLowerCase() === n.toLowerCase())) return setErr(S.dup_guest)
    setInvitees([...invitees, { name: n, email: e }])
    setName('')
    setEmail('')
    setErr('')
  }
  return (
    <>
      <form
        className={'guest-add' + (emailEnabled ? '' : ' no-mail')}
        onSubmit={(e) => {
          e.preventDefault()
          add()
        }}
      >
        <Field label={S.f_guest_name}>
          <input
            className="inp"
            value={name}
            maxLength={60}
            placeholder={S.f_name_ph}
            onChange={(e) => {
              setName(e.target.value)
              setErr('')
            }}
          />
        </Field>
        {emailEnabled && (
          <Field label={S.f_guest_email} optional>
            <input
              className="inp"
              type="email"
              value={email}
              maxLength={200}
              placeholder="name@mail.com"
              onChange={(e) => {
                setEmail(e.target.value)
                setErr('')
              }}
            />
          </Field>
        )}
        <button type="submit" className="btn btn-ghost" disabled={!name.trim() || invitees.length >= 50}>
          {Ic.plus}
          {S.g_add}
        </button>
      </form>
      {err && <p className="err">{err}</p>}
      <div className="section">
        <span className="lbl">
          {S.guests_list} <em>{invitees.length}</em>
        </span>
        {invitees.length === 0 ? (
          <p className="empty">{S.no_guests}</p>
        ) : (
          <ul className="slot-list">
            {invitees.map((i) => (
              <li key={i.name}>
                <span className="inv">
                  <Avatar name={i.name} size={32} />
                  <span className="st">
                    <b>{i.name}</b>
                    {i.email && <span>{i.email}</span>}
                  </span>
                </span>
                <button
                  className="icon-btn"
                  aria-label={S.remove}
                  onClick={() => setInvitees(invitees.filter((x) => x.name !== i.name))}
                >
                  {Ic.x}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  )
}

function FlowLayout({ step, children }: { step: number; children: ReactNode }) {
  const { S } = useWW()
  return (
    <div className="flow">
      <aside className="flow-aside">
        <h1 className="display">{S.tagline}</h1>
        <p className="lede">{S.tagline_p}</p>
        <Steps current={step} />
      </aside>
      <section className="card">{children}</section>
    </div>
  )
}

type Draft = {
  title: string
  desc: string
  multi: boolean // spans several days: pick start dates, no clock times
  days: string
  mode: Mode
  slots: DraftSlot[]
  range: Range
  invitees: Invitee[]
  organizer: string
  showOthers: boolean
}

const EMPTY: Draft = {
  title: '',
  desc: '',
  multi: false,
  days: '2',
  mode: 'fixed',
  slots: [],
  range: { start: '', end: null },
  invitees: [],
  organizer: '',
  showOthers: true,
}

type Step = 1 | 2 | 3

function CreateFlow({ emailEnabled }: { emailEnabled: boolean }) {
  const { S, lang } = useWW()
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  const [ev, setEv] = useState<Draft>(EMPTY)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState(false)
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setEv((e) => ({ ...e, [k]: v }))
  // Duration is only asked for multi-day events; everything else is a single time.
  const dur = ev.multi ? String(Math.max(2, Number(ev.days) || 2)) : ''
  const shape = { mode: ev.mode, durUnit: (ev.multi ? 'd' : 'h') as DurUnit, dur }
  // Multi-day events pick start dates only; times picked before switching are kept aside.
  const dayMode = isDayEvent(shape)
  const modeSlots = ev.slots.filter((x) => (dayMode ? x.time === null : x.time !== null))
  const wrap = (n: ReactNode) => <SpanProvider value={spanOf(shape)}>{n}</SpanProvider>
  const go = (s: Step) => {
    setStep(s)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const create = async () => {
    setBusy(true)
    setErr(false)
    const res = await createEvent({
      title: ev.title,
      desc: ev.desc,
      dur,
      durUnit: shape.durUnit,
      mode: ev.mode,
      range: ev.mode === 'open' ? ev.range : null,
      slots: ev.mode === 'fixed' ? modeSlots.map(({ date, time }) => ({ date, time })) : [],
      organizer: ev.organizer,
      showOthers: ev.showOthers,
      invitees: ev.invitees,
      lang,
      origin: window.location.origin,
    }).catch(() => null)
    if (res?.ok) {
      router.push(`/whenworks/e/${res.data.slug}/admin/${res.data.token}?new=1`)
    } else {
      setBusy(false)
      setErr(true)
    }
  }

  if (step === 1)
    return wrap(
      <FlowLayout step={1}>
        <CardHead title={S.what_title} sub={S.what_sub} />
        <div className="fields">
          <Field label={S.f_title}>
            <input
              className="inp"
              value={ev.title}
              maxLength={120}
              placeholder={S.f_title_ph}
              onChange={(e) => set('title', e.target.value)}
            />
          </Field>
          <Field label={S.f_desc} optional>
            <textarea
              className="inp"
              rows={3}
              value={ev.desc}
              maxLength={600}
              placeholder={S.f_desc_ph}
              onChange={(e) => set('desc', e.target.value)}
            />
          </Field>
        </div>
        <Toggle checked={ev.multi} onChange={(v) => set('multi', v)} title={S.multi_day} desc={S.multi_day_d} />
        {ev.multi && (
          <div className="row multi-days">
            <input
              className="inp inp-num"
              inputMode="numeric"
              aria-label={S.days}
              value={ev.days}
              onChange={(e) => set('days', e.target.value.replace(/\D/g, '').slice(0, 2))}
            />
            <span className="muted">{S.days.toLowerCase()}</span>
          </div>
        )}
        <Actions onNext={() => go(2)} nextDisabled={!ev.title.trim()} />
      </FlowLayout>,
    )

  if (step === 2) {
    const ok = ev.mode === 'open' ? !!ev.range.start : modeSlots.length > 0
    return wrap(
      <FlowLayout step={2}>
        <CardHead title={S.when_title} sub={S.when_sub} />
        <div className="mode-cards">
          {(
            [
              ['fixed', S.mode_fixed, S.mode_fixed_d],
              ['open', S.mode_open, S.mode_open_d],
            ] as const
          ).map(([m, l, d]) => (
            <button key={m} className={'mode' + (ev.mode === m ? ' on' : '')} onClick={() => set('mode', m)}>
              <span className="radio" />
              <span>
                <b>{l}</b>
                <span>{d}</span>
              </span>
            </button>
          ))}
        </div>
        {ev.mode === 'fixed' ? (
          <WhenCalendar
            slots={modeSlots}
            setSlots={(v) => set('slots', [...ev.slots.filter((x) => !modeSlots.includes(x)), ...v])}
            days={dayMode ? spanOf(shape) : 0}
          />
        ) : (
          <WhenRange range={ev.range} setRange={(r) => set('range', r)} />
        )}
        <Actions onBack={() => go(1)} onNext={() => go(3)} nextDisabled={!ok} />
      </FlowLayout>,
    )
  }

  return wrap(
    <FlowLayout step={3}>
      <CardHead title={S.who_title} sub={S.who_sub} />
      <div className="fields">
        <Field label={S.f_name}>
          <input
            className="inp"
            value={ev.organizer}
            maxLength={60}
            placeholder={S.f_name_ph}
            onChange={(e) => set('organizer', e.target.value)}
          />
        </Field>
      </div>
      {/* Optional guest list, folded away so the step stays short. */}
      <details className="more" open={ev.invitees.length > 0}>
        <summary>{S.add_guests}</summary>
        <p className="hint">{emailEnabled ? S.guests_sub : S.add_guests_d}</p>
        <GuestsStep emailEnabled={emailEnabled} invitees={ev.invitees} setInvitees={(v) => set('invitees', v)} />
      </details>
      <Toggle
        checked={ev.showOthers}
        onChange={(v) => set('showOthers', v)}
        title={S.show_others}
        desc={S.show_others_d}
      />
      {err && <p className="err">{S.err}</p>}
      <Actions
        onBack={() => go(2)}
        onNext={create}
        nextLabel={S.create}
        nextDisabled={!ev.organizer.trim() || busy}
      />
    </FlowLayout>,
  )
}

export default function CreateApp({ emailEnabled }: { emailEnabled: boolean }) {
  return (
    <WhenworksShell>
      <CreateFlow emailEnabled={emailEnabled} />
    </WhenworksShell>
  )
}
