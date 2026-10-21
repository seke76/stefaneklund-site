import { randomBytes } from 'node:crypto'
import { NextResponse, type NextRequest } from 'next/server'
import { STATE_COOKIE, authConfig, cookieOptions } from '../_lib/session'

/** Step 1: send the browser to GitHub with a one-time `state` that the callback checks. */
export async function GET(req: NextRequest) {
  const cfg = authConfig()
  if (!cfg) return NextResponse.redirect(new URL('/admin?error=config', req.url))
  const state = randomBytes(16).toString('base64url')
  const url = new URL('https://github.com/login/oauth/authorize')
  url.searchParams.set('client_id', cfg.id)
  url.searchParams.set('redirect_uri', `${req.nextUrl.origin}/admin/callback`)
  url.searchParams.set('state', state)
  url.searchParams.set('allow_signup', 'false')
  const res = NextResponse.redirect(url)
  res.cookies.set(STATE_COOKIE, state, cookieOptions(10 * 60))
  return res
}
