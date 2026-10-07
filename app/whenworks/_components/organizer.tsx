'use client'

import { useEffect, useState } from 'react'
import { askAgain, finalize, getAdmin, setMyAnswers } from '../actions'
import { durLabel, findBest, fmt, isNew, missingOf, tally, type Best } from '../_lib/logic'
import type { AdminResponse, AdminView, Slot } from '../_lib/types'
import { WhenCalendar, type DraftSlot } from './create'
import { Legend, Matrix } from './matrix'
import { AnswerList, newFirst } from './answers'
import {
  Actions,
  Avatar,
  CardHead,
  CopyBox,
  CopyBtn,
  Field,
  Ic,
  Mark,
  Seg,
  SlotLabel,
  Toggle,
  WhenworksShell,
  downloadIcs,
  useWW,
} from './ui'

type Screen = 'created' | 'results' | 'reask' | 'finalize' | 'final' | 'mine'
type Links = { guest: string; admin: string }

const strip = (url: string) => url.replace(/^https?:\/\//, '')

const isOrg = (ev: AdminView, name: string) => name.toLowerCase() === ev.organizer.toLowerCase()
const myAnswers = (ev: AdminView) => ev.responses.find((r) => isOrg(ev, r.name))?.answers ?? {}

/** Everyone the organizer is waiting on: people who answered plus invitees who haven't yet. */
const people = (ev: AdminView): AdminResponse[] => [
  ...ev.responses,
  ...ev.pendingInvitees.map((name) => ({ name, hasEmail: false, answers: {} })),
]

function Created({ ev, links }: { ev: AdminView; links: Links }) {
  const { S } = useWW()
  const msg = S.invite_msg(ev.organizer, ev.title, links.guest)
  return (
    <div className="single">
      <section className="card card-wide">
        <span className="badge">{Ic.check}</span>
        <CardHead title={S.created_title} sub={S.created_sub} />
        <CopyBox text={links.guest} mono />
        {ev.invitesSent > 0 ? (
          <p className="invite-status ok">{S.invites_sent(ev.invitesSent)}</p>
        ) : (
          ev.inviteEmails > 0 && (
            <p className="invite-status">{ev.emailEnabled ? S.invites_failed : S.invites_off}</p>
          )
        )}
        <div className="sub-block">
          <span className="lbl">{S.share_msg}</span>
          <div className="msg-wrap">
            <div className="msg">{msg}</div>
            <CopyBtn text={msg} />
          </div>
        </div>
        <div className="admin">
          <span className="admin-ic">{Ic.lock}</span>
          <div>
            <b>{S.admin_title}</b>
            <p>{S.admin_d}</p>
            <div className="admin-link">
              <code>{strip(links.admin)}</code>
              <CopyBtn text={links.admin} />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function ResultsRanked({ ev, B, onPick }: { ev: AdminView; B: Best; onPick: (s: Slot) => void }) {
  const { S } = useWW()
  const n = people(ev).length || 1
  const tagTxt = { all: S.all_can, closest: S.closest, best: S.best }[B.tag]
  return (
    <ol className="rank">
      {B.ranked.map(({ s, r }, i) => (
        <li key={s.id} className={i === 0 ? 'top ' + B.tag : ''}>
          <div className="rank-head">
            <SlotLabel s={s} />
            {i === 0 && <span className={'best-tag ' + B.tag}>{tagTxt}</span>}
            {isNew(s, ev.round) && <span className="new-pill">{S.new_tag}</span>}
            <span className="rank-n">
              <b>{r.yes.length}</b> {S.of} {people(ev).length}
            </span>
            <button className="btn btn-sm btn-ghost" onClick={() => onPick(s)}>
              {S.pick_this}
            </button>
          </div>
          <div className="bar">
            <span className="b-yes" style={{ width: (r.yes.length / n) * 100 + '%' }} />
            <span className="b-maybe" style={{ width: (r.maybe.length / n) * 100 + '%' }} />
          </div>
          <div className="who">
            {(
              [
                ['yes', S.can],
                ['maybe', S.maybe],
                ['no', S.cant],
                ['none', S.noans],
              ] as const
            )
              .filter(([k]) => r[k].length)
              .map(([k, l]) => (
                <span key={k} className={'who-g ' + k}>
                  <Mark v={k} />
                  {l}: {r[k].join(', ')}
                </span>
              ))}
          </div>
          {s.by && <span className="by">{S.suggested_by(s.by)}</span>}
        </li>
      ))}
    </ol>
  )
}

function Results({
  ev,
  onPick,
  go,
}: {
  ev: AdminView
  onPick: (s: Slot) => void
  go: (s: Screen) => void
}) {
  const { S, lang } = useWW()
  const [view, setView] = useState<'matrix' | 'ranked'>('matrix')
  const slots = ev.slots
  // The organizer always counts in the table, but banners wait until a guest has answered.
  const guests = ev.responses.filter((r) => !isOrg(ev, r.name))
  const anyGuest = guests.length > 0
  const all = findBest(slots, people(ev), ev.mustAll)
  const B = anyGuest ? all : { ...all, best: undefined, full: undefined }
  const curNew = slots.filter((s) => isNew(s, ev.round))
  const waiting = curNew.length > 0 && !guests.some((p) => curNew.some((s) => p.answers[s.id]))
  const needMore = ev.mustAll && !B.full && anyGuest
  const c = B.closest[0]
  const mine = myAnswers(ev)
  const todo = slots.filter((s) => !mine[s.id]).length
  return (
    <div className="results">
      <div className="res-head">
        <div>
          <span className="eyebrow">
            {S.results_title}
            {ev.round > 1 ? ' · ' + S.round(ev.round) : ''}
          </span>
          <h1 className="display sm">{ev.title}</h1>
          <p className="muted">
            {S.n_resp(guests.length)}
            {ev.deadline ? ' · ' + S.reply_by + ' ' + fmt.long(ev.deadline, lang) : ''}
          </p>
        </div>
        <div className="res-tools">
          <Seg
            value={view}
            onChange={setView}
            options={[
              { v: 'matrix', l: S.view_matrix },
              { v: 'ranked', l: S.view_ranked },
            ]}
          />
          {!needMore && (
            <button className="btn btn-sm btn-ghost" onClick={() => go('reask')}>
              {S.ask_again}
            </button>
          )}
          <button className="btn btn-sm btn-ghost" onClick={() => go('mine')}>
            {S.mine_btn}
          </button>
          <button className="btn btn-sm btn-ghost" onClick={() => go('created')}>
            {S.share_again}
          </button>
        </div>
      </div>
      {todo > 0 && (
        <div className="info-banner mine-banner">
          <div>
            <b>{S.mine_todo(todo)}</b>
            <p>{S.mine_todo_d}</p>
          </div>
          <button className="btn btn-sm btn-primary" onClick={() => go('mine')}>
            {S.mine_answer}
            {Ic.arrowR}
          </button>
        </div>
      )}
      {waiting && <div className="info-banner">{S.round_live(ev.round)}</div>}
      {needMore && !waiting && (
        <div className="reask-banner">
          <div className="rb-t">
            <b>{S.no_full(people(ev).length)}</b>
            {c && (
              <span>
                {S.closest}: <strong>{fmt.slot(c.s, lang)}</strong>. {S.missing}:{' '}
                {missingOf(c.r)
                  .map(([n]) => n)
                  .join(', ')}
              </span>
            )}
          </div>
          <button className="btn btn-primary" onClick={() => go('reask')}>
            {S.ask_again}
            {Ic.arrowR}
          </button>
        </div>
      )}
      {ev.mustAll && B.full && (
        <div className="full-banner">
          <Mark v="yes" />
          <b>
            {S.all_can}: {fmt.slot(B.full.s, lang)}
          </b>
          <button className="btn btn-sm btn-primary" onClick={() => onPick(B.full!.s)}>
            {S.pick_this}
          </button>
        </div>
      )}
      <section className="card card-flush">
        {view === 'matrix' ? (
          <Matrix people={people(ev)} slots={slots} round={ev.round} B={B} onPick={onPick} me={ev.organizer} />
        ) : (
          <ResultsRanked ev={ev} B={B} onPick={onPick} />
        )}
      </section>
      <Legend />
    </div>
  )
}

/** The organizer's own Yes / Maybe / No, same controls as the guests have. */
function Mine({
  ev,
  token,
  onDone,
  go,
}: {
  ev: AdminView
  token: string
  onDone: (v: AdminView) => void
  go: (s: Screen) => void
}) {
  const { S } = useWW()
  const [answers, setAnswers] = useState(() => myAnswers(ev))
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState(false)
  // Times still waiting for an answer first. Fixed when the screen opens so rows don't jump around.
  const [slots] = useState(() => {
    const had = myAnswers(ev)
    return newFirst(ev.slots, ev.round).sort((a, b) => (had[a.id] ? 1 : 0) - (had[b.id] ? 1 : 0))
  })
  const others = ev.responses.filter((r) => !isOrg(ev, r.name))
  const save = async () => {
    setBusy(true)
    setErr(false)
    const res = await setMyAnswers(ev.slug, token, answers).catch(() => null)
    setBusy(false)
    if (res?.ok) onDone(res.data)
    else setErr(true)
  }
  return (
    <div className="single">
      <section className="card card-wide card-xl">
        <span className="eyebrow">{ev.title}</span>
        <CardHead title={S.mine_title} sub={S.mine_sub} />
        <AnswerList
          slots={slots}
          answers={answers}
          onAnswer={(id, v) => setAnswers({ ...answers, [id]: v })}
          round={ev.round}
          yesCount={(s) => tally(s, others).yes.length}
        />
        {err && <p className="err">{S.err}</p>}
        <Actions onBack={() => go('results')} onNext={save} nextLabel={S.save} nextDisabled={busy} />
      </section>
    </div>
  )
}

function Reask({
  ev,
  token,
  onDone,
  go,
}: {
  ev: AdminView
  token: string
  onDone: (v: AdminView) => void
  go: (s: Screen) => void
}) {
  const { S } = useWW()
  const slots = ev.slots
  const B = findBest(slots, people(ev), ev.mustAll)
  const [removed, setRemoved] = useState<string[]>(() => {
    const closeIds = B.closest.map((x) => x.s.id)
    return slots.filter((s) => !closeIds.includes(s.id) && tally(s, people(ev)).no.length >= 2).map((s) => s.id)
  })
  const [fresh, setFresh] = useState<DraftSlot[]>([])
  const [note, setNote] = useState('')
  const [sugg, setSugg] = useState(true)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState(false)
  const next = ev.round + 1
  const send = async () => {
    setBusy(true)
    setErr(false)
    const res = await askAgain(ev.slug, token, {
      newSlots: fresh.map(({ date, time }) => ({ date, time })),
      removed,
      allowSuggest: sugg,
      note,
    }).catch(() => null)
    setBusy(false)
    if (res?.ok) onDone(res.data)
    else setErr(true)
  }
  return (
    <div className="single">
      <section className="card card-wide card-xl">
        <span className="eyebrow">{S.round(next)}</span>
        <CardHead title={S.reask_title} sub={S.reask_sub} />
        {B.closest.length > 0 && !B.full && (
          <div className="section">
            <span className="lbl">{S.blockers}</span>
            <ul className="close-list">
              {B.closest.map(({ s, r }) => (
                <li key={s.id}>
                  <SlotLabel s={s} />
                  <div className="avs">
                    {missingOf(r).map(([n, k]) => (
                      <span key={n} className={'av-n miss ' + k}>
                        <Mark v={k} />
                        {n}
                      </span>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="section">
          <span className="lbl">{S.prev_slots}</span>
          <ul className="slot-list prev-list">
            {slots.map((s) => {
              const r = tally(s, people(ev))
              const off = removed.includes(s.id)
              return (
                <li key={s.id} className={off ? 'off' : ''}>
                  <SlotLabel s={s} />
                  <span className="muted small pl-n">
                    {r.yes.length} {S.of} {people(ev).length}
                  </span>
                  <Seg
                    value={off ? 'rm' : 'keep'}
                    onChange={(v) => setRemoved(v === 'rm' ? [...removed, s.id] : removed.filter((x) => x !== s.id))}
                    options={[
                      { v: 'keep', l: S.keep },
                      { v: 'rm', l: S.remove },
                    ]}
                  />
                </li>
              )
            })}
          </ul>
        </div>
        <div className="section">
          <WhenCalendar slots={fresh} setSlots={setFresh} taken={slots} label={S.new_slots} />
        </div>
        <Toggle checked={sugg} onChange={setSugg} title={S.let_suggest} />
        <div className="fields section">
          <Field label={S.f_note} optional>
            <textarea
              className="inp"
              rows={2}
              maxLength={600}
              value={note}
              placeholder={S.f_round_note_ph}
              onChange={(e) => setNote(e.target.value)}
            />
          </Field>
        </div>
        {err && <p className="err">{S.err}</p>}
        <Actions
          onBack={() => go('results')}
          onNext={send}
          nextLabel={S.send_round(next)}
          nextDisabled={(fresh.length === 0 && !sugg) || busy}
        />
      </section>
    </div>
  )
}

function Finalize({
  ev,
  token,
  picked,
  links,
  onDone,
  go,
}: {
  ev: AdminView
  token: string
  picked: Slot
  links: Links
  onDone: (v: AdminView) => void
  go: (s: Screen) => void
}) {
  const { S, lang } = useWW()
  const [note, setNote] = useState('')
  const [notify, setNotify] = useState(true)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState(false)
  const r = tally(picked, people(ev))
  const nEmail = ev.notifyCount
  const confirm = async () => {
    setBusy(true)
    setErr(false)
    const res = await finalize(ev.slug, token, {
      slotId: picked.id,
      note,
      notify: ev.emailEnabled && nEmail > 0 && notify,
      lang,
      link: links.guest,
    }).catch(() => null)
    setBusy(false)
    if (res?.ok) onDone(res.data)
    else setErr(true)
  }
  return (
    <div className="single">
      <section className="card card-wide">
        <CardHead title={S.finalize_title} sub={S.finalize_sub} />
        <div className="final-slot">
          <SlotLabel s={picked} />
          <button className="btn btn-sm btn-quiet" onClick={() => go('results')}>
            {S.change}
          </button>
        </div>
        <div className="who-list">
          {(
            [
              ['yes', S.can],
              ['maybe', S.maybe],
              ['no', S.cant],
            ] as const
          ).map(
            ([k, l]) =>
              r[k].length > 0 && (
                <div key={k} className="who-row">
                  <span className={'who-l ' + k}>
                    <Mark v={k} />
                    {l}
                  </span>
                  <div className="avs">
                    {r[k].map((n) => (
                      <span key={n} className="av-n">
                        <Avatar name={n} size={26} />
                        {n}
                      </span>
                    ))}
                  </div>
                </div>
              ),
          )}
        </div>
        <div className="fields">
          <Field label={S.f_note} optional>
            <textarea
              className="inp"
              rows={2}
              maxLength={600}
              value={note}
              placeholder={S.f_note_ph}
              onChange={(e) => setNote(e.target.value)}
            />
          </Field>
        </div>
        {ev.emailEnabled && nEmail > 0 && <Toggle checked={notify} onChange={setNotify} title={S.notify(nEmail)} />}
        {err && <p className="err">{S.err}</p>}
        <Actions onBack={() => go('results')} onNext={confirm} nextLabel={S.confirm} nextDisabled={busy} />
      </section>
    </div>
  )
}

function Final({ ev, links, go }: { ev: AdminView; links: Links; go: (s: Screen) => void }) {
  const { S, lang } = useWW()
  if (!ev.final) return null
  const { slot: f, note } = ev.final
  return (
    <div className="single">
      <section className="card card-wide final">
        <span className="eyebrow">{ev.title}</span>
        <h1 className="display">{S.final_title}</h1>
        <div className="big-date">
          <span className="bd-day">{fmt.d(f.date).toLocaleDateString(fmt.loc(lang), { weekday: 'long' })}</span>
          <span className="bd-main">
            {fmt.d(f.date).toLocaleDateString(fmt.loc(lang), { day: 'numeric', month: 'long' })}
          </span>
          <span className="bd-time">
            {f.time || S.whole_day}
            {f.time && ev.dur ? ' · ' + durLabel(ev.dur, ev.durUnit, S) : ''}
          </span>
        </div>
        {note && <p className="note">{note}</p>}
        <p className="muted">{S.final_sub}</p>
        <CopyBox text={S.final_msg(ev.title, fmt.slot(f, lang))} />
        <div className="actions">
          <button className="btn btn-quiet" onClick={() => go('results')}>
            {Ic.arrowL}
            {S.back_results}
          </button>
          <button className="btn btn-ghost" onClick={() => downloadIcs(ev, f, note, links.guest)}>
            {Ic.cal}
            {S.add_cal}
          </button>
        </div>
      </section>
    </div>
  )
}

function OrganizerFlow({
  initial,
  token,
  links,
  isNew: justCreated,
}: {
  initial: AdminView
  token: string
  links: Links
  isNew: boolean
}) {
  const [ev, setEv] = useState(initial)
  const [screen, setScreen] = useState<Screen>(justCreated ? 'created' : initial.final ? 'final' : 'results')
  const [picked, setPicked] = useState<Slot | null>(null)
  const go = (s: Screen) => {
    setScreen(s)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Pick up new answers when the organizer comes back to the tab.
  useEffect(() => {
    const refresh = async () => {
      if (document.visibilityState !== 'visible') return
      const res = await getAdmin(initial.slug, token).catch(() => null)
      if (res?.ok) setEv(res.data)
    }
    document.addEventListener('visibilitychange', refresh)
    return () => document.removeEventListener('visibilitychange', refresh)
  }, [initial.slug, token])

  // Drop ?new=1 so a reload shows the responses.
  useEffect(() => {
    if (justCreated) window.history.replaceState(null, '', window.location.pathname)
  }, [justCreated])

  const onPick = (s: Slot) => {
    setPicked(s)
    go('finalize')
  }

  switch (screen) {
    case 'created':
      return <Created ev={ev} links={links} />
    case 'mine':
      return (
        <Mine
          ev={ev}
          token={token}
          go={go}
          onDone={(v) => {
            setEv(v)
            go('results')
          }}
        />
      )
    case 'reask':
      return (
        <Reask
          ev={ev}
          token={token}
          go={go}
          onDone={(v) => {
            setEv(v)
            go('results')
          }}
        />
      )
    case 'finalize':
      return picked ? (
        <Finalize
          ev={ev}
          token={token}
          picked={picked}
          links={links}
          go={go}
          onDone={(v) => {
            setEv(v)
            go('final')
          }}
        />
      ) : null
    case 'final':
      return <Final ev={ev} links={links} go={go} />
    default:
      return <Results ev={ev} onPick={onPick} go={go} />
  }
}

export default function OrganizerApp(props: { initial: AdminView; token: string; links: Links; isNew: boolean }) {
  return (
    <WhenworksShell role="organizer">
      <OrganizerFlow {...props} />
    </WhenworksShell>
  )
}
