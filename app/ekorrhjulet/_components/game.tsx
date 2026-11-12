'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { playAiTurn } from '../_lib/ai'
import { clock, current, endTurn, genitive, moveTo, newGame, perform, progress, travelHours } from '../_lib/engine'
import { addBest, clearGame, downloadSave, loadGame, loadPrefs, parseSave, saveGame, savePrefs, type Prefs } from '../_lib/save'
import { birgittaGreeting, birgittaTip } from '../_lib/tips'
import { playMusic, setTheme, sfx, stopMusic, type Sfx } from '../_lib/sound'
import type { Action, GameState, PlaceId, PlayerSetup, Settings } from '../_lib/types'
import Birgitta from './birgitta'
import Board from './board'
import { OverDialog, PlaceDialog, Sidebar, SummaryDialog, rentDueIn } from './panels'
import SettingsMenu from './settings-menu'
import Start from './start'

export default function Game() {
  const [s, setS] = useState<GameState | null>(null)
  const [saved, setSaved] = useState<GameState | null>(null)
  const [prefs, setPrefs] = useState<Prefs>({ music: true, sfx: true })
  const [walking, setWalking] = useState<{ from: PlaceId; to: PlaceId; key: number } | null>(null)
  const [openPlace, setOpenPlace] = useState<PlaceId | null>(null)
  const [toasts, setToasts] = useState<{ id: number; text: string }[]>([])
  const [aiBusy, setAiBusy] = useState(false)
  const pending = useRef<GameState | null>(null)
  const toastId = useRef(0)

  useEffect(() => {
    setSaved(loadGame())
    setPrefs(loadPrefs())
  }, [])

  useEffect(() => {
    if (s) saveGame(s)
  }, [s])

  // A finished game with a human winner goes into "Bästa liv" on the title screen.
  const recorded = useRef(false)
  useEffect(() => {
    if (!s?.over) {
      recorded.current = false
      return
    }
    const w = s.players.find((p) => p.id === s.winner)
    if (!recorded.current && w && !w.ai && progress(s, w).total >= 100) addBest({ name: w.name, weeks: s.week, era: s.settings.era })
    recorded.current = true
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

  const onImport = async (file: File) => {
    const g = parseSave(await file.text())
    if (typeof g === 'string') return g
    saveGame(g)
    begin(g)
    return null
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

  // When the week's hours are used up, go straight to the weekend (after a short pause to read the last result).
  useEffect(() => {
    if (!s || s.summary || s.over || aiBusy || walking) return
    const p = current(s)
    if (p.ai || p.hoursLeft >= 0.5) return
    const t = setTimeout(() => {
      setOpenPlace(null)
      const next = endTurn(s)
      setS(next)
      play(next.over ? 'win' : 'week')
      toast(next.log)
    }, 1400)
    return () => clearTimeout(t)
  }, [s, walking, aiBusy, play, toast])

  // A player's week is "fresh" until they do something: Birgitta greets them instead of warning.
  const [fresh, setFresh] = useState(true)
  useEffect(() => setFresh(true), [s?.week, s?.turn])

  if (!s) return <Start saved={saved} prefs={prefs} onTogglePref={togglePref} onContinue={onContinue} onImport={onImport} onStart={onStart} />

  const p = current(s)
  const busy = !!walking || !!openPlace || !!s.summary || aiBusy || s.over

  const pick = (id: PlaceId) => {
    setFresh(false)
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

  const act = (a: Action, amount?: number) => {
    setFresh(false)
    const before = current(s)
    const next = perform(s, a.id, amount)
    const after = current(next)
    setS(next)
    toast(next.log)
    if (after.jobId !== before.jobId && after.jobId) play('job')
    else if (a.id.startsWith('work')) play('coin')
    else if (a.cost > 0 || a.id.startsWith('inst') || a.amount) play('buy')
    else play('click')
    if (after.hoursLeft < 0.5) toast(['Veckan är slut! Nu blir det helg.'])
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

  const saveAndQuit = () => {
    saveGame(s)
    stopMusic()
    setSaved(s)
    setS(null)
  }

  const newGameClick = () => {
    clearGame()
    stopMusic()
    setS(null)
    setSaved(null)
  }

  const pixel = s.settings.board === 'pixelstaden'
  const c = clock(p.hoursLeft)
  const tip = birgittaTip(s)

  return (
    <div className={`game theme-${s.settings.board}`}>
      <header className="hud">
        <span className="logo">{pixel ? 'EKORRHJULET' : 'Ekorrhjulet'}</span>
        <span className="pill">Vecka {s.week}{s.settings.weekCap ? ` av ${s.settings.weekCap}` : ''}</span>
        {p.housing !== 'soffa' && (
          <span className={`pill${rentDueIn(s) === 0 ? ' pill-warn' : ''}`}>{rentDueIn(s) === 0 ? 'Hyran dras i helgen' : `Hyran om ${rentDueIn(s)} v`}</span>
        )}
        <span className="pill" style={{ ['--c' as string]: p.color }}>
          <span className="dot" style={{ background: p.color }} /> {genitive(p.name)} tur
        </span>
        <span className="hud-right">
          <SettingsMenu prefs={prefs} onToggle={togglePref} onSave={() => saveGame(s)} onSaveAndQuit={saveAndQuit} onDownload={() => downloadSave(s)} onNewGame={newGameClick} />
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
                  {aiBusy ? <img className="portrait" src="/ekorrhjulet/ekorre.gif" alt="Egon" /> : <Birgitta />}
                  <div className="pixel-dialog-text" aria-live="polite">
                    <strong>{aiBusy ? 'EGON' : 'BIRGITTA'}</strong>
                    <span className="pixel-clock">{p.hoursLeft > 0 ? `${c.label} · ${p.hoursLeft} h kvar` : 'Veckan är slut'}</span>
                    {fresh && !aiBusy && <span className="greeting">{birgittaGreeting(s)}</span>}
                    <span className={tip.urgent && !fresh ? 'tip tip-urgent' : 'tip'}>
                      {aiBusy ? 'Egon springer runt i stan och köper möbler…' : tip.text}
                    </span>
                  </div>
                  <button type="button" className={`btn btn-big end-week${p.hoursLeft > 10 ? ' end-week-quiet' : ''}`} onClick={endWeek} disabled={busy}>
                    Avsluta veckan
                  </button>
                </div>
              ) : (
                <div className="flower-clock" aria-live="polite">
                  <strong>{p.hoursLeft} h</strong>
                  <span>{aiBusy ? 'Egon spelar…' : p.hoursLeft > 0 ? c.label : 'Veckan är slut'}</span>
                </div>
              )
            }
          />
          {openPlace && <PlaceDialog s={s} place={openPlace} onAction={act} onClose={() => setOpenPlace(null)} />}
          <div className="toasts" aria-live="polite">
            {toasts.map((t) => (
              <div key={t.id} className="toast">
                {t.text}
              </div>
            ))}
          </div>
        </div>
        <Sidebar key={p.id} s={s} p={p} onEndWeek={pixel ? undefined : endWeek} busy={busy} />
      </div>

      {s.summary && <SummaryDialog s={s} onNext={closeSummary} />}
      {!s.summary && s.over && <OverDialog s={s} onNew={newGameClick} />}
    </div>
  )
}

