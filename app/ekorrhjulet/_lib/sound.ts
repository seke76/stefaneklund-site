/*
 * Sound effects and music, all generated in the browser with the Web Audio API (no audio files).
 * Browsers only allow sound after the player has clicked something, so start() is called on a click.
 */

export type Sfx = 'click' | 'step' | 'coin' | 'buy' | 'error' | 'thief' | 'week' | 'win' | 'job'
export type Theme = 'smastaden' | 'pixelstaden'

let ctx: AudioContext | null = null
let master: GainNode | null = null
let musicGain: GainNode | null = null
let timer: ReturnType<typeof setInterval> | null = null
let theme: Theme | null = null

function audio() {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AC) return null
    ctx = new AC()
    master = ctx.createGain()
    master.gain.value = 0.5
    master.connect(ctx.destination)
    musicGain = ctx.createGain()
    musicGain.gain.value = 0.18
    musicGain.connect(master)
  }
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

const hz = (midi: number) => 440 * 2 ** ((midi - 69) / 12)

function tone(midi: number, at: number, dur: number, type: OscillatorType, vol: number, out: AudioNode, slideTo?: number) {
  const c = ctx!
  const o = c.createOscillator()
  const g = c.createGain()
  o.type = type
  o.frequency.setValueAtTime(hz(midi), at)
  if (slideTo !== undefined) o.frequency.exponentialRampToValueAtTime(hz(slideTo), at + dur)
  g.gain.setValueAtTime(0.0001, at)
  g.gain.exponentialRampToValueAtTime(vol, at + 0.01)
  g.gain.exponentialRampToValueAtTime(0.0001, at + dur)
  o.connect(g).connect(out)
  o.start(at)
  o.stop(at + dur + 0.02)
}

export function sfx(name: Sfx, on = true) {
  if (!on) return
  const c = audio()
  if (!c || !master) return
  const t = c.currentTime + 0.01
  const sq: OscillatorType = theme === 'pixelstaden' ? 'square' : 'triangle'
  switch (name) {
    case 'click':
      tone(84, t, 0.05, sq, 0.2, master)
      break
    case 'step':
      tone(60, t, 0.04, 'triangle', 0.15, master)
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
      tone(50, t, 0.18, 'sawtooth', 0.15, master, 45)
      break
    case 'thief':
      tone(70, t, 0.25, 'sawtooth', 0.18, master, 58)
      tone(66, t + 0.25, 0.3, 'sawtooth', 0.18, master, 52)
      break
    case 'week':
      ;[67, 72, 76].forEach((n, i) => tone(n, t + i * 0.12, 0.3, sq, 0.18, master!))
      break
    case 'win':
      ;[72, 76, 79, 84, 79, 84, 88].forEach((n, i) => tone(n, t + i * 0.13, 0.25, sq, 0.22, master!))
      break
  }
}

/* Music: a short loop per board. Notes are MIDI numbers, 0 = rest; one entry per eighth note. */
const SONGS: Record<Theme, { bpm: number; lead: number[]; bass: number[]; wave: OscillatorType }> = {
  smastaden: {
    bpm: 104,
    wave: 'triangle',
    lead: [72, 0, 76, 79, 77, 0, 76, 74, 72, 0, 74, 76, 74, 0, 0, 0, 69, 0, 72, 76, 74, 0, 72, 71, 72, 0, 0, 0, 67, 0, 0, 0],
    bass: [48, 0, 55, 0, 53, 0, 55, 0, 45, 0, 52, 0, 50, 0, 55, 0, 41, 0, 48, 0, 43, 0, 50, 0, 48, 0, 55, 0, 48, 0, 0, 0],
  },
  pixelstaden: {
    bpm: 132,
    wave: 'square',
    lead: [76, 76, 0, 76, 0, 72, 76, 0, 79, 0, 0, 0, 67, 0, 0, 0, 72, 0, 0, 67, 0, 0, 64, 0, 0, 69, 0, 71, 0, 70, 69, 0],
    bass: [40, 0, 47, 0, 40, 0, 47, 0, 43, 0, 50, 0, 43, 0, 50, 0, 45, 0, 52, 0, 45, 0, 52, 0, 41, 0, 48, 0, 43, 0, 50, 0],
  },
}

export function playMusic(t: Theme, on: boolean) {
  theme = t
  stopMusic()
  if (!on) return
  const c = audio()
  if (!c || !musicGain) return
  const song = SONGS[t]
  const step = 60 / song.bpm / 2
  let i = 0
  let next = c.currentTime + 0.1
  timer = setInterval(() => {
    while (next < c.currentTime + 0.3) {
      const n = i % song.lead.length
      if (song.lead[n]) tone(song.lead[n], next, step * 0.9, song.wave, 0.5, musicGain!)
      if (song.bass[n]) tone(song.bass[n], next, step * 1.8, 'triangle', 0.6, musicGain!)
      next += step
      i++
    }
  }, 100)
}

export function stopMusic() {
  if (timer) clearInterval(timer)
  timer = null
}

export function setTheme(t: Theme) {
  theme = t
}
