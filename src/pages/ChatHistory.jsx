import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import { supabase } from '../lib/supabase.js'

const WEEKDAYS = ['Sonntag','Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag']

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
  if (dateStr === today) return 'Heute'
  if (dateStr === yesterday) return 'Gestern'
  return `${WEEKDAYS[d.getDay()]}, ${d.toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' })}`
}

function MessageBubble({ msg }) {
  return (
    <div style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
      <div style={{
        maxWidth: '75%', padding: '10px 14px',
        borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
        backgroundColor: msg.role === 'user' ? 'var(--accent)' : 'var(--bg-card)',
        color: msg.role === 'user' ? 'var(--bg-deep)' : 'var(--text-1)',
        fontSize: '0.875rem', lineHeight: 1.65,
        border: msg.role === 'assistant' ? '1px solid var(--border)' : 'none',
        whiteSpace: 'pre-wrap',
      }}>
        {msg.content}
      </div>
    </div>
  )
}

export default function ChatHistory() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    if (!user) return
    supabase
      .from('chat_sessions')
      .select('session_date, messages')
      .eq('user_id', user.id)
      .order('session_date', { ascending: false })
      .then(({ data }) => {
        setSessions(data || [])
        setLoading(false)
      })
  }, [user])

  return (
    <div style={{ backgroundColor: 'var(--bg-deep)', minHeight: '100vh', padding: 'clamp(24px,4vw,48px) clamp(16px,4vw,40px)', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: '720px' }}>
        <button
          onClick={() => navigate(-1)}
          style={{ color: 'var(--text-2)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.82rem', marginBottom: '28px', padding: 0 }}
        >
          ← Zurück
        </button>

        <div style={{ fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--accent)', marginBottom: '8px' }}>
          MAYA KI
        </div>
        <h1 style={{ fontFamily: '"Playfair Display", serif', fontWeight: 400, fontSize: '2rem', color: 'var(--text-1)', margin: '0 0 32px' }}>
          Chat-Verlauf
        </h1>

        {loading ? (
          <div style={{ color: 'var(--text-2)', fontSize: '0.88rem' }}>Wird geladen…</div>
        ) : sessions.length === 0 ? (
          <div style={{ color: 'var(--text-2)', fontSize: '0.9rem', lineHeight: 1.7, padding: '32px 0' }}>
            Noch keine gespeicherten Chats. Starte ein Gespräch mit MAYA über den Chat-Button rechts unten.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {sessions.map(s => {
              const userMsgs = (s.messages || []).filter(m => m.role === 'user')
              const isOpen = expanded === s.session_date
              return (
                <div key={s.session_date} style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden' }}>
                  <button
                    onClick={() => setExpanded(isOpen ? null : s.session_date)}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '16px 20px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 500, color: 'var(--text-1)', fontSize: '0.95rem', marginBottom: '2px' }}>
                        {formatDate(s.session_date)}
                      </div>
                      <div style={{ color: 'var(--text-2)', fontSize: '0.78rem' }}>
                        {userMsgs.length} {userMsgs.length === 1 ? 'Frage' : 'Fragen'}
                        {userMsgs.length > 0 && ` · ${userMsgs[0].content.slice(0, 60)}${userMsgs[0].content.length > 60 ? '…' : ''}`}
                      </div>
                    </div>
                    <span style={{ color: 'var(--text-2)', fontSize: '0.8rem', marginLeft: '12px', flexShrink: 0 }}>
                      {isOpen ? '▲' : '▼'}
                    </span>
                  </button>

                  {isOpen && (
                    <div style={{ borderTop: '1px solid var(--border)', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {(s.messages || []).filter(m => m.role !== 'assistant' || m.content !== 'Ich bin MAYA, deine persönliche Maya-Kalender-KI. Ich kenne dein vollständiges Profil und beantworte all deine Fragen rund um deine Energie, dein Kin und deinen Lebensweg. Was möchtest du wissen?').map((m, i) => (
                        <MessageBubble key={i} msg={m} />
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
