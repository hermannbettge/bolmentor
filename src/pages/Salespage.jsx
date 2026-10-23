import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useIsMobile } from '../hooks/useIsMobile.js'

const CREAM = '#F4EFE6'
const SAND = '#E8E0D0'
const DEEP = '#1A1410'
const WARM = '#2C1F14'
const COPPER = '#A0522D'
const COPPER_LIGHT = '#C4784A'
const TEXT = '#2A2018'
const TEXT_MID = '#5A4E42'
const TEXT_LIGHT = '#8C7E72'

function Tag({ children, dark = false }) {
  return (
    <span style={{
      display: 'inline-block',
      fontSize: '0.68rem',
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.2em',
      color: dark ? COPPER_LIGHT : COPPER,
      border: `1px solid ${dark ? 'rgba(196,120,74,0.4)' : 'rgba(160,82,45,0.3)'}`,
      padding: '6px 14px',
      borderRadius: '2px',
      marginBottom: '32px',
    }}>
      {children}
    </span>
  )
}

function Hero({ children }) {
  return (
    <h1 style={{
      fontFamily: '"Playfair Display", Georgia, serif',
      fontWeight: 400,
      fontStyle: 'italic',
      fontSize: 'clamp(2.4rem, 5.5vw, 4.2rem)',
      lineHeight: 1.15,
      color: TEXT,
      margin: '0 0 28px',
    }}>
      {children}
    </h1>
  )
}

function H2({ children, dark = false }) {
  return (
    <h2 style={{
      fontFamily: '"Playfair Display", Georgia, serif',
      fontWeight: 400,
      fontSize: 'clamp(1.9rem, 4vw, 3rem)',
      lineHeight: 1.2,
      color: dark ? '#F4EFE6' : TEXT,
      margin: '0 0 32px',
    }}>
      {children}
    </h2>
  )
}

function P({ children, dark = false, small = false }) {
  return (
    <p style={{
      fontFamily: 'Inter, sans-serif',
      fontSize: small ? '0.88rem' : '1rem',
      fontWeight: 300,
      lineHeight: 1.85,
      color: dark ? 'rgba(244,239,230,0.72)' : TEXT_MID,
      margin: '0 0 18px',
    }}>
      {children}
    </p>
  )
}

function PillButton({ to, children, variant = 'dark' }) {
  const styles = {
    dark: { bg: DEEP, color: CREAM, border: 'none' },
    outline: { bg: 'transparent', color: CREAM, border: `1px solid rgba(244,239,230,0.4)` },
    copper: { bg: COPPER, color: '#FFF8F2', border: 'none' },
  }
  const s = styles[variant]
  return (
    <Link to={to} style={{
      display: 'inline-block',
      backgroundColor: s.bg,
      color: s.color,
      border: s.border,
      padding: '14px 32px',
      borderRadius: '40px',
      fontSize: '0.82rem',
      fontWeight: 500,
      letterSpacing: '0.06em',
      textDecoration: 'none',
      transition: 'opacity 0.2s',
    }}>
      {children}
    </Link>
  )
}

function Line({ dark = false }) {
  return <div style={{ height: '1px', backgroundColor: dark ? 'rgba(244,239,230,0.12)' : 'rgba(42,32,24,0.1)', margin: '0' }} />
}

function FeatureRow({ num, title, text, dark = false }) {
  return (
    <>
      <Line dark={dark} />
      <div style={{
        display: 'grid',
        gridTemplateColumns: '56px 1fr',
        gap: '24px',
        padding: '28px 0',
        alignItems: 'start',
      }}>
        <div style={{
          fontFamily: '"Playfair Display", serif',
          fontStyle: 'italic',
          fontSize: '1.4rem',
          color: dark ? 'rgba(196,120,74,0.5)' : 'rgba(160,82,45,0.4)',
          paddingTop: '2px',
        }}>
          {num}
        </div>
        <div>
          {title && (
            <div style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.78rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.14em',
              color: dark ? COPPER_LIGHT : COPPER,
              marginBottom: '6px',
            }}>
              {title}
            </div>
          )}
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '1rem',
            fontWeight: 300,
            lineHeight: 1.8,
            color: dark ? 'rgba(244,239,230,0.75)' : TEXT_MID,
            margin: 0,
          }}>
            {text}
          </p>
        </div>
      </div>
    </>
  )
}

function BlockQuote({ children }) {
  return (
    <div style={{
      borderLeft: `3px solid ${COPPER}`,
      paddingLeft: '32px',
      margin: '0',
    }}>
      <p style={{
        fontFamily: '"Playfair Display", serif',
        fontStyle: 'italic',
        fontSize: 'clamp(1.3rem, 3vw, 1.9rem)',
        fontWeight: 400,
        lineHeight: 1.5,
        color: TEXT,
        margin: 0,
      }}>
        {children}
      </p>
    </div>
  )
}

function FaqItem({ question, answer }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Line />
      <div
        onClick={() => setOpen(!open)}
        style={{ padding: '22px 0', cursor: 'pointer' }}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '24px',
        }}>
          <span style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.96rem',
            fontWeight: 400,
            color: TEXT,
            lineHeight: 1.5,
          }}>
            {question}
          </span>
          <span style={{
            color: COPPER,
            fontSize: '1.2rem',
            flexShrink: 0,
            transform: open ? 'rotate(45deg)' : 'rotate(0)',
            transition: 'transform 0.2s',
            display: 'inline-block',
          }}>
            +
          </span>
        </div>
        {open && (
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.92rem',
            fontWeight: 300,
            lineHeight: 1.85,
            color: TEXT_MID,
            margin: '16px 0 0',
            maxWidth: '640px',
          }}>
            {answer}
          </p>
        )}
      </div>
    </>
  )
}

export default function Salespage() {
  const now = new Date()
  const isIntroPrice = now < new Date('2026-11-01')
  const jahresPreis = isIntroPrice ? '170 €' : '270 €'
  const jahresMonat = isIntroPrice ? '≈ 14,17 €/Monat' : '≈ 22,50 €/Monat'
  const m = useIsMobile()

  const grid2 = {
    display: 'grid',
    gridTemplateColumns: m ? '1fr' : '1fr 1fr',
    gap: m ? '32px' : '80px',
    alignItems: 'start',
  }
  const grid3 = {
    display: 'grid',
    gridTemplateColumns: m ? '1fr' : 'repeat(3, 1fr)',
    gap: m ? '8px' : '2px',
  }
  const sectionPad = { maxWidth: '1100px', margin: '0 auto', padding: m ? '48px 20px' : '80px 40px' }
  const sectionPadSm = { maxWidth: '800px', margin: '0 auto', padding: m ? '48px 20px' : '80px 40px' }
  const heroPad = { maxWidth: '860px', margin: '0 auto', textAlign: 'center', padding: m ? '48px 20px' : '100px 40px 80px' }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', backgroundColor: CREAM }}>

      {/* 1. PATTERN INTERRUPT — Hero */}
      <section style={{ backgroundColor: CREAM, borderBottom: `1px solid rgba(42,32,24,0.08)` }}>
        <div style={{ ...heroPad }}>
          <Tag>Maya Tzolkin · Bewusstseinssystem</Tag>

          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', marginBottom: '40px' }}>
            <div style={{ height: '1px', width: '60px', backgroundColor: 'rgba(160,82,45,0.25)' }} />
            <div style={{ width: '52px', height: '52px', border: `1px solid rgba(160,82,45,0.3)`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', color: COPPER }}>☽</div>
            <div style={{ height: '1px', width: '60px', backgroundColor: 'rgba(160,82,45,0.25)' }} />
          </div>

          <Hero>
            Du arbeitest an dir. Aber dieselben Muster kommen trotzdem immer wieder zurück.
          </Hero>

          <div style={{ maxWidth: '600px', margin: '0 auto 40px' }}>
            <P>
              Es liegt nicht an fehlender Disziplin. Es liegt daran, dass du das Muster noch nicht gelesen hast. Dein Geburtsdatum enthält einen Code, und dieser Code beschreibt, wie du wirklich funktionierst.
            </P>
          </div>

          <PillButton to="/registrieren" variant="copper">Jetzt starten · 17 € / Monat →</PillButton>
          <p style={{ color: TEXT_LIGHT, fontSize: '0.78rem', marginTop: '14px' }}>
            Einführungspreis gültig bis 31.12.2026 · Danach 27 €/Monat<br />Jederzeit kündbar
          </p>
        </div>
      </section>

      {/* 2. SCHMERZ — Was sich wiederholt */}
      <section style={{ backgroundColor: SAND }}>
        <div style={sectionPad}>
          <div style={grid2}>
            <div>
              <Tag>Das kennst du</Tag>
              <H2>Du hast dich schon intensiv mit dir beschäftigt. Und trotzdem läuft vieles gleich.</H2>
            </div>
            <div style={{ paddingTop: '8px' }}>
              <FeatureRow num="1" text="Du weißt einiges über dich, du hast gelesen, vielleicht Seminare besucht, und trotzdem gibt es Muster, die immer wieder auftauchen: in Beziehungen, im Business, mit Geld und mit deiner Gesundheit." />
              <FeatureRow num="2" text="Manche Phasen laufen wie von selbst. Andere fühlen sich zäh an, egal was du tust, und du weißt nicht warum." />
              <FeatureRow num="3" text="Du weißt, was du verändern möchtest. Die Frage ist: Warum passiert es im entscheidenden Moment trotzdem nicht?" />
              <Line />
            </div>
          </div>
        </div>
      </section>

      {/* 3. WUNSCHZUSTAND */}
      <section style={{ backgroundColor: CREAM }}>
        <div style={sectionPadSm}>
          <BlockQuote>
            Stell dir vor, du weißt jeden Morgen, welche Energie dieser Tag trägt, bevor er beginnt. Und du kennst die Muster, die dein Leben bisher geprägt haben.
          </BlockQuote>
        </div>
      </section>

      {/* 4. LÖSUNG — Das System */}
      <section style={{ backgroundColor: WARM }}>
        <div style={sectionPad}>
          <div style={grid2}>
            <div>
              <Tag dark>Die Lösung</Tag>
              <H2 dark>Das Muster lesen. Mit dem ältesten Bewusstseinssystem der Welt.</H2>
              <P dark>Die Maya haben vor über 5.000 Jahren kein Zeitsystem entwickelt, sondern ein Bewusstseinssystem. Dein Geburtsdatum ergibt eine einzigartige Kombination aus Sonnensiegel und galaktischem Ton. Diese Kombination beschreibt, was dich antreibt, was dich blockiert und welches Thema sich durch dein ganzes Leben zieht.</P>
              <div style={{ marginTop: '32px' }}>
                <PillButton to="/registrieren" variant="outline">Jetzt Zugang sichern →</PillButton>
              </div>
            </div>
            <div>
              <FeatureRow num="01" title="Dein Sonnensiegel" text="Was dich im Kern antreibt und wie du die Welt grundsätzlich wahrnimmst." dark />
              <FeatureRow num="02" title="Dein galaktischer Ton" text="Wie du auf andere wirkst, was dich herausfordert und wo deine besondere Kraft liegt." dark />
              <FeatureRow num="03" title="Dein persönliches Orakel" text="Die vier Energien, die dich begleiten: Stärken, Herausforderungen und verborgene Ressourcen." dark />
              <FeatureRow num="04" title="Tägliche Energie" text="Jeden Tag eine frische Analyse: welche Energie heute aktiv ist und wie du damit arbeitest." dark />
              <FeatureRow num="05" title="Energiekalender" text="Sehe auf einen Blick, welche Tage besonders kraftvoll für dich sind und welche zum Rückzug einladen." dark />
              <Line dark />
            </div>
          </div>
        </div>
      </section>

      {/* APP PREVIEW — Mockups */}
      <section style={{ backgroundColor: SAND }}>
        <div style={sectionPad}>
          <Tag>Die App</Tag>
          <H2>Dein persönliches Maya-Dashboard.</H2>

          <div style={{ ...grid3, gap: '16px', marginTop: '40px' }}>
            {[
              {
                icon: '◎',
                title: 'Deine Kernanalyse',
                desc: 'Sonnensiegel, galaktischer Ton, Orakel und dein Lebensthema. Alles in einer tiefen, persönlichen Analyse.',
                detail: 'Basiert auf deinem Geburtsdatum · KI-generiert · PDF-Download',
              },
              {
                icon: '◈',
                title: 'Energiekalender',
                desc: 'Sieh jeden Tag im Monat auf einen Blick. Aktions-, Kreativ-, Balance- und Ruhetage, immer im Überblick.',
                detail: 'Täglich aktuell · Klick für Tagesanalyse · Jahresübersicht',
              },
              {
                icon: '◇',
                title: 'Ereignis-Analysen',
                desc: 'Analysiere alles mit einem Datum: Beziehungen, Unternehmensstart, Verträge, wichtige Entscheidungen.',
                detail: '1 Ereignis im 1. Monat, +1 pro Monat · Im Jahrestarif sofort 12 · Erweiterbar',
              },
            ].map((card, i) => (
              <div key={i} style={{ backgroundColor: DEEP, padding: '32px 28px', borderRadius: '2px' }}>
                <div style={{ fontSize: '1.6rem', color: COPPER_LIGHT, marginBottom: '16px' }}>{card.icon}</div>
                <div style={{ fontFamily: '"Playfair Display", serif', fontSize: '1.1rem', color: CREAM, marginBottom: '12px', lineHeight: 1.4 }}>{card.title}</div>
                <p style={{ color: 'rgba(244,239,230,0.65)', fontSize: '0.88rem', lineHeight: 1.75, margin: '0 0 16px', fontWeight: 300 }}>{card.desc}</p>
                <div style={{ fontSize: '0.72rem', color: COPPER_LIGHT, borderTop: '1px solid rgba(244,239,230,0.08)', paddingTop: '14px', lineHeight: 1.6 }}>{card.detail}</div>
              </div>
            ))}
          </div>

          {/* Zusatzanalysen Preview */}
          <div style={{ marginTop: '16px', backgroundColor: '#DDD5C2', padding: '32px 28px', borderRadius: '2px' }}>
            <div style={{ ...grid2, gap: '32px', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.18em', color: COPPER, marginBottom: '12px' }}>Zusatzanalysen</div>
                <div style={{ fontFamily: '"Playfair Display", serif', fontSize: '1.3rem', color: TEXT, marginBottom: '12px', lineHeight: 1.4 }}>
                  Tiefe Analysen für jeden Lebensbereich.
                </div>
                <P small>Wenn du verstehen willst, wie die Maya-Energie sich in einem bestimmten Bereich auswirkt (Business, Gesundheit, Finanzen, Karriere, Beziehungen), buchst du diesen Bereich als monatliches Abo dazu — und kannst jederzeit kündigen.</P>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: m ? '1fr' : '1fr 1fr', gap: '8px' }}>
                {['Business-Analyse','Gesundheitsanalyse','Familienanalyse','Selbstausdruck-Analyse','Finanzanalyse','Karriere-Analyse','Lebensphasen-Analyse','Beziehungsmuster','Partnerschaftsanalyse','Einzel-Ereignisse'].map((item, i) => (
                  <div key={i} style={{ backgroundColor: CREAM, padding: '10px 14px', borderRadius: '2px', fontSize: '0.8rem', color: TEXT_MID, fontWeight: 400 }}>
                    <span style={{ color: COPPER, marginRight: '8px', fontSize: '0.6rem' }}>◆</span>{item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. PROOF — Testimonials */}
      <section style={{ backgroundColor: WARM }}>
        <div style={sectionPad}>
          <Tag dark>Stimmen</Tag>
          <div style={grid3}>
            {[1, 2, 3].map((_, i) => (
              <div key={i} style={{ backgroundColor: 'rgba(244,239,230,0.05)', padding: m ? '28px 20px' : '36px 28px', borderLeft: (!m && i > 0) ? '1px solid rgba(244,239,230,0.08)' : 'none', borderTop: (m && i > 0) ? '1px solid rgba(244,239,230,0.08)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '140px' }}>
                <p style={{ fontFamily: '"Playfair Display", serif', fontStyle: 'italic', fontSize: '1rem', color: 'rgba(244,239,230,0.3)', lineHeight: 1.75, margin: 0, textAlign: 'center' }}>
                  Hier könnte deine Stimme stehen.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MAYA KI */}
      <section style={{ backgroundColor: CREAM }}>
        <div style={sectionPad}>
          <div style={{ display: 'grid', gridTemplateColumns: m ? '1fr' : '1fr 1fr', gap: m ? '40px' : '80px', alignItems: 'center' }}>
            <div>
              <Tag>Neu</Tag>
              <H2>Maya KI — Dein persönlicher Berater.</H2>
              <P>
                Maya KI kennt dein Profil, dein Sonnensiegel, deinen galaktischen Ton und die Energie des heutigen Tages. Du kannst ihr alles fragen — über Beziehungen, Business, Entscheidungen, Blockaden. Sie antwortet nicht generisch. Sie antwortet für dich.
              </P>
              <div style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  'Basiert auf deinem persönlichen Maya-Profil',
                  'Kennt die Energie des heutigen Tages',
                  'Antwortet auf Deutsch, direkt und persönlich',
                  'Unbegrenzt nutzbar als Mitglied',
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', fontSize: '0.9rem', color: TEXT_MID, fontWeight: 300 }}>
                    <span style={{ color: COPPER, flexShrink: 0, fontSize: '0.6rem', marginTop: '6px' }}>◆</span>
                    {item}
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '36px' }}>
                <PillButton to="/registrieren" variant="copper">Jetzt ausprobieren →</PillButton>
              </div>
            </div>
            <div style={{ backgroundColor: DEEP, borderRadius: '4px', padding: m ? '24px' : '40px', fontFamily: 'Inter, sans-serif' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px', borderBottom: '1px solid rgba(244,239,230,0.1)', paddingBottom: '20px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', border: `1px solid ${COPPER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: COPPER_LIGHT, fontSize: '1.1rem' }}>☽</div>
                <div>
                  <div style={{ color: CREAM, fontWeight: 500, fontSize: '0.9rem' }}>Maya KI</div>
                  <div style={{ color: 'rgba(244,239,230,0.4)', fontSize: '0.75rem' }}>Persönliche Beraterin</div>
                </div>
              </div>
              <div style={{ fontSize: '0.9rem', color: 'rgba(244,239,230,0.75)', lineHeight: 1.8, fontWeight: 300, fontStyle: 'italic' }}>
                „Du trägst den Weißen Magier als Siegel — das bedeutet, du wirkst durch Ausrichtung, nicht durch Kraft. Wenn du gerade das Gefühl hast, gegen Widerstände zu arbeiten, frag dich: Bist du wirklich ausgerichtet, oder machst du es aus Pflicht? Heute ist ein guter Tag, um loszulassen, was du nicht wirklich willst."
              </div>
              <div style={{ marginTop: '24px', display: 'flex', gap: '8px' }}>
                {[
                  'Warum läuft das immer gleich ab?',
                  'Was trägt dieser Tag energetisch?',
                  'Was blockiert mich gerade?',
                ].map((s, i) => (
                  <div key={i} style={{ backgroundColor: 'rgba(244,239,230,0.06)', border: '1px solid rgba(244,239,230,0.1)', borderRadius: '16px', padding: '6px 12px', fontSize: '0.72rem', color: 'rgba(244,239,230,0.5)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: m ? '120px' : '160px' }}>
                    {s}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CTA — Preistabelle */}
      <section style={{ backgroundColor: SAND }}>
        <div style={sectionPad}>
          <Tag>Dein Zugang</Tag>
          <H2>Wähle deinen Einstieg.</H2>

          {/* Intro-Preis Banner */}
          <div style={{ backgroundColor: COPPER, borderRadius: '2px', padding: '14px 24px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#FFF8F2' }}>Einführungspreis</div>
            <div style={{ color: '#FFF8F2', fontSize: '0.88rem', fontWeight: 300 }}>Starte für <strong>17 €</strong> statt 27 €. Der Einführungspreis gilt bis einschließlich 31. Dezember 2026. Ab dem 1. Januar 2027 gilt der reguläre Preis von 27 €/Monat.</div>
          </div>

          <div style={{ ...grid3, marginTop: '8px' }}>
            {/* Basis Mitgliedschaft */}
            <div style={{ backgroundColor: DEEP, padding: '40px 32px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.18em', color: COPPER_LIGHT, marginBottom: '20px' }}>Mitgliedschaft</div>
              <div style={{ fontFamily: '"Playfair Display", serif', fontStyle: 'italic', fontSize: '2.8rem', fontWeight: 400, color: CREAM, lineHeight: 1 }}>17 €</div>
              <div style={{ color: 'rgba(244,239,230,0.35)', fontSize: '0.78rem', marginBottom: '4px', marginTop: '4px' }}>pro Monat</div>
              <div style={{ color: COPPER_LIGHT, fontSize: '0.78rem', marginBottom: '32px' }}>danach 27 €/Monat</div>
              <Line dark />
              <div style={{ paddingTop: '24px' }}>
                {[
                  'Tägliche Energieanalyse',
                  'Monatliche Tiefenanalyse',
                  'Energiekalender (Heute)',
                  '2 Ereignis-Analysen inklusive',
                  'Maya KI — persönliche Beraterin',
                  'PDF-Download jeder Analyse',
                  'Persönliches Maya-Profil',
                  'Jederzeit kündbar',
                ].map((item, i) => (
                  <div key={i} style={{ color: 'rgba(244,239,230,0.7)', fontWeight: 300, fontSize: '0.88rem', marginBottom: '11px', display: 'flex', gap: '12px' }}>
                    <span style={{ color: COPPER_LIGHT, flexShrink: 0 }}>·</span> {item}
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 'auto', paddingTop: '32px' }}>
                <PillButton to="/registrieren" variant="copper">Jetzt starten →</PillButton>
              </div>
            </div>

            {/* Jahrestarif */}
            <div style={{ backgroundColor: '#2A1F14', padding: '40px 32px', position: 'relative', border: `1px solid ${COPPER}`, display: 'flex', flexDirection: 'column' }}>
              <div style={{ position: 'absolute', top: '-1px', left: '50%', transform: 'translateX(-50%)', backgroundColor: COPPER, padding: '4px 16px', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.18em', color: CREAM, borderRadius: '0 0 4px 4px', whiteSpace: 'nowrap' }}>
                Empfohlen
              </div>
              <div style={{ fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.18em', color: COPPER_LIGHT, marginBottom: '20px' }}>Jahrestarif</div>
              <div style={{ fontFamily: '"Playfair Display", serif', fontStyle: 'italic', fontSize: '2.8rem', fontWeight: 400, color: CREAM, lineHeight: 1 }}>{jahresPreis}</div>
              <div style={{ color: 'rgba(244,239,230,0.35)', fontSize: '0.78rem', marginBottom: '4px', marginTop: '4px' }}>pro Jahr{isIntroPrice ? ' · Einführungspreis bis 31.10.' : ''}</div>
              <div style={{ color: COPPER_LIGHT, fontSize: '0.78rem', marginBottom: '32px' }}>{jahresMonat}</div>
              <Line dark />
              <div style={{ paddingTop: '24px' }}>
                {[
                  'Alles aus der Mitgliedschaft',
                  'Vollständiger Energiekalender',
                  'Tagesanalysen für jedes Datum',
                  '12 Ereignis-Analysen inklusive',
                  'Jahresanalyse für jeden Bereich',
                  '2 Monate geschenkt',
                ].map((item, i) => (
                  <div key={i} style={{ color: 'rgba(244,239,230,0.8)', fontWeight: 300, fontSize: '0.88rem', marginBottom: '11px', display: 'flex', gap: '12px' }}>
                    <span style={{ color: COPPER_LIGHT, flexShrink: 0 }}>·</span> {item}
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 'auto', paddingTop: '32px' }}>
                <PillButton to="/registrieren" variant="copper">Jahrestarif wählen →</PillButton>
              </div>
            </div>

            {/* Zusatzanalysen */}
            <div style={{ backgroundColor: '#DDD5C2', padding: '40px 32px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.18em', color: COPPER, marginBottom: '20px' }}>Zusatzanalysen</div>
              <div style={{ fontFamily: '"Playfair Display", serif', fontSize: '1.2rem', fontWeight: 400, color: TEXT, marginBottom: '8px', lineHeight: 1.4 }}>Einzeln buchbar.</div>
              <div style={{ color: TEXT_LIGHT, fontSize: '0.82rem', marginBottom: '32px' }}>Für die Bereiche, die gerade wichtig sind. Einmalig, ohne Abo.</div>
              <Line />
              <div style={{ paddingTop: '24px' }}>
                {[
                  'Business-Analyse',
                  'Gesundheitsanalyse',
                  'Familienanalyse',
                  'Selbstausdruck-Analyse',
                  'Finanzanalyse',
                  'Karriere-Analyse',
                  'Lebensphasen-Analyse',
                  'Beziehungsmuster',
                  'Partnerschaftsanalyse',
                ].map((item, i) => (
                  <div key={i} style={{ color: TEXT_MID, fontWeight: 300, fontSize: '0.88rem', marginBottom: '10px', display: 'flex', gap: '12px' }}>
                    <span style={{ color: COPPER, flexShrink: 0, fontSize: '0.6rem', marginTop: '5px' }}>◆</span> {item}
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 'auto', paddingTop: '32px' }}>
                <PillButton to="/zusatzanalysen" variant="outline">Analysen ansehen →</PillButton>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINALER CTA */}
      <section style={{ backgroundColor: CREAM }}>
        <div style={{ maxWidth: '680px', margin: '0 auto', textAlign: 'center', padding: m ? '48px 20px' : '100px 40px 80px' }}>
          <div style={{ width: '1px', height: '60px', backgroundColor: 'rgba(160,82,45,0.3)', margin: '0 auto 48px' }} />
          <H2>Du weißt wahrscheinlich längst, was du in deinem Leben besser verstehen möchtest.</H2>
          <P>
            Die spannendere Frage ist, welches Muster heute noch dafür sorgt, dass bestimmte Situationen immer wieder ähnlich verlaufen.<br />Genau dort beginnt der nächste Schritt.
          </P>
          <div style={{ marginTop: '40px', display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <PillButton to="/registrieren" variant="copper">Jetzt starten · 17 € / Monat →</PillButton>
          </div>
          <p style={{ color: TEXT_LIGHT, fontSize: '0.78rem', marginTop: '14px' }}>Einführungspreis gültig bis 31.12.2026 · Danach 27 €/Monat<br />Jederzeit kündbar</p>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ backgroundColor: SAND }}>
        <div style={sectionPadSm}>
          <Tag>Häufige Fragen</Tag>
          <FaqItem
            question="Was genau ist der Maya Kalender?"
            answer="Der Maya Tzolkin ist ein 260-tägiger Zyklus aus 20 Sonnensiegeln und 13 galaktischen Tönen. Er beschreibt keine Zukunft, er beschreibt Muster. Dein Geburtsdatum ergibt eine einzigartige Kombination, die zeigt, wie du in der Welt wirkst und welche Themen dich begleiten."
          />
          <FaqItem
            question="Wie wird meine Analyse erstellt?"
            answer="Auf Basis deines Geburtsdatums berechnen wir dein persönliches Kin. Eine KI, die mit einem umfangreichen Maya-Wissenssystem arbeitet, erstellt daraus deine Analyse. Täglich neu, monatlich vertieft, jährlich zusammengefasst."
          />
          <FaqItem
            question="Was ist der Unterschied zwischen Monatsmitgliedschaft und Jahrestarif?"
            answer="Im Jahrestarif bekommst du vollen Zugang zum Energiekalender (Tagesanalysen für jedes Datum, nicht nur heute), 12 statt 2 Ereignis-Analysen, Jahresanalysen für alle Lebensbereiche und 2 Monate geschenkt gegenüber dem monatlichen Preis."
          />
          <FaqItem
            question="Was sind Ereignis-Analysen?"
            answer="Du kannst jedem Datum, das für dich bedeutsam war oder ist, eine Maya-Analyse zuordnen. Eine Beziehung, ein Unternehmensstart, ein Vertrag, ein Umzug. Die Analyse zeigt, welche Energie damals aktiv war und was das heute bedeutet."
          />
          <FaqItem
            question="Ist das Esoterik?"
            answer="Der Maya Kalender ist ein über 5.000 Jahre altes System. Ob du es als spirituelles Werkzeug nutzt oder einfach als Spiegel für dein Verhalten, das entscheidest du. Viele Mitglieder haben keinen esoterischen Hintergrund."
          />
          <FaqItem
            question="Wie kann ich kündigen?"
            answer="Jederzeit mit einem Klick in deinem Profil. Keine Fristen, keine Hürden. Deine erstellten Analysen bleiben bis zum Ende des gebuchten Zeitraums abrufbar."
          />
          <Line />
        </div>
      </section>

    </div>
  )
}
