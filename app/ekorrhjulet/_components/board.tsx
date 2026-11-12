'use client'

import { useEffect, useRef, useState } from 'react'
import { placeName } from '../_lib/data'
import { route } from '../_lib/engine'
import type { BoardId, Era, PlaceId, Player } from '../_lib/types'
import { PIXELSTADEN_SVG, SMASTADEN_SVG } from './boards'

/* Board geometry in the drawing's own units (1280 × 880). */
const W = 1280
const H = 880

type Box = { x: number; y: number; w: number; h: number }
const TOP = (x: number, y: number, h: number): Box => ({ x, y, w: 176, h })

const HOTSPOTS: Record<BoardId, Record<PlaceId, Box>> = {
  smastaden: {
    lagenheten: TOP(182, 92, 164),
    jobbtorget: TOP(422, 72, 184),
    hogskolan: TOP(662, 84, 172),
    banken: TOP(902, 84, 172),
    kvickkop: { x: 1124, y: 404, w: 142, h: 150 },
    mobel: TOP(902, 696, 170),
    pryl: TOP(662, 696, 170),
    bostad: TOP(422, 700, 166),
    puben: TOP(180, 704, 162),
    gymmet: { x: 14, y: 398, w: 142, h: 156 },
  },
  pixelstaden: {
    lagenheten: TOP(186, 118, 138),
    jobbtorget: TOP(426, 78, 178),
    hogskolan: TOP(666, 118, 138),
    banken: TOP(906, 82, 174),
    kvickkop: { x: 1132, y: 416, w: 136, h: 138 },
    mobel: TOP(906, 728, 138),
    pryl: TOP(666, 728, 138),
    bostad: TOP(426, 728, 138),
    puben: TOP(186, 728, 138),
    gymmet: { x: 12, y: 384, w: 136, h: 170 },
  },
}

/** Where a token stands on the road outside each place. */
const STAND: Record<PlaceId, [number, number]> = {
  lagenheten: [265, 310],
  jobbtorget: [505, 310],
  hogskolan: [745, 310],
  banken: [985, 310],
  kvickkop: [1080, 490],
  mobel: [985, 670],
  pryl: [745, 670],
  bostad: [505, 670],
  puben: [265, 670],
  gymmet: [200, 490],
}

/** Corners walked through between two neighbours on the ring. */
const CORNER: Partial<Record<string, [number, number]>> = {
  'banken>kvickkop': [1072, 320],
  'kvickkop>mobel': [1072, 660],
  'puben>gymmet': [208, 660],
  'gymmet>lagenheten': [208, 320],
}

function path(from: PlaceId, to: PlaceId): [number, number][] {
  const r = route(from, to)
  const pts: [number, number][] = [STAND[r[0]]]
  for (let i = 1; i < r.length; i++) {
    const c = CORNER[`${r[i - 1]}>${r[i]}`] ?? CORNER[`${r[i]}>${r[i - 1]}`]
    if (c) pts.push(c)
    pts.push(STAND[r[i]])
  }
  return pts
}

const pct = (v: number, of: number) => `${(v / of) * 100}%`

export type BoardProps = {
  board: BoardId
  era: Era
  players: Player[]
  activeId: number
  walking: { from: PlaceId; to: PlaceId; key: number } | null
  onWalked: () => void
  onPick: (id: PlaceId) => void
  disabled: boolean
  center: React.ReactNode
  onStep?: () => void
}

/** The town: the drawing, a button over each building, the players' tokens and a centre panel. */
export default function Board(props: BoardProps) {
  const { board, era, players, activeId, walking, onWalked, onPick, disabled, center, onStep } = props
  const [pos, setPos] = useState<[number, number] | null>(null)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  // Walk the active token along the road, one waypoint at a time.
  useEffect(() => {
    timers.current.forEach(clearTimeout)
    timers.current = []
    if (!walking) {
      setPos(null)
      return
    }
    const pts = path(walking.from, walking.to)
    const stepMs = 170
    pts.forEach((pt, i) => {
      timers.current.push(
        setTimeout(() => {
          setPos(pt)
          if (i > 0) onStep?.()
        }, i * stepMs),
      )
    })
    timers.current.push(setTimeout(onWalked, pts.length * stepMs + 80))
    return () => timers.current.forEach(clearTimeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walking?.key])

  const svg = board === 'pixelstaden' ? PIXELSTADEN_SVG : SMASTADEN_SVG
  const spots = HOTSPOTS[board]

  return (
    <div className="board" style={{ aspectRatio: `${W} / ${H}` }}>
      <div className="board-art" aria-hidden="true" dangerouslySetInnerHTML={{ __html: svg }} />
      {(Object.keys(spots) as PlaceId[]).map((id) => {
        const b = spots[id]
        return (
          <button
            key={id}
            type="button"
            className="hotspot"
            style={{ left: pct(b.x, W), top: pct(b.y, H), width: pct(b.w, W), height: pct(b.h, H) }}
            onClick={() => onPick(id)}
            disabled={disabled}
            aria-label={`Gå till ${placeName(id, era)}`}
          />
        )
      })}
      {board === 'pixelstaden' && <Ambient />}
      {players.map((p) => {
        const active = p.id === activeId
        if (!active) {
          // Waiting players stroll slowly along the pavement around town, spread out along the loop.
          const k = players.filter((q) => q.id !== activeId && q.id < p.id).length
          const delay = { animationDelay: `-${20 + k * 47}s` }
          return (
            <div key={p.id} className="wanderer" style={delay} aria-hidden="true">
              <div className="wanderer-face" style={delay}>
                <div className="wanderer-hop">
                  <Squirrel color={p.color} pixel={board === 'pixelstaden'} />
                </div>
              </div>
              <span className="token-name">{p.name}</span>
            </div>
          )
        }
        const [x, y] = pos ?? STAND[p.location]
        return (
          <div key={p.id} className="token token-active" style={{ left: pct(x, W), top: pct(y, H), ['--c' as string]: p.color }} aria-hidden="true">
            <Squirrel color={p.color} pixel={board === 'pixelstaden'} />
            <span className="token-name">{p.name}</span>
          </div>
        )
      })}
      <div className="board-center">{center}</div>
    </div>
  )
}

/*
 * Quiet life in Pixelstaden: traffic, a duck, birds, a butterfly and drifting cloud shadows.
 * Positions are in % of the 1280 × 880 board; the motion itself is CSS (ekorrhjulet.css, "amb-").
 */
function Ambient() {
  return (
    <div className="ambient" aria-hidden="true">
      <div className="amb-cloud" />
      <div className="amb-cloud amb-cloud-2" />
      <div className="amb-car amb-car-red">
        <svg viewBox="0 0 56 32" shapeRendering="crispEdges">
          <rect width="56" height="32" fill="#1A1A2E" />
          <rect x="4" y="4" width="48" height="24" fill="#E04848" />
          <rect x="36" y="6" width="8" height="20" fill="#8FE3FF" />
          <rect x="10" y="6" width="6" height="20" fill="#8FE3FF" />
          <rect x="52" y="6" width="4" height="4" fill="#FFD95A" />
          <rect x="52" y="22" width="4" height="4" fill="#FFD95A" />
        </svg>
      </div>
      <div className="amb-car amb-bus">
        <svg viewBox="0 0 112 40" shapeRendering="crispEdges">
          <rect width="112" height="40" fill="#1A1A2E" />
          <rect x="4" y="4" width="104" height="32" fill="#F2C94C" />
          <rect x="4" y="22" width="104" height="6" fill="#E04848" />
          {[12, 28, 44, 60, 76, 92].map((x) => (
            <rect key={x} x={x} y="8" width="10" height="10" fill="#8FE3FF" />
          ))}
          <rect x="108" y="6" width="4" height="4" fill="#FFD95A" />
          <rect x="108" y="30" width="4" height="4" fill="#FFD95A" />
        </svg>
      </div>
      <div className="amb-duck">
        <svg viewBox="0 0 12 8" shapeRendering="crispEdges">
          <rect x="2" y="3" width="8" height="4" fill="#FFFFFF" />
          <rect x="1" y="1" width="3" height="3" fill="#FFFFFF" />
          <rect x="0" y="2" width="1" height="1" fill="#F2A23B" />
          <rect x="2" y="1" width="1" height="1" fill="#1A1A2E" />
          <rect x="9" y="3" width="2" height="2" fill="#FFFFFF" />
        </svg>
      </div>
      <div className="amb-bird">
        <svg viewBox="0 0 10 4" shapeRendering="crispEdges">
          <rect x="0" y="0" width="2" height="2" fill="#1A1A2E" />
          <rect x="2" y="2" width="2" height="2" fill="#1A1A2E" />
          <rect x="4" y="1" width="2" height="2" fill="#1A1A2E" />
          <rect x="6" y="2" width="2" height="2" fill="#1A1A2E" />
          <rect x="8" y="0" width="2" height="2" fill="#1A1A2E" />
        </svg>
      </div>
      <div className="amb-bird amb-bird-2">
        <svg viewBox="0 0 10 4" shapeRendering="crispEdges">
          <rect x="0" y="0" width="2" height="2" fill="#1A1A2E" />
          <rect x="2" y="2" width="2" height="2" fill="#1A1A2E" />
          <rect x="4" y="1" width="2" height="2" fill="#1A1A2E" />
          <rect x="6" y="2" width="2" height="2" fill="#1A1A2E" />
          <rect x="8" y="0" width="2" height="2" fill="#1A1A2E" />
        </svg>
      </div>
      <div className="amb-butterfly">
        <svg viewBox="0 0 6 4" shapeRendering="crispEdges">
          <rect x="0" y="0" width="2" height="3" fill="#F07B9A" />
          <rect x="4" y="0" width="2" height="3" fill="#F07B9A" />
          <rect x="2" y="1" width="2" height="3" fill="#1A1A2E" />
        </svg>
      </div>
    </div>
  )
}

function Squirrel({ color, pixel }: { color: string; pixel: boolean }) {
  if (pixel)
    return (
      <svg viewBox="0 0 48 60" width="100%" shapeRendering="crispEdges">
        <rect x="8" y="56" width="36" height="4" fill="#4A4A58" />
        <rect x="32" y="4" width="12" height="32" fill="#B85A22" />
        <rect x="36" y="0" width="8" height="4" fill="#B85A22" />
        <rect x="28" y="28" width="8" height="12" fill="#B85A22" />
        <rect x="12" y="28" width="20" height="24" fill={color} />
        <rect x="12" y="36" width="8" height="12" fill="#FFE2C2" />
        <rect x="4" y="12" width="20" height="18" fill={color} />
        <rect x="16" y="4" width="6" height="8" fill={color} />
        <rect x="8" y="18" width="4" height="4" fill="#1A1A2E" />
        <rect x="2" y="24" width="4" height="4" fill="#1A1A2E" />
        <rect x="12" y="52" width="8" height="4" fill="#B85A22" />
        <rect x="24" y="52" width="8" height="4" fill="#B85A22" />
      </svg>
    )
  return (
    <svg viewBox="-40 -84 90 92" width="100%" stroke="#3A2E4F" strokeWidth="3" strokeLinejoin="round">
      <ellipse cx="0" cy="2" rx="26" ry="6" fill="#2B2340" opacity="0.3" stroke="none" />
      <path d="M10 -6 C 40 -10 48 -60 20 -72 C 0 -80 -8 -54 8 -50 C 20 -47 22 -28 8 -20 Z" fill="#C8662A" />
      <path d="M16 -26 C 30 -34 34 -56 21 -63" stroke="#EE9F62" strokeWidth="4" fill="none" />
      <ellipse cx="-4" cy="-20" rx="16" ry="19" fill={color} />
      <ellipse cx="-9" cy="-17" rx="8" ry="12" fill="#FFE2C2" stroke="none" />
      <ellipse cx="-12" cy="-2" rx="7" ry="4" fill="#C8662A" strokeWidth="2.5" />
      <ellipse cx="4" cy="-2" rx="7" ry="4" fill="#C8662A" strokeWidth="2.5" />
      <circle cx="-12" cy="-44" r="14" fill={color} />
      <polygon points="-18,-55 -13,-70 -6,-55" fill={color} />
      <circle cx="-17" cy="-46" r="3.2" fill="#3A2E4F" stroke="none" />
      <circle cx="-16" cy="-47.4" r="1.1" fill="#FFFFFF" stroke="none" />
      <circle cx="-20" cy="-38" r="3.5" fill="#FF9EAE" opacity="0.8" stroke="none" />
      <circle cx="-26" cy="-42" r="2.4" fill="#3A2E4F" stroke="none" />
    </svg>
  )
}
