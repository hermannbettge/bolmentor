import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { redirectToCheckout, redirectToGuestCheckout } from '../lib/stripe.js'
import { useAuth } from '../hooks/useAuth.jsx'

const isIntro = new Date() < new Date('2027-01-01T00:00:00Z')
const analysisPrice = isIntro ? '7 € / Monat' : '9 € / Monat'
const analysisNote = isIntro ? 'Einführungspreis bis 31.12.2026, danach 9 € / Monat. Jederzeit kündbar.' : '9 € / Monat. Jederzeit kündbar.'

const PRODUCTS = [
  { key: 'membershipMonthly', label: 'Monatsmitgliedschaft', price: isIntro ? '17 € / Monat' : '27 € / Monat', desc: isIntro ? 'Einführungspreis bis 31.12.2026, danach 27 € / Monat. Jederzeit kündbar.' : '27 € / Monat. Jederzeit kündbar.' },
  { key: 'membershipAnnual',  label: 'Jahrestarif', price: isIntro ? '170 € / Jahr' : '270 € / Jahr', desc: isIntro ? 'Einführungspreis bis 31.12.2026 (14,17 € / Monat). Danach 270 € / Jahr.' : '270 € / Jahr (22,50 € / Monat).' },
  { key: 'business',         label: 'Business-Analyse', price: analysisPrice, desc: analysisNote },
  { key: 'health',           label: 'Gesundheitsanalyse', price: analysisPrice, desc: analysisNote },
  { key: 'family',           label: 'Familienanalyse', price: analysisPrice, desc: analysisNote },
  { key: 'selfexpression',   label: 'Selbstausdruck-Analyse', price: analysisPrice, desc: analysisNote },
  { key: 'finance',          label: 'Finanzanalyse', price: analysisPrice, desc: analysisNote },
  { key: 'career',           label: 'Karriere-Analyse', price: analysisPrice, desc: analysisNote },
  { key: 'lifephases',       label: 'Lebensphasen-Analyse', price: analysisPrice, desc: analysisNote },
  { key: 'relationship',     label: 'Beziehungsmuster', price: analysisPrice, desc: analysisNote },
  { key: 'partnership',      label: 'Partnerschaftsanalyse', price: analysisPrice, desc: analysisNote },
  { key: 'events',           label: 'Ereignis-Analysen', price: analysisPrice, desc: analysisNote },
]

const MEMBERSHIP_KEYS = ['membershipMonthly', 'membershipAnnual']

export default function Checkout() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const productKey = params.get('product')
  const product = PRODUCTS.find(p => p.key === productKey)
  const isAnalysis = product && !MEMBERSHIP_KEYS.includes(productKey)
  const hasMembership = profile?.membership_active || profile?.is_admin

  async function handleCheckout() {
    setLoading(true)
    setError('')
    // Non-members buying an analysis must get membership first
    const keyToCheckout = (isAnalysis && !hasMembership) ? 'membershipMonthly' : productKey
    try {
      if (user) {
        await redirectToCheckout(keyToCheckout)
      } else {
        await redirectToGuestCheckout(keyToCheckout)
      }
    } catch (e) {
      setError(e.message)
      setLoading(false)
    }
  }

  if (!productKey || !product) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-bg-deep)', padding: '24px' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ color: 'var(--color-gold)', fontWeight: 300, fontSize: '1.8rem', marginBottom: '24px' }}>Produkt nicht gefunden</h1>
          <button onClick={() => navigate('/analysen')} style={{ border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-2)', padding: '10px 24px', borderRadius: '40px', cursor: 'pointer', fontSize: '0.88rem' }}>
            Zurück zu den Analysen
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 24px',
      backgroundColor: 'var(--color-bg-deep)',
    }}>
      <div style={{ width: '100%', maxWidth: '480px' }}>
        <div style={{ fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--accent)', marginBottom: '8px' }}>
          Checkout
        </div>
        <h1 style={{ fontFamily: '"Playfair Display", serif', fontWeight: 400, fontSize: '2rem', color: 'var(--text-1)', marginBottom: '8px', lineHeight: 1.3 }}>
          {product.label}
        </h1>
        <p style={{ color: 'var(--text-2)', fontSize: '0.9rem', marginBottom: '32px', lineHeight: 1.75 }}>
          {product.desc}
        </p>

        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '24px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isAnalysis && !hasMembership ? '12px' : '0' }}>
            <span style={{ color: 'var(--text-1)', fontWeight: 500 }}>{product.label}</span>
            <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{product.price}</span>
          </div>

          {isAnalysis && !hasMembership && (
            <>
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ color: 'var(--text-2)', fontSize: '0.88rem' }}>Monatsmitgliedschaft (erforderlich)</span>
                <span style={{ color: 'var(--accent)', fontWeight: 500, fontSize: '0.88rem' }}>{isIntro ? '17 € / Monat' : '27 € / Monat'}</span>
              </div>
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-1)', fontWeight: 600 }}>Gesamt</span>
                <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{isIntro ? `${7 + 17} € / Monat` : `${9 + 27} € / Monat`}</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-2)', marginTop: '10px', lineHeight: 1.5 }}>
                Die Mitgliedschaft wird separat als erster Schritt abgeschlossen. Nach der Registrierung kannst du die Analyse direkt buchen.
              </p>
            </>
          )}

          {profile?.email && (
            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)', color: 'var(--text-2)', fontSize: '0.85rem' }}>
              Konto: {profile.email}
            </div>
          )}
        </div>

        {error && (
          <div style={{ backgroundColor: 'rgba(220,53,69,0.1)', border: '1px solid rgba(220,53,69,0.3)', borderRadius: '4px', padding: '12px', marginBottom: '20px', color: '#ff6b6b', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        <button
          onClick={handleCheckout}
          disabled={loading}
          style={{
            width: '100%',
            backgroundColor: loading ? 'transparent' : 'var(--accent)',
            color: loading ? 'var(--accent)' : '#fff',
            border: loading ? '1px solid var(--accent)' : 'none',
            borderRadius: '40px',
            padding: '16px 32px',
            fontWeight: 600,
            fontSize: '1rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          {loading ? 'Weiterleitung zu Stripe...' : isAnalysis && !hasMembership ? 'Mitgliedschaft + Analyse buchen →' : 'Jetzt sicher bezahlen →'}
        </button>

        <p style={{ color: 'var(--text-2)', fontSize: '0.78rem', marginTop: '16px', textAlign: 'center', lineHeight: 1.6 }}>
          Sichere Zahlung über Stripe. Du wirst auf die Stripe-Zahlungsseite weitergeleitet.
        </p>
      </div>
    </div>
  )
}
