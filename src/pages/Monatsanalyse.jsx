import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'
import { calculateTodayKin, getGermanDate, daysUntilFirstOfNextMonth, isFirstOfMonth } from '../lib/mayanCalendar.js'
import AnalysisDisplay from '../components/AnalysisDisplay.jsx'
import PDFDownloadButton from '../components/PDFDownloadButton.jsx'
import { supabase } from '../lib/supabase.js'
import { readSSEStream } from '../lib/sseReader.js'

const MONTHS_DE = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember']

function getMonthLabel(year, month) {
  return `${MONTHS_DE[month]} ${year}`
}

export default function Monatsanalyse() {
  const { user, profile } = useAuth()
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [checkingExisting, setCheckingExisting] = useState(true)

  const today = getGermanDate()
  const hasAnnualAccess = profile?.subscription_plan === 'annual' || profile?.is_admin

  // selectedMonth: { year, month (0-indexed) }
  const [selectedMonth, setSelectedMonth] = useState({ year: today.year, month: today.monthIndex })

  const isCurrentMonth = selectedMonth.year === today.year && selectedMonth.month === today.monthIndex
  const firstOfMonth = isFirstOfMonth()
  const countdown = daysUntilFirstOfNextMonth()

  // Can create: annual users always, monthly users only on 1st of current month
  const canCreate = hasAnnualAccess || (isCurrentMonth && firstOfMonth)

  // Earliest accessible month = membership_start month (or current month as fallback)
  const membershipStart = profile?.membership_start ? new Date(profile.membership_start) : null
  const earliestYear = membershipStart ? membershipStart.getFullYear() : today.year
  const earliestMonth = membershipStart ? membershipStart.getMonth() : today.monthIndex // 0-indexed
  const isAtEarliestMonth = selectedMonth.year === earliestYear && selectedMonth.month === earliestMonth

  useEffect(() => {
    setAnalysis(null)
    setCheckingExisting(true)
    checkExistingAnalysis()
  }, [user, selectedMonth.year, selectedMonth.month])

  useEffect(() => {
    if (!checkingExisting && !analysis && !loading && canCreate) {
      createAnalysis()
    }
  }, [checkingExisting])

  async function checkExistingAnalysis() {
    if (!user) return
    try {
      const monthYear = `${selectedMonth.year}-${String(selectedMonth.month + 1).padStart(2, '0')}`
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
      const monthYear = `${selectedMonth.year}-${String(selectedMonth.month + 1).padStart(2, '0')}`
      const res = await fetch('/api/analysis/monthly', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ month_year: monthYear }),
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

  function goToPrevMonth() {
    setSelectedMonth(prev => {
      if (prev.year === earliestYear && prev.month === earliestMonth) return prev // already at start
      if (prev.month === 0) return { year: prev.year - 1, month: 11 }
      return { year: prev.year, month: prev.month - 1 }
    })
  }

  function goToNextMonth() {
    setSelectedMonth(prev => {
      const isAtCurrent = prev.year === today.year && prev.month === today.monthIndex
      if (isAtCurrent) return prev // Don't go into future
      if (prev.month === 11) return { year: prev.year + 1, month: 0 }
      return { year: prev.year, month: prev.month + 1 }
    })
  }

  const isAtCurrentMonth = selectedMonth.year === today.year && selectedMonth.month === today.monthIndex

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

      {/* Month navigation for annual users */}
      {hasAnnualAccess && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
          <button
            onClick={goToPrevMonth}
            disabled={isAtEarliestMonth}
            style={{ background: 'none', border: '1px solid rgba(139,110,62,0.3)', borderRadius: '4px', color: isAtEarliestMonth ? 'rgba(139,110,62,0.3)' : 'var(--color-gold)', padding: '6px 14px', cursor: isAtEarliestMonth ? 'default' : 'pointer', fontSize: '1rem', lineHeight: 1 }}
          >
            ‹
          </button>
          <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', minWidth: '140px', textAlign: 'center' }}>
            {getMonthLabel(selectedMonth.year, selectedMonth.month)}
          </span>
          <button
            onClick={goToNextMonth}
            disabled={isAtCurrentMonth}
            style={{ background: 'none', border: '1px solid rgba(139,110,62,0.3)', borderRadius: '4px', color: isAtCurrentMonth ? 'rgba(139,110,62,0.3)' : 'var(--color-gold)', padding: '6px 14px', cursor: isAtCurrentMonth ? 'default' : 'pointer', fontSize: '1rem', lineHeight: 1 }}
          >
            ›
          </button>
        </div>
      )}

      <h1 style={{ color: 'var(--color-gold)', fontWeight: 300, fontSize: '2rem', marginBottom: '12px' }}>
        {analysis
          ? `Deine Analyse für ${getMonthLabel(selectedMonth.year, selectedMonth.month)}`
          : canCreate
            ? `Deine Analyse für ${getMonthLabel(selectedMonth.year, selectedMonth.month)}`
            : 'Deine nächste Monatsanalyse'
        }
      </h1>

      {!analysis && !hasAnnualAccess && !firstOfMonth && (
        <div style={{ marginBottom: '32px', padding: '20px 24px', backgroundColor: 'var(--color-bg-card)', borderRadius: '4px', border: '1px solid rgba(139,110,62,0.2)', display: 'inline-block' }}>
          <div style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: '4px' }}>Verfügbar in</div>
          <div style={{ color: 'var(--color-gold)', fontSize: '1.4rem', fontWeight: 300 }}>
            {countdown.days} Tagen, {countdown.hours} Stunden
          </div>
        </div>
      )}

      {error && (
        <div style={{ backgroundColor: 'rgba(220,53,69,0.1)', border: '1px solid rgba(220,53,69,0.3)', borderRadius: '4px', padding: '12px', marginBottom: '20px', color: '#ff6b6b', fontSize: '0.85rem' }}>
          {error}
        </div>
      )}

      {loading && !analysis && (
        <div style={{
          padding: '28px 24px',
          backgroundColor: 'var(--color-bg-card)',
          borderRadius: '4px',
          border: '1px solid rgba(139,110,62,0.2)',
          marginBottom: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-gold)',
              animation: 'pulse-gold 1.5s ease-in-out infinite',
              flexShrink: 0,
            }} />
            <span style={{ color: 'var(--color-gold)', fontSize: '0.95rem', fontWeight: 400 }}>
              Deine Monatsanalyse wird erstellt
            </span>
          </div>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', margin: 0, lineHeight: 1.6 }}>
            Das dauert einen Moment. Der Text erscheint gleich direkt hier.
          </p>
        </div>
      )}

      {!analysis && !loading ? (
        canCreate ? (
          <button
            onClick={createAnalysis}
            style={{
              backgroundColor: 'var(--color-gold)',
              color: '#000',
              border: 'none',
              borderRadius: '4px',
              padding: '14px 32px',
              fontWeight: 500,
              fontSize: '1rem',
              cursor: 'pointer',
              animation: 'pulse-gold 3s ease-in-out infinite',
            }}
          >
            Monatsanalyse jetzt erstellen
          </button>
        ) : (
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            Deine Monatsanalyse erscheint am 1. {(() => {
              const next = new Date()
              next.setMonth(next.getMonth() + 1)
              return MONTHS_DE[next.getMonth()]
            })()}.
          </p>
        )
      ) : analysis ? (
        <>
          <AnalysisDisplay content={analysis} />
          <div style={{ display: 'flex', gap: '16px', marginTop: '32px', flexWrap: 'wrap' }}>
            <PDFDownloadButton
              content={analysis}
              analysisType="monthly"
              userName={profile?.name || 'Analyse'}
              date={getMonthLabel(selectedMonth.year, selectedMonth.month)}
            />
            {canCreate && (
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
      ) : null}
    </div>
  )
}
