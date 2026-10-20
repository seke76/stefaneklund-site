import { createHash, randomBytes, timingSafeEqual } from 'node:crypto'
import { getStore } from './store'
import { findBest, fmt, spanOf, visibleSlots } from './logic'
import { WW_STR } from './i18n'
import type { AdminView, EventDoc, EventInfo, GuestView, Slot, StoredResponse } from './types'

export const TTL_MS = 60 * 24 * 60 * 60 * 1000
export const SLUG_RE = /^[A-Za-z0-9]{8}$/
export const TOKEN_RE = /^[A-Za-z0-9_-]{22}$/

const ALPHA = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789'
export function newSlug() {
  const b = randomBytes(8)
  return [...b].map((x) => ALPHA[x % ALPHA.length]).join('')
}
export const newToken = () => randomBytes(16).toString('base64url') // 128 bits
export const hashToken = (t: string) => createHash('sha256').update(t).digest('hex')

export const nameKey = (name: string) => name.trim().toLowerCase()

export const emailEnabled = () => !!(process.env.RESEND_API_KEY && process.env.WW_EMAIL_FROM)

type Loaded = { ev: EventDoc; slots: Slot[]; responses: StoredResponse[] }

export async function loadEvent(slug: string): Promise<Loaded | null> {
  if (!SLUG_RE.test(slug)) return null
  const store = getStore()
  const [ev, sugg, responses] = await Promise.all([
    store.getEvent(slug),
    store.getSuggestions(slug),
    store.getResponses(slug),
  ])
  if (!ev) return null
  responses.sort((a, b) => a.updatedAt - b.updatedAt)
  return { ev, slots: visibleSlots(ev, sugg), responses }
}

export async function loadAdmin(slug: string, token: string): Promise<Loaded | null> {
  if (!TOKEN_RE.test(token)) return null
  const loaded = await loadEvent(slug)
  if (!loaded) return null
  const a = Buffer.from(hashToken(token))
  const b = Buffer.from(loaded.ev.adminHash)
  return a.length === b.length && timingSafeEqual(a, b) ? loaded : null
}

function info({ ev, slots }: Loaded): EventInfo {
  const finalSlot = ev.finalSlotId ? slots.find((s) => s.id === ev.finalSlotId) : undefined
  return {
    slug: ev.slug,
    title: ev.title,
    desc: ev.desc,
    dur: ev.dur,
    durUnit: ev.durUnit,
    mode: ev.mode,
    organizer: ev.organizer,
    mustAll: ev.mustAll,
    showOthers: ev.showOthers,
    allowSuggest: ev.allowSuggest,
    round: ev.round,
    roundNote: ev.roundNote,
    slots,
    final: finalSlot ? { slot: finalSlot, note: ev.finalNote } : null,
  }
}

/** What anyone with the guest link may see. Other people's answers only when showOthers is on. */
/** Invited people (by name) who haven't answered yet. */
function pendingInvitees({ ev, responses }: Loaded) {
  const answered = new Set(responses.map((r) => nameKey(r.name)))
  return (ev.invitees ?? []).map((i) => i.name).filter((n) => !answered.has(nameKey(n)))
}

/** Everyone who should hear when the time is set: guests who left an address plus invitees. */
export function notifyAddresses({ ev, responses }: Loaded) {
  const all = [...responses.map((r) => r.email), ...(ev.invitees ?? []).map((i) => i.email)]
  const seen = new Set<string>()
  return all.filter((e) => e && !seen.has(e.toLowerCase()) && seen.add(e.toLowerCase()))
}

/** Guest list names plus everyone who answered, guest list order first. Empty without a guest list. */
function participants({ ev, responses }: Loaded) {
  const list = ev.invitees ?? []
  if (!list.length) return []
  const seen = new Set<string>()
  seen.add(nameKey(ev.organizer)) // guests can't pick the organizer
  return [...list.map((i) => i.name), ...responses.map((r) => r.name)].filter(
    (n) => !seen.has(nameKey(n)) && seen.add(nameKey(n)),
  )
}

/** The response a guest token belongs to, if any. */
export function responseFor(l: Loaded, token: string | undefined) {
  if (!token || !TOKEN_RE.test(token)) return undefined
  const h = hashToken(token)
  return l.responses.find((r) => r.tokenHash === h)
}

export function toGuestView(l: Loaded, token?: string): GuestView {
  const mine = responseFor(l, token)
  return {
    ...info(l),
    responders: l.responses.map((r) => ({
      name: r.name,
      ...(l.ev.showOthers ? { answers: r.answers } : {}),
      claimed: !!r.tokenHash,
    })),
    me: mine && token ? { name: mine.name, answers: mine.answers, token } : null,
    participants: participants(l),
    emailEnabled: emailEnabled(),
  }
}

export function toAdminView(l: Loaded): AdminView {
  return {
    ...info(l),
    responses: l.responses.map((r) => ({ name: r.name, hasEmail: !!r.email, answers: r.answers })),
    emailEnabled: emailEnabled(),
    pendingInvitees: pendingInvitees(l),
    invitesSent: l.ev.invitesSent ?? 0,
    inviteEmails: (l.ev.invitees ?? []).filter((i) => i.email).length,
    notifyCount: notifyAddresses(l).length,
    organizerMailed: !!l.ev.organizerMailed,
  }
}

/**
 * Everyone on the guest list has answered this round. Never true without a guest list.
 * In later rounds a person counts once they've answered one of that round's new times.
 */
function everyoneAnswered({ ev, slots, responses }: Loaded) {
  const list = ev.invitees ?? []
  if (!list.length) return false
  const roundIds = ev.round > 1 ? slots.filter((s) => s.round === ev.round).map((s) => s.id) : null
  if (roundIds && !roundIds.length) return false
  const byName = new Map(responses.map((r) => [nameKey(r.name), r]))
  return list.every((i) => {
    const a = byName.get(nameKey(i.name))?.answers ?? {}
    return roundIds ? roundIds.some((id) => a[id]) : Object.keys(a).length > 0
  })
}

/**
 * Emails the organizer once per round when everyone on the guest list has answered.
 * The organizer link can't be included (only its hash is stored), so the email points to
 * the one they got when the event was created.
 */
export async function notifyIfEveryoneAnswered(l: Loaded) {
  const { ev } = l
  if (!ev.organizerEmail || ev.finalSlotId || !emailEnabled() || !everyoneAnswered(l)) return
  if (!(await getStore().once(`${ev.slug}:all:${ev.round}`, ev.expiresAt))) return
  const lang = ev.lang ?? 'sv'
  const S = WW_STR[lang]
  const B = findBest(l.slots, l.responses, ev.mustAll)
  const when = (s: Slot) => fmt.slot(s, lang, s.time ? 1 : spanOf(ev))
  const status = B.full ? S.mail_all_full(when(B.full.s)) : B.closest[0] ? S.mail_all_closest(when(B.closest[0].s)) : ''
  await sendEmails([
    {
      to: ev.organizerEmail,
      subject: S.mail_all_subject(ev.title),
      text: S.mail_all_body(ev.title, (ev.invitees ?? []).length, status),
    },
  ])
}

export type Mail = { to: string; subject: string; text: string }

/**
 * Sends emails through Resend's batch endpoint (one email per recipient, so nobody
 * sees anyone else's address). Returns how many were accepted. Never throws.
 */
export async function sendEmails(mails: Mail[]): Promise<number> {
  const key = process.env.RESEND_API_KEY
  const from = process.env.WW_EMAIL_FROM
  if (!key || !from || !mails.length) return 0
  let sent = 0
  for (let i = 0; i < mails.length; i += 100) {
    const chunk = mails.slice(i, i + 100)
    try {
      const res = await fetch('https://api.resend.com/emails/batch', {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(chunk.map((m) => ({ from, to: [m.to], subject: m.subject, text: m.text }))),
      })
      if (res.ok) sent += chunk.length
      else console.error('Whenworks: email failed', res.status, await res.text().catch(() => ''))
    } catch (e) {
      console.error('Whenworks: email failed', e)
    }
  }
  return sent
}
