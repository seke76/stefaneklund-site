import type { Metadata } from 'next'
import Game from './_components/game'

export const metadata: Metadata = {
  title: 'Ekorrhjulet – ett livsspel',
  alternates: { canonical: 'https://stefaneklund.se/ekorrhjulet' },
}

export default function EkorrhjuletPage() {
  return <Game />
}
