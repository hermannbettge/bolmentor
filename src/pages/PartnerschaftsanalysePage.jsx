import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import { supabase } from '../lib/supabase.js'
import AnalysisDisplay from '../components/AnalysisDisplay.jsx'
import PDFDownloadButton from '../components/PDFDownloadButton.jsx'

const COPPER = 'var(--accent)'
const TEXT = 'var(--text-1)'
const TEXT_LIGHT = 'var(--text-2)'

export default function PartnerschaftsanalysePage() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [error, setError] = useState('')

  const hasPurchased = profile?.is_admin || profile?.purchased_analyses?.includes('partnership')
  const hasPartnerData = !!profile?.partner_birth_date

  useEffect(() => {
    if (profile && !hasPurchased) navigate('/analysen')
  }, [profile])

  useEffect(() => {
    if (!user || !hasPartnerData) { setChecking(false); return }
    async function check() {
      try {
        const { data } = await supabase
          .from('analyses')
          .select('content, created_at')
          .eq('user_id', user.id)
          .eq('type', 'partnership_compatibility')
          .order('created_at', { ascending: false })
          .limit(1)
          .single()
        if (data) setAnalysis(data.content)
      } catch {}
      finally { setChecking(false) }
    }
    check()
  }, [user])

  async function handleCreate() {
    setLoading(true); setError('')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/analysis/partnership/partner-compatibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
      })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error) }
      const data = await res.json()
      setAnalysis(data.content)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  if (checking) return (
    <div style={{ backgroundColor: 'var(--bg-deep)', minHeight: '100vh', padding: '48px 40px' }}>
      <div style={{ color: TEXT_LIGHT }}>Wird geladen…</div>
    </div>
  )

  return (
    <div style={{ backgroundColor: 'var(--bg-deep)', minHeight: '100vh', padding: '48px 40px', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: '720px' }}>
        <div style={{ fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.2em', color: COPPER, marginBottom: '8px' }}>
          Paaranalyse
        </div>
        <h1 style={{ fontFamily: '"Playfair Display", serif', fontWeight: 400, fontSize: '2.2rem', color: TEXT, margin: '0 0 8px' }}>
          Partnerschaftsanalyse
        </h1>
        <p style={{ color: TEXT_LIGHT, fontSize: '0.88rem', marginBottom: '32px' }}>
          Du und {profile?.partner_first_name || 'dein Partner'} {profile?.partner_last_name || ''} als Paar
        </p>

        {error && (
          <div style={{ backgroundColor: 'rgba(192,57,43,0.08)', border: '1px solid rgba(192,57,43,0.25)', borderRadius: '3px', padding: '12px 16px', marginBottom: '20px', color: '#c0392b', fontSize: '0.88rem' }}>
            {error}
          </div>
        )}

        {!hasPartnerData ? (
          <p style={{ color: TEXT_LIGHT, fontSize: '0.9rem', lineHeight: 1.7 }}>
            Trage die Daten deines Partners / deiner Partnerin in deinem{' '}
            <a href="/profil" style={{ color: COPPER }}>Profil</a>{' '}
            ein, um die Partnerschaftsanalyse zu erstellen.
          </p>
        ) : analysis ? (
          <>
            <AnalysisDisplay content={analysis} />
            <div style={{ display: 'flex', gap: '16px', marginTop: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
              <PDFDownloadButton content={analysis} analysisType="partnership_compatibility" userName={profile?.name || ''} date={new Date().toLocaleDateString('de-DE')} />
              <button
                onClick={() => { setAnalysis(null) }}
                style={{ border: '1px solid var(--border)', color: TEXT_LIGHT, background: 'transparent', borderRadius: '40px', padding: '10px 24px', fontSize: '0.82rem', cursor: 'pointer' }}
              >
                Neu erstellen
              </button>
            </div>
          </>
        ) : (
          <>
            <p style={{ color: TEXT_LIGHT, fontSize: '0.9rem', marginBottom: '8px' }}>
              Partner/in: <strong style={{ color: TEXT }}>{profile?.partner_first_name} {profile?.partner_last_name}</strong>
              {profile?.partner_birth_date && ` · Geb. ${new Date(profile.partner_birth_date).toLocaleDateString('de-DE')}`}
            </p>
            <p style={{ color: TEXT_LIGHT, fontSize: '0.88rem', marginBottom: '28px', lineHeight: 1.7 }}>
              Noch keine Analyse vorhanden. Erstelle jetzt eine tiefe Maya-Paaranalyse.
            </p>
            <button
              onClick={handleCreate}
              disabled={loading}
              style={{ backgroundColor: COPPER, color: 'var(--bg-deep)', border: 'none', borderRadius: '40px', padding: '14px 36px', fontWeight: 500, fontSize: '0.88rem', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Analyse wird erstellt… (ca. 45 Sek.)' : 'Partnerschaftsanalyse erstellen'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
