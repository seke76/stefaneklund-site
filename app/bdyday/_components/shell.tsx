'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { STR, type Strings } from '../_lib/i18n'
import type { Lang } from '../_lib/types'

type Ctx = { lang: Lang; setLang: (l: Lang) => void; S: Strings }
const BdyCtx = createContext<Ctx | null>(null)

export function useBdy() {
  const c = useContext(BdyCtx)
  if (!c) throw new Error('useBdy outside BdyShell')
  return c
}

/** Header, footer and language state for every BDY Day page. */
export function BdyShell({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('sv')
  // A saved choice wins; otherwise follow the browser (Swedish for sv-*, English for everything else).
  useEffect(() => {
    let saved: string | null = null
    try {
      saved = localStorage.getItem('bdy_lang')
    } catch {}
    if (saved === 'en' || saved === 'sv') setLangState(saved)
    else if (!navigator.language.toLowerCase().startsWith('sv')) setLangState('en')
  }, [])
  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])
  const setLang = (l: Lang) => {
    setLangState(l)
    try {
      localStorage.setItem('bdy_lang', l)
    } catch {}
  }
  const S = STR[lang]
  return (
    <BdyCtx.Provider value={{ lang, setLang, S }}>
      <div className="app">
        <header className="bdy-header">
          <a className="brand" href="/bdyday">
            BDY<span>DAY</span>
          </a>
          <nav>
            <a href="/bdyday/ovningar">{S.library}</a>
          </nav>
        </header>
        <main>{children}</main>
        <footer className="bdy-footer">
          {S.footer}{' '}
          <button className="lang-link" onClick={() => setLang(lang === 'sv' ? 'en' : 'sv')}>
            {S.other_lang}
          </button>
        </footer>
      </div>
    </BdyCtx.Provider>
  )
}
