'use client'

import { useEffect, useState } from 'react'

export default function Hero() {
  const [uptime, setUptime] = useState('0d 0h 0m 0s')

  useEffect(() => {
    const start = Date.now()
    const tick = () => {
      const diff = Date.now() - start
      const s = Math.floor(diff / 1000)
      const m = Math.floor(s / 60)
      const h = Math.floor(m / 60)
      const d = Math.floor(h / 24)
      setUptime(`${d}d ${h % 24}h ${m % 60}m ${s % 60}s`)
    }
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <section id="hero">
      <div className="ascii-art">{`┌─────────────────────────────────────────┐
│  ███████╗████████╗███████╗███████╗ █████╗ ███╗   ██╗│
│  ██╔════╝╚══██╔══╝██╔════╝██╔════╝██╔══██╗████╗  ██║│
│  ███████╗   ██║   █████╗  █████╗  ███████║██╔██╗ ██║│
│  ╚════██║   ██║   ██╔══╝  ██╔══╝  ██╔══██║██║╚██╗██║│
│  ███████║   ██║   ███████╗██║     ██║  ██║██║ ╚████║│
│  ╚══════╝   ╚═╝   ╚══════╝╚═╝     ╚═╝  ╚═╝╚═╝  ╚═══╝│
└─────────────────────────────────────────┘`}</div>

      <div className="hero-tagline glitch">STEFAN EKLUND</div>
      <div className="hero-sub">// UTVECKLARE &amp; SKAPARE &nbsp;·&nbsp; STOCKHOLM, SE</div>

      <div className="hero-boot">
        <span>SYSTEM:</span> stefaneklund.se v1.0 &nbsp;|&nbsp;
        <span>STATUS:</span> ONLINE &nbsp;|&nbsp;
        <span>UPTIME:</span> <span>{uptime}</span>
      </div>

      <div className="hero-boot">
        &gt; Välkommen. Laddar profil... <span style={{ color: 'var(--green)' }}>OK</span><br />
        &gt; Initierar projekt... <span style={{ color: 'var(--green)' }}>OK</span><br />
        &gt; Redo.<span className="cursor-blink" />
      </div>

      <div className="hero-actions">
        <a className="btn primary" href="#projekt">SE PROJEKT</a>
        <a className="btn" href="#cv">CV / ERFARENHET</a>
        <a className="btn" href="#kontakt">KONTAKTA MIG</a>
      </div>
    </section>
  )
}
