/*
 * The game's music: one original chiptune per place, plus the title screen and the town map.
 * Played by the small tracker in sound.ts. Format:
 *
 * - steps:  16th-note steps per bar (16 = 4/4, 12 = 3/4).
 * - chords: one chord per bar (C, Am, F#m, Bb, G7, Cmaj7, Am7, Ddim, Esus4). Bass and arpeggio follow them.
 * - lead:   the melody. Space-separated tokens, each `res` steps long: a note (C5, F#4, Bb5),
 *           "-" = keep holding the previous note, "." = rest. "|" between bars is only for reading.
 * - bass / arp: a playing style (see sound.ts). drums: one string per drum, one character per step.
 */

export type Wave = 'sq12' | 'sq25' | 'sq50' | 'tri' | 'saw'
export type BassStyle = 'root8' | 'root4' | 'whole' | 'bossa' | 'beat1' | 'octaves' | 'boogie' | 'none'
export type ArpStyle = 'up16' | 'updown8' | 'alberti' | 'stabs' | 'waltz' | 'pad' | 'none'

export type Song = {
  title: string
  bpm: number
  steps: number
  swing?: number // 0–0.5: delays every second 8th note
  chords: string[]
  lead: string
  res: number
  leadWave: Wave
  leadVol?: number
  vibrato?: number // depth in cents
  bass: BassStyle
  arp: ArpStyle
  arpWave?: Wave
  drums?: { k?: string; s?: string; h?: string }
  drumVol?: number
}

export type SongId =
  | 'title'
  | 'town'
  | 'lagenheten'
  | 'jobbtorget'
  | 'hogskolan'
  | 'banken'
  | 'bistro'
  | 'kvickkop'
  | 'mobel'
  | 'pryl'
  | 'bostad'
  | 'puben'
  | 'gymmet'

export const SONGS: Record<SongId, Song> = {
  /* Title screen: a heroic arcade fanfare. */
  title: {
    title: 'Insert Coin',
    bpm: 132,
    steps: 16,
    chords: ['C', 'C', 'F', 'G', 'Am', 'F', 'G', 'C'],
    res: 2,
    lead: `C5 - G4 - C5 - E5 G5 | C6 - - - G5 - E5 - | F5 - A5 - C6 - A5 F5 | G5 - B5 - D6 - - - |
           E6 - D6 C6 B5 - A5 - | A5 - C6 - F6 - E6 D6 | D6 - G5 - B5 - D6 - | C6 - - - . . . .`,
    leadWave: 'sq25',
    bass: 'root8',
    arp: 'up16',
    drums: { k: 'x.......x.x.....', s: '....x.......x...', h: 'x.x.x.x.x.x.x.xx' },
  },

  /* The town map: a happy stroll through Pixelstaden. */
  town: {
    title: 'En vanlig måndag',
    bpm: 112,
    steps: 16,
    chords: ['C', 'Am', 'F', 'G', 'C', 'Am', 'Dm7', 'G7'],
    res: 2,
    lead: `E5 - G5 - C6 - B5 A5 | G5 - E5 - C5 - D5 E5 | F5 - A5 - C6 - A5 F5 | G5 - - - B5 - D6 - |
           E5 G5 C6 G5 E5 G5 C6 E6 | D6 C6 A5 E5 C6 - A5 - | F5 - A5 C6 D6 C6 A5 F5 | G5 - B5 - D6 - . .`,
    leadWave: 'sq25',
    leadVol: 0.85,
    bass: 'root8',
    arp: 'up16',
    drums: { k: 'x.......x.......', s: '....x.......x...', h: '..x...x...x...xx' },
    drumVol: 0.7,
  },

  /* Home: a sleepy lo-fi lullaby with soft maj7 chords. */
  lagenheten: {
    title: 'Söndagsmorgon',
    bpm: 74,
    steps: 16,
    chords: ['Fmaj7', 'Em7', 'Dm7', 'Cmaj7', 'Fmaj7', 'Em7', 'Dm7', 'Cmaj7'],
    res: 2,
    lead: `A5 - - - C6 - A5 G5 | G5 - - - . . E5 - | F5 - A5 - C6 - D6 - | E5 - - - - - . . |
           A5 - - C6 - A5 G5 F5 | G5 - - - E5 - D5 - | F5 - - - A5 - G5 F5 | E5 - - - - - - .`,
    leadWave: 'tri',
    vibrato: 12,
    bass: 'whole',
    arp: 'updown8',
    arpWave: 'tri',
    drums: { k: 'x.....x.........', s: '........x.......', h: '..............x.' },
    drumVol: 0.45,
  },

  /* Jobbtorget: hold music. "Your call is important to us." Bossa nova on a thin phone-line lead. */
  jobbtorget: {
    title: 'Ditt samtal är viktigt för oss',
    bpm: 100,
    steps: 16,
    chords: ['Cmaj7', 'Am7', 'Dm7', 'G7', 'Cmaj7', 'Am7', 'Dm7', 'G7'],
    res: 2,
    lead: `E5 - - G5 B5 - A5 G5 | A5 - - - E5 - C5 - | D5 F5 A5 C6 B5 - A5 - | G5 - - - . . . . |
           E5 G5 B5 D6 C6 - B5 A5 | C6 - A5 - E5 - G5 - | F5 - A5 - D6 - C6 - | B5 - G5 - D5 - . .`,
    leadWave: 'sq12',
    leadVol: 0.9,
    vibrato: 6,
    bass: 'bossa',
    arp: 'stabs',
    arpWave: 'tri',
    drums: { k: 'x..x....x..x....', s: '..x..x....x..x..', h: 'x.x.x.x.x.x.x.x.' },
    drumVol: 0.4,
  },

  /* Högskolan: a baroque minuet on a "harpsichord", in 3/4. */
  hogskolan: {
    title: 'Menuett för en student',
    bpm: 120,
    steps: 12,
    chords: ['G', 'C', 'G', 'D', 'Em', 'C', 'D', 'G'],
    res: 2,
    lead: `D6 - G5 A5 B5 C6 | E6 - C6 - G5 - | B5 - G5 A5 B5 G5 | A5 - F#5 - D5 - |
           E5 G5 B5 - E6 - | C6 B5 A5 G5 E5 - | F#5 A5 D6 C6 B5 A5 | G5 - - - . .`,
    leadWave: 'sq12',
    bass: 'beat1',
    arp: 'alberti',
    arpWave: 'sq12',
  },

  /* Banken: serious minor key and a ticking clock. Time is money. */
  banken: {
    title: 'Räntan tickar',
    bpm: 96,
    steps: 16,
    chords: ['Am', 'Am', 'Dm', 'E', 'Am', 'F', 'Dm', 'E7'],
    res: 2,
    lead: `A4 - C5 - E5 - A5 - | G5 - E5 - C5 - E5 - | F5 - D5 - A4 - D5 - | E5 - G#4 - B4 - E5 - |
           A5 - G5 - E5 - C5 - | F5 - - - C5 - A4 - | D5 - F5 - A5 - F5 - | E5 - - - G#5 - . .`,
    leadWave: 'sq50',
    leadVol: 0.7,
    bass: 'root4',
    arp: 'stabs',
    drums: { k: 'x.......x.......', h: 'x.x.x.x.x.x.x.x.' },
    drumVol: 0.45,
  },

  /* Bistron: a French café waltz with an accordion (vibrato square wave). */
  bistro: {
    title: 'Valse du Bistro',
    bpm: 168,
    steps: 12,
    chords: ['Dm', 'Gm', 'A7', 'Dm', 'Dm', 'Gm', 'A7', 'Dm'],
    res: 2,
    lead: `A5 - D6 - F6 - | E6 - D6 - Bb5 - | C#6 - E6 - G6 - | F6 - E6 - D6 - |
           A5 Bb5 A5 G#5 A5 - | G5 A5 Bb5 - D6 - | E6 F6 E6 D6 C#6 - | D6 - - - . .`,
    leadWave: 'sq25',
    vibrato: 22,
    bass: 'beat1',
    arp: 'waltz',
    arpWave: 'sq25',
    drums: { h: '....x...x...' },
    drumVol: 0.35,
  },

  /* Kvickköp: a bouncy supermarket jingle. "Kvickt, billigt, nära!" */
  kvickkop: {
    title: 'Erbjudanden i gång 3',
    bpm: 132,
    steps: 16,
    chords: ['D', 'G', 'A', 'D', 'Bm', 'G', 'A', 'D'],
    res: 2,
    lead: `F#5 A5 D6 - A5 - F#5 A5 | B5 - G5 - D5 - G5 B5 | A5 - E5 - C#6 - A5 - | D6 - - - . . A5 B5 |
           D6 C#6 B5 F#5 B5 - F#5 - | G5 B5 D6 - B5 - G5 - | A5 C#6 E6 - E6 D6 C#6 - | D6 - A5 - D6 - . .`,
    leadWave: 'sq25',
    bass: 'root8',
    arp: 'up16',
    drums: { k: 'x.......x.x.....', s: '....x.......x...', h: '..x...x...x...x.' },
  },

  /* Möbelmagasinet: Swedish folk tune in a polska-like 3/4, E Dorian, on a "nyckelharpa". */
  mobel: {
    title: 'Polska för platta paket',
    bpm: 112,
    steps: 12,
    chords: ['Em', 'D', 'Em', 'B7', 'Em', 'D', 'C', 'B7'],
    res: 2,
    lead: `E5 - G5 F#5 E5 B4 | D5 - F#5 E5 D5 A4 | E5 F#5 G5 A5 B5 - | A5 - F#5 - D#5 - |
           B5 - E6 D6 B5 G5 | A5 - D6 C#6 A5 F#5 | G5 E5 C6 - B5 A5 | B5 - - - . .`,
    leadWave: 'sq12',
    vibrato: 10,
    bass: 'beat1',
    arp: 'waltz',
    arpWave: 'tri',
    drums: { k: 'x...........', h: '....x...x...' },
    drumVol: 0.4,
  },

  /* Prylpalatset: shiny 80s synth-pop with octave bass. */
  pryl: {
    title: 'Noll kronor i dag',
    bpm: 124,
    steps: 16,
    chords: ['Am', 'F', 'C', 'G', 'Am', 'F', 'C', 'G'],
    res: 2,
    lead: `A5 . A5 C6 . A5 E6 D6 | C6 - A5 - F5 - A5 C6 | E6 . E6 G6 . E6 D6 C6 | B5 - G5 - D6 - B5 - |
           A5 C6 E6 A6 G6 E6 C6 E6 | F6 E6 C6 A5 F5 A5 C6 F6 | E6 - G6 - E6 C6 G5 C6 | D6 - B5 - G5 - . .`,
    leadWave: 'sq50',
    leadVol: 0.7,
    bass: 'octaves',
    arp: 'up16',
    arpWave: 'saw',
    drums: { k: 'x.......x.x.....', s: '....x.......x...', h: 'x.x.x.x.x.x.x.x.' },
  },

  /* Bostadsbolaget: the waiting room. Your place in the queue: 14 233. */
  bostad: {
    title: 'Din plats i kön',
    bpm: 84,
    steps: 16,
    chords: ['Gm', 'Gm', 'Eb', 'D', 'Gm', 'Gm', 'Eb', 'D'],
    res: 4,
    lead: `G5 - Bb5 A5 | G5 - D5 - | Eb5 - G5 F5 | D5 - - - |
           G5 Bb5 D6 C6 | Bb5 A5 G5 - | G5 - Eb5 F5 | D5 - - .`,
    leadWave: 'sq12',
    leadVol: 0.8,
    bass: 'root4',
    arp: 'pad',
    arpWave: 'tri',
    drums: { h: 'x...x...x...x...' },
    drumVol: 0.35,
  },

  /* Puben: a 12-bar boogie shuffle. Someone always plays the jukebox. */
  puben: {
    title: 'Fredagsboogie på Gyllene Ekorren',
    bpm: 136,
    steps: 16,
    swing: 0.33,
    chords: ['E7', 'E7', 'E7', 'E7', 'A7', 'A7', 'E7', 'E7', 'B7', 'A7', 'E7', 'B7'],
    res: 2,
    lead: `B5 - G#5 B5 E6 - D6 B5 | G#5 - E5 - . . E5 G5 | B5 - G#5 B5 E6 - D6 B5 | E6 - D6 - B5 - G5 G#5 |
           C#6 - A5 C#6 E6 - D6 C#6 | A5 - G5 - E5 - . . | B5 - G#5 B5 E6 - D6 B5 | G#5 - E5 - . . . . |
           F#6 - D#6 - B5 - A5 - | E6 - C#6 - A5 - G5 - | E5 G5 G#5 B5 E6 - B5 - | D#6 - F#6 - B5 - . .`,
    leadWave: 'sq50',
    leadVol: 0.75,
    bass: 'boogie',
    arp: 'none',
    drums: { k: 'x.......x.x.....', s: '....x.......x...', h: 'x.x.x.x.x.x.x.x.' },
  },

  /* Gymmet: four-on-the-floor workout beat. One more rep! */
  gymmet: {
    title: 'En repetition till',
    bpm: 150,
    steps: 16,
    chords: ['Em', 'C', 'D', 'B7', 'Em', 'C', 'D', 'B7'],
    res: 2,
    lead: `E5 . E5 . G5 . B5 . | C6 - B5 - G5 - E5 - | D6 . D6 . F#6 . A6 . | B5 - - - D#6 - B5 - |
           E6 B5 G5 B5 E6 B5 G5 B5 | E6 C6 G5 C6 E6 C6 G5 C6 | F#6 D6 A5 D6 F#6 D6 A5 D6 | D#6 B5 F#5 B5 D#6 - . .`,
    leadWave: 'sq50',
    leadVol: 0.7,
    bass: 'octaves',
    arp: 'none',
    drums: { k: 'x...x...x...x...', s: '....x.......x...', h: '..x...x...x...x.' },
  },
}
