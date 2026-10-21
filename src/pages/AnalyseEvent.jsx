import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import { supabase } from '../lib/supabase.js'
import AnalysisDisplay from '../components/AnalysisDisplay.jsx'
import { generateAnalysisPDF } from '../lib/pdfGenerator.js'

const CATEGORY_LABELS = {
  land: 'Land / Nation',
  job: 'Job / Karriere',
  beziehung: 'Beziehung / Partnerschaft',
  unternehmen: 'Unternehmen / Projekt',
  kauf: 'Kauf / Besitz',
  sonstiges: 'Ereignis',
}

export default function AnalyseEvent() {
  const { eventId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [event, setEvent] = useState(null)
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const [analysisDate, setAnalysisDate] = useState('')

  useEffect(() => {
    async function load() {
      if (!user) return
      const { data: ev } = await supabase.from('user_events').select('*').eq('id', eventId).eq('user_id', user.id).single()
      if (!ev) { setError('Ereignis nicht gefunden.'); setLoading(false); return }
      setEvent(ev)

      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch(`/api/analysis/event/${eventId}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setContent(data.content)
        setAnalysisDate(data.analysis_date)
      }
      setLoading(false)
    }
    load()
  }, [user, eventId])

  async function handleCreate() {
    setCreating(true); setError('')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch(`/api/analysis/event/${eventId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
      })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error) }
      const data = await res.json()
      setContent(data.content)
      setAnalysisDate(new Date().toISOString().split('T')[0])
    } catch (e) {
      setError(e.message)
    } finally {
      setCreating(false)
    }
  }

  async function handlePDF() {
    if (!event || !content) return
    await generateAnalysisPDF({ content, analysisType: 'event', userName: event.name, date: analysisDate })
  }

  if (loading) return (
    <div style={{ padding: '60px 40px', color: 'var(--text-2)', fontSize: '0.9rem' }}>Wird geladen…</div>
  )

  if (error && !event) return (
    <div style={{ padding: '60px 40px' }}>
      <p style={{ color: '#c0392b', marginBottom: '16px' }}>{error}</p>
      <button onClick={() => navigate('/analysen')} style={{ color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}>
        ← Zurück zu Meine Analysen
      </button>
    </div>
  )

  return (
    <div style={{ backgroundColor: 'var(--bg-deep)', minHeight: '100vh', padding: '48px 40px', maxWidth: '860px' }}>
      <button onClick={() => navigate('/analysen')} style={{ color: 'var(--text-2)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.82rem', marginBottom: '32px', padding: 0 }}>
        ← Zurück
      </button>

      <div style={{ fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--accent)', marginBottom: '8px' }}>
        {event ? (CATEGORY_LABELS[event.category] || 'Ereignis') : 'Analyse'}
      </div>
      <h1 style={{ fontFamily: '"Playfair Display", serif', fontWeight: 400, fontSize: '2rem', color: 'var(--text-1)', margin: '0 0 8px' }}>
        {event?.name}
      </h1>
      {event && (
        <p style={{ color: 'var(--text-2)', fontSize: '0.82rem', marginBottom: '32px' }}>
          {CATEGORY_LABELS[event.category]} · Datum: {new Date(event.event_date).toLocaleDateString('de-DE')}
          {event.description && ` · ${event.description}`}
        </p>
      )}

      {!content ? (
        <div style={{ textAlign: 'center', paddingTop: '40px' }}>
          {error && <p style={{ color: '#c0392b', marginBottom: '16px', fontSize: '0.88rem' }}>{error}</p>}
          <p style={{ color: 'var(--text-2)', fontSize: '0.9rem', marginBottom: '28px', lineHeight: 1.7 }}>
            Noch keine Analyse für dieses Ereignis. Erstelle jetzt eine tiefe Maya-Energie-Analyse.
          </p>
          <button
            onClick={handleCreate}
            disabled={creating}
            style={{
              backgroundColor: 'var(--accent)', color: 'var(--bg-deep)', border: 'none',
              borderRadius: '40px', padding: '14px 36px', fontSize: '0.88rem',
              fontWeight: 500, cursor: creating ? 'not-allowed' : 'pointer', opacity: creating ? 0.7 : 1,
            }}
          >
            {creating ? 'Analyse wird erstellt… (ca. 30 Sek.)' : 'Analyse erstellen'}
          </button>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', flexWrap: 'wrap' }}>
            <button
              onClick={handleCreate}
              disabled={creating}
              style={{ border: '1px solid var(--accent)', color: 'var(--accent)', background: 'transparent', borderRadius: '40px', padding: '9px 20px', fontSize: '0.82rem', cursor: creating ? 'not-allowed' : 'pointer', opacity: creating ? 0.7 : 1 }}
            >
              {creating ? 'Wird neu erstellt…' : 'Neu erstellen'}
            </button>
            <button
              onClick={handlePDF}
              style={{ border: '1px solid var(--border)', color: 'var(--text-2)', background: 'transparent', borderRadius: '40px', padding: '9px 20px', fontSize: '0.82rem', cursor: 'pointer' }}
            >
              Als PDF speichern
            </button>
          </div>
          {analysisDate && (
            <p style={{ color: 'var(--text-2)', fontSize: '0.75rem', marginBottom: '24px' }}>
              Erstellt am {new Date(analysisDate).toLocaleDateString('de-DE')}
            </p>
          )}
          <AnalysisDisplay content={content} />
        </>
      )}
    </div>
  )
}
