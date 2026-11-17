import type { Metadata } from 'next'
import Home from './_components/home'

export const metadata: Metadata = {
  title: 'BDY Day – vad vill du träna idag?',
  alternates: { canonical: 'https://stefaneklund.se/bdyday' },
}

export default function BdyPage() {
  return <Home />
}
