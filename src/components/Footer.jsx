import { Link } from 'react-router-dom'
import { redirectToCustomerPortal } from '../lib/stripe.js'
import { useAuth } from '../hooks/useAuth.jsx'

export default function Footer() {
  const { user } = useAuth()

  async function handleCancel() {
    try {
      await redirectToCustomerPortal()
    } catch (e) {
      alert(e.message)
    }
  }

  return (
    <footer style={{
      backgroundColor: 'var(--color-bg-deep)',
      borderTop: '1px solid rgba(139,110,62,0.3)',
      padding: '48px 24px',
      textAlign: 'center',
    }}>
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        <div style={{
          color: 'var(--color-gold)',
          fontSize: '0.85rem',
          fontWeight: 500,
          letterSpacing: '0.15em',
          marginBottom: '20px',
        }}>
          BEWUSSTSEIN.OHNE.LIMIT
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <Link to="/impressum" style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', textDecoration: 'none' }}>
            Impressum
          </Link>
          <Link to="/datenschutz" style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', textDecoration: 'none' }}>
            Datenschutz
          </Link>
          <a href="mailto:hallo@bewusstsein-ohne-limit.de" style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', textDecoration: 'none' }}>
            Kontakt
          </a>
          {user && (
            <button onClick={handleCancel} style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}>
              Mitgliedschaft kündigen
            </button>
          )}
        </div>

        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', margin: 0 }}>
          © 2025 Bewusstsein.ohne.Limit. Alle Rechte vorbehalten.
        </p>
      </div>
    </footer>
  )
}
