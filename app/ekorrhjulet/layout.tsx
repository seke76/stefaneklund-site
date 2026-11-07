import type { Metadata, Viewport } from 'next'
import { Fredoka, Press_Start_2P, VT323 } from 'next/font/google'
import './ekorrhjulet.css'

const fredoka = Fredoka({ subsets: ['latin'], weight: ['500', '600', '700'], variable: '--font-fredoka' })
const vt323 = VT323({ subsets: ['latin'], weight: '400', variable: '--font-vt' })
const press = Press_Start_2P({ subsets: ['latin'], weight: '400', variable: '--font-press' })

export const metadata: Metadata = {
  title: 'Ekorrhjulet',
  description: 'Jobba, plugga, handla, betala hyran. Ett livsspel för 1–4 spelare i webbläsaren.',
}

export const viewport: Viewport = { themeColor: '#9BD772' }

// Ekorrhjulet has its own root layout so the main site's styles don't apply here.
export default function EkorrhjuletLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sv" className={`${fredoka.variable} ${vt323.variable} ${press.variable}`}>
      <body>{children}</body>
    </html>
  )
}
