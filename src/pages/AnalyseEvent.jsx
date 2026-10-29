import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import { supabase } from '../lib/supabase.js'
import AnalysisDisplay from '../components/AnalysisDisplay.jsx'
import { generateAnalysisPDF } from '../lib/pdfGenerator.js'
import { readSSEStream } from '../lib/sseReader.js'

const CATEGORY_LABELS = {
  land: 'Land / Nation',
  job: 'Job / Karriere',
  beziehung: 'Beziehung / Partnerschaft',
  unternehmen: 'Unternehmen / Projekt',
  kauf: 'Kauf / Besitz',
  sonstiges: 'Ereignis',
}

const COPPER = 'var(--accent)'
const TEXT = 'var(--text-1)'
const TEXT_MID = 'var(--text-2)'

function todayStr() { return new Date().toISOString().split('T')[0] }
function currentMonthYear() { const n = new Date(); return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}` }
function currentYear() { return new Date().getFullYear() }

const GERMAN_MONTHS = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember']

export default function AnalyseEvent() {
  const { eventId } = useParams()
  const navigate = useNavigate()
  const { user, profile } = useAuth()

  const [event, setEvent] = useState(null)
  const [loadingEvent, setLoadingEvent] = useState(true)
  const [error, setError] = useState('')

  // Base analysis
  const [content, setContent] = useState('')
  const [creating, setCreating] = useState(false)
  const [analysisDate, setAnalysisDate] = useState('')

  // Daily
  const [dailyDate, setDailyDate] = useState(todayStr())
  const [dailyContent, setDailyContent] = useState(null)
  const [dailyLoading, setDailyLoading] = useState(false)
  const [dailyChecking, setDailyChecking] = useState(true)
  const [dailyError, setDailyError] = useState('')

  // Monthly
  const now = new Date()
  const [selectedYear, setSelectedYear] = useState(now.getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1)
  const [monthlyContent, setMonthlyContent] = useState(null)
  const [monthlyLoading, setMonthlyLoading] = useState(false)
  const [monthlyChecking, setMonthlyChecking] = useState(true)
  const [monthlyError, setMonthlyError] = useState('')

  // Yearly
  const [yearlyYear, setYearlyYear] = useState(currentYear())
  const [yearlyContent, setYearlyContent] = useState(null)
  const [yearlyLoading, setYearlyLoading] = useState(false)
  const [yearlyChecking, setYearlyChecking] = useState(true)
  const [yearlyError, setYearlyError] = useState('')

  const isAdmin = profile?.is_admin
  const isAnnual = profile?.subscription_plan === 'annual'
  const canSelectMonth = isAdmin || isAnnual
  const canYearly = isAdmin || isAnnual

  // Year options for yearly analysis
  const baseYear = currentYear()
  const yearOptions = isAdmin
    ? [baseYear - 2, baseYear - 1, baseYear, baseYear + 1, baseYear + 2]
    : [baseYear, baseYear + 1]

  // Month options
  const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1)
  const yearOptionsMonthly = isAdmin
    ? [baseYear - 1, baseYear, baseYear + 1]
    : isAnnual
    ? [baseYear, baseYear + 1]
    : [baseYear]

  useEffect(() => {
    if (!user) return
    async function load() {
      const { data: ev } = await supabase.from('user_events').select('*').eq('id', eventId).eq('user_id', user.id).single()
      if (!ev) { setError('Ereignis nicht gefunden.'); setLoadingEvent(false); return }
      setEvent(ev)
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch(`/api/analysis/event/${eventId}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setContent(data.content || '')
        setAnalysisDate(data.analysis_date || '')
      }
      setLoadingEvent(false)
    }
    load()
  }, [user, eventId])

  const checkDaily = useCallback(async (date) => {
    if (!user) return
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch(`/api/analysis/event/${eventId}/daily?date=${date}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      const data = await res.json()
      setDailyContent(data.content || null)
    } catch {}
    finally { setDailyChecking(false) }
  }, [user, eventId])

  useEffect(() => { if (dailyChecking) checkDaily(dailyDate) }, [dailyChecking, checkDaily, dailyDate])

  const checkMonthly = useCallback(async (year, month) => {
    if (!user) return
    const monthYear = `${year}-${String(month).padStart(2, '0')}`
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch(`/api/analysis/event/${eventId}/monthly?monthYear=${monthYear}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      const data = await res.json()
      setMonthlyContent(data.content || null)
    } catch {}
    finally { setMonthlyChecking(false) }
  }, [user, eventId])

  useEffect(() => { if (monthlyChecking) checkMonthly(selectedYear, selectedMonth) }, [monthlyChecking, checkMonthly, selectedYear, selectedMonth])

  const checkYearly = useCallback(async (year) => {
    if (!user) return
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch(`/api/analysis/event/${eventId}/yearly?year=${year}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      const data = await res.json()
      setYearlyContent(data.content || null)
    } catch {}
    finally { setYearlyChecking(false) }
  }, [user, eventId])

  useEffect(() => { if (yearlyChecking) checkYearly(yearlyYear) }, [yearlyChecking, checkYearly, yearlyYear])

  async function handleCreate() {
    setCreating(true); setError('')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch(`/api/analysis/event/${eventId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
      })
      await readSSEStream(res, {
        onChunk: (text) => setContent(text),
        onDone: (c) => { setContent(c); setAnalysisDate(new Date().toISOString().split('T')[0]) },
      })
    } catch (e) { setError(e.message) }
    finally { setCreating(false) }
  }

  async function createDaily() {
    setDailyLoading(true); setDailyError('')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch(`/api/analysis/event/${eventId}/daily`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ date: dailyDate }),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Fehler') }
      await readSSEStream(res, {
        onChunk: (text) => setDailyContent(text),
        onDone: (c) => setDailyContent(c),
      })
    } catch (e) { setDailyError(e.message) }
    finally { setDailyLoading(false) }
  }

  async function createMonthly() {
    setMonthlyLoading(true); setMonthlyError('')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch(`/api/analysis/event/${eventId}/monthly`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ year: selectedYear, month: selectedMonth }),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Fehler') }
      await readSSEStream(res, {
        onChunk: (text) => setMonthlyContent(text),
        onDone: (c) => setMonthlyContent(c),
      })
    } catch (e) { setMonthlyError(e.message) }
    finally { setMonthlyLoading(false) }
  }

  async function createYearly() {
    setYearlyLoading(true); setYearlyError('')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch(`/api/analysis/event/${eventId}/yearly`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ year: yearlyYear }),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Fehler') }
      await readSSEStream(res, {
        onChunk: (text) => setYearlyContent(text),
        onDone: (c) => setYearlyContent(c),
      })
    } catch (e) { setYearlyError(e.message) }
    finally { setYearlyLoading(false) }
  }

  if (loadingEvent) return (
    <div style={{ padding: '60px 40px', color: TEXT_MID, fontSize: '0.9rem' }}>Wird geladen…</div>
  )

  if (error && !event) return (
    <div style={{ padding: '60px 40px' }}>
      <p style={{ color: '#c0392b', marginBottom: '16px' }}>{error}</p>
      <button onClick={() => navigate('/analysen/events')} style={{ color: COPPER, background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}>
        ← Zurück zu Ereignisse
      </button>
    </div>
  )

  const sectionDivider = { marginTop: '48px', paddingTop: '40px', borderTop: '1px solid var(--border)' }
  const sectionLabel = { fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.2em', color: COPPER, marginBottom: '8px' }
  const sectionHeading = { fontFamily: '"Playfair Display", serif', fontWeight: 400, fontSize: '1.6rem', color: TEXT, margin: '0 0 20px' }
  const btnPrimary = (disabled) => ({ backgroundColor: 'transparent', border: `1px solid ${COPPER}`, color: COPPER, borderRadius: '40px', padding: '13px 32px', fontWeight: 500, fontSize: '0.85rem', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.7 : 1 })
  const btnSecondary = { border: '1px solid var(--border)', color: TEXT_MID, background: 'transparent', borderRadius: '40px', padding: '10px 24px', fontSize: '0.82rem', cursor: 'pointer' }

  return (
    <div style={{ backgroundColor: 'var(--bg-deep)', minHeight: '100vh', padding: 'clamp(24px,4vw,48px) clamp(16px,4vw,40px)', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: '720px' }}>
        <button onClick={() => navigate('/analysen/events')} style={{ color: TEXT_MID, background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.82rem', marginBottom: '32px', padding: 0 }}>
          ← Zurück zu Ereignisse
        </button>

        <div style={{ fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.2em', color: COPPER, marginBottom: '8px' }}>
          {event ? (CATEGORY_LABELS[event.category] || 'Ereignis') : 'Analyse'}
        </div>
        <h1 style={{ fontFamily: '"Playfair Display", serif', fontWeight: 400, fontSize: '2rem', color: TEXT, margin: '0 0 8px' }}>
          {event?.name}
        </h1>
        {event && (
          <p style={{ color: TEXT_MID, fontSize: '0.82rem', marginBottom: '40px' }}>
            {CATEGORY_LABELS[event.category]} · {new Date(event.event_date).toLocaleDateString('de-DE')}
            {event.description && ` · ${event.description}`}
          </p>
        )}

        {/* ── Tagesanalyse ── */}
        <div>
          <div style={sectionLabel}>Tagesenergie</div>
          <h2 style={sectionHeading}>{event?.name} · Tagesenergie</h2>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <input
              type="date"
              value={dailyDate}
              onChange={e => {
                setDailyDate(e.target.value)
                setDailyContent(null)
                setDailyChecking(false)
              }}
              min={canSelectMonth ? undefined : todayStr()}
              max={canSelectMonth ? undefined : todayStr()}
              style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 14px', color: TEXT, fontSize: '0.88rem', fontFamily: 'Inter, sans-serif', cursor: 'pointer' }}
            />
            {!canSelectMonth && (
              <span style={{ color: TEXT_MID, fontSize: '0.78rem' }}>Nur heute verfügbar (Monatstarif)</span>
            )}
          </div>

          {dailyChecking ? (
            <div style={{ color: TEXT_MID, fontSize: '0.88rem' }}>Wird geprüft…</div>
          ) : dailyContent ? (
            <>
              <AnalysisDisplay content={dailyContent} />
              <div style={{ display: 'flex', gap: '12px', marginTop: '16px', flexWrap: 'wrap' }}>
                <button onClick={() => setDailyContent(null)} style={btnSecondary}>Neu erstellen</button>
              </div>
            </>
          ) : (
            <div>
              {dailyError && <p style={{ color: '#c0392b', fontSize: '0.85rem', marginBottom: '12px' }}>{dailyError}</p>}
              <p style={{ color: TEXT_MID, fontSize: '0.88rem', marginBottom: '16px', lineHeight: 1.7 }}>
                Wie wirkt die Maya-Energie des {dailyDate ? new Date(dailyDate + 'T00:00:00').toLocaleDateString('de-DE') : 'gewählten Tages'} auf {event?.name}?
              </p>
              <button onClick={createDaily} disabled={dailyLoading || !dailyDate} style={btnPrimary(dailyLoading || !dailyDate)}>
                {dailyLoading ? 'Wird erstellt…' : `Tagesanalyse für ${dailyDate ? new Date(dailyDate + 'T00:00:00').toLocaleDateString('de-DE') : '…'} erstellen`}
              </button>
            </div>
          )}
        </div>

        {/* ── Monatsanalyse ── */}
        <div style={sectionDivider}>
          <div style={sectionLabel}>Monatsanalyse</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <h2 style={{ ...sectionHeading, margin: 0 }}>{event?.name} · Monatsenergie</h2>
            <div style={{ display: 'flex', gap: '8px' }}>
              <select
                value={selectedMonth}
                onChange={e => { setSelectedMonth(Number(e.target.value)); setMonthlyContent(null); setMonthlyChecking(false) }}
                style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '8px 12px', color: TEXT, fontSize: '0.85rem', fontFamily: 'Inter, sans-serif', cursor: 'pointer' }}
              >
                {monthOptions.map(m => (
                  <option key={m} value={m} disabled={!canSelectMonth && (m !== now.getMonth() + 1 || selectedYear !== now.getFullYear())}>
                    {GERMAN_MONTHS[m - 1]}
                  </option>
                ))}
              </select>
              <select
                value={selectedYear}
                onChange={e => { setSelectedYear(Number(e.target.value)); setMonthlyContent(null); setMonthlyChecking(false) }}
                style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '8px 12px', color: TEXT, fontSize: '0.85rem', fontFamily: 'Inter, sans-serif', cursor: 'pointer' }}
              >
                {yearOptionsMonthly.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>

          {monthlyChecking ? (
            <div style={{ color: TEXT_MID, fontSize: '0.88rem' }}>Wird geprüft…</div>
          ) : monthlyContent ? (
            <>
              <AnalysisDisplay content={monthlyContent} />
              <div style={{ display: 'flex', gap: '12px', marginTop: '16px', flexWrap: 'wrap' }}>
                <button onClick={() => setMonthlyContent(null)} style={btnSecondary}>Neu erstellen</button>
              </div>
            </>
          ) : (
            <div>
              {monthlyError && <p style={{ color: '#c0392b', fontSize: '0.85rem', marginBottom: '12px' }}>{monthlyError}</p>}
              <p style={{ color: TEXT_MID, fontSize: '0.88rem', marginBottom: '16px', lineHeight: 1.7 }}>
                Wie wirkt der {GERMAN_MONTHS[selectedMonth - 1]} {selectedYear} auf {event?.name}?
              </p>
              <button onClick={createMonthly} disabled={monthlyLoading} style={btnPrimary(monthlyLoading)}>
                {monthlyLoading ? 'Wird erstellt…' : `Monatsanalyse ${GERMAN_MONTHS[selectedMonth - 1]} ${selectedYear} erstellen`}
              </button>
            </div>
          )}
        </div>

        {/* ── Jahresanalyse ── */}
        <div style={sectionDivider}>
          <div style={sectionLabel}>Jahresanalyse</div>
          {!canYearly ? (
            <div style={{ padding: '20px', backgroundColor: 'rgba(184,151,90,0.06)', border: '1px solid rgba(184,151,90,0.2)', borderRadius: '8px', fontSize: '0.88rem', color: TEXT_MID, lineHeight: 1.7 }}>
              Die Jahresanalyse ist exklusiv im <strong style={{ color: COPPER }}>Jahrestarif</strong> verfügbar.
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <h2 style={{ ...sectionHeading, margin: 0 }}>{event?.name} · Monat für Monat</h2>
                <select
                  value={yearlyYear}
                  onChange={e => { setYearlyYear(Number(e.target.value)); setYearlyContent(null); setYearlyChecking(false) }}
                  style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '8px 12px', color: TEXT, fontSize: '0.85rem', fontFamily: 'Inter, sans-serif', cursor: 'pointer' }}
                >
                  {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>

              {yearlyChecking ? (
                <div style={{ color: TEXT_MID, fontSize: '0.88rem' }}>Wird geprüft…</div>
              ) : yearlyContent ? (
                <>
                  <AnalysisDisplay content={yearlyContent} />
                  <div style={{ display: 'flex', gap: '12px', marginTop: '16px', flexWrap: 'wrap' }}>
                    <button onClick={() => { generateAnalysisPDF({ content: yearlyContent, analysisType: 'event_yearly', userName: event?.name || '', date: String(yearlyYear) }) }}
                      style={btnSecondary}>Als PDF speichern</button>
                    <button onClick={() => setYearlyContent(null)} style={btnSecondary}>Neu erstellen</button>
                  </div>
                </>
              ) : (
                <div>
                  {yearlyError && <p style={{ color: '#c0392b', fontSize: '0.85rem', marginBottom: '12px' }}>{yearlyError}</p>}
                  <p style={{ color: TEXT_MID, fontSize: '0.88rem', marginBottom: '16px', lineHeight: 1.7 }}>
                    Erhalte eine detaillierte Monat-für-Monat-Analyse für {event?.name} im Jahr {yearlyYear}.
                  </p>
                  <button onClick={createYearly} disabled={yearlyLoading} style={btnPrimary(yearlyLoading)}>
                    {yearlyLoading ? `Jahresanalyse ${yearlyYear} wird erstellt…` : `Jahresanalyse ${yearlyYear} erstellen`}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* ── Grundanalyse ── */}
        <div style={sectionDivider}>
          <div style={sectionLabel}>Grundenergie-Analyse</div>
          <h2 style={sectionHeading}>{event?.name} · Energie-Profil</h2>
          <p style={{ color: TEXT_MID, fontSize: '0.88rem', marginBottom: '20px', lineHeight: 1.7 }}>
            Die grundlegende Maya-Energie-Analyse für {event?.name} — unabhängig vom Datum.
          </p>
          {!content ? (
            <div>
              {error && <p style={{ color: '#c0392b', marginBottom: '16px', fontSize: '0.88rem' }}>{error}</p>}
              <button onClick={handleCreate} disabled={creating}
                style={{ backgroundColor: 'var(--accent)', color: 'var(--bg-deep)', border: 'none', borderRadius: '40px', padding: '14px 36px', fontSize: '0.88rem', fontWeight: 500, cursor: creating ? 'not-allowed' : 'pointer', opacity: creating ? 0.7 : 1 }}>
                {creating ? 'Analyse wird erstellt… (ca. 30 Sek.)' : 'Energie-Profil erstellen'}
              </button>
            </div>
          ) : (
            <>
              {analysisDate && (
                <p style={{ color: TEXT_MID, fontSize: '0.75rem', marginBottom: '20px' }}>
                  Erstellt am {new Date(analysisDate).toLocaleDateString('de-DE')}
                </p>
              )}
              <AnalysisDisplay content={content} />
              <div style={{ display: 'flex', gap: '12px', marginTop: '20px', flexWrap: 'wrap' }}>
                <button onClick={() => generateAnalysisPDF({ content, analysisType: 'event', userName: event?.name || '', date: analysisDate })} style={btnSecondary}>
                  Als PDF speichern
                </button>
                <button onClick={handleCreate} disabled={creating} style={btnSecondary}>
                  {creating ? 'Wird neu erstellt…' : 'Neu erstellen'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
