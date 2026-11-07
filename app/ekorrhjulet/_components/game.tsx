'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { playAiTurn } from '../_lib/ai'
import { clock, current, endTurn, genitive, moveTo, newGame, perform, travelHours } from '../_lib/engine'
import { clearGame, loadGame, loadPrefs, saveGame, savePrefs, type Prefs } from '../_lib/save'
import { playMusic, setTheme, sfx, stopMusic, type Sfx } from '../_lib/sound'
import type { Action, GameState, PlaceId, PlayerSetup, Settings } from '../_lib/types'
import Board from './board'
import { OverDialog, PlaceDialog, Sidebar, SummaryDialog } from './panels'
import Start from './start'

export default function Game() {
  const [s, setS] = useState<GameState | null>(null)
  const [hasSave, setHasSave] = useState(false)
  const [prefs, setPrefs] = useState<Prefs>({ music: true, sfx: true })
  const [walking, setWalking] = useState<{ from: PlaceId; to: PlaceId; key: number } | null>(null)
  const [openPlace, setOpenPlace] = useState<PlaceId | null>(null)
  const [toasts, setToasts] = useState<{ id: number; text: string }[]>([])
  const [aiBusy, setAiBusy] = useState(false)
  const pending = useRef<GameState | null>(null)
  const toastId = useRef(0)

  useEffect(() => {
    setHasSave(!!loadGame())
    setPrefs(loadPrefs())
  }, [])

  useEffect(() => {
    if (s) saveGame(s)
  }, [s])

  useEffect(() => () => stopMusic(), [])

  const play = useCallback((x: Sfx) => sfx(x, prefs.sfx), [prefs.sfx])

  const toast = useCallback((lines: string[]) => {
    if (!lines.length) return
    const items = lines.map((text) => ({ id: ++toastId.current, text }))
    setToasts((t) => [...t, ...items].slice(-3))
    for (const it of items) setTimeout(() => setToasts((t) => t.filter((x) => x.id !== it.id)), 4500)
  }, [])

  const begin = (game: GameState) => {
    setS(game)
    setTheme(game.settings.board)
    playMusic(game.settings.board, prefs.music)
  }

  const onStart = (settings: Settings, players: PlayerSetup[]) => {
    clearGame()
    begin(newGame(settings, players))
    play('week')
  }

  const onContinue = () => {
    const g = loadGame()
    if (g) begin(g)
  }

  const togglePref = (k: keyof Prefs) => {
    const next = { ...prefs, [k]: !prefs[k] }
    setPrefs(next)
    savePrefs(next)
    if (k === 'music' && s) playMusic(s.settings.board, next.music)
  }

  // An AI player's turn starts as soon as the previous summary is closed.
  const runAi = useCallback(
    (state: GameState) => {
      setAiBusy(true)
      setTimeout(() => {
        const { state: after } = playAiTurn(state)
        setS(after)
        setAiBusy(false)
        play('week')
      }, 900)
    },
    [play],
  )

  if (!s) return <Start hasSave={hasSave} onContinue={onContinue} onStart={onStart} />

  const p = current(s)
  const busy = !!walking || !!openPlace || !!s.summary || aiBusy || s.over

  const pick = (id: PlaceId) => {
    if (busy) return
    play('click')
    if (p.location === id) {
      setOpenPlace(id)
      return
    }
    const h = travelHours(s, p, id)
    if (h > p.hoursLeft) {
      play('error')
      toast([`Du hinner inte dit (${h} h). Avsluta veckan i stället.`])
      return
    }
    pending.current = moveTo(s, id)
    setWalking({ from: p.location, to: id, key: Date.now() })
  }

  const walked = () => {
    const next = pending.current
    pending.current = null
    setWalking(null)
    if (!next) return
    setS(next)
    if (next.log.length) {
      play('thief')
      toast(next.log)
    }
    setOpenPlace(current(next).location)
  }

  const act = (a: Action) => {
    const before = current(s)
    const next = perform(s, a.id)
    const after = current(next)
    setS(next)
    toast(next.log)
    if (after.jobId !== before.jobId && after.jobId) play('job')
    else if (a.id.startsWith('work')) play('coin')
    else if (a.cost > 0 || a.id.startsWith('inst')) play('buy')
    else play('click')
    if (after.hoursLeft <= 0) {
      setOpenPlace(null)
      toast(['Veckan är slut. Dags att gå hem.'])
    }
  }

  const endWeek = () => {
    if (busy && !openPlace) return
    setOpenPlace(null)
    const next = endTurn(s)
    setS(next)
    play(next.over ? 'win' : 'week')
    toast(next.log)
  }

  const closeSummary = () => {
    if (!s.summary) return
    const next = { ...s, summary: null }
    setS(next)
    play('click')
    if (!next.over && current(next).ai) runAi(next)
  }

  const newGameClick = () => {
    clearGame()
    stopMusic()
    setS(null)
    setHasSave(false)
  }

  const pixel = s.settings.board === 'pixelstaden'
  const c = clock(p.hoursLeft)
  const lastMsg = toasts.at(-1)?.text

  return (
    <div className={`game theme-${s.settings.board}`}>
      <header className="hud">
        <span className="logo">{pixel ? 'EKORRHJULET' : 'Ekorrhjulet'}</span>
        <span className="pill">Vecka {s.week}{s.settings.weekCap ? ` av ${s.settings.weekCap}` : ''}</span>
        <span className="pill" style={{ ['--c' as string]: p.color }}>
          <span className="dot" style={{ background: p.color }} /> {genitive(p.name)} tur
        </span>
        <span className="hud-right">
          <button type="button" className="icon-btn" aria-pressed={prefs.music} onClick={() => togglePref('music')} title="Musik">
            {prefs.music ? 'Musik på' : 'Musik av'}
          </button>
          <button type="button" className="icon-btn" aria-pressed={prefs.sfx} onClick={() => togglePref('sfx')} title="Ljudeffekter">
            {prefs.sfx ? 'Ljud på' : 'Ljud av'}
          </button>
          <button type="button" className="icon-btn" onClick={newGameClick}>
            Nytt spel
          </button>
        </span>
      </header>

      <div className="play">
        <div className="board-wrap">
          <Board
            board={s.settings.board}
            era={s.settings.era}
            players={s.players}
            activeId={p.id}
            walking={walking}
            onWalked={walked}
            onPick={pick}
            onStep={() => play('step')}
            disabled={busy}
            center={
              pixel ? (
                <div className="pixel-dialog">
                  <strong>{aiBusy ? 'EGON' : 'BIRGITTA'}</strong>
                  <span>
                    {aiBusy
                      ? 'Egon springer runt i stan och köper möbler…'
                      : (lastMsg ?? (p.hoursLeft > 0 ? `${c.label}. ${p.hoursLeft} timmar kvar, ${p.name}. Vart vill du gå?` : 'Veckan är slut. Tryck på Avsluta veckan.'))}
                  </span>
                </div>
              ) : (
                <div className="flower-clock" aria-live="polite">
                  <strong>{p.hoursLeft} h</strong>
                  <span>{aiBusy ? 'Egon spelar…' : p.hoursLeft > 0 ? c.label : 'Veckan är slut'}</span>
                </div>
              )
            }
          />
          <div className="toasts" aria-live="polite">
            {toasts.map((t) => (
              <div key={t.id} className="toast">
                {t.text}
              </div>
            ))}
          </div>
        </div>
        <Sidebar s={s} p={p} onEndWeek={endWeek} busy={busy} />
      </div>

      {openPlace && <PlaceDialog s={s} place={openPlace} onAction={act} onClose={() => setOpenPlace(null)} />}
      {s.summary && <SummaryDialog s={s} onNext={closeSummary} />}
      {!s.summary && s.over && <OverDialog s={s} onNew={newGameClick} />}
    </div>
  )
}

