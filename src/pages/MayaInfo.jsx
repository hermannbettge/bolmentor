import { REGEN_LEGEND } from '../data/regenDays.js'

const TEXT = 'var(--text-1)'
const TEXT_LIGHT = 'var(--text-2)'
const COPPER = 'var(--accent)'
const BG = 'var(--bg-deep)'
const CARD = 'var(--bg-card)'
const BORDER = 'var(--border)'

function Section({ label, title, children }) {
  return (
    <div style={{ marginBottom: '56px' }}>
      {label && (
        <div style={{ fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.2em', color: COPPER, marginBottom: '8px' }}>
          {label}
        </div>
      )}
      {title && (
        <h2 style={{ fontFamily: '"Playfair Display", serif', fontWeight: 400, fontSize: '1.7rem', color: TEXT, margin: '0 0 20px', lineHeight: 1.3 }}>
          {title}
        </h2>
      )}
      <div style={{ color: TEXT_LIGHT, fontSize: '0.95rem', lineHeight: 1.85, fontWeight: 300 }}>
        {children}
        <p style={{ color: TEXT_LIGHT, fontSize: '0.8rem' }}>
          Quellen. <a href="https://lawoftime.org/decode/">Foundation for the Law of Time</a>, <a href="https://lawoftime.org/day-out-of-time/">Tag außerhalb der Zeit</a> und <a href="https://maya.nmai.si.edu/calendar/calendar-system">Smithsonian, Maya-Kalender</a>.
        </p>
      </div>
    </div>
  )
}

function InfoCard({ num, title, text }) {
  return (
    <div style={{ backgroundColor: CARD, border: `1px solid ${BORDER}`, borderRadius: '8px', padding: '24px 20px' }}>
      <div style={{ fontFamily: '"Playfair Display", serif', fontStyle: 'italic', fontSize: '1.2rem', color: COPPER, marginBottom: '8px', opacity: 0.5 }}>
        {num}
      </div>
      <div style={{ fontSize: '0.82rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: COPPER, marginBottom: '8px' }}>
        {title}
      </div>
      <p style={{ color: TEXT_LIGHT, fontSize: '0.88rem', lineHeight: 1.75, margin: 0, fontWeight: 300 }}>
        {text}
      </p>
    </div>
  )
}

export default function MayaInfo() {
  return (
    <div style={{ backgroundColor: BG, minHeight: '100vh', padding: 'clamp(24px,4vw,48px) clamp(16px,4vw,40px)', fontFamily: 'Inter, sans-serif' }}>
      <div className="analysis-inner" style={{ maxWidth: '760px' }}>

        <div style={{ fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.2em', color: COPPER, marginBottom: '8px' }}>
          Hintergrund
        </div>
        <h1 style={{ fontFamily: '"Playfair Display", serif', fontWeight: 400, fontStyle: 'italic', fontSize: '2.4rem', color: TEXT, margin: '0 0 48px', lineHeight: 1.2 }}>
          Der Maya Kalender
        </h1>

        <Section label="Mehr als Astrologie" title="Dreamspell und die traditionellen Maya-Kalender.">
          <p>
            Diese App verwendet Dreamspell, ein modernes symbolisches System von José und Lloydine Argüelles. Es ist vom 260-Tage-Kalender der Maya inspiriert und unterscheidet sich von der traditionellen Maya-Zählung. Das mythische Anfangsdatum der Langen Zählung im Jahr 3114 v. Chr. ist kein Nachweis für das Alter von Dreamspell.
          </p>
          <p style={{ marginTop: '16px' }}>
            Dreamspell verbindet 20 Sonnensiegel mit 13 galaktischen Tönen zu 260 Kombinationen. Die App nutzt diese Symbolik zur persönlichen Reflexion. Die Texte sind Deutungsangebote und keine überprüften Aussagen über Persönlichkeit, Erfolg oder den Verlauf der Geschichte.
          </p>
          <p style={{ marginTop: '16px' }}>
            Die traditionellen Maya-Kalender bestehen unter anderem aus dem 260-tägigen Tzolk’in beziehungsweise Chol Q’ij, dem 365-tägigen Haab und der Langen Zählung. Sie sind von dem hier verwendeten modernen System zu unterscheiden.
          </p>
        </Section>

        <div style={{ height: '1px', backgroundColor: BORDER, marginBottom: '56px' }} />

        <Section label="Die Grundstruktur" title="20 Siegel, 13 Töne, 260 Kombinationen.">
          <p>
            Im Dreamspell gibt es 20 symbolische Grundarchetypen, die sogenannten <strong style={{ color: TEXT }}>Siegel</strong>. In der Deutung dieser App werden sie als Bilder für Entwicklungsschritte gelesen. Vom <em>„Roten Drachen"</em>, der schöpferischen Urkraft, bis zur <em>„Gelben Sonne"</em>, der Vollendung.
          </p>
          <p style={{ marginTop: '16px' }}>
            Jeder reguläre Tag erhält rechnerisch eine Kombination aus Siegel und Ton. Diese Abfolge ist außerdem in sogenannte <strong style={{ color: TEXT }}>Wellen</strong> gegliedert, Zeitabschnitte zu 13 Tagen (<em>„13 Tönen"</em>), wobei der erste Tag jeder Welle ihr Thema vorgibt. Daraus ergeben sich <strong style={{ color: TEXT }}>260 Kombinationen</strong> aus Siegel und Ton, die sogenannten <em>„Kins"</em>.
          </p>
          <p style={{ marginTop: '16px' }}>
            Diese Abfolge von 20 Wellen à 13 Tagen bildet den <strong style={{ color: TEXT }}>Tzolkin</strong>, das Grundmodul der Maya-Zeitrechnung. Der moderne 13-Monde-Kalender beginnt am 26. Juli und endet am 25. Juli des Folgejahres. Er umfasst 13 Abschnitte à 28 Tage (364 Tage) plus einen weiteren <em>„Tag außerhalb der Zeit"</em> am 25. Juli. Das traditionelle Haab hat dagegen 18 Monate à 20 Tage und fünf zusätzliche Tage.
          </p>
        </Section>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '56px' }}>
          <InfoCard num="20" title="Sonnensiegel" text="Grundarchetypen, die die Energie eines Tages oder einer Person beschreiben. Vom Roten Drachen bis zur Gelben Sonne." />
          <InfoCard num="13" title="Galaktische Töne" text="Zeigen, wie eine Energie wirkt: als Impuls, als Herausforderung, als Kraftquelle oder als Vollendung." />
          <InfoCard num="260" title="Kins" text="Einzigartige Kombinationen aus Siegel und Ton. Dein Geburts-Kin dient als symbolischer Ausgangspunkt deiner Reflexion." />
          <InfoCard num="28" title="Tage pro Mond" text="Der moderne 13-Monde-Kalender umfasst 13 mal 28 Tage plus den 25. Juli als Tag außerhalb der Zeit. Der 29. Februar heißt 0.0 Hunab Ku." />
        </div>

        <div style={{ height: '1px', backgroundColor: BORDER, marginBottom: '56px' }} />

        <Section label="Dein persönliches Kin" title="Dein Geburtstag als kosmischer Code.">
          <p>
            Das <strong style={{ color: TEXT }}>Geburtskin</strong> ist die Energie-Kombination am Tag deiner Geburt. Die App verwendet es als Reflexionsbild, ohne daraus ein festgelegtes Lebensprogramm abzuleiten.
          </p>
          <p style={{ marginTop: '16px' }}>
            Der <strong style={{ color: TEXT }}>„Tag außerhalb der Zeit"</strong> ist im 13-Monde-Kalender immer der 25. Juli, kein vom Geburtstag abhängiger Tag. Die Kin-Zählung läuft an diesem Tag weiter. Ausgenommen wird der 29. Februar als 0.0 Hunab Ku.
          </p>
          <p style={{ marginTop: '16px' }}>
            Die Analysen beziehen das berechnete Geburts-Kin auf die Tageskombination. Diese Beziehung ist eine symbolische Deutung. Für am 29. Februar Geborene ist ohne lokale Geburtszeit keine eindeutige reguläre Signatur festgelegt.
          </p>
        </Section>

        <div style={{ height: '1px', backgroundColor: BORDER, marginBottom: '56px' }} />

        {/* Regenerationstage Legende */}
        <Section label="Regenerationstage im Kalender" title="Redaktionelle Impulse für Pausen und Reflexion.">
          <p style={{ marginBottom: '24px' }}>
            Im Energiekalender sind bestimmte Tage als <strong style={{ color: TEXT }}>Regenerationstage</strong> markiert. Die Markierungen sind allgemeine App-Vorschläge und keine persönliche Gesundheitsbewertung. Die Herkunft und Ableitungsregel der einzelnen Ruhegrade ist im vorhandenen Datensatz nicht dokumentiert. Die Daten sind erhalten; die Stufen sind keine belegte Regel der Maya-Tradition.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {REGEN_LEGEND.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', padding: '14px 16px', backgroundColor: CARD, borderRadius: '8px', border: `1px solid ${BORDER}` }}>
                <div style={{ fontSize: '1rem', color: item.symbol === '〰' ? '#7B9ED9' : '#C47A5A', flexShrink: 0, minWidth: '40px' }}>
                  {item.symbol}
                </div>
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 500, color: TEXT, marginBottom: '2px' }}>{item.label}</div>
                  <div style={{ fontSize: '0.8rem', color: TEXT_LIGHT }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <p style={{ marginTop: '20px', fontSize: '0.85rem', color: TEXT_LIGHT }}>
            Die <strong style={{ color: TEXT }}>Sturmwelle (〰)</strong> ist die siebte 13-tägige Welle im Dreamspell, Kin 79 bis 91. Ihre Termine sind berechenbar. Die App kann sie als Anlass zur Reflexion nutzen; eine allgemeine Heilwirkung oder vorgeschriebene Ruhezeit ist daraus nicht ableitbar.
          </p>
        </Section>

        <p style={{ color: TEXT_LIGHT, fontSize: '0.8rem' }}>
          Quellen. <a href="https://lawoftime.org/decode/">Foundation for the Law of Time</a>, <a href="https://lawoftime.org/day-out-of-time/">Tag außerhalb der Zeit</a> und <a href="https://maya.nmai.si.edu/calendar/calendar-system">Smithsonian, Maya-Kalender</a>.
        </p>
      </div>
    </div>
  )
}
