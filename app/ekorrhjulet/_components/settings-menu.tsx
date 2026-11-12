'use client'

import { useEffect, useRef, useState } from 'react'
import type { Prefs } from '../_lib/save'

type Props = {
  prefs: Prefs
  onToggle: (k: keyof Prefs) => void
  onSave: () => boolean
  onSaveAndQuit: () => void
  onDownload: () => void
  onNewGame: () => void
}

/**
 * The cog in the top bar. The game also saves itself in the browser after every move; "Spara spelet"
 * does it right away and says so. "Nytt spel" asks once more before ending the game.
 */
export default function SettingsMenu({ prefs, onToggle, onSave, onSaveAndQuit, onDownload, onNewGame }: Props) {
  const [open, setOpen] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const [saved, setSaved] = useState<null | boolean>(null)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) {
      setConfirm(false)
      setSaved(null)
      return
    }
    const onDown = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false)
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className="settings" ref={ref}>
      <button type="button" className="icon-btn cog" aria-label="Meny" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(!open)}>
        <svg viewBox="0 0 16 16" width="24" height="24" shapeRendering="crispEdges" aria-hidden="true">
          <path
            fill="currentColor"
            d="M7 1h2v2h2V2h1v1h1v1h-1v2h2v2h-2v2h1v1h-1v1h-1v-1H9v2H7v-2H5v1H4v-1H3v-1h1V8H2V6h2V4H3V3h1V2h1v1h2zM7 6v1H6v2h1v1h2V9h1V7H9V6z"
          />
        </svg>
      </button>
      {open && (
        <div className="settings-menu" role="menu">
          <button type="button" role="menuitem" onClick={() => setSaved(onSave())}>
            Spara spelet
          </button>
          {saved !== null && (
            <p className={`settings-note${saved ? '' : ' warn'}`} role="status">
              {saved ? 'Sparat i den här webbläsaren.' : 'Webbläsaren tillåter inte sparning (privat läge?). Ladda ner en sparfil i stället.'}
            </p>
          )}
          <button type="button" role="menuitem" onClick={onSaveAndQuit}>
            Spara och avsluta
          </button>
          <button type="button" role="menuitem" onClick={onDownload}>
            Ladda ner sparfil
          </button>
          <div className="settings-sep" />
          <button type="button" role="menuitemcheckbox" aria-checked={prefs.music} onClick={() => onToggle('music')}>
            Musik: {prefs.music ? 'PÅ' : 'AV'}
          </button>
          <button type="button" role="menuitemcheckbox" aria-checked={prefs.sfx} onClick={() => onToggle('sfx')}>
            Ljud: {prefs.sfx ? 'PÅ' : 'AV'}
          </button>
          <div className="settings-sep" />
          {!confirm ? (
            <button type="button" role="menuitem" onClick={() => setConfirm(true)}>
              Nytt spel…
            </button>
          ) : (
            <div className="settings-confirm">
              <p>Avsluta spelet? Det sparade spelet raderas.</p>
              <button type="button" role="menuitem" className="danger" onClick={onNewGame}>
                Ja, avsluta
              </button>
              <button type="button" role="menuitem" onClick={() => setConfirm(false)}>
                Nej, spela vidare
              </button>
            </div>
          )}
          <p className="settings-note">Spelet sparas också automatiskt efter varje drag.</p>
        </div>
      )}
    </div>
  )
}
