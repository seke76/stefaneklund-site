const projects = [
  {
    num: '01',
    name: 'WHENWORKS',
    desc: 'Hitta en tid som passar alla. Skapa ett event, dela en länk och se vem som kan när. Inga konton, ingen inloggning.',
    link: 'stefaneklund.se/whenworks',
    href: '/whenworks',
    status: 'live' as const,
  },
  {
    num: '02',
    name: 'VEM LJUGER?',
    desc: 'Sällskapsspelet där alla utom spionen får samma hemliga ord. En telefon, 3–12 spelare, svenska kategorier. Installeras som app och funkar offline.',
    link: 'stefaneklund.se/vemljuger',
    href: '/vemljuger',
    status: 'live' as const,
  },
  {
    num: '03',
    name: 'BDY DAY',
    desc: 'Vad vill du träna idag? Svara på fyra frågor och få ett färdigt kroppsviktspass med animerade övningar, timer eller set × reps. Löparstyrka ingår. Gratis, utan konto.',
    link: 'stefaneklund.se/bdyday',
    href: '/bdyday',
    status: 'live' as const,
  },
]

export default function ProjectsSection() {
  return (
    <section id="projekt">
      <div className="section-header">
        <div className="section-cmd">&gt; ls -la ~/projekt/</div>
        <div className="section-title">PROJEKT</div>
        <div className="section-divider" data-label="CATALOG.idx" />
      </div>

      <div className="projects-grid">
        {projects.map(({ num, name, desc, link, href, status }) => (
          <a
            key={num}
            className="project-card"
            href={href}
            data-num={num}
            // Projects on this site open in the same tab; external ones in a new tab.
            {...(href.startsWith('/') ? {} : { target: '_blank', rel: 'noreferrer' })}
          >
            <span className={`project-status${status === 'live' ? ' live' : ''}`}>
              {status === 'live' ? 'LIVE' : 'WIP'}
            </span>
            <div className="project-name">{name}</div>
            <div className="project-desc">{desc}</div>
            <span className="project-link">{link}</span>
          </a>
        ))}
      </div>
    </section>
  )
}
