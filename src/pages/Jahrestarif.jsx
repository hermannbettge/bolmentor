import { Link } from 'react-router-dom'

const AREAS = [
  { icon: '◎', name: 'Tagesenergie', desc: 'Deine persönliche kosmische Signatur für jeden einzelnen Tag.' },
  { icon: '◈', name: 'Business', desc: 'Welche Tage tragen deinen Schaffensdrang, welche fordern Rückzug.' },
  { icon: '◈', name: 'Gesundheit', desc: 'Körperliche Energie im Einklang mit deinem kosmischen Rhythmus.' },
  { icon: '◈', name: 'Familie', desc: 'Warum manche Tage Verbindung schenken und andere Distanz brauchen.' },
  { icon: '◈', name: 'Finanzen', desc: 'Energien für Investitionen, Rückzug oder mutige Schritte.' },
  { icon: '◈', name: 'Karriere', desc: 'Dein Weg im Beruf, gelesen aus deinem kosmischen Fingerabdruck.' },
  { icon: '◈', name: 'Lebensphasen', desc: 'Wo du gerade im großen Zyklus stehst und was er von dir verlangt.' },
  { icon: '◈', name: 'Selbstausdruck', desc: 'Deine Schöpferkraft, dein Ausdruck, deine Einzigartigkeit.' },
  { icon: '◈', name: 'Partnerschaft', desc: 'Deine kosmische Beziehungsdynamik — gelesen aus beiden Geburtsdaten.' },
  { icon: '◈', name: 'Ereignisse', desc: 'Bis zu 10 persönliche Ereignisse und ihre kosmische Bedeutung.' },
]

const BEFORE = [
  'Du stehst auf und weißt nicht, wo du heute anfangen sollst.',
  'Du läufst gegen die Energie an und fragst dich, warum es so schwer ist.',
  'Du triffst Entscheidungen ohne kosmischen Kontext.',
  'Du suchst in Büchern, Podcasts und Coaches nach Antworten für eine allgemeine Frage.',
  'Ein weiteres Jahr ohne das Gefühl, wirklich im Fluss zu sein.',
]

const AFTER = [
  'Du öffnest die App und weißt sofort, was dieser Tag von dir will.',
  'Du erkennst, wenn ein Tag Rückzug fordert statt Vorwärts, und nimmst dir die Erlaubnis.',
  'Du entscheidest mit dem Strom deiner kosmischen Energie statt gegen ihn.',
  'Du hast eine Antwort, die auf dein Geburtsdatum berechnet ist. Für dich. Nicht für alle.',
  '365 Tage, in denen du dich selbst tiefer verstehst als je zuvor.',
]

const INCLUDES = [
  'Tagesenergie täglich',
  'Alle 10 Lebensbereiche täglich',
  'Monatsanalyse jeden Monat neu',
  'Persönlicher Energiekalender',
  'Spezial- und Jahresanalysen',
  'Bis zu 10 persönliche Ereignisanalysen',
  'Vollzugang zu allen zukünftigen Funktionen',
]

export default function Jahrestarif() {
  return (
    <div style={S.page}>
      <style>{css}</style>
      <div className="jt-stars" aria-hidden="true" />

      <div style={S.content}>

        {/* HERO */}
        <section style={S.hero}>
          <div style={S.eyebrow}>Bewusstsein.Ohne.Limit · Jahrestarif</div>
          <h1 style={S.h1}>
            Stell dir vor, du weißt jeden Morgen<br />
            <em style={{ color: '#c8a456', fontStyle: 'italic' }}>genau, was dieser Tag von dir will.</em>
          </h1>
          <p style={S.heroSub}>
            Der Maya-Kalender kennt deine kosmische Signatur seit dem Tag deiner Geburt.
            5.000 Jahre Weisheit, jeden Morgen neu berechnet für dein Leben, deinen Körper, dein Business.
          </p>
          <div style={S.pricePill}>
            Vollzugang für <strong style={{ color: '#c8a456', fontSize: '1.1rem' }}>74 Cent pro Tag</strong>
          </div>
          <div style={S.scrollHint}>
            <span>Lies weiter</span>
            <div style={S.scrollLine} />
          </div>
        </section>

        {/* DIE FRAGE */}
        <section style={{ ...S.section, textAlign: 'center' }}>
          <div style={S.eyebrow}>Die eigentliche Frage</div>
          <h2 style={S.h2}>Was kostet dich ein weiteres Jahr ohne diese Klarheit?</h2>
          <div style={S.goldLine} />
          <p style={{ color: '#d4ccb8', fontSize: '1.05rem', lineHeight: 1.85, maxWidth: '58ch', margin: '0 auto' }}>
            Ein Coaching-Gespräch kostet zwischen 150 und 300 Euro.
            Du bekommst 60 Minuten Orientierung für eine Frage.
            Hier bekommst du 365 Tage persönliche Führung in allen Bereichen deines Lebens,
            täglich neu, täglich präzise auf deine kosmische Energie abgestimmt.
          </p>
        </section>

        {/* VERGLEICH */}
        <section style={S.band}>
          <div style={S.inner}>
            <div style={{ ...S.eyebrow, textAlign: 'center' }}>Der Vergleich</div>
            <h2 style={{ ...S.h2, textAlign: 'center' }}>270 Euro im Jahr.</h2>
            <div className="jt-cost-grid">
              {[
                { amount: '300 €', label: '1 Coaching-Stunde', strike: true },
                { amount: '1.200 €', label: '1 Seminar-Wochenende', strike: true },
                { amount: '0,74 €', label: '1 Tag mit MAYA · Jahrestarif', hi: true },
                { amount: '365 Tage', label: 'Tägliche Energieführung in 10 Bereichen', hi: true, sm: true },
              ].map((item, i) => (
                <div key={i} style={S.costCell}>
                  <div style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: item.sm ? '2rem' : item.hi ? '2.8rem' : '2.4rem',
                    color: item.hi ? '#c8a456' : '#f0ece2',
                    lineHeight: 1,
                    marginBottom: 10,
                    fontVariantNumeric: 'tabular-nums',
                    textDecoration: item.strike ? 'line-through' : 'none',
                    opacity: item.strike ? 0.35 : 1,
                  }}>{item.amount}</div>
                  <div style={{ fontSize: '0.82rem', letterSpacing: '0.07em', color: '#b8b0a0', textTransform: 'uppercase' }}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* BEREICHE */}
        <section style={S.section}>
          <div style={{ ...S.eyebrow, textAlign: 'center' }}>Was dich erwartet</div>
          <h2 style={{ ...S.h2, textAlign: 'center' }}>10 Lebensbereiche.<br />Täglich. Für dich berechnet.</h2>
          <div className="jt-areas-grid">
            {AREAS.map((area, i) => (
              <div key={i} style={S.areaCard}>
                <div style={{ fontSize: '1.4rem', color: '#c8a456' }}>{area.icon}</div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1rem', color: '#f0ece2', marginBottom: 6 }}>{area.name}</div>
                <div style={{ fontSize: '0.84rem', color: '#c8c0aa', lineHeight: 1.6 }}>{area.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* TRANSFORMATION */}
        <section style={S.band}>
          <div style={S.inner}>
            <div style={{ ...S.eyebrow, textAlign: 'center' }}>Die Veränderung</div>
            <h2 style={{ ...S.h2, textAlign: 'center' }}>Vorher. Nachher.</h2>
            <div className="jt-transform">
              <div style={{ ...S.transformBox, borderColor: 'rgba(255,255,255,0.14)' }}>
                <div style={{ fontSize: '0.68rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#887060', marginBottom: 20 }}>Ohne MAYA</div>
                {BEFORE.map((text, i) => (
                  <div key={i} style={S.tItem}>
                    <span style={{ color: '#665a50', flexShrink: 0, marginTop: 3, fontSize: '0.9rem' }}>–</span>
                    <span style={{ color: '#b0a898' }}>{text}</span>
                  </div>
                ))}
              </div>
              <div style={S.arrow}>→</div>
              <div style={{ ...S.transformBox, borderColor: '#7a6035' }}>
                <div style={{ fontSize: '0.68rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#c8a456', marginBottom: 20 }}>Mit MAYA</div>
                {AFTER.map((text, i) => (
                  <div key={i} style={S.tItem}>
                    <span style={{ color: '#c8a456', flexShrink: 0, marginTop: 5, fontSize: '0.6rem' }}>◆</span>
                    <span style={{ color: '#f0ece2' }}>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ ...S.band, background: 'linear-gradient(to bottom, #0d0c0a, #131210)' }}>
          <div style={{ ...S.inner, textAlign: 'center' }}>
            <div style={S.eyebrow}>Jetzt starten</div>
            <h2 style={S.h2}>Ein Jahr. Alle Bereiche.<br />Täglich personalisiert.</h2>
            <div style={S.goldLine} />

            <div style={S.ctaBox}>
              <div style={{ fontSize: '0.78rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#a09880', marginBottom: 6 }}>Jahrestarif</div>
              <div style={{ margin: '28px 0 36px' }}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(3.5rem, 10vw, 5.5rem)', color: '#c8a456', lineHeight: 1, letterSpacing: '-0.02em' }}>
                  270 €
                </div>
                <div style={{ fontSize: '1rem', color: '#d4ccb8', marginTop: 12, letterSpacing: '0.04em' }}>
                  einmalig pro Jahr · jederzeit kündbar
                </div>
                <div style={{ fontSize: '0.88rem', color: '#a09880', marginTop: 6 }}>
                  74 Cent pro Tag · weniger als ein Espresso
                </div>
              </div>

              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12, textAlign: 'left', maxWidth: 420, margin: '0 auto 40px' }}>
                {INCLUDES.map((item, i) => (
                  <li key={i} style={{ fontSize: '0.9rem', color: '#d4ccb8', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                    <span style={{ color: '#c8a456', fontSize: '0.6rem', flexShrink: 0, marginTop: 6 }}>◆</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <Link to="/checkout?product=membershipAnnual" style={S.ctaBtn}>
                Jahrestarif aktivieren
              </Link>

              <p style={{ fontSize: '0.85rem', color: '#a09880', marginTop: 24, lineHeight: 1.7 }}>
                Voller Zugang ab dem ersten Tag.<br />
                Kein Risiko. Kein Vertrag. Kein Haken.
              </p>
            </div>

            <p style={{ fontSize: '0.8rem', color: '#6a6050', marginTop: 36, lineHeight: 1.7 }}>
              Basiert auf dem 5.000 Jahre alten Maya-Dreamspell-Kalender,
              berechnet auf dein persönliches Geburtsdatum.<br />
              Bewusstsein.Ohne.Limit · Deutschland
            </p>
          </div>
        </section>

        {/* FOOTER */}
        <footer style={S.footer}>
          <div style={S.footerInner}>
            <span style={{ color: '#6a6050' }}>© 2025 Bewusstsein.Ohne.Limit</span>
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
              <Link to="/impressum" style={S.footerLink}>Impressum</Link>
              <Link to="/datenschutz" style={S.footerLink}>Datenschutz</Link>
              <Link to="/login" style={S.footerLink}>Anmelden</Link>
              <Link to="/" style={S.footerLink}>Startseite</Link>
            </div>
          </div>
        </footer>

      </div>
    </div>
  )
}

const S = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#0d0c0a',
    color: '#f0ece2',
    fontFamily: "'Inter', sans-serif",
    fontWeight: 300,
    overflowX: 'hidden',
  },
  content: { position: 'relative', zIndex: 1 },
  hero: {
    minHeight: '100svh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '80px max(24px, 5vw) 64px',
  },
  h1: {
    fontFamily: "'Playfair Display', serif",
    fontWeight: 400,
    fontSize: 'clamp(2rem, 5.5vw, 3.6rem)',
    lineHeight: 1.2,
    color: '#f0ece2',
    marginBottom: 32,
    textWrap: 'balance',
    maxWidth: '18ch',
  },
  h2: {
    fontFamily: "'Playfair Display', serif",
    fontWeight: 400,
    fontSize: 'clamp(1.5rem, 3.5vw, 2.3rem)',
    lineHeight: 1.25,
    color: '#f0ece2',
    marginBottom: 24,
    textWrap: 'balance',
  },
  eyebrow: {
    fontSize: '0.72rem',
    fontWeight: 600,
    letterSpacing: '0.22em',
    textTransform: 'uppercase',
    color: '#c8a456',
    marginBottom: 28,
  },
  heroSub: {
    fontSize: '1.05rem',
    color: '#c8c0aa',
    maxWidth: '52ch',
    lineHeight: 1.8,
    marginBottom: 48,
  },
  pricePill: {
    display: 'inline-block',
    border: '1px solid rgba(200,164,86,0.35)',
    borderRadius: 100,
    padding: '14px 36px',
    fontSize: '0.9rem',
    color: '#c8c0aa',
    letterSpacing: '0.04em',
    marginBottom: 20,
    backgroundColor: 'rgba(200,164,86,0.06)',
  },
  scrollHint: {
    marginTop: 60,
    fontSize: '0.75rem',
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    color: '#c8a456',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
  },
  scrollLine: {
    width: 1,
    height: 44,
    background: 'linear-gradient(to bottom, #c8a456, transparent)',
  },
  section: {
    padding: 'clamp(64px, 8vw, 96px) max(24px, calc((100% - 860px) / 2))',
  },
  band: {
    backgroundColor: '#131210',
    borderTop: '1px solid rgba(200,164,86,0.15)',
    borderBottom: '1px solid rgba(200,164,86,0.15)',
    padding: 'clamp(64px, 8vw, 96px) 0',
  },
  inner: {
    maxWidth: 860,
    margin: '0 auto',
    padding: '0 max(24px, 5vw)',
  },
  goldLine: {
    width: 48,
    height: 1,
    background: '#c8a456',
    opacity: 0.6,
    margin: '24px auto',
  },
  costCell: {
    backgroundColor: '#1a1815',
    padding: '32px 28px',
  },
  areaCard: {
    backgroundColor: '#1a1815',
    padding: '28px 22px',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  transformBox: {
    backgroundColor: '#1a1815',
    border: '1px solid',
    borderRadius: 2,
    padding: '32px 28px',
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  },
  tItem: {
    fontSize: '0.88rem',
    lineHeight: 1.6,
    display: 'flex',
    gap: 12,
    alignItems: 'flex-start',
  },
  arrow: {
    fontSize: '1.6rem',
    color: '#7a6035',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 8px',
  },
  ctaBox: {
    border: '1px solid rgba(200,164,86,0.25)',
    backgroundColor: '#1a1815',
    borderRadius: 2,
    padding: 'clamp(36px, 6vw, 60px) clamp(24px, 6vw, 56px)',
    marginTop: 48,
    position: 'relative',
  },
  ctaBtn: {
    display: 'inline-block',
    backgroundColor: '#c8a456',
    color: '#0d0c0a',
    fontFamily: "'Inter', sans-serif",
    fontSize: '0.88rem',
    fontWeight: 700,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    padding: '20px 60px',
    borderRadius: 1,
    textDecoration: 'none',
  },
  footer: {
    borderTop: '1px solid rgba(200,164,86,0.12)',
    padding: '32px max(24px, 5vw)',
    backgroundColor: '#0d0c0a',
  },
  footerInner: {
    maxWidth: 860,
    margin: '0 auto',
    display: 'flex',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.8rem',
  },
  footerLink: {
    color: '#a09880',
    textDecoration: 'none',
    fontSize: '0.8rem',
    letterSpacing: '0.04em',
  },
}

const css = `
  :root { color-scheme: dark; }
  .jt-stars {
    position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden;
  }
  .jt-stars::before {
    content: ''; position: absolute; width: 2px; height: 2px; border-radius: 50%;
    background: rgba(200,164,86,0.6);
    box-shadow:
      80px 120px 0 rgba(200,164,86,0.4), 240px 60px 0 rgba(255,255,255,0.18),
      420px 200px 0 rgba(200,164,86,0.3), 600px 90px 0 rgba(255,255,255,0.14),
      720px 310px 0 rgba(200,164,86,0.4), 900px 150px 0 rgba(255,255,255,0.16),
      140px 400px 0 rgba(255,255,255,0.12), 360px 520px 0 rgba(200,164,86,0.25),
      560px 650px 0 rgba(255,255,255,0.14), 780px 580px 0 rgba(200,164,86,0.35),
      50px 750px 0 rgba(200,164,86,0.3), 300px 820px 0 rgba(255,255,255,0.16),
      1000px 300px 0 rgba(200,164,86,0.2), 1150px 500px 0 rgba(255,255,255,0.12);
  }
  .jt-cost-grid {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 1px; background: rgba(200,164,86,0.18);
    border: 1px solid rgba(200,164,86,0.18); border-radius: 2px;
    overflow: hidden; margin-top: 48px;
  }
  .jt-areas-grid {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1px; background: rgba(200,164,86,0.18);
    border: 1px solid rgba(200,164,86,0.18); border-radius: 2px;
    overflow: hidden; margin-top: 48px;
  }
  .jt-transform {
    display: grid; grid-template-columns: 1fr auto 1fr;
    gap: 24px; align-items: center; margin-top: 48px;
  }
  @media (max-width: 640px) {
    .jt-transform { grid-template-columns: 1fr; }
    .jt-transform > div:nth-child(2) { transform: rotate(90deg); padding: 0; justify-content: center; display: flex; }
    .jt-areas-grid { grid-template-columns: 1fr 1fr; }
  }
  @media (max-width: 400px) {
    .jt-areas-grid { grid-template-columns: 1fr; }
    .jt-cost-grid { grid-template-columns: 1fr; }
  }
  @media (prefers-reduced-motion: reduce) { * { animation: none !important; transition: none !important; } }
  a.jt-footer-link:hover { color: #c8a456; }
`
