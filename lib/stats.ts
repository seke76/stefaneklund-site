import { getRedis } from './redis'

/**
 * Usage statistics and error log for the admin page.
 *
 * Only counters are stored, one per app, metric and day: `st:{app}:{metric}:{yyyy-mm-dd}`
 * (Stockholm time). No names, emails, IP addresses or cookies. Counters live for a year,
 * so they outlast the Whenworks events themselves (60 days).
 */
export type AppId = 'site' | 'whenworks'

const COUNTER_TTL = 400 * 24 * 60 * 60 // seconds
const ERRORS_KEY = 'st:errors'
const MAX_ERRORS = 50
const ERRORS_TTL = 90 * 24 * 60 * 60

const key = (app: AppId, metric: string, day: string) => `st:${app}:${metric}:${day}`

/** Today's date in Stockholm as yyyy-mm-dd. */
export const today = () => new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Stockholm' }).format(new Date())

/** The last `days` dates, oldest first, ending today. */
export function lastDays(days: number): string[] {
  const end = Date.parse(today() + 'T12:00:00Z')
  return [...Array(days)].map((_, i) => new Date(end - (days - 1 - i) * 86_400_000).toISOString().slice(0, 10))
}

/* Local development without a database: keep counters in memory. */
type Mem = { counters: Map<string, number>; errors: string[] }
const mem = (): Mem => {
  const g = globalThis as unknown as { __stMem?: Mem }
  return (g.__stMem ??= { counters: new Map(), errors: [] })
}

/** Counts something that happened. Never throws: statistics must not break the apps. */
export async function track(app: AppId, metric: string | string[], n = 1) {
  const metrics = Array.isArray(metric) ? metric : [metric]
  if (!metrics.length || n <= 0) return
  const day = today()
  try {
    const redis = getRedis()
    if (!redis) {
      const m = mem().counters
      for (const x of metrics) m.set(key(app, x, day), (m.get(key(app, x, day)) ?? 0) + n)
      return
    }
    const p = redis.pipeline()
    for (const x of metrics) {
      p.incrby(key(app, x, day), n)
      p.expire(key(app, x, day), COUNTER_TTL)
    }
    await p.exec()
  } catch (e) {
    console.error('stats: track failed', e)
  }
}

export type LoggedError = { t: number; app: AppId; where: string; msg: string }

/** Keeps the latest errors (message only, no user data) and counts them per day. */
export async function logError(app: AppId, where: string, e: unknown) {
  const msg = (e instanceof Error ? e.message : String(e)).slice(0, 300)
  const entry: LoggedError = { t: Date.now(), app, where, msg }
  try {
    const redis = getRedis()
    if (!redis) {
      mem().errors.unshift(JSON.stringify(entry))
      mem().errors.length = Math.min(mem().errors.length, MAX_ERRORS)
    } else {
      const p = redis.pipeline()
      p.lpush(ERRORS_KEY, JSON.stringify(entry))
      p.ltrim(ERRORS_KEY, 0, MAX_ERRORS - 1)
      p.expire(ERRORS_KEY, ERRORS_TTL)
      await p.exec()
    }
  } catch (err) {
    console.error('stats: logError failed', err)
  }
  await track(app, 'error')
}

/** Daily values for each metric over the last `days` days, oldest first. Missing days are 0. */
export async function readDaily<M extends string>(app: AppId, metrics: readonly M[], days: number) {
  const dates = lastDays(days)
  const keys = metrics.flatMap((m) => dates.map((d) => key(app, m, d)))
  const redis = getRedis()
  const values: (number | string | null)[] = redis
    ? await redis.mget<(number | string | null)[]>(...keys)
    : keys.map((k) => mem().counters.get(k) ?? null)
  const series = {} as Record<M, number[]>
  metrics.forEach((m, i) => {
    series[m] = values.slice(i * dates.length, (i + 1) * dates.length).map((v) => Number(v) || 0)
  })
  return { dates, series }
}

export async function recentErrors(limit = 20): Promise<LoggedError[]> {
  const redis = getRedis()
  const raw = redis ? await redis.lrange<string | LoggedError>(ERRORS_KEY, 0, limit - 1) : mem().errors.slice(0, limit)
  // Upstash parses JSON values automatically; the memory store keeps strings.
  return raw.map((x) => (typeof x === 'string' ? (JSON.parse(x) as LoggedError) : x))
}

/** How many keys match a pattern, e.g. live Whenworks events. Capped so it stays cheap. */
export async function countKeys(pattern: string, cap = 10_000): Promise<number | null> {
  const redis = getRedis()
  if (!redis) return null
  let cursor: string | number = 0
  let n = 0
  do {
    const [next, keys]: [string | number, string[]] = await redis.scan(cursor, { match: pattern, count: 1000 })
    cursor = next
    n += keys.length
  } while (String(cursor) !== '0' && n < cap)
  return n
}

/** Round-trip time to the database in ms, or null when it doesn't answer (or isn't configured). */
export async function pingDb(): Promise<{ ok: boolean; ms: number | null; configured: boolean }> {
  const redis = getRedis()
  if (!redis) return { ok: false, ms: null, configured: false }
  const t = performance.now()
  try {
    await redis.ping()
    return { ok: true, ms: Math.round(performance.now() - t), configured: true }
  } catch {
    return { ok: false, ms: null, configured: true }
  }
}
