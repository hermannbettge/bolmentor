import { useState } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'
import { calculateKin } from '../lib/mayanCalendar.js'

const inputStyle = {
  width: '100%',
  backgroundColor: 'var(--color-bg-light)',
  border: '1px solid rgba(139,110,62,0.3)',
  borderRadius: '4px',
  padding: '10px 14px',
  color: 'var(--color-text-primary)',
  fontSize: '0.9rem',
  outline: 'none',
  boxSizing: 'border-box',
}

const ANALYSE_LABELS = {
  business: 'Business-Analyse',
  health: 'Gesundheitsanalyse',
  family: 'Familienanalyse',
  selfexpression: 'Selbstausdruck-Analyse',
  finance: 'Finanzanalyse',
  career: 'Karriere-Analyse',
  lifephases: 'Lebensphasen-Analyse',
  partnership: 'Partnerschaftsanalyse',
  compatibility: 'Partner-Kompatibilität',
}

export default function Profil() {
  const { profile, updateProfile, signOut } = useAuth()
  const [name, setName] = useState(profile?.name || '')
  const [birthDate, setBirthDate] = useState(profile?.birth_date
    ? (() => {
        const d = new Date(profile.birth_date)
        return `${String(d.getUTCDate()).padStart(2,'0')}.${String(d.getUTCMonth()+1).padStart(2,'0')}.${d.getUTCFullYear()}`
      })()
    : '')
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [showCancelModal, setShowCancelModal] = useState(false)

  const kinData = profile?.birth_date ? (() => {
    try { return calculateKin(profile.birth_date) } catch { return null }
  })() : null

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setSaveMsg('')
    try {
      const parts = birthDate.split('.')
      const isoDate = parts.length === 3
        ? `${parts[2]}-${parts[1].padStart(2,'0')}-${parts[0].padStart(2,'0')}`
        : profile.birth_date
      await updateProfile({ name, birth_date: isoDate })
      setSaveMsg('Profil erfolgreich gespeichert.')
    } catch {
      setSaveMsg('Fehler beim Speichern. Bitte versuche es erneut.')
    } finally {
      setSaving(false)
    }
  }

  function formatBirthDate(val) {
    const digits = val.replace(/\D/g, '')
    if (digits.length <= 2) return digits
    if (digits.length <= 4) return `${digits.slice(0,2)}.${digits.slice(2)}`
    return `${digits.slice(0,2)}.${digits.slice(2,4)}.${digits.slice(4,8)}`
  }

  return (
    <div style={{ padding: '48px 40px', maxWidth: '640px' }}>
      <div style={{ fontSize: '0.75rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--color-gold-muted)', marginBottom: '12px' }}>
        Konto
      </div>
      <h1 style={{ color: 'var(--color-gold)', fontWeight: 300, fontSize: '2rem', marginBottom: '40px' }}>
        Dein Profil
      </h1>

      {/* Meine Daten */}
      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ color: 'var(--color-text-primary)', fontWeight: 400, fontSize: '1.1rem', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid rgba(139,110,62,0.2)' }}>
          Meine Daten
        </h2>
        <form onSubmit={handleSave}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', color: 'var(--color-text-muted)', fontSize: '0.8rem', marginBottom: '6px' }}>Vorname</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} style={inputStyle} />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', color: 'var(--color-text-muted)', fontSize: '0.8rem', marginBottom: '6px' }}>Geburtsdatum</label>
            <input type="text" value={birthDate} onChange={e => setBirthDate(formatBirthDate(e.target.value))} maxLength={10} style={inputStyle} placeholder="TT.MM.JJJJ" />
          </div>
          {saveMsg && (
            <p style={{ color: saveMsg.includes('Fehler') ? '#ff6b6b' : 'var(--color-gold)', fontSize: '0.85rem', marginBottom: '12px' }}>
              {saveMsg}
            </p>
          )}
          <button type="submit" disabled={saving} style={{ backgroundColor: 'var(--color-gold)', color: '#000', border: 'none', borderRadius: '4px', padding: '10px 24px', fontWeight: 500, fontSize: '0.9rem', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Wird gespeichert...' : 'Speichern'}
          </button>
        </form>
      </section>

      {/* Maya Profil */}
      {kinData && (
        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ color: 'var(--color-text-primary)', fontWeight: 400, fontSize: '1.1rem', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid rgba(139,110,62,0.2)' }}>
            Mein Maya Profil
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {[
              { label: 'Kin-Nummer', value: `Kin ${kinData.kin}` },
              { label: 'Leitsiegel', value: `${kinData.tone} ${kinData.seal}` },
              { label: 'Analoges Siegel', value: kinData.analog },
              { label: 'Antipodisches Siegel', value: kinData.antipode },
              { label: 'Okkultes Siegel', value: kinData.occult },
              { label: 'Führungssiegel', value: kinData.guide },
              { label: 'Lebensthema', value: kinData.lifeTheme },
              { label: 'Galaktischer Ton', value: `${kinData.toneNumber} – ${kinData.tone}` },
            ].map(item => (
              <div key={item.label} style={{ padding: '12px 16px', backgroundColor: 'var(--color-bg-card)', borderRadius: '4px' }}>
                <div style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', marginBottom: '4px' }}>{item.label}</div>
                <div style={{ color: 'var(--color-gold)', fontSize: '0.9rem', fontWeight: 400 }}>{item.value}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Mitgliedschaft */}
      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ color: 'var(--color-text-primary)', fontWeight: 400, fontSize: '1.1rem', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid rgba(139,110,62,0.2)' }}>
          Mitgliedschaft
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Status</span>
            <span style={{ color: profile?.membership_active ? '#4ade80' : '#ff6b6b', fontSize: '0.85rem', fontWeight: 500 }}>
              {profile?.membership_active ? '● Aktiv' : '● Inaktiv'}
            </span>
          </div>
          {profile?.membership_start && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Mitglied seit</span>
              <span style={{ color: 'var(--color-text-primary)', fontSize: '0.85rem' }}>
                {new Date(profile.membership_start).toLocaleDateString('de-DE')}
              </span>
            </div>
          )}
          {profile?.purchased_analyses?.length > 0 && (
            <div>
              <div style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: '8px' }}>Gebuchte Zusatzanalysen</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {profile.purchased_analyses.map(key => (
                  <span key={key} style={{ backgroundColor: 'rgba(184,151,90,0.15)', border: '1px solid rgba(184,151,90,0.3)', color: 'var(--color-gold)', padding: '4px 10px', borderRadius: '2px', fontSize: '0.78rem' }}>
                    {ANALYSE_LABELS[key] || key}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {profile?.membership_active && (
          <button
            onClick={() => setShowCancelModal(true)}
            style={{ border: '1px solid rgba(220,53,69,0.5)', color: '#ff6b6b', background: 'transparent', borderRadius: '4px', padding: '10px 20px', fontSize: '0.85rem', cursor: 'pointer' }}
          >
            Mitgliedschaft kündigen
          </button>
        )}
      </section>

      {/* Kündigen Modal */}
      {showCancelModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '24px' }}>
          <div style={{ backgroundColor: 'var(--color-bg-card)', borderRadius: '4px', padding: '32px', maxWidth: '400px', width: '100%', border: '1px solid rgba(220,53,69,0.3)' }}>
            <h3 style={{ color: 'var(--color-text-primary)', fontWeight: 400, fontSize: '1.1rem', marginBottom: '12px' }}>Mitgliedschaft kündigen</h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', lineHeight: 1.7, marginBottom: '24px' }}>
              Bist du sicher? Du verlierst den Zugang zu allen Analysen am Ende des aktuellen Abrechnungszeitraums.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <a href="mailto:hallo@bewusstsein-ohne-limit.de?subject=Kündigung Mitgliedschaft" style={{ flex: 1, backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', padding: '12px', fontWeight: 500, cursor: 'pointer', fontSize: '0.9rem', textDecoration: 'none', textAlign: 'center' }}>
                Ja, kündigen
              </a>
              <button onClick={() => setShowCancelModal(false)} style={{ flex: 1, border: '1px solid rgba(139,110,62,0.3)', color: 'var(--color-text-muted)', backgroundColor: 'transparent', borderRadius: '4px', padding: '12px', cursor: 'pointer', fontSize: '0.9rem' }}>
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
