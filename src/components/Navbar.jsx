import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'

export default function Navbar() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      height: '60px',
      backgroundColor: 'var(--color-bg-deep)',
      backdropFilter: 'blur(8px)',
      borderBottom: '1px solid rgba(139,110,62,0.3)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 24px',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/" style={{
          color: 'var(--color-gold)',
          fontSize: '0.85rem',
          fontWeight: 500,
          letterSpacing: '0.15em',
          textDecoration: 'none',
        }}>
          BEWUSSTSEIN.OHNE.LIMIT.
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {user ? (
            <>
              <Link to="/dashboard" style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', textDecoration: 'none' }}>
                Dashboard
              </Link>
              <button onClick={handleSignOut} style={{
                color: 'var(--color-text-muted)',
                fontSize: '0.85rem',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}>
                Abmelden
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', textDecoration: 'none' }}>
                Anmelden
              </Link>
              <Link to="/registrieren" style={{
                backgroundColor: 'var(--color-gold)',
                color: '#000',
                padding: '8px 18px',
                borderRadius: '4px',
                fontSize: '0.85rem',
                fontWeight: 500,
                textDecoration: 'none',
              }}>
                Jetzt starten
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
