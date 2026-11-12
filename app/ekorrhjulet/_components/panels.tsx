'use client'

import { useEffect, useRef } from 'react'
import { CLOTHES_NAME, HOURS_PER_WEEK, HOUSING, PLACES, RENT_EVERY, placeName } from '../_lib/data'
import { actionsAt, clock, genitive, jobOf, kr, lycka, progress, status, trygghet, utveckling } from '../_lib/engine'
import type { Action, GameState, PlaceId, Player } from '../_lib/types'

/** A meter. In the sidebar it's one compact row (label · bar · value); `stacked` puts the label above. */
function Bar({ label, value, color, hint, stacked }: { label: string; value: number; color: string; hint?: string; stacked?: boolean }) {
  const v = Math.round(value)
  const track = (
    <div className="bar-track" role="progressbar" aria-label={label} aria-valuenow={v} aria-valuemin={0} aria-valuemax={100}>
      <div className="bar-fill" style={{ width: `${Math.max(0, Math.min(100, v))}%`, background: color }} />
    </div>
  )
  if (stacked)
    return (
      <div className="bar">
        <div className="bar-head">
          <span>{label}</span>
          <span>{hint ?? `${v} %`}</span>
        </div>
        {track}
      </div>
    )
  return (
    <div className="bar-row">
      <span className="bar-label">{label}</span>
      {track}
      <span className="bar-value">{hint ?? `${v} %`}</span>
    </div>
  )
}

/** Goals, meters and the player's situation, next to the board. */
export function Sidebar({ s, p, onEndWeek, busy }: { s: GameState; p: Player; onEndWeek?: () => void; busy: boolean }) {
  const pr = progress(s, p)
  const job = jobOf(p)
  const era = s.settings.era
  const rentIn = (RENT_EVERY - (s.week % RENT_EVERY)) % RENT_EVERY
  return (
    <aside className="side">
      <section className="card">
        <div className="who">
          <span className="avatar" style={{ background: p.color }}>
            {p.name.slice(0, 2).toUpperCase()}
          </span>
          <div>
            <strong>{p.name}</strong>
            <small>{job ? `${job.name[era]} · ${kr(p.wage)}/h` : 'Arbetssökande'}</small>
          </div>
        </div>
        <div className="money">
          <div>
            <small>Plånbok</small>
            <strong>{kr(p.cash)}</strong>
          </div>
          <div>
            <small>Banken</small>
            <strong>{kr(p.bank)}</strong>
          </div>
        </div>
        <Bar label={clock(p.hoursLeft).label} value={(p.hoursLeft / HOURS_PER_WEEK) * 100} color="var(--accent)" hint={`${p.hoursLeft} h kvar`} stacked />
      </section>

      <section className="card">
        <h3>Mina mål · {pr.total} %</h3>
        <Bar label="Pengar" value={pr.money} color="#8BD45E" />
        <Bar label="Utbildning" value={pr.education} color="#FFD23F" hint={`${p.degrees.length}/${s.settings.goals.education}`} />
        <Bar label="Karriär" value={pr.career} color="#6EC1FF" hint={`${job?.level ?? 0}/${s.settings.goals.career}`} />
        <Bar label="Relationer" value={pr.relations} color="#FF9EC7" />
        <Bar label="Lycka" value={pr.happiness} color="#B48CF2" />
      </section>

      <section className="card">
        <h3>Behovstrappan</h3>
        <Bar label="Hälsa" value={p.health} color={p.health < 40 ? '#E5484D' : '#4E9E3A'} hint={`${Math.round(p.health)}`} />
        <Bar label="Trygghet" value={trygghet(p)} color="#2B9C8F" hint={`${trygghet(p)}`} />
        <Bar label="Relationer" value={p.relations} color="#FF7AB0" hint={`${Math.round(p.relations)}${p.partner ? ' · partner' : ''}`} />
        <Bar label="Status" value={status(s, p)} color="#6EC1FF" hint={`${status(s, p)}`} />
        <Bar label="Utveckling" value={utveckling(p)} color="#FFB020" hint={`${utveckling(p)}`} />
        <Bar label="Lycka" value={lycka(s, p)} color="#B48CF2" hint={`${lycka(s, p)}`} />
      </section>

      <section className="card">
        <dl className="facts">
          <dt>Boende</dt>
          <dd>{HOUSING[p.housing].name}</dd>
          {p.housing !== 'soffa' && (
            <>
              <dt>Hyra</dt>
              <dd>
                {kr(p.rent)}/mån · {rentIn === 0 ? 'dras i helgen' : `om ${rentIn} v`}
              </dd>
            </>
          )}
          <dt>Mat hemma</dt>
          <dd className={p.foodWeeks ? '' : 'warn'}>{p.foodWeeks ? `${p.foodWeeks} v` : 'Tomt!'}</dd>
          <dt>Kläder</dt>
          <dd>
            {CLOTHES_NAME[p.clothes]}
            {p.clothes > 0 ? ` (${p.clothesWeeksLeft} v)` : ''}
          </dd>
          <dt>Erfarenhet</dt>
          <dd>
            {p.experience} v · pålitlighet {p.dependability}
          </dd>
          {p.inQueue && (
            <>
              <dt>Bostadskö</dt>
              <dd>{p.queuePoints} poäng</dd>
            </>
          )}
          {(p.loan > 0 || p.csnDebt > 0 || p.inkasso > 0) && (
            <>
              <dt>Skulder</dt>
              <dd className="warn">{[p.loan && `lån ${kr(p.loan)}`, p.csnDebt && `CSN ${kr(p.csnDebt)}`, p.inkasso && `inkasso ${kr(p.inkasso)}`].filter(Boolean).join(', ')}</dd>
            </>
          )}
        </dl>
      </section>

      {onEndWeek && (
        <button type="button" className="btn btn-big" onClick={onEndWeek} disabled={busy}>
          Avsluta veckan
        </button>
      )}
    </aside>
  )
}

function useFocusOnOpen() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    ref.current?.focus()
  }, [])
  return ref
}

/** The window that opens when you arrive at a place. */
export function PlaceDialog({ s, place, onAction, onClose }: { s: GameState; place: PlaceId; onAction: (a: Action) => void; onClose: () => void }) {
  const ref = useFocusOnOpen()
  const info = PLACES.find((x) => x.id === place)!
  const actions = actionsAt(s)
  const groups = [...new Set(actions.map((a) => a.group ?? ''))]
  const p = s.players[s.turn]
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])
  return (
    <div className="overlay" onClick={onClose}>
      <div className="dialog card" role="dialog" aria-modal="true" aria-labelledby="place-title" tabIndex={-1} ref={ref} onClick={(e) => e.stopPropagation()}>
        <header className="dialog-head">
          <div>
            <h2 id="place-title">{placeName(place, s.settings.era)}</h2>
            <p>{info.tagline}</p>
          </div>
          <div className="dialog-meta">
            <span className="pill">{p.hoursLeft} h kvar</span>
            <span className="pill">{kr(p.cash)}</span>
          </div>
        </header>
        <div className="actions">
          {groups.map((g) => (
            <div key={g} className="action-group">
              {g && <h3>{g}</h3>}
              {actions
                .filter((a) => (a.group ?? '') === g)
                .map((a) => (
                  <button key={a.id} type="button" className="action" disabled={!!a.disabled} onClick={() => onAction(a)}>
                    <span className="action-label">{a.label}</span>
                    <span className="action-cost">
                      {a.hours > 0 && <span>{a.hours} h</span>}
                      {a.cost > 0 && <span>{kr(a.cost)}</span>}
                    </span>
                    {(a.disabled || a.note) && <small className={a.disabled ? 'why' : ''}>{a.disabled ?? a.note}</small>}
                  </button>
                ))}
            </div>
          ))}
          {!actions.length && <p>Här finns inget att göra just nu.</p>}
        </div>
        <footer className="dialog-foot">
          <button type="button" className="btn" onClick={onClose}>
            Gå ut på gatan
          </button>
        </footer>
      </div>
    </div>
  )
}

/** Between turns: what happened over the weekend. */
export function SummaryDialog({ s, onNext }: { s: GameState; onNext: () => void }) {
  const ref = useFocusOnOpen()
  const sum = s.summary!
  const who = s.players[sum.playerId]
  const next = s.players[s.turn]
  const ranking = [...s.players].map((p) => ({ p, t: progress(s, p).total })).sort((a, b) => b.t - a.t)
  return (
    <div className="overlay">
      <div className="dialog card summary" role="dialog" aria-modal="true" aria-labelledby="sum-title" tabIndex={-1} ref={ref}>
        <p className="kicker">Söndag kväll · vecka {sum.week}</p>
        <h2 id="sum-title">{genitive(who.name)} helg</h2>
        {sum.quip && <p className="quip">”{sum.quip}”</p>}
        {sum.event && (
          <div className="event">
            <strong>{sum.event.title}</strong>
            <p>{sum.event.text}</p>
          </div>
        )}
        <ul className="lines">
          {sum.lines.map((l, i) => (
            <li key={i} className={l.tone ?? ''}>
              <span>{l.text}</span>
              {l.amount !== undefined && <strong>{l.amount > 0 ? `+${kr(l.amount)}` : kr(l.amount)}</strong>}
            </li>
          ))}
          {!sum.lines.length && <li>En lugn helg. Ingenting hände.</li>}
        </ul>
        <div className="ranking">
          {ranking.map(({ p, t }) => (
            <div key={p.id} className="rank-row">
              <span className="avatar small" style={{ background: p.color }}>
                {p.name.slice(0, 2).toUpperCase()}
              </span>
              <span className="rank-name">{p.name}</span>
              <div className="bar-track">
                <div className="bar-fill" style={{ width: `${t}%`, background: p.color }} />
              </div>
              <strong>{t} %</strong>
            </div>
          ))}
        </div>
        <button type="button" className="btn btn-big" onClick={onNext}>
          {s.over ? 'Se resultatet' : next.ai ? `${next.name} spelar sin vecka` : `${genitive(next.name)} tur · vecka ${s.week}`}
        </button>
      </div>
    </div>
  )
}

export function OverDialog({ s, onNew }: { s: GameState; onNew: () => void }) {
  const ref = useFocusOnOpen()
  const w = s.players.find((p) => p.id === s.winner)
  return (
    <div className="overlay">
      <div className="dialog card summary" role="dialog" aria-modal="true" aria-labelledby="over-title" tabIndex={-1} ref={ref}>
        <p className="kicker">Vecka {s.week}</p>
        <h2 id="over-title">{w ? `${w.name} vann livet!` : 'Spelet är slut'}</h2>
        <p>{w?.ai ? 'Egon och hans fjorton lampor står som segrare. Revansch?' : 'Ekorrhjulet stannar för en stund. Grattis!'}</p>
        <button type="button" className="btn btn-big" onClick={onNew}>
          Nytt spel
        </button>
      </div>
    </div>
  )
}
