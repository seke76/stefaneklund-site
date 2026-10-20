import { logout } from './actions'
import { Bars, Kpi, Share, Status, num, pct } from './_components/ui'
import { loadDashboard, type Dashboard } from './_lib/data'
import { authConfig, verifySession } from './_lib/session'

type Props = { searchParams: Promise<{ d?: string; error?: string }> }

const RANGES = [7, 30, 90]

const ERRORS: Record<string, string> = {
  config: 'Inloggningen är inte konfigurerad. Se app/admin/README.md.',
  state: 'Inloggningen tog för lång tid eller avbröts. Försök igen.',
  github: 'GitHub svarade inte som väntat. Försök igen.',
  denied: 'Det GitHub-kontot har inte tillgång.',
}

function Login({ error }: { error?: string }) {
  const msg = error ? ERRORS[error] : !authConfig() ? ERRORS.config : undefined
  return (
    <main className="login">
      <div className="card">
        <h1>Admin</h1>
        <p>stefaneklund.se</p>
        {msg && <p className="err">{msg}</p>}
        {/* A plain link: the login route redirects to GitHub. */}
        <a className="btn btn-main" href="/admin/login">
          Logga in med GitHub
        </a>
      </div>
    </main>
  )
}

function Health({ d }: { d: Dashboard }) {
  const { db, email, liveEvents } = d.health
  const { sha, message, repo, env } = d.version
  return (
    <section>
      <div className="sec-head">
        <h2>Hälsa</h2>
        <span className="muted small">Just nu</span>
      </div>
      <div className="grid">
        <Status
          title="Databas (Redis)"
          level={db.ok ? 'good' : 'bad'}
          label={db.ok ? 'Svarar' : db.configured ? 'Svarar inte' : 'Inte kopplad'}
          detail={db.ms !== null ? `${db.ms} ms` : undefined}
        />
        <Status
          title="Mejl (Resend)"
          level={!email ? 'warn' : d.today.emailFailed ? 'bad' : 'good'}
          label={!email ? 'Avstängt' : d.today.emailFailed ? `${d.today.emailFailed} misslyckades i dag` : 'Fungerar'}
          detail={email ? `${num(d.today.emailSent)} skickade i dag` : 'RESEND_API_KEY saknas'}
        />
        <Status
          title="Fel i apparna"
          level={d.today.errors ? 'bad' : 'good'}
          label={d.today.errors ? `${d.today.errors} i dag` : 'Inga i dag'}
          detail={`${num(d.whenworks.error.now + d.site.error.now)} senaste ${d.days} d`}
        />
        <Status
          title="Version"
          level="good"
          label={sha ? sha.slice(0, 7) : 'Lokal'}
          detail={[env, message].filter(Boolean).join(' · ')}
        />
      </div>
      {sha && repo && (
        <p className="muted small" style={{ marginTop: 8 }}>
          <a href={`https://github.com/${repo}/commit/${sha}`}>Visa commit på GitHub</a>
          {liveEvents !== null && ` · ${num(liveEvents)} Whenworks-event finns just nu`}
        </p>
      )}
    </section>
  )
}

function Whenworks({ d }: { d: Dashboard }) {
  const w = d.whenworks
  const created = w.created.now
  return (
    <section>
      <div className="sec-head">
        <h2>Whenworks</h2>
        <span className="muted small">
          {d.health.liveEvents !== null && `${num(d.health.liveEvents)} aktiva event · `}senaste {d.days} dagarna
        </span>
      </div>
      <div className="grid">
        <Kpi label="Skapade event" m={w.created} days={d.days} />
        <Kpi label="Nya deltagare" m={w.responder} days={d.days} />
        <Kpi label="Bekräftade tider" m={w.finalized} days={d.days} />
        <Kpi
          label="Besök som blir event"
          days={d.days}
          value={w.view_landing.now ? `${pct(created, w.view_landing.now)} %` : '–'}
        />
      </div>
      <div className="grid-3" style={{ marginTop: 12 }}>
        <Bars title="Skapade event per dag" dates={d.dates} values={w.created.daily} />
        <Bars title="Nya deltagare per dag" dates={d.dates} values={w.responder.daily} />
        <Bars title="Besök på startsidan per dag" dates={d.dates} values={w.view_landing.daily} />
      </div>
      <div className="grid-3" style={{ marginTop: 12 }}>
        <div className="card">
          <h3>Vad arrangörerna väljer</h3>
          <p className="muted small" style={{ marginBottom: 12 }}>
            Andel av {num(created)} skapade event
          </p>
          <Share
            of={created}
            rows={[
              ['Flera dagar', w.created_multi.now],
              ['Gästerna föreslår dagar', w.created_open.now],
              ['Med gästlista', w.created_list.now],
              ['Arrangören angav mejl', w.created_orgmail.now],
              ['Fick en bekräftad tid', w.finalized.now],
            ]}
          />
        </div>
        <div className="card">
          <h3>Aktivitet</h3>
          <table>
            <tbody>
              {(
                [
                  ['Svar (inkl. ändringar)', w.answer.now],
                  ['Nya rundor', w.round.now],
                  ['Besök: gästsidor', w.view_guest.now],
                  ['Besök: arrangörssidor', w.view_organizer.now],
                  ['Mejl skickade', w.email_sent.now],
                  ['Mejl misslyckade', w.email_failed.now],
                ] as const
              ).map(([l, n]) => (
                <tr key={l}>
                  <td>{l}</td>
                  <td className="n">{num(n)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

function Site({ d }: { d: Dashboard }) {
  return (
    <section>
      <div className="sec-head">
        <h2>Hemsidan</h2>
      </div>
      <div className="grid-3">
        <Bars title="Besök på stefaneklund.se per dag" dates={d.dates} values={d.site.view_home.daily} />
      </div>
    </section>
  )
}

function Errors({ d }: { d: Dashboard }) {
  return (
    <section>
      <div className="sec-head">
        <h2>Senaste fel</h2>
        <span className="muted small">De 20 senaste</span>
      </div>
      <div className="card table-wrap">
        {d.errors.length === 0 ? (
          <p className="muted">Inga fel registrerade.</p>
        ) : (
          <table className="errs">
            <thead>
              <tr>
                <th>När</th>
                <th>Var</th>
                <th>Fel</th>
              </tr>
            </thead>
            <tbody>
              {d.errors.map((e, i) => (
                <tr key={i}>
                  <td>
                    {new Date(e.t).toLocaleString('sv-SE', {
                      timeZone: 'Europe/Stockholm',
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })}
                  </td>
                  <td>
                    {e.app} · {e.where}
                  </td>
                  <td>
                    <code>{e.msg}</code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  )
}

export default async function AdminPage({ searchParams }: Props) {
  const { d: dParam, error } = await searchParams
  const user = await verifySession()
  if (!user) return <Login error={error} />
  const days = RANGES.includes(Number(dParam)) ? Number(dParam) : 30
  const d = await loadDashboard(days)
  return (
    <main className="wrap">
      <header className="top">
        <h1>
          Admin <span>· stefaneklund.se</span>
        </h1>
        <div className="who">
          <nav className="seg" aria-label="Period">
            {RANGES.map((r) => (
              <a key={r} href={`/admin?d=${r}`} className={r === days ? 'on' : ''}>
                {r} d
              </a>
            ))}
          </nav>
          <span>{user}</span>
          <form action={logout}>
            <button className="btn" type="submit">
              Logga ut
            </button>
          </form>
        </div>
      </header>
      <Health d={d} />
      <Whenworks d={d} />
      <Site d={d} />
      <Errors d={d} />
    </main>
  )
}
