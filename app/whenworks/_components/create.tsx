'use client'

import { useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { createEvent } from '../actions'
import { fmt, slotKey } from '../_lib/logic'
import type { DurUnit, Invitee, Mode, Range } from '../_lib/types'
import {
  Actions,
  Calendar,
  Avatar,
  CardHead,
  Field,
  Ic,
  Seg,
  SlotLabel,
  Steps,
  Toggle,
  WhenworksShell,
  monthOf,
  todayIso,
  useWW,
} from './ui'

const TIMES = ['09:00', '12:00', '15:00', '18:00', '19:00', '20:00']

export type DraftSlot = { id: string; date: string; time: string }

/** Calendar + time chips for picking fixed times. Also used when asking again. */
export function WhenCalendar({
  slots,
  setSlots,
  taken = [],
  label,
}: {
  slots: DraftSlot[]
  setSlots: (s: DraftSlot[]) => void
  taken?: { date: string; time: string | null }[]
  label?: string
}) {
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
  const sorted = [...slots].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
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
                <input
                  type="time"
                  value={other}
                  onChange={(e) => setOther(e.target.value)}
                  aria-label={S.other_time}
                />
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
                <button className="icon-btn" aria-label={S.remove} onClick={() => toggle(s.date, s.time)}>
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
function GuestsStep({ invitees, setInvitees }: { invitees: Invitee[]; setInvitees: (v: Invitee[]) => void }) {
  const { S } = useWW()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [err, setErr] = useState('')
  const add = () => {
    const e = email.trim()
    if (!EMAIL_RE.test(e)) return setErr(S.invalid_email)
    if (invitees.some((i) => i.email.toLowerCase() === e.toLowerCase())) return setErr(S.dup_guest)
    setInvitees([...invitees, { name: name.trim(), email: e }])
    setName('')
    setEmail('')
    setErr('')
  }
  return (
    <>
      <form
        className="guest-add"
        onSubmit={(e) => {
          e.preventDefault()
          add()
        }}
      >
        <Field label={S.f_guest_name}>
          <input className="inp" value={name} maxLength={60} placeholder={S.f_name_ph} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label={S.f_guest_email}>
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
        <button type="submit" className="btn btn-ghost" disabled={!name.trim() || !email.trim() || invitees.length >= 50}>
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
              <li key={i.email}>
                <span className="inv">
                  <Avatar name={i.name} size={32} />
                  <span className="st">
                    <b>{i.name}</b>
                    <span>{i.email}</span>
                  </span>
                </span>
                <button
                  className="icon-btn"
                  aria-label={S.remove}
                  onClick={() => setInvitees(invitees.filter((x) => x.email !== i.email))}
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
  dur: string
  durUnit: DurUnit
  mode: Mode
  slots: DraftSlot[]
  range: Range
  allowSuggest: boolean
  invitees: Invitee[]
  organizer: string
  deadline: string
  mustAll: boolean
  showOthers: boolean
}

const EMPTY: Draft = {
  title: '',
  desc: '',
  dur: '',
  durUnit: 'h',
  mode: 'fixed',
  slots: [],
  range: { start: '', end: null },
  allowSuggest: true,
  invitees: [],
  organizer: '',
  deadline: '',
  mustAll: true,
  showOthers: true,
}

type Step = 1 | 2 | 3 | 4

function CreateFlow() {
  const { S, lang } = useWW()
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  const [ev, setEv] = useState<Draft>(EMPTY)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState(false)
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setEv((e) => ({ ...e, [k]: v }))
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
      dur: ev.dur,
      durUnit: ev.durUnit,
      mode: ev.mode,
      range: ev.mode === 'open' ? ev.range : null,
      slots: ev.mode === 'fixed' ? ev.slots.map(({ date, time }) => ({ date, time })) : [],
      allowSuggest: ev.allowSuggest,
      organizer: ev.organizer,
      deadline: ev.deadline || null,
      mustAll: ev.mustAll,
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
    return (
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
          <Field label={S.f_duration} optional>
            <div className="row">
              <Seg
                value={ev.durUnit}
                onChange={(v) => set('durUnit', v)}
                options={[
                  { v: 'h', l: S.hours },
                  { v: 'd', l: S.days },
                ]}
              />
              <input
                className="inp inp-num"
                inputMode="numeric"
                value={ev.dur}
                placeholder={S.f_dur_ph}
                onChange={(e) => set('dur', e.target.value.replace(/\D/g, '').slice(0, 3))}
              />
              <span className="muted">{(ev.durUnit === 'h' ? S.hours : S.days).toLowerCase()}</span>
            </div>
          </Field>
        </div>
        <Actions onNext={() => go(2)} nextDisabled={!ev.title.trim()} />
      </FlowLayout>
    )

  if (step === 2) {
    const ok = ev.mode === 'open' ? !!ev.range.start : ev.slots.length > 0
    return (
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
          <WhenCalendar slots={ev.slots} setSlots={(v) => set('slots', v)} />
        ) : (
          <WhenRange range={ev.range} setRange={(r) => set('range', r)} />
        )}
        {ev.mode === 'fixed' && (
          <Toggle checked={ev.allowSuggest} onChange={(v) => set('allowSuggest', v)} title={S.allow_suggest} />
        )}
        <Actions onBack={() => go(1)} onNext={() => go(3)} nextDisabled={!ok} />
      </FlowLayout>
    )
  }

  if (step === 3)
    return (
      <FlowLayout step={3}>
        <CardHead title={S.guests_title} sub={S.guests_sub} />
        <GuestsStep invitees={ev.invitees} setInvitees={(v) => set('invitees', v)} />
        <Actions onBack={() => go(2)} onNext={() => go(4)} />
      </FlowLayout>
    )

  return (
    <FlowLayout step={4}>
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
        <Field label={S.f_deadline} optional>
          <input
            className="inp inp-date"
            type="date"
            min={todayIso()}
            value={ev.deadline}
            onChange={(e) => set('deadline', e.target.value)}
          />
        </Field>
      </div>
      <Toggle checked={ev.mustAll} onChange={(v) => set('mustAll', v)} title={S.must_all} desc={S.must_all_d} />
      <Toggle
        checked={ev.showOthers}
        onChange={(v) => set('showOthers', v)}
        title={S.show_others}
        desc={S.show_others_d}
      />
      <div className="how">
        <span className="lbl">{S.how_title}</span>
        <ol>
          {S.how.map((h, i) => (
            <li key={i}>
              <span className="n">{i + 1}</span>
              {h}
            </li>
          ))}
        </ol>
      </div>
      {err && <p className="err">{S.err}</p>}
      <Actions
        onBack={() => go(3)}
        onNext={create}
        nextLabel={S.create}
        nextDisabled={!ev.organizer.trim() || busy}
      />
    </FlowLayout>
  )
}

export default function CreateApp() {
  return (
    <WhenworksShell role="organizer">
      <CreateFlow />
    </WhenworksShell>
  )
}
