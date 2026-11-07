/** Small seeded RNG (mulberry32). The state lives in GameState.rng so saved games replay the same. */
export function nextRandom(state: number): [number, number] {
  const s = (state + 0x6d2b79f5) | 0
  let t = s
  t = Math.imul(t ^ (t >>> 15), t | 1)
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
  return [((t ^ (t >>> 14)) >>> 0) / 4294967296, s]
}

export const randomSeed = () => Math.floor(Math.random() * 2 ** 31)
