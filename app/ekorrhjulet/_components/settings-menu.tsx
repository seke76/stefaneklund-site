'use client'

import { useEffect, useRef, useState } from 'react'
import type { Prefs } from '../_lib/save'

/** The cog in the top bar: music, sound effects and "Nytt spel" (which asks once more before ending the game). */
export default function SettingsMenu({ prefs, onToggle, onNewGame }: { prefs: Prefs; onToggle: (k: keyof Prefs) => void; onNewGame: () => void }) {
  const [open, setOpen] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) {
      setConfirm(false)
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
      <button type="button" className="icon-btn cog" aria-label="Inställningar" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(!open)}>
        <svg viewBox="0 0 16 16" width="24" height="24" shapeRendering="crispEdges" aria-hidden="true">
          <path
            fill="currentColor"
            d="M7 1h2v2h2V2h1v1h1v1h-1v2h2v2h-2v2h1v1h-1v1h-1v-1H9v2H7v-2H5v1H4v-1H3v-1h1V8H2V6h2V4H3V3h1V2h1v1h2zM7 6v1H6v2h1v1h2V9h1V7H9V6z"
          />
        </svg>
      </button>
      {open && (
        <div className="settings-menu" role="menu">
          <button type="button" role="menuitemcheckbox" aria-checked={prefs.music} onClick={() => onToggle('music')}>
            Musik: {prefs.music ? 'PÅ' : 'AV'}
          </button>
          <button type="button" role="menuitemcheckbox" aria-checked={prefs.sfx} onClick={() => onToggle('sfx')}>
            Ljud: {prefs.sfx ? 'PÅ' : 'AV'}
          </button>
          {!confirm ? (
            <button type="button" role="menuitem" onClick={() => setConfirm(true)}>
              Nytt spel…
            </button>
          ) : (
            <div className="settings-confirm">
              <p>Avsluta spelet? Det kan inte fortsättas sen.</p>
              <button type="button" role="menuitem" className="danger" onClick={onNewGame}>
                Ja, avsluta
              </button>
              <button type="button" role="menuitem" onClick={() => setConfirm(false)}>
                Nej, spela vidare
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
