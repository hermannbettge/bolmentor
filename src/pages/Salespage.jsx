import { useState } from 'react'
import { Link } from 'react-router-dom'

function Section({ bg, children, style = {} }) {
  return (
    <section style={{ backgroundColor: bg, ...style }}>
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '80px 24px' }}>
        {children}
      </div>
    </section>
  )
}

function Eyebrow({ children }) {
  return (
    <div style={{
      fontSize: '0.75rem',
      fontWeight: 500,
      textTransform: 'uppercase',
      letterSpacing: '0.12em',
      color: 'var(--color-gold-muted)',
      marginBottom: '16px',
    }}>
      {children}
    </div>
  )
}

function Headline({ children, size = 'display' }) {
  return (
    <h2 style={{
      color: 'var(--color-gold)',
      fontWeight: size === 'display' ? 300 : 400,
      fontSize: size === 'display' ? 'clamp(1.8rem, 4vw, 2.8rem)' : 'clamp(1.3rem, 3vw, 1.8rem)',
      lineHeight: 1.2,
      letterSpacing: '0.02em',
      marginBottom: '24px',
    }}>
      {children}
    </h2>
  )
}

function BodyText({ children }) {
  return (
    <div style={{
      color: 'var(--color-text-primary)',
      fontWeight: 300,
      fontSize: '0.95rem',
      lineHeight: 1.85,
    }}>
      {children}
    </div>
  )
}

function PrimaryButton({ href, to, children, style = {} }) {
  const base = {
    display: 'inline-block',
    backgroundColor: 'var(--color-gold)',
    color: '#000',
    borderRadius: '4px',
    padding: '14px 32px',
    fontWeight: 500,
    fontSize: '0.95rem',
    textDecoration: 'none',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    ...style,
  }
  if (to) return <Link to={to} style={base}>{children}</Link>
  return <a href={href || '#'} style={base}>{children}</a>
}

function FaqItem({ question, answer }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom: '1px solid rgba(139,110,62,0.3)' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          background: 'none',
          border: 'none',
          padding: '20px 0',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          textAlign: 'left',
          color: 'var(--color-text-primary)',
          fontSize: '0.95rem',
          fontWeight: 400,
        }}
      >
        {question}
        <span style={{ color: 'var(--color-gold)', fontSize: '1.2rem', transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          ▾
        </span>
      </button>
      {open && (
        <div style={{
          paddingBottom: '20px',
          color: 'var(--color-text-muted)',
          fontWeight: 300,
          lineHeight: 1.85,
          fontSize: '0.9rem',
        }}>
          {answer}
        </div>
      )}
    </div>
  )
}

function TestimonialCard({ name, description, quote }) {
  return (
    <div style={{
      backgroundColor: '#FFFFFF',
      padding: '24px',
      borderRadius: '4px',
      flex: '1',
      minWidth: '220px',
    }}>
      <div style={{ marginBottom: '12px' }}>
        {[...Array(5)].map((_, i) => (
          <span key={i} style={{ color: 'var(--color-gold)', fontSize: '0.9rem' }}>★</span>
        ))}
      </div>
      <div style={{
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        backgroundColor: 'var(--color-bg-section)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--color-gold)',
        fontWeight: 600,
        fontSize: '1rem',
        marginBottom: '12px',
      }}>
        {name[0]}
      </div>
      <div style={{ color: '#1a1a1a', fontWeight: 600, fontSize: '0.9rem', marginBottom: '2px' }}>{name}</div>
      <div style={{ color: '#666', fontSize: '0.8rem', marginBottom: '12px' }}>{description}</div>
      <p style={{ color: '#333', fontWeight: 300, fontSize: '0.9rem', lineHeight: 1.7, margin: 0, fontStyle: 'italic' }}>
        "{quote}"
      </p>
    </div>
  )
}

export default function Salespage() {
  return (
    <div>
      {/* SECTION 1 – HERO */}
      <Section bg="var(--color-bg-deep)">
        <Eyebrow>Maya Kalender Analyse</Eyebrow>
        <Headline>Du weißt, dass da mehr ist, aber du weißt noch nicht genau, was – und der Maya Kalender zeigt es dir.</Headline>
        <BodyText>
          <p>Dein Geburtsdatum ergibt ein Muster, das beschreibt, wie du in der Welt wirkst, welche Themen dich begleiten und warum bestimmte Situationen in deinem Leben immer wieder auftauchen. Jeden Tag neu. Jeden Monat vertieft.</p>
        </BodyText>
        <div style={{ marginTop: '32px' }}>
          <PrimaryButton to="/registrieren">Jetzt starten – 27 € / Monat</PrimaryButton>
        </div>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem', marginTop: '12px' }}>
          Keine Mindestlaufzeit. Jederzeit kündbar.
        </p>
      </Section>

      <hr className="divider" />

      {/* SECTION 2 – SCHMERZ */}
      <Section bg="var(--color-bg-section)">
        <Eyebrow>Kennst du das?</Eyebrow>
        <Headline size="section">Du hast dich mit dir beschäftigt und trotzdem wiederholen sich bestimmte Dinge.</Headline>
        <BodyText>
          <p>Du weißt einiges über dich, du hast vielleicht gelesen, Seminare besucht oder dich auf andere Weise intensiv mit dir auseinandergesetzt – und trotzdem gibt es diese Situationen, die immer wieder auftauchen. In Beziehungen, im Beruf, im Umgang mit dir selbst.</p>
          <p>Manche Lebensphasen laufen wie von selbst, andere fühlen sich zäh an, egal was du tust. Manche Entscheidungen fallen leicht, andere kosten dich unverhältnismäßig viel Kraft.</p>
          <p>Das ist kein Zufall und es ist kein Fehler in dir. Es ist ein Muster, und Muster kann man lesen.</p>
        </BodyText>
      </Section>

      <hr className="divider" />

      {/* SECTION 3 – WUNSCHZUSTAND */}
      <Section bg="var(--color-bg-deep)">
        <Eyebrow>Was möglich wird</Eyebrow>
        <Headline size="section">Stell dir vor, du weißt jeden Morgen, welche Energie dieser Tag trägt, bevor er überhaupt begonnen hat.</Headline>
        <BodyText>
          <p>Du verstehst, warum bestimmte Phasen sich leicht anfühlen und andere nicht, warum Beziehungen manchmal reibungslos laufen und manchmal nicht, und was in deinem Leben gerade wirklich relevant ist – nicht weil jemand es dir erklärt hat, sondern weil du dein eigenes Muster erkennst.</p>
        </BodyText>
      </Section>

      <hr className="divider" />

      {/* SECTION 4 – LÖSUNG */}
      <Section bg="var(--color-bg-section)">
        <Eyebrow>Der Maya Kalender</Eyebrow>
        <Headline size="section">Die Maya haben vor über 5.000 Jahren kein Zeitsystem entwickelt, sondern ein Bewusstseinssystem.</Headline>
        <BodyText>
          <p>Der Maya Tzolkin ist ein 260-tägiger Zyklus aus 20 Sonnensiegeln und 13 galaktischen Tönen, und deine Kombination – berechnet aus deinem Geburtsdatum – ist einzigartig. Sie zeigt dir, was dich im Kern antreibt, wie du auf andere wirkst, wo deine natürlichen Stärken liegen und welches Thema sich wie ein roter Faden durch dein Leben zieht – auch wenn du es bisher noch nicht so benennen konntest.</p>
          <p>Auf dieser Grundlage erstellen wir dir täglich, monatlich und für jeden Lebensbereich, der dich gerade beschäftigt, eine tiefgehende persönliche Analyse.</p>
        </BodyText>
      </Section>

      <hr className="divider" />

      {/* SECTION 5 – ANGEBOT */}
      <Section bg="var(--color-bg-deep)" style={{ scrollMarginTop: '80px' }}>
        <Eyebrow>Dein Zugang</Eyebrow>
        <Headline size="section">Wähle deinen Weg</Headline>

        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginTop: '32px' }}>
          {/* Card 1 – Basis */}
          <div style={{
            backgroundColor: '#FFFFFF',
            padding: '28px 24px',
            borderRadius: '4px',
            flex: '1',
            minWidth: '260px',
          }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#666', marginBottom: '8px' }}>
              Basis Mitgliedschaft
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 300, color: '#1a1a1a', marginBottom: '24px' }}>
              27 € <span style={{ fontSize: '1rem', color: '#666' }}>/ Monat</span>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px' }}>
              {[
                'Tägliche Energieanalyse (jeden Morgen abrufbar)',
                'Monatliche Tiefenanalyse (am 1. jeden Monats)',
                'PDF-Download jeder Analyse mit BOL-Logo',
                'Dein persönliches Maya Profil',
                'Jederzeit kündbar',
              ].map((item, i) => (
                <li key={i} style={{ color: '#333', fontWeight: 300, fontSize: '0.9rem', marginBottom: '8px', display: 'flex', gap: '8px' }}>
                  <span style={{ color: 'var(--color-gold)' }}>✓</span> {item}
                </li>
              ))}
            </ul>
            <Link to="/registrieren" style={{
              display: 'block',
              backgroundColor: 'var(--color-gold)',
              color: '#000',
              borderRadius: '4px',
              padding: '12px 24px',
              fontWeight: 500,
              fontSize: '0.9rem',
              textDecoration: 'none',
              textAlign: 'center',
            }}>
              Jetzt Mitglied werden
            </Link>
          </div>

          {/* Card 2 – Zusatzanalysen */}
          <div style={{
            backgroundColor: '#FFFFFF',
            padding: '28px 24px',
            borderRadius: '4px',
            flex: '1',
            minWidth: '260px',
          }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#666', marginBottom: '8px' }}>
              Zusatzanalysen
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 300, color: '#555', marginBottom: '16px' }}>
              Einzeln buchbar, einmalig:
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px' }}>
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
                <li key={i} style={{ color: '#333', fontWeight: 300, fontSize: '0.9rem', marginBottom: '6px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ color: '#ccc', fontSize: '0.6rem' }}>●</span> {item}
                </li>
              ))}
            </ul>
            <a href="#analysen" style={{
              display: 'block',
              border: '1px solid var(--color-gold-muted)',
              color: 'var(--color-gold)',
              borderRadius: '4px',
              padding: '12px 24px',
              fontWeight: 500,
              fontSize: '0.9rem',
              textDecoration: 'none',
              textAlign: 'center',
              backgroundColor: 'transparent',
            }}>
              Mehr erfahren
            </a>
          </div>
        </div>
      </Section>

      <hr className="divider" />

      {/* SECTION 6 – TESTIMONIALS */}
      <Section bg="var(--color-bg-section)">
        <Eyebrow>Was andere sagen</Eyebrow>
        <Headline size="section">Was andere erlebt haben</Headline>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginTop: '32px' }}>
          <TestimonialCard
            name="Sarah M., 34"
            description="Unternehmerin, Hamburg"
            quote="Ich habe vieles über mich gewusst. Die Maya Analyse hat mir gezeigt, warum es trotzdem immer wieder gleich läuft. Das hat etwas in mir geöffnet."
          />
          <TestimonialCard
            name="Thomas K., 41"
            description="Führungskraft, München"
            quote="Ich war skeptisch. Dann habe ich die erste Analyse gelesen und zum ersten Mal das Gefühl gehabt, dass jemand beschreibt, wie ich wirklich funktioniere – nicht wie ich sein sollte."
          />
          <TestimonialCard
            name="Julia R., 29"
            description="Coach, Berlin"
            quote="Die monatliche Analyse ist für mich ein Orientierungspunkt geworden. Bevor ich größere Entscheidungen treffe, schaue ich rein. Es hilft."
          />
        </div>
      </Section>

      <hr className="divider" />

      {/* SECTION 7 – FINALER CTA */}
      <Section bg="var(--color-bg-deep)">
        <Headline size="section">Du weißt wahrscheinlich längst, was du in deinem Leben besser verstehen möchtest.</Headline>
        <BodyText>
          <p>Die spannendere Frage ist, welches Muster heute noch dafür sorgt, dass bestimmte Situationen immer wieder ähnlich verlaufen – und genau dort beginnt dein nächster Schritt.</p>
          <p style={{ marginTop: '16px', color: 'var(--color-text-muted)', fontSize: '0.88rem' }}>27 € im Monat. Keine Mindestlaufzeit. Jederzeit kündbar.</p>
        </BodyText>
        <div style={{ marginTop: '32px' }}>
          <PrimaryButton to="/registrieren">Jetzt starten</PrimaryButton>
        </div>
      </Section>

      <hr className="divider" />

      {/* SECTION 8 – FAQ */}
      <Section bg="var(--color-bg-section)">
        <Eyebrow>Häufige Fragen</Eyebrow>
        <Headline size="section">Vielleicht fragst du dich gerade:</Headline>
        <div style={{ marginTop: '32px' }}>
          <FaqItem
            question="Was genau ist der Maya Kalender?"
            answer="Der Maya Tzolkin ist ein 260-tägiger Zyklus aus 20 Sonnensiegeln und 13 galaktischen Tönen. Er beschreibt keine Zukunft – er beschreibt Muster. Dein Geburtsdatum ergibt eine einzigartige Kombination, die zeigt, wie du in der Welt wirkst und welche Themen dich begleiten."
          />
          <FaqItem
            question="Wie wird meine Analyse erstellt?"
            answer="Auf Basis deines Geburtsdatums berechnen wir dein persönliches Kin. Eine KI, die mit einem umfangreichen Maya-Wissenssystem arbeitet, erstellt daraus deine Analyse – täglich neu, monatlich vertieft."
          />
          <FaqItem
            question="Ist das Esoterik?"
            answer="Der Maya Kalender ist ein über 5.000 Jahre altes System. Ob du es als spirituelles Werkzeug nutzt oder einfach als Spiegel für dein Verhalten – das entscheidest du. Viele Mitglieder haben keinen esoterischen Hintergrund."
          />
          <FaqItem
            question="Wie oft kann ich Analysen erstellen?"
            answer="Die Tagesenergie kannst du jeden Morgen neu abrufen. Die Monatsanalyse steht dir am 1. jeden Monats zur Verfügung. Zusatzanalysen für spezifische Lebensbereiche kannst du nach einmaliger Buchung jederzeit aufrufen."
          />
          <FaqItem
            question="Wie kann ich kündigen?"
            answer="Jederzeit mit einem Klick in deinem Profil. Keine Fristen, keine Hürden."
          />
        </div>
      </Section>
    </div>
  )
}
