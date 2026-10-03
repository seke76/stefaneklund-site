import { createHash, randomBytes, timingSafeEqual } from 'node:crypto'
import { getStore } from './store'
import { visibleSlots } from './logic'
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
    deadline: ev.deadline,
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
export function toGuestView(l: Loaded): GuestView {
  return {
    ...info(l),
    responders: l.responses.map((r) => (l.ev.showOthers ? { name: r.name, answers: r.answers } : { name: r.name })),
  }
}

export function toAdminView(l: Loaded): AdminView {
  return {
    ...info(l),
    responses: l.responses.map((r) => ({ name: r.name, hasEmail: !!r.email, answers: r.answers })),
    emailEnabled: emailEnabled(),
  }
}

/** Sends the "time is set" email through Resend. Failures are logged, never thrown. */
export async function sendFinalEmails(to: string[], subject: string, text: string) {
  const key = process.env.RESEND_API_KEY
  const from = process.env.WW_EMAIL_FROM
  if (!key || !from || !to.length) return
  await Promise.all(
    to.map((addr) =>
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from, to: [addr], subject, text }),
      })
        .then((res) => {
          if (!res.ok) console.error('Whenworks: email failed', res.status)
        })
        .catch((e) => console.error('Whenworks: email failed', e)),
    ),
  )
}
