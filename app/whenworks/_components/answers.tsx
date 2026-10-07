'use client'

import { isNew } from '../_lib/logic'
import type { Answer, Slot } from '../_lib/types'
import { Mark, SlotLabel, useWW } from './ui'

/** One row per time with Yes / Maybe / No. Used by guests and by the organizer for their own answers. */
export function AnswerList({
  slots,
  answers,
  onAnswer,
  round,
  yesCount,
}: {
  slots: Slot[]
  answers: Record<string, Answer>
  onAnswer: (id: string, v: Answer) => void
  round: number
  yesCount?: (s: Slot) => number // how many others can, shown as "N can"
}) {
  const { S } = useWW()
  return (
    <ul className="answer-list">
      {slots.map((s) => {
        const yes = yesCount ? yesCount(s) : 0
        const a = answers[s.id]
        const fresh = isNew(s, round)
        return (
          <li key={s.id} className={a ? 'answered ' + a : ''}>
            <div className="al-l">
              <SlotLabel s={s} />
              {(yes > 0 || s.by || fresh) && (
                <span className="al-meta">
                  {fresh && <span className="new-pill">{S.new_tag}</span>}
                  {s.by ? S.suggested_by(s.by) : ''}
                  {s.by && yes ? ' · ' : ''}
                  {yes ? yes + ' ' + S.can.toLowerCase() : ''}
                </span>
              )}
            </div>
            <div className="yn">
              {(
                [
                  ['yes', S.yes_l],
                  ['maybe', S.maybe_l],
                  ['no', S.no_l],
                ] as const
              ).map(([v, l]) => (
                <button
                  key={v}
                  className={'yn-b ' + v + (a === v ? ' on' : '')}
                  onClick={() => onAnswer(s.id, v)}
                  aria-pressed={a === v}
                >
                  <Mark v={v} />
                  <span>{l}</span>
                </button>
              ))}
            </div>
          </li>
        )
      })}
    </ul>
  )
}

/** Times with new ones from the current round first, otherwise in date order. */
export const newFirst = (slots: Slot[], round: number) =>
  [...slots]
    .sort((a, b) => (a.date + (a.time ?? '')).localeCompare(b.date + (b.time ?? '')))
    .sort((a, b) => (isNew(b, round) ? 1 : 0) - (isNew(a, round) ? 1 : 0))
