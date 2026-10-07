import { Redis } from '@upstash/redis'
import type { EventDoc, Slot, StoredResponse } from './types'

/**
 * Storage for Whenworks.
 *
 * Production uses Upstash Redis (add it to the Vercel project from the Marketplace;
 * it sets KV_REST_API_URL/KV_REST_API_TOKEN or UPSTASH_REDIS_REST_URL/UPSTASH_REDIS_REST_TOKEN).
 * Every key expires with the event, so events delete themselves after 60 days.
 *
 * Without those variables, a local in-memory store is used during development.
 */
type Store = {
  getEvent(slug: string): Promise<EventDoc | null>
  putEvent(ev: EventDoc): Promise<void>
  getSuggestions(slug: string): Promise<Slot[]>
  addSuggestions(slug: string, slots: Slot[], expiresAt: number): Promise<void>
  getResponses(slug: string): Promise<StoredResponse[]>
  getResponse(slug: string, key: string): Promise<StoredResponse | null>
  putResponse(slug: string, key: string, r: StoredResponse, expiresAt: number): Promise<void>
}

const K = {
  ev: (slug: string) => `ww:ev:${slug}`,
  sg: (slug: string) => `ww:sg:${slug}`,
  rs: (slug: string) => `ww:rs:${slug}`,
}
const sec = (ms: number) => Math.floor(ms / 1000)

function redisStore(redis: Redis): Store {
  return {
    getEvent: (slug) => redis.get<EventDoc>(K.ev(slug)),
    async putEvent(ev) {
      await redis.set(K.ev(ev.slug), ev, { exat: sec(ev.expiresAt) })
    },
    async getSuggestions(slug) {
      const h = await redis.hgetall<Record<string, Slot>>(K.sg(slug))
      return h ? Object.values(h) : []
    },
    async addSuggestions(slug, slots, expiresAt) {
      if (!slots.length) return
      const p = redis.pipeline()
      p.hset(K.sg(slug), Object.fromEntries(slots.map((s) => [s.id, s])))
      p.expireat(K.sg(slug), sec(expiresAt))
      await p.exec()
    },
    async getResponses(slug) {
      const h = await redis.hgetall<Record<string, StoredResponse>>(K.rs(slug))
      return h ? Object.values(h) : []
    },
    getResponse: (slug, key) => redis.hget<StoredResponse>(K.rs(slug), key),
    async putResponse(slug, key, r, expiresAt) {
      const p = redis.pipeline()
      p.hset(K.rs(slug), { [key]: r })
      p.expireat(K.rs(slug), sec(expiresAt))
      await p.exec()
    },
  }
}

type Mem = {
  events: Map<string, EventDoc>
  sugg: Map<string, Map<string, Slot>>
  resp: Map<string, Map<string, StoredResponse>>
}

function memoryStore(): Store {
  const g = globalThis as unknown as { __wwMem?: Mem }
  const m: Mem = (g.__wwMem ??= { events: new Map(), sugg: new Map(), resp: new Map() })
  const clone = <T>(x: T): T => structuredClone(x)
  const live = (slug: string) => {
    const ev = m.events.get(slug)
    if (ev && ev.expiresAt < Date.now()) {
      m.events.delete(slug)
      m.sugg.delete(slug)
      m.resp.delete(slug)
      return null
    }
    return ev ?? null
  }
  const sub = <T>(map: Map<string, Map<string, T>>, slug: string) => {
    if (!map.has(slug)) map.set(slug, new Map())
    return map.get(slug)!
  }
  return {
    getEvent: async (slug) => clone(live(slug)),
    putEvent: async (ev) => void m.events.set(ev.slug, clone(ev)),
    getSuggestions: async (slug) => (live(slug) ? clone([...sub(m.sugg, slug).values()]) : []),
    addSuggestions: async (slug, slots) => slots.forEach((s) => sub(m.sugg, slug).set(s.id, clone(s))),
    getResponses: async (slug) => (live(slug) ? clone([...sub(m.resp, slug).values()]) : []),
    getResponse: async (slug, key) => clone(sub(m.resp, slug).get(key) ?? null),
    putResponse: async (slug, key, r) => void sub(m.resp, slug).set(key, clone(r)),
  }
}

let store: Store | undefined

export function getStore(): Store {
  if (store) return store
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN
  if (url && token) {
    store = redisStore(new Redis({ url, token }))
  } else if (process.env.NODE_ENV !== 'production' || process.env.WW_MEMORY_STORE === '1') {
    store = memoryStore()
  } else {
    throw new Error('Whenworks: no database configured. Add Upstash Redis to the Vercel project.')
  }
  return store
}
