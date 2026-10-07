const projects = [
  {
    num: '01',
    name: 'PROJEKT #1',
    desc: 'En applikation byggd med Lovable. Beskriv ditt projekt här – vad det gör, vem det är för och vad du är stolt över.',
    link: 'lovable.app/projekt',
    href: '#',
    status: 'live' as const,
  },
  {
    num: '02',
    name: 'PROJEKT #2',
    desc: 'Ytterligare ett projekt. Kanske ett verktyg, ett spel, eller en tjänst du byggt. Lägg till länk och beskrivning.',
    link: 'lovable.app/projekt2',
    href: '#',
    status: 'live' as const,
  },
  {
    num: '03',
    name: 'PROJEKT #3',
    desc: 'Under utveckling. Nytt projekt som snart lanseras. Håll utkik – spännande grejer är på gång.',
    link: 'coming soon',
    href: '#',
    status: 'wip' as const,
  },
  {
    num: '04',
    name: 'PROJEKT #4',
    desc: 'Experiment eller sidoprojekt. Kanske open source, kanske ett roligt hack. Allt räknas.',
    link: 'github.com/stefan',
    href: '#',
    status: 'wip' as const,
  },
  {
    num: '05',
    name: 'WHENWORKS',
    desc: 'Hitta en tid som passar alla. Skapa ett event, dela en länk och se vem som kan när. Inga konton, ingen inloggning.',
    link: 'stefaneklund.se/whenworks',
    href: '/whenworks',
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
