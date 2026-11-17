import type { Metadata, Viewport } from 'next'
import { Barlow_Condensed, Inter } from 'next/font/google'
import { BdyShell } from './_components/shell'
import './bdyday.css'

const sans = Inter({ subsets: ['latin'], variable: '--font-sans' })
const display = Barlow_Condensed({ weight: ['600', '800'], style: ['normal', 'italic'], subsets: ['latin'], variable: '--font-display' })

export const metadata: Metadata = {
  title: 'BDY Day',
  description: 'Vad vill du träna idag? Korta kroppsviktspass med animerade övningar. Gratis, utan konto.',
  manifest: '/bdyday/manifest.webmanifest',
  appleWebApp: { capable: true, title: 'BDY Day', statusBarStyle: 'black-translucent' },
}

export const viewport: Viewport = { themeColor: '#0B0F0C', viewportFit: 'cover' }

// BDY Day has its own root layout so the main site's styles don't apply here.
export default function BdyLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sv" className={`${sans.variable} ${display.variable}`}>
      <body>
        <BdyShell>{children}</BdyShell>
      </body>
    </html>
  )
}
