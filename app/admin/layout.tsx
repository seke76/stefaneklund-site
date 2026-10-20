import type { Metadata } from 'next'
import './admin.css'

export const metadata: Metadata = {
  title: 'Admin · stefaneklund.se',
  robots: { index: false, follow: false },
}

// The admin page has its own root layout, separate from the main site and Whenworks.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sv">
      <body>{children}</body>
    </html>
  )
}
