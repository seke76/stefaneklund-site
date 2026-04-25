const skills = [
  { name: 'Frontend / Webbutveckling', pct: 90 },
  { name: 'AI & No-code tools', pct: 85 },
  { name: 'Product thinking', pct: 80 },
  { name: 'Backend / Databaser', pct: 70 },
]

export default function AboutSection() {
  return (
    <section id="om-mig">
      <div className="section-header">
        <div className="section-cmd">&gt; cat om_mig.txt</div>
        <div className="section-title">OM MIG</div>
        <div className="section-divider" data-label="README.md" />
      </div>

      <div className="about-grid">
        <div className="about-text">
          <p>
            Hej! Jag heter <strong>Stefan Eklund</strong> och jag är en passionerad
            utvecklare och byggare med ett brett intresse för teknik, kreativitet
            och problemlösning.
          </p>
          <p>
            Jag gillar att skapa saker – från webappar och verktyg till
            experiment och sidoprojekt. Med AI-verktyg som Lovable bygger jag
            snabbt idéer till fungerande produkter.
          </p>
          <p>
            På fritiden spelar jag retrogames, hackar på egna projekt och
            utforskar vad som är möjligt med modern tech.
          </p>

          <div style={{ marginTop: '1.5rem' }}>
            {skills.map(({ name, pct }) => (
              <div className="skill-bar" key={name}>
                <div className="skill-name">
                  <span>{name}</span>
                  <span>{pct}%</span>
                </div>
                <div className="skill-track">
                  <div className="skill-fill" style={{ width: `${pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="stat-box" data-label="PROJEKT">
            <div className="stat-value">12+</div>
            <div className="stat-label">SKAPADE PROJEKT</div>
          </div>
          <div className="stat-box" data-label="ERFARENHET">
            <div className="stat-value">10+</div>
            <div className="stat-label">ÅRS ERFARENHET</div>
          </div>
          <div className="stat-box" data-label="TECH">
            <div style={{
              color: 'var(--green-dim)',
              fontFamily: 'var(--font-mono), monospace',
              fontSize: '12px',
              letterSpacing: '0.05em',
              lineHeight: '1.8',
            }}>
              React · TypeScript · Node.js<br />
              Supabase · PostgreSQL<br />
              Lovable · Cursor · Claude<br />
              Git · Docker · Figma
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
