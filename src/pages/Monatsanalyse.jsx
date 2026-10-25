import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'
import { calculateTodayKin, getGermanDate, daysUntilFirstOfNextMonth, isFirstOfMonth } from '../lib/mayanCalendar.js'
import AnalysisDisplay from '../components/AnalysisDisplay.jsx'
import PDFDownloadButton from '../components/PDFDownloadButton.jsx'
import { supabase } from '../lib/supabase.js'
import { readSSEStream } from '../lib/sseReader.js'

export default function Monatsanalyse() {
  const { user, profile } = useAuth()
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [checkingExisting, setCheckingExisting] = useState(true)

  const today = getGermanDate()
  const firstOfMonth = isFirstOfMonth()
  const countdown = daysUntilFirstOfNextMonth()

  useEffect(() => {
    checkExistingAnalysis()
  }, [user])

  useEffect(() => {
    if (!checkingExisting && !analysis && !loading) {
      createAnalysis()
    }
  }, [checkingExisting])

  async function checkExistingAnalysis() {
    if (!user) return
    try {
      const monthYear = `${today.year}-${String(today.monthIndex + 1).padStart(2, '0')}`
      const { data } = await supabase
        .from('analyses')
        .select('content, created_at')
        .eq('user_id', user.id)
        .eq('type', 'monthly')
        .eq('month_year', monthYear)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      if (data) setAnalysis(data.content)
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
      const res = await fetch('/api/analysis/monthly', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
      })
      await readSSEStream(res, {
        onChunk: (text) => setAnalysis(text),
        onDone: (content) => setAnalysis(content),
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (checkingExisting) {
    return (
      <div className="app-page">
        <div style={{ color: 'var(--color-text-muted)' }} className="pulse-gold">Wird geladen...</div>
      </div>
    )
  }

  return (
    <div className="app-page">
      <div style={{ fontSize: '0.75rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--color-gold-muted)', marginBottom: '12px' }}>
        Monatsanalyse
      </div>

      {firstOfMonth ? (
        <>
          <h1 style={{ color: 'var(--color-gold)', fontWeight: 300, fontSize: '2rem', marginBottom: '12px' }}>
            Deine Analyse für {today.month} {today.year} ist bereit.
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '32px' }}>
            Einmal im Monat öffnet sich dieses Fenster für dich.
          </p>
        </>
      ) : (
        <>
          <h1 style={{ color: 'var(--color-gold)', fontWeight: 300, fontSize: '2rem', marginBottom: '12px' }}>
            Deine nächste Monatsanalyse
          </h1>
          {!analysis && (
            <div style={{ marginBottom: '32px', padding: '20px 24px', backgroundColor: 'var(--color-bg-card)', borderRadius: '4px', border: '1px solid rgba(139,110,62,0.2)', display: 'inline-block' }}>
              <div style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: '4px' }}>Verfügbar in</div>
              <div style={{ color: 'var(--color-gold)', fontSize: '1.4rem', fontWeight: 300 }}>
                {countdown.days} Tagen, {countdown.hours} Stunden
              </div>
            </div>
          )}
        </>
      )}

      {error && (
        <div style={{ backgroundColor: 'rgba(220,53,69,0.1)', border: '1px solid rgba(220,53,69,0.3)', borderRadius: '4px', padding: '12px', marginBottom: '20px', color: '#ff6b6b', fontSize: '0.85rem' }}>
          {error}
        </div>
      )}

      {!analysis ? (
        firstOfMonth ? (
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
              animation: !loading ? 'pulse-gold 3s ease-in-out infinite' : 'none',
            }}
          >
            {loading ? (
              <span className="pulse-gold">Deine Analyse wird erstellt...</span>
            ) : (
              'Monatsanalyse jetzt erstellen'
            )}
          </button>
        ) : (
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            Deine erste Monatsanalyse erscheint am 1. {(() => {
              const months = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember']
              const next = new Date()
              next.setMonth(next.getMonth() + 1)
              return months[next.getMonth()]
            })()}.
          </p>
        )
      ) : (
        <>
          <AnalysisDisplay content={analysis} />
          <div style={{ display: 'flex', gap: '16px', marginTop: '32px', flexWrap: 'wrap' }}>
            <PDFDownloadButton
              content={analysis}
              analysisType="monthly"
              userName={profile?.name || 'Analyse'}
              date={`${today.month} ${today.year}`}
            />
            {firstOfMonth && (
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
                Neu erstellen
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}
