'use server'

import { getStore } from './_lib/store'
import { DATE_RE, TIME_RE, fmt, slotKey } from './_lib/logic'
import { WW_STR } from './_lib/i18n'
import {
  TTL_MS,
  hashToken,
  loadAdmin,
  loadEvent,
  mayAnswer,
  nameKey,
  newSlug,
  newToken,
  notifyAddresses,
  sendEmails,
  toAdminView,
  toGuestView,
} from './_lib/server'
import type {
  AdminView,
  Answer,
  CreateInput,
  EventDoc,
  GuestView,
  Invitee,
  Lang,
  Result,
  Slot,
  StoredResponse,
} from './_lib/types'

const MAX_SLOTS = 60
const ANSWERS: Answer[] = ['yes', 'maybe', 'no']

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MAX_INVITEES = 50
const langOf = (l: unknown): Lang => (l === 'en' ? 'en' : 'sv')
const originOf = (o: unknown) => (typeof o === 'string' && /^https?:\/\/[^\s/]+$/.test(o) ? o : '')

const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '')
const fail = (error: string): Result<never> => ({ ok: false, error })

function cleanInvitees(list: unknown): Invitee[] {
  if (!Array.isArray(list)) return []
  const seen = new Set<string>()
  const out: Invitee[] = []
  for (const x of list.slice(0, MAX_INVITEES)) {
    const name = str(x?.name, 60)
    const emailIn = str(x?.email, 200)
    const email = EMAIL_RE.test(emailIn) ? emailIn : '' // email is optional
    if (!name || seen.has(nameKey(name))) continue
    seen.add(nameKey(name))
    out.push({ name, email })
  }
  return out
}

function cleanTimes(list: unknown): { date: string; time: string | null }[] {
  if (!Array.isArray(list)) return []
  const seen = new Set<string>()
  const out: { date: string; time: string | null }[] = []
  for (const x of list.slice(0, MAX_SLOTS)) {
    const date = x?.date
    const time = x?.time ?? null
    if (typeof date !== 'string' || !DATE_RE.test(date)) continue
    if (time !== null && (typeof time !== 'string' || !TIME_RE.test(time))) continue
    const k = slotKey({ date, time })
    if (seen.has(k)) continue
    seen.add(k)
    out.push({ date, time })
  }
  return out
}

async function run<T>(fn: () => Promise<Result<T>>): Promise<Result<T>> {
  try {
    return await fn()
  } catch (e) {
    console.error('Whenworks:', e)
    return fail('server')
  }
}

export async function createEvent(input: CreateInput): Promise<Result<{ slug: string; token: string }>> {
  return run(async () => {
    const title = str(input.title, 120)
    const organizer = str(input.organizer, 60)
    if (!title || !organizer) return fail('invalid')
    const mode = input.mode === 'open' ? 'open' : 'fixed'
    let range: EventDoc['range'] = null
    const slots: Slot[] = []
    if (mode === 'open') {
      const start = input.range?.start
      const end = input.range?.end || start
      if (!start || !end || !DATE_RE.test(start) || !DATE_RE.test(end) || end < start) return fail('invalid')
      if (fmt.range(start, end).length > MAX_SLOTS) return fail('invalid')
      range = { start, end }
    } else {
      for (const t of cleanTimes(input.slots)) slots.push({ id: slotKey(t), ...t, round: 1 })
      if (!slots.length) return fail('invalid')
    }
    const deadline = input.deadline && DATE_RE.test(input.deadline) ? input.deadline : null
    const now = Date.now()
    const token = newToken()
    const ev: EventDoc = {
      slug: newSlug(),
      adminHash: hashToken(token),
      title,
      desc: str(input.desc, 600),
      dur: /^\d{1,3}$/.test(input.dur) ? input.dur : '',
      durUnit: input.durUnit === 'd' ? 'd' : 'h',
      mode,
      range,
      slots,
      removed: [],
      organizer,
      deadline,
      mustAll: !!input.mustAll,
      showOthers: !!input.showOthers,
      allowSuggest: mode === 'open' || !!input.allowSuggest,
      round: 1,
      roundNote: '',
      finalSlotId: null,
      finalNote: '',
      invitees: cleanInvitees(input.invitees),
      invitesSent: 0,
      allowSelfAdd: input.allowSelfAdd !== false,
      createdAt: now,
      expiresAt: now + TTL_MS,
    }
    const store = getStore()
    // Retry in the unlikely case the slug is taken.
    while (await store.getEvent(ev.slug)) ev.slug = newSlug()

    const origin = originOf(input.origin)
    const withEmail = ev.invitees!.filter((i) => i.email)
    if (withEmail.length && origin) {
      const S = WW_STR[langOf(input.lang)]
      const link = `${origin}/whenworks/e/${ev.slug}`
      ev.invitesSent = await sendEmails(
        withEmail.map((i) => ({
          to: i.email,
          subject: S.mail_invite_subject(organizer, title),
          text: S.invite_msg(organizer, title, link),
        })),
      )
    }
    await store.putEvent(ev)
    return { ok: true, data: { slug: ev.slug, token } }
  })
}

/* ---------- Guest ---------- */

export async function getMyAnswers(slug: string, name: string): Promise<Result<Record<string, Answer>>> {
  return run(async () => {
    const l = await loadEvent(slug)
    if (!l) return fail('not_found')
    const r = await getStore().getResponse(slug, nameKey(str(name, 60)))
    return { ok: true, data: r?.answers ?? {} }
  })
}

export async function submitAnswers(
  slug: string,
  input: {
    name: string
    email: string
    answers: Record<string, Answer>
    suggestions: { date: string; time: string | null }[]
  },
): Promise<Result<GuestView>> {
  return run(async () => {
    const l = await loadEvent(slug)
    if (!l) return fail('not_found')
    const { ev } = l
    const name = str(input.name, 60)
    if (!name) return fail('invalid')
    if (!mayAnswer(l, name)) return fail('not_listed')
    const emailIn = str(input.email, 200)
    const email = EMAIL_RE.test(emailIn) ? emailIn : ''

    // New guest suggestions become slots. Ones that match an existing time reuse it.
    const store = getStore()
    const byKey = new Map(l.slots.map((s) => [slotKey(s), s]))
    const added: Slot[] = []
    if (ev.mode === 'open' || ev.allowSuggest) {
      for (const t of cleanTimes(input.suggestions).slice(0, 10)) {
        if (byKey.has(slotKey(t))) continue
        const s: Slot = { id: 'x_' + slotKey(t), ...t, round: ev.round, by: name }
        byKey.set(slotKey(t), s)
        added.push(s)
      }
    }
    const valid = new Set([...l.slots, ...added].map((s) => s.id))
    const answers: Record<string, Answer> = {}
    for (const [id, v] of Object.entries(input.answers ?? {})) {
      if (valid.has(id) && ANSWERS.includes(v)) answers[id] = v
    }
    // Suggesting a time that already exists counts as a yes for it.
    for (const t of cleanTimes(input.suggestions)) {
      const s = byKey.get(slotKey(t))
      if (s && !answers[s.id]) answers[s.id] = 'yes'
    }
    if (!Object.keys(answers).length) return fail('invalid')

    const key = nameKey(name)
    const prev = await store.getResponse(slug, key)
    const resp: StoredResponse = {
      name,
      // Keep an earlier address if the guest leaves the field empty when editing.
      email: email || prev?.email || '',
      // Keep answers to slots that are hidden right now.
      answers: { ...(prev?.answers ?? {}), ...answers },
      updatedAt: Date.now(),
    }
    await store.addSuggestions(slug, added, ev.expiresAt)
    await store.putResponse(slug, key, resp, ev.expiresAt)
    const fresh = await loadEvent(slug)
    return fresh ? { ok: true, data: toGuestView(fresh) } : fail('not_found')
  })
}

/* ---------- Organizer ---------- */

export async function getAdmin(slug: string, token: string): Promise<Result<AdminView>> {
  return run(async () => {
    const l = await loadAdmin(slug, token)
    return l ? { ok: true, data: toAdminView(l) } : fail('not_found')
  })
}

export async function askAgain(
  slug: string,
  token: string,
  input: {
    newSlots: { date: string; time: string | null }[]
    removed: string[]
    allowSuggest: boolean
    note: string
  },
): Promise<Result<AdminView>> {
  return run(async () => {
    const l = await loadAdmin(slug, token)
    if (!l) return fail('not_found')
    const { ev } = l
    const next = ev.round + 1
    const taken = new Set(l.slots.map(slotKey))
    const fresh = cleanTimes(input.newSlots)
      .filter((t) => !taken.has(slotKey(t)))
      .map((t) => ({ id: 'r' + next + '_' + slotKey(t), ...t, round: next }))
    if (!fresh.length && !input.allowSuggest) return fail('invalid')
    const visible = new Set(l.slots.map((s) => s.id))
    const removed = Array.isArray(input.removed) ? input.removed.filter((id) => visible.has(id)) : []
    const updated: EventDoc = {
      ...ev,
      slots: [...ev.slots, ...fresh].slice(0, MAX_SLOTS * 3),
      removed: [...ev.removed, ...removed],
      round: next,
      allowSuggest: !!input.allowSuggest,
      roundNote: str(input.note, 600),
    }
    await getStore().putEvent(updated)
    const reloaded = await loadAdmin(slug, token)
    return reloaded ? { ok: true, data: toAdminView(reloaded) } : fail('not_found')
  })
}

export async function finalize(
  slug: string,
  token: string,
  input: { slotId: string; note: string; notify: boolean; lang: Lang; link: string },
): Promise<Result<AdminView>> {
  return run(async () => {
    const l = await loadAdmin(slug, token)
    if (!l) return fail('not_found')
    const slot = l.slots.find((s) => s.id === input.slotId)
    if (!slot) return fail('invalid')
    const note = str(input.note, 600)
    await getStore().putEvent({ ...l.ev, finalSlotId: slot.id, finalNote: note })

    if (input.notify) {
      const lang = langOf(input.lang)
      const S = WW_STR[lang]
      const link = /^https?:\/\/[^\s]+$/.test(input.link) ? input.link : ''
      const text = [S.final_msg(l.ev.title, fmt.slot(slot, lang)), note, link].filter(Boolean).join('\n\n')
      await sendEmails(notifyAddresses(l).map((to) => ({ to, subject: S.mail_subject(l.ev.title), text })))
    }
    const reloaded = await loadAdmin(slug, token)
    return reloaded ? { ok: true, data: toAdminView(reloaded) } : fail('not_found')
  })
}
