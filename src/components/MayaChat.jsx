import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import { useIsMobile } from '../hooks/useIsMobile.js'
import { supabase } from '../lib/supabase.js'

const SUGGESTIONS = [
  'Was bedeutet meine Energie heute?',
  'Wie gehe ich am besten mit Konflikten um?',
  'Welche Stärken bringt mein Kin mit?',
  'Wie finde ich meinen Lebensweg?',
  'Was ist meine größte Herausforderung?',
]

const WELCOME = {
  role: 'assistant',
  content: 'Ich bin MAYA, deine persönliche Maya-Kalender-KI. Ich kenne dein vollständiges Profil und beantworte all deine Fragen rund um deine Energie, dein Kin und deinen Lebensweg. Was möchtest du wissen?',
}

function todayDate() { return new Date().toISOString().split('T')[0] }

async function loadSessionFromDB(userId) {
  try {
    const date = todayDate()
    const { data } = await supabase
      .from('chat_sessions')
      .select('messages')
      .eq('user_id', userId)
      .eq('session_date', date)
      .single()
    if (data?.messages?.length > 0) return data.messages
  } catch {}
  return null
}

async function saveSessionToDB(userId, messages) {
  try {
    const date = todayDate()
    await supabase.from('chat_sessions').upsert({
      user_id: userId,
      session_date: date,
      messages,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,session_date' })
  } catch {}
}

export default function MayaChat() {
  const { user, profile } = useAuth()
  const isMobile = useIsMobile()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([WELCOME])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionLoaded, setSessionLoaded] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  // Load today's session from DB when chat opens for the first time
  useEffect(() => {
    if (!user || sessionLoaded) return
    setSessionLoaded(true)
    loadSessionFromDB(user.id).then(msgs => {
      if (msgs) setMessages(msgs)
    })
  }, [user, sessionLoaded])

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [messages, open])

  const userMessageCount = messages.filter(m => m.role === 'user').length
  const chatLimit = profile?.chat_messages_limit ?? null
  const limitReached = chatLimit !== null && userMessageCount >= chatLimit

  async function send(text) {
    const question = text || input.trim()
    if (!question || loading || limitReached) return
    setInput('')
    setError('')

    const newMessages = [...messages, { role: 'user', content: question }]
    setMessages(newMessages)
    setLoading(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ messages: newMessages }),
      })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error) }
      const data = await res.json()
      const withReply = [...newMessages, { role: 'assistant', content: data.reply }]
      setMessages(withReply)
      // Persist to DB after each exchange
      if (user) saveSessionToDB(user.id, withReply)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function clearChat() {
    const fresh = [WELCOME]
    setMessages(fresh)
    if (user) await saveSessionToDB(user.id, fresh)
  }

  if (!user || isMobile) return null

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        title="Maya KI befragen"
        style={{
          position: 'fixed', bottom: '28px', right: '28px', zIndex: 1000,
          width: '56px', height: '56px', borderRadius: '50%',
          backgroundColor: 'var(--accent)', border: 'none',
          boxShadow: '0 4px 20px rgba(160,82,45,0.45)',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.4rem', transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08)'; e.currentTarget.style.boxShadow = '0 6px 28px rgba(160,82,45,0.6)' }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(160,82,45,0.45)' }}
      >
        {open ? '✕' : '✦'}
      </button>

      {/* Chat panel */}
      {open && (
        <div style={{
          position: 'fixed', bottom: '96px', right: '28px', zIndex: 999,
          width: '380px', maxWidth: 'calc(100vw - 40px)',
          height: '560px', maxHeight: 'calc(100vh - 120px)',
          backgroundColor: 'var(--bg-deep)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          boxShadow: '0 16px 48px rgba(0,0,0,0.35)',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
          animation: 'chatSlideIn 0.22s ease',
        }}>
          <style>{`
            @keyframes chatSlideIn {
              from { opacity: 0; transform: translateY(16px) scale(0.97); }
              to   { opacity: 1; transform: translateY(0) scale(1); }
            }
          `}</style>

          {/* Header */}
          <div style={{
            padding: '14px 16px', borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', gap: '12px',
            backgroundColor: 'var(--bg-card)',
          }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              backgroundColor: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1rem', flexShrink: 0,
            }}>✦</div>
            <div>
              <div style={{ color: 'var(--text-1)', fontWeight: 500, fontSize: '0.92rem' }}>MAYA</div>
              <div style={{ color: 'var(--text-2)', fontSize: '0.74rem' }}>Deine persönliche Maya-KI</div>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                onClick={() => { setOpen(false); navigate('/chat-verlauf') }}
                title="Chat-Verlauf"
                style={{ background: 'none', border: 'none', color: 'var(--text-2)', cursor: 'pointer', fontSize: '0.75rem', padding: '4px 8px', borderRadius: '4px' }}
              >
                Verlauf
              </button>
              <button
                onClick={clearChat}
                style={{ background: 'none', border: 'none', color: 'var(--text-2)', cursor: 'pointer', fontSize: '0.75rem', padding: '4px 8px', borderRadius: '4px' }}
              >
                Leeren
              </button>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '85%', padding: '10px 14px',
                  borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  backgroundColor: m.role === 'user' ? 'var(--accent)' : 'var(--bg-card)',
                  color: m.role === 'user' ? 'var(--bg-deep)' : 'var(--text-1)',
                  fontSize: '0.875rem', lineHeight: 1.65,
                  border: m.role === 'assistant' ? '1px solid var(--border)' : 'none',
                  whiteSpace: 'pre-wrap',
                }}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{
                  padding: '10px 16px', borderRadius: '16px 16px 16px 4px',
                  backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)',
                  color: 'var(--text-2)', fontSize: '0.875rem',
                }}>
                  <span style={{ letterSpacing: '0.2em', animation: 'pulse 1.2s infinite' }}>···</span>
                </div>
              </div>
            )}
            {error && (
              <div style={{ fontSize: '0.8rem', color: '#c0392b', textAlign: 'center', padding: '4px' }}>{error}</div>
            )}

            {/* Suggestion chips — only at start */}
            {messages.length === 1 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                {SUGGESTIONS.map(s => (
                  <button key={s} onClick={() => send(s)} style={{
                    backgroundColor: 'transparent', border: '1px solid var(--border)',
                    color: 'var(--text-2)', borderRadius: '20px', padding: '5px 12px',
                    fontSize: '0.75rem', cursor: 'pointer',
                    transition: 'border-color 0.15s, color 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-2)' }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', backgroundColor: 'var(--bg-card)' }}>
            {limitReached ? (
              <div style={{ textAlign: 'center', color: 'var(--text-2)', fontSize: '0.8rem', padding: '8px 0' }}>
                Du hast dein Chat-Limit von {chatLimit} {chatLimit === 1 ? 'Nachricht' : 'Nachrichten'} erreicht.
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
                  placeholder="Frage MAYA etwas…"
                  disabled={loading}
                  style={{
                    flex: 1, backgroundColor: 'var(--bg-deep)', border: '1px solid var(--border)',
                    borderRadius: '20px', padding: '9px 16px', color: 'var(--text-1)',
                    fontSize: '0.875rem', outline: 'none',
                  }}
                />
                <button
                  onClick={() => send()}
                  disabled={loading || !input.trim()}
                  style={{
                    backgroundColor: input.trim() && !loading ? 'var(--accent)' : 'var(--border)',
                    color: input.trim() && !loading ? 'var(--bg-deep)' : 'var(--text-2)',
                    border: 'none', borderRadius: '50%', width: '38px', height: '38px',
                    cursor: input.trim() && !loading ? 'pointer' : 'default',
                    fontSize: '1rem', transition: 'background-color 0.15s',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}
                >
                  ↑
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
