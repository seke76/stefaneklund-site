'use client'

import { useEffect, useState } from 'react'

const SCOPE = '/vemljuger'
/** Must match CACHE in public/vemljuger/sw.js. */
const CACHE = 'vl-v1'

type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> }

/** Registers the service worker (offline play) and offers "Installera som app" where the browser allows it. */
export default function Install() {
  const [prompt, setPrompt] = useState<InstallEvent | null>(null)
  const [ios, setIos] = useState(false)

  useEffect(() => {
    registerOffline()
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true
    if (standalone) return
    // iOS has no install prompt; show the manual steps instead.
    setIos(/iphone|ipad|ipod/i.test(navigator.userAgent))
    const onPrompt = (e: Event) => {
      e.preventDefault()
      setPrompt(e as InstallEvent)
    }
    const onInstalled = () => setPrompt(null)
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  if (prompt)
    return (
      <button
        className="btn"
        onClick={async () => {
          await prompt.prompt()
          await prompt.userChoice
          setPrompt(null)
        }}
      >
        ⤓ Installera som app
      </button>
    )
  if (ios) return <p className="hint">Spela offline: tryck på Dela och välj ”Lägg till på hemskärmen”.</p>
  return null
}

async function registerOffline() {
  if (!('serviceWorker' in navigator) || process.env.NODE_ENV !== 'production') return
  try {
    await navigator.serviceWorker.register(`${SCOPE}/sw.js`, { scope: SCOPE, updateViaCache: 'none' })
    // The first visit loaded its scripts before the worker existed, so cache them now.
    const urls = performance
      .getEntriesByType('resource')
      .map((e) => new URL(e.name))
      .filter((u) => u.origin === location.origin && u.pathname.startsWith('/_next/static/'))
      .map((u) => u.href)
    const cache = await caches.open(CACHE)
    await cache.addAll([SCOPE, ...new Set(urls)])
  } catch {
    // Offline support is a bonus; the game works without it.
  }
}
