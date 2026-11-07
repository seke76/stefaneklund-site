import type { Metadata, Viewport } from 'next'
import { Share_Tech_Mono, VT323 } from 'next/font/google'
import './vemljuger.css'

const mono = Share_Tech_Mono({ weight: '400', subsets: ['latin'], variable: '--font-mono' })
const display = VT323({ weight: '400', subsets: ['latin'], variable: '--font-display' })

export const metadata: Metadata = {
  title: 'Vem ljuger?',
  description: 'Sällskapsspelet där alla utom spionen får samma hemliga ord. En telefon, 3–12 spelare, på svenska.',
  manifest: '/vemljuger/manifest.webmanifest',
  icons: { icon: '/vemljuger/icon-192.png', apple: '/vemljuger/apple-touch-icon.png' },
  appleWebApp: { capable: true, title: 'Vem ljuger?', statusBarStyle: 'black' },
}

export const viewport: Viewport = { themeColor: '#080808', viewportFit: 'cover' }

// Own root layout, like Whenworks: the game is installed as an app (PWA) on its own.
export default function VemLjugerLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sv" className={`${mono.variable} ${display.variable}`}>
      <body>{children}</body>
    </html>
  )
}
