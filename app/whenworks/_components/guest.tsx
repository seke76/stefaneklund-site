'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { forgetMe, getMyAnswers, openMyLink, submitAnswers } from '../actions'
import { durLabel, findBest, fmt, isDayEvent, isNew, slotKey, spanOf, tally } from '../_lib/logic'
import { Legend, Matrix } from './matrix'
import { AnswerList, newFirst } from './answers'
import type { Answer, GuestView, Slot } from '../_lib/types'
import {
  Actions,
  Avatar,
  CardHead,
  CopyBtn,
  Field,
  Ic,
  Mark,
  SlotLabel,
  SpanProvider,
  WhenworksShell,
  downloadIcs,
  todayIso,
  useWW,
} from './ui'

type Guest = {
  name: string
  email: string
  answers: Record<string, Answer>
  pending: Slot[]
  answersFor: string // lowercased name the answers belong to
}

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
      <b>{fmt.slot(slot, lang, slot.time ? 1 : spanOf(ev))}</b>
      {note && <span>{note}</span>}
      <button className="btn btn-sm btn-ghost" onClick={() => downloadIcs(ev, slot, note, window.location.href)}>
        {Ic.cal}
        {S.add_cal}
      </button>
    </div>
  )
}

const NEW = '__new__'

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
  // With a guest list, guests pick their name from a dropdown (or add themselves).
  const hasList = ev.participants.length > 0
  const [choice, setChoice] = useState(() =>
    !hasList ? '' : ev.participants.includes(guest.name) ? guest.name : guest.name ? NEW : '',
  )

  /** Earlier answers for a name, so returning guests can edit them. */
  const answersOf = async (name: string) => {
    const r = ev.responders.find((p) => p.name.toLowerCase() === name.toLowerCase())
    if (!r) return {}
    if (r.answers) return r.answers
    setLoading(true)
    const res = await getMyAnswers(ev.slug, name).catch(() => null)
    setLoading(false)
    return res?.ok ? res.data : {}
  }
  /** Continues as `name`. Switching person always swaps in that person's answers (or none). */
  const continueAs = async (raw: string, email = guest.email) => {
    const name = raw.trim()
    const key = name.toLowerCase()
    if (guest.answersFor === key) {
      setGuest({ ...guest, name, email })
    } else {
      const answers = await answersOf(name)
      setGuest({ name, email, answers: { ...answers }, pending: [], answersFor: key })
    }
    onNext()
  }
  const pickExisting = (name: string) => continueAs(name, '')
  const typed = guest.name.trim().toLowerCase()
  // The organizer answers from their own page; guests can't use that name.
  const isOrganizer = (n: string) => n.trim().toLowerCase() === ev.organizer.toLowerCase()
  const orgName = (choice === NEW || !hasList) && isOrganizer(typed)
  const taken = choice === NEW && !orgName && ev.participants.some((n) => n.toLowerCase() === typed)
  const next = () => continueAs(hasList && choice !== NEW ? choice : guest.name)
  // Names someone has answered as are locked to that person's browser.
  const isClaimed = (n: string) =>
    ev.responders.some((p) => p.claimed && p.name.toLowerCase() === n.trim().toLowerCase())
  const anyClaimed = ev.participants.some(isClaimed)
  const claimedTyped = !hasList && !orgName && isClaimed(typed)

  const email = (
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
  )

  return (
    <>
      <FinalBanner ev={ev} />
      {ev.round > 1 && !ev.final && (
        <div className="info-banner">
          <b>{S.g_new_round}</b>
          <p>{ev.roundNote || S.g_new_round_d}</p>
        </div>
      )}
      {hasList ? (
        <>
          <CardHead title={S.g_pick_title} sub={ev.allowSelfAdd ? S.g_pick_sub_add : S.g_pick_sub} />
          <div className="fields">
            <Field label={S.f_name}>
              <select
                className="inp"
                value={choice}
                onChange={(e) => {
                  setChoice(e.target.value)
                  setGuest({ ...guest, name: e.target.value === NEW ? '' : e.target.value })
                }}
              >
                <option value="" disabled>
                  {S.g_pick_ph}
                </option>
                {ev.participants.map((n) => (
                  <option key={n} value={n} disabled={isClaimed(n)}>
                    {isClaimed(n) ? `${n} (${S.g_claimed_opt})` : n}
                  </option>
                ))}
                {ev.allowSelfAdd && <option value={NEW}>{S.g_pick_new}</option>}
              </select>
            </Field>
            {choice === NEW && (
              <Field label={S.g_name}>
                <input
                  className="inp"
                  autoFocus
                  maxLength={60}
                  value={guest.name}
                  placeholder={S.g_name_ph}
                  onChange={(e) => setGuest({ ...guest, name: e.target.value })}
                />
              </Field>
            )}
            {anyClaimed && !choice && <p className="hint">{S.g_claimed_hint}</p>}
            {taken && <p className="err">{isClaimed(typed) ? S.g_claimed : S.g_name_taken}</p>}
            {orgName && <p className="err">{S.g_org_name}</p>}
            {choice && ev.emailEnabled && email}
          </div>
          <Actions
            onNext={next}
            nextLabel={S.g_start}
            nextDisabled={!choice || (choice === NEW && (!guest.name.trim() || taken || orgName)) || loading}
          />
        </>
      ) : (
        <>
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
            {orgName && <p className="err">{S.g_org_name}</p>}
            {claimedTyped && <p className="err">{S.g_claimed}</p>}
            {ev.emailEnabled && email}
          </div>
          {/* Only for answers given before names were locked to a browser. */}
          {ev.responders.some((p) => !isOrganizer(p.name) && !p.claimed) && (
            <div className="returning">
              <span className="lbl">{S.g_returning}</span>
              <div className="chips">
                {ev.responders.filter((p) => !isOrganizer(p.name) && !p.claimed).map((p) => (
                  <button key={p.name} className="chip chip-av" disabled={loading} onClick={() => pickExisting(p.name)}>
                    <Avatar name={p.name} size={22} />
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          <Actions
            onNext={next}
            nextLabel={S.g_start}
            nextDisabled={!guest.name.trim() || orgName || claimedTyped || loading}
          />
        </>
      )}
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
  const [err, setErr] = useState('')
  const me = guest.name.trim().toLowerCase()
  const slots = newFirst([...ev.slots, ...guest.pending], ev.round)
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
    setErr('')
    const res = await submitAnswers(ev.slug, {
      name: guest.name,
      email: guest.email,
      answers: guest.answers,
      suggestions: guest.pending.filter((s) => guest.answers[s.id]).map(({ date, time }) => ({ date, time })),
    }).catch(() => null)
    setBusy(false)
    if (res?.ok) onSent(res.data)
    else
      setErr(
        res?.error === 'not_listed'
          ? S.g_not_listed
          : res?.error === 'organizer'
            ? S.g_org_name
            : res?.error === 'claimed'
              ? S.g_claimed
              : S.err,
      )
  }

  return (
    <>
      <CardHead title={S.g_resp_title} sub={ev.mode === 'open' ? S.g_resp_open : S.g_resp_fixed} />
      <AnswerList
        slots={slots}
        answers={guest.answers}
        onAnswer={setA}
        round={ev.round}
        yesCount={ev.showOthers ? (s) => tally(s, others).yes.length : undefined}
      />
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
            {/* Events measured in days have no clock time. */}
            {!isDayEvent(ev) && (
              <input className="inp inp-time" type="time" value={st} onChange={(e) => setSt(e.target.value)} />
            )}
            <button className="btn btn-ghost" disabled={!sd} onClick={addSuggestion}>
              {Ic.plus}
              {S.g_add}
            </button>
          </div>
        </div>
      )}
      {err && <p className="err">{err}</p>}
      <div className="actions">
        <button className="btn btn-quiet" onClick={onBack}>
          {Ic.arrowL}
          {S.back}
        </button>
        <div className="row">
          <button className="btn btn-primary" onClick={send} disabled={left === slots.length || busy}>
            {S.g_send}
            {Ic.arrowR}
          </button>
        </div>
      </div>
    </>
  )
}

/** Answers from everyone, plus listed people who haven't answered yet (as empty rows). */
function everyone(ev: GuestView) {
  const answered = new Set(ev.responders.map((r) => r.name.toLowerCase()))
  return [
    ...ev.responders.map((r) => ({ name: r.name, answers: r.answers ?? {} })),
    ...ev.participants.filter((n) => !answered.has(n.toLowerCase())).map((name) => ({ name, answers: {} })),
  ]
}

/** Landing page for someone who has answered: the best date first, then their own answers. */
function Home({
  ev,
  justSent,
  onEdit,
  onSeeAll,
  onSwitch,
}: {
  ev: GuestView
  justSent: boolean
  onEdit: () => void
  onSeeAll: () => void
  onSwitch: () => void
}) {
  const { S, lang } = useWW()
  const me = ev.me!
  const [link, setLink] = useState('')
  useEffect(() => {
    setLink(`${window.location.origin}${window.location.pathname}?me=${me.token}`)
  }, [me.token])
  const people = everyone(ev)
  const B = findBest(ev.slots, people, ev.mustAll)
  const best = B.full ?? B.closest[0]
  const todo = ev.slots.filter((s) => !me.answers[s.id]).length
  const days = (s: Slot) => (s.time ? 1 : spanOf(ev))
  return (
    <>
      <FinalBanner ev={ev} />
      {todo > 0 && !ev.final && (
        <div className="info-banner mine-banner">
          <b>{S.g_todo}</b>
          <button className="btn btn-sm btn-primary" onClick={onEdit}>
            {S.g_todo_btn}
            {Ic.arrowR}
          </button>
        </div>
      )}
      {justSent && <span className="badge">{Ic.check}</span>}
      <CardHead title={justSent ? S.g_thanks(me.name) : S.g_home_hi(me.name)} sub={S.g_home_sub} />

      {!ev.final &&
        (ev.showOthers && best ? (
          <div className={'best-box' + (B.full ? ' all' : '')}>
            <span className="eyebrow">{B.full ? S.all_can : S.g_best_now}</span>
            <b>{fmt.slot(best.s, lang, days(best.s))}</b>
            <span className="muted">{S.g_n_can(best.r.yes.length, people.length)}</span>
            <div className="avs">
              {best.r.yes.map((n) => (
                <span key={n} className="av-n">
                  <Avatar name={n} size={24} />
                  {n}
                </span>
              ))}
            </div>
          </div>
        ) : (
          !ev.showOthers && <p className="muted">{S.g_hidden_best}</p>
        ))}

      <div className="actions">
        <button className="btn btn-quiet" onClick={onSwitch}>
          {S.g_not_you(me.name)}
        </button>
        <div className="row">
          <button className="btn btn-ghost" onClick={onEdit}>
            {S.g_edit}
          </button>
          {ev.showOthers && (
            <button className="btn btn-primary" onClick={onSeeAll}>
              {S.g_see_all}
              {Ic.arrowR}
            </button>
          )}
        </div>
      </div>

      <div className="admin">
        <span className="admin-ic">{Ic.lock}</span>
        <div>
          <b>{S.g_my_link}</b>
          <p>{S.g_my_link_d}</p>
          {link && (
            <div className="admin-link">
              <code>{link.replace(/^https?:\/\//, '')}</code>
              <CopyBtn text={link} />
            </div>
          )}
        </div>
      </div>
    </>
  )
}

/** Read-only version of the organizer's answer table, for events where guests may see each other's answers. */
function AllAnswers({ ev, me, onBack }: { ev: GuestView; me: string; onBack: () => void }) {
  const { S, lang } = useWW()
  // Same people as the organizer sees: everyone who answered, then invitees still to answer.
  const people = everyone(ev)
  const B = findBest(ev.slots, people, ev.mustAll)
  return (
    <div className="results">
      <div className="res-head">
        <div>
          <span className="eyebrow">{S.g_all_title}</span>
          <h1 className="display sm">{ev.title}</h1>
          <p className="muted">
            {S.n_resp(ev.responders.length)}
            {ev.deadline && !ev.final ? ' · ' + S.reply_by + ' ' + fmt.long(ev.deadline, lang) : ''}
            {' · '}
            {S.g_all_note}
          </p>
        </div>
        <div className="res-tools">
          <button className="btn btn-sm btn-ghost" onClick={onBack}>
            {Ic.arrowL}
            {S.back}
          </button>
        </div>
      </div>
      <FinalBanner ev={ev} />
      <section className="card card-flush">
        <Matrix people={people} slots={ev.slots} round={ev.round} B={B} me={me} />
      </section>
      <Legend />
    </div>
  )
}

const blankGuest = (ev: GuestView): Guest =>
  ev.me
    ? { name: ev.me.name, email: '', answers: { ...ev.me.answers }, pending: [], answersFor: ev.me.name.toLowerCase() }
    : { name: '', email: '', answers: {}, pending: [], answersFor: '' }

function GuestFlow({ initial }: { initial: GuestView }) {
  const { S } = useWW()
  const [ev, setEv] = useState(initial)
  // Someone this browser already knows lands on their overview; others pick their name.
  const [screen, setScreen] = useState<'join' | 'respond' | 'home' | 'all'>(initial.me ? 'home' : 'join')
  const [guest, setGuest] = useState<Guest>(() => blankGuest(initial))
  const [justSent, setJustSent] = useState(false)
  const [linkErr, setLinkErr] = useState(false)
  const go = (s: typeof screen) => {
    setScreen(s)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const become = (v: GuestView) => {
    setEv(v)
    setGuest(blankGuest(v))
  }

  // Personal link (?me=…): remember this browser as that guest, then drop the secret from the address bar.
  useEffect(() => {
    const url = new URL(window.location.href)
    const token = url.searchParams.get('me')
    if (!token) return
    openMyLink(initial.slug, token)
      .catch(() => null)
      .then((res) => {
        if (res?.ok) {
          become(res.data)
          setScreen('home')
        } else setLinkErr(true)
        // After the server has answered (setting the cookie refreshes the route), so it sticks.
        url.searchParams.delete('me')
        window.history.replaceState(null, '', url.pathname + url.search)
      })
  }, [initial.slug])

  const switchPerson = async () => {
    if (!ev.me || !window.confirm(S.g_switch_confirm(ev.me.name))) return
    const res = await forgetMe(ev.slug).catch(() => null)
    become(res?.ok ? res.data : { ...ev, me: null })
    setJustSent(false)
    go('join')
  }

  // Everyone's answers get the full page width, like the organizer's table.
  if (screen === 'all') return <AllAnswers ev={ev} me={guest.name.trim()} onBack={() => go('home')} />
  return (
    <GuestLayout ev={ev}>
      {screen === 'join' && (
        <>
          {linkErr && <p className="err link-err">{S.g_bad_link}</p>}
          <Join ev={ev} guest={guest} setGuest={setGuest} onNext={() => go('respond')} />
        </>
      )}
      {screen === 'respond' && (
        <Respond
          ev={ev}
          guest={guest}
          setGuest={setGuest}
          onBack={() => go(ev.me ? 'home' : 'join')}
          onSent={(v) => {
            become(v)
            setJustSent(true)
            go('home')
          }}
        />
      )}
      {screen === 'home' && ev.me && (
        <Home
          ev={ev}
          justSent={justSent}
          onEdit={() => {
            setJustSent(false)
            go('respond')
          }}
          onSeeAll={() => go('all')}
          onSwitch={switchPerson}
        />
      )}
    </GuestLayout>
  )
}

export default function GuestApp({ initial }: { initial: GuestView }) {
  return (
    <WhenworksShell role="guest">
      <SpanProvider value={spanOf(initial)}>
        <GuestFlow initial={initial} />
      </SpanProvider>
    </WhenworksShell>
  )
}
