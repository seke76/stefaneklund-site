'use client'

import { useState } from 'react'

export default function ContactSection() {
  const [name, setName] = useState('')
  const [msg, setMsg] = useState('')
  const [feedback, setFeedback] = useState<{ text: string; ok: boolean } | null>(null)

  function sendMsg() {
    if (!name.trim() || !msg.trim()) {
      setFeedback({ text: '> FEL: name och message krävs.', ok: false })
      return
    }
    setFeedback({ text: `> SIGNAL MOTTAGEN från ${name.trim()}. Svarar inom kort...`, ok: true })
    setName('')
    setMsg('')
  }

  return (
    <section id="kontakt">
      <div className="section-header">
        <div className="section-cmd">&gt; ping stefan@stefaneklund.se</div>
        <div className="section-title">KONTAKT</div>
        <div className="section-divider" data-label="SOCKET.conn" />
      </div>

      <div className="contact-grid">
        <div>
          <a className="contact-line" href="mailto:stefan@stefaneklund.se">
            <span className="cl-icon">@</span>
            <span className="cl-label">EMAIL</span>
            stefan@stefaneklund.se
          </a>
          <a className="contact-line" href="https://linkedin.com/in/stefaneklund" target="_blank" rel="noreferrer">
            <span className="cl-icon">in</span>
            <span className="cl-label">LINKEDIN</span>
            /in/stefaneklund
          </a>
          <a className="contact-line" href="https://github.com/stefaneklund" target="_blank" rel="noreferrer">
            <span className="cl-icon">&lt;/&gt;</span>
            <span className="cl-label">GITHUB</span>
            github.com/stefaneklund
          </a>
          <a className="contact-line" href="https://twitter.com/stefaneklund" target="_blank" rel="noreferrer">
            <span className="cl-icon">𝕏</span>
            <span className="cl-label">TWITTER</span>
            @stefaneklund
          </a>
        </div>

        <div>
          <div style={{ color: 'var(--green-dim)', fontSize: '13px', marginBottom: '1.5rem' }}>
            &gt; Har du ett projekt du vill diskutera, en fråga, eller bara vill säga hej? Hör av dig!
          </div>
          <div className="terminal-input">
            <div className="prompt-line">
              <span className="prompt-icon">user@you:~$</span>
              <input
                type="text"
                placeholder="ditt namn..."
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="prompt-line" style={{ marginTop: '0.5rem' }}>
              <span className="prompt-icon">msg&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:~$</span>
              <input
                type="text"
                placeholder="ditt meddelande..."
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMsg()}
              />
            </div>
            <div style={{ marginTop: '1rem' }}>
              <button className="btn" onClick={sendMsg}>SKICKA SIGNAL</button>
            </div>
            {feedback && (
              <div style={{
                marginTop: '0.8rem',
                color: feedback.ok ? 'var(--green-dim)' : '#ff4040',
                fontSize: '12px',
              }}>
                {feedback.text}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
