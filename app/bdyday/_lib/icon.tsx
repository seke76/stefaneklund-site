import { ImageResponse } from 'next/og'

/** The app icon: "BDY" in white over a green bar, on the dark background. */
export function iconImage(size: number) {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', background: '#0B0F0C', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#F2F6F3', fontSize: size * 0.34, fontWeight: 800, fontStyle: 'italic', letterSpacing: -size * 0.01, lineHeight: 1 }}>BDY</div>
        <div style={{ width: size * 0.46, height: size * 0.07, background: '#00A651', borderRadius: size, marginTop: size * 0.05 }} />
      </div>
    ),
    { width: size, height: size },
  )
}
