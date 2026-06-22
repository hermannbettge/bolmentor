export default function Datenschutz() {
  const Section = ({ title, children }) => (
    <div style={{ marginBottom: '40px' }}>
      <h2 style={{ color: 'var(--color-gold)', fontWeight: 400, fontSize: '1.1rem', marginBottom: '16px' }}>{title}</h2>
      <div style={{ color: 'var(--color-text-primary)', fontWeight: 300, lineHeight: 1.85, fontSize: '0.95rem' }}>{children}</div>
    </div>
  )

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '80px 24px' }}>
      <div style={{ fontSize: '0.75rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--color-gold-muted)', marginBottom: '16px' }}>
        Rechtliches
      </div>
      <h1 style={{ color: 'var(--color-gold)', fontWeight: 300, fontSize: '2rem', marginBottom: '48px' }}>
        Datenschutzerklärung
      </h1>

      <Section title="1. Verantwortlicher">
        <p>
          Verantwortlicher für die Datenverarbeitung auf dieser Website im Sinne der DSGVO ist:<br /><br />
          Hermann Bettge<br />
          [Straße und Hausnummer]<br />
          20000 Hamburg<br />
          E-Mail: <a href="mailto:hallo@bewusstsein-ohne-limit.de" style={{ color: 'var(--color-gold)', textDecoration: 'none' }}>hallo@bewusstsein-ohne-limit.de</a>
        </p>
      </Section>

      <Section title="2. Welche Daten wir verarbeiten">
        <p>Wir verarbeiten folgende personenbezogene Daten:</p>
        <ul style={{ paddingLeft: '20px', marginTop: '8px' }}>
          <li><strong>Vorname:</strong> Zur Personalisierung deiner Analysen</li>
          <li><strong>E-Mail-Adresse:</strong> Für die Anmeldung und Kommunikation</li>
          <li><strong>Geburtsdatum:</strong> Zur Berechnung deines Maya Kins und Erstellung personalisierter Analysen</li>
          <li><strong>Analysedaten:</strong> Die erstellten Analysen werden zur späteren Einsicht gespeichert</li>
          <li><strong>Zahlungsdaten:</strong> Werden ausschließlich durch ThriveCart verarbeitet (s.u.)</li>
        </ul>
      </Section>

      <Section title="3. Zweck der Verarbeitung">
        <p>Wir verarbeiten deine Daten zu folgenden Zwecken:</p>
        <ul style={{ paddingLeft: '20px', marginTop: '8px' }}>
          <li>Bereitstellung der Maya Kalender Analysen (Vertragserfüllung)</li>
          <li>Verwaltung deines Nutzerkontos</li>
          <li>Personalisierung der KI-generierten Analysen</li>
          <li>Kommunikation bezüglich deines Kontos und deiner Mitgliedschaft</li>
        </ul>
      </Section>

      <Section title="4. Rechtsgrundlagen">
        <p>
          Die Verarbeitung deiner Daten erfolgt auf folgenden Rechtsgrundlagen gemäß Art. 6 DSGVO:
        </p>
        <ul style={{ paddingLeft: '20px', marginTop: '8px' }}>
          <li><strong>Art. 6 Abs. 1 lit. b DSGVO:</strong> Vertragserfüllung (Bereitstellung der Analysedienste)</li>
          <li><strong>Art. 6 Abs. 1 lit. a DSGVO:</strong> Einwilligung (bei der Registrierung erteilt)</li>
          <li><strong>Art. 6 Abs. 1 lit. f DSGVO:</strong> Berechtigte Interessen (Sicherheit der Plattform)</li>
        </ul>
      </Section>

      <Section title="5. Supabase als Auftragsverarbeiter">
        <p>
          Für die Speicherung deiner Daten und Authentifizierung nutzen wir Supabase (Supabase Inc., 970 Toa Payoh North, Singapur). Die Datenhaltung erfolgt auf Servern in der Europäischen Union. Mit Supabase besteht ein Auftragsverarbeitungsvertrag gemäß Art. 28 DSGVO.
        </p>
        <p style={{ marginTop: '12px' }}>
          Weitere Informationen: <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-gold)', textDecoration: 'none' }}>supabase.com/privacy</a>
        </p>
      </Section>

      <Section title="6. Anthropic Claude API">
        <p>
          Zur Generierung personalisierter Analysen verwenden wir die Claude API von Anthropic (Anthropic PBC, 548 Market Street, San Francisco, CA 94104, USA). Dabei werden relevante Profildaten (Name, Geburtsdatum, berechnetes Kin) an die API übermittelt. Anthropic verarbeitet diese Daten ausschließlich zur Generierung der Analyse und speichert sie nicht dauerhaft.
        </p>
        <p style={{ marginTop: '12px' }}>
          Weitere Informationen: <a href="https://www.anthropic.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-gold)', textDecoration: 'none' }}>anthropic.com/privacy</a>
        </p>
      </Section>

      <Section title="7. ThriveCart (Zahlungsabwicklung)">
        <p>
          Zahlungen werden über ThriveCart verarbeitet (ThriveCart Inc.). Deine Zahlungsdaten werden ausschließlich durch ThriveCart verarbeitet und nicht an uns übermittelt. Wir erhalten lediglich eine Bestätigung des Kaufs.
        </p>
      </Section>

      <Section title="8. Cookies und lokaler Speicher">
        <p>
          Wir verwenden ausschließlich technisch notwendige Cookies und lokalen Speicher für die Authentifizierung (Session-Token). Tracking-Cookies oder Werbecookies werden nicht gesetzt.
        </p>
      </Section>

      <Section title="9. Deine Rechte als Betroffene/r">
        <p>Du hast folgende Rechte bezüglich deiner personenbezogenen Daten:</p>
        <ul style={{ paddingLeft: '20px', marginTop: '8px' }}>
          <li><strong>Auskunftsrecht</strong> (Art. 15 DSGVO): Du kannst Auskunft über deine gespeicherten Daten verlangen</li>
          <li><strong>Berichtigungsrecht</strong> (Art. 16 DSGVO): Du kannst die Berichtigung unrichtiger Daten verlangen</li>
          <li><strong>Recht auf Löschung</strong> (Art. 17 DSGVO): Du kannst die Löschung deiner Daten verlangen</li>
          <li><strong>Recht auf Einschränkung</strong> (Art. 18 DSGVO): Du kannst die Einschränkung der Verarbeitung verlangen</li>
          <li><strong>Widerspruchsrecht</strong> (Art. 21 DSGVO): Du kannst der Verarbeitung widersprechen</li>
          <li><strong>Datenübertragbarkeit</strong> (Art. 20 DSGVO): Du kannst deine Daten in einem gängigen Format erhalten</li>
        </ul>
        <p style={{ marginTop: '12px' }}>
          Zur Ausübung deiner Rechte wende dich an: <a href="mailto:hallo@bewusstsein-ohne-limit.de" style={{ color: 'var(--color-gold)', textDecoration: 'none' }}>hallo@bewusstsein-ohne-limit.de</a>
        </p>
      </Section>

      <Section title="10. Datensicherheit">
        <p>
          Wir setzen technische und organisatorische Maßnahmen ein, um deine Daten vor unbefugtem Zugriff zu schützen. Die Übertragung erfolgt verschlüsselt via HTTPS/TLS. Passwörter werden ausschließlich als nicht-umkehrbarer Hash gespeichert.
        </p>
      </Section>

      <Section title="11. Beschwerderecht">
        <p>
          Du hast das Recht, dich bei einer Datenschutzaufsichtsbehörde zu beschweren. Die zuständige Aufsichtsbehörde in Hamburg ist:
        </p>
        <p style={{ marginTop: '8px' }}>
          Hamburgischer Beauftragter für Datenschutz und Informationsfreiheit<br />
          Ludwig-Erhard-Str. 22<br />
          20459 Hamburg
        </p>
      </Section>

      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', marginTop: '40px' }}>
        Stand: Juni 2025
      </p>
    </div>
  )
}
