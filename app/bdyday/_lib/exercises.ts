import type { Exercise, Frame } from './types'

/*
 * The exercise library. Each exercise has a figure animation made of key poses (see figure.ts
 * for the angle convention). Families group easier and harder versions of one movement.
 */

/* ---------- Pose helpers ---------- */

/** Side view: swap near and far limbs (next step of an alternating movement). */
const swap = (p: Frame): Frame => ({ ...p, n: p.f ?? p.n, f: p.n, an: p.af ?? p.an, af: p.an })
/** Front view: mirror left and right. */
const mirror = (p: Frame): Frame => {
  const neg = (l: Frame['n']): Frame['n'] => [-l[0], -l[1], l[2] === undefined ? undefined : -l[2]]
  return { ...p, t: -p.t, h: p.h === undefined ? undefined : -p.h, n: neg(p.f ?? p.n), f: neg(p.n), an: neg(p.af ?? p.an), af: neg(p.an) }
}

// Standing, side view
const STAND: Frame = { t: 180, n: [0, 0], an: [4, 12], af: [-4, 8] }
const STAND_CLASP: Frame = { t: 180, n: [0, 0], an: [25, 165] }
const SQUAT: Frame = { t: 148, n: [88, -28], an: [85, 90] }
const SQUAT_LOAD: Frame = { t: 145, n: [88, -28], an: [-35, -25] }
const JUMP: Frame = { t: 180, n: [0, 0, 25], an: [150, 168], af: [140, 160], lift: 36 }
const LUNGE: Frame = { t: 180, n: [85, 0], f: [-10, -95], an: [25, 165] }

// Floor, side view
const PUSH_HIGH: Frame = { t: 112, n: [-68, -68], an: [0, 0] }
const PUSH_LOW: Frame = { t: 102, n: [-76, -76], an: [-50, 35], pin: 'nw' }
const PLANK: Frame = { t: 100, n: [-80, -80], an: [0, 90] }

// On the back, head to the right
const BACK: Pick<Frame, 't' | 'h'> = { t: 90, h: 90 }

// Front view
const STANDF: Frame = { t: 180, n: [5, 0], f: [-5, 0], an: [10, 6], af: [-10, -6] }
const STANDF_CLASP: Frame = { t: 180, n: [6, 0], f: [-6, 0], an: [20, -160], af: [-20, 160] }

/* ---------- Text helper ---------- */
const tx = (sv: string, en: string) => ({ sv, en })

export const EXERCISES: Exercise[] = [
  /* ===== Push ===== */
  {
    id: 'knee-pushup', family: 'push', level: 1, role: 'main', source: 'bdy',
    name: tx('Armhävning på knä', 'Knee push-up'),
    cue: tx('Knäna i golvet, rak linje från knä till huvud. Bröstet nästan i golvet.', 'Knees down, straight line from knees to head. Chest almost to the floor.'),
    focus: ['upper'], metric: 'reps', sides: 'both', view: 'side',
    frames: [{ t: 120, n: [-48, -100], an: [0, 0] }, { t: 104, n: [-64, -104], an: [-50, 35], pin: 'nw' }],
  },
  {
    id: 'pushup', family: 'push', level: 2, role: 'main', source: 'bdy',
    name: tx('Armhävning', 'Push-up'),
    cue: tx('Spänn magen så kroppen blir en planka. Armbågarna snett bakåt.', 'Brace so your body is a plank. Elbows angled back.'),
    focus: ['upper'], metric: 'reps', sides: 'both', view: 'side',
    frames: [PUSH_HIGH, PUSH_LOW],
  },
  {
    id: 'wide-pushup', family: 'push', level: 2, role: 'main', source: 'outside',
    name: tx('Bred armhävning', 'Wide push-up'),
    cue: tx('Händerna lite bredare än axlarna. Sänk tills bröstet är några cm från marken.', 'Hands a bit wider than your shoulders. Lower until your chest is a few cm off the ground.'),
    focus: ['upper'], metric: 'reps', sides: 'both', view: 'side',
    frames: [PUSH_HIGH, PUSH_LOW],
  },
  {
    id: 'triangle-pushup', family: 'push', level: 3, role: 'main', source: 'outside',
    name: tx('Triangelarmhävning', 'Triangle push-up'),
    cue: tx('Tummar och pekfingrar bildar en triangel under bröstet. Sänk långsamt, pausa, tryck upp.', 'Thumbs and index fingers form a triangle under your chest. Lower slowly, pause, press up.'),
    focus: ['upper'], metric: 'reps', sides: 'both', view: 'side',
    frames: [PUSH_HIGH, PUSH_LOW],
  },
  {
    id: 'pike-pushup', family: 'push', level: 3, role: 'main', source: 'bdy',
    name: tx('Pike-armhävning', 'Pike push-up'),
    cue: tx('Höften högt som ett upp-och-nervänt V. Sänk huvudet mot golvet framför händerna.', 'Hips high like an upside-down V. Lower your head towards the floor in front of your hands.'),
    focus: ['upper'], metric: 'reps', sides: 'both', view: 'side',
    frames: [{ t: 45, n: [-35, -35], an: [8, 8] }, { t: 32, n: [-40, -40], an: [-55, 30], pin: 'nw' }],
  },

  /* ===== Pull ===== */
  {
    id: 'hang', family: 'pull', level: 1, role: 'main', source: 'outside', needs: 'bar',
    name: tx('Häng', 'Hang'),
    cue: tx('Brett överhandsgrepp. Spänn magen, böj knäna och häng kvar.', 'Wide overhand grip. Brace your core, bend your knees and hold on.'),
    focus: ['upper', 'core'], metric: 'hold', sides: 'both', view: 'side',
    frames: [{ t: 180, n: [15, -60], an: [174, 178] }],
  },
  {
    id: 'negative-pullup', family: 'pull', level: 2, role: 'main', source: 'bdy', needs: 'bar',
    name: tx('Negativ chins', 'Negative pull-up'),
    cue: tx('Hoppa upp till toppläget och sänk dig så långsamt du kan.', 'Jump to the top and lower yourself as slowly as you can.'),
    focus: ['upper'], metric: 'reps', sides: 'both', view: 'side', tempo: 'slow',
    frames: [{ t: 180, n: [15, -60], an: [20, 178] }, { t: 180, n: [15, -60], an: [180, 180] }],
  },
  {
    id: 'pullup', family: 'pull', level: 3, role: 'main', source: 'outside', needs: 'bar',
    name: tx('Chins', 'Pull-up'),
    cue: tx('Dra ihop skulderbladen och dra tills nyckelbenen når stången. Sänk kontrollerat.', 'Pull your shoulder blades together and pull until your collarbones reach the bar. Lower with control.'),
    focus: ['upper'], metric: 'reps', sides: 'both', view: 'side',
    frames: [{ t: 180, n: [15, -60], an: [180, 180] }, { t: 180, n: [15, -60], an: [20, 178] }],
  },
  {
    id: 'superman', family: 'back', level: 1, role: 'main', source: 'bdy',
    name: tx('Superman', 'Superman'),
    cue: tx('Ligg på magen. Lyft armar, bröst och ben samtidigt och håll en sekund.', 'Lie on your front. Lift arms, chest and legs together and hold for a second.'),
    focus: ['upper', 'core'], metric: 'reps', sides: 'both', view: 'side',
    frames: [{ ...BACK, n: [-90, -90], an: [92, 92] }, { t: 100, h: 106, n: [-100, -100], an: [110, 110] }],
  },

  /* ===== Squat ===== */
  {
    id: 'squat', family: 'squat', level: 1, role: 'main', source: 'bdy',
    name: tx('Knäböj', 'Squat'),
    cue: tx('Fötterna axelbrett. Sitt bakåt tills låren är parallella med marken, bröstet uppe.', 'Feet shoulder-width. Sit back until your thighs are parallel to the ground, chest up.'),
    focus: ['legs'], metric: 'reps', sides: 'both', view: 'side',
    frames: [STAND, SQUAT],
  },
  {
    id: 'heel-elevated-squat', family: 'squat', level: 1, role: 'main', source: 'runnersworld', needs: 'step',
    name: tx('Knäböj på kil', 'Heel-elevated squat'),
    cue: tx('Hälarna på en kil eller kant. Sänk dig så djupt det känns bra och res dig rak.', 'Heels on a wedge or edge. Go as deep as feels good, then stand tall.'),
    focus: ['legs', 'runner'], metric: 'reps', sides: 'both', view: 'side', tempo: 'slow',
    frames: [{ ...STAND, n: [0, 0, 55] }, { t: 158, n: [108, -38, 55], an: [88, 90], pin: 'nt' }],
    box: 'na',
  },
  {
    id: 'jump-squat', family: 'squat', level: 2, role: 'main', source: 'outside', tempo: 'explosive',
    name: tx('Knäböjshopp', 'Jump squat'),
    cue: tx('Sänk dig kontrollerat, hoppa så högt du kan och landa mjukt rakt ner i nästa knäböj.', 'Lower with control, jump as high as you can and land softly straight into the next squat.'),
    focus: ['legs', 'power', 'runner'], metric: 'reps', sides: 'both', view: 'side',
    frames: [SQUAT_LOAD, JUMP],
  },

  /* ===== Single leg ===== */
  {
    id: 'reverse-lunge', family: 'single-leg', level: 1, role: 'main', source: 'bdy',
    name: tx('Bakåtutfall', 'Reverse lunge'),
    cue: tx('Kliv bakåt och sänk bakre knät mot marken. Tryck tillbaka med främre foten.', 'Step back and lower your back knee towards the ground. Push back up through your front foot.'),
    focus: ['legs'], metric: 'reps', sides: 'alternate', view: 'side',
    frames: [STAND_CLASP, { ...LUNGE, pin: 'nt' }],
  },
  {
    id: 'bulgarian-split-squat', family: 'single-leg', level: 2, role: 'main', source: 'runnersworld', needs: 'step', tempo: 'slow',
    name: tx('Bulgariskt utfall', 'Bulgarian split squat'),
    cue: tx('Bakre fotryggen på en bänk eller stol. Tyngden på främre benet, upp och ner långsamt.', 'Back foot on a bench or chair. Weight on the front leg, up and down slowly.'),
    focus: ['legs', 'runner'], metric: 'reps', sides: 'each', view: 'side',
    frames: [{ t: 178, n: [8, -4], f: [-15, -100, -90], an: [-15, 40] }, { t: 172, n: [75, -8], f: [-5, -157, -95], an: [-15, 40], pin: 'nt' }],
    box: 'fa',
  },
  {
    id: 'single-leg-squat', family: 'single-leg', level: 3, role: 'main', source: 'outside',
    name: tx('Enbensknäböj', 'Single-leg squat'),
    cue: tx('Andra benet och armarna rakt fram. Sänk dig så långt du kan. Lättare: håll en tung sten som motvikt.', 'Other leg and arms straight out in front. Lower as far as you can. Easier: hold a heavy rock as a counterweight.'),
    focus: ['legs'], metric: 'reps', sides: 'each', view: 'side',
    frames: [{ t: 178, n: [0, 0], f: [60, 60], an: [90, 90] }, { t: 145, n: [100, -32], f: [85, 85], an: [88, 88], pin: 'nt' }],
  },

  /* ===== Lunges ===== */
  {
    id: 'forward-lunge', family: 'lunge', level: 1, role: 'main', source: 'outside',
    name: tx('Utfall framåt', 'Forward lunge'),
    cue: tx('Ta ett långt kliv fram tills båda knäna är 90°. Tryck tillbaka med främre foten.', 'Take a long step forward until both knees are at 90°. Push back with your front foot.'),
    focus: ['legs'], metric: 'reps', sides: 'alternate', view: 'side',
    frames: [STAND_CLASP, { ...LUNGE, pin: 'ft' }],
  },
  {
    id: 'split-jump', family: 'lunge', level: 3, role: 'main', source: 'runnersworld', tempo: 'explosive',
    name: tx('Splitjump', 'Split jump'),
    cue: tx('Hoppa högt ur utfallet och byt ben i luften. Ta i ordentligt uppåt.', 'Jump high out of the lunge and switch legs in the air. Drive hard upwards.'),
    focus: ['legs', 'power', 'runner'], metric: 'reps', sides: 'alternate', view: 'side',
    frames: [
      { ...LUNGE, an: [-30, -10], af: [30, 100] },
      { t: 180, n: [30, -20], f: [-20, -40], an: [40, 120], af: [-40, -20], lift: 34 },
      swap({ ...LUNGE, an: [-30, -10], af: [30, 100] }),
      { t: 180, n: [-20, -40], f: [30, -20], an: [-40, -20], af: [40, 120], lift: 34 },
    ],
  },

  /* ===== Lateral ===== */
  {
    id: 'lateral-lunge', family: 'lateral', level: 1, role: 'main', source: 'outside',
    name: tx('Sidoutfall', 'Lateral lunge'),
    cue: tx('Kliv brett åt sidan och böj det benet. Andra benet rakt. Tryck tillbaka.', 'Step wide to the side and bend that leg. Keep the other leg straight. Push back.'),
    focus: ['legs', 'runner'], metric: 'reps', sides: 'alternate', view: 'front',
    frames: [STANDF_CLASP, { ...STANDF_CLASP, t: 168, n: [60, -24], f: [-45, -45], pin: 'ft' }],
  },
  {
    id: 'speed-skater', family: 'lateral', level: 2, role: 'main', source: 'outside', tempo: 'explosive',
    name: tx('Skridskohopp', 'Speed skater'),
    cue: tx('Hoppa i sidled från fot till fot. Låt armarna svinga med och landa mjukt.', 'Leap sideways from foot to foot. Let your arms swing and land softly.'),
    focus: ['legs', 'power'], metric: 'reps', sides: 'alternate', view: 'front',
    frames: [
      { t: 162, n: [14, -6], f: [32, 22], an: [-40, -30], af: [-55, -50] },
      mirror({ t: 162, n: [14, -6], f: [32, 22], an: [-40, -30], af: [-55, -50] }),
    ],
  },

  /* ===== Core ===== */
  {
    id: 'dead-bug', family: 'core', level: 1, role: 'main', source: 'bdy',
    name: tx('Dead bug', 'Dead bug'),
    cue: tx('Ländryggen i golvet. Sträck ut motsatt arm och ben långsamt, byt sida.', 'Lower back on the floor. Slowly extend the opposite arm and leg, then switch.'),
    focus: ['core'], metric: 'reps', sides: 'alternate', view: 'side',
    frames: [
      { ...BACK, n: [180, -90], an: [180, 180] },
      { ...BACK, n: [180, -90], f: [-95, -95], an: [95, 95], af: [180, 180] },
      { ...BACK, n: [180, -90], an: [180, 180] },
      { ...BACK, n: [-95, -95], f: [180, -90], an: [180, 180], af: [95, 95] },
    ],
  },
  {
    id: 'bicycle-crunch', family: 'core', level: 2, role: 'main', source: 'outside',
    name: tx('Cykelcrunch', 'Bicycle crunch'),
    cue: tx('Ländryggen i golvet. Armbåge mot motsatt knä medan andra benet sträcks ut.', 'Lower back on the floor. Elbow to opposite knee while the other leg extends.'),
    focus: ['core'], metric: 'reps', sides: 'alternate', view: 'side',
    frames: [
      { t: 104, h: 112, n: [150, -95], f: [-100, -100], an: [150, 60] },
      { t: 104, h: 112, n: [-100, -100], f: [150, -95], an: [150, 60] },
    ],
  },
  {
    id: 'leg-raise', family: 'core', level: 2, role: 'main', source: 'outside',
    name: tx('Raka benlyft', 'Straight-leg raise'),
    cue: tx('Händerna under rumpan. Lyft raka ben tills låren pekar rakt upp, sänk långsamt.', 'Hands under your bottom. Raise straight legs until your thighs point up, lower slowly.'),
    focus: ['core'], metric: 'reps', sides: 'both', view: 'side',
    frames: [{ ...BACK, n: [-94, -94], an: [-88, -90] }, { ...BACK, n: [178, 178], an: [-88, -90] }],
  },
  {
    id: 'hollow-hold', family: 'core', level: 3, role: 'main', source: 'bdy',
    name: tx('Hollow hold', 'Hollow hold'),
    cue: tx('Ländryggen i golvet, axlar och ben lyfta. Armarna sträckta bakom huvudet.', 'Lower back on the floor, shoulders and legs lifted. Arms reaching overhead.'),
    focus: ['core'], metric: 'hold', sides: 'both', view: 'side',
    frames: [{ t: 102, h: 108, n: [-102, -102], an: [112, 112] }],
  },
  {
    id: 'plank', family: 'plank', level: 1, role: 'main', source: 'bdy',
    name: tx('Planka', 'Plank'),
    cue: tx('Underarmarna i golvet, rak linje från huvud till häl. Andas.', 'Forearms on the floor, straight line from head to heels. Breathe.'),
    focus: ['core'], metric: 'hold', sides: 'both', view: 'side',
    frames: [PLANK],
  },
  {
    id: 'mountain-climber', family: 'plank', level: 2, role: 'main', source: 'outside', tempo: 'explosive',
    name: tx('Mountain climber', 'Mountain climber'),
    cue: tx('Från hög planka: dra knä mot bröst, byt snabbt. Höften låg.', 'From a high plank: drive a knee to your chest, switch fast. Hips low.'),
    focus: ['core', 'power'], metric: 'reps', sides: 'alternate', view: 'side',
    frames: [
      { ...PUSH_HIGH, n: [55, -20], f: [-68, -68] },
      { ...PUSH_HIGH, n: [-68, -68], f: [55, -20], pin: 'nw' },
    ],
  },
  {
    id: 'side-plank', family: 'side-plank', level: 2, role: 'main', source: 'outside',
    name: tx('Sidoplanka', 'Side plank'),
    cue: tx('Underarmen under axeln, fötterna på varandra. Lyft höften till en rak linje.', 'Forearm under your shoulder, feet stacked. Lift your hips into a straight line.'),
    focus: ['core', 'runner'], metric: 'hold', sides: 'each', view: 'front',
    frames: [{ t: 106, n: [-74, -74], an: [0, 90], af: [-70, -120] }],
  },
  {
    id: 'side-plank-rotation', family: 'side-plank', level: 3, role: 'main', source: 'bdy',
    name: tx('Sidoplanka med rotation', 'Side plank with rotation'),
    cue: tx('I sidoplanka: sträck armen mot taket och trä den sedan under kroppen. Höften stilla.', 'In a side plank: reach to the ceiling, then thread the arm under your body. Hips still.'),
    focus: ['core', 'runner'], metric: 'reps', sides: 'each', view: 'front',
    frames: [{ t: 106, n: [-74, -74], an: [0, 90], af: [180, 180] }, { t: 102, n: [-74, -74], an: [0, 90], af: [10, -70], pin: 'nw' }],
  },

  /* ===== Posterior chain ===== */
  {
    id: 'bridge', family: 'bridge', level: 1, role: 'main', source: 'outside',
    name: tx('Höftlyft', 'Bridge'),
    cue: tx('Fötterna i golvet. Kläm ihop rumpan och lyft höften tills kroppen är rak från axlar till knän.', 'Feet flat. Squeeze your glutes and lift your hips until you are straight from shoulders to knees.'),
    focus: ['legs', 'core'], metric: 'reps', sides: 'both', view: 'side',
    frames: [{ ...BACK, n: [-135, -45, -90], an: [-90, -90] }, { t: 66, h: 90, n: [-114, -21, -90], an: [-90, -90], pin: 'nt' }],
  },
  {
    id: 'single-leg-bridge', family: 'bridge', level: 2, role: 'main', source: 'bdy',
    name: tx('Enbens höftlyft', 'Single-leg bridge'),
    cue: tx('Ena benet sträckt. Lyft höften med det andra utan att höften tippar.', 'One leg straight. Lift your hips with the other without letting them tilt.'),
    focus: ['legs', 'runner'], metric: 'reps', sides: 'each', view: 'side',
    frames: [{ ...BACK, n: [-135, -45, -90], f: [-125, -125], an: [-90, -90] }, { t: 66, h: 90, n: [-114, -21, -90], f: [-114, -114], an: [-90, -90], pin: 'nt' }],
  },
  {
    id: 'single-leg-rdl', family: 'hinge', level: 2, role: 'main', source: 'bdy',
    name: tx('Enbens marklyft', 'Single-leg deadlift'),
    cue: tx('Fäll fram från höften medan bakre benet lyfts. Rak rygg, mjukt knä.', 'Hinge forward from the hip as the back leg lifts. Flat back, soft knee.'),
    focus: ['legs', 'runner'], metric: 'reps', sides: 'each', view: 'side', tempo: 'slow',
    frames: [{ ...STAND, f: [-6, -10] }, { t: 96, h: 100, n: [8, -6], f: [-86, -86], an: [0, 0], pin: 'nt' }],
  },
  {
    id: 'side-leg-raise', family: 'hip', level: 1, role: 'main', source: 'bdy',
    name: tx('Benlyft på sidan', 'Side-lying leg raise'),
    cue: tx('Ligg på sidan. Lyft det övre benet rakt upp, tårna framåt. Sänk långsamt.', 'Lie on your side. Lift the top leg straight up, toes forward. Lower slowly.'),
    focus: ['legs', 'runner'], metric: 'reps', sides: 'each', view: 'front',
    frames: [{ ...BACK, n: [-90, -90], f: [-92, -92], an: [130, -170], af: [-70, -100] }, { ...BACK, n: [-90, -90], f: [-130, -130], an: [130, -170], af: [-70, -100] }],
  },

  /* ===== Calves and springs ===== */
  {
    id: 'calf-raise', family: 'calf', level: 1, role: 'main', source: 'bdy',
    name: tx('Tåhävning', 'Calf raise'),
    cue: tx('Gå upp så högt du kan på tårna och sänk långsamt.', 'Rise as high as you can onto your toes and lower slowly.'),
    focus: ['legs', 'runner'], metric: 'reps', sides: 'both', view: 'side', tempo: 'slow',
    frames: [STAND, { ...STAND, n: [0, 0, 30], pin: 'nt' }],
  },
  {
    id: 'single-leg-calf-raise', family: 'calf', level: 2, role: 'main', source: 'bdy',
    name: tx('Enbens tåhävning', 'Single-leg calf raise'),
    cue: tx('Stå på ett ben. Hela vägen upp, långsamt ner.', 'Stand on one leg. All the way up, slowly down.'),
    focus: ['legs', 'runner'], metric: 'reps', sides: 'each', view: 'side', tempo: 'slow',
    frames: [{ ...STAND, n: [0, 0], f: [10, -75] }, { ...STAND, n: [0, 0, 30], f: [10, -75], pin: 'nt' }],
  },
  {
    id: 'step-calf-raise', family: 'calf', level: 3, role: 'main', source: 'runnersworld', needs: 'step',
    name: tx('Tåhävning på trapp', 'Single-leg calf raise on a step'),
    cue: tx('Framfoten på en trappkant. Sänk hälen så långt du kan och lyft igen. Jobba långsamt.', 'Ball of the foot on a step. Lower your heel as far as you can, then rise. Work slowly.'),
    focus: ['legs', 'runner'], metric: 'reps', sides: 'each', view: 'side', tempo: 'slow',
    frames: [{ ...STAND, n: [0, 0, 118], f: [10, -75], lift: 28 }, { ...STAND, n: [0, 0, 32], f: [10, -75], pin: 'nt' }],
    box: 'nt',
  },
  {
    id: 'fast-calf-raise', family: 'spring', level: 1, role: 'main', source: 'runnersworld', tempo: 'explosive',
    name: tx('Snabba tåhävningar', 'Fast calf raises'),
    cue: tx('Snabbt och med tempo. Så högt du kan, hälen snuddar precis marken innan nästa.', 'Quick and rhythmic. As high as you can, heels just touch the ground before the next one.'),
    focus: ['legs', 'power', 'runner'], metric: 'reps', sides: 'both', view: 'side',
    frames: [STAND, { ...STAND, n: [0, 0, 28], lift: 6, pin: 'nt' }],
  },
  {
    id: 'single-leg-hop', family: 'spring', level: 3, role: 'main', source: 'runnersworld', tempo: 'explosive',
    name: tx('Enbenshopp', 'Single-leg hops'),
    cue: tx('Hoppa på ett ben med så kort markkontakt som möjligt. Studsa, sjunk inte.', 'Hop on one leg with as little ground contact as possible. Bounce, don’t sink.'),
    focus: ['legs', 'power', 'runner'], metric: 'reps', sides: 'each', view: 'side',
    frames: [{ t: 178, n: [4, -4], f: [10, -80], an: [-20, 20], af: [20, 60] }, { t: 180, n: [0, 0, 25], f: [10, -80], an: [20, 60], af: [-20, 20], lift: 24 }],
  },
  {
    id: 'burpee', family: 'burpee', level: 3, role: 'main', source: 'bdy', tempo: 'explosive',
    name: tx('Burpee', 'Burpee'),
    cue: tx('Ner med händerna, hoppa bak till planka, in igen och hoppa upp med armarna i luften.', 'Hands down, jump back to a plank, back in and jump up with your arms overhead.'),
    focus: ['power', 'legs'], metric: 'reps', sides: 'both', view: 'side',
    frames: [STAND, { t: 125, n: [105, -45], an: [0, 0] }, PUSH_HIGH, { t: 125, n: [105, -45], an: [0, 0] }, JUMP],
  },

  /* ===== Warm-up ===== */
  {
    id: 'jumping-jacks', family: 'warmup-jacks', level: 1, role: 'warmup', source: 'bdy',
    name: tx('Hampelmannen', 'Jumping jacks'),
    cue: tx('Lätta hopp, armar och ben ut och in.', 'Light jumps, arms and legs out and in.'),
    focus: ['power'], metric: 'reps', sides: 'both', view: 'front',
    frames: [STANDF, { t: 180, n: [22, 22], f: [-22, -22], an: [150, 165], af: [-150, -165], lift: 6 }],
  },
  {
    id: 'high-knees', family: 'warmup-knees', level: 1, role: 'warmup', source: 'bdy',
    name: tx('Höga knän', 'High knees'),
    cue: tx('Spring på stället och dra knäna högt. Aktiva armar.', 'Run on the spot and drive your knees high. Active arms.'),
    focus: ['power', 'runner'], metric: 'reps', sides: 'alternate', view: 'side',
    frames: [
      { t: 178, n: [85, 0], f: [0, 0, 70], an: [-35, 30], af: [35, 120], lift: 4 },
      { t: 178, n: [0, 0, 70], f: [85, 0], an: [35, 120], af: [-35, 30], lift: 4 },
    ],
  },
  {
    id: 'leg-swings', family: 'warmup-swings', level: 1, role: 'warmup', source: 'bdy',
    name: tx('Bensving', 'Leg swings'),
    cue: tx('Sving benet fram och tillbaka, avslappnat. Håll i något för balans.', 'Swing your leg forward and back, relaxed. Hold on to something for balance.'),
    focus: ['runner'], metric: 'reps', sides: 'each', view: 'side',
    frames: [{ t: 180, n: [62, 62], f: [0, 0], an: [80, 80] }, { t: 180, n: [-32, -32], f: [0, 0], an: [80, 80], pin: 'ft' }],
  },
  {
    id: 'arm-circles', family: 'warmup-arms', level: 1, role: 'warmup', source: 'bdy',
    name: tx('Armcirklar', 'Arm circles'),
    cue: tx('Raka armar ut åt sidorna. Små cirklar som blir större.', 'Straight arms out to the sides. Small circles that grow bigger.'),
    focus: ['upper'], metric: 'reps', sides: 'both', view: 'front',
    frames: [
      { ...STANDF, an: [90, 90], af: [-90, -90] },
      { ...STANDF, an: [125, 125], af: [-125, -125] },
      { ...STANDF, an: [90, 90], af: [-90, -90] },
      { ...STANDF, an: [55, 55], af: [-55, -55] },
    ],
  },
  {
    id: 'lunge-rotation', family: 'warmup-lunge', level: 1, role: 'warmup', source: 'bdy',
    name: tx('Utfall med rotation', 'Lunge with rotation'),
    cue: tx('I utfallet: vrid överkroppen mot främre benet och sträck armen mot taket.', 'In the lunge: rotate towards your front leg and reach to the ceiling.'),
    focus: ['runner', 'legs'], metric: 'reps', sides: 'alternate', view: 'side',
    frames: [LUNGE, { ...LUNGE, an: [172, 172], af: [8, 8], pin: 'ft' }],
  },
]

export const byId = (id: string) => EXERCISES.find((e) => e.id === id)

/** Easier and harder versions of an exercise, if there are any. */
export function neighbours(ex: Exercise) {
  const fam = EXERCISES.filter((e) => e.family === ex.family && e.role === ex.role)
  return {
    easier: fam.filter((e) => e.level < ex.level).sort((a, b) => b.level - a.level)[0],
    harder: fam.filter((e) => e.level > ex.level).sort((a, b) => a.level - b.level)[0],
  }
}
