import type { Metadata } from 'next'
import Train from '../_components/train'

export const metadata: Metadata = { title: 'Träna – BDY Day' }

export default function TrainPage() {
  return <Train />
}
