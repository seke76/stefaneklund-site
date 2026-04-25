import type { Metadata } from 'next'
import { Share_Tech_Mono, VT323 } from 'next/font/google'
import './globals.css'

const shareTechMono = Share_Tech_Mono({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-mono',
})

const vt323 = VT323({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-vt323',
})

export const metadata: Metadata = {
  title: 'STEFAN EKLUND // stefaneklund.se',
  description: 'Stefan Eklund – Utvecklare & Skapare, Stockholm',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sv">
      <body className={`${shareTechMono.variable} ${vt323.variable}`}>
        {children}
      </body>
    </html>
  )
}
