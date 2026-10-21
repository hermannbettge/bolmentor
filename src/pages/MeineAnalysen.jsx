import { useState } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'
import { calculateKin } from '../lib/mayanCalendar.js'
import AnalysisDisplay from '../components/AnalysisDisplay.jsx'
import PDFDownloadButton from '../components/PDFDownloadButton.jsx'
import { supabase } from '../lib/supabase.js'

const ANALYSES = [
  { key: 'business', icon: '🏢', title: 'Business-Analyse', description: 'Dein Weg im Beruf und Unternehmertum', tcLink: '#tc-business' },
  { key: 'health', icon: '🌿', title: 'Gesundheitsanalyse', description: 'Dein Körper und seine Energiemuster', tcLink: '#tc-health' },
  { key: 'family', icon: '👨‍👩‍👧', title: 'Familienanalyse', description: 'Deine Rolle in deiner Familie', tcLink: '#tc-family' },
  { key: 'selfexpression', icon: '✨', title: 'Selbstausdruck', description: 'Deine kreative und authentische Stimme', tcLink: '#tc-selfexpression' },
  { key: 'finance', icon: '💰', title: 'Finanzanalyse', description: 'Dein Verhältnis zu Geld und Überfluss', tcLink: '#tc-finance' },
  { key: 'career', icon: '🎯', title: 'Karriere-Analyse', description: 'Dein beruflicher Weg und deine Berufung', tcLink: '#tc-career' },
  { key: 'lifephases', icon: '📅', title: 'Lebensphasen', description: 'Die wichtigsten Jahre deines Lebens', tcLink: '#tc-lifephases', hasModal: true },
  { key: 'partnership', icon: '💫', title: 'Partnerschaftsanalyse', description: 'Du in Beziehungen', tcLink: '#tc-partnership' },
]

function LifephasesModal({ onClose, onSubmit }) {
  const [years, setYears] = useState('')
  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '24px' }}>
      <div style={{ backgroundColor: 'var(--color-bg-card)', borderRadius: '4px', padding: '32px', maxWidth: '400px', width: '100%', border: '1px solid rgba(139,110,62,0.3)' }}>
        <h3 style={{ color: 'var(--color-gold)', fontWeight: 400, fontSize: '1.2rem', marginBottom: '12px' }}>Lebensphasen-Analyse</h3>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: '20px' }}>
          Gib spezifische Jahre ein, die analysiert werden sollen (kommagetrennt, z.B. 2015, 2020, 2023):
        </p>
        <input
          type="text"
          value={years}
          onChange={e => setYears(e.target.value)}
          placeholder="z.B. 2015, 2020, 2023"
          style={{ width: '100%', backgroundColor: 'var(--color-bg-light)', border: '1px solid rgba(139,110,62,0.3)', borderRadius: '4px', padding: '10px 14px', color: 'var(--color-text-primary)', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', marginBottom: '20px' }}
        />
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => onSubmit(years.split(',').map(y => y.trim()).filter(Boolean))} style={{ flex: 1, backgroundColor: 'var(--color-gold)', color: '#000', border: 'none', borderRadius: '4px', padding: '12px', fontWeight: 500, cursor: 'pointer', fontSize: '0.9rem' }}>
            Analyse erstellen
          </button>
          <button onClick={onClose} style={{ flex: 1, border: '1px solid rgba(139,110,62,0.3)', color: 'var(--color-text-muted)', backgroundColor: 'transparent', borderRadius: '4px', padding: '12px', cursor: 'pointer', fontSize: '0.9rem' }}>
            Abbrechen
          </button>
        </div>
      </div>
    </div>
  )
}

function CompatibilityModal({ onClose, onSubmit }) {
  const [birthDate, setBirthDate] = useState('')

  function formatDate(val) {
    const digits = val.replace(/\D/g, '')
    if (digits.length <= 2) return digits
    if (digits.length <= 4) return `${digits.slice(0,2)}.${digits.slice(2)}`
    return `${digits.slice(0,2)}.${digits.slice(2,4)}.${digits.slice(4,8)}`
  }

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '24px' }}>
      <div style={{ backgroundColor: 'var(--color-bg-card)', borderRadius: '4px', padding: '32px', maxWidth: '400px', width: '100%', border: '1px solid rgba(139,110,62,0.3)' }}>
        <h3 style={{ color: 'var(--color-gold)', fontWeight: 400, fontSize: '1.2rem', marginBottom: '12px' }}>Partner-Kompatibilität</h3>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: '20px' }}>
          Gib das Geburtsdatum deines Partners / deiner Partnerin ein:
        </p>
        <input
          type="text"
          value={birthDate}
          onChange={e => setBirthDate(formatDate(e.target.value))}
          placeholder="TT.MM.JJJJ"
          maxLength={10}
          style={{ width: '100%', backgroundColor: 'var(--color-bg-light)', border: '1px solid rgba(139,110,62,0.3)', borderRadius: '4px', padding: '10px 14px', color: 'var(--color-text-primary)', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', marginBottom: '20px' }}
        />
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => onSubmit(birthDate)} style={{ flex: 1, backgroundColor: 'var(--color-gold)', color: '#000', border: 'none', borderRadius: '4px', padding: '12px', fontWeight: 500, cursor: 'pointer', fontSize: '0.9rem' }}>
            Analyse erstellen
          </button>
          <button onClick={onClose} style={{ flex: 1, border: '1px solid rgba(139,110,62,0.3)', color: 'var(--color-text-muted)', backgroundColor: 'transparent', borderRadius: '4px', padding: '12px', cursor: 'pointer', fontSize: '0.9rem' }}>
            Abbrechen
          </button>
        </div>
      </div>
    </div>
  )
}

export default function MeineAnalysen() {
  const { user, profile } = useAuth()
  const [activeAnalysis, setActiveAnalysis] = useState(null)
  const [analysisContent, setAnalysisContent] = useState({})
  const [loading, setLoading] = useState(null)
  const [error, setError] = useState('')
  const [modal, setModal] = useState(null)

  const purchased = profile?.purchased_analyses || []

  async function runAnalysis(key, extraData = null) {
    setLoading(key)
    setError('')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const body = extraData ? { extraData } : {}
      const res = await fetch(`/api/analysis/${key}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Fehler beim Erstellen der Analyse')
      }
      const data = await res.json()
      setAnalysisContent(prev => ({ ...prev, [key]: data.content }))
      setActiveAnalysis(key)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(null)
    }
  }

  function handleCreate(item) {
    if (item.key === 'lifephases') {
      setModal({ type: 'lifephases', key: item.key })
    } else if (item.key === 'compatibility') {
      setModal({ type: 'compatibility', key: item.key })
    } else {
      runAnalysis(item.key)
    }
  }

  if (activeAnalysis) {
    const item = ANALYSES.find(a => a.key === activeAnalysis)
    return (
      <div style={{ padding: '48px 40px', maxWidth: '720px' }}>
        <button onClick={() => setActiveAnalysis(null)} style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          ← Zurück zur Übersicht
        </button>
        <div style={{ fontSize: '0.75rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--color-gold-muted)', marginBottom: '12px' }}>
          {item?.icon} {item?.title}
        </div>
        <AnalysisDisplay content={analysisContent[activeAnalysis]} />
        <div style={{ display: 'flex', gap: '16px', marginTop: '32px', flexWrap: 'wrap' }}>
          <PDFDownloadButton content={analysisContent[activeAnalysis]} analysisType={activeAnalysis} userName={profile?.name || 'Analyse'} />
          <button onClick={() => handleCreate(item)} disabled={!!loading} style={{ border: '1px solid rgba(139,110,62,0.5)', color: 'var(--color-text-muted)', background: 'transparent', borderRadius: '4px', padding: '10px 24px', fontSize: '0.85rem', cursor: 'pointer' }}>
            Neu erstellen
          </button>
        </div>
      </div>
    )
  }

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

      {error && (
        <div style={{ backgroundColor: 'rgba(220,53,69,0.1)', border: '1px solid rgba(220,53,69,0.3)', borderRadius: '4px', padding: '12px', marginBottom: '24px', color: '#ff6b6b', fontSize: '0.85rem' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
        {ANALYSES.map(item => {
          const isPurchased = purchased.includes(item.key)
          const hasContent = !!analysisContent[item.key]
          const isLoading = loading === item.key

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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {hasContent && (
                    <button onClick={() => setActiveAnalysis(item.key)} style={{ backgroundColor: 'transparent', border: '1px solid var(--color-gold-muted)', color: 'var(--color-gold)', borderRadius: '4px', padding: '8px 16px', fontSize: '0.82rem', cursor: 'pointer' }}>
                      Ansehen
                    </button>
                  )}
                  <button
                    onClick={() => handleCreate(item)}
                    disabled={isLoading}
                    style={{ backgroundColor: 'var(--color-gold)', color: '#000', border: 'none', borderRadius: '4px', padding: '8px 16px', fontSize: '0.82rem', fontWeight: 500, cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.7 : 1 }}
                  >
                    {isLoading ? <span className="pulse-gold">Wird erstellt...</span> : hasContent ? 'Neu erstellen' : 'Analyse erstellen'}
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    🔒 Nicht freigeschaltet
                  </span>
                  <a href={item.tcLink} style={{ border: '1px solid var(--color-gold-muted)', color: 'var(--color-gold)', borderRadius: '4px', padding: '6px 14px', fontSize: '0.78rem', textDecoration: 'none' }}>
                    Buchen
                  </a>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {modal?.type === 'lifephases' && (
        <LifephasesModal
          onClose={() => setModal(null)}
          onSubmit={years => { setModal(null); runAnalysis('lifephases', { years }) }}
        />
      )}
      {modal?.type === 'compatibility' && (
        <CompatibilityModal
          onClose={() => setModal(null)}
          onSubmit={birthDate => { setModal(null); runAnalysis('compatibility', { birthDate }) }}
        />
      )}
    </div>
  )
}
