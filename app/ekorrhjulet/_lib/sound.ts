/*
 * Sound effects and music, all generated in the browser with the Web Audio API (no audio files).
 * Browsers only allow sound after the player has clicked something, so music starts on a click.
 *
 * Music is a small four-channel tracker in the spirit of old game consoles: a pulse-wave lead,
 * an arpeggio/chord channel, a bass and noise drums. Songs live in songs.ts.
 */

import { SONGS, type ArpStyle, type BassStyle, type Song, type SongId, type Wave } from './songs'

export type Sfx = 'click' | 'step' | 'coin' | 'buy' | 'error' | 'thief' | 'week' | 'win' | 'job'
export type Theme = 'smastaden' | 'pixelstaden'

let ctx: AudioContext | null = null
let master: GainNode | null = null
let musicBus: GainNode | null = null
let theme: Theme | null = null
let noise: AudioBuffer | null = null
const waves = new Map<Wave, PeriodicWave | OscillatorType>()

function audio() {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AC) return null
    ctx = new AC()
    master = ctx.createGain()
    master.gain.value = 0.5
    master.connect(ctx.destination)
    musicBus = ctx.createGain()
    musicBus.gain.value = 0.22
    musicBus.connect(master)
  }
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

const hz = (midi: number) => 440 * 2 ** ((midi - 69) / 12)

/** Pulse waves with a given duty cycle (12.5 %, 25 %, 50 %), like the old consoles' square channels. */
function wave(w: Wave): PeriodicWave | OscillatorType {
  const c = ctx!
  if (waves.has(w)) return waves.get(w)!
  let out: PeriodicWave | OscillatorType
  if (w === 'tri') out = 'triangle'
  else if (w === 'saw') out = 'sawtooth'
  else {
    const duty = w === 'sq12' ? 0.125 : w === 'sq25' ? 0.25 : 0.5
    const n = 48
    const real = new Float32Array(n)
    const imag = new Float32Array(n)
    for (let k = 1; k < n; k++) real[k] = (2 / (k * Math.PI)) * Math.sin(k * Math.PI * duty)
    out = c.createPeriodicWave(real, imag)
  }
  waves.set(w, out)
  return out
}

function tone(midi: number, at: number, dur: number, w: Wave, vol: number, out: AudioNode, opts: { slideTo?: number; vibrato?: number } = {}) {
  const c = ctx!
  const o = c.createOscillator()
  const g = c.createGain()
  const wv = wave(w)
  if (typeof wv === 'string') o.type = wv as OscillatorType
  else o.setPeriodicWave(wv)
  o.frequency.setValueAtTime(hz(midi), at)
  if (opts.slideTo !== undefined) o.frequency.exponentialRampToValueAtTime(hz(opts.slideTo), at + dur)
  if (opts.vibrato && dur > 0.18) {
    const lfo = c.createOscillator()
    const lg = c.createGain()
    lfo.frequency.value = 5.5
    lg.gain.value = opts.vibrato
    lfo.connect(lg).connect(o.detune)
    lfo.start(at + 0.08)
    lfo.stop(at + dur + 0.05)
  }
  g.gain.setValueAtTime(0.0001, at)
  g.gain.exponentialRampToValueAtTime(vol, at + 0.008)
  g.gain.setValueAtTime(vol, at + Math.max(0.01, dur * 0.7))
  g.gain.exponentialRampToValueAtTime(0.0001, at + dur)
  o.connect(g).connect(out)
  o.start(at)
  o.stop(at + dur + 0.02)
}

function noiseBuffer() {
  if (noise) return noise
  const c = ctx!
  noise = c.createBuffer(1, c.sampleRate * 0.5, c.sampleRate)
  const d = noise.getChannelData(0)
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
  return noise
}

function drum(kind: 'k' | 's' | 'h', at: number, vol: number, out: AudioNode) {
  const c = ctx!
  if (kind === 'k') {
    const o = c.createOscillator()
    const g = c.createGain()
    o.frequency.setValueAtTime(140, at)
    o.frequency.exponentialRampToValueAtTime(42, at + 0.12)
    g.gain.setValueAtTime(vol * 1.4, at)
    g.gain.exponentialRampToValueAtTime(0.0001, at + 0.16)
    o.connect(g).connect(out)
    o.start(at)
    o.stop(at + 0.18)
    return
  }
  const src = c.createBufferSource()
  src.buffer = noiseBuffer()
  const f = c.createBiquadFilter()
  const g = c.createGain()
  f.type = kind === 'h' ? 'highpass' : 'bandpass'
  f.frequency.value = kind === 'h' ? 7000 : 1800
  const len = kind === 'h' ? 0.04 : 0.14
  g.gain.setValueAtTime(vol * (kind === 'h' ? 0.35 : 0.9), at)
  g.gain.exponentialRampToValueAtTime(0.0001, at + len)
  src.connect(f).connect(g).connect(out)
  src.start(at)
  src.stop(at + len + 0.01)
}

export function sfx(name: Sfx, on = true) {
  if (!on) return
  const c = audio()
  if (!c || !master) return
  const t = c.currentTime + 0.01
  const sq: Wave = theme === 'smastaden' ? 'tri' : 'sq25'
  switch (name) {
    case 'click':
      tone(84, t, 0.05, sq, 0.2, master)
      break
    case 'step':
      tone(60, t, 0.04, 'tri', 0.15, master)
      break
    case 'coin':
      tone(83, t, 0.08, sq, 0.25, master)
      tone(88, t + 0.08, 0.2, sq, 0.25, master)
      break
    case 'buy':
      tone(76, t, 0.07, sq, 0.2, master)
      tone(79, t + 0.07, 0.07, sq, 0.2, master)
      tone(84, t + 0.14, 0.15, sq, 0.2, master)
      break
    case 'job':
      ;[72, 76, 79, 84].forEach((n, i) => tone(n, t + i * 0.09, 0.18, sq, 0.22, master!))
      break
    case 'error':
      tone(50, t, 0.18, 'saw', 0.15, master, { slideTo: 45 })
      break
    case 'thief':
      tone(70, t, 0.25, 'saw', 0.18, master, { slideTo: 58 })
      tone(66, t + 0.25, 0.3, 'saw', 0.18, master, { slideTo: 52 })
      break
    case 'week':
      ;[67, 72, 76].forEach((n, i) => tone(n, t + i * 0.12, 0.3, sq, 0.18, master!))
      break
    case 'win':
      ;[72, 76, 79, 84, 79, 84, 88].forEach((n, i) => tone(n, t + i * 0.13, 0.25, sq, 0.22, master!))
      break
  }
}

/* ---------- The tracker ---------- */

const NOTE: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }

/** "C#5" → MIDI 73. */
function midiOf(name: string): number {
  const m = /^([A-G])([#b]?)(-?\d)$/.exec(name)
  if (!m) throw new Error(`Bad note ${name}`)
  return 12 * (Number(m[3]) + 1) + NOTE[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0)
}

const QUALITY: [string, number[]][] = [
  ['maj7', [0, 4, 7, 11]],
  ['m7', [0, 3, 7, 10]],
  ['dim', [0, 3, 6]],
  ['sus4', [0, 5, 7]],
  ['7', [0, 4, 7, 10]],
  ['m', [0, 3, 7]],
  ['', [0, 4, 7]],
]

/** "F#m7" → { root: pitch class, tones: intervals }. */
function chordOf(name: string) {
  const m = /^([A-G])([#b]?)(.*)$/.exec(name)!
  const root = (NOTE[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0) + 12) % 12
  const tones = QUALITY.find(([q]) => q === m[3])?.[1] ?? [0, 4, 7]
  return { root, tones }
}

type Ev = { step: number; midi: number; len: number }

function parseLead(song: Song): Ev[] {
  const tokens = song.lead.split(/\s+/).filter((t) => t && t !== '|')
  const out: Ev[] = []
  tokens.forEach((t, i) => {
    const step = i * song.res
    if (t === '-') {
      const last = out.at(-1)
      if (last) last.len += song.res
    } else if (t !== '.') out.push({ step, midi: midiOf(t), len: song.res })
  })
  return out
}

/** Bass notes for one bar. */
function bassBar(style: BassStyle, root: number, tones: number[], steps: number): Ev[] {
  const low = 36 + root // C2..B2
  const fifth = low + 7
  const ev = (step: number, midi: number, len: number) => ({ step, midi, len })
  switch (style) {
    case 'root8':
      return Array.from({ length: steps / 2 }, (_, i) => ev(i * 2, i % 2 ? fifth : low, 2))
    case 'root4':
      return Array.from({ length: steps / 4 }, (_, i) => ev(i * 4, low, 3))
    case 'whole':
      return [ev(0, low, steps)]
    case 'beat1':
      return [ev(0, low, 4), ...(steps === 12 ? [] : [ev(8, fifth, 4)])]
    case 'bossa':
      return [ev(0, low, 6), ev(6, fifth, 2), ev(8, low, 6), ev(14, fifth, 2)]
    case 'octaves':
      return Array.from({ length: steps / 2 }, (_, i) => ev(i * 2, i % 2 ? low + 12 : low, 2))
    case 'boogie': {
      const third = tones.includes(3) ? 3 : 4
      const walk = [0, third, 7, 9, 10, 9, 7, third]
      return Array.from({ length: steps / 2 }, (_, i) => ev(i * 2, low + walk[i % 8], 2))
    }
    default:
      return []
  }
}

/** Arpeggio / chord notes for one bar, in the 4th octave. */
function arpBar(style: ArpStyle, root: number, tones: number[], steps: number): Ev[][] {
  const notes = tones.map((t) => 60 + root + t) // close voicing above middle C
  const one = (step: number, midi: number, len: number) => [{ step, midi, len }]
  const block = (step: number, len: number) => notes.map((m) => ({ step, midi: m, len }))
  switch (style) {
    case 'up16':
      return Array.from({ length: steps }, (_, i) => one(i, notes[i % notes.length] + 12, 1))
    case 'updown8': {
      const seq = [...notes, ...notes.slice(1, -1).reverse()]
      return Array.from({ length: steps / 2 }, (_, i) => one(i * 2, seq[i % seq.length], 2))
    }
    case 'alberti': {
      const [a, b, c] = [notes[0], notes[2] ?? notes[1], notes[1]]
      const seq = [a, b, c, b]
      return Array.from({ length: steps / 2 }, (_, i) => one(i * 2, seq[i % 4], 2))
    }
    case 'stabs':
      return steps === 12 ? [block(4, 2), block(8, 2)] : [block(4, 2), block(12, 2)]
    case 'waltz':
      return [block(4, 2), block(8, 2)]
    case 'pad':
      return [block(0, steps)]
    default:
      return []
  }
}

type Compiled = { song: Song; bars: number; lead: Ev[]; bass: Ev[]; arp: Ev[] }

const compiled = new Map<SongId, Compiled>()

function compile(id: SongId): Compiled {
  const hit = compiled.get(id)
  if (hit) return hit
  const song = SONGS[id]
  const bars = song.chords.length
  const bass: Ev[] = []
  const arp: Ev[] = []
  song.chords.forEach((name, b) => {
    const { root, tones } = chordOf(name)
    for (const e of bassBar(song.bass, root, tones, song.steps)) bass.push({ ...e, step: e.step + b * song.steps })
    for (const group of arpBar(song.arp, root, tones, song.steps)) for (const e of group) arp.push({ ...e, step: e.step + b * song.steps })
  })
  const c = { song, bars, lead: parseLead(song), bass, arp }
  compiled.set(id, c)
  return c
}

let timer: ReturnType<typeof setInterval> | null = null
let current: SongId | null = null
let songGain: GainNode | null = null

/** Everything needed to play a song step by step. */
function sequencer(id: SongId) {
  const { song, bars, lead, bass, arp } = compile(id)
  const total = bars * song.steps
  const stepDur = 60 / song.bpm / 4
  const byStep = (evs: Ev[]) => {
    const m = new Map<number, Ev[]>()
    for (const e of evs) m.set(e.step, [...(m.get(e.step) ?? []), e])
    return m
  }
  const L = byStep(lead)
  const B = byStep(bass)
  const A = byStep(arp)
  const drums = song.drums ?? {}
  const dv = song.drumVol ?? 0.6
  /** Schedules everything that starts on `step` at time `t`. */
  const play = (step: number, t: number, out: AudioNode) => {
    const s = step % total
    const inBar = s % song.steps
    const at = t + (song.swing && inBar % 4 === 2 ? song.swing * stepDur : 0)
    for (const e of L.get(s) ?? []) tone(e.midi, at, e.len * stepDur * 0.95, song.leadWave, 0.32 * (song.leadVol ?? 1), out, { vibrato: song.vibrato })
    for (const e of B.get(s) ?? []) tone(e.midi, at, e.len * stepDur * 0.9, 'tri', 0.42, out)
    for (const e of A.get(s) ?? []) tone(e.midi, at, e.len * stepDur * 0.85, song.arpWave ?? 'sq12', song.arp === 'pad' ? 0.06 : 0.1, out)
    for (const k of ['k', 's', 'h'] as const) if (drums[k]?.[inBar] === 'x') drum(k, at, dv, out)
  }
  return { stepDur, total, play }
}

/** Plays a song on a loop (or keeps playing it if it's already on). `on` = music setting. */
export function playSong(id: SongId, on: boolean) {
  if (!on) {
    stopMusic()
    return
  }
  if (current === id && timer) return
  const c = audio()
  if (!c || !musicBus) return
  stopMusic()
  current = id
  const { stepDur, play } = sequencer(id)
  const out = c.createGain()
  out.gain.setValueAtTime(0.0001, c.currentTime)
  out.gain.exponentialRampToValueAtTime(1, c.currentTime + 0.4) // soft fade-in between places
  out.connect(musicBus)
  songGain = out
  let step = 0
  let next = c.currentTime + 0.12
  timer = setInterval(() => {
    while (next < c.currentTime + 0.2) {
      play(step, next, out)
      next += stepDur
      step++
    }
  }, 50)
}

/**
 * Renders `seconds` of a song offline (no speakers) at the in-game music level. Used by the sound
 * check when composing: it shows the levels and lets you listen to a song as a file.
 */
export async function renderSong(id: SongId, seconds: number, sampleRate = 22050): Promise<AudioBuffer> {
  const saved = { ctx, master, musicBus, noise }
  const off = new OfflineAudioContext(1, Math.ceil(seconds * sampleRate), sampleRate)
  ctx = off as unknown as AudioContext
  waves.clear()
  noise = null
  const bus = off.createGain()
  bus.gain.value = 0.5 * 0.22
  bus.connect(off.destination)
  const { stepDur, play } = sequencer(id)
  for (let step = 0, t = 0.05; t < seconds; step++, t += stepDur) play(step, t, bus)
  const buf = await off.startRendering()
  ;({ ctx, master, musicBus, noise } = saved)
  waves.clear()
  return buf
}

export function stopMusic() {
  if (timer) clearInterval(timer)
  timer = null
  current = null
  if (songGain && ctx) {
    const g = songGain
    g.gain.cancelScheduledValues(ctx.currentTime)
    g.gain.setValueAtTime(g.gain.value, ctx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.25)
    setTimeout(() => g.disconnect(), 400)
  }
  songGain = null
}

export const currentSong = () => current

export function setTheme(t: Theme) {
  theme = t
}
