'use client'

import { useEffect, useState } from 'react'
import { deal, freshState, load, maxSpies, MAX_PLAYERS, MIN_PLAYERS, save } from '../_lib/game'
import type { Result, Round, Saved, Settings, SpyChoice } from '../_lib/types'
import { CATEGORIES, categoryById } from '../_lib/words'
import Install from './install'

/** Counts a played round for the admin statistics (see app/api/hit). Nothing about the players is sent. */
const countRound = () => {
  try {
    navigator.sendBeacon?.('/api/hit', 'vl_round')
  } catch {}
}

export default function Game() {
  const [s, setS] = useState<Saved | null>(null)

  // Saved state lives in localStorage, so it can only be read after mounting.
  useEffect(() => {
    setS(load())
  }, [])
  useEffect(() => {
    if (s) save(s)
  }, [s])
  const screen = s?.screen.name
  const seat = s?.screen.name === 'pass' ? s.screen.seat : -1
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [screen, seat])

  if (!s) return <main className="vl" />

  const set = (patch: Partial<Saved>) => setS({ ...s, ...patch })
  const start = () => {
    const { round, used } = deal(s.settings, s.used)
    set({ round, used, screen: { name: 'pass', seat: 0 } })
    countRound()
  }
  const toSetup = () => set({ round: null, screen: { name: 'setup' } })
  const round = s.round

  return (
    <main className="vl">
      {s.screen.name === 'help' ? (
        <Help onBack={() => set({ screen: round ? { name: 'score' } : { name: 'setup' } })} />
      ) : s.screen.name === 'setup' || !round ? (
        <Setup
          settings={s.settings}
          results={s.results}
          onChange={(settings) => set({ settings })}
          onStart={start}
          onScore={() => set({ screen: { name: 'score' } })}
          onHelp={() => set({ screen: { name: 'help' } })}
        />
      ) : s.screen.name === 'pass' ? (
        <Pass
          key={s.screen.seat}
          round={round}
          seat={s.screen.seat}
          onNext={() => {
            const next = (s.screen.name === 'pass' ? s.screen.seat : 0) + 1
            set({ screen: next < round.names.length ? { name: 'pass', seat: next } : { name: 'play' } })
          }}
          onAbort={toSetup}
        />
      ) : s.screen.name === 'play' ? (
        <Play round={round} onReveal={() => set({ screen: { name: 'reveal' } })} onAbort={toSetup} />
      ) : s.screen.name === 'reveal' ? (
        <Reveal
          round={round}
          onResult={(winner) =>
            set({
              results: [
                {
                  word: round.word,
                  categoryName: categoryById(round.categoryId)?.name ?? '',
                  spyNames: round.spies.map((i) => round.names[i]),
                  winner,
                },
                ...s.results,
              ],
              screen: { name: 'score' },
            })
          }
        />
      ) : (
        <Score
          results={s.results}
          onNext={start}
          onSetup={toSetup}
          onReset={() => setS({ ...freshState(), settings: s.settings, used: s.used })}
        />
      )}
    </main>
  )
}

/* ───────────────────────── Setup ───────────────────────── */

function Setup({
  settings,
  results,
  onChange,
  onStart,
  onScore,
  onHelp,
}: {
  settings: Settings
  results: Result[]
  onChange: (s: Settings) => void
  onStart: () => void
  onScore: () => void
  onHelp: () => void
}) {
  const { players, names, categories, spies, mode, hint } = settings
  const [showNames, setShowNames] = useState(names.some((n) => n.trim()))
  const max = maxSpies(players)
  const change = (patch: Partial<Settings>) => onChange({ ...settings, ...patch })

  const setPlayers = (n: number) => {
    const p = Math.max(MIN_PLAYERS, Math.min(MAX_PLAYERS, n))
    // Keep a fixed spy count within what the new player count allows.
    change({ players: p, spies: spies !== 'random' && spies > maxSpies(p) ? (maxSpies(p) as SpyChoice) : spies })
  }
  const toggleCat = (id: string) =>
    change({ categories: categories.includes(id) ? categories.filter((c) => c !== id) : [...categories, id] })

  return (
    <>
      <header className="hero">
        <p className="cmd">&gt; ./vem_ljuger --nytt-spel</p>
        <h1>
          VEM LJUGER?<span className="cursor" />
        </h1>
        <p className="muted">Alla får samma hemliga ord – utom spionen. Hitta den som ljuger.</p>
        <button className="link" onClick={onHelp}>
          [?] Så spelar ni
        </button>
      </header>

      {results.length > 0 && <Tally results={results} onClick={onScore} />}

      <section>
        <h2>Spelare</h2>
        <div className="stepper">
          <button className="btn" onClick={() => setPlayers(players - 1)} disabled={players <= MIN_PLAYERS} aria-label="Färre spelare">
            −
          </button>
          <output aria-live="polite">{players}</output>
          <button className="btn" onClick={() => setPlayers(players + 1)} disabled={players >= MAX_PLAYERS} aria-label="Fler spelare">
            +
          </button>
        </div>
        <button className="link" onClick={() => setShowNames(!showNames)} aria-expanded={showNames}>
          {showNames ? '[−] Dölj namn' : '[+] Lägg till namn (valfritt)'}
        </button>
        {showNames && (
          <div className="names">
            {[...Array(players).keys()].map((i) => (
              <input
                key={i}
                value={names[i] ?? ''}
                placeholder={`Spelare ${i + 1}`}
                maxLength={20}
                autoComplete="off"
                enterKeyHint="next"
                aria-label={`Namn på spelare ${i + 1}`}
                onChange={(e) => {
                  const next = [...names]
                  while (next.length <= i) next.push('')
                  next[i] = e.target.value
                  change({ names: next })
                }}
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2>Kategori</h2>
        <div className="chips">
          <button className={`chip${categories.length === 0 ? ' on' : ''}`} onClick={() => change({ categories: [] })}>
            ? Slumpa
          </button>
          {CATEGORIES.map((c) => (
            <button key={c.id} className={`chip${categories.includes(c.id) ? ' on' : ''}`} onClick={() => toggleCat(c.id)}>
              {c.name}
            </button>
          ))}
        </div>
        <p className="hint">{categories.length > 1 ? 'Slumpas mellan de valda.' : categories.length ? '' : 'Slumpas bland alla.'}</p>
      </section>

      <section>
        <h2>Spioner</h2>
        <div className="seg">
          {([1, 2, 3] as const).map((n) => (
            <button key={n} className={spies === n ? 'on' : ''} onClick={() => change({ spies: n })} disabled={n > max}>
              {n}
            </button>
          ))}
          <button className={spies === 'random' ? 'on' : ''} onClick={() => change({ spies: 'random' })}>
            Slumpa
          </button>
        </div>
        <p className="hint">
          {spies === 'random'
            ? `1–${max} spioner beroende på antal spelare. Ingen vet hur många.`
            : max < 3
              ? `${max === 1 ? 'Fler spioner kräver minst 6 spelare.' : '3 spioner kräver minst 9 spelare.'}`
              : ''}
        </p>
      </section>

      <section>
        <h2>Läge</h2>
        <div className="seg">
          <button className={mode === 'classic' ? 'on' : ''} onClick={() => change({ mode: 'classic' })}>
            Klassiskt
          </button>
          <button className={mode === 'decoy' ? 'on' : ''} onClick={() => change({ mode: 'decoy' })}>
            Fel ord
          </button>
        </div>
        <p className="hint">
          {mode === 'classic'
            ? 'Spionen vet att hen är spion och ser bara kategorin.'
            : 'Spionen får ett liknande ord – och vet inte själv att hen är spionen.'}
        </p>
        {mode === 'classic' && (
          <label className="check">
            <input type="checkbox" checked={hint} onChange={(e) => change({ hint: e.target.checked })} />
            <span>Spionen får en ledtråd</span>
          </label>
        )}
      </section>

      <button className="btn primary big" onClick={onStart}>
        &gt; STARTA SPELET
      </button>

      <footer className="foot">
        <Install />
        <button className="link center" onClick={onHelp}>
          [?] Så kör du spelet på din telefon
        </button>
        <a href="/">← stefaneklund.se</a>
      </footer>
    </>
  )
}

/* ───────────────────── Pass the phone ───────────────────── */

function Pass({ round, seat, onNext, onAbort }: { round: Round; seat: number; onNext: () => void; onAbort: () => void }) {
  const [holding, setHolding] = useState(false)
  const [seen, setSeen] = useState(false)
  const name = round.names[seat]
  const last = seat === round.names.length - 1
  const show = () => {
    setHolding(true)
    setSeen(true)
  }
  const hide = () => setHolding(false)

  return (
    <>
      <Bar step={`${seat + 1}/${round.names.length}`} onAbort={onAbort} />
      <p className="cmd">&gt; ge telefonen till</p>
      <h1 className="who">{name}</h1>

      <div
        className={`hold${holding ? ' open' : ''}`}
        role="button"
        tabIndex={0}
        aria-label="Håll inne för att se din roll"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture?.(e.pointerId)
          show()
        }}
        onPointerUp={hide}
        onPointerCancel={hide}
        onContextMenu={(e) => e.preventDefault()}
        onKeyDown={(e) => (e.key === ' ' || e.key === 'Enter') && (e.preventDefault(), show())}
        onKeyUp={hide}
        onBlur={hide}
      >
        {holding ? <Role round={round} seat={seat} /> : <HoldPrompt seen={seen} />}
      </div>

      <button className="btn primary big" onClick={onNext} disabled={!seen || holding}>
        {last ? '> Alla har sett – börja spela' : `> Klar – ge till ${round.names[seat + 1]}`}
      </button>
      {!seen && <p className="hint center">Se till att ingen annan tittar.</p>}
    </>
  )
}

function HoldPrompt({ seen }: { seen: boolean }) {
  return (
    <div className="prompt">
      <div className="eye" aria-hidden>
        {seen ? '[ ✓ ]' : '[ ? ]'}
      </div>
      <p>{seen ? 'Håll inne igen för att se en gång till' : 'Håll inne för att se din roll'}</p>
    </div>
  )
}

function Role({ round, seat }: { round: Round; seat: number }) {
  const category = categoryById(round.categoryId)?.name
  const spy = round.spies.includes(seat)

  if (round.mode === 'classic' && spy) {
    const hint = round.hints[seat]
    return (
      <div className="role spy">
        <p className="label">Kategori</p>
        <p className="cat">{category}</p>
        <p className="big-word alert">DU ÄR SPIONEN</p>
        {hint && (
          <>
            <p className="label">Din ledtråd</p>
            <p className="clue">{hint}</p>
          </>
        )}
        <p className="small">Smält in och försök lista ut ordet.</p>
      </div>
    )
  }
  return (
    <div className="role">
      <p className="label">Kategori</p>
      <p className="cat">{category}</p>
      <p className="label">Ditt ord</p>
      <p className="big-word">{spy ? round.decoy : round.word}</p>
      <p className="small">
        {round.mode === 'decoy' ? 'Någon har ett annat ord. Kanske du?' : 'Någon av er är spion och vet inte ordet.'}
      </p>
    </div>
  )
}

/* ───────────────────────── Play ───────────────────────── */

function Play({ round, onReveal, onAbort }: { round: Round; onReveal: () => void; onAbort: () => void }) {
  const [sure, setSure] = useState(false)
  const n = round.spies.length
  const who = round.mode === 'classic' ? (n === 1 ? 'spion' : 'spioner') : 'spelare'
  return (
    <>
      <Bar step="Spelet pågår" onAbort={onAbort} />
      <p className="cmd">&gt; lägg ner telefonen</p>
      <h1>Nu kör ni!</h1>

      <dl className="facts">
        <dt>Kategori</dt>
        <dd>{categoryById(round.categoryId)?.name}</dd>
        <dt>Börjar</dt>
        <dd>{round.names[round.starter]}, sedan medsols</dd>
        <dt>{round.mode === 'classic' ? 'Spioner' : 'Fel ord'}</dt>
        <dd>{round.secretCount ? 'Hemligt' : `${n} ${who}`}</dd>
      </dl>

      <ol className="rules">
        <li>Säg ett ord eller en kort mening om ordet, en i taget.</li>
        <li>Inte för tydligt – då listar spionen ut det. Inte för luddigt – då blir du misstänkt.</li>
        <li>Ett eller två varv, sedan pekar alla samtidigt på den de misstänker.</li>
        {round.mode === 'classic' ? (
          <li>Åker spionen fast får hen gissa ordet. Rätt gissning – spionen vinner ändå.</li>
        ) : (
          <li>Den med fel ord vet inte om det. Det kan vara du.</li>
        )}
      </ol>

      <button
        className={`btn big${sure ? ' primary' : ''}`}
        onClick={() => (sure ? onReveal() : setSure(true))}
        onBlur={() => setSure(false)}
      >
        {sure ? '> Säker? Tryck igen' : '> Visa vem som ljög'}
      </button>
    </>
  )
}

/* ───────────────────────── Reveal ───────────────────────── */

function Reveal({ round, onResult }: { round: Round; onResult: (w: Result['winner']) => void }) {
  const names = round.spies.map((i) => round.names[i])
  const many = names.length > 1
  return (
    <>
      <p className="cmd">&gt; cat hemlighet.txt</p>
      <div className="reveal">
        <p className="label">Ordet var</p>
        <p className="big-word">{round.word}</p>
        <p className="label">{round.mode === 'classic' ? (many ? 'Spionerna' : 'Spionen') : 'Fel ord hade'}</p>
        <p className="big-word alert">{names.join(', ')}</p>
        {round.mode === 'decoy' && <p className="small">med ordet "{round.decoy}"</p>}
        {round.mode === 'classic' &&
          round.spies.map((i) =>
            round.hints[i] ? (
              <p className="small" key={i}>
                {many ? `${round.names[i]}s ledtråd` : 'Ledtråden'}: {round.hints[i]}
              </p>
            ) : null,
          )}
      </div>

      <h2>Hur gick det?</h2>
      <div className="outcome">
        <button className="btn big" onClick={() => onResult('group')}>
          Gruppen vann
          <small>{many ? 'Alla spioner åkte fast' : 'Spionen åkte fast'}</small>
        </button>
        <button className="btn big" onClick={() => onResult('spy')}>
          {many ? 'Spionerna vann' : 'Spionen vann'}
          <small>{round.mode === 'classic' ? 'Klarade sig eller gissade ordet' : 'Klarade sig'}</small>
        </button>
      </div>
    </>
  )
}

/* ───────────────────────── Score ───────────────────────── */

function Tally({ results, onClick }: { results: Result[]; onClick?: () => void }) {
  const group = results.filter((r) => r.winner === 'group').length
  const spy = results.length - group
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag className="tally" onClick={onClick}>
      <span>
        <b>{group}</b> Gruppen
      </span>
      <span className="vs">–</span>
      <span>
        Spionen <b>{spy}</b>
      </span>
    </Tag>
  )
}

function Score({
  results,
  onNext,
  onSetup,
  onReset,
}: {
  results: Result[]
  onNext: () => void
  onSetup: () => void
  onReset: () => void
}) {
  const [sure, setSure] = useState(false)
  return (
    <>
      <p className="cmd">&gt; cat poang.log</p>
      <h1>Poäng</h1>
      <Tally results={results} />

      <button className="btn primary big" onClick={onNext}>
        &gt; NY RUNDA
      </button>
      <button className="btn big" onClick={onSetup}>
        Ändra inställningar
      </button>

      {results.length > 0 && (
        <ol className="log" reversed>
          {results.map((r, i) => (
            <li key={results.length - i}>
              <span className={r.winner === 'spy' ? 'alert' : ''}>{r.winner === 'spy' ? 'SPION' : 'GRUPP'}</span>
              <span>
                {r.word} <span className="muted">· {r.spyNames.join(', ')}</span>
              </span>
            </li>
          ))}
        </ol>
      )}

      {results.length > 0 && (
        <button className="link danger" onClick={() => (sure ? onReset() : setSure(true))} onBlur={() => setSure(false)}>
          {sure ? '[!] Säker? Tryck igen för att nollställa' : '[x] Nollställ poängen'}
        </button>
      )}
    </>
  )
}

/* ───────────────────────── Help ───────────────────────── */

function Help({ onBack }: { onBack: () => void }) {
  return (
    <>
      <div className="bar">
        <span>Instruktion</span>
        <button className="link" onClick={onBack}>
          [← tillbaka]
        </button>
      </div>
      <p className="cmd">&gt; man vem_ljuger</p>
      <h1>Så kör du spelet på din telefon</h1>
      <p className="muted">
        Ni behöver en telefon och 3–12 personer. Ingen app att ladda ner från en butik, inget konto.
      </p>

      <section className="help">
        <h2>1. Öppna spelet</h2>
        <p>
          Gå till <b>stefaneklund.se/vemljuger</b> i telefonens webbläsare.
        </p>
      </section>

      <section className="help">
        <h2>2. Installera som app (valfritt)</h2>
        <p>Då får spelet en egen ikon, öppnas i helskärm och fungerar utan internet.</p>
        <h3>Android (Chrome)</h3>
        <ol>
          <li>
            Tryck på <b>Installera som app</b> längst ner på startskärmen i spelet.
          </li>
          <li>
            Syns inte knappen: tryck på <b>⋮</b> uppe till höger och välj <b>Installera app</b> eller{' '}
            <b>Lägg till på startskärmen</b>, och sedan <b>Installera</b>.
          </li>
        </ol>
        <h3>iPhone (Safari)</h3>
        <ol>
          <li>
            Tryck på <b>Dela</b> (rutan med en pil uppåt).
          </li>
          <li>
            Välj <b>Lägg till på hemskärmen</b> och tryck <b>Lägg till</b>.
          </li>
        </ol>
        <p className="small">
          Ikonen är ett grönt <b>?_</b>. Har du väl öppnat spelet en gång fungerar det även i flygplansläge.
        </p>
        <div className="help-install">
          <Install />
        </div>
      </section>

      <section className="help">
        <h2>3. Ställ in spelet</h2>
        <ul>
          <li>
            <b>Spelare:</b> hur många ni är. Namn är frivilliga.
          </li>
          <li>
            <b>Kategori:</b> välj en eller flera, eller låt den slumpas.
          </li>
          <li>
            <b>Spioner:</b> 1–3, eller <i>Slumpa</i> så att ingen vet hur många.
          </li>
          <li>
            <b>Läge:</b> <i>Klassiskt</i> (spionen vet om det och får en ledtråd) eller <i>Fel ord</i> (spionen
            får ett liknande ord och vet inte själv att hen är spion).
          </li>
        </ul>
        <p>
          Tryck på <b>Starta spelet</b>.
        </p>
      </section>

      <section className="help">
        <h2>4. Dela ut rollerna</h2>
        <ol>
          <li>Ge telefonen till personen vars namn står på skärmen.</li>
          <li>
            <b>Håll fingret på rutan</b> för att se din roll. Släpp, så döljs den.
          </li>
          <li>
            Tryck <b>Klar</b> och lämna över till nästa.
          </li>
        </ol>
        <p className="small">Vänd skärmen bort från de andra medan du tittar.</p>
      </section>

      <section className="help">
        <h2>5. Spela</h2>
        <ol>
          <li>Lägg ner telefonen. Skärmen visar vem som börjar.</li>
          <li>Säg ett ord eller en kort mening om ordet, en i taget, medsols.</li>
          <li>Inte för tydligt, då listar spionen ut ordet. Inte för luddigt, då blir du misstänkt.</li>
          <li>Efter ett eller två varv pekar alla samtidigt på den de tror ljuger.</li>
          <li>I det klassiska läget får spionen gissa ordet om hen åker fast. Rätt gissning, och spionen vinner ändå.</li>
        </ol>
      </section>

      <section className="help">
        <h2>6. Avslöja och räkna poäng</h2>
        <ol>
          <li>
            Tryck <b>Visa vem som ljög</b> och sedan en gång till för att bekräfta.
          </li>
          <li>
            Välj <b>Gruppen vann</b> eller <b>Spionen vann</b>.
          </li>
          <li>
            Tryck <b>Ny runda</b>. Poängen räknas ihop under hela kvällen.
          </li>
        </ol>
      </section>

      <section className="help">
        <h2>Bra att veta</h2>
        <ul>
          <li>Låses skärmen eller laddas sidan om fortsätter spelet där ni var.</li>
          <li>
            <b>[x]</b> uppe till höger avbryter en runda.
          </li>
          <li>Samma ord kommer inte igen förrän alla ord i kategorin har spelats.</li>
          <li>Allt sparas bara i din telefon.</li>
        </ul>
      </section>

      <button className="btn primary big" onClick={onBack}>
        &gt; Tillbaka till spelet
      </button>
    </>
  )
}

/* ───────────────────────── Shared ───────────────────────── */

function Bar({ step, onAbort }: { step: string; onAbort: () => void }) {
  const [sure, setSure] = useState(false)
  return (
    <div className="bar">
      <span>{step}</span>
      <button className="link" onClick={() => (sure ? onAbort() : setSure(true))} onBlur={() => setSure(false)}>
        {sure ? 'Avbryt rundan?' : '[x]'}
      </button>
    </div>
  )
}
