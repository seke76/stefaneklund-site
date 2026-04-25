'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

const navItems = [
  { href: '#hero', label: 'HOME' },
  { href: '#om-mig', label: 'OM MIG' },
  { href: '#cv', label: 'CV' },
  { href: '#projekt', label: 'PROJEKT' },
  { href: '#kontakt', label: 'KONTAKT' },
]

export default function Navbar() {
  const [clock, setClock] = useState('00:00:00')
  const [activeId, setActiveId] = useState('hero')

  useEffect(() => {
    const tick = () => {
      const now = new Date()
      const h = String(now.getHours()).padStart(2, '0')
      const m = String(now.getMinutes()).padStart(2, '0')
      const s = String(now.getSeconds()).padStart(2, '0')
      setClock(`${h}:${m}:${s}`)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const sections = document.querySelectorAll('section[id]')
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveId(e.target.id)
        })
      },
      { threshold: 0.4 }
    )
    sections.forEach((s) => observer.observe(s))
    return () => observer.disconnect()
  }, [])

  return (
    <nav>
      <span className="nav-prompt">C:\STEFAN&gt;</span>
      {navItems.map(({ href, label }) => (
        <a
          key={href}
          href={href}
          className={activeId === href.slice(1) ? 'active' : ''}
        >
          {label}
        </a>
      ))}
      <span className="nav-clock">{clock}</span>
    </nav>
  )
}
