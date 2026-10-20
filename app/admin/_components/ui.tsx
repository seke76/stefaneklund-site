import type { Metric } from '../_lib/data'

const nf = new Intl.NumberFormat('sv-SE')
export const num = (n: number) => nf.format(n)
const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : 0)
export const dayLabel = (iso: string) =>
  new Date(iso + 'T12:00:00Z').toLocaleDateString('sv-SE', { day: 'numeric', month: 'short', timeZone: 'UTC' })

/** Change against the previous period of the same length, in words. */
function Delta({ m, days }: { m: Metric; days: number }) {
  const diff = m.now - m.before
  const text = diff === 0 ? 'samma som' : `${diff > 0 ? '▲ +' : '▼ '}${num(diff)} mot`
  return (
    <p className="d">
      {text} föregående {days} d
    </p>
  )
}

export function Kpi({ label, m, days, value }: { label: string; m?: Metric; days: number; value?: string }) {
  return (
    <div className="card kpi">
      <p className="l">{label}</p>
      <p className="v">{value ?? num(m?.now ?? 0)}</p>
      {m && <Delta m={m} days={days} />}
    </div>
  )
}

/** One series per chart (small multiples), so there is never a second axis or a legend to decode. */
export function Bars({ title, dates, values }: { title: string; dates: string[]; values: number[] }) {
  const max = Math.max(1, ...values)
  const total = values.reduce((a, b) => a + b, 0)
  return (
    <div className="card chart">
      <h3>{title}</h3>
      <p className="total">{num(total)}</p>
      <div className="bars" role="img" aria-label={`${title}: totalt ${total}, som mest ${max} på en dag`}>
        <span className="max">{num(max)}</span>
        {values.map((v, i) => (
          <div key={dates[i]} className="col" tabIndex={0}>
            <div className="b" style={{ height: `${(v / max) * 100}%` }} />
            <span className="tip">
              {dayLabel(dates[i])}: {num(v)}
            </span>
          </div>
        ))}
      </div>
      <div className="x">
        <span>{dayLabel(dates[0])}</span>
        <span>{dayLabel(dates[dates.length - 1])}</span>
      </div>
      <details className="table">
        <summary>Visa som tabell</summary>
        <div className="table-wrap">
          <table>
            <tbody>
              {values
                .map((v, i) => [dates[i], v] as const)
                .filter(([, v]) => v > 0)
                .reverse()
                .map(([d, v]) => (
                  <tr key={d}>
                    <td>{dayLabel(d)}</td>
                    <td className="n">{num(v)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  )
}

/** How many of `of` used something, as a share bar. */
export function Share({ rows, of }: { rows: [string, number][]; of: number }) {
  return (
    <div className="share">
      {rows.map(([label, n]) => (
        <div key={label} className="share-row">
          <span>{label}</span>
          <b>
            {num(n)} <span className="muted small">({pct(n, of)} %)</span>
          </b>
          <div className="track">
            <div className="fill" style={{ width: `${pct(n, of)}%` }} />
          </div>
        </div>
      ))}
    </div>
  )
}

export type Level = 'good' | 'warn' | 'bad'
const ICON: Record<Level, string> = { good: '✓', warn: '!', bad: '×' }

/** Status always has an icon and a word, never color alone. */
export function Status({ title, level, label, detail }: { title: string; level: Level; label: string; detail?: string }) {
  return (
    <div className="card">
      <p className="l muted small">{title}</p>
      <p className={'status ' + level}>
        <span className="ic" aria-hidden>
          {ICON[level]}
        </span>
        {label}
      </p>
      {detail && <p className="muted small">{detail}</p>}
    </div>
  )
}

export { pct }
