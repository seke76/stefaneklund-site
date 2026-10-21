import { track, type AppId } from '@/lib/stats'

/** Pages that may be counted, and the counter each one bumps. Anything else is ignored. */
const PAGES: Record<string, [AppId, string]> = {
  home: ['site', 'view_home'],
  ww: ['whenworks', 'view_landing'],
  ww_guest: ['whenworks', 'view_guest'],
  ww_org: ['whenworks', 'view_organizer'],
}

const BOT = /bot|crawl|spider|slurp|preview|headless|lighthouse/i

/** Page view beacon from <PageView>. Counts only; nothing about the visitor is stored. */
export async function POST(req: Request) {
  const page = PAGES[(await req.text()).slice(0, 20)]
  if (page && !BOT.test(req.headers.get('user-agent') ?? '')) await track(...page)
  return new Response(null, { status: 204 })
}
