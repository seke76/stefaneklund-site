'use client'

import { useEffect, useRef, useState } from 'react'
import { EXERCISES, neighbours } from '../_lib/exercises'
import type { Exercise, Focus } from '../_lib/types'
import Figure from './figure'
import { useBdy } from './shell'

type Filter = 'all' | Exclude<Focus, 'full'> | 'warmup'
const FILTERS: Filter[] = ['all', 'legs', 'upper', 'core', 'power', 'runner', 'warmup']

const matches = (e: Exercise, f: Filter) =>
  f === 'all' ? true : f === 'warmup' ? e.role === 'warmup' : e.role === 'main' && e.focus.includes(f)

/** Level as three dots. */
export function Dots({ level }: { level: number }) {
  return (
    <span className="dots" aria-label={`${level}/3`}>
      {[1, 2, 3].map((i) => (
        <i key={i} className={i <= level ? 'on' : ''} />
      ))}
    </span>
  )
}

function Badges({ ex }: { ex: Exercise }) {
  const { S } = useBdy()
  return (
    <>
      <span className="badge">
        <Dots level={ex.level} /> {S.level[ex.level]}
      </span>
      {ex.metric === 'hold' && <span className="badge">{S.hold}</span>}
      {ex.sides === 'each' && <span className="badge">{S.sides_each}</span>}
      {ex.needs && <span className="badge ac">{ex.needs === 'bar' ? S.needs_bar : S.needs_step}</span>}
      {ex.tempo && <span className="badge">{ex.tempo === 'slow' ? S.tempo_slow : S.tempo_explosive}</span>}
    </>
  )
}

/** Card that only animates while it is on screen. */
function Card({ ex, onOpen }: { ex: Exercise; onOpen: () => void }) {
  const { lang, S } = useBdy()
  const ref = useRef<HTMLButtonElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: '80px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return (
    <button ref={ref} className="ex-card" onClick={onOpen}>
      <div className="fig-wrap">
        <Figure ex={ex} playing={visible} />
      </div>
      <h3>{ex.name[lang]}</h3>
      <div className="meta">
        <span className="badge">
          <Dots level={ex.level} />
        </span>
        {ex.needs && <span className="badge ac">{ex.needs === 'bar' ? S.needs_bar : S.needs_step}</span>}
      </div>
    </button>
  )
}

function Sheet({ ex, onClose, onPick }: { ex: Exercise; onClose: () => void; onPick: (e: Exercise) => void }) {
  const { lang, S } = useBdy()
  const { easier, harder } = neighbours(ex)
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [onClose])
  return (
    <div className="sheet-bg" onClick={onClose}>
      <div className="sheet" role="dialog" aria-modal onClick={(e) => e.stopPropagation()}>
        <button className="sheet-close" onClick={onClose}>
          {S.close}
        </button>
        <div className="fig-wrap" style={{ clear: 'both' }}>
          <Figure ex={ex} />
        </div>
        <h2 className="h2">{ex.name[lang]}</h2>
        <p className="cue">{ex.cue[lang]}</p>
        <div className="meta">
          <Badges ex={ex} />
        </div>
        {(easier || harder) && (
          <div className="row">
            {easier && (
              <button className="btn btn-ghost" onClick={() => onPick(easier)}>
                ← {S.easier}: {easier.name[lang]}
              </button>
            )}
            {harder && (
              <button className="btn btn-ghost" onClick={() => onPick(harder)}>
                {S.harder}: {harder.name[lang]} →
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

/** Every exercise, filterable by focus. Tap a card for the cue and easier/harder versions. */
export default function Library() {
  const { S } = useBdy()
  const [filter, setFilter] = useState<Filter>('all')
  const [open, setOpen] = useState<Exercise | null>(null)
  const list = EXERCISES.filter((e) => matches(e, filter))
  return (
    <>
      <div className="lib-head">
        <h1 className="h2">{S.library}</h1>
        <p className="muted">{S.library_sub(EXERCISES.length)}</p>
      </div>
      <div className="chips">
        {FILTERS.map((f) => (
          <button key={f} className={'chip' + (f === filter ? ' on' : '')} onClick={() => setFilter(f)}>
            {f === 'all' ? S.all : f === 'warmup' ? S.warmup : S.focus[f]}
          </button>
        ))}
      </div>
      <div className="grid">
        {list.map((e) => (
          <Card key={e.id} ex={e} onOpen={() => setOpen(e)} />
        ))}
      </div>
      {open && <Sheet ex={open} onClose={() => setOpen(null)} onPick={setOpen} />}
    </>
  )
}
