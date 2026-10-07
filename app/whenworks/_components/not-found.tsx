'use client'

import { WhenworksShell, useWW } from './ui'

function Notice() {
  const { S } = useWW()
  return (
    <div className="notice">
      <h1 className="display sm">{S.not_found_title}</h1>
      <p className="muted">{S.not_found_d}</p>
      <p style={{ marginTop: 24 }}>
        <a className="btn btn-primary" href="/whenworks" style={{ color: '#fff', textDecoration: 'none' }}>
          {S.create_new}
        </a>
      </p>
    </div>
  )
}

export default function NotFoundApp() {
  return (
    <WhenworksShell role="guest">
      <Notice />
    </WhenworksShell>
  )
}
