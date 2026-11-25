import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'

export default function PasswortSetzen() {
  const navigate = useNavigate()
  const [phase, setPhase] = useState('waiting') // waiting | ready | success | error | expired
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [saving, setSaving] = useState(false)
  const [fieldError, setFieldError] = useState('')
  const [serverError, setServerError] = useState('')

  useEffect(() => {
    // Supabase processes the hash fragment automatically and fires onAuthStateChange.
    // PASSWORD_RECOVERY = password reset link; SIGNED_IN with invite token also works.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        setPhase('ready')
      }
    })

    // Also handle the case where the session was already set before this effect ran.
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) { setPhase('expired'); return }
      if (session) setPhase('ready')
    })

    return () => subscription.unsubscribe()
  }, [])

  // Timeout: if no session arrives within 8s, show expired state
  useEffect(() => {
    if (phase !== 'waiting') return
    const t = setTimeout(() => setPhase('expired'), 8000)
    return () => clearTimeout(t)
  }, [phase])

  async function handleSubmit(e) {
    e.preventDefault()
    if (password.length < 8) { setFieldError('Das Passwort muss mindestens 8 Zeichen haben.'); return }
    if (password !== confirm) { setFieldError('Die Passwörter stimmen nicht überein.'); return }
    setFieldError('')
    setSaving(true)
    setServerError('')
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) {
        if (error.message?.toLowerCase().includes('expired') || error.message?.toLowerCase().includes('invalid')) {
          setPhase('expired')
        } else {
          setServerError(error.message)
        }
        return
      }
      setPhase('success')
      setTimeout(() => navigate('/dashboard', { replace: true }), 2000)
    } catch (err) {
      setServerError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const outer = {
    minHeight: '100vh',
    backgroundColor: 'var(--bg-deep)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    fontFamily: 'Inter, sans-serif',
  }

  const card = { maxWidth: '420px', width: '100%' }

  const label = {
    display: 'block', fontSize: '0.75rem', fontWeight: 600,
    textTransform: 'uppercase', letterSpacing: '0.12em',
    color: 'var(--text-2)', marginBottom: '8px',
  }

  const input = {
    width: '100%', boxSizing: 'border-box',
    backgroundColor: 'var(--bg-input, var(--bg-card))',
    border: '1px solid var(--border)', borderRadius: '3px',
    padding: '11px 14px', color: 'var(--text-1)',
    fontSize: '0.92rem', fontFamily: 'Inter, sans-serif',
  }

  if (phase === 'waiting') {
    return (
      <div style={outer}>
        <div style={card}>
          <div style={{ fontSize: '0.88rem', color: 'var(--text-2)', textAlign: 'center' }}>
            Zugang wird überprüft …
          </div>
        </div>
      </div>
    )
  }

  if (phase === 'expired') {
    return (
      <div style={outer}>
        <div style={card}>
          <div style={{ fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--accent)', marginBottom: '8px' }}>
            Link abgelaufen
          </div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 300, color: 'var(--text-1)', marginBottom: '12px' }}>
            Dieser Link ist nicht mehr gültig
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-2)', lineHeight: 1.7, marginBottom: '28px' }}>
            Der Link wurde bereits verwendet oder ist abgelaufen. Bitte wende dich an den Administrator, damit eine neue Zugangs-Mail ausgelöst wird.
          </p>
          <button
            onClick={() => navigate('/login', { replace: true })}
            style={{ padding: '12px 24px', backgroundColor: 'rgba(var(--accent-rgb,184,151,90),0.15)', border: '1px solid rgba(var(--accent-rgb,184,151,90),0.4)', color: 'var(--accent)', borderRadius: '3px', cursor: 'pointer', fontSize: '0.9rem', fontFamily: 'Inter, sans-serif' }}
          >
            Zum Login
          </button>
        </div>
      </div>
    )
  }

  if (phase === 'success') {
    return (
      <div style={outer}>
        <div style={card}>
          <div style={{ fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--accent)', marginBottom: '8px' }}>
            Passwort gespeichert
          </div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 300, color: 'var(--text-1)', marginBottom: '12px' }}>
            Dein Passwort wurde festgelegt
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-2)', lineHeight: 1.7 }}>
            Du wirst jetzt zur App weitergeleitet …
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={outer}>
      <div style={card}>
        <div style={{ fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--accent)', marginBottom: '8px' }}>
          Zugang einrichten
        </div>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 300, color: 'var(--text-1)', marginBottom: '12px' }}>
          Passwort festlegen
        </h1>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-2)', lineHeight: 1.7, marginBottom: '32px' }}>
          Lege dein persönliches Passwort fest, um deinen Zugang einzurichten.
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={label}>Neues Passwort</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Mindestens 8 Zeichen"
              autoFocus
              style={input}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={label}>Passwort bestätigen</label>
            <input
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="Passwort wiederholen"
              style={input}
            />
          </div>

          {(fieldError || serverError) && (
            <div style={{ padding: '10px 14px', backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '3px', color: '#ef4444', fontSize: '0.85rem', marginBottom: '20px' }}>
              {fieldError || serverError}
            </div>
          )}

          <button
            type="submit"
            disabled={saving || !password || !confirm}
            style={{
              width: '100%', padding: '14px',
              backgroundColor: 'var(--accent)', color: '#000',
              border: 'none', borderRadius: '3px',
              fontSize: '0.92rem', fontWeight: 600,
              cursor: saving || !password || !confirm ? 'not-allowed' : 'pointer',
              opacity: saving || !password || !confirm ? 0.6 : 1,
              fontFamily: 'Inter, sans-serif',
            }}
          >
            {saving ? 'Wird gespeichert …' : 'Passwort speichern'}
          </button>
        </form>
      </div>
    </div>
  )
}
