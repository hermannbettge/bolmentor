import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import { useIsMobile } from '../hooks/useIsMobile.js'
import { supabase } from '../lib/supabase.js'

const SUGGESTIONS = [
  'Was ist mein größtes Muster, das mich immer wieder einholt?',
  'Welche Energie ist heute für mich aktiv?',
  'Was bedeutet mein galaktischer Ton für meinen Alltag?',
  'Warum laufen Beziehungen bei mir immer ähnlich ab?',
  'Was ist mein stärkstes Geschenk laut meinem Profil?',
  'Was blockiert mich gerade energetisch?',
]

export default function MayaKI() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const m = useIsMobile()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [status, setStatus] = useState(null) // { limit, used, remaining, allowedTopicLabels, plan }
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    loadStatus()
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function loadStatus() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/chat/status', {
        headers: { 'Authorization': `Bearer ${session.access_token}` },
      })
      if (res.ok) setStatus(await res.json())
    } catch (_) {}
  }

  async function send(text) {
    const userMsg = text || input.trim()
    if (!userMsg || loading) return
    setInput('')
    setError('')

    const updated = [...messages, { role: 'user', content: userMsg }]
    setMessages(updated)
    setLoading(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ messages: updated }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.error === 'DAILY_LIMIT_REACHED') {
          setMessages(prev => [...prev.slice(0, -1)]) // remove the user msg that didn't go through
          setError(data.message)
          setInput(userMsg) // restore input
        } else {
          setError(data.error || 'Fehler beim Abrufen der Antwort')
        }
        return
      }

      setMessages([...updated, { role: 'assistant', content: data.reply }])
      if (data.remaining !== undefined) {
        setStatus(prev => prev ? { ...prev, remaining: data.remaining, used: data.limit - data.remaining } : prev)
      }
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  const name = profile?.name || 'du'
  const isAdmin = status?.isAdmin === true
  const remaining = status?.remaining ?? null
  const isLimitReached = !isAdmin && remaining !== null && remaining <= 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: m ? 'calc(100vh - 70px)' : '100vh', backgroundColor: 'var(--color-bg-deep)', overflow: 'hidden' }}>

      {/* Header */}
      <div style={{ padding: m ? '14px 16px 10px' : '20px 32px 14px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--color-gold-muted)', marginBottom: '2px' }}>
              Persönlicher Berater
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
              <h1 style={{ color: 'var(--color-gold)', fontWeight: 300, fontSize: m ? '1.2rem' : '1.6rem', margin: 0 }}>
                Maya KI
              </h1>
              {!m && (
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
                  Kennt dein Profil · Antwortet persönlich
                </span>
              )}
            </div>
          </div>

          {/* Usage indicator — hidden for admins */}
          {status && !isAdmin && (
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{
                fontSize: '0.7rem',
                color: isLimitReached ? '#ff6b6b' : remaining <= 1 ? '#f0a020' : 'var(--color-text-muted)',
                marginBottom: '2px',
              }}>
                {isLimitReached ? 'Limit erreicht' : `Noch ${remaining} Frage${remaining === 1 ? '' : 'n'} heute`}
              </div>
              <div style={{ display: 'flex', gap: '3px', justifyContent: 'flex-end' }}>
                {Array.from({ length: status.limit }).map((_, i) => (
                  <div key={i} style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: i < status.used ? 'var(--color-text-muted)' : 'var(--color-gold)',
                    opacity: i < status.used ? 0.3 : 1,
                  }} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: m ? '16px' : '24px 32px' }}>

        {/* Welcome */}
        {messages.length === 0 && (
          <div style={{ maxWidth: '680px' }}>
            <div style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: m ? '20px' : '28px', marginBottom: '24px' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '12px' }}>☽</div>
              <p style={{ color: 'var(--color-text-primary)', fontWeight: 300, lineHeight: 1.8, fontSize: '0.95rem', margin: '0 0 8px' }}>
                Hallo {name}. Ich bin Maya — deine persönliche KI-Beraterin auf Basis deines Maya-Profils.
              </p>
              <p style={{ color: 'var(--color-text-muted)', fontWeight: 300, lineHeight: 1.8, fontSize: '0.88rem', margin: '0 0 12px' }}>
                Ich kenne dein Sonnensiegel, deinen galaktischen Ton und die Energie des heutigen Tages. Stell mir alles, was dich beschäftigt.
              </p>

              {/* Allowed topics */}
              {status && status.allowedTopicLabels?.length > 0 && (
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px', marginTop: '4px' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-gold-muted)', marginBottom: '8px' }}>
                    Verfügbare Themenbereiche
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {status.allowedTopicLabels.map((label, i) => (
                      <span key={i} style={{ backgroundColor: 'rgba(139,110,62,0.12)', border: '1px solid rgba(139,110,62,0.2)', borderRadius: '12px', padding: '3px 10px', fontSize: '0.75rem', color: 'var(--color-gold-muted)' }}>
                        {label}
                      </span>
                    ))}
                  </div>
                  {status.plan !== 'annual' && (
                    <div style={{ marginTop: '10px', fontSize: '0.75rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                      Mit jeder gebuchten Analyse kommen 2 weitere Fragen/Tag und das Thema wird freigeschaltet.{' '}
                      <button onClick={() => navigate('/zusatzanalysen')} style={{ color: 'var(--color-gold)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontFamily: 'Inter, sans-serif', padding: 0, textDecoration: 'underline' }}>
                        Analysen ansehen →
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div style={{ fontSize: '0.75rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--color-gold-muted)', marginBottom: '12px' }}>
              Oder starte mit einer Frage
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => !isLimitReached && send(s)}
                  disabled={isLimitReached}
                  style={{
                    backgroundColor: 'var(--color-bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: '20px',
                    padding: '8px 14px',
                    fontSize: '0.82rem',
                    color: isLimitReached ? 'var(--color-text-muted)' : 'var(--color-text-muted)',
                    cursor: isLimitReached ? 'default' : 'pointer',
                    fontFamily: 'Inter, sans-serif',
                    textAlign: 'left',
                    lineHeight: 1.4,
                    opacity: isLimitReached ? 0.4 : 1,
                    transition: 'border-color 0.2s',
                  }}
                  onMouseEnter={e => !isLimitReached && (e.currentTarget.style.borderColor = 'var(--color-gold-muted)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message list */}
        {messages.map((msg, i) => (
          <div key={i} style={{
            display: 'flex',
            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
            marginBottom: '16px',
          }}>
            {msg.role === 'assistant' && (
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', marginRight: '10px', flexShrink: 0, marginTop: '2px' }}>
                ☽
              </div>
            )}
            <div style={{
              maxWidth: m ? '85%' : '68%',
              backgroundColor: msg.role === 'user' ? 'var(--color-gold)' : 'var(--color-bg-card)',
              color: msg.role === 'user' ? '#000' : 'var(--color-text-primary)',
              border: msg.role === 'assistant' ? '1px solid var(--border)' : 'none',
              borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '4px 16px 16px 16px',
              padding: m ? '12px 14px' : '14px 18px',
              fontSize: '0.9rem',
              fontWeight: 300,
              lineHeight: 1.8,
              whiteSpace: 'pre-wrap',
            }}>
              {msg.content}
            </div>
          </div>
        ))}

        {/* Loading */}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>
              ☽
            </div>
            <div style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--border)', borderRadius: '4px 16px 16px 16px', padding: '14px 18px', display: 'flex', gap: '6px', alignItems: 'center' }}>
              {[0,1,2].map(i => (
                <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--color-gold)', opacity: 0.6, animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />
              ))}
            </div>
          </div>
        )}

        {/* Error / limit message */}
        {error && (
          <div style={{
            backgroundColor: isLimitReached ? 'rgba(139,110,62,0.08)' : 'rgba(220,53,69,0.1)',
            border: `1px solid ${isLimitReached ? 'rgba(139,110,62,0.3)' : 'rgba(220,53,69,0.3)'}`,
            borderRadius: '12px',
            padding: '16px 18px',
            marginBottom: '16px',
            maxWidth: '520px',
          }}>
            <p style={{ color: isLimitReached ? 'var(--color-gold-muted)' : '#ff6b6b', fontSize: '0.88rem', lineHeight: 1.7, margin: 0 }}>
              {error}
            </p>
            {isLimitReached && status?.plan !== 'annual' && (
              <div style={{ marginTop: '12px' }}>
                <button
                  onClick={() => navigate('/zusatzanalysen')}
                  style={{ backgroundColor: 'var(--color-gold)', color: '#000', border: 'none', borderRadius: '20px', padding: '8px 16px', fontSize: '0.82rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
                >
                  Analysen ansehen →
                </button>
              </div>
            )}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ borderTop: '1px solid var(--border)', padding: m ? '12px 16px' : '16px 32px', paddingBottom: m ? 'calc(12px + env(safe-area-inset-bottom, 0px))' : '16px', flexShrink: 0, backgroundColor: 'var(--color-bg-deep)' }}>
        {isLimitReached ? (
          <div style={{ textAlign: 'center', padding: '8px', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
            Tageslimit erreicht. Morgen stehen dir wieder Fragen zur Verfügung.
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', maxWidth: '800px' }}>
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Frag Maya..."
                rows={1}
                style={{
                  flex: 1,
                  backgroundColor: 'var(--color-bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  color: 'var(--color-text-primary)',
                  fontSize: '0.9rem',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 300,
                  resize: 'none',
                  lineHeight: 1.6,
                  outline: 'none',
                  minHeight: '44px',
                  maxHeight: '120px',
                  overflowY: 'auto',
                }}
                onInput={e => {
                  e.target.style.height = 'auto'
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
                }}
              />
              <button
                onClick={() => send()}
                disabled={!input.trim() || loading}
                style={{
                  backgroundColor: input.trim() && !loading ? 'var(--color-gold)' : 'var(--color-bg-card)',
                  color: input.trim() && !loading ? '#000' : 'var(--color-text-muted)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  padding: '12px 18px',
                  fontWeight: 500,
                  fontSize: '0.88rem',
                  cursor: input.trim() && !loading ? 'pointer' : 'default',
                  fontFamily: 'Inter, sans-serif',
                  flexShrink: 0,
                  transition: 'background-color 0.2s',
                }}
              >
                →
              </button>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: '8px', opacity: 0.6 }}>
              Enter zum Senden · Shift+Enter für neue Zeile
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  )
}
