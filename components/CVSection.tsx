const entries = [
  {
    years: ['2022', '→ nu'],
    role: 'Produktutvecklare / Grundare',
    company: 'EGNA PROJEKT & FREELANCE',
    desc: 'Bygger webbapplikationer och produkter med hjälp av moderna AI-verktyg. Idé till lansering på rekordtid med Lovable, Cursor och Claude.',
    tags: ['LOVABLE', 'REACT', 'SUPABASE', 'AI'],
  },
  {
    years: ['2018', '→ 2022'],
    role: 'Senior Utvecklare',
    company: 'TEKNIKFÖRETAG AB · STOCKHOLM',
    desc: 'Ledde frontend-utveckling för SaaS-plattform. Ansvarig för arkitektur, kodkvalitet och teamets tekniska riktning. Byggde kundvända gränssnitt i React.',
    tags: ['REACT', 'TYPESCRIPT', 'NODE.JS', 'TEAMLEAD'],
  },
  {
    years: ['2014', '→ 2018'],
    role: 'Webbutvecklare',
    company: 'BYRÅ & KONSULT · STOCKHOLM',
    desc: 'Fullstackutveckling för kunder inom e-handel, media och startup-sektorn. Byggde allt från enkla landningssidor till komplexa applikationer.',
    tags: ['JAVASCRIPT', 'PHP', 'MYSQL', 'WORDPRESS'],
  },
  {
    years: ['2010', '→ 2014'],
    role: 'Utbildning',
    company: 'DATATEKNIK · KTH / ANNAN HÖGSKOLA',
    desc: 'Kandidat i datateknik / systemutveckling. Grundlade teknisk bas inom algoritmer, databaser, nätverk och mjukvaruutveckling.',
    tags: ['C++', 'JAVA', 'ALGORITHMS', 'DATABASER'],
  },
]

export default function CVSection() {
  return (
    <section id="cv">
      <div className="section-header">
        <div className="section-cmd">&gt; cat erfarenhet.log</div>
        <div className="section-title">CV / ERFARENHET</div>
        <div className="section-divider" data-label="TIMELINE.txt" />
      </div>

      <div className="timeline">
        {entries.map(({ years, role, company, desc, tags }) => (
          <div className="tl-entry" key={role}>
            <div className="tl-years">
              {years[0]}<br />{years[1]}
            </div>
            <div className="tl-body">
              <div className="tl-role">{role}</div>
              <div className="tl-company">{company}</div>
              <div className="tl-desc">{desc}</div>
              <div className="tl-tags">
                {tags.map((t) => <span className="tag" key={t}>{t}</span>)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
