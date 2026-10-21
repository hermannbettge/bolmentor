import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import { supabase } from '../lib/supabase.js'

const ANALYSES = [
  { key: 'business', icon: '🏢', title: 'Business-Analyse', description: 'Dein Weg im Beruf und Unternehmertum', tcLink: '#tc-business' },
  { key: 'health', icon: '🌿', title: 'Gesundheitsanalyse', description: 'Dein Körper und seine Energiemuster', tcLink: '#tc-health' },
  { key: 'family', icon: '👨‍👩‍👧', title: 'Familienanalyse', description: 'Deine Rolle in deiner Familie', tcLink: '#tc-family' },
  { key: 'selfexpression', icon: '✨', title: 'Selbstausdruck', description: 'Deine kreative und authentische Stimme', tcLink: '#tc-selfexpression' },
  { key: 'finance', icon: '💰', title: 'Finanzanalyse', description: 'Dein Verhältnis zu Geld und Überfluss', tcLink: '#tc-finance' },
  { key: 'career', icon: '🎯', title: 'Karriere-Analyse', description: 'Dein beruflicher Weg und deine Berufung', tcLink: '#tc-career' },
  { key: 'lifephases', icon: '📅', title: 'Lebensphasen', description: 'Die wichtigsten Jahre deines Lebens', tcLink: '#tc-lifephases', hasModal: true },
  { key: 'partnership', icon: '💫', title: 'Beziehungsanalyse', description: 'Du in Beziehungen', tcLink: '#tc-partnership' },
]


export default function MeineAnalysen() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [existingTypes, setExistingTypes] = useState(new Set())
  const [checked, setChecked] = useState(false)

  const purchased = profile?.purchased_analyses || []

  useEffect(() => {
    if (!user || !profile) return
    async function checkExisting() {
      const types = [...purchased, 'partnership_compatibility']
      if (!purchased.length) { setChecked(true); return }
      const { data } = await supabase
        .from('analyses')
        .select('type')
        .eq('user_id', user.id)
        .in('type', types)
      const found = new Set((data || []).map(r => r.type))
      setExistingTypes(found)
      setChecked(true)
    }
    checkExisting()
  }, [user, profile])

  return (
    <div style={{ padding: '48px 40px', maxWidth: '800px' }}>
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
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    Nicht freigeschaltet
                  </span>
                  <a href={item.tcLink} style={{ border: '1px solid var(--color-gold-muted)', color: 'var(--color-gold)', borderRadius: '4px', padding: '6px 14px', fontSize: '0.78rem', textDecoration: 'none' }}>
                    Buchen
                  </a>
                </div>
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
              onClick={() => navigate('/analyse/partnership')}
              style={{ backgroundColor: 'var(--color-gold)', color: '#000', border: 'none', borderRadius: '4px', padding: '8px 16px', fontSize: '0.82rem', fontWeight: 500, cursor: 'pointer' }}
            >
              {!checked ? '…' : existingTypes.has('partnership_compatibility') ? 'Analyse anzeigen' : 'Analyse erstellen'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
