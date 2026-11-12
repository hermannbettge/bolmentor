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
  'Alle 8 Lebensbereiche täglich',
  'Monatsanalyse jeden Monat neu',
  'Persönlicher Energiekalender',
  'Spezial- und Jahresanalysen',
  'Vollzugang zu allen zukünftigen Funktionen',
]

export default function Jahrestarif() {
  return (
    <div style={styles.page}>
      <style>{css}</style>

      {/* Stars */}
      <div className="jt-stars" aria-hidden="true" />

      <div style={styles.content}>

        {/* HERO */}
        <section style={styles.hero}>
          <div style={styles.eyebrow}>Bewusstsein.Ohne.Limit · Jahrestarif</div>
          <h1 style={styles.h1}>
            Stell dir vor, du weißt jeden Morgen<br />
            <em style={{ color: 'var(--jt-gold)', fontStyle: 'italic' }}>genau, was dieser Tag von dir will.</em>
          </h1>
          <p style={styles.heroSub}>
            Der Maya-Kalender kennt deine kosmische Signatur seit dem Tag deiner Geburt.
            5.000 Jahre Weisheit, jeden Morgen neu berechnet für dein Leben, deinen Körper, dein Business.
          </p>
          <div style={styles.pricePill}>
            Vollzugang für <strong style={{ color: 'var(--jt-gold)', fontSize: '1.05rem' }}>74 Cent pro Tag</strong>
          </div>
          <div style={styles.scrollHint}>
            <span>Lies weiter</span>
            <div style={styles.scrollLine} />
          </div>
        </section>

        {/* DIE FRAGE */}
        <section style={{ ...styles.section, textAlign: 'center' }}>
          <div style={styles.eyebrow}>Die eigentliche Frage</div>
          <h2 style={styles.h2}>Was kostet dich ein weiteres Jahr ohne diese Klarheit?</h2>
          <div style={styles.goldLine} />
          <p style={{ color: 'var(--jt-fg2)', fontSize: '1rem', lineHeight: 1.8, maxWidth: '58ch', margin: '0 auto' }}>
            Ein Coaching-Gespräch kostet zwischen 150 und 300 Euro.
            Du bekommst 60 Minuten Orientierung für eine Frage.
            Hier bekommst du 365 Tage persönliche Führung in allen Bereichen deines Lebens,
            täglich neu, täglich präzise auf deine kosmische Energie abgestimmt.
          </p>
        </section>

        {/* VERGLEICH */}
        <section style={styles.bandSection}>
          <div style={styles.sectionInner}>
            <div style={{ ...styles.eyebrow, textAlign: 'center' }}>Der Vergleich</div>
            <h2 style={{ ...styles.h2, textAlign: 'center' }}>270 Euro im Jahr.</h2>
            <div style={styles.costGrid}>
              {[
                { amount: '300 €', label: '1 Coaching-Stunde', strike: true },
                { amount: '1.200 €', label: '1 Seminar-Wochenende', strike: true },
                { amount: '0,74 €', label: '1 Tag mit MAYA · Jahrestarif', highlight: true },
                { amount: '365 Tage', label: 'Tägliche Energieführung in 8 Bereichen', highlight: true, small: true },
              ].map((item, i) => (
                <div key={i} style={styles.costCell}>
                  <div style={{
                    ...styles.costAmount,
                    ...(item.highlight ? styles.costAmountHighlight : {}),
                    ...(item.small ? { fontSize: '1.8rem' } : {}),
                    ...(item.strike ? { textDecoration: 'line-through', opacity: 0.4 } : {}),
                  }}>
                    {item.amount}
                  </div>
                  <div style={styles.costLabel}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* BEREICHE */}
        <section style={styles.section}>
          <div style={{ ...styles.eyebrow, textAlign: 'center' }}>Was dich erwartet</div>
          <h2 style={{ ...styles.h2, textAlign: 'center' }}>8 Lebensbereiche.<br />Täglich. Für dich berechnet.</h2>
          <div style={styles.areasGrid}>
            {AREAS.map((area, i) => (
              <div key={i} style={styles.areaCard}>
                <div style={{ fontSize: '1.3rem' }}>{area.icon}</div>
                <div style={styles.areaName}>{area.name}</div>
                <div style={styles.areaDesc}>{area.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* TRANSFORMATION */}
        <section style={styles.bandSection}>
          <div style={styles.sectionInner}>
            <div style={{ ...styles.eyebrow, textAlign: 'center' }}>Die Veränderung</div>
            <h2 style={{ ...styles.h2, textAlign: 'center' }}>Vorher. Nachher.</h2>
            <div style={styles.transformRow}>
              <div style={{ ...styles.transformSide, borderColor: 'rgba(255,255,255,0.08)' }}>
                <div style={{ ...styles.transformLabel, color: 'rgba(255,255,255,0.3)' }}>Ohne MAYA</div>
                {BEFORE.map((text, i) => (
                  <div key={i} style={styles.transformItem}>
                    <span style={{ color: 'rgba(255,255,255,0.2)', flexShrink: 0, marginTop: 2 }}>—</span>
                    <span style={{ color: 'var(--jt-fg2)' }}>{text}</span>
                  </div>
                ))}
              </div>
              <div style={styles.arrowCol}>→</div>
              <div style={{ ...styles.transformSide, borderColor: 'var(--jt-gold-dim)' }}>
                <div style={{ ...styles.transformLabel, color: 'var(--jt-gold)' }}>Mit MAYA</div>
                {AFTER.map((text, i) => (
                  <div key={i} style={styles.transformItem}>
                    <span style={{ color: 'var(--jt-gold)', flexShrink: 0, marginTop: 4, fontSize: '0.6rem' }}>◆</span>
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ ...styles.bandSection, background: 'linear-gradient(to bottom, var(--jt-bg), var(--jt-bg2))' }}>
          <div style={{ ...styles.sectionInner, textAlign: 'center' }}>
            <div style={styles.eyebrow}>Jetzt starten</div>
            <h2 style={styles.h2}>Ein Jahr. Alle Bereiche.<br />Täglich personalisiert.</h2>
            <div style={styles.goldLine} />
            <div style={styles.ctaBox}>
              <div style={{ fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--jt-fg2)', marginBottom: 4 }}>Jahrestarif</div>
              <div style={{ margin: '32px 0 40px' }}>
                <div style={styles.priceMain}>270 €</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--jt-fg2)', marginTop: 8, letterSpacing: '0.06em' }}>
                  einmalig pro Jahr · jederzeit kündbar
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--jt-gold-dim)', marginTop: 4 }}>
                  74 Cent pro Tag · weniger als ein Espresso
                </div>
              </div>
              <ul style={styles.includesList}>
                {INCLUDES.map((item, i) => (
                  <li key={i} style={styles.includesItem}>
                    <span style={{ color: 'var(--jt-gold)', fontSize: '0.55rem', flexShrink: 0, marginTop: 5 }}>◆</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div style={{ marginTop: 40 }}>
                <Link to="/checkout?product=membershipAnnual" style={styles.ctaBtn}>
                  Jahrestarif aktivieren
                </Link>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--jt-fg2)', marginTop: 24, lineHeight: 1.6 }}>
                Voller Zugang ab dem ersten Tag.<br />
                Kein Risiko. Kein Vertrag. Kein Haken.
              </p>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--jt-gold-dim)', marginTop: 32 }}>
              Basiert auf dem 5.000 Jahre alten Maya-Dreamspell-Kalender,
              berechnet auf dein persönliches Geburtsdatum.
              Bewusstsein.Ohne.Limit · Deutschland
            </p>
          </div>
        </section>

      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    backgroundColor: 'var(--jt-bg)',
    color: 'var(--jt-fg)',
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
    padding: '80px 24px 64px',
  },
  h1: {
    fontFamily: "'Playfair Display', serif",
    fontWeight: 400,
    fontSize: 'clamp(2rem, 5.5vw, 3.6rem)',
    lineHeight: 1.15,
    color: 'var(--jt-fg)',
    marginBottom: 32,
    textWrap: 'balance',
  },
  h2: {
    fontFamily: "'Playfair Display', serif",
    fontWeight: 400,
    fontSize: 'clamp(1.4rem, 3.5vw, 2.2rem)',
    lineHeight: 1.25,
    color: 'var(--jt-fg)',
    marginBottom: 24,
    textWrap: 'balance',
  },
  eyebrow: {
    fontSize: '0.7rem',
    fontWeight: 600,
    letterSpacing: '0.22em',
    textTransform: 'uppercase',
    color: 'var(--jt-gold)',
    marginBottom: 28,
  },
  heroSub: {
    fontSize: '1.05rem',
    color: 'var(--jt-fg2)',
    maxWidth: '52ch',
    lineHeight: 1.75,
    marginBottom: 56,
  },
  pricePill: {
    display: 'inline-block',
    border: '1px solid rgba(200,164,86,0.18)',
    borderRadius: 100,
    padding: '14px 32px',
    fontSize: '0.85rem',
    color: 'var(--jt-fg2)',
    letterSpacing: '0.04em',
    marginBottom: 20,
  },
  scrollHint: {
    marginTop: 64,
    fontSize: '0.72rem',
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    color: 'var(--jt-gold-dim)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 10,
  },
  scrollLine: {
    width: 1,
    height: 40,
    background: 'linear-gradient(to bottom, rgba(122,96,53,1), transparent)',
  },
  section: {
    padding: '96px max(16px, calc((100% - 820px) / 2))',
  },
  sectionInner: {
    maxWidth: 820,
    margin: '0 auto',
    padding: '0 16px',
  },
  bandSection: {
    background: 'var(--jt-bg2)',
    borderTop: '1px solid rgba(200,164,86,0.18)',
    borderBottom: '1px solid rgba(200,164,86,0.18)',
    padding: '96px 0',
  },
  goldLine: {
    width: 48,
    height: 1,
    background: 'var(--jt-gold)',
    opacity: 0.5,
    margin: '24px auto',
  },
  costGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 1,
    background: 'rgba(200,164,86,0.18)',
    border: '1px solid rgba(200,164,86,0.18)',
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 48,
  },
  costCell: {
    background: 'var(--jt-card)',
    padding: '32px 28px',
  },
  costAmount: {
    fontFamily: "'Playfair Display', serif",
    fontSize: '2.4rem',
    color: 'var(--jt-fg2)',
    lineHeight: 1,
    marginBottom: 8,
    fontVariantNumeric: 'tabular-nums',
  },
  costAmountHighlight: {
    color: 'var(--jt-gold)',
    fontSize: '2.8rem',
  },
  costLabel: {
    fontSize: '0.78rem',
    letterSpacing: '0.08em',
    color: 'var(--jt-fg2)',
    textTransform: 'uppercase',
  },
  areasGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
    gap: 1,
    background: 'rgba(200,164,86,0.18)',
    border: '1px solid rgba(200,164,86,0.18)',
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 48,
  },
  areaCard: {
    background: 'var(--jt-card)',
    padding: '24px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  areaName: {
    fontFamily: "'Playfair Display', serif",
    fontSize: '0.95rem',
    color: 'var(--jt-fg)',
  },
  areaDesc: {
    fontSize: '0.78rem',
    color: 'var(--jt-fg2)',
    lineHeight: 1.55,
  },
  transformRow: {
    display: 'grid',
    gridTemplateColumns: '1fr auto 1fr',
    gap: 24,
    alignItems: 'center',
    marginTop: 48,
  },
  transformSide: {
    background: 'var(--jt-card)',
    border: '1px solid',
    borderRadius: 2,
    padding: '28px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  transformLabel: {
    fontSize: '0.65rem',
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  transformItem: {
    fontSize: '0.84rem',
    lineHeight: 1.5,
    display: 'flex',
    gap: 10,
    alignItems: 'flex-start',
    color: 'var(--jt-fg)',
  },
  arrowCol: {
    fontSize: '1.5rem',
    color: 'var(--jt-gold-dim)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaBox: {
    border: '1px solid rgba(200,164,86,0.18)',
    background: 'var(--jt-card)',
    borderRadius: 2,
    padding: '56px 48px',
    marginTop: 48,
    position: 'relative',
    overflow: 'hidden',
  },
  priceMain: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 'clamp(3rem, 8vw, 5rem)',
    color: 'var(--jt-gold)',
    lineHeight: 1,
    letterSpacing: '-0.02em',
  },
  includesList: {
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    textAlign: 'left',
    maxWidth: 400,
    margin: '32px auto 0',
  },
  includesItem: {
    fontSize: '0.85rem',
    color: 'var(--jt-fg2)',
    display: 'flex',
    gap: 12,
    alignItems: 'flex-start',
  },
  ctaBtn: {
    display: 'inline-block',
    background: 'var(--jt-gold)',
    color: '#0d0c0a',
    fontFamily: "'Inter', sans-serif",
    fontSize: '0.85rem',
    fontWeight: 600,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    padding: '18px 56px',
    borderRadius: 1,
    textDecoration: 'none',
    transition: 'opacity 0.2s',
  },
}

const css = `
  :root {
    --jt-bg:       #0d0c0a;
    --jt-bg2:      #131210;
    --jt-card:     #1a1815;
    --jt-fg:       #f0ece2;
    --jt-fg2:      #a09880;
    --jt-gold:     #c8a456;
    --jt-gold-dim: #7a6035;
  }
  .jt-stars {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 0;
    overflow: hidden;
  }
  .jt-stars::before {
    content: '';
    position: absolute;
    width: 2px; height: 2px;
    border-radius: 50%;
    background: rgba(200,164,86,0.5);
    box-shadow:
      80px 120px 0 rgba(200,164,86,0.3), 240px 60px 0 rgba(255,255,255,0.15),
      420px 200px 0 rgba(200,164,86,0.2), 600px 90px 0 rgba(255,255,255,0.1),
      720px 310px 0 rgba(200,164,86,0.3), 900px 150px 0 rgba(255,255,255,0.12),
      140px 400px 0 rgba(255,255,255,0.08), 360px 520px 0 rgba(200,164,86,0.15),
      560px 650px 0 rgba(255,255,255,0.1), 780px 580px 0 rgba(200,164,86,0.25),
      50px 750px 0 rgba(200,164,86,0.2), 300px 820px 0 rgba(255,255,255,0.12);
  }
  @media (max-width: 600px) {
    .jt-transform-row { grid-template-columns: 1fr !important; }
    .jt-transform-arrow { transform: rotate(90deg); padding: 8px 0; }
    .jt-cta-box { padding: 40px 20px !important; }
    .jt-cost-grid { grid-template-columns: 1fr !important; }
  }
  @media (max-width: 400px) {
    .jt-areas-grid { grid-template-columns: 1fr !important; }
  }
  @media (prefers-reduced-motion: reduce) {
    * { animation: none !important; transition: none !important; }
  }
`
