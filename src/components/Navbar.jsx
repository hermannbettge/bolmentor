import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import { useIsMobile } from '../hooks/useIsMobile.js'
import { useTheme } from '../hooks/useTheme.jsx'

export default function Navbar() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const m = useIsMobile()
  const { theme, toggle } = useTheme()

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
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: m ? '0 12px' : '0 20px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        <Link to="/" style={{ textDecoration: 'none', flexShrink: 0, display: 'flex', alignItems: 'center' }}>
          <img src="/logo.svg" alt="Bewusstsein.ohne.Limit" style={{ height: m ? '32px' : '38px', display: 'block' }} />
        </Link>

        {m ? (
          /* Mobile nav */
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            {user ? (
              <>
                <button onClick={toggle} style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                  {theme === 'dark' ? '☀' : '☾'}
                </button>
                <Link to="/dashboard" style={{ color: 'var(--color-gold)', fontSize: '0.78rem', textDecoration: 'none', fontWeight: 500 }}>
                  Dashboard
                </Link>
                <button onClick={handleSignOut} style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem', background: 'none', border: 'none', cursor: 'pointer' }}>
                  Abmelden
                </button>
              </>
            ) : (
              <>
                <Link to="/login" style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem', textDecoration: 'none' }}>
                  Anmelden
                </Link>
                <a href="/#pricing" style={{
                  backgroundColor: 'var(--color-gold)',
                  color: '#000',
                  padding: '6px 10px',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                }}>
                  Starten
                </a>
              </>
            )}
          </div>
        ) : (
          /* Desktop nav */
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {user ? (
              <>
                <button onClick={toggle} title={theme === 'dark' ? 'Hell' : 'Dunkel'} style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 2px' }}>
                  {theme === 'dark' ? '☀' : '☾'}
                </button>
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
                <a href="/#pricing" style={{
                  backgroundColor: 'var(--color-gold)',
                  color: '#000',
                  padding: '8px 18px',
                  borderRadius: '4px',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  textDecoration: 'none',
                }}>
                  Jetzt starten
                </a>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
