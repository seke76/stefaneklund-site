import { headers } from 'next/headers'

/** The site's origin for building shareable links, e.g. https://stefaneklund.se */
export async function getOrigin() {
  const h = await headers()
  const host = h.get('x-forwarded-host') || h.get('host') || 'stefaneklund.se'
  const proto = h.get('x-forwarded-proto') || (host.startsWith('localhost') ? 'http' : 'https')
  return `${proto}://${host}`
}
