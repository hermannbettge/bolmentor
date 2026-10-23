import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import { supabase } from '../lib/supabase.js'

const CATEGORY_ICONS = {
  land: '🌍', job: '💼', beziehung: '💑', unternehmen: '🏢', kauf: '🏠', sonstiges: '✦',
}
const CATEGORY_LABELS = {
  land: 'Land / Nation', job: 'Job / Karriere', beziehung: 'Beziehung / Partnerschaft',
  unternehmen: 'Unternehmen / Projekt', kauf: 'Kauf / Besitz', sonstiges: 'Ereignis',
}

const ANALYSES = [
  { key: 'business', icon: '🏢', title: 'Business-Analyse', description: 'Dein Weg im Beruf und Unternehmertum' },
  { key: 'health', icon: '🌿', title: 'Gesundheitsanalyse', description: 'Dein Körper und seine Energiemuster' },
  { key: 'family', icon: '👨‍👩‍👧', title: 'Familienanalyse', description: 'Deine Rolle in deiner Familie' },
  { key: 'selfexpression', icon: '✨', title: 'Selbstausdruck', description: 'Deine kreative und authentische Stimme' },
  { key: 'finance', icon: '💰', title: 'Finanzanalyse', description: 'Dein Verhältnis zu Geld und Überfluss' },
  { key: 'career', icon: '🎯', title: 'Karriere-Analyse', description: 'Dein beruflicher Weg und deine Berufung' },
  { key: 'lifephases', icon: '📅', title: 'Lebensphasen', description: 'Die wichtigsten Jahre deines Lebens' },
  { key: 'relationship', icon: '❤️', title: 'Beziehungsmuster', description: 'Deine eigenen Bindungsstile und Beziehungsmuster' },
]


export default function MeineAnalysen() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [existingTypes, setExistingTypes] = useState(new Set())
  const [checked, setChecked] = useState(false)
  const [userEvents, setUserEvents] = useState([])
  const [eventAnalyses, setEventAnalyses] = useState(new Set())

  const purchased = profile?.purchased_analyses || []

  useEffect(() => {
    if (!user || !profile) return
    async function checkExisting() {
      const types = [...purchased, 'partnership_compatibility']
      const analysisCheck = types.length
        ? supabase.from('analyses').select('type').eq('user_id', user.id).in('type', types)
        : Promise.resolve({ data: [] })

      const eventsCheck = supabase.from('user_events').select('*').eq('user_id', user.id).order('created_at', { ascending: false })

      const [{ data: aData }, { data: evData }] = await Promise.all([analysisCheck, eventsCheck])
      setExistingTypes(new Set((aData || []).map(r => r.type)))
      setUserEvents(evData || [])

      if (evData?.length) {
        const eventTypes = evData.map(e => `event_${e.id}`)
        const { data: evAnalyses } = await supabase.from('analyses').select('type').eq('user_id', user.id).in('type', eventTypes)
        setEventAnalyses(new Set((evAnalyses || []).map(r => r.type)))
      }
      setChecked(true)
    }
    checkExisting()
  }, [user, profile])

  return (
    <div className="app-page">
      <div style={{ fontSize: '0.75rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--color-gold-muted)', marginBottom: '12px' }}>
        Zusatzanalysen
      </div>
      <h1 style={{ color: 'var(--color-gold)', fontWeight: 300, fontSize: '2rem', marginBottom: '8px' }}>
        Deine Analysen
      </h1>
      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '40px' }}>
        Tauche tiefer in spezifische Lebensbereiche ein.
      </p>

<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
        {ANALYSES.map(item => {
          const isPurchased = profile?.is_admin || purchased.includes(item.key)
          const hasAnalysis = existingTypes.has(item.key)

          return (
            <div key={item.key} style={{
              backgroundColor: 'var(--color-bg-card)',
              border: '1px solid rgba(139,110,62,0.2)',
              borderRadius: '4px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
            }}>
              <div style={{ fontSize: '1.8rem', marginBottom: '12px' }}>{item.icon}</div>
              <h3 style={{ color: 'var(--color-text-primary)', fontWeight: 400, fontSize: '0.95rem', marginBottom: '6px' }}>
                {item.title}
              </h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', lineHeight: 1.6, marginBottom: '16px', flex: 1 }}>
                {item.description}
              </p>

              {isPurchased ? (
                <button
                  onClick={() => navigate(`/analyse/${item.key}`)}
                  style={{ backgroundColor: 'var(--color-gold)', color: '#000', border: 'none', borderRadius: '4px', padding: '8px 16px', fontSize: '0.82rem', fontWeight: 500, cursor: 'pointer' }}
                >
                  {!checked ? '…' : hasAnalysis ? 'Analyse anzeigen' : 'Analyse erstellen'}
                </button>
              ) : (
                <button
                  onClick={() => navigate(`/checkout?product=${item.key}`)}
                  style={{ border: '1px solid rgba(139,110,62,0.5)', color: 'var(--color-gold)', background: 'transparent', borderRadius: '4px', padding: '8px 16px', fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
                >
                  Jetzt freischalten →
                </button>
              )}
            </div>
          )
        })}

        {/* Partner compatibility card — only when partnership is purchased AND partner birth date is set */}
        {(profile?.is_admin || purchased.includes('partnership')) && profile?.partner_birth_date && (
          <div style={{
            backgroundColor: 'var(--color-bg-card)',
            border: '1px solid rgba(139,110,62,0.2)',
            borderRadius: '4px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <div style={{ fontSize: '1.8rem', marginBottom: '12px' }}>💑</div>
            <h3 style={{ color: 'var(--color-text-primary)', fontWeight: 400, fontSize: '0.95rem', marginBottom: '6px' }}>
              Partnerschaftsanalyse
            </h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', lineHeight: 1.6, marginBottom: '16px', flex: 1 }}>
              Du und {profile.partner_first_name || 'dein Partner'} als Paar
            </p>
            <button
              onClick={() => navigate('/analyse/partnerschaft')}
              style={{ backgroundColor: 'var(--color-gold)', color: '#000', border: 'none', borderRadius: '4px', padding: '8px 16px', fontSize: '0.82rem', fontWeight: 500, cursor: 'pointer' }}
            >
              {!checked ? '…' : existingTypes.has('partnership_compatibility') ? 'Analyse anzeigen' : 'Analyse erstellen'}
            </button>
          </div>
        )}
        {/* Event analysis cards */}
        {userEvents.map(ev => (
          <div key={ev.id} style={{
            backgroundColor: 'var(--color-bg-card)',
            border: '1px solid rgba(139,110,62,0.2)',
            borderRadius: '4px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <div style={{ fontSize: '1.8rem', marginBottom: '12px' }}>{CATEGORY_ICONS[ev.category] || '✦'}</div>
            <div style={{ color: 'var(--color-text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>
              {CATEGORY_LABELS[ev.category] || 'Ereignis'}
            </div>
            <h3 style={{ color: 'var(--color-text-primary)', fontWeight: 400, fontSize: '0.95rem', marginBottom: '4px' }}>
              {ev.name}
            </h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem', lineHeight: 1.5, marginBottom: '16px', flex: 1 }}>
              {new Date(ev.event_date).toLocaleDateString('de-DE')}
              {ev.description && ` · ${ev.description}`}
            </p>
            <button
              onClick={() => navigate(`/analyse/event/${ev.id}`)}
              style={{ backgroundColor: 'var(--color-gold)', color: '#000', border: 'none', borderRadius: '4px', padding: '8px 16px', fontSize: '0.82rem', fontWeight: 500, cursor: 'pointer' }}
            >
              {!checked ? '…' : eventAnalyses.has(`event_${ev.id}`) ? 'Analyse anzeigen' : 'Analyse erstellen'}
            </button>
          </div>
        ))}

        {/* Add event prompt if no events yet */}
        {userEvents.length === 0 && checked && (
          <div style={{
            backgroundColor: 'var(--color-bg-card)',
            border: '1px dashed rgba(139,110,62,0.3)',
            borderRadius: '4px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor: 'pointer',
          }} onClick={() => navigate('/profil')}>
            <div style={{ fontSize: '1.8rem' }}>✦</div>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.82rem', textAlign: 'center', lineHeight: 1.6 }}>
              Ereignis-Analyse<br />
              <span style={{ fontSize: '0.75rem' }}>Ereignisse im Profil hinzufügen</span>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
