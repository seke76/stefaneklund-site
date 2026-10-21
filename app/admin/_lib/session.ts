import { createHmac, timingSafeEqual } from 'node:crypto'
import { cookies } from 'next/headers'
import { cache } from 'react'

/**
 * Admin login: "Sign in with GitHub", and only the GitHub account in ADMIN_GITHUB_USER gets in.
 * The session is a signed cookie (HMAC-SHA256 with ADMIN_SESSION_SECRET): `{payload}.{signature}`.
 * It can't be read by JavaScript (httpOnly), is only sent to /admin, and expires after 7 days.
 */
export const SESSION_COOKIE = 'adm_session'
export const STATE_COOKIE = 'adm_state'
export const SESSION_DAYS = 7

/** null when any of the four environment variables is missing; then nobody can sign in. */
export function authConfig() {
  const id = process.env.GITHUB_CLIENT_ID
  const secret = process.env.GITHUB_CLIENT_SECRET
  const key = process.env.ADMIN_SESSION_SECRET
  const user = process.env.ADMIN_GITHUB_USER
  if (!id || !secret || !key || key.length < 32 || !user) return null
  return { id, secret, key, user: user.toLowerCase() }
}

export const cookieOptions = (maxAge: number) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const, // lax so the cookie survives the redirect back from GitHub
  path: '/admin',
  maxAge,
})

const sign = (data: string, key: string) => createHmac('sha256', key).update(data).digest('base64url')

export function safeEqual(a: string, b: string) {
  const x = Buffer.from(a)
  const y = Buffer.from(b)
  return x.length === y.length && timingSafeEqual(x, y)
}

export function makeSession(login: string, key: string) {
  const exp = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000
  const payload = Buffer.from(JSON.stringify({ u: login.toLowerCase(), exp })).toString('base64url')
  return `${payload}.${sign(payload, key)}`
}

function readSession(value: string | undefined, key: string): string | null {
  const [payload, sig] = value?.split('.') ?? []
  if (!payload || !sig || !safeEqual(sig, sign(payload, key))) return null
  try {
    const { u, exp } = JSON.parse(Buffer.from(payload, 'base64url').toString())
    return typeof u === 'string' && typeof exp === 'number' && exp > Date.now() ? u : null
  } catch {
    return null
  }
}

/**
 * The signed-in admin's GitHub login, or null. Every admin page and data function calls this
 * on the server; the check is never left to the browser.
 */
export const verifySession = cache(async (): Promise<string | null> => {
  const cfg = authConfig()
  if (!cfg) return null
  const user = readSession((await cookies()).get(SESSION_COOKIE)?.value, cfg.key)
  return user === cfg.user ? user : null
})
