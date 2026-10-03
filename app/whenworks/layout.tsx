import type { Metadata, Viewport } from 'next'
import { Instrument_Serif, Space_Grotesk } from 'next/font/google'
import './whenworks.css'

const sans = Space_Grotesk({ subsets: ['latin'], variable: '--font-sans' })
const serif = Instrument_Serif({
  weight: '400',
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-serif',
})

export const metadata: Metadata = {
  title: 'Whenworks',
  description: 'Hitta en tid som passar alla. Skapa ett event, dela en länk.',
  robots: { index: false },
}

export const viewport: Viewport = { themeColor: '#F6F1EA' }

// Whenworks has its own root layout so the main site's styles don't apply here.
export default function WhenworksLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sv" className={`${sans.variable} ${serif.variable}`}>
      <body>{children}</body>
    </html>
  )
}
