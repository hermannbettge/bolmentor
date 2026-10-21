import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'

const ANALYSE_LABELS = {
  business: 'Business', health: 'Gesundheit', family: 'Familie',
  selfexpression: 'Selbstausdruck', finance: 'Finanzen', career: 'Karriere',
  lifephases: 'Lebensphasen', partnership: 'Partnerschaft', compatibility: 'Kompatibilität',
}

const CREAM = '#F4EFE6'
const DEEP = '#1A1410'
const COPPER = '#A0522D'
const TEXT_MID = '#5A4E42'
const TEXT_LIGHT = '#8C7E72'

function NavItem({ to, label, indent = false }) {
  return (
    <NavLink
      to={to}
      style={({ isActive }) => ({
        display: 'block',
        padding: indent ? '8px 24px 8px 36px' : '11px 24px',
        textDecoration: 'none',
        fontSize: indent ? '0.82rem' : '0.88rem',
        color: isActive ? COPPER : indent ? TEXT_LIGHT : TEXT_MID,
        backgroundColor: isActive ? 'rgba(160,82,45,0.07)' : 'transparent',
        borderRight: isActive ? `2px solid ${COPPER}` : '2px solid transparent',
        fontWeight: isActive ? 500 : 300,
        transition: 'color 0.15s',
      })}
    >
      {label}
    </NavLink>
  )
}

export default function Sidebar() {
  const { profile, signOut } = useAuth()
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
      backgroundColor: '#F0E9DC',
      borderRight: '1px solid rgba(42,32,24,0.1)',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      top: 0, left: 0,
      zIndex: 40,
      fontFamily: 'Inter, sans-serif',
    }}>
      <div style={{ padding: '28px 24px 24px' }}>
        <NavLink to="/dashboard" style={{ textDecoration: 'none' }}>
          <span style={{ color: COPPER, fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.18em', lineHeight: 1.6 }}>
            BEWUSSTSEIN.<br />OHNE.LIMIT
          </span>
        </NavLink>
      </div>

      <div style={{ height: '1px', backgroundColor: 'rgba(42,32,24,0.1)', margin: '0 24px' }} />

      <nav style={{ flex: 1, paddingTop: '12px' }}>
        <NavItem to="/tagesenergie" label="Tagesenergie" />
        <NavItem to="/monatsanalyse" label="Monatsanalyse" />

        {purchased.length > 0 && (
          <>
            <div style={{ padding: '16px 24px 6px', fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.18em', color: TEXT_LIGHT }}>
              Meine Analysen
            </div>
            {purchased.map(key => (
              <NavItem key={key} to={`/analyse/${key}`} label={ANALYSE_LABELS[key] || key} indent />
            ))}
          </>
        )}

        <div style={{ height: '1px', backgroundColor: 'rgba(42,32,24,0.08)', margin: '12px 24px' }} />
        <NavItem to="/analysen" label="Alle Analysen" />
        <NavItem to="/profil" label="Profil & Konto" />
        {profile?.is_admin && <NavItem to="/admin" label="Admin" />}
      </nav>

      <div style={{ padding: '20px 24px', borderTop: '1px solid rgba(42,32,24,0.08)' }}>
        <button onClick={handleSignOut} style={{ background: 'none', border: 'none', color: TEXT_LIGHT, fontSize: '0.82rem', cursor: 'pointer', padding: 0 }}>
          Abmelden
        </button>
      </div>
    </aside>
  )
}
