import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'WhenWorks // stefaneklund.se',
  description: 'WhenWorks – av Stefan Eklund',
}

export default function WhenWorksLayout({ children }: { children: React.ReactNode }) {
  return children
}
