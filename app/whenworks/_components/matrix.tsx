'use client'

import { tally, isNew, type Best } from '../_lib/logic'
import type { Answer, Slot } from '../_lib/types'
import { Avatar, Ic, Mark, SlotLabel, useWW } from './ui'

type Person = { name: string; answers: Record<string, Answer> }

/**
 * Names × times table of answers. The organizer passes onPick to get a
 * pick button under each time; guests see the same table without it.
 */
export function Matrix({
  people,
  slots,
  round,
  B,
  onPick,
  me,
}: {
  people: Person[]
  slots: Slot[]
  round: number
  B: Best
  onPick?: (s: Slot) => void
  me?: string
}) {
  const { S } = useWW()
  const best = B.best
  const cls = (s: Slot) => (best && s.id === best.id ? (B.tag === 'closest' ? 'close' : 'best') : '')
  const tagTxt = { all: S.all_can, closest: S.closest, best: S.best }[B.tag]
  return (
    <div className="mx-wrap">
      <table className="mx">
        <thead>
          <tr>
            <th className="pcol" />
            {slots.map((s) => (
              <th key={s.id} className={cls(s)}>
                {best && s.id === best.id && <span className={'best-tag ' + B.tag}>{tagTxt}</span>}
                <SlotLabel s={s} compact />
                {isNew(s, round) && <span className="by new">{S.new_tag}</span>}
                {s.by && <span className="by">{S.suggested_by(s.by)}</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {people.map((p) => (
            <tr key={p.name}>
              <th className="pcol">
                <span className="pcol-in">
                  <Avatar name={p.name} size={28} />
                  <span>
                    {p.name}
                    {me && p.name.toLowerCase() === me.toLowerCase() ? ' (' + S.you + ')' : ''}
                  </span>
                </span>
              </th>
              {slots.map((s) => (
                <td key={s.id} className={cls(s)}>
                  <Mark v={p.answers[s.id]} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <th className="pcol">{S.can}</th>
            {slots.map((s) => {
              const r = tally(s, people)
              return (
                <td key={s.id} className={cls(s)}>
                  <b>{r.yes.length}</b>
                  <span className="muted">{r.maybe.length ? ' +' + r.maybe.length : ''}</span>
                </td>
              )
            })}
          </tr>
          {onPick && (
            <tr>
              <th className="pcol" />
              {slots.map((s) => (
                <td key={s.id} className={cls(s)}>
                  <button className="btn btn-sm btn-pick" aria-label={S.pick_this} onClick={() => onPick(s)}>
                    {Ic.check}
                  </button>
                </td>
              ))}
            </tr>
          )}
        </tfoot>
      </table>
    </div>
  )
}

export function Legend() {
  const { S } = useWW()
  return (
    <div className="legend">
      <span>
        <Mark v="yes" />
        {S.can}
      </span>
      <span>
        <Mark v="maybe" />
        {S.maybe}
      </span>
      <span>
        <Mark v="no" />
        {S.cant}
      </span>
    </div>
  )
}
