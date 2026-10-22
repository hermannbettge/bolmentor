import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import { useIsMobile } from '../hooks/useIsMobile.js'

export default function Navbar() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const m = useIsMobile()

  async function handleSignOut() {
    await signOut()
    navigate('/')
    setMenuOpen(false)
  }

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      backgroundColor: 'var(--color-bg-deep)',
      backdropFilter: 'blur(8px)',
      borderBottom: '1px solid rgba(139,110,62,0.3)',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/" style={{
          color: 'var(--color-gold)',
          fontSize: '0.78rem',
          fontWeight: 500,
          letterSpacing: '0.12em',
          textDecoration: 'none',
          flexShrink: 0,
        }}>
          BEWUSSTSEIN.OHNE.LIMIT
        </Link>

        {m ? (
          /* Mobile nav */
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {user ? (
              <>
                <Link to="/dashboard" style={{ color: 'var(--color-gold)', fontSize: '0.82rem', textDecoration: 'none', fontWeight: 500 }}>
                  Dashboard
                </Link>
                <button onClick={handleSignOut} style={{ color: 'var(--color-text-muted)', fontSize: '0.82rem', background: 'none', border: 'none', cursor: 'pointer' }}>
                  Abmelden
                </button>
              </>
            ) : (
              <>
                <Link to="/login" style={{ color: 'var(--color-text-muted)', fontSize: '0.82rem', textDecoration: 'none' }}>
                  Anmelden
                </Link>
                <Link to="/registrieren" style={{
                  backgroundColor: 'var(--color-gold)',
                  color: '#000',
                  padding: '7px 14px',
                  borderRadius: '4px',
                  fontSize: '0.82rem',
                  fontWeight: 500,
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                }}>
                  Jetzt starten
                </Link>
              </>
            )}
          </div>
        ) : (
          /* Desktop nav */
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {user ? (
              <>
                <Link to="/dashboard" style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', textDecoration: 'none' }}>
                  Dashboard
                </Link>
                <button onClick={handleSignOut} style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', background: 'none', border: 'none', cursor: 'pointer' }}>
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
        )}
      </div>
    </nav>
  )
}
