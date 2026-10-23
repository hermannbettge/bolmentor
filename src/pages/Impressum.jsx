export default function Impressum() {
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '80px 24px' }}>
      <div style={{ fontSize: '0.75rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--color-gold-muted)', marginBottom: '16px' }}>
        Rechtliches
      </div>
      <h1 style={{ color: 'var(--color-gold)', fontWeight: 300, fontSize: '2rem', marginBottom: '48px' }}>
        Impressum
      </h1>

      <div style={{ color: 'var(--color-text-primary)', fontWeight: 300, lineHeight: 2, fontSize: '0.95rem' }}>
        <h2 style={{ color: 'var(--color-gold)', fontWeight: 400, fontSize: '1.1rem', marginBottom: '16px' }}>Angaben gemäß § 5 TMG</h2>

        <p>
          Hermann Bettge<br />
          Bewusstsein.ohne.Limit<br />
          Poßmoorweg 14B<br />
          22301 Hamburg
        </p>

        <h2 style={{ color: 'var(--color-gold)', fontWeight: 400, fontSize: '1.1rem', margin: '32px 0 16px' }}>Kontakt</h2>
        <p>
          Telefon: 01728572121<br />
          E-Mail: <a href="mailto:support@bewusstsein-ohne-limit.de" style={{ color: 'var(--color-gold)', textDecoration: 'none' }}>support@bewusstsein-ohne-limit.de</a>
        </p>

        <h2 style={{ color: 'var(--color-gold)', fontWeight: 400, fontSize: '1.1rem', margin: '32px 0 16px' }}>Wirtschaftsidentifikationsnummer</h2>
        <p>DE238099705</p>

        <h2 style={{ color: 'var(--color-gold)', fontWeight: 400, fontSize: '1.1rem', margin: '32px 0 16px' }}>
          Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV
        </h2>
        <p>
          Hermann Bettge<br />
          Poßmoorweg 14B<br />
          22301 Hamburg
        </p>

        <h2 style={{ color: 'var(--color-gold)', fontWeight: 400, fontSize: '1.1rem', margin: '32px 0 16px' }}>Verbraucherstreitbeilegung</h2>
        <p>
          Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
        </p>

        <h2 style={{ color: 'var(--color-gold)', fontWeight: 400, fontSize: '1.1rem', margin: '32px 0 16px' }}>Haftungsausschluss</h2>
        <p>
          Die Inhalte dieser Website wurden mit größtmöglicher Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen. Die Maya Kalender Analysen dienen der persönlichen Reflexion und ersetzen keine professionelle Beratung medizinischer, psychologischer oder rechtlicher Art.
        </p>
      </div>
    </div>
  )
}
