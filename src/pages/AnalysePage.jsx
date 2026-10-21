import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import { supabase } from '../lib/supabase.js'
import AnalysisDisplay from '../components/AnalysisDisplay.jsx'
import PDFDownloadButton from '../components/PDFDownloadButton.jsx'

const CREAM = '#F4EFE6'
const COPPER = '#A0522D'
const TEXT = '#2A2018'
const TEXT_MID = '#5A4E42'
const TEXT_LIGHT = '#8C7E72'

const LABELS = {
  business: 'Business-Analyse', health: 'Gesundheitsanalyse', family: 'Familienanalyse',
  selfexpression: 'Selbstausdruck-Analyse', finance: 'Finanzanalyse', career: 'Karriere-Analyse',
  lifephases: 'Lebensphasen-Analyse', partnership: 'Partnerschaftsanalyse', compatibility: 'Partner-Kompatibilität',
}

export default function AnalysePage() {
  const { type } = useParams()
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [error, setError] = useState('')
  const [extraInput, setExtraInput] = useState('')

  const label = LABELS[type] || type
  const hasPurchased = profile?.purchased_analyses?.includes(type)

  useEffect(() => {
    if (profile && !hasPurchased) navigate('/analysen')
  }, [profile])

  useEffect(() => {
    checkExisting()
  }, [user, type])

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

  async function createAnalysis() {
    setLoading(true)
    setError('')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const body = type === 'compatibility' ? { extraData: { birthDate: extraInput } } : {}
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
    <div style={{ backgroundColor: CREAM, minHeight: '100vh', padding: '48px 40px' }}>
      <div style={{ color: TEXT_LIGHT }}>Wird geladen…</div>
    </div>
  )

  return (
    <div style={{ backgroundColor: CREAM, minHeight: '100vh', padding: '48px 40px', fontFamily: 'Inter, sans-serif' }}>
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

        {!analysis ? (
          <div>
            {type === 'compatibility' && (
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: TEXT_LIGHT, marginBottom: '8px' }}>
                  Geburtsdatum deines Partners (TT.MM.JJJJ)
                </label>
                <input
                  type="text"
                  value={extraInput}
                  onChange={e => setExtraInput(e.target.value)}
                  placeholder="26.07.1990"
                  maxLength={10}
                  style={{ backgroundColor: '#FBF8F3', border: '1px solid rgba(42,32,24,0.12)', borderRadius: '3px', padding: '11px 14px', color: TEXT, fontSize: '0.92rem', width: '200px', outline: 'none' }}
                />
              </div>
            )}
            <button
              onClick={createAnalysis}
              disabled={loading || (type === 'compatibility' && !extraInput)}
              style={{ backgroundColor: '#1A1410', color: CREAM, border: 'none', borderRadius: '40px', padding: '13px 32px', fontWeight: 500, fontSize: '0.85rem', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? `${label} wird erstellt…` : `${label} jetzt erstellen`}
            </button>
          </div>
        ) : (
          <>
            <AnalysisDisplay content={analysis} />
            <div style={{ display: 'flex', gap: '12px', marginTop: '32px', flexWrap: 'wrap' }}>
              <PDFDownloadButton content={analysis} analysisType={type} userName={profile?.name || ''} date={new Date().toLocaleDateString('de-DE')} />
              <button
                onClick={() => { setAnalysis(null) }}
                style={{ border: '1px solid rgba(42,32,24,0.2)', color: TEXT_MID, background: 'transparent', borderRadius: '40px', padding: '10px 24px', fontSize: '0.82rem', cursor: 'pointer' }}
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
