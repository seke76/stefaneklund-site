'use client'

import { useEffect, useRef, useState } from 'react'
import { CLOTHES_NAME, HOURS_PER_WEEK, PLACES, RENT_EVERY, placeName } from '../_lib/data'
import { actionsAt, clock, genitive, jobOf, kr, lycka, progress, status, trygghet, utveckling } from '../_lib/engine'
import type { Action, GameState, PlaceId, Player } from '../_lib/types'

/** Shows how much a meter just moved, for a couple of seconds. The sidebar is re-mounted per player. */
function useDelta(v: number) {
  const prev = useRef(v)
  const [d, setD] = useState<{ n: number; key: number } | null>(null)
  useEffect(() => {
    const n = v - prev.current
    prev.current = v
    if (!n) return
    setD({ n, key: Date.now() })
    const t = setTimeout(() => setD(null), 2400)
    return () => clearTimeout(t)
  }, [v])
  return d
}

/** A meter. In the sidebar it's one compact row (label · bar · value); `stacked` puts the label above. */
function Bar({ label, value, color, hint, stacked }: { label: string; value: number; color: string; hint?: string; stacked?: boolean }) {
  const v = Math.round(value)
  const delta = useDelta(v)
  const track = (
    <div className={`bar-track${delta ? ' bar-changed' : ''}`} role="progressbar" aria-label={label} aria-valuenow={v} aria-valuemin={0} aria-valuemax={100}>
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
      {delta && (
        <span key={delta.key} className={`bar-delta ${delta.n > 0 ? 'up' : 'down'}`} aria-hidden="true">
          {delta.n > 0 ? `+${delta.n}` : `−${-delta.n}`}
        </span>
      )}
    </div>
  )
}

const HOUSING_SHORT = { andrahand: 'Andrahand', hyresratt: 'Hyresrätt', bostadsratt: 'Bostadsrätt', soffa: 'Kompisens soffa' } as const

/** When the next rent is due, for the top bar: 0 = this weekend. */
export const rentDueIn = (s: GameState) => (RENT_EVERY - (s.week % RENT_EVERY)) % RENT_EVERY

/** Goals, meters and the player's situation, next to the board. */
export function Sidebar({ s, p, onEndWeek, busy }: { s: GameState; p: Player; onEndWeek?: () => void; busy: boolean }) {
  const pr = progress(s, p)
  const job = jobOf(p)
  const era = s.settings.era
  return (
    <aside className="side">
      <section className="card">
        <div className="who">
          <strong className="who-name">
            <span className="dot" style={{ background: p.color }} /> {p.name}
          </strong>
          <span className="job-title">{job ? `${job.name[era]} · ${kr(p.wage)}/h` : 'Arbetssökande'}</span>
          <small>{job ? `Jobbar på ${placeName(job.place, era)}` : 'Sök jobb på Jobbtorget'}</small>
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
          <dd>
            {HOUSING_SHORT[p.housing]}
            {p.housing !== 'soffa' && `, ${p.rent.toLocaleString('sv-SE')}/mån`}
          </dd>
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
export function PlaceDialog({ s, place, onAction, onClose }: { s: GameState; place: PlaceId; onAction: (a: Action, amount?: number) => void; onClose: () => void }) {
  const ref = useFocusOnOpen()
  const [asking, setAsking] = useState<Action | null>(null)
  const info = PLACES.find((x) => x.id === place)!
  const p = s.players[s.turn]
  // Pair "pay" and "borrow" choices for the same thing into one card (course + CSN, item + instalments).
  const cards: { group: string; main: Action; alt?: Action }[] = []
  for (const a of actionsAt(s)) {
    const [verb, arg] = a.id.split(':')
    const partner = verb === 'csn' ? `enroll:${arg}` : verb === 'inst' ? `buy:${arg}` : null
    const card = partner && cards.find((c) => c.main.id === partner)
    if (card) card.alt = a
    else cards.push({ group: a.group ?? '', main: a })
  }
  const groups = [...new Set(cards.map((c) => c.group))]
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && (asking ? setAsking(null) : onClose())
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, asking])
  const choose = (a: Action) => (a.amount ? setAsking(a) : onAction(a))
  return (
    <div className="overlay" onClick={onClose}>
      <div className="dialog place card" role="dialog" aria-modal="true" aria-labelledby="place-title" tabIndex={-1} ref={ref} onClick={(e) => e.stopPropagation()}>
        <header className="dialog-head">
          <div>
            <h2 id="place-title">{placeName(place, s.settings.era)}</h2>
            <p>{info.tagline}</p>
          </div>
          <div className="dialog-meta">
            <span className="pill">{p.hoursLeft} h kvar</span>
            <span className="pill">Plånbok {kr(p.cash)}</span>
            {place === 'banken' && <span className="pill">Banken {kr(p.bank)}</span>}
          </div>
        </header>
        {asking && (
          <AmountPicker
            key={asking.id}
            action={actionsAt(s).find((x) => x.id === asking.id) ?? asking}
            p={p}
            onDone={(n) => {
              onAction(asking, n)
              setAsking(null)
            }}
            onCancel={() => setAsking(null)}
          />
        )}
        <div className="actions" hidden={!!asking}>
          {groups.map((g) => (
            <section key={g} className="action-group">
              {g && <h3>{g}</h3>}
              <div className="action-grid">
                {cards
                  .filter((c) => c.group === g)
                  .map(({ main, alt }) =>
                    alt ? (
                      <div key={main.id} className={`action action-pair${main.disabled && alt.disabled ? ' is-disabled' : ''}`}>
                        <span className="action-label">{main.label}</span>
                        <span className="action-cost">{main.hours > 0 && <span>{main.hours} h</span>}</span>
                        <small className={main.disabled && alt.disabled ? 'why' : ''}>
                          {main.disabled && main.disabled === alt.disabled
                            ? main.disabled
                            : [main.note, main.disabled?.toLowerCase(), alt.disabled && `${alt.short?.split(' ')[0].toLowerCase()}: ${alt.disabled.toLowerCase()}`]
                                .filter(Boolean)
                                .join(' · ')}
                        </small>
                        <div className="pair">
                          {[main, alt].map((a) => (
                            <button key={a.id} type="button" disabled={!!a.disabled} onClick={() => choose(a)} title={a.disabled ?? a.note}>
                              {a.short ?? a.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <button key={main.id} type="button" className="action" disabled={!!main.disabled} onClick={() => choose(main)}>
                        <span className="action-label">{main.label}</span>
                        <span className="action-cost">
                          {main.hours > 0 && <span>{main.hours} h</span>}
                          {main.cost > 0 && <span>{kr(main.cost)}</span>}
                          {main.amount && !main.disabled && <span>Välj belopp</span>}
                        </span>
                        {(main.disabled || main.note) && <small className={main.disabled ? 'why' : ''}>{main.disabled ?? main.note}</small>}
                      </button>
                    ),
                  )}
              </div>
            </section>
          ))}
          {!cards.length && <p>Här finns inget att göra just nu.</p>}
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

/** Asks how much: quick amounts, "Allt", or an exact number. Shows wallet and bank while choosing. */
function AmountPicker({ action, p, onDone, onCancel }: { action: Action; p: Player; onDone: (n: number) => void; onCancel: () => void }) {
  const max = action.amount?.max ?? 0
  const step = action.amount?.step ?? 100
  const [n, setN] = useState(Math.min(max, step * 10))
  const inputRef = useRef<HTMLInputElement>(null)
  useEffect(() => {
    inputRef.current?.focus()
    inputRef.current?.select()
  }, [])
  const quick = [100, 500, 1000, 5000, 10000, 50000].map((q) => Math.max(step, Math.round(q / step) * step)).filter((q, i, xs) => q < max && xs.indexOf(q) === i)
  const valid = n >= 1 && n <= max
  return (
    <form
      className="amount"
      onSubmit={(e) => {
        e.preventDefault()
        if (valid) onDone(n)
      }}
    >
      <h3>{action.label}</h3>
      <div className="amount-have">
        <span>
          Plånbok <strong>{kr(p.cash)}</strong>
        </span>
        <span>
          Banken <strong>{kr(p.bank)}</strong>
        </span>
        {p.loan > 0 && (
          <span>
            Lån <strong>{kr(p.loan)}</strong>
          </span>
        )}
      </div>
      {action.note && <p className="amount-note">{action.note}</p>}
      <div className="amount-quick">
        {quick.map((q) => (
          <button key={q} type="button" className={n === q ? 'on' : ''} onClick={() => setN(q)}>
            {kr(q)}
          </button>
        ))}
        <button type="button" className={n === max ? 'on' : ''} onClick={() => setN(max)}>
          Allt ({kr(max)})
        </button>
      </div>
      <label className="amount-input">
        <span>Eget belopp</span>
        <input
          ref={inputRef}
          type="number"
          inputMode="numeric"
          min={1}
          max={max}
          step={1}
          value={Number.isFinite(n) ? n : ''}
          onChange={(e) => setN(Math.floor(Number(e.target.value)))}
        />
        <span>kr</span>
      </label>
      <input className="amount-slider" type="range" min={0} max={max} step={step} value={Math.min(n, max)} onChange={(e) => setN(Number(e.target.value))} aria-label="Belopp" />
      {!valid && <p className="amount-error">Välj ett belopp mellan 1 kr och {kr(max)}.</p>}
      <div className="amount-actions">
        <button type="button" className="btn" onClick={onCancel}>
          Tillbaka
        </button>
        <button type="submit" className="btn btn-big" disabled={!valid}>
          {action.label} · {valid ? kr(n) : '–'}
        </button>
      </div>
    </form>
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
