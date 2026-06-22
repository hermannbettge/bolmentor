import { NavLink } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '/tagesenergie', icon: '🌅', label: 'Heute' },
  { to: '/monatsanalyse', icon: '📅', label: 'Monat' },
  { to: '/analysen', icon: '📊', label: 'Analysen' },
  { to: '/profil', icon: '👤', label: 'Profil' },
]

export default function BottomNav() {
  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: '70px',
      backgroundColor: 'var(--color-bg-card)',
      borderTop: '1px solid rgba(139,110,62,0.3)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
      zIndex: 50,
    }}>
      {NAV_ITEMS.map(item => (
        <NavLink
          key={item.to}
          to={item.to}
          style={({ isActive }) => ({
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            textDecoration: 'none',
            color: isActive ? 'var(--color-gold)' : 'var(--color-text-muted)',
            fontSize: '0.7rem',
            fontWeight: 400,
            padding: '8px 16px',
          })}
        >
          <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}
