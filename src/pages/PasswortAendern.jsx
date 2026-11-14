import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../hooks/useAuth.jsx'

export default function PasswortAendern() {
  const { user, profile, updateProfile } = useAuth()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (password.length < 8) { setError('Das Passwort muss mindestens 8 Zeichen haben.'); return }
    if (password !== confirm) { setError('Die Passwörter stimmen nicht überein.'); return }
    setSaving(true); setError('')
    try {
      const { error: pwErr } = await supabase.auth.updateUser({ password })
      if (pwErr) throw pwErr
      await supabase.from('profiles').update({ must_change_password: false }).eq('id', user.id)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg-deep)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      fontFamily: 'Inter, sans-serif',
    }}>
      <div style={{ maxWidth: '420px', width: '100%' }}>
        <div style={{ fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--accent)', marginBottom: '8px' }}>
          Sicherheit
        </div>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 300, color: 'var(--text-1)', marginBottom: '12px' }}>
          Neues Passwort festlegen
        </h1>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-2)', lineHeight: 1.7, marginBottom: '32px' }}>
          Dein Passwort wurde zurückgesetzt. Bitte lege jetzt ein eigenes Passwort fest, bevor du weitermachen kannst.
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-2)', marginBottom: '8px' }}>
              Neues Passwort
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Mindestens 8 Zeichen"
              autoFocus
              style={{
                width: '100%', boxSizing: 'border-box',
                backgroundColor: 'var(--bg-input, var(--bg-card))',
                border: '1px solid var(--border)',
                borderRadius: '3px',
                padding: '11px 14px',
                color: 'var(--text-1)',
                fontSize: '0.92rem',
                fontFamily: 'Inter, sans-serif',
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-2)', marginBottom: '8px' }}>
              Passwort bestätigen
            </label>
            <input
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="Passwort wiederholen"
              style={{
                width: '100%', boxSizing: 'border-box',
                backgroundColor: 'var(--bg-input, var(--bg-card))',
                border: '1px solid var(--border)',
                borderRadius: '3px',
                padding: '11px 14px',
                color: 'var(--text-1)',
                fontSize: '0.92rem',
                fontFamily: 'Inter, sans-serif',
              }}
            />
          </div>

          {error && (
            <div style={{ padding: '10px 14px', backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '3px', color: '#ef4444', fontSize: '0.85rem', marginBottom: '20px' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={saving || !password || !confirm}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: 'var(--accent)',
              color: '#000',
              border: 'none',
              borderRadius: '3px',
              fontSize: '0.92rem',
              fontWeight: 600,
              cursor: saving || !password || !confirm ? 'not-allowed' : 'pointer',
              opacity: saving || !password || !confirm ? 0.6 : 1,
              fontFamily: 'Inter, sans-serif',
            }}
          >
            {saving ? 'Wird gespeichert…' : 'Passwort speichern'}
          </button>
        </form>
      </div>
    </div>
  )
}
