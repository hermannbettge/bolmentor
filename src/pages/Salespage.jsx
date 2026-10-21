import { useState } from 'react'
import { Link } from 'react-router-dom'

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
  return (
    <div style={{ fontFamily: 'Inter, sans-serif', backgroundColor: CREAM }}>

      {/* HERO — zentriert, mit dekorativem Kin-Symbol */}
      <section style={{ backgroundColor: CREAM, borderBottom: `1px solid rgba(42,32,24,0.08)` }}>
        <div style={{
          maxWidth: '860px',
          margin: '0 auto',
          padding: '100px 40px 80px',
          textAlign: 'center',
        }}>
          <Tag>Maya Tzolkin Analyse</Tag>

          {/* Maya Kin Ornament */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '20px',
            marginBottom: '40px',
          }}>
            <div style={{ height: '1px', width: '60px', backgroundColor: 'rgba(160,82,45,0.25)' }} />
            <div style={{
              width: '52px',
              height: '52px',
              border: `1px solid rgba(160,82,45,0.3)`,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.3rem',
              color: COPPER,
            }}>
              ☽
            </div>
            <div style={{ height: '1px', width: '60px', backgroundColor: 'rgba(160,82,45,0.25)' }} />
          </div>

          <Hero>
            Du weißt, dass da mehr ist, aber du weißt noch nicht genau, was.
          </Hero>

          <div style={{ maxWidth: '580px', margin: '0 auto 40px' }}>
            <P>
              Dein Geburtsdatum ergibt ein Muster. Es beschreibt, wie du in der Welt wirkst, welche Themen dich begleiten und warum bestimmte Situationen immer wieder auftauchen.
            </P>
          </div>

          <PillButton to="/registrieren" variant="copper">Jetzt starten für 27 € im Monat →</PillButton>
          <p style={{ color: TEXT_LIGHT, fontSize: '0.78rem', marginTop: '14px' }}>
            Keine Mindestlaufzeit. Jederzeit kündbar.
          </p>
        </div>
      </section>

      {/* WIEDERERKENNUNG — zweispaltig */}
      <section style={{ backgroundColor: SAND }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '80px 40px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'start' }}>
            <div>
              <Tag>Das kennst du vielleicht</Tag>
              <H2>Du hast dich mit dir beschäftigt. Und trotzdem wiederholen sich Dinge.</H2>
            </div>
            <div style={{ paddingTop: '8px' }}>
              <FeatureRow
                num="1"
                text="Du weißt einiges über dich, du hast gelesen, vielleicht Seminare besucht oder dich intensiv mit dir auseinandergesetzt. Und trotzdem gibt es Situationen, die immer wiederkehren."
              />
              <FeatureRow
                num="2"
                text="Manche Lebensphasen laufen wie von selbst. Andere fühlen sich zäh an, egal was du tust."
              />
              <FeatureRow
                num="3"
                text="Du weißt, was du ändern möchtest. Die Frage ist, warum es im entscheidenden Moment trotzdem nicht so läuft."
              />
              <Line />
            </div>
          </div>
        </div>
      </section>

      {/* DARK — Das System */}
      <section style={{ backgroundColor: WARM }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '80px 40px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'start' }}>
            <div>
              <Tag dark>Das Muster</Tag>
              <H2 dark>Das ist kein Zufall und kein Fehler in dir. Es ist ein Muster. Und Muster kann man lesen.</H2>
              <P dark>Die Maya haben vor über 5.000 Jahren kein Zeitsystem entwickelt, sondern ein Bewusstseinssystem. Dein Geburtsdatum ergibt eine einzigartige Kombination aus Sonnensigel und galaktischem Ton, die zeigt, was dich antreibt und welches Thema sich durch dein Leben zieht.</P>
              <div style={{ marginTop: '32px' }}>
                <PillButton to="/registrieren" variant="outline">Analyse starten →</PillButton>
              </div>
            </div>
            <div>
              <FeatureRow num="01" title="Dein Leitsiegel" text="Was dich im Kern antreibt und wie du die Welt grundsätzlich wahrnimmst." dark />
              <FeatureRow num="02" title="Dein galaktischer Ton" text="Wie du auf andere wirkst, was dich herausfordert und wo deine besondere Kraft liegt." dark />
              <FeatureRow num="03" title="Dein persönliches Orakel" text="Die vier Energien, die dich begleiten: Stärken, Herausforderungen und verborgene Ressourcen." dark />
              <FeatureRow num="04" title="Dein Lebensthema" text="Was sich wie ein roter Faden durch dein Leben zieht, auch wenn du es bisher noch nicht so benennen konntest." dark />
              <Line dark />
            </div>
          </div>
        </div>
      </section>

      {/* BLOCKQUOTE */}
      <section style={{ backgroundColor: CREAM }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '80px 40px' }}>
          <BlockQuote>
            Stell dir vor, du weißt jeden Morgen, welche Energie dieser Tag trägt, bevor er begonnen hat.
          </BlockQuote>
        </div>
      </section>

      {/* ANGEBOT */}
      <section style={{ backgroundColor: SAND }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '80px 40px' }}>
          <Tag>Dein Zugang</Tag>
          <H2>Wähle deinen Weg.</H2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px', marginTop: '40px' }}>
            {/* Basis */}
            <div style={{ backgroundColor: DEEP, padding: '48px 40px' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.18em', color: COPPER_LIGHT, marginBottom: '24px' }}>
                Mitgliedschaft
              </div>
              <div style={{ fontFamily: '"Playfair Display", serif', fontStyle: 'italic', fontSize: '3.2rem', fontWeight: 400, color: CREAM, lineHeight: 1 }}>
                27 €
              </div>
              <div style={{ color: 'rgba(244,239,230,0.4)', fontSize: '0.82rem', marginBottom: '40px', marginTop: '4px' }}>pro Monat</div>
              <Line dark />
              <div style={{ paddingTop: '28px' }}>
                {[
                  'Tägliche Energieanalyse',
                  'Monatliche Tiefenanalyse',
                  'PDF-Download jeder Analyse',
                  'Dein persönliches Maya Profil',
                  'Jederzeit kündbar',
                ].map((item, i) => (
                  <div key={i} style={{ color: 'rgba(244,239,230,0.7)', fontWeight: 300, fontSize: '0.9rem', marginBottom: '12px', display: 'flex', gap: '12px' }}>
                    <span style={{ color: COPPER_LIGHT, flexShrink: 0 }}>—</span> {item}
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '40px' }}>
                <PillButton to="/registrieren" variant="copper">Jetzt Mitglied werden →</PillButton>
              </div>
            </div>

            {/* Zusatz */}
            <div style={{ backgroundColor: '#DDD5C2', padding: '48px 40px' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.18em', color: COPPER, marginBottom: '24px' }}>
                Zusatzanalysen
              </div>
              <div style={{ fontFamily: '"Playfair Display", serif', fontSize: '1.4rem', fontWeight: 400, color: TEXT, marginBottom: '8px' }}>
                Einzeln buchbar. Einmalig.
              </div>
              <div style={{ color: TEXT_LIGHT, fontSize: '0.88rem', marginBottom: '40px' }}>
                Für die Bereiche, die gerade relevant sind.
              </div>
              <Line />
              <div style={{ paddingTop: '28px' }}>
                {[
                  'Business-Analyse',
                  'Gesundheitsanalyse',
                  'Familienanalyse',
                  'Selbstausdruck-Analyse',
                  'Finanzanalyse',
                  'Karriere-Analyse',
                  'Lebensphasen-Analyse',
                  'Partnerschaftsanalyse',
                ].map((item, i) => (
                  <div key={i} style={{ color: TEXT_MID, fontWeight: 300, fontSize: '0.9rem', marginBottom: '10px', display: 'flex', gap: '12px' }}>
                    <span style={{ color: COPPER, flexShrink: 0, fontSize: '0.6rem', marginTop: '5px' }}>◆</span> {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={{ backgroundColor: WARM }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '80px 40px' }}>
          <Tag dark>Stimmen</Tag>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2px' }}>
            {[
              { name: 'Sarah M., 34', role: 'Unternehmerin, Hamburg', quote: 'Ich habe vieles über mich gewusst. Die Maya Analyse hat mir gezeigt, warum es trotzdem immer wieder gleich läuft. Das hat etwas in mir geöffnet.' },
              { name: 'Thomas K., 41', role: 'Führungskraft, München', quote: 'Ich war skeptisch. Dann habe ich die erste Analyse gelesen und das Gefühl gehabt, dass jemand beschreibt, wie ich wirklich funktioniere. Nicht wie ich sein sollte.' },
              { name: 'Julia R., 29', role: 'Coach, Berlin', quote: 'Die monatliche Analyse ist ein Orientierungspunkt geworden. Bevor ich größere Entscheidungen treffe, schaue ich rein. Es hilft.' },
            ].map((t, i) => (
              <div key={i} style={{ backgroundColor: 'rgba(244,239,230,0.05)', padding: '36px 28px', borderLeft: i > 0 ? '1px solid rgba(244,239,230,0.08)' : 'none' }}>
                <p style={{
                  fontFamily: '"Playfair Display", serif',
                  fontStyle: 'italic',
                  fontSize: '1rem',
                  color: 'rgba(244,239,230,0.8)',
                  lineHeight: 1.75,
                  margin: '0 0 24px',
                }}>
                  „{t.quote}"
                </p>
                <div style={{ color: 'rgba(244,239,230,0.5)', fontSize: '0.8rem', fontWeight: 500 }}>{t.name}</div>
                <div style={{ color: 'rgba(244,239,230,0.3)', fontSize: '0.75rem', marginTop: '2px' }}>{t.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINALER CTA */}
      <section style={{ backgroundColor: CREAM }}>
        <div style={{ maxWidth: '680px', margin: '0 auto', padding: '100px 40px', textAlign: 'center' }}>
          <div style={{
            width: '1px',
            height: '60px',
            backgroundColor: 'rgba(160,82,45,0.3)',
            margin: '0 auto 48px',
          }} />
          <H2>Du weißt wahrscheinlich längst, was du in deinem Leben besser verstehen möchtest.</H2>
          <P>
            Die spannendere Frage ist, welches Muster heute noch dafür sorgt, dass bestimmte Situationen immer wieder ähnlich verlaufen. Genau dort beginnt der nächste Schritt.
          </P>
          <div style={{ marginTop: '40px' }}>
            <PillButton to="/registrieren" variant="copper">Jetzt starten für 27 € im Monat →</PillButton>
          </div>
          <p style={{ color: TEXT_LIGHT, fontSize: '0.78rem', marginTop: '14px' }}>Keine Mindestlaufzeit. Jederzeit kündbar.</p>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ backgroundColor: SAND }}>
        <div style={{ maxWidth: '720px', margin: '0 auto', padding: '80px 40px' }}>
          <Tag>Häufige Fragen</Tag>
          <FaqItem
            question="Was genau ist der Maya Kalender?"
            answer="Der Maya Tzolkin ist ein 260-tägiger Zyklus aus 20 Sonnensiegeln und 13 galaktischen Tönen. Er beschreibt keine Zukunft, er beschreibt Muster. Dein Geburtsdatum ergibt eine einzigartige Kombination, die zeigt, wie du in der Welt wirkst und welche Themen dich begleiten."
          />
          <FaqItem
            question="Wie wird meine Analyse erstellt?"
            answer="Auf Basis deines Geburtsdatums berechnen wir dein persönliches Kin. Eine KI, die mit einem umfangreichen Maya-Wissenssystem arbeitet, erstellt daraus deine Analyse. Täglich neu, monatlich vertieft."
          />
          <FaqItem
            question="Ist das Esoterik?"
            answer="Der Maya Kalender ist ein über 5.000 Jahre altes System. Ob du es als spirituelles Werkzeug nutzt oder einfach als Spiegel für dein Verhalten, das entscheidest du. Viele Mitglieder haben keinen esoterischen Hintergrund."
          />
          <FaqItem
            question="Wie oft kann ich Analysen erstellen?"
            answer="Die Tagesenergie kannst du jeden Morgen neu abrufen. Die Monatsanalyse steht dir am 1. jeden Monats zur Verfügung. Zusatzanalysen für spezifische Lebensbereiche buchst du einmalig und kannst sie danach jederzeit aufrufen."
          />
          <FaqItem
            question="Wie kann ich kündigen?"
            answer="Jederzeit mit einem Klick in deinem Profil. Keine Fristen, keine Hürden."
          />
          <Line />
        </div>
      </section>

    </div>
  )
}
