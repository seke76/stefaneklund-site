import { NextResponse, type NextRequest } from 'next/server'
import { logError } from '@/lib/stats'
import { SESSION_COOKIE, SESSION_DAYS, STATE_COOKIE, authConfig, cookieOptions, makeSession, safeEqual } from '../_lib/session'

/**
 * Step 2: GitHub sends the browser back with a code. Check `state`, swap the code for a token,
 * ask GitHub who this is, and only then set the session cookie. The GitHub token is not kept.
 */
export async function GET(req: NextRequest) {
  const done = (to: string) => {
    const res = NextResponse.redirect(new URL(to, req.url))
    res.cookies.delete({ name: STATE_COOKIE, path: '/admin' })
    return res
  }
  const cfg = authConfig()
  if (!cfg) return done('/admin?error=config')
  const code = req.nextUrl.searchParams.get('code')
  const state = req.nextUrl.searchParams.get('state')
  const saved = req.cookies.get(STATE_COOKIE)?.value
  if (!code || !state || !saved || !safeEqual(state, saved)) return done('/admin?error=state')

  try {
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: cfg.id,
        client_secret: cfg.secret,
        code,
        redirect_uri: `${req.nextUrl.origin}/admin/callback`,
      }),
    })
    const { access_token } = (await tokenRes.json()) as { access_token?: string }
    if (!access_token) return done('/admin?error=github')
    const userRes = await fetch('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${access_token}`, Accept: 'application/vnd.github+json', 'User-Agent': 'stefaneklund-admin' },
    })
    const { login } = (await userRes.json()) as { login?: string }
    if (!login || login.toLowerCase() !== cfg.user) return done('/admin?error=denied')
    const res = done('/admin')
    res.cookies.set(SESSION_COOKIE, makeSession(login, cfg.key), cookieOptions(SESSION_DAYS * 24 * 60 * 60))
    return res
  } catch (e) {
    await logError('site', 'admin login', e)
    return done('/admin?error=github')
  }
}
