import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signIn(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError('E-Mail oder Passwort ist falsch. Bitte versuche es erneut.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg-deep)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ color: 'var(--color-gold)', fontSize: '0.85rem', fontWeight: 500, letterSpacing: '0.15em', marginBottom: '24px' }}>
            BEWUSSTSEIN.OHNE.LIMIT
          </div>
          <h1 style={{ color: 'var(--color-gold)', fontWeight: 300, fontSize: '1.8rem', margin: 0 }}>
            Willkommen zurück
          </h1>
        </div>

        <div style={{ backgroundColor: 'var(--color-bg-card)', borderRadius: '4px', padding: '32px', border: '1px solid rgba(139,110,62,0.2)' }}>
          <form onSubmit={handleSubmit}>
            {error && (
              <div style={{ backgroundColor: 'rgba(220,53,69,0.1)', border: '1px solid rgba(220,53,69,0.3)', borderRadius: '4px', padding: '12px', marginBottom: '20px', color: '#ff6b6b', fontSize: '0.85rem' }}>
                {error}
              </div>
            )}

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', color: 'var(--color-text-muted)', fontSize: '0.8rem', marginBottom: '8px', fontWeight: 500 }}>
                E-Mail
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                style={inputStyle}
                placeholder="deine@email.de"
              />
            </div>

            <div style={{ marginBottom: '28px' }}>
              <label style={{ display: 'block', color: 'var(--color-text-muted)', fontSize: '0.8rem', marginBottom: '8px', fontWeight: 500 }}>
                Passwort
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                style={inputStyle}
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                backgroundColor: 'var(--color-gold)',
                color: '#000',
                border: 'none',
                borderRadius: '4px',
                padding: '14px',
                fontWeight: 500,
                fontSize: '0.95rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                transition: 'all 0.15s ease',
              }}
            >
              {loading ? 'Wird angemeldet...' : 'Anmelden'}
            </button>
          </form>

          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <Link to="/registrieren" style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', textDecoration: 'none' }}>
              Noch kein Konto? <span style={{ color: 'var(--color-gold)' }}>Jetzt registrieren</span>
            </Link>
          </div>
          <div style={{ marginTop: '12px', textAlign: 'center' }}>
            <a href="mailto:hallo@bewusstsein-ohne-limit.de" style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', textDecoration: 'none' }}>
              Passwort vergessen?
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

const inputStyle = {
  width: '100%',
  backgroundColor: 'var(--color-bg-light)',
  border: '1px solid rgba(139,110,62,0.3)',
  borderRadius: '4px',
  padding: '12px 14px',
  color: 'var(--color-text-primary)',
  fontSize: '0.9rem',
  outline: 'none',
  boxSizing: 'border-box',
}
