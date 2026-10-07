'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { WW_STR, type Strings } from '../_lib/i18n'
import { fmt } from '../_lib/logic'
import type { Answer, DurUnit, Lang, Slot } from '../_lib/types'

/* ---------- Language context ---------- */

type Ctx = { lang: Lang; setLang: (l: Lang) => void; S: Strings }
const WWCtx = createContext<Ctx | null>(null)

export function useWW() {
  const c = useContext(WWCtx)
  if (!c) throw new Error('useWW outside WhenworksShell')
  return c
}

/** Header, footer and language state for every Whenworks page. */
export function WhenworksShell({ role, children }: { role: 'organizer' | 'guest'; children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('sv')
  useEffect(() => {
    try {
      const saved = localStorage.getItem('ww_lang')
      if (saved === 'en' || saved === 'sv') setLangState(saved)
    } catch {}
  }, [])
  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])
  const setLang = (l: Lang) => {
    setLangState(l)
    try {
      localStorage.setItem('ww_lang', l)
    } catch {}
  }
  const S = WW_STR[lang]
  return (
    <WWCtx.Provider value={{ lang, setLang, S }}>
      <div className="app">
        <header className="ww-header">
          <a className="brand" href="/whenworks">
            <span className="logo">w</span>
            <span>Whenworks</span>
          </a>
          <div className="hdr-r">
            <span className="role-tag">{role === 'guest' ? S.role_guest : S.role_org}</span>
            <div className="lang">
              {(['en', 'sv'] as const).map((l) => (
                <button key={l} className={lang === l ? 'on' : ''} onClick={() => setLang(l)}>
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </header>
        <main>{children}</main>
        <footer className="ww-footer">{S.footer}</footer>
      </div>
    </WWCtx.Provider>
  )
}

/* ---------- Icons ---------- */

export const Ic = {
  arrowL: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  arrowR: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  check: (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path d="M3 8.5l3 3 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  x: (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
      <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  q: (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
      <path d="M3 8h10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  ),
  plus: (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
  copy: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="5" y="5" width="8.5" height="8.5" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10.5 2.5h-6a2 2 0 00-2 2v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  cal: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="3" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2 6.5h12M5.5 1.5v3M10.5 1.5v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  lock: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="3" y="7" width="10" height="7" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5.5 7V5a2.5 2.5 0 015 0v2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),
}

/* ---------- Building blocks ---------- */

export function Steps({ current }: { current: number }) {
  const { S } = useWW()
  return (
    <ol className="steps">
      {[S.step_what, S.step_when, S.step_guests, S.step_who].map((s, i) => (
        <li key={i} className={i + 1 === current ? 'on' : i + 1 < current ? 'done' : ''}>
          <span className="n">{i + 1 < current ? Ic.check : i + 1}</span>
          <span>{s}</span>
        </li>
      ))}
    </ol>
  )
}

export function CardHead({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="card-head">
      <h2>{title}</h2>
      {sub && <p>{sub}</p>}
    </div>
  )
}

export function Field({
  label,
  optional,
  hint,
  children,
}: {
  label: string
  optional?: boolean
  hint?: string
  children: ReactNode
}) {
  const { S } = useWW()
  return (
    <label className="field">
      <span className="lbl">
        {label}
        {optional && <em> ({S.optional})</em>}
      </span>
      {children}
      {hint && <span className="hint">{hint}</span>}
    </label>
  )
}

export function Seg<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T
  options: { v: T; l: string }[]
  onChange: (v: T) => void
}) {
  return (
    <div className="seg">
      {options.map((o) => (
        <button type="button" key={o.v} className={value === o.v ? 'on' : ''} onClick={() => onChange(o.v)}>
          {o.l}
        </button>
      ))}
    </div>
  )
}

export function Actions({
  onBack,
  onNext,
  nextLabel,
  nextDisabled,
  backLabel,
}: {
  onBack?: () => void
  onNext: () => void
  nextLabel?: string
  nextDisabled?: boolean
  backLabel?: string
}) {
  const { S } = useWW()
  return (
    <div className="actions">
      {onBack ? (
        <button className="btn btn-quiet" onClick={onBack}>
          {Ic.arrowL}
          {backLabel || S.back}
        </button>
      ) : (
        <span />
      )}
      <button className="btn btn-primary" disabled={nextDisabled} onClick={onNext}>
        {nextLabel || S.cont}
        {Ic.arrowR}
      </button>
    </div>
  )
}

export function Toggle({
  checked,
  onChange,
  title,
  desc,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  title: string
  desc?: string
}) {
  return (
    <label className="toggle-row">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="sw" />
      {desc ? (
        <span className="tg-t">
          <b>{title}</b>
          <span>{desc}</span>
        </span>
      ) : (
        title
      )}
    </label>
  )
}

const AV_COLORS = ['#E9D7E4', '#DCE6D5', '#F3E0C7', '#D7DFEC', '#EED6D2', '#E2DCEF']
export function Avatar({ name, size = 32 }: { name: string; size?: number }) {
  let h = 0
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) % 997
  return (
    <span
      className="av"
      title={name}
      style={{ width: size, height: size, fontSize: size * 0.42, background: AV_COLORS[h % AV_COLORS.length] }}
    >
      {name.slice(0, 1).toUpperCase()}
    </span>
  )
}

export function Mark({ v }: { v?: Answer | 'none' }) {
  if (v === 'yes') return <span className="mk yes">{Ic.check}</span>
  if (v === 'maybe') return <span className="mk maybe">{Ic.q}</span>
  if (v === 'no') return <span className="mk no">{Ic.x}</span>
  return <span className="mk none" />
}

/** How many days each time covers (see spanOf). Set once per page; SlotLabel reads it. */
const SpanCtx = createContext(1)
export const SpanProvider = SpanCtx.Provider
export const useSpan = () => useContext(SpanCtx)

export function SlotLabel({ s, compact }: { s: Pick<Slot, 'date' | 'time'>; compact?: boolean }) {
  const { lang, S } = useWW()
  const days = useSpan()
  const multi = days > 1 && !s.time
  return (
    <span className={'slot-lbl' + (compact ? ' compact' : '')}>
      <span className="dbox">
        <b>{fmt.num(s.date)}</b>
        <i>{fmt.mon(s.date, lang)}</i>
      </span>
      <span className="st">
        <b>{multi ? fmt.spanDays(s.date, days, lang) : fmt.day(s.date, lang)}</b>
        <span>{multi ? fmt.spanShort(s.date, days, lang) : s.time || S.whole_day}</span>
      </span>
    </span>
  )
}

function useCopy(text: string) {
  const [ok, setOk] = useState(false)
  const copy = () => {
    navigator.clipboard?.writeText(text).catch(() => {})
    setOk(true)
    setTimeout(() => setOk(false), 1600)
  }
  return [ok, copy] as const
}

export function CopyBtn({ text }: { text: string }) {
  const { S } = useWW()
  const [ok, copy] = useCopy(text)
  return (
    <button className={'btn btn-sm ' + (ok ? 'btn-ok' : 'btn-dark')} onClick={copy}>
      {ok ? Ic.check : Ic.copy}
      {ok ? S.copied : S.copy}
    </button>
  )
}

export function CopyBox({ text, mono }: { text: string; mono?: boolean }) {
  return (
    <div className={'copybox' + (mono ? ' mono' : '')}>
      <span className="txt">{text}</span>
      <CopyBtn text={text} />
    </div>
  )
}

export const todayIso = () => fmt.iso(new Date())

type Month = { y: number; m: number }
export const monthOf = (iso: string): Month => ({ y: +iso.slice(0, 4), m: +iso.slice(5, 7) - 1 })

export function Calendar({
  month,
  setMonth,
  isOn,
  isMid,
  onPick,
  minDate,
  dots,
}: {
  month: Month
  setMonth: (m: Month) => void
  isOn: (d: string) => boolean
  isMid?: (d: string) => boolean
  onPick: (d: string) => void
  minDate: string
  dots?: (d: string) => number
}) {
  const { lang } = useWW()
  const first = new Date(month.y, month.m, 1)
  const startPad = (first.getDay() + 6) % 7 // Monday first
  const nDays = new Date(month.y, month.m + 1, 0).getDate()
  const cells: (string | null)[] = []
  for (let i = 0; i < startPad; i++) cells.push(null)
  for (let d = 1; d <= nDays; d++) cells.push(fmt.iso(new Date(month.y, month.m, d)))
  // 2026-10-05 is a Monday.
  const wd = [...Array(7)].map((_, i) => new Date(2026, 9, 5 + i).toLocaleDateString(fmt.loc(lang), { weekday: 'narrow' }))
  const shift = (n: number) => {
    const x = new Date(month.y, month.m + n, 1)
    setMonth({ y: x.getFullYear(), m: x.getMonth() })
  }
  return (
    <div className="cal">
      <div className="cal-top">
        <b>{first.toLocaleDateString(fmt.loc(lang), { month: 'long', year: 'numeric' })}</b>
        <div className="cal-nav">
          <button onClick={() => shift(-1)} aria-label="Previous">
            {Ic.arrowL}
          </button>
          <button onClick={() => shift(1)} aria-label="Next">
            {Ic.arrowR}
          </button>
        </div>
      </div>
      <div className="cal-grid">
        {wd.map((w, i) => (
          <span key={'w' + i} className="wd">
            {w}
          </span>
        ))}
        {cells.map((c, i) =>
          c ? (
            <button
              key={c}
              disabled={c < minDate}
              onClick={() => onPick(c)}
              className={'cd' + (isOn(c) ? ' on' : '') + (isMid?.(c) ? ' mid' : '') + (c === minDate ? ' today' : '')}
            >
              {fmt.num(c)}
              {dots && dots(c) > 0 && <i className="dot" />}
            </button>
          ) : (
            <span key={'e' + i} />
          ),
        )}
      </div>
    </div>
  )
}

/* ---------- Calendar file (.ics) ---------- */

const pad = (n: number) => String(n).padStart(2, '0')

export function downloadIcs(
  ev: { title: string; desc: string; dur: string; durUnit: DurUnit; slug: string },
  slot: Pick<Slot, 'date' | 'time'>,
  note: string,
  url: string,
) {
  const [y, mo, d] = slot.date.split('-').map(Number)
  const n = Number(ev.dur) || 0
  let start: string
  let end: string
  if (slot.time) {
    const [h, mi] = slot.time.split(':').map(Number)
    // Floating local time: no time zone, so it lands at the same clock time for everyone.
    const ms = Date.UTC(y, mo - 1, d, h, mi)
    const len = n ? n * (ev.durUnit === 'd' ? 24 : 1) * 3600e3 : 3600e3
    const f = (t: number) => {
      const x = new Date(t)
      return `${x.getUTCFullYear()}${pad(x.getUTCMonth() + 1)}${pad(x.getUTCDate())}T${pad(x.getUTCHours())}${pad(x.getUTCMinutes())}00`
    }
    start = `DTSTART:${f(ms)}`
    end = `DTEND:${f(ms + len)}`
  } else {
    const days = ev.durUnit === 'd' && n ? n : 1
    const f = (t: number) => {
      const x = new Date(t)
      return `${x.getUTCFullYear()}${pad(x.getUTCMonth() + 1)}${pad(x.getUTCDate())}`
    }
    const ms = Date.UTC(y, mo - 1, d)
    start = `DTSTART;VALUE=DATE:${f(ms)}`
    end = `DTEND;VALUE=DATE:${f(ms + days * 864e5)}`
  }
  const esc = (s: string) => s.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/([,;])/g, '\\$1')
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '')
  const desc = [ev.desc, note, url].filter(Boolean).join('\n\n')
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Whenworks//stefaneklund.se//EN',
    'BEGIN:VEVENT',
    `UID:${ev.slug}-${slot.date}@stefaneklund.se`,
    `DTSTAMP:${stamp}`,
    start,
    end,
    `SUMMARY:${esc(ev.title)}`,
    desc ? `DESCRIPTION:${esc(desc)}` : '',
    url ? `URL:${url}` : '',
    'END:VEVENT',
    'END:VCALENDAR',
  ]
    .filter(Boolean)
    .join('\r\n')
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }))
  a.download = (ev.title.replace(/[^\p{L}\p{N} _-]/gu, '').trim() || 'event') + '.ics'
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 1000)
}
