'use client'

import { useState } from 'react'
import { GOAL_PRESETS, PLAYER_COLORS } from '../_lib/data'
import { randomSeed } from '../_lib/rng'
import type { BoardId, Difficulty, Era, GoalPreset, PlayerSetup, Settings } from '../_lib/types'

type Props = { hasSave: boolean; onContinue: () => void; onStart: (s: Settings, players: PlayerSetup[]) => void }

const choice = <T extends string>(value: T, current: T, set: (v: T) => void, label: string, sub?: string) => (
  <button type="button" className={`chip${value === current ? ' chip-on' : ''}`} aria-pressed={value === current} onClick={() => set(value)}>
    {label}
    {sub && <small>{sub}</small>}
  </button>
)

export default function Start({ hasSave, onContinue, onStart }: Props) {
  const [board, setBoard] = useState<BoardId>('smastaden')
  const [era, setEra] = useState<Era>('nutid')
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
        board,
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
    <main className="start">
      <section className="start-hero">
        <svg width="84" height="84" viewBox="0 0 24 24" fill="#FFD23F" stroke="#3A2E4F" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="2.4" fill="#FF7A59" />
          <path d="M12 2v7.6M12 14.4V22M2 12h7.6M14.4 12H22M5 5l5.3 5.3M13.7 13.7L19 19M19 5l-5.3 5.3M10.3 13.7L5 19" />
        </svg>
        <h1>Ekorrhjulet</h1>
        <p>Jobba. Plugga. Handla. Betala hyran. Upprepa vecka efter vecka och försök bli lycklig på vägen.</p>
        {hasSave && (
          <button type="button" className="btn btn-big" onClick={onContinue}>
            Fortsätt sparat spel
          </button>
        )}
      </section>

      <section className="start-form card">
        <h2>Spelplan</h2>
        <div className="chips">
          {choice('smastaden', board, setBoard, 'Småstaden', 'Tecknad')}
          {choice('pixelstaden', board, setBoard, 'Pixelstaden', '16-bitars')}
        </div>

        <h2>Tidsepok</h2>
        <div className="chips">
          {choice('nutid', era, setEra, 'Nutid', 'Swish, elpris och influencers')}
          {choice('1994', era, setEra, '1994', 'Videobandspelare och 10 % ränta')}
        </div>

        <h2>Spelare</h2>
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

        <h2>Hur långt spel?</h2>
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
              <button type="button" className="chip" disabled title="Kommer i nästa version">
                Full<small>20 platser · snart</small>
              </button>
              <button type="button" className="chip" disabled title="Kommer i nästa version">
                Anpassad<small>snart</small>
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

        <div className="start-go">
          <p>Först att nå alla fem målen vinner: pengar, utbildning, karriär, relationer och lycka.</p>
          <button type="button" className="btn btn-big" onClick={start}>
            Starta livet
          </button>
        </div>
      </section>
    </main>
  )
}
