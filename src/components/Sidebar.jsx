import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import { useTheme } from '../hooks/useTheme.jsx'

const ANALYSE_LABELS = {
  business: 'Business', health: 'Gesundheit', family: 'Familie',
  selfexpression: 'Selbstausdruck', finance: 'Finanzen', career: 'Karriere',
  lifephases: 'Lebensphasen', partnership: 'Beziehungsanalyse',
}

function NavItem({ to, label, indent = false }) {
  return (
    <NavLink
      to={to}
      style={({ isActive }) => ({
        display: 'block',
        padding: indent ? '7px 24px 7px 36px' : '10px 24px',
        textDecoration: 'none',
        fontSize: indent ? '0.81rem' : '0.87rem',
        color: isActive ? 'var(--accent)' : indent ? 'var(--text-2)' : 'var(--text-2)',
        backgroundColor: isActive ? 'rgba(var(--accent-rgb, 184,151,90),0.07)' : 'transparent',
        borderRight: isActive ? '2px solid var(--accent)' : '2px solid transparent',
        fontWeight: isActive ? 500 : 300,
        transition: 'color 0.15s',
        fontFamily: 'Inter, sans-serif',
      })}
    >
      {label}
    </NavLink>
  )
}

export default function Sidebar() {
  const { profile, signOut } = useAuth()
  const { theme, toggle } = useTheme()
  const navigate = useNavigate()
  const purchased = profile?.purchased_analyses || []

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  return (
    <aside style={{
      width: '220px',
      minHeight: '100vh',
      backgroundColor: 'var(--sidebar-bg)',
      borderRight: '1px solid var(--sidebar-border)',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      top: 0, left: 0,
      zIndex: 40,
      fontFamily: 'Inter, sans-serif',
      transition: 'background-color 0.25s ease, border-color 0.25s ease',
    }}>
      {/* Logo + Theme Toggle */}
      <div style={{ padding: '24px 24px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <NavLink to="/dashboard" style={{ textDecoration: 'none' }}>
          <span style={{ color: 'var(--accent)', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.18em', lineHeight: 1.7 }}>
            BEWUSSTSEIN.<br />OHNE.LIMIT
          </span>
        </NavLink>

        {/* Mond / Sonne Toggle */}
        <button
          onClick={toggle}
          title={theme === 'dark' ? 'Helles Design' : 'Dunkles Design'}
          style={{
            background: 'none',
            border: '1px solid var(--border)',
            borderRadius: '20px',
            padding: '4px 10px',
            cursor: 'pointer',
            fontSize: '0.85rem',
            color: 'var(--text-2)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            transition: 'border-color 0.2s, color 0.2s',
            marginTop: '2px',
            flexShrink: 0,
          }}
        >
          {theme === 'dark' ? '☀' : '☾'}
        </button>
      </div>

      <div style={{ height: '1px', backgroundColor: 'var(--sidebar-border)', margin: '0 24px' }} />

      <nav style={{ flex: 1, paddingTop: '10px' }}>
        <NavItem to="/tagesenergie" label="Tagesenergie" />
        <NavItem to="/monatsanalyse" label="Monatsanalyse" />

        {purchased.filter(k => k !== 'compatibility' && ANALYSE_LABELS[k]).length > 0 && (
          <>
            <div style={{ padding: '14px 24px 4px', fontSize: '0.63rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.18em', color: 'var(--accent-dim)' }}>
              Meine Analysen
            </div>
            {purchased.filter(k => k !== 'compatibility' && ANALYSE_LABELS[k]).map(key => (
              <NavItem key={key} to={`/analyse/${key}`} label={ANALYSE_LABELS[key]} indent />
            ))}
            {purchased.includes('partnership') && profile?.partner_birth_date && (
              <NavItem to="/analyse/partnerschaft" label="Partnerschaftsanalyse" indent />
            )}
          </>
        )}

        <div style={{ height: '1px', backgroundColor: 'var(--sidebar-border)', margin: '10px 24px' }} />
        <NavItem to="/analysen" label="Alle Analysen" />
        <NavItem to="/profil" label="Profil & Konto" />
        {profile?.is_admin && <NavItem to="/admin" label="Admin" />}
      </nav>

      <div style={{ padding: '16px 24px', borderTop: '1px solid var(--sidebar-border)' }}>
        <button onClick={handleSignOut} style={{ background: 'none', border: 'none', color: 'var(--text-2)', fontSize: '0.82rem', cursor: 'pointer', padding: 0 }}>
          Abmelden
        </button>
      </div>
    </aside>
  )
}
