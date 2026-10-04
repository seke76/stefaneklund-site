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

export type Invitee = { name: string; email: string }

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
  createdAt: number
  expiresAt: number
}

export type StoredResponse = {
  name: string
  email: string
  answers: Record<string, Answer>
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

export type GuestResponder = { name: string; answers?: Record<string, Answer> }
/** pendingInvitees: names (never emails) of invited people who haven't answered yet. */
export type GuestView = EventInfo & { responders: GuestResponder[]; pendingInvitees: string[] }

export type AdminResponse = { name: string; hasEmail: boolean; answers: Record<string, Answer> }
export type AdminView = EventInfo & {
  responses: AdminResponse[]
  emailEnabled: boolean
  pendingInvitees: string[]
  invitesSent: number
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
  lang: Lang
  origin: string
}
