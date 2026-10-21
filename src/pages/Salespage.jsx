import { useState } from 'react'
import { Link } from 'react-router-dom'

const CREAM = '#F5F0E8'
const NAVY = '#0d1b2a'
const GOLD = '#B8975A'
const TEXT_DARK = '#1C1C1C'
const TEXT_MID = '#444444'
const TEXT_LIGHT = '#777777'

function Eyebrow({ children, light = false }) {
  return (
    <div style={{
      fontSize: '0.72rem',
      fontWeight: 500,
      textTransform: 'uppercase',
      letterSpacing: '0.18em',
      color: light ? 'rgba(184,151,90,0.8)' : GOLD,
      marginBottom: '20px',
    }}>
      {children}
    </div>
  )
}

function DisplayHeadline({ children, light = false }) {
  return (
    <h1 style={{
      fontFamily: '"Playfair Display", serif',
      fontWeight: 400,
      fontSize: 'clamp(2.8rem, 6vw, 5rem)',
      lineHeight: 1.1,
      letterSpacing: '-0.01em',
      color: light ? '#F2EDE4' : TEXT_DARK,
      marginBottom: '32px',
      marginTop: 0,
    }}>
      {children}
    </h1>
  )
}

function SectionHeadline({ children, light = false }) {
  return (
    <h2 style={{
      fontFamily: '"Playfair Display", serif',
      fontWeight: 400,
      fontSize: 'clamp(2.2rem, 5vw, 3.8rem)',
      lineHeight: 1.12,
      letterSpacing: '-0.01em',
      color: light ? '#F2EDE4' : TEXT_DARK,
      marginBottom: '40px',
      marginTop: 0,
    }}>
      {children}
    </h2>
  )
}

function Body({ children, light = false, centered = false }) {
  return (
    <div style={{
      color: light ? 'rgba(242,237,228,0.75)' : TEXT_MID,
      fontWeight: 300,
      fontSize: '1rem',
      lineHeight: 1.9,
      textAlign: centered ? 'center' : 'left',
    }}>
      {children}
    </div>
  )
}

function DarkButton({ to, href, children }) {
  const style = {
    display: 'inline-block',
    backgroundColor: NAVY,
    color: CREAM,
    padding: '16px 36px',
    fontSize: '0.75rem',
    fontWeight: 500,
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    textDecoration: 'none',
    border: 'none',
    cursor: 'pointer',
  }
  if (to) return <Link to={to} style={style}>{children}</Link>
  return <a href={href || '#'} style={style}>{children}</a>
}

function GoldButton({ to, href, children }) {
  const style = {
    display: 'inline-block',
    backgroundColor: 'transparent',
    color: CREAM,
    padding: '14px 34px',
    fontSize: '0.75rem',
    fontWeight: 500,
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    textDecoration: 'none',
    border: `1px solid rgba(184,151,90,0.6)`,
    cursor: 'pointer',
  }
  if (to) return <Link to={to} style={style}>{children}</Link>
  return <a href={href || '#'} style={style}>{children}</a>
}

function Divider({ light = false }) {
  return <hr style={{ border: 'none', borderTop: `1px solid ${light ? 'rgba(242,237,228,0.15)' : 'rgba(139,122,82,0.25)'}`, margin: 0 }} />
}

function NumberedItem({ number, title, text, light = false, large = false }) {
  return (
    <>
      <Divider light={light} />
      <div style={{
        display: 'grid',
        gridTemplateColumns: large ? '80px 1fr' : '80px 1fr',
        gap: '24px',
        padding: '36px 0',
        alignItems: large ? 'start' : 'center',
      }}>
        <div style={{
          fontFamily: '"Playfair Display", serif',
          fontSize: large ? '2rem' : '1.4rem',
          fontWeight: 400,
          color: GOLD,
          opacity: 0.9,
          lineHeight: 1,
          paddingTop: large ? '6px' : '0',
        }}>
          {number}
        </div>
        <div>
          {title && (
            <div style={{
              fontFamily: '"Playfair Display", serif',
              fontSize: '1.3rem',
              fontWeight: 400,
              color: light ? CREAM : TEXT_DARK,
              marginBottom: '8px',
            }}>
              {title}
            </div>
          )}
          {large ? (
            <div style={{
              fontFamily: '"Playfair Display", serif',
              fontStyle: 'italic',
              fontSize: 'clamp(1.3rem, 2.5vw, 1.8rem)',
              fontWeight: 400,
              color: light ? CREAM : TEXT_DARK,
              lineHeight: 1.5,
            }}>
              „{text}"
            </div>
          ) : (
            <div style={{
              color: light ? 'rgba(242,237,228,0.7)' : TEXT_LIGHT,
              fontWeight: 300,
              fontSize: '0.95rem',
              lineHeight: 1.8,
            }}>
              {text}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

function QuoteCallout({ children, highlight }) {
  return (
    <div style={{ textAlign: 'center', padding: '80px 24px' }}>
      <div style={{
        fontFamily: '"Playfair Display", serif',
        fontStyle: 'italic',
        fontSize: 'clamp(1.6rem, 3.5vw, 2.6rem)',
        fontWeight: 400,
        color: TEXT_DARK,
        lineHeight: 1.45,
        maxWidth: '800px',
        margin: '0 auto',
      }}>
        „{children.split(highlight)[0]}
        <span style={{ color: '#9B7B7B' }}>{highlight}</span>
        {children.split(highlight)[1]}"
      </div>
    </div>
  )
}

function FaqItem({ question, answer }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Divider />
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          background: 'none',
          border: 'none',
          padding: '24px 0',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          textAlign: 'left',
          color: TEXT_DARK,
          fontFamily: '"Playfair Display", serif',
          fontSize: '1.1rem',
          fontWeight: 400,
        }}
      >
        {question}
        <span style={{ color: GOLD, fontSize: '1.4rem', transition: 'transform 0.2s', transform: open ? 'rotate(45deg)' : 'rotate(0deg)', marginLeft: '24px', flexShrink: 0 }}>+</span>
      </button>
      {open && (
        <div style={{
          paddingBottom: '28px',
          color: TEXT_MID,
          fontWeight: 300,
          lineHeight: 1.9,
          fontSize: '0.95rem',
          maxWidth: '680px',
        }}>
          {answer}
        </div>
      )}
    </>
  )
}

function TestimonialCard({ name, role, quote }) {
  return (
    <div style={{
      backgroundColor: CREAM,
      padding: '36px 32px',
      flex: '1',
      minWidth: '260px',
    }}>
      <div style={{ marginBottom: '20px' }}>
        {[...Array(5)].map((_, i) => (
          <span key={i} style={{ color: GOLD, fontSize: '0.85rem' }}>★</span>
        ))}
      </div>
      <p style={{
        fontFamily: '"Playfair Display", serif',
        fontStyle: 'italic',
        fontSize: '1rem',
        fontWeight: 400,
        color: TEXT_DARK,
        lineHeight: 1.75,
        margin: '0 0 20px',
      }}>
        „{quote}"
      </p>
      <div style={{ color: TEXT_DARK, fontWeight: 500, fontSize: '0.85rem' }}>{name}</div>
      <div style={{ color: TEXT_LIGHT, fontSize: '0.8rem', marginTop: '2px' }}>{role}</div>
    </div>
  )
}

export default function Salespage() {
  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>

      {/* HERO */}
      <section style={{ backgroundColor: CREAM }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '100px 40px 80px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center' }}>
            <div>
              <Eyebrow>Maya Kalender Analyse</Eyebrow>
              <DisplayHeadline>
                Du weißt, dass da mehr ist, aber du weißt noch nicht genau, was.
              </DisplayHeadline>
              <Body>
                <p style={{ marginTop: 0 }}>Dein Geburtsdatum ergibt ein Muster, das beschreibt, wie du in der Welt wirkst, welche Themen dich begleiten und warum bestimmte Situationen in deinem Leben immer wieder auftauchen.</p>
              </Body>
              <div style={{ marginTop: '40px', display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
                <DarkButton to="/registrieren">Jetzt starten für 27 € im Monat →</DarkButton>
              </div>
              <p style={{ color: TEXT_LIGHT, fontSize: '0.8rem', marginTop: '16px' }}>
                Keine Mindestlaufzeit. Jederzeit kündbar.
              </p>
            </div>
            <div style={{
              backgroundColor: '#1a2a3a',
              aspectRatio: '4/5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <div style={{
                textAlign: 'center',
                padding: '40px',
              }}>
                <div style={{ fontFamily: '"Playfair Display", serif', fontSize: '3.5rem', fontWeight: 400, color: 'rgba(184,151,90,0.6)', lineHeight: 1, marginBottom: '8px' }}>☽</div>
                <div style={{ fontFamily: '"Playfair Display", serif', fontSize: '1.2rem', color: 'rgba(242,237,228,0.5)', letterSpacing: '0.1em' }}>MAYA TZOLKIN</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WIEDERERKENNUNG – creme */}
      <section style={{ backgroundColor: CREAM }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 40px 0' }}>
          <Eyebrow>Wiedererkennung</Eyebrow>
          <SectionHeadline>
            Du hast dich mit dir beschäftigt und trotzdem wiederholen sich bestimmte Dinge.
          </SectionHeadline>
        </div>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 40px 80px' }}>
          <NumberedItem
            number="01"
            text="Du weißt einiges über dich, du hast vielleicht gelesen, Seminare besucht oder dich auf andere Weise intensiv mit dir auseinandergesetzt. Und trotzdem gibt es diese Situationen, die immer wieder auftauchen."
          />
          <NumberedItem
            number="02"
            text="Manche Lebensphasen laufen wie von selbst, andere fühlen sich zäh an, egal was du tust. Manche Entscheidungen fallen leicht, andere kosten dich unverhältnismäßig viel Kraft."
          />
          <NumberedItem
            number="03"
            large={true}
            text="Du weißt längst, was du anders machen möchtest. Die Frage ist, warum es im entscheidenden Moment trotzdem nicht so läuft."
          />
          <Divider />
        </div>
      </section>

      {/* DARK – Was es kostet */}
      <section style={{ backgroundColor: NAVY }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 40px 0' }}>
          <Eyebrow light>Das Muster</Eyebrow>
          <SectionHeadline light>
            Das ist kein Zufall und kein Fehler in dir. Es ist ein Muster. Und Muster kann man lesen.
          </SectionHeadline>
        </div>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 40px' }}>
          <Body light>
            <p>Die Maya haben vor über 5.000 Jahren kein Zeitsystem entwickelt, sondern ein Bewusstseinssystem. Der Maya Tzolkin ist ein 260-tägiger Zyklus aus 20 Sonnensiegeln und 13 galaktischen Tönen. Deine Kombination, berechnet aus deinem Geburtsdatum, ist einzigartig.</p>
            <p>Sie zeigt dir, was dich im Kern antreibt, wie du auf andere wirkst, wo deine natürlichen Stärken liegen und welches Thema sich wie ein roter Faden durch dein Leben zieht. Auch wenn du es bisher noch nicht so benennen konntest.</p>
          </Body>
        </div>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 40px 0' }}>
          <NumberedItem number="01" title="Dein Leitsiegel" text="Was dich im Kern antreibt und wie du die Welt grundsätzlich wahrnimmst." light />
          <NumberedItem number="02" title="Dein galaktischer Ton" text="Wie du auf andere wirkst, was dich herausfordert und wo deine besondere Kraft liegt." light />
          <NumberedItem number="03" title="Dein persönliches Orakel" text="Die vier Energien, die dich begleiten: Stärken, Herausforderungen und verborgene Ressourcen." light />
          <NumberedItem number="04" title="Dein Lebensthema" text="Was sich wie ein roter Faden durch dein Leben zieht, oft ohne dass du es bisher so benennen konntest." light />
          <Divider light />
        </div>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 40px 80px', textAlign: 'center' }}>
          <GoldButton to="/registrieren">Jetzt starten für 27 € im Monat →</GoldButton>
          <p style={{ color: 'rgba(242,237,228,0.4)', fontSize: '0.78rem', marginTop: '16px' }}>Keine Mindestlaufzeit. Jederzeit kündbar.</p>
        </div>
      </section>

      {/* QUOTE CALLOUT */}
      <section style={{ backgroundColor: CREAM }}>
        <QuoteCallout highlight="jeden Morgen">
          Stell dir vor, du weißt jeden Morgen, welche Energie dieser Tag trägt, bevor er überhaupt begonnen hat.
        </QuoteCallout>
      </section>

      {/* ANGEBOT */}
      <section style={{ backgroundColor: CREAM }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 40px 80px' }}>
          <Eyebrow>Dein Zugang</Eyebrow>
          <SectionHeadline>Wähle deinen Weg.</SectionHeadline>

          <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
            {/* Basis */}
            <div style={{ flex: '1', minWidth: '280px', backgroundColor: NAVY, padding: '40px 36px' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(184,151,90,0.8)', marginBottom: '12px' }}>
                Basis Mitgliedschaft
              </div>
              <div style={{ fontFamily: '"Playfair Display", serif', fontSize: '2.8rem', fontWeight: 400, color: CREAM, marginBottom: '8px' }}>
                27 €
              </div>
              <div style={{ color: 'rgba(242,237,228,0.5)', fontSize: '0.85rem', marginBottom: '36px' }}>pro Monat</div>
              <div style={{ borderTop: '1px solid rgba(242,237,228,0.1)', paddingTop: '28px' }}>
                {[
                  'Tägliche Energieanalyse',
                  'Monatliche Tiefenanalyse am 1. jeden Monats',
                  'PDF-Download jeder Analyse',
                  'Dein persönliches Maya Profil',
                  'Jederzeit kündbar',
                ].map((item, i) => (
                  <div key={i} style={{ color: 'rgba(242,237,228,0.75)', fontWeight: 300, fontSize: '0.9rem', marginBottom: '12px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <span style={{ color: GOLD, marginTop: '2px', flexShrink: 0 }}>→</span> {item}
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '36px' }}>
                <Link to="/registrieren" style={{
                  display: 'block',
                  backgroundColor: CREAM,
                  color: NAVY,
                  padding: '14px 24px',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  textDecoration: 'none',
                  textAlign: 'center',
                }}>
                  Jetzt Mitglied werden →
                </Link>
              </div>
            </div>

            {/* Zusatzanalysen */}
            <div style={{ flex: '1', minWidth: '280px', backgroundColor: '#EAE4D8', padding: '40px 36px' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.15em', color: GOLD, marginBottom: '12px' }}>
                Zusatzanalysen
              </div>
              <div style={{ fontFamily: '"Playfair Display", serif', fontSize: '1.3rem', fontWeight: 400, color: TEXT_DARK, marginBottom: '8px' }}>
                Einzeln buchbar, einmalig.
              </div>
              <div style={{ color: TEXT_LIGHT, fontSize: '0.85rem', marginBottom: '36px' }}>
                Für die Lebensbereiche, die gerade relevant sind.
              </div>
              <div style={{ borderTop: '1px solid rgba(139,122,82,0.2)', paddingTop: '28px' }}>
                {[
                  'Business-Analyse',
                  'Gesundheitsanalyse',
                  'Familienanalyse',
                  'Selbstausdruck-Analyse',
                  'Finanzanalyse',
                  'Karriere-Analyse',
                  'Lebensphasen-Analyse',
                  'Partnerschaftsanalyse',
                  'Partner-Kompatibilität',
                ].map((item, i) => (
                  <div key={i} style={{ color: TEXT_MID, fontWeight: 300, fontSize: '0.9rem', marginBottom: '10px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <span style={{ color: GOLD, fontSize: '0.5rem' }}>●</span> {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS – dark */}
      <section style={{ backgroundColor: NAVY }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 40px' }}>
          <Eyebrow light>Was andere erlebt haben</Eyebrow>
          <SectionHeadline light>Stimmen.</SectionHeadline>
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            <TestimonialCard
              name="Sarah M., 34"
              role="Unternehmerin, Hamburg"
              quote="Ich habe vieles über mich gewusst. Die Maya Analyse hat mir gezeigt, warum es trotzdem immer wieder gleich läuft. Das hat etwas in mir geöffnet."
            />
            <TestimonialCard
              name="Thomas K., 41"
              role="Führungskraft, München"
              quote="Ich war skeptisch. Dann habe ich die erste Analyse gelesen und zum ersten Mal das Gefühl gehabt, dass jemand beschreibt, wie ich wirklich funktioniere. Nicht wie ich sein sollte."
            />
            <TestimonialCard
              name="Julia R., 29"
              role="Coach, Berlin"
              quote="Die monatliche Analyse ist für mich ein Orientierungspunkt geworden. Bevor ich größere Entscheidungen treffe, schaue ich rein. Es hilft."
            />
          </div>
        </div>
      </section>

      {/* FINALER CTA – creme */}
      <section style={{ backgroundColor: CREAM }}>
        <div style={{ maxWidth: '720px', margin: '0 auto', padding: '100px 40px', textAlign: 'center' }}>
          <SectionHeadline>
            Du weißt wahrscheinlich längst, was du in deinem Leben besser verstehen möchtest.
          </SectionHeadline>
          <Body centered>
            <p>Die spannendere Frage ist, welches Muster heute noch dafür sorgt, dass bestimmte Situationen immer wieder ähnlich verlaufen. Genau dort beginnt dein nächster Schritt.</p>
          </Body>
          <div style={{ marginTop: '48px' }}>
            <DarkButton to="/registrieren">Jetzt starten – 27 € / Monat →</DarkButton>
          </div>
          <p style={{ color: TEXT_LIGHT, fontSize: '0.78rem', marginTop: '16px' }}>Keine Mindestlaufzeit. Jederzeit kündbar.</p>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ backgroundColor: '#EAE4D8' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '80px 40px' }}>
          <Eyebrow>Häufige Fragen</Eyebrow>
          <SectionHeadline>Vielleicht fragst du dich gerade:</SectionHeadline>
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
            answer="Die Tagesenergie kannst du jeden Morgen neu abrufen. Die Monatsanalyse steht dir am 1. jeden Monats zur Verfügung. Zusatzanalysen für spezifische Lebensbereiche kannst du nach einmaliger Buchung jederzeit aufrufen."
          />
          <FaqItem
            question="Wie kann ich kündigen?"
            answer="Jederzeit mit einem Klick in deinem Profil. Keine Fristen, keine Hürden."
          />
          <Divider />
        </div>
      </section>

    </div>
  )
}
