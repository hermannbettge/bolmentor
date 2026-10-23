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

        <Section label="Mehr als Astrologie" title="Ein über 5.000 Jahre altes Bewusstseinssystem.">
          <p>
            Der Maya Kalender ist mehr als eine andere Form von Astrologie. In Guatemala wird heute noch nach dem Maya Kalender von 3114 v.Chr. gelebt. Er ist zutiefst mit den Rhythmen der Erde und der Natur verwoben. Es gibt keine Schalttage und keine Anpassung an den Gregorianischen Kalender.
          </p>
          <p style={{ marginTop: '16px' }}>
            Dr. José Argüelles passte den Kalender an unsere Wahrnehmung der Zeit an. Der Tzolkin, die Basis des Maya Kalenders, ist ein wertvolles Werkzeug für persönliche Entwicklung und Erfolg. Das ihm zugrundeliegende Verständnis reicht jedoch weit darüber hinaus: Er lässt uns Sinn und Zweck der gesamten menschlichen Geschichte und Evolution verstehen.
          </p>
          <p style={{ marginTop: '16px' }}>
            Außerdem führt er uns zu einem Denken, das die gewohnten Dimensionen von Raum und Zeit von außen betrachtet. Eine Perspektive, die unser Welt- und Menschenbild von Grund auf verändern kann.
          </p>
        </Section>

        <div style={{ height: '1px', backgroundColor: BORDER, marginBottom: '56px' }} />

        <Section label="Die Grundstruktur" title="20 Siegel, 13 Töne, 260 Kombinationen.">
          <p>
            Den Mayas zufolge gibt es 20 Grundarchetypen, die sogenannten <strong style={{ color: TEXT }}>Siegel</strong>. Sie zeichnen in ihrer Abfolge die Entwicklung eines Menschen von der Zeugung bis zur höchsten Reife nach. Vom <em>„Roten Drachen"</em>, der schöpferischen Urkraft, bis zur <em>„Gelben Sonne"</em>, der Vollendung.
          </p>
          <p style={{ marginTop: '16px' }}>
            Jeder Tag wird von einem Siegel energetisiert. Diese Abfolge ist außerdem in sogenannte <strong style={{ color: TEXT }}>Wellen</strong> gegliedert, Zeitabschnitte zu 13 Tagen (<em>„13 Tönen"</em>), wobei der erste Tag jeder Welle ihr Thema vorgibt. Daraus ergeben sich <strong style={{ color: TEXT }}>260 Kombinationen</strong> aus Siegel und Ton, die sogenannten <em>„Kins"</em>.
          </p>
          <p style={{ marginTop: '16px' }}>
            Diese Abfolge von 20 Wellen à 13 Tagen bildet den <strong style={{ color: TEXT }}>Tzolkin</strong>, das Grundmodul der Maya-Zeitrechnung. Er läuft zugleich mit dem Sonnenjahr, das für die Mayas vom 26. bis 25. Juli verläuft und in 13 Monde à 28 Tage (364 Tage) plus einem weiteren <em>„Grünen Tag"</em> unterteilt ist.
          </p>
        </Section>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '56px' }}>
          <InfoCard num="20" title="Sonnensiegel" text="Grundarchetypen, die die Energie eines Tages oder einer Person beschreiben. Vom Roten Drachen bis zur Gelben Sonne." />
          <InfoCard num="13" title="Galaktische Töne" text="Zeigen, wie eine Energie wirkt: als Impuls, als Herausforderung, als Kraftquelle oder als Vollendung." />
          <InfoCard num="260" title="Kins" text="Einzigartige Kombinationen aus Siegel und Ton. Dein Geburtskin beschreibt dein persönliches Lebensprogramm." />
          <InfoCard num="28" title="Tage pro Mond" text="Das Maya-Jahr besteht aus 13 Monden à 28 Tage plus dem Tag außerhalb der Zeit, deinem persönlichen Jahreswechsel." />
        </div>

        <div style={{ height: '1px', backgroundColor: BORDER, marginBottom: '56px' }} />

        <Section label="Dein persönliches Kin" title="Dein Geburtstag als kosmischer Code.">
          <p>
            Das <strong style={{ color: TEXT }}>Geburtskin</strong> ist die Energie-Kombination am Tag deiner Geburt. Es bestimmt dein Lebensprogramm und startet deine persönlichen Zyklen und Lernaufgaben.
          </p>
          <p style={{ marginTop: '16px' }}>
            Der <strong style={{ color: TEXT }}>„Tag außerhalb der Zeit"</strong> ist der Tag vor deinem Geburtstag. Er prägt die Basisenergie deines kommenden Lebensjahres, steht außerhalb des normalen Flusses und lädt besonders zur Reflexion ein.
          </p>
          <p style={{ marginTop: '16px' }}>
            Jeder Tag im Kalender trägt eine eigene Kin-Energie. Dein Geburtskin und die Tagesenergie wirken ständig zusammen. Das ist die Grundlage aller Analysen in dieser App.
          </p>
        </Section>

        <div style={{ height: '1px', backgroundColor: BORDER, marginBottom: '56px' }} />

        {/* Regenerationstage Legende */}
        <Section label="Regenerationstage im Kalender" title="Universelle Ruhe- und Heilzeiten.">
          <p style={{ marginBottom: '24px' }}>
            Im Energiekalender sind bestimmte Tage als <strong style={{ color: TEXT }}>Regenerationstage</strong> markiert. Diese Tage gelten für alle Menschen gleich. Sie sind nicht personalisiert, sondern basieren auf universellen Tzolkin-Mustern. An diesen Tagen empfiehlt die Maya-Tradition bewusst Ruhe, Rückzug und Regeneration.
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
            Die <strong style={{ color: TEXT }}>Sturmwelle (〰)</strong> ist eine vollständige 13-tägige Welle im Tzolkin, die traditionell als Heilwelle gilt. Sie ist die ideale Zeit für Urlaub, tiefe Regeneration, Heilungsprozesse und bewusste Auszeiten.
          </p>
        </Section>

      </div>
    </div>
  )
}
