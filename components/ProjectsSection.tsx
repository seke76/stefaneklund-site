type Project = {
  num: string
  name: string
  desc: string
  link: string
  // Missing while the project isn't published yet; the card is then not a link.
  href?: string
  status: 'live' | 'wip'
}

const projects: Project[] = [
  {
    num: '01',
    name: 'WHENWORKS',
    desc: 'Hitta en tid som passar alla. Skapa ett event, dela en länk och se vem som kan när. Inga konton, ingen inloggning.',
    link: 'stefaneklund.se/whenworks',
    href: '/whenworks',
    status: 'live',
  },
  {
    num: '02',
    name: 'VEM LJUGER?',
    desc: 'Sällskapsspelet där alla utom spionen får samma hemliga ord. En telefon, 3–12 spelare, svenska kategorier. Installeras som app och funkar offline.',
    link: 'stefaneklund.se/vemljuger',
    href: '/vemljuger',
    status: 'live',
  },
  {
    num: '03',
    name: 'BDY DAY',
    desc: 'Vad vill du träna idag? Svara på fyra frågor och få ett färdigt kroppsviktspass med animerade övningar, timer eller set × reps. Löparstyrka ingår. Gratis, utan konto.',
    link: 'stefaneklund.se/bdyday',
    href: '/bdyday',
    status: 'live',
  },
  {
    num: '04',
    name: 'EKORRHJULET',
    desc: 'Ett livsspel i 90-talsanda. Varje vecka har 60 timmar att fördela mellan jobb, plugg, mat och nöje. 1–4 spelare vid samma skärm, med datorspelaren Egon som motståndare och egen chiptune-musik.',
    link: 'stefaneklund.se/ekorrhjulet',
    status: 'wip',
  },
  {
    num: '05',
    name: 'STOA',
    desc: 'Stoicism som man tränar. Dagens tanke, en övning om dagen och en kort kvällsgenomgång, plus hjälp när något händer just nu. Inget konto, allt sparas i telefonen.',
    link: 'stefaneklund.se/stoa',
    status: 'wip',
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
        {projects.map(({ num, name, desc, link, href, status }) => {
          const body = (
            <>
              <span className={`project-status${status === 'live' ? ' live' : ''}`}>
                {status === 'live' ? 'LIVE' : 'WIP'}
              </span>
              <div className="project-name">{name}</div>
              <div className="project-desc">{desc}</div>
              <span className={`project-link${href ? '' : ' soon'}`}>
                {href ? link : 'KOMMER SNART'}
              </span>
            </>
          )
          if (!href) {
            return (
              <div key={num} className="project-card wip" data-num={num}>
                {body}
              </div>
            )
          }
          return (
            <a
              key={num}
              className="project-card"
              href={href}
              data-num={num}
              // Projects on this site open in the same tab; external ones in a new tab.
              {...(href.startsWith('/') ? {} : { target: '_blank', rel: 'noreferrer' })}
            >
              {body}
            </a>
          )
        })}
      </div>
    </section>
  )
}
