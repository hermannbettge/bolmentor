import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'

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

function validateBirthDate(dateStr) {
  const parts = dateStr.split('.')
  if (parts.length !== 3) return false
  const [day, month, year] = parts.map(Number)
  if (!day || !month || !year) return false
  if (day < 1 || day > 31) return false
  if (month < 1 || month > 12) return false
  if (year < 1900 || year > new Date().getFullYear()) return false
  const date = new Date(`${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`)
  return !isNaN(date.getTime())
}

export default function Registrieren() {
  const { signUp, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!validateBirthDate(birthDate)) {
      setError('Bitte gib dein Geburtsdatum im Format TT.MM.JJJJ ein.')
      return
    }

    if (password.length < 8) {
      setError('Das Passwort muss mindestens 8 Zeichen lang sein.')
      return
    }

    setLoading(true)
    try {
      // Convert DD.MM.YYYY to YYYY-MM-DD for storage
      const parts = birthDate.split('.')
      const isoDate = `${parts[2]}-${parts[1].padStart(2,'0')}-${parts[0].padStart(2,'0')}`
      const data = await signUp(email, password, name, isoDate)

      const stripeSession = searchParams.get('stripe_session')
      if (stripeSession && data?.session?.access_token) {
        const claimRes = await fetch('/api/stripe/claim-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${data.session.access_token}`,
          },
          body: JSON.stringify({ session_id: stripeSession }),
        })
        if (!claimRes.ok) {
          const claimErr = await claimRes.json().catch(() => ({}))
          setError(claimErr.error || 'Zahlung konnte nicht zugeordnet werden. Bitte wende dich an den Support.')
          setLoading(false)
          return
        }
        // Reload profile so membership_active is up to date before navigation
        await refreshProfile()
      }

      const redirect = searchParams.get('redirect')
      navigate(redirect || '/dashboard')
    } catch (err) {
      setError(err.message === 'User already registered'
        ? 'Diese E-Mail-Adresse ist bereits registriert.'
        : 'Bei der Registrierung ist ein Fehler aufgetreten. Bitte versuche es erneut.')
    } finally {
      setLoading(false)
    }
  }

  function formatBirthDate(val) {
    const digits = val.replace(/\D/g, '')
    if (digits.length <= 2) return digits
    if (digits.length <= 4) return `${digits.slice(0,2)}.${digits.slice(2)}`
    return `${digits.slice(0,2)}.${digits.slice(2,4)}.${digits.slice(4,8)}`
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg-deep)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ color: 'var(--color-gold)', fontSize: '0.85rem', fontWeight: 500, letterSpacing: '0.15em', marginBottom: '24px' }}>
            BEWUSSTSEIN.OHNE.LIMIT
          </div>
          <h1 style={{ color: 'var(--color-gold)', fontWeight: 300, fontSize: '1.8rem', margin: 0 }}>
            Dein Maya Profil erstellen
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
                Vorname
              </label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required style={inputStyle} placeholder="Dein Vorname" />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', color: 'var(--color-text-muted)', fontSize: '0.8rem', marginBottom: '8px', fontWeight: 500 }}>
                E-Mail
              </label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={inputStyle} placeholder="deine@email.de" />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', color: 'var(--color-text-muted)', fontSize: '0.8rem', marginBottom: '8px', fontWeight: 500 }}>
                Passwort
              </label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={inputStyle} placeholder="Mindestens 8 Zeichen" />
            </div>

            <div style={{ marginBottom: '28px' }}>
              <label style={{ display: 'block', color: 'var(--color-text-muted)', fontSize: '0.8rem', marginBottom: '8px', fontWeight: 500 }}>
                Geburtsdatum (TT.MM.JJJJ)
              </label>
              <input
                type="text"
                value={birthDate}
                onChange={e => setBirthDate(formatBirthDate(e.target.value))}
                required
                style={inputStyle}
                placeholder="26.07.1990"
                maxLength={10}
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
              }}
            >
              {loading ? 'Profil wird erstellt...' : 'Profil erstellen'}
            </button>
          </form>

          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem', marginTop: '20px', textAlign: 'center', lineHeight: 1.6 }}>
            Mit der Registrierung akzeptierst du unsere{' '}
            <Link to="/datenschutz" style={{ color: 'var(--color-gold)', textDecoration: 'none' }}>Datenschutzbestimmungen</Link>.
          </p>

          <div style={{ marginTop: '16px', textAlign: 'center' }}>
            <Link to="/login" style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', textDecoration: 'none' }}>
              Bereits ein Konto? <span style={{ color: 'var(--color-gold)' }}>Anmelden</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
