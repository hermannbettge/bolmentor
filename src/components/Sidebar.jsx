import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'

const NAV_ITEMS = [
  { to: '/tagesenergie', icon: '🌅', label: 'Tagesenergie' },
  { to: '/monatsanalyse', icon: '📅', label: 'Monatsanalyse' },
  { to: '/analysen', icon: '📊', label: 'Meine Analysen' },
  { to: '/profil', icon: '👤', label: 'Profil & Konto' },
]

export default function Sidebar() {
  const { signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  return (
    <aside style={{
      width: '240px',
      minHeight: '100vh',
      backgroundColor: 'var(--color-bg-card)',
      borderRight: '1px solid rgba(139,110,62,0.2)',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 0',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 40,
    }}>
      <div style={{ padding: '0 24px 32px' }}>
        <NavLink to="/dashboard" style={{ textDecoration: 'none' }}>
          <span style={{
            color: 'var(--color-gold)',
            fontSize: '0.8rem',
            fontWeight: 500,
            letterSpacing: '0.15em',
          }}>
            BEWUSSTSEIN.<br />OHNE.LIMIT.
          </span>
        </NavLink>
      </div>

      <nav style={{ flex: 1 }}>
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 24px',
              textDecoration: 'none',
              fontSize: '0.9rem',
              color: isActive ? 'var(--color-gold)' : 'var(--color-text-muted)',
              backgroundColor: isActive ? 'rgba(184,151,90,0.08)' : 'transparent',
              borderRight: isActive ? '2px solid var(--color-gold)' : '2px solid transparent',
              transition: 'all 0.15s ease',
              fontWeight: isActive ? 400 : 300,
            })}
          >
            <span style={{ fontSize: '1rem' }}>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div style={{ padding: '24px' }}>
        <button
          onClick={handleSignOut}
          style={{
            color: 'var(--color-text-muted)',
            fontSize: '0.85rem',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          Abmelden
        </button>
      </div>
    </aside>
  )
}
