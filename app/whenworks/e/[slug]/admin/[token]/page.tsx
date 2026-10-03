import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import OrganizerApp from '../../../../_components/organizer'
import { getOrigin } from '../../../../_lib/origin'
import { loadAdmin, toAdminView } from '../../../../_lib/server'

type Props = {
  params: Promise<{ slug: string; token: string }>
  searchParams: Promise<{ new?: string }>
}

export const metadata: Metadata = {
  title: 'Whenworks',
  referrer: 'no-referrer', // keep the organizer token out of Referer headers
}

export default async function OrganizerPage({ params, searchParams }: Props) {
  const { slug, token } = await params
  const { new: isNew } = await searchParams
  const l = await loadAdmin(slug, token)
  if (!l) notFound()
  const origin = await getOrigin()
  const links = {
    guest: `${origin}/whenworks/e/${slug}`,
    admin: `${origin}/whenworks/e/${slug}/admin/${token}`,
  }
  return <OrganizerApp initial={toAdminView(l)} token={token} links={links} isNew={isNew === '1'} />
}
