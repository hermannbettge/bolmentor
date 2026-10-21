import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import { supabase } from '../lib/supabase.js'
import AnalysisDisplay from '../components/AnalysisDisplay.jsx'
import PDFDownloadButton from '../components/PDFDownloadButton.jsx'

const COPPER = 'var(--accent)'
const TEXT = 'var(--text-1)'
const TEXT_MID = 'var(--text-2)'
const TEXT_LIGHT = 'var(--text-2)'

const LABELS = {
  business: 'Business-Analyse', health: 'Gesundheitsanalyse', family: 'Familienanalyse',
  selfexpression: 'Selbstausdruck-Analyse', finance: 'Finanzanalyse', career: 'Karriere-Analyse',
  lifephases: 'Lebensphasen-Analyse', partnership: 'Beziehungsanalyse',
}

export default function AnalysePage() {
  const { type } = useParams()
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [error, setError] = useState('')
  const [yearlyAnalysis, setYearlyAnalysis] = useState(null)
  const [yearlyLoading, setYearlyLoading] = useState(false)
  const [yearlyChecking, setYearlyChecking] = useState(true)
  // Use next year in Q4 (Oct–Dec) so analysis is forward-looking
  const now = new Date()
  const currentYear = now.getMonth() >= 9 ? now.getFullYear() + 1 : now.getFullYear()
  const hasYearly = true

  const label = LABELS[type] || type
  const hasPurchased = profile?.is_admin || profile?.purchased_analyses?.includes(type)

  useEffect(() => {
    // Only redirect when profile is fully loaded (purchased_analyses is not undefined)
    if (profile && profile.purchased_analyses !== undefined && !hasPurchased) navigate('/analysen')
  }, [profile])

  // Reset when switching between analysis types
  useEffect(() => {
    setAnalysis(null)
    setYearlyAnalysis(null)
    setError('')
    setChecking(true)
    setYearlyChecking(true)
  }, [type])

  useEffect(() => {
    if (checking) checkExisting()
  }, [user, type, checking])

  useEffect(() => {
    if (yearlyChecking && hasYearly) checkYearly()
  }, [user, type, yearlyChecking])

  async function checkExisting() {
    if (!user) return
    try {
      const { data } = await supabase
        .from('analyses')
        .select('content, created_at')
        .eq('user_id', user.id)
        .eq('type', type)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      if (data) setAnalysis(data.content)
    } catch {}
    finally { setChecking(false) }
  }

  async function checkYearly() {
    if (!user) return
    try {
      const { data } = await supabase
        .from('analyses')
        .select('content, created_at')
        .eq('user_id', user.id)
        .eq('type', `${type}_yearly_${currentYear}`)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      if (data) setYearlyAnalysis(data.content)
    } catch {}
    finally { setYearlyChecking(false) }
  }

  async function createYearly() {
    setYearlyLoading(true)
    setError('')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch(`/api/analysis/${type}/yearly`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ year: currentYear }),
      })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error) }
      const data = await res.json()
      setYearlyAnalysis(data.content)
    } catch (e) {
      setError(e.message)
    } finally {
      setYearlyLoading(false)
    }
  }

  async function createAnalysis() {
    setLoading(true)
    setError('')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const body = {}
      const res = await fetch(`/api/analysis/${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify(body),
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
          Analyse
        </div>
        <h1 style={{ fontFamily: '"Playfair Display", serif', fontWeight: 400, fontSize: '2.2rem', color: TEXT, margin: '0 0 32px' }}>
          {label}
        </h1>

        {error && (
          <div style={{ backgroundColor: 'rgba(192,57,43,0.08)', border: '1px solid rgba(192,57,43,0.25)', borderRadius: '3px', padding: '12px 16px', marginBottom: '20px', color: '#c0392b', fontSize: '0.88rem' }}>
            {error}
          </div>
        )}

        {/* Yearly Analysis Section */}
        {hasYearly && !checking && (
          <div style={{ marginTop: '48px', paddingTop: '32px', borderTop: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.2em', color: COPPER, marginBottom: '8px' }}>
              Jahresanalyse
            </div>
            <h2 style={{ fontFamily: '"Playfair Display", serif', fontWeight: 400, fontSize: '1.6rem', color: TEXT, margin: '0 0 24px' }}>
              {label} {currentYear} — Monat für Monat
            </h2>

            {yearlyChecking ? (
              <div style={{ color: TEXT_LIGHT, fontSize: '0.88rem' }}>Wird geladen…</div>
            ) : yearlyAnalysis ? (
              <>
                <AnalysisDisplay content={yearlyAnalysis} />
                <div style={{ display: 'flex', gap: '16px', marginTop: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <PDFDownloadButton content={yearlyAnalysis} analysisType={`${type}_yearly`} userName={profile?.name || ''} date={new Date().toLocaleDateString('de-DE')} />
                  <button
                    onClick={() => setYearlyAnalysis(null)}
                    style={{ border: '1px solid var(--border)', color: TEXT_MID, background: 'transparent', borderRadius: '40px', padding: '10px 24px', fontSize: '0.82rem', cursor: 'pointer' }}
                  >
                    Neu erstellen
                  </button>
                </div>
              </>
            ) : (
              <div>
                <p style={{ color: TEXT_LIGHT, fontSize: '0.9rem', marginBottom: '20px', lineHeight: 1.7 }}>
                  Erhalte eine detaillierte Monat-für-Monat-Analyse deiner {label.toLowerCase()} für {currentYear}. Erfahre, welche Monate besonders kraftvoll sind, wo du innehalten solltest und welche Themen dich das ganze Jahr begleiten.
                </p>
                <button
                  onClick={createYearly}
                  disabled={yearlyLoading}
                  style={{ backgroundColor: 'transparent', border: '1px solid var(--accent)', color: COPPER, borderRadius: '40px', padding: '13px 32px', fontWeight: 500, fontSize: '0.85rem', cursor: yearlyLoading ? 'not-allowed' : 'pointer', opacity: yearlyLoading ? 0.7 : 1 }}
                >
                  {yearlyLoading ? `Jahresanalyse ${currentYear} wird erstellt…` : `Jahresanalyse ${currentYear} erstellen`}
                </button>
              </div>
            )}
          </div>
        )}

        {!analysis ? (
          <div>
            <button
              onClick={createAnalysis}
              disabled={loading}
              style={{ backgroundColor: 'var(--accent)', color: 'var(--bg-deep)', border: 'none', borderRadius: '40px', padding: '13px 32px', fontWeight: 500, fontSize: '0.85rem', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? `${label} wird erstellt…` : `${label} jetzt erstellen`}
            </button>
          </div>
        ) : (
          <>
            <AnalysisDisplay content={analysis} />
            <div style={{ display: 'flex', gap: '16px', marginTop: '32px', flexWrap: 'wrap', alignItems: 'center' }}>
              <PDFDownloadButton content={analysis} analysisType={type} userName={profile?.name || ''} date={new Date().toLocaleDateString('de-DE')} />
              <button
                onClick={() => { setAnalysis(null) }}
                style={{ border: '1px solid var(--border)', color: TEXT_MID, background: 'transparent', borderRadius: '40px', padding: '10px 24px', fontSize: '0.82rem', cursor: 'pointer' }}
              >
                Neu erstellen
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
