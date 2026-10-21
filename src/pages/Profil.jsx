import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'
import { calculateKin } from '../lib/mayanCalendar.js'
import { supabase } from '../lib/supabase.js'

const CREAM = '#F4EFE6'
const DEEP = '#1A1410'
const COPPER = '#A0522D'
const TEXT = '#2A2018'
const TEXT_MID = '#5A4E42'
const TEXT_LIGHT = '#8C7E72'
const BORDER = 'rgba(42,32,24,0.12)'

const ANALYSE_LABELS = {
  business: 'Business-Analyse', health: 'Gesundheitsanalyse', family: 'Familienanalyse',
  selfexpression: 'Selbstausdruck-Analyse', finance: 'Finanzanalyse', career: 'Karriere-Analyse',
  lifephases: 'Lebensphasen-Analyse', partnership: 'Beziehungsanalyse',
}

function Field({ label, value, onChange, type = 'text', placeholder = '', required = false }) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: TEXT_LIGHT, marginBottom: '8px' }}>
        {label}{required && <span style={{ color: COPPER }}> *</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        style={{
          width: '100%', boxSizing: 'border-box',
          backgroundColor: '#FBF8F3',
          border: `1px solid ${BORDER}`,
          borderRadius: '3px',
          padding: '11px 14px',
          color: TEXT,
          fontSize: '0.92rem',
          outline: 'none',
          fontFamily: 'Inter, sans-serif',
        }}
      />
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: '40px' }}>
      <div style={{ fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.2em', color: COPPER, marginBottom: '20px', paddingBottom: '12px', borderBottom: `1px solid ${BORDER}` }}>
        {title}
      </div>
      {children}
    </div>
  )
}

export default function Profil() {
  const { profile, updateProfile, signOut } = useAuth()

  function initBirthDate() {
    if (!profile?.birth_date) return ''
    const d = new Date(profile.birth_date)
    return `${String(d.getUTCDate()).padStart(2,'0')}.${String(d.getUTCMonth()+1).padStart(2,'0')}.${d.getUTCFullYear()}`
  }

  const [firstName, setFirstName] = useState(profile?.name || '')
  const [lastName, setLastName] = useState(profile?.last_name || '')
  const [email] = useState(profile?.email || '')
  const [address, setAddress] = useState(profile?.address || '')
  const [zip, setZip] = useState(profile?.zip || '')
  const [city, setCity] = useState(profile?.city || '')
  const [phone, setPhone] = useState(profile?.phone || '')
  const [birthDate, setBirthDate] = useState(initBirthDate)
  const [partnerFirstName, setPartnerFirstName] = useState(profile?.partner_first_name || '')
  const [partnerLastName, setPartnerLastName] = useState(profile?.partner_last_name || '')
  const [partnerBirthDate, setPartnerBirthDate] = useState(() => {
    if (!profile?.partner_birth_date) return ''
    const d = new Date(profile.partner_birth_date)
    return `${String(d.getUTCDate()).padStart(2,'0')}.${String(d.getUTCMonth()+1).padStart(2,'0')}.${d.getUTCFullYear()}`
  })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [showCancel, setShowCancel] = useState(false)
  const [recalcMsg, setRecalcMsg] = useState('')
  const [recalcing, setRecalcing] = useState(false)

  // Events state
  const [events, setEvents] = useState([])
  const [showEventForm, setShowEventForm] = useState(false)
  const [eventName, setEventName] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [eventCategory, setEventCategory] = useState('sonstiges')
  const [eventDescription, setEventDescription] = useState('')
  const [eventSaving, setEventSaving] = useState(false)
  const [eventMsg, setEventMsg] = useState('')

  const EVENT_CATEGORIES = [
    { value: 'land', label: 'Land / Nation' },
    { value: 'job', label: 'Job / Karriere' },
    { value: 'beziehung', label: 'Beziehung / Partnerschaft' },
    { value: 'unternehmen', label: 'Unternehmen / Projekt' },
    { value: 'kauf', label: 'Kauf / Besitz' },
    { value: 'sonstiges', label: 'Sonstiges' },
  ]

  useEffect(() => {
    async function loadEvents() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const { data } = await supabase.from('user_events').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false })
      setEvents(data || [])
    }
    loadEvents()
  }, [])

  async function handleSaveEvent(e) {
    e.preventDefault()
    if (!eventName || !eventDate) { setEventMsg('Name und Datum sind Pflichtfelder.'); return }
    if (events.length >= 5) { setEventMsg('Maximal 5 Ereignisse erlaubt.'); return }
    setEventSaving(true); setEventMsg('')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const isoDate = eventDate
      const { data, error } = await supabase.from('user_events').insert({
        user_id: session.user.id, name: eventName, event_date: isoDate,
        category: eventCategory, description: eventDescription || null,
      }).select().single()
      if (error) throw error
      setEvents(prev => [data, ...prev])
      setEventName(''); setEventDate(''); setEventCategory('sonstiges'); setEventDescription('')
      setShowEventForm(false)
      setEventMsg('Ereignis gespeichert.')
    } catch (err) {
      setEventMsg('Fehler: ' + err.message)
    } finally {
      setEventSaving(false)
    }
  }

  async function handleDeleteEvent(id) {
    await supabase.from('user_events').delete().eq('id', id)
    setEvents(prev => prev.filter(e => e.id !== id))
  }

  const kinData = profile?.birth_date ? (() => { try { return calculateKin(profile.birth_date) } catch { return null } })() : null

  async function handleRecalculate() {
    if (!profile?.birth_date) return
    setRecalcing(true)
    setRecalcMsg('')
    try {
      const { createClient } = await import('@supabase/supabase-js')
      const sb = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY)
      const { data: { session } } = await sb.auth.getSession()
      if (!session) throw new Error('Nicht angemeldet')
      // Delete cached Tagesenergie and Monatsanalyse so they regenerate with correct Kin
      await sb.from('analyses')
        .delete()
        .eq('user_id', session.user.id)
        .in('analysis_type', ['tagesenergie', 'monatsanalyse'])
      setRecalcMsg('Maya-Profil aktualisiert. Deine Analysen werden beim nächsten Aufruf neu erstellt.')
    } catch (err) {
      setRecalcMsg('Fehler: ' + err.message)
    } finally {
      setRecalcing(false)
    }
  }

  function formatBirthDate(val) {
    const d = val.replace(/\D/g, '')
    if (d.length <= 2) return d
    if (d.length <= 4) return `${d.slice(0,2)}.${d.slice(2)}`
    return `${d.slice(0,2)}.${d.slice(2,4)}.${d.slice(4,8)}`
  }

  async function handleSave(e) {
    e.preventDefault()
    if (!firstName || !lastName || !birthDate || !address || !zip || !city) {
      setMsg('Bitte fülle alle Pflichtfelder aus.')
      return
    }
    setSaving(true)
    setMsg('')
    try {
      const parts = birthDate.split('.')
      const isoDate = parts.length === 3
        ? `${parts[2]}-${parts[1].padStart(2,'0')}-${parts[0].padStart(2,'0')}`
        : profile.birth_date
      const partnerParts = partnerBirthDate.split('.')
      const isoPartnerDate = partnerParts.length === 3 && partnerBirthDate
        ? `${partnerParts[2]}-${partnerParts[1].padStart(2,'0')}-${partnerParts[0].padStart(2,'0')}`
        : null
      await updateProfile({
        name: firstName, last_name: lastName, birth_date: isoDate, address, zip, city, phone,
        partner_first_name: partnerFirstName || null,
        partner_last_name: partnerLastName || null,
        partner_birth_date: isoPartnerDate,
      })
      setMsg('Gespeichert.')
    } catch {
      setMsg('Fehler beim Speichern.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ backgroundColor: CREAM, minHeight: '100vh', padding: '48px 40px', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: '640px' }}>
        <div style={{ fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.2em', color: COPPER, marginBottom: '8px' }}>
          Konto
        </div>
        <h1 style={{ fontFamily: '"Playfair Display", serif', fontWeight: 400, fontSize: '2.2rem', color: TEXT, margin: '0 0 40px' }}>
          Dein Profil
        </h1>

        <form onSubmit={handleSave}>
          <Section title="Persönliche Daten">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
              <Field label="Vorname" value={firstName} onChange={setFirstName} required placeholder="Max" />
              <Field label="Nachname" value={lastName} onChange={setLastName} required placeholder="Mustermann" />
            </div>
            <Field label="Geburtsdatum" value={birthDate} onChange={v => setBirthDate(formatBirthDate(v))} required placeholder="TT.MM.JJJJ" />
            <Field label="Mobilnummer" value={phone} onChange={setPhone} placeholder="+49 170 1234567" />
          </Section>

          <Section title="Partnerdaten (für Partnerschaftsanalyse)">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
              <Field label="Vorname Partner/in" value={partnerFirstName} onChange={setPartnerFirstName} placeholder="Anna" />
              <Field label="Nachname Partner/in" value={partnerLastName} onChange={setPartnerLastName} placeholder="Musterfrau" />
            </div>
            <Field label="Geburtsdatum Partner/in" value={partnerBirthDate} onChange={v => setPartnerBirthDate(formatBirthDate(v))} placeholder="TT.MM.JJJJ" />
          </Section>

          <Section title="Adresse">
            <Field label="Straße und Hausnummer" value={address} onChange={setAddress} required placeholder="Musterstraße 1" />
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0 20px' }}>
              <Field label="PLZ" value={zip} onChange={setZip} required placeholder="12345" />
              <Field label="Ort" value={city} onChange={setCity} required placeholder="München" />
            </div>
          </Section>

          {msg && (
            <p style={{ fontSize: '0.85rem', color: msg.includes('Fehler') || msg.includes('Pflicht') ? '#c0392b' : COPPER, marginBottom: '16px' }}>
              {msg}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            style={{
              backgroundColor: DEEP, color: CREAM, border: 'none',
              borderRadius: '40px', padding: '13px 32px',
              fontWeight: 500, fontSize: '0.85rem', cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.7 : 1, marginBottom: '40px',
            }}
          >
            {saving ? 'Wird gespeichert…' : 'Profil speichern'}
          </button>
        </form>

        {/* Maya Profil */}
        <Section title="Mein Maya Profil">
          {kinData ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '20px' }}>
              {[
                { label: 'Kin-Nummer', value: `Kin ${kinData.kin}` },
                { label: 'Leitsiegel', value: `${kinData.tone} ${kinData.seal}` },
                { label: 'Galaktischer Ton', value: `${kinData.toneNumber} – ${kinData.tone}` },
                { label: 'Lebensthema', value: kinData.lifeTheme },
                { label: 'Antipode', value: kinData.antipode },
                { label: 'Wellenform', value: `Welle ${kinData.wavespell}` },
              ].map(item => (
                <div key={item.label} style={{ padding: '14px 16px', backgroundColor: '#EDE7D9', borderRadius: '3px' }}>
                  <div style={{ color: TEXT_LIGHT, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>{item.label}</div>
                  <div style={{ color: TEXT, fontSize: '0.9rem', fontWeight: 400 }}>{item.value}</div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: TEXT_LIGHT, fontSize: '0.88rem', marginBottom: '16px' }}>
              Trage dein Geburtsdatum ein und speichere das Profil, um dein Maya-Profil zu sehen.
            </p>
          )}
          <button
            onClick={handleRecalculate}
            disabled={recalcing}
            style={{
              border: `1px solid ${COPPER}`, color: COPPER, backgroundColor: 'transparent',
              borderRadius: '40px', padding: '10px 22px', fontSize: '0.82rem',
              cursor: recalcing ? 'not-allowed' : 'pointer', opacity: recalcing ? 0.6 : 1,
            }}
          >
            {recalcing ? 'Wird aktualisiert…' : 'Maya-Profil neu berechnen'}
          </button>
          {recalcMsg && (
            <p style={{ fontSize: '0.83rem', color: recalcMsg.includes('Fehler') ? '#c0392b' : COPPER, marginTop: '10px' }}>
              {recalcMsg}
            </p>
          )}
        </Section>

        {/* Meine Ereignisse */}
        <Section title="Meine Ereignisse (für Ereignis-Analysen)">
          <p style={{ color: TEXT_LIGHT, fontSize: '0.83rem', lineHeight: 1.7, marginBottom: '20px' }}>
            Analysiere alles, dem du ein Datum zuordnen kannst: ein Land, ein Job-Start, eine Beziehung, ein Kauf, ein Unternehmen. Bis zu 5 Ereignisse möglich.
          </p>

          {events.map(ev => (
            <div key={ev.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: '#EDE7D9', borderRadius: '3px', marginBottom: '8px' }}>
              <div>
                <div style={{ color: TEXT, fontSize: '0.9rem', fontWeight: 500 }}>{ev.name}</div>
                <div style={{ color: TEXT_LIGHT, fontSize: '0.75rem', marginTop: '2px' }}>
                  {EVENT_CATEGORIES.find(c => c.value === ev.category)?.label || ev.category} · {new Date(ev.event_date).toLocaleDateString('de-DE')}
                </div>
              </div>
              <button onClick={() => handleDeleteEvent(ev.id)} style={{ background: 'none', border: 'none', color: TEXT_LIGHT, cursor: 'pointer', fontSize: '0.8rem', padding: '4px 8px' }}>
                Entfernen
              </button>
            </div>
          ))}

          {events.length < 5 && !showEventForm && (
            <button onClick={() => setShowEventForm(true)} style={{ border: `1px dashed ${COPPER}`, color: COPPER, background: 'transparent', borderRadius: '3px', padding: '10px 20px', fontSize: '0.82rem', cursor: 'pointer', width: '100%', marginTop: '8px' }}>
              + Ereignis hinzufügen
            </button>
          )}

          {showEventForm && (
            <form onSubmit={handleSaveEvent} style={{ marginTop: '16px', padding: '20px', backgroundColor: '#EDE7D9', borderRadius: '3px' }}>
              <Field label="Name des Ereignisses" value={eventName} onChange={setEventName} required placeholder="z.B. Deutschland, Job bei Firma X" />
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: TEXT_LIGHT, marginBottom: '8px' }}>
                  Kategorie
                </label>
                <select value={eventCategory} onChange={e => setEventCategory(e.target.value)} style={{ width: '100%', backgroundColor: '#FBF8F3', border: `1px solid ${BORDER}`, borderRadius: '3px', padding: '11px 14px', color: TEXT, fontSize: '0.92rem', fontFamily: 'Inter, sans-serif' }}>
                  {EVENT_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: TEXT_LIGHT, marginBottom: '8px' }}>
                  Datum <span style={{ color: COPPER }}>*</span>
                </label>
                <input type="date" value={eventDate} onChange={e => setEventDate(e.target.value)} required style={{ width: '100%', boxSizing: 'border-box', backgroundColor: '#FBF8F3', border: `1px solid ${BORDER}`, borderRadius: '3px', padding: '11px 14px', color: TEXT, fontSize: '0.92rem', fontFamily: 'Inter, sans-serif' }} />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: TEXT_LIGHT, marginBottom: '8px' }}>
                  Kontext (optional)
                </label>
                <textarea value={eventDescription} onChange={e => setEventDescription(e.target.value)} placeholder="Kurze Beschreibung oder Kontext" rows={2} style={{ width: '100%', boxSizing: 'border-box', backgroundColor: '#FBF8F3', border: `1px solid ${BORDER}`, borderRadius: '3px', padding: '11px 14px', color: TEXT, fontSize: '0.92rem', fontFamily: 'Inter, sans-serif', resize: 'vertical' }} />
              </div>
              {eventMsg && <p style={{ fontSize: '0.82rem', color: eventMsg.includes('Fehler') || eventMsg.includes('Pflicht') || eventMsg.includes('Maximal') ? '#c0392b' : COPPER, marginBottom: '12px' }}>{eventMsg}</p>}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="submit" disabled={eventSaving} style={{ backgroundColor: DEEP, color: CREAM, border: 'none', borderRadius: '40px', padding: '11px 24px', fontWeight: 500, fontSize: '0.82rem', cursor: eventSaving ? 'not-allowed' : 'pointer', opacity: eventSaving ? 0.7 : 1 }}>
                  {eventSaving ? 'Wird gespeichert…' : 'Speichern'}
                </button>
                <button type="button" onClick={() => setShowEventForm(false)} style={{ border: `1px solid ${BORDER}`, color: TEXT_MID, backgroundColor: 'transparent', borderRadius: '40px', padding: '11px 20px', fontSize: '0.82rem', cursor: 'pointer' }}>
                  Abbrechen
                </button>
              </div>
            </form>
          )}
          {eventMsg && !showEventForm && <p style={{ fontSize: '0.82rem', color: COPPER, marginTop: '8px' }}>{eventMsg}</p>}
        </Section>

        {/* Mitgliedschaft */}
        <Section title="Mitgliedschaft">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: `1px solid ${BORDER}` }}>
            <span style={{ color: TEXT_MID, fontSize: '0.9rem' }}>Status</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 500, color: profile?.membership_active ? '#2d8a4e' : '#c0392b' }}>
              {profile?.membership_active ? '● Aktiv' : '● Inaktiv'}
            </span>
          </div>
          {profile?.membership_start && (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0', borderBottom: `1px solid ${BORDER}` }}>
              <span style={{ color: TEXT_MID, fontSize: '0.9rem' }}>Mitglied seit</span>
              <span style={{ color: TEXT, fontSize: '0.9rem' }}>{new Date(profile.membership_start).toLocaleDateString('de-DE')}</span>
            </div>
          )}
          {profile?.purchased_analyses?.length > 0 && (
            <div style={{ padding: '16px 0' }}>
              <div style={{ color: TEXT_LIGHT, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>Gebuchte Zusatzanalysen</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {profile.purchased_analyses.map(key => (
                  <span key={key} style={{ backgroundColor: 'rgba(160,82,45,0.1)', border: '1px solid rgba(160,82,45,0.3)', color: COPPER, padding: '4px 12px', borderRadius: '20px', fontSize: '0.78rem' }}>
                    {ANALYSE_LABELS[key] || key}
                  </span>
                ))}
              </div>
            </div>
          )}
          {profile?.membership_active && (
            <button onClick={() => setShowCancel(true)} style={{ marginTop: '16px', border: '1px solid rgba(192,57,43,0.4)', color: '#c0392b', background: 'transparent', borderRadius: '40px', padding: '10px 20px', fontSize: '0.82rem', cursor: 'pointer' }}>
              Mitgliedschaft kündigen
            </button>
          )}
        </Section>

        <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: '24px' }}>
          <button onClick={signOut} style={{ background: 'none', border: 'none', color: TEXT_LIGHT, fontSize: '0.85rem', cursor: 'pointer', padding: 0 }}>
            Abmelden
          </button>
        </div>
      </div>

      {showCancel && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(26,20,16,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '24px' }}>
          <div style={{ backgroundColor: CREAM, borderRadius: '4px', padding: '36px', maxWidth: '400px', width: '100%' }}>
            <h3 style={{ fontFamily: '"Playfair Display", serif', fontWeight: 400, fontSize: '1.4rem', color: TEXT, marginBottom: '12px' }}>Mitgliedschaft kündigen</h3>
            <p style={{ color: TEXT_MID, fontSize: '0.88rem', lineHeight: 1.75, marginBottom: '28px' }}>
              Du verlierst den Zugang zu allen Analysen am Ende des aktuellen Abrechnungszeitraums.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <a href="mailto:hallo@bewusstsein-ohne-limit.de?subject=Kündigung" style={{ flex: 1, backgroundColor: '#c0392b', color: '#fff', border: 'none', borderRadius: '40px', padding: '12px', fontWeight: 500, cursor: 'pointer', fontSize: '0.88rem', textDecoration: 'none', textAlign: 'center' }}>
                Ja, kündigen
              </a>
              <button onClick={() => setShowCancel(false)} style={{ flex: 1, border: `1px solid ${BORDER}`, color: TEXT_MID, backgroundColor: 'transparent', borderRadius: '40px', padding: '12px', cursor: 'pointer', fontSize: '0.88rem' }}>
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
