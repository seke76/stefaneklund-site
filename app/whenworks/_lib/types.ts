export type Lang = 'en' | 'sv'
export type Answer = 'yes' | 'maybe' | 'no'
export type DurUnit = 'h' | 'd'
export type Mode = 'fixed' | 'open'

export type Slot = {
  id: string
  date: string // YYYY-MM-DD
  time: string | null // HH:mm, null = all day
  round: number
  by?: string // guest who suggested it
}

export type Range = { start: string; end: string | null }

export type Invitee = { name: string; email: string } // email may be ''

/** Stored event document. Never sent to guests as-is. */
export type EventDoc = {
  slug: string
  adminHash: string
  title: string
  desc: string
  dur: string
  durUnit: DurUnit
  mode: Mode
  range: Range | null
  slots: Slot[] // organizer-proposed slots, all rounds
  removed: string[]
  organizer: string
  deadline: string | null
  mustAll: boolean
  showOthers: boolean
  allowSuggest: boolean
  round: number
  roundNote: string
  finalSlotId: string | null
  finalNote: string
  invitees?: Invitee[] // missing on events created before invitations existed
  invitesSent?: number
  allowSelfAdd?: boolean // with a guest list: may people not on it add themselves? (default true)
  createdAt: number
  expiresAt: number
}

export type StoredResponse = {
  name: string
  email: string
  answers: Record<string, Answer>
  tokenHash?: string // set on first answer; only that browser (or the personal link) may edit
  updatedAt: number
}

/** Fields shared by the guest and organizer views. */
export type EventInfo = {
  slug: string
  title: string
  desc: string
  dur: string
  durUnit: DurUnit
  mode: Mode
  organizer: string
  deadline: string | null
  mustAll: boolean
  showOthers: boolean
  allowSuggest: boolean
  round: number
  roundNote: string
  slots: Slot[] // visible slots, sorted
  final: { slot: Slot; note: string } | null
}

export type GuestResponder = { name: string; answers?: Record<string, Answer>; claimed?: boolean }

/** The visitor, recognised by their cookie or personal link. token is their own secret. */
export type Me = { name: string; answers: Record<string, Answer>; token: string }
/**
 * participants: names (never emails) on the guest list plus people who have answered.
 * Empty when the organizer added no guest list; then guests just type their name.
 */
export type GuestView = EventInfo & {
  responders: GuestResponder[]
  participants: string[]
  allowSelfAdd: boolean
  emailEnabled: boolean // hide the email field until email can be sent
  me: Me | null
}

export type AdminResponse = { name: string; hasEmail: boolean; answers: Record<string, Answer> }
export type AdminView = EventInfo & {
  responses: AdminResponse[]
  emailEnabled: boolean
  pendingInvitees: string[]
  invitesSent: number
  inviteEmails: number // invitees with an address
  notifyCount: number // unique addresses that get the "time is set" email
}

export type Result<T> = { ok: true; data: T } | { ok: false; error: string }

export type CreateInput = {
  title: string
  desc: string
  dur: string
  durUnit: DurUnit
  mode: Mode
  range: Range | null
  slots: { date: string; time: string | null }[]
  allowSuggest: boolean
  organizer: string
  deadline: string | null
  mustAll: boolean
  showOthers: boolean
  invitees: Invitee[]
  allowSelfAdd: boolean
  lang: Lang
  origin: string
}
