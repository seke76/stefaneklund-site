import { Redis } from '@upstash/redis'

let client: Redis | null | undefined

/**
 * The site's Upstash Redis database (shared by Whenworks and the admin stats).
 * Vercel's Upstash integration sets KV_REST_API_URL/KV_REST_API_TOKEN; plain Upstash uses
 * UPSTASH_REDIS_REST_URL/UPSTASH_REDIS_REST_TOKEN. null when neither is set (local development).
 */
export function getRedis(): Redis | null {
  if (client !== undefined) return client
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN
  client = url && token ? new Redis({ url, token }) : null
  return client
}
