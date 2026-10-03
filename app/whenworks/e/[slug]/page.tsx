import type { Metadata } from 'next'
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
  return <GuestApp initial={toGuestView(l)} />
}
