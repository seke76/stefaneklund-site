'use client'

import { useState, type ReactNode } from 'react'
import { getMyAnswers, submitAnswers } from '../actions'
import { durLabel, fmt, isNew, slotKey, tally } from '../_lib/logic'
import type { Answer, GuestView, Slot } from '../_lib/types'
import { Actions, Avatar, CardHead, Field, Ic, Mark, SlotLabel, WhenworksShell, downloadIcs, todayIso, useWW } from './ui'

type Guest = { name: string; email: string; answers: Record<string, Answer>; pending: Slot[] }

function GuestLayout({ ev, children }: { ev: GuestView; children: ReactNode }) {
  const { S, lang } = useWW()
  return (
    <div className="flow">
      <aside className="flow-aside">
        <span className="invited">
          <Avatar name={ev.organizer || '?'} size={28} />
          {S.g_invited(ev.organizer)}
        </span>
        <h1 className="display">{ev.title}</h1>
        {ev.desc && <p className="lede">{ev.desc}</p>}
        <dl className="meta">
          {ev.dur && (
            <div>
              <dt>{S.f_duration}</dt>
              <dd>{durLabel(ev.dur, ev.durUnit, S)}</dd>
            </div>
          )}
          {ev.deadline && !ev.final && (
            <div>
              <dt>{S.reply_by}</dt>
              <dd>{fmt.long(ev.deadline, lang)}</dd>
            </div>
          )}
        </dl>
      </aside>
      <section className="card">{children}</section>
    </div>
  )
}

function FinalBanner({ ev }: { ev: GuestView }) {
  const { S, lang } = useWW()
  if (!ev.final) return null
  const { slot, note } = ev.final
  return (
    <div className="final-banner">
      <span className="eyebrow">{S.g_final}</span>
      <b>{fmt.slot(slot, lang)}</b>
      {note && <span>{note}</span>}
      <button className="btn btn-sm btn-ghost" onClick={() => downloadIcs(ev, slot, note, window.location.href)}>
        {Ic.cal}
        {S.add_cal}
      </button>
    </div>
  )
}

function Join({
  ev,
  guest,
  setGuest,
  onNext,
}: {
  ev: GuestView
  guest: Guest
  setGuest: (g: Guest) => void
  onNext: () => void
}) {
  const { S } = useWW()
  const [loading, setLoading] = useState(false)
  const pickExisting = async (name: string) => {
    const known = ev.responders.find((p) => p.name === name)?.answers
    let answers = known
    if (!answers) {
      setLoading(true)
      const res = await getMyAnswers(ev.slug, name).catch(() => null)
      setLoading(false)
      answers = res?.ok ? res.data : {}
    }
    setGuest({ name, email: '', answers: { ...answers }, pending: [] })
    onNext()
  }
  return (
    <>
      <FinalBanner ev={ev} />
      {ev.round > 1 && !ev.final && (
        <div className="info-banner">
          <b>{S.g_new_round}</b>
          <p>{ev.roundNote || S.g_new_round_d}</p>
        </div>
      )}
      <CardHead title={S.g_name} sub={S.g_name_d} />
      <div className="fields">
        <Field label={S.f_name}>
          <input
            className="inp"
            autoFocus
            maxLength={60}
            value={guest.name}
            placeholder={S.g_name_ph}
            onChange={(e) => setGuest({ ...guest, name: e.target.value })}
          />
        </Field>
        <Field label={S.g_email} optional hint={S.g_email_d}>
          <input
            className="inp"
            type="email"
            maxLength={200}
            value={guest.email}
            placeholder="name@mail.com"
            onChange={(e) => setGuest({ ...guest, email: e.target.value })}
          />
        </Field>
      </div>
      {ev.responders.length > 0 && (
        <div className="returning">
          <span className="lbl">{S.g_returning}</span>
          <div className="chips">
            {ev.responders.map((p) => (
              <button key={p.name} className="chip chip-av" disabled={loading} onClick={() => pickExisting(p.name)}>
                <Avatar name={p.name} size={22} />
                {p.name}
              </button>
            ))}
          </div>
        </div>
      )}
      {ev.pendingInvitees.length > 0 && (
        <div className="returning">
          <span className="lbl">{S.g_invited_pick}</span>
          <div className="chips">
            {ev.pendingInvitees.map((n) => (
              <button
                key={n}
                className={'chip chip-av' + (guest.name === n ? ' on' : '')}
                onClick={() => setGuest({ ...guest, name: n })}
              >
                <Avatar name={n} size={22} />
                {n}
              </button>
            ))}
          </div>
        </div>
      )}
      <Actions onNext={onNext} nextLabel={S.g_start} nextDisabled={!guest.name.trim()} />
    </>
  )
}

function Respond({
  ev,
  guest,
  setGuest,
  onBack,
  onSent,
}: {
  ev: GuestView
  guest: Guest
  setGuest: (g: Guest) => void
  onBack: () => void
  onSent: (v: GuestView) => void
}) {
  const { S } = useWW()
  const [sd, setSd] = useState('')
  const [st, setSt] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState(false)
  const me = guest.name.trim().toLowerCase()
  const slots = [...ev.slots, ...guest.pending]
    .sort((a, b) => (a.date + (a.time ?? '')).localeCompare(b.date + (b.time ?? '')))
    .sort((a, b) => (isNew(b, ev.round) ? 1 : 0) - (isNew(a, ev.round) ? 1 : 0))
  const others = ev.showOthers
    ? ev.responders
        .filter((p) => p.name.toLowerCase() !== me)
        .map((p) => ({ name: p.name, answers: p.answers ?? {} }))
    : []
  const setA = (id: string, v: Answer) => setGuest({ ...guest, answers: { ...guest.answers, [id]: v } })
  const left = slots.filter((s) => !guest.answers[s.id]).length
  const canSuggest = ev.mode === 'open' || ev.allowSuggest

  const addSuggestion = () => {
    const t = { date: sd, time: st || null }
    const existing = slots.find((s) => slotKey(s) === slotKey(t))
    if (existing) {
      setGuest({ ...guest, answers: { ...guest.answers, [existing.id]: 'yes' } })
    } else {
      const s: Slot = { id: 'x_' + slotKey(t), ...t, round: ev.round, by: guest.name.trim() }
      setGuest({ ...guest, pending: [...guest.pending, s], answers: { ...guest.answers, [s.id]: 'yes' } })
    }
    setSd('')
    setSt('')
  }

  const send = async () => {
    setBusy(true)
    setErr(false)
    const res = await submitAnswers(ev.slug, {
      name: guest.name,
      email: guest.email,
      answers: guest.answers,
      suggestions: guest.pending.filter((s) => guest.answers[s.id]).map(({ date, time }) => ({ date, time })),
    }).catch(() => null)
    setBusy(false)
    if (res?.ok) onSent(res.data)
    else setErr(true)
  }

  return (
    <>
      <CardHead title={S.g_resp_title} sub={ev.mode === 'open' ? S.g_resp_open : S.g_resp_fixed} />
      <ul className="answer-list">
        {slots.map((s) => {
          const yes = ev.showOthers ? tally(s, others).yes.length : 0
          const a = guest.answers[s.id]
          const fresh = isNew(s, ev.round)
          return (
            <li key={s.id} className={a ? 'answered ' + a : ''}>
              <div className="al-l">
                <SlotLabel s={s} />
                {(yes > 0 || s.by || fresh) && (
                  <span className="al-meta">
                    {fresh && <span className="new-pill">{S.new_tag}</span>}
                    {s.by ? S.suggested_by(s.by) : ''}
                    {s.by && yes ? ' · ' : ''}
                    {yes ? yes + ' ' + S.can.toLowerCase() : ''}
                  </span>
                )}
              </div>
              <div className="yn">
                {(
                  [
                    ['yes', S.yes_l],
                    ['maybe', S.maybe_l],
                    ['no', S.no_l],
                  ] as const
                ).map(([v, l]) => (
                  <button
                    key={v}
                    className={'yn-b ' + v + (a === v ? ' on' : '')}
                    onClick={() => setA(s.id, v)}
                    aria-pressed={a === v}
                  >
                    <Mark v={v} />
                    <span>{l}</span>
                  </button>
                ))}
              </div>
            </li>
          )
        })}
      </ul>
      {canSuggest && (
        <div className="suggest">
          <span className="lbl">{S.g_suggest}</span>
          <div className="row">
            <input
              className="inp inp-date"
              type="date"
              min={todayIso()}
              value={sd}
              onChange={(e) => setSd(e.target.value)}
            />
            <input className="inp inp-time" type="time" value={st} onChange={(e) => setSt(e.target.value)} />
            <button className="btn btn-ghost" disabled={!sd} onClick={addSuggestion}>
              {Ic.plus}
              {S.g_add}
            </button>
          </div>
        </div>
      )}
      {err && <p className="err">{S.err}</p>}
      <div className="actions">
        <button className="btn btn-quiet" onClick={onBack}>
          {Ic.arrowL}
          {S.back}
        </button>
        <div className="row">
          {left > 0 && <span className="muted small">{S.g_left(left)}</span>}
          <button className="btn btn-primary" onClick={send} disabled={left === slots.length || busy}>
            {S.g_send}
            {Ic.arrowR}
          </button>
        </div>
      </div>
    </>
  )
}

function Done({ ev, guest, onEdit }: { ev: GuestView; guest: Guest; onEdit: () => void }) {
  const { S } = useWW()
  const me = guest.name.trim()
  return (
    <>
      <FinalBanner ev={ev} />
      <span className="badge">{Ic.check}</span>
      <CardHead title={S.g_done_title(me)} sub={S.g_done_sub} />
      <div className="sub-block">
        <span className="lbl">
          {S.g_who} <em>{ev.responders.length}</em>
        </span>
        <div className="avs">
          {ev.responders.map((p) => (
            <span key={p.name} className="av-n">
              <Avatar name={p.name} size={26} />
              {p.name}
              {p.name.toLowerCase() === me.toLowerCase() ? ' (' + S.you + ')' : ''}
            </span>
          ))}
        </div>
      </div>
      <div className="actions">
        <span />
        <button className="btn btn-ghost" onClick={onEdit}>
          {S.g_edit}
        </button>
      </div>
    </>
  )
}

function GuestFlow({ initial }: { initial: GuestView }) {
  const [ev, setEv] = useState(initial)
  const [screen, setScreen] = useState<'join' | 'respond' | 'done'>('join')
  const [guest, setGuest] = useState<Guest>({ name: '', email: '', answers: {}, pending: [] })
  const go = (s: typeof screen) => {
    setScreen(s)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  return (
    <GuestLayout ev={ev}>
      {screen === 'join' && <Join ev={ev} guest={guest} setGuest={setGuest} onNext={() => go('respond')} />}
      {screen === 'respond' && (
        <Respond
          ev={ev}
          guest={guest}
          setGuest={setGuest}
          onBack={() => go('join')}
          onSent={(v) => {
            setEv(v)
            setGuest({ ...guest, pending: [] })
            go('done')
          }}
        />
      )}
      {screen === 'done' && <Done ev={ev} guest={guest} onEdit={() => go('respond')} />}
    </GuestLayout>
  )
}

export default function GuestApp({ initial }: { initial: GuestView }) {
  return (
    <WhenworksShell role="guest">
      <GuestFlow initial={initial} />
    </WhenworksShell>
  )
}
