'use client'

import { useEffect } from 'react'

/** Counts one page view for the admin statistics (see app/api/hit). No cookies, no visitor data. */
export default function PageView({ page }: { page: string }) {
  useEffect(() => {
    navigator.sendBeacon?.('/api/hit', page)
  }, [page])
  return null
}
