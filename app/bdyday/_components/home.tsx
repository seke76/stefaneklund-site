'use client'

import { byId } from '../_lib/exercises'
import Figure from './figure'
import { useBdy } from './shell'

/** Start page: today's status and the way into a workout. */
export default function Home() {
  const { S } = useBdy()
  const hero = byId('split-jump')!
  return (
    <section className="home">
      <div>
        <span className="eyebrow">{S.today}</span>
        <h1 className="display">
          {S.hero.split(' ').slice(0, -1).join(' ')} <em>{S.hero.split(' ').slice(-1)}</em>
        </h1>
        <p className="lede">{S.hero_sub}</p>
        <div className="stats">
          <span className="stat">
            <b>0</b>
            {S.streak(0).replace(/^0\s?-?/, '')}
          </span>
          <span className="stat">{S.week(0, 3)}</span>
        </div>
        <div className="cta">
          <a className="btn btn-primary btn-block" href="/bdyday/trana">
            {S.train}
          </a>
          <a className="btn btn-ghost btn-block" href="/bdyday/ovningar">
            {S.library}
          </a>
        </div>
      </div>
      <div className="hero-fig" aria-hidden>
        <Figure ex={hero} />
      </div>
    </section>
  )
}
