'use client'

import { useEffect, useRef, useState } from 'react'
import { GOAL_PRESETS, PLAYER_COLORS } from '../_lib/data'
import { randomSeed } from '../_lib/rng'
import { loadBest, type Best, type Prefs } from '../_lib/save'
import type { Difficulty, Era, GameState, GoalPreset, PlayerSetup, Settings } from '../_lib/types'

type Props = {
  saved: GameState | null
  prefs: Prefs
  onTogglePref: (k: keyof Prefs) => void
  onContinue: () => void
  onStart: (s: Settings, players: PlayerSetup[]) => void
}

type View = 'menu' | 'new' | 'how'

/** Title screen in 1994 arcade style: a menu, "Bästa liv", and the new-game setup. */
export default function Start({ saved, prefs, onTogglePref, onContinue, onStart }: Props) {
  const [view, setView] = useState<View>('menu')
  const [best, setBest] = useState<Best[]>([])
  useEffect(() => setBest(loadBest()), [])

  return (
    <main className="theme-pixelstaden arcade">
      <section className="arcade-main">
        <img className="arcade-squirrel" src="/ekorrhjulet/ekorre.gif" alt="En ekorre springer i ett ekorrhjul" width={229} height={231} />
        <h1 className="arcade-title">EKORRHJULET</h1>
        <p className="arcade-sub">ETT LIVSSPEL FÖR 1–4 SPELARE</p>

        {view === 'menu' && (
          <>
            <button type="button" className="arcade-press" onClick={() => setView('new')}>
              TRYCK START
            </button>
            <Menu
              items={[
                { label: 'NYTT LIV', onClick: () => setView('new') },
                ...(saved ? [{ label: `FORTSÄTT (VECKA ${saved.week})`, onClick: onContinue }] : []),
                { label: 'HUR MAN SPELAR', onClick: () => setView('how') },
                { label: `MUSIK: ${prefs.music ? 'PÅ' : 'AV'}`, onClick: () => onTogglePref('music') },
                { label: `LJUD: ${prefs.sfx ? 'PÅ' : 'AV'}`, onClick: () => onTogglePref('sfx') },
              ]}
            />
            <div className="arcade-boxes">
              <div className="arcade-box arcade-box-gold">
                <p className="arcade-box-title">BÄSTA LIV</p>
                {best.length ? (
                  <ol className="arcade-scores">
                    {best.map((b, i) => (
                      <li key={i}>
                        <span>{i + 1}.</span>
                        <span>{b.name.toUpperCase()}</span>
                        <span className="arcade-weeks">{b.weeks} V</span>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="arcade-box-text">INGA LIV ÄN. BLI FÖRST!</p>
                )}
              </div>
              <div className="arcade-box arcade-box-blue">
                <p className="arcade-box-title">VÄLJ ÅR</p>
                <p className="arcade-box-text">1994 MED VIDEOBANDSPELARE ELLER NUTID MED SWISH. SAMMA HJUL, OLIKA SNURR.</p>
              </div>
            </div>
          </>
        )}

        {view === 'new' && <Setup onBack={() => setView('menu')} onStart={onStart} />}
        {view === 'how' && <How onBack={() => setView('menu')} />}
      </section>

      <div className="arcade-town" role="img" aria-label="Pixelstadens gator och hus" />
      <p className="arcade-foot">© 1994 EKORRSOFT · INSERT COIN · ELLER BARA KLICKA</p>
    </main>
  )
}

/** A menu with a ">" cursor that follows hover and focus; arrow keys move between items. */
function Menu({ items }: { items: { label: string; onClick: () => void }[] }) {
  const ref = useRef<HTMLElement>(null)
  useEffect(() => {
    ref.current?.querySelector('button')?.focus({ preventScroll: true })
  }, [])
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return
    e.preventDefault()
    const buttons = [...(ref.current?.querySelectorAll('button') ?? [])]
    const i = buttons.indexOf(document.activeElement as HTMLButtonElement)
    const next = (i + (e.key === 'ArrowDown' ? 1 : -1) + buttons.length) % buttons.length
    buttons[next]?.focus()
  }
  return (
    <nav className="arcade-menu" aria-label="Huvudmeny" ref={ref} onKeyDown={onKey}>
      {items.map((it) => (
        <button key={it.label} type="button" onClick={it.onClick}>
          {it.label}
        </button>
      ))}
    </nav>
  )
}

const choice = <T extends string>(value: T, current: T, set: (v: T) => void, label: string, sub?: string) => (
  <button type="button" className={`chip${value === current ? ' chip-on' : ''}`} aria-pressed={value === current} onClick={() => set(value)}>
    {label}
    {sub && <small>{sub}</small>}
  </button>
)

function Setup({ onBack, onStart }: { onBack: () => void; onStart: Props['onStart'] }) {
  const [era, setEra] = useState<Era>('1994')
  const [preset, setPreset] = useState<GoalPreset>('kort')
  const [names, setNames] = useState<string[]>(['Spelare 1'])
  const [egon, setEgon] = useState<'av' | 'latt' | 'svar'>('latt')
  const [advanced, setAdvanced] = useState(false)
  const [difficulty, setDifficulty] = useState<Difficulty>('normal')
  const [cap, setCap] = useState<string>('52')
  const [startCash, setStartCash] = useState(15000)
  const [seed, setSeed] = useState('')

  const start = () => {
    const humans = names.map((n, i) => ({ name: n.trim() || `Spelare ${i + 1}`, color: PLAYER_COLORS[i], ai: null }))
    const players: PlayerSetup[] = egon === 'av' ? humans : [...humans, { name: 'Egon', color: '#2F8F5B', ai: egon }]
    onStart(
      {
        board: 'pixelstaden', // Småstaden comes in a later version
        era,
        difficulty,
        goals: GOAL_PRESETS[preset],
        goalPreset: preset,
        weekCap: cap === 'inget' ? null : Number(cap),
        startCash,
        city: 'enkel',
        seed: seed ? Math.abs(Number(seed.replace(/\D/g, '')) || 1) : randomSeed(),
      },
      players,
    )
  }

  return (
    <div className="arcade-panel card">
      <h2>NYTT LIV</h2>

      <h3>Spelplan</h3>
      <div className="chips">
        <button type="button" className="chip chip-on" aria-pressed="true">
          Pixelstaden<small>16-bitars</small>
        </button>
        <button type="button" className="chip" disabled title="Kommer snart">
          Småstaden<small>Tecknad · kommer snart</small>
        </button>
      </div>

      <h3>Tidsepok</h3>
      <div className="chips">
        {choice('1994', era, setEra, '1994', 'Videobandspelare och 10 % ränta')}
        {choice('nutid', era, setEra, 'Nutid', 'Swish, elpris och influencers')}
      </div>

      <h3>Spelare</h3>
      <div className="players">
        {names.map((n, i) => (
          <div key={i} className="player-row">
            <span className="dot" style={{ background: PLAYER_COLORS[i] }} />
            <label className="sr" htmlFor={`pl${i}`}>
              Namn på spelare {i + 1}
            </label>
            <input id={`pl${i}`} value={n} maxLength={14} onChange={(e) => setNames(names.map((x, j) => (j === i ? e.target.value : x)))} />
            {names.length > 1 && (
              <button type="button" className="btn btn-quiet" onClick={() => setNames(names.filter((_, j) => j !== i))} aria-label={`Ta bort ${n}`}>
                Ta bort
              </button>
            )}
          </div>
        ))}
        {names.length < 4 && (
          <button type="button" className="btn btn-quiet" onClick={() => setNames([...names, `Spelare ${names.length + 1}`])}>
            + Lägg till spelare
          </button>
        )}
      </div>
      <div className="chips">
        <span className="label">Datorspelaren Egon:</span>
        {choice('av', egon, setEgon, 'Av')}
        {choice('latt', egon, setEgon, 'Lätt')}
        {choice('svar', egon, setEgon, 'Svår')}
      </div>

      <h3>Hur långt spel?</h3>
      <div className="chips">
        {choice('kort', preset, setPreset, 'Kort', '1 examen, karriärnivå 4')}
        {choice('mellan', preset, setPreset, 'Mellan', '2 examina, nivå 6')}
        {choice('lang', preset, setPreset, 'Lång', '4 examina, nivå 8')}
      </div>

      <button type="button" className="btn btn-quiet" aria-expanded={advanced} onClick={() => setAdvanced(!advanced)}>
        {advanced ? '▾' : '▸'} Avancerat
      </button>
      {advanced && (
        <div className="advanced">
          <div className="chips">
            <span className="label">Stad:</span>
            <button type="button" className="chip chip-on" aria-pressed="true">
              Enkel<small>10 platser</small>
            </button>
            <button type="button" className="chip" disabled title="Kommer snart">
              Full<small>20 platser · kommer snart</small>
            </button>
            <button type="button" className="chip" disabled title="Kommer snart">
              Anpassad<small>kommer snart</small>
            </button>
          </div>
          <div className="chips">
            <span className="label">Svårighet:</span>
            {choice('snall', difficulty, setDifficulty, 'Snäll')}
            {choice('normal', difficulty, setDifficulty, 'Normal')}
            {choice('elak', difficulty, setDifficulty, 'Elak')}
          </div>
          <div className="chips">
            <span className="label">Veckotak:</span>
            {choice('26', cap, setCap, '26')}
            {choice('52', cap, setCap, '52')}
            {choice('inget', cap, setCap, 'Inget')}
          </div>
          <div className="chips">
            <span className="label">Startkapital:</span>
            {[5000, 15000, 40000].map((v) => (
              <button key={v} type="button" className={`chip${startCash === v ? ' chip-on' : ''}`} aria-pressed={startCash === v} onClick={() => setStartCash(v)}>
                {v.toLocaleString('sv-SE')} kr
              </button>
            ))}
          </div>
          <div className="player-row">
            <label htmlFor="seed">Slumpfrö (valfritt, samma frö ger samma händelser):</label>
            <input id="seed" value={seed} inputMode="numeric" maxLength={9} onChange={(e) => setSeed(e.target.value)} placeholder="t.ex. 1994" />
          </div>
        </div>
      )}

      <div className="arcade-actions">
        <button type="button" className="btn" onClick={onBack}>
          Tillbaka
        </button>
        <button type="button" className="btn btn-big" onClick={start}>
          Starta livet
        </button>
      </div>
    </div>
  )
}

function How({ onBack }: { onBack: () => void }) {
  return (
    <div className="arcade-panel card">
      <h2>HUR MAN SPELAR</h2>
      <ol className="arcade-how">
        <li>Varje tur är en vecka med 60 timmar. Klicka på ett hus för att gå dit. Att gå tar tid.</li>
        <li>Inne i huset väljer du vad du gör: jobba, plugga, handla, träffa folk. Knapparna visar vad det kostar.</li>
        <li>Tryck Avsluta veckan när du är klar. I helgen dras hyra och mat, och något händer alltid.</li>
        <li>Håll koll på hälsan, maten och kontanterna. Långfingrade Leffe gillar fulla plånböcker.</li>
        <li>Först att nå alla fem målen vinner: pengar, utbildning, karriär, relationer och lycka.</li>
      </ol>
      <div className="arcade-actions">
        <button type="button" className="btn btn-big" onClick={onBack}>
          Tillbaka
        </button>
      </div>
    </div>
  )
}
