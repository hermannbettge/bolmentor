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
        <Headline>Du weißt, dass du mehr bist. Aber du weißt noch nicht, wer.</Headline>
        <BodyText>
          <p>Der Maya Kalender zeigt dir das Muster, das deinem Leben zugrunde liegt. Nicht als Prophezeiung. Als Spiegel.</p>
        </BodyText>
        <div style={{ marginTop: '32px' }}>
          <PrimaryButton to="/registrieren">Jetzt entdecken – 27 € / Monat</PrimaryButton>
        </div>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem', marginTop: '12px' }}>
          Keine Mindestlaufzeit. Jederzeit kündbar.
        </p>
      </Section>

      <hr className="divider" />

      {/* SECTION 2 – SCHMERZ */}
      <Section bg="var(--color-bg-section)">
        <Eyebrow>Kennst du das?</Eyebrow>
        <Headline size="section">Du funktionierst. Aber du spürst dich kaum noch.</Headline>
        <BodyText>
          <p>Du tust, was getan werden muss. Du funktionierst nach außen. Aber tief drinnen weißt du, dass da mehr sein sollte.</p>
          <p>Mehr Klarheit darüber, wer du wirklich bist. Mehr Verständnis für die Muster, die sich in deinem Leben immer wiederholen. Mehr das Gefühl, dass dein Leben einen Sinn ergibt – nicht irgendwann. Jetzt.</p>
          <p>Vielleicht fragst du dich, warum manche Lebensphasen dich erschöpfen und andere dich beflügeln. Warum bestimmte Beziehungsmuster immer wieder auftauchen. Warum du manchmal gegen den Strom schwimmst, egal wie sehr du dich anstrengst.</p>
          <p>Das ist kein Zufall. Und es ist kein Fehler in dir.</p>
          <p>Es ist ein Muster. Und Muster kann man lesen.</p>
        </BodyText>
      </Section>

      <hr className="divider" />

      {/* SECTION 3 – WUNSCHZUSTAND */}
      <Section bg="var(--color-bg-deep)">
        <Eyebrow>Stell dir vor</Eyebrow>
        <Headline size="section">Was wäre, wenn du wüsstest, wer du wirklich bist?</Headline>
        <BodyText>
          <p>Du wachst morgen früh auf und weißt genau, welche Energie dieser Tag trägt. Du weißt, wo deine natürliche Kraft liegt, wo deine blinden Flecken sind, welche Themen gerade wirklich relevant sind.</p>
          <p>Du verstehst, warum Beziehungen sich so anfühlen, wie sie sich anfühlen. Warum deine Karriere in bestimmten Phasen aufblüht und in anderen stagniert. Was dein Körper dir eigentlich sagen will.</p>
          <p>Nicht weil jemand es dir erklärt hat. Sondern weil du dein eigenes Muster kennst.</p>
          <p>Der Maya Kalender gibt dir diese Sprache zurück. Die Sprache deines eigenen Lebens.</p>
        </BodyText>
      </Section>

      <hr className="divider" />

      {/* SECTION 4 – LÖSUNG */}
      <Section bg="var(--color-bg-section)">
        <Eyebrow>Die Lösung</Eyebrow>
        <Headline size="section">Der Maya Kalender – dein kosmischer Fingerabdruck</Headline>
        <BodyText>
          <p>Vor über 5.000 Jahren entwickelten die Maya ein Kalendersystem, das nicht Zeit misst – sondern Bewusstsein.</p>
          <p>Das Maya Tzolkin ist ein 260-tägiger Zyklus aus 20 Sonnensiegeln und 13 galaktischen Tönen. Jede Kombination ist einzigartig. Deine Kombination – basierend auf deinem Geburtsdatum – ist dein kosmischer Fingerabdruck.</p>
          <p>Sie zeigt dir:</p>
          <ul style={{ listStyle: 'none', padding: 0, margin: '16px 0' }}>
            {[
              'Dein Leitsiegel: Wer du im Kern bist',
              'Deinen galaktischen Ton: Wie du in der Welt wirkst',
              'Dein persönliches Orakel: Deine Stärken, Herausforderungen und verborgenen Kräfte',
              'Dein Lebensthema: Das übergreifende Thema dieser Inkarnation',
            ].map((item, i) => (
              <li key={i} style={{ color: 'var(--color-text-primary)', fontWeight: 300, marginBottom: '8px', paddingLeft: '16px', borderLeft: '2px solid var(--color-gold-muted)' }}>
                {item}
              </li>
            ))}
          </ul>
          <p>Mit unserem System bekommst du jeden Tag, jeden Monat und bei Bedarf für spezifische Lebensbereiche eine tiefe, KI-gestützte Analyse – basierend auf der vollständigen Maya Kalender Deutungstiefe.</p>
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
        <Headline size="section">Was es verändert</Headline>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginTop: '32px' }}>
          <TestimonialCard
            name="Sarah M., 34"
            description="Unternehmerin, Hamburg"
            quote="Ich wusste intellektuell vieles über mich. Aber die Maya Analyse hat mir gezeigt, warum. Das ist ein Unterschied wie Tag und Nacht."
          />
          <TestimonialCard
            name="Thomas K., 41"
            description="Führungskraft, München"
            quote="Ich war skeptisch. Dann habe ich meine erste Analyse gelesen und zum ersten Mal das Gefühl gehabt, dass jemand wirklich versteht, wie ich funktioniere."
          />
          <TestimonialCard
            name="Julia R., 29"
            description="Coach, Berlin"
            quote="Die monatliche Analyse ist für mich wie ein Kompass geworden. Ich schaue jeden Monat rein, bevor ich große Entscheidungen treffe."
          />
        </div>
      </Section>

      <hr className="divider" />

      {/* SECTION 7 – FINALER CTA */}
      <Section bg="var(--color-bg-deep)">
        <Headline size="section">Du bist nicht zufällig hier.</Headline>
        <BodyText>
          <p>Wenn du bis hierher gelesen hast, spricht etwas in dir an, was du vielleicht schon lange weißt: Du bist bereit, dich wirklich zu sehen. 27 € im Monat. Keine Mindestlaufzeit. Jederzeit kündbar.</p>
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
            answer="Der Maya Tzolkin ist ein 260-tägiger Bewusstseinskalender aus 20 Sonnensiegeln und 13 galaktischen Tönen. Er beschreibt keine Zukunft – er beschreibt dein inneres Muster."
          />
          <FaqItem
            question="Wie wird meine Analyse erstellt?"
            answer="Auf Basis deines Geburtsdatums berechnen wir dein persönliches Kin – deinen kosmischen Fingerabdruck. Eine KI, die mit jahrelang aufgebautem Maya Wissen trainiert wurde, erstellt daraus deine persönliche Analyse."
          />
          <FaqItem
            question="Ist das Esoterik?"
            answer="Der Maya Kalender ist ein über 5.000 Jahre altes Wissens- und Bewusstseinssystem. Ob du es als Spiritualität, Psychologie oder Selbstreflexionswerkzeug nutzt, bleibt dir überlassen. Viele unserer Mitglieder sind Menschen, die keine Esoterik-Affinität haben."
          />
          <FaqItem
            question="Wie oft kann ich Analysen erstellen?"
            answer="Die Tagesenergie kannst du jeden Morgen neu erstellen. Die Monatsanalyse erscheint am 1. jeden Monats. Zusatzanalysen kannst du nach einmaliger Buchung jederzeit abrufen."
          />
          <FaqItem
            question="Wie kann ich kündigen?"
            answer="Jederzeit mit einem Klick in deinem Profil. Keine Fristen, keine versteckten Klauseln."
          />
        </div>
      </Section>
    </div>
  )
}
