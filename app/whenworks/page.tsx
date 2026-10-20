import type { Metadata } from 'next'
import CreateApp from './_components/create'
import { emailEnabled } from './_lib/server'

// The start page is meant to be found; event pages stay out of search engines (see layout.tsx).
export const metadata: Metadata = {
  title: 'Whenworks – hitta en tid som passar alla',
  description:
    'Gratis Doodle-alternativ på svenska, utan reklam och utan konto. Föreslå tider, dela en länk och fråga igen tills alla kan.',
  robots: { index: true, follow: true },
  alternates: { canonical: 'https://stefaneklund.se/whenworks' },
}

export default function WhenworksPage() {
  // Email fields stay hidden until an email service (Resend) is configured.
  return <CreateApp emailEnabled={emailEnabled()} />
}
