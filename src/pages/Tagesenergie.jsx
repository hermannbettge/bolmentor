import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'
import { calculateKin, calculateTodayKin, getGermanDate } from '../lib/mayanCalendar.js'
import AnalysisDisplay from '../components/AnalysisDisplay.jsx'
import PDFDownloadButton from '../components/PDFDownloadButton.jsx'
import { supabase } from '../lib/supabase.js'

export default function Tagesenergie() {
  const { user, profile } = useAuth()
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [checkingExisting, setCheckingExisting] = useState(true)

  const today = getGermanDate()
  const todayKin = calculateTodayKin()
  const birthKin = profile?.birth_date ? calculateKin(profile.birth_date) : null

  useEffect(() => {
    checkExistingAnalysis()
  }, [user])

  async function checkExistingAnalysis() {
    if (!user) return
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/analysis/daily', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      const data = await res.json()
      if (data.content) setAnalysis(data.content)
    } catch {
      // No existing analysis
    } finally {
      setCheckingExisting(false)
    }
  }

  async function createAnalysis() {
    setLoading(true)
    setError('')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/analysis/daily', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Fehler beim Erstellen der Analyse')
      }
      const data = await res.json()
      setAnalysis(data.content)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (checkingExisting) {
    return (
      <div style={{ padding: '48px 40px' }}>
        <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }} className="pulse-gold">Wird geladen...</div>
      </div>
    )
  }

  return (
    <div style={{ padding: '48px 40px', maxWidth: '720px' }}>
      <div style={{ marginBottom: '8px' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--color-gold-muted)', marginBottom: '12px' }}>
          Tagesenergie
        </div>
        <h1 style={{ color: 'var(--color-gold)', fontWeight: 300, fontSize: '2rem', marginBottom: '8px' }}>
          Deine Energie für heute
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', margin: '0 0 8px' }}>
          {today.formatted}
        </p>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <div style={{ color: 'var(--color-gold)', fontSize: '1.4rem', fontWeight: 300, marginBottom: '4px' }}>
          Kin {todayKin.kin} – {todayKin.tone} {todayKin.seal}
        </div>
        {birthKin && (
          <div style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
            Dein Geburts-Kin: Kin {birthKin.kin} – {birthKin.tone} {birthKin.seal}
          </div>
        )}
      </div>

      {error && (
        <div style={{ backgroundColor: 'rgba(220,53,69,0.1)', border: '1px solid rgba(220,53,69,0.3)', borderRadius: '4px', padding: '12px', marginBottom: '20px', color: '#ff6b6b', fontSize: '0.85rem' }}>
          {error}
        </div>
      )}

      {!analysis ? (
        <button
          onClick={createAnalysis}
          disabled={loading}
          style={{
            backgroundColor: loading ? 'transparent' : 'var(--color-gold)',
            color: loading ? 'var(--color-gold)' : '#000',
            border: loading ? '1px solid var(--color-gold)' : 'none',
            borderRadius: '4px',
            padding: '14px 32px',
            fontWeight: 500,
            fontSize: '1rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          {loading ? (
            <span className="pulse-gold">Deine Analyse wird erstellt...</span>
          ) : (
            'Tagesenergie jetzt erstellen'
          )}
        </button>
      ) : (
        <>
          <AnalysisDisplay content={analysis} />

          <div style={{ display: 'flex', gap: '16px', marginTop: '32px', flexWrap: 'wrap' }}>
            <PDFDownloadButton
              content={analysis}
              analysisType="daily"
              userName={profile?.name || 'Analyse'}
              date={today.formatted}
            />
            <button
              onClick={() => { setAnalysis(null); createAnalysis() }}
              style={{
                border: '1px solid rgba(139,110,62,0.5)',
                color: 'var(--color-text-muted)',
                background: 'transparent',
                borderRadius: '4px',
                padding: '10px 24px',
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              Erneut erstellen
            </button>
          </div>
        </>
      )}
    </div>
  )
}
