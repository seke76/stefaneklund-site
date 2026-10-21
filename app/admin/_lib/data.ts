import { countKeys, pingDb, readDaily, recentErrors } from '@/lib/stats'
import { verifySession } from './session'

const WW = [
  'created',
  'created_multi',
  'created_open',
  'created_list',
  'created_orgmail',
  'answer',
  'responder',
  'round',
  'finalized',
  'email_sent',
  'email_failed',
  'error',
  'view_landing',
  'view_guest',
  'view_organizer',
] as const
const SITE = ['view_home', 'error'] as const

export type Series = { dates: string[]; values: number[] }
/** Totals for the chosen period and the one before it, plus the daily values of the chosen one. */
export type Metric = { now: number; before: number; daily: number[] }

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0)

function split<M extends string>(series: Record<M, number[]>, days: number) {
  const out = {} as Record<M, Metric>
  for (const m of Object.keys(series) as M[]) {
    const all = series[m]
    out[m] = { before: sum(all.slice(0, days)), now: sum(all.slice(days)), daily: all.slice(days) }
  }
  return out
}

/** Everything the dashboard shows. Checks the session itself, so it can never leak to a visitor. */
export async function loadDashboard(days: number) {
  if (!(await verifySession())) throw new Error('Not signed in')
  const [ww, site, db, errors, liveEvents] = await Promise.all([
    readDaily('whenworks', WW, days * 2),
    readDaily('site', SITE, days * 2),
    pingDb(),
    recentErrors(20),
    countKeys('ww:ev:*').catch(() => null),
  ])
  const t = ww.dates.length - 1
  return {
    days,
    dates: ww.dates.slice(days),
    whenworks: split(ww.series, days),
    site: split(site.series, days),
    today: {
      emailSent: ww.series.email_sent[t],
      emailFailed: ww.series.email_failed[t],
      errors: ww.series.error[t] + site.series.error[t],
    },
    health: {
      db,
      email: !!(process.env.RESEND_API_KEY && process.env.WW_EMAIL_FROM),
      liveEvents,
    },
    version: {
      env: process.env.VERCEL_ENV ?? 'local',
      sha: process.env.VERCEL_GIT_COMMIT_SHA ?? '',
      message: (process.env.VERCEL_GIT_COMMIT_MESSAGE ?? '').split('\n')[0],
      repo:
        process.env.VERCEL_GIT_REPO_OWNER && process.env.VERCEL_GIT_REPO_SLUG
          ? `${process.env.VERCEL_GIT_REPO_OWNER}/${process.env.VERCEL_GIT_REPO_SLUG}`
          : '',
    },
    errors,
  }
}

export type Dashboard = Awaited<ReturnType<typeof loadDashboard>>
