import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import { useIsMobile } from '../hooks/useIsMobile.js'

const ANALYSES = [
  {
    key: 'business',
    icon: '🏢',
    title: 'Business-Analyse',
    subtitle: 'Dein Weg im Unternehmertum und Beruf',
    description: 'Welche Energie treibt dich im Business an? Die Analyse zeigt deine natürliche Strategie, wo du am stärksten wirkst und welche Fallen immer wieder auftauchen. Ideal für Unternehmer, Führungskräfte und alle, die beruflich den nächsten Schritt gehen wollen.',
    highlights: ['Deine Kern-Stärken im Business', 'Typische Sabotage-Muster erkennen', 'Optimale Strategie und Timing'],
  },
  {
    key: 'health',
    icon: '🌿',
    title: 'Gesundheitsanalyse',
    subtitle: 'Dein Körper und seine Energiemuster',
    description: 'Dein Körper kommuniziert über bestimmte Muster. Die Analyse zeigt, welche körperlichen und energetischen Themen sich durch dein Leben ziehen, wo du besonders aufmerksam sein solltest und was dir zur Regeneration wirklich hilft.',
    highlights: ['Körperliche Energiemuster verstehen', 'Regeneration und Schutz', 'Langfristige Gesundheitsstrategie'],
  },
  {
    key: 'family',
    icon: '👨‍👩‍👧',
    title: 'Familienanalyse',
    subtitle: 'Deine Rolle in deiner Familie',
    description: 'Familienmuster laufen oft unbewusst. Die Analyse zeigt, welche Energie du in deine Familie mitgebracht hast, welche Dynamiken dich geprägt haben und wie du heute bewusster mit diesen Mustern umgehen kannst.',
    highlights: ['Deine Rolle in der Familienstruktur', 'Übernommene Muster erkennen', 'Neue Dynamiken bewusst gestalten'],
  },
  {
    key: 'selfexpression',
    icon: '✨',
    title: 'Selbstausdruck-Analyse',
    subtitle: 'Deine kreative und authentische Stimme',
    description: 'Wie drückst du dich wirklich aus, wenn niemand schaut? Die Analyse beleuchtet deine kreativen Gaben, dein natürliches Ausdruckspotenzial und wo du dich vielleicht kleiner machst als du bist.',
    highlights: ['Kreative Stärken und Gaben', 'Authentizität vs. Anpassung', 'Sichtbarkeit und Ausdruck stärken'],
  },
  {
    key: 'finance',
    icon: '💰',
    title: 'Finanzanalyse',
    subtitle: 'Dein Verhältnis zu Geld und Überfluss',
    description: 'Geld ist Energie — und dein Umgang damit folgt einem Muster. Die Analyse zeigt deine natürliche Beziehung zu Wohlstand, welche unbewussten Überzeugungen dich begrenzen und wie du finanziell in deiner Kraft bleibst.',
    highlights: ['Dein natürliches Geld-Muster', 'Unbewusste Blockaden sichtbar machen', 'Stärken im Umgang mit Ressourcen'],
  },
  {
    key: 'career',
    icon: '🎯',
    title: 'Karriere-Analyse',
    subtitle: 'Dein beruflicher Weg und deine Berufung',
    description: 'Was ist deine eigentliche Berufung? Nicht das, was du gewählt hast — sondern das, wofür du wirklich gemacht bist. Die Analyse zeigt deinen optimalen Karrierepfad, wann der beste Zeitpunkt für Veränderungen ist und welche Umgebung dich aufblühen lässt.',
    highlights: ['Berufung vs. gewählter Beruf', 'Optimales Timing für Karriereschritte', 'Umgebung und Kontext für Höchstleistung'],
  },
  {
    key: 'lifephases',
    icon: '📅',
    title: 'Lebensphasen-Analyse',
    subtitle: 'Die wichtigsten Phasen deines Lebens',
    description: 'Dein Leben folgt einem Rhythmus aus Phasen — Aufbau, Reife, Transformation. Die Analyse zeigt, in welcher Phase du dich gerade befindest, was als nächstes kommt und welche vergangenen Phasen du vielleicht noch nicht vollständig integriert hast.',
    highlights: ['Aktuelle Lebensphase verstehen', 'Kommende Übergänge erkennen', 'Vergangenes integrieren'],
  },
  {
    key: 'relationship',
    icon: '❤️',
    title: 'Beziehungsmuster',
    subtitle: 'Deine eigenen Bindungsstile und Beziehungsmuster',
    description: 'Beziehungsmuster wiederholen sich — bis man sie versteht. Die Analyse zeigt, wie du in Beziehungen wirkst, was du unbewusst anziehst und was dir in einer Verbindung wirklich Erfüllung bringt.',
    highlights: ['Dein Bindungsstil verstehen', 'Unbewusste Muster erkennen', 'Tiefe und Erfüllung in Beziehungen'],
  },
  {
    key: 'partnership',
    icon: '💫',
    title: 'Partnerschaftsanalyse',
    subtitle: 'Du und dein Partner — Dynamik & Kompatibilität',
    description: 'Wie harmonieren zwei Energien miteinander? Die Partnerschaftsanalyse vergleicht dein Maya-Kin mit dem deines Partners und zeigt eure Stärken, Spannungsfelder und das gemeinsame Wachstumspotenzial.',
    highlights: ['Energetische Kompatibilität', 'Gemeinsame Stärken & Herausforderungen', 'Wachstumspotenzial als Paar'],
  },
]

const GOLD = '#A0522D'
const GOLD_LIGHT = '#C4784A'
const CREAM = '#F4EFE6'
const SAND = '#E8E0D0'
const DEEP = '#1A1410'
const WARM = '#2C1F14'
const TEXT = '#2A2018'
const TEXT_MID = '#5A4E42'
const TEXT_LIGHT = '#8C7E72'

export default function ZusatzanalysenPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const m = useIsMobile()

  function goToCheckout(key) {
    if (user) {
      navigate(`/checkout?product=${key}`)
    } else {
      navigate('/registrieren')
    }
  }

  function goToAll() {
    if (user) {
      navigate('/analysen')
    } else {
      navigate('/registrieren')
    }
  }

  const pad = { maxWidth: '1000px', margin: '0 auto', padding: m ? '48px 20px' : '80px 40px' }
  const grid2 = {
    display: 'grid',
    gridTemplateColumns: m ? '1fr' : '1fr 1fr',
    gap: m ? '16px' : '20px',
  }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', backgroundColor: CREAM, minHeight: '100vh' }}>

      {/* Header */}
      <section style={{ backgroundColor: CREAM, borderBottom: `1px solid rgba(42,32,24,0.08)` }}>
        <div style={{ ...pad, paddingBottom: m ? '32px' : '56px' }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.2em', color: GOLD, marginBottom: '24px' }}>
            Zusatzanalysen
          </div>
          <h1 style={{ fontFamily: '"Playfair Display", serif', fontWeight: 400, fontSize: m ? '2rem' : '3rem', color: TEXT, lineHeight: 1.2, marginBottom: '20px', maxWidth: '680px' }}>
            Tauche tiefer ein.
          </h1>
          <p style={{ fontSize: '1rem', fontWeight: 300, lineHeight: 1.85, color: TEXT_MID, maxWidth: '560px', marginBottom: '0' }}>
            Jede Analyse beleuchtet einen spezifischen Lebensbereich. Einmalig buchbar, lebenslanger Zugang. Du kannst einzelne Bereiche wählen oder alles auf einmal buchen.
          </p>
        </div>
      </section>

      {/* Komplettpaket */}
      <section style={{ backgroundColor: DEEP }}>
        <div style={{ ...pad }}>
          <div style={{ display: 'grid', gridTemplateColumns: m ? '1fr' : '2fr 1fr', gap: m ? '28px' : '60px', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.2em', color: GOLD_LIGHT, marginBottom: '16px' }}>
                Alle 8 Analysen
              </div>
              <h2 style={{ fontFamily: '"Playfair Display", serif', fontWeight: 400, fontSize: m ? '1.8rem' : '2.4rem', color: CREAM, lineHeight: 1.2, marginBottom: '16px' }}>
                Das Komplettpaket.
              </h2>
              <p style={{ fontSize: '0.95rem', fontWeight: 300, lineHeight: 1.85, color: 'rgba(244,239,230,0.7)', marginBottom: '0' }}>
                Alle 8 Analysen auf einen Schlag. Business, Gesundheit, Familie, Selbstausdruck, Finanzen, Karriere, Lebensphasen und Beziehungen. Du sparst gegenüber der Einzelbuchung und hast lebenslangen Zugang zu allen Bereichen.
              </p>
            </div>
            <div style={{ backgroundColor: 'rgba(244,239,230,0.05)', border: `1px solid ${GOLD_LIGHT}`, borderRadius: '4px', padding: '32px 28px' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.14em', color: GOLD_LIGHT, marginBottom: '12px' }}>Komplettpaket</div>
              <div style={{ fontFamily: '"Playfair Display", serif', fontSize: '1.5rem', color: CREAM, marginBottom: '8px' }}>Alle 8 Analysen</div>
              <div style={{ fontSize: '0.82rem', color: 'rgba(244,239,230,0.5)', marginBottom: '24px', lineHeight: 1.6 }}>
                Einmalig · Lebenslanger Zugang
              </div>
              <button
                onClick={goToAll}
                style={{
                  width: '100%',
                  backgroundColor: GOLD,
                  color: CREAM,
                  border: 'none',
                  borderRadius: '40px',
                  padding: '14px 24px',
                  fontWeight: 500,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                {user ? 'Komplettpaket buchen →' : 'Jetzt registrieren →'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Einzelanalysen */}
      <section style={{ backgroundColor: SAND }}>
        <div style={pad}>
          <div style={{ fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.2em', color: GOLD, marginBottom: '8px' }}>
            Einzeln buchbar
          </div>
          <h2 style={{ fontFamily: '"Playfair Display", serif', fontWeight: 400, fontSize: m ? '1.6rem' : '2rem', color: TEXT, marginBottom: '32px' }}>
            Wähle die Bereiche, die gerade wichtig sind.
          </h2>

          <div style={grid2}>
            {ANALYSES.map((a) => (
              <div key={a.key} style={{
                backgroundColor: CREAM,
                border: `1px solid rgba(42,32,24,0.08)`,
                borderRadius: '4px',
                padding: '32px 28px',
                display: 'flex',
                flexDirection: 'column',
              }}>
                <div style={{ fontSize: '1.8rem', marginBottom: '12px' }}>{a.icon}</div>
                <div style={{ fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.14em', color: GOLD, marginBottom: '6px' }}>
                  Einzelanalyse
                </div>
                <h3 style={{ fontFamily: '"Playfair Display", serif', fontWeight: 400, fontSize: '1.2rem', color: TEXT, marginBottom: '4px', lineHeight: 1.3 }}>
                  {a.title}
                </h3>
                <div style={{ fontSize: '0.82rem', color: TEXT_LIGHT, marginBottom: '16px' }}>{a.subtitle}</div>
                <p style={{ fontSize: '0.88rem', fontWeight: 300, lineHeight: 1.75, color: TEXT_MID, marginBottom: '20px', flex: 1 }}>
                  {a.description}
                </p>
                <div style={{ marginBottom: '24px' }}>
                  {a.highlights.map((h, i) => (
                    <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '8px', fontSize: '0.82rem', color: TEXT_MID }}>
                      <span style={{ color: GOLD, flexShrink: 0, fontSize: '0.6rem', marginTop: '5px' }}>◆</span>
                      {h}
                    </div>
                  ))}
                </div>
                <div style={{ borderTop: `1px solid rgba(42,32,24,0.08)`, paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '0.78rem', color: TEXT_LIGHT }}>Einmalig · Lebenslanger Zugang</div>
                  <button
                    onClick={() => goToCheckout(a.key)}
                    style={{
                      backgroundColor: DEEP,
                      color: CREAM,
                      border: 'none',
                      borderRadius: '40px',
                      padding: '10px 20px',
                      fontWeight: 500,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      fontFamily: 'Inter, sans-serif',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Buchen →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Hinweis für bereits angemeldete User */}
      {user && (
        <section style={{ backgroundColor: CREAM }}>
          <div style={{ ...pad, paddingTop: '40px', paddingBottom: '40px', textAlign: 'center' }}>
            <p style={{ fontSize: '0.88rem', color: TEXT_LIGHT, lineHeight: 1.8 }}>
              Du bist bereits Mitglied. Gebuchte Analysen findest du direkt in{' '}
              <button onClick={() => navigate('/analysen')} style={{ color: GOLD, background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.88rem', fontFamily: 'Inter, sans-serif', padding: 0, textDecoration: 'underline' }}>
                deinen Analysen
              </button>.
            </p>
          </div>
        </section>
      )}

    </div>
  )
}
