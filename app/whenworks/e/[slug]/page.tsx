import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import GuestApp from '../../_components/guest'
import { loadEvent, toGuestView } from '../../_lib/server'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const l = await loadEvent(slug)
  return { title: l ? `${l.ev.title} · Whenworks` : 'Whenworks' }
}

export default async function GuestPage({ params }: Props) {
  const { slug } = await params
  const l = await loadEvent(slug)
  if (!l) notFound()
  // A returning guest is recognised by the cookie set when they first answered.
  const me = (await cookies()).get(`ww_me_${slug}`)?.value
  return <GuestApp initial={toGuestView(l, me)} />
}
