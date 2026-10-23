import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { redirectToCheckout, PRICES } from '../lib/stripe.js'
import { useAuth } from '../hooks/useAuth.jsx'

const PRODUCTS = [
  { key: 'membershipMonthly', label: 'Monatsmitgliedschaft', price: '17 € / Monat', desc: 'Einführungspreis bis 31.12.2026, danach 27 € / Monat. Jederzeit kündbar.' },
  { key: 'membershipAnnual',  label: 'Jahrestarif', price: '170 € / Jahr', desc: 'Einführungspreis bis 31.12.2026 (entspricht 14,17 € / Monat). Danach 270 € / Jahr.' },
  { key: 'business',         label: 'Business-Analyse', price: '9 € / Monat', desc: 'Deine Chancen, Risiken und optimale Strategie im Beruf. Jederzeit kündbar.' },
  { key: 'health',           label: 'Gesundheitsanalyse', price: '9 € / Monat', desc: 'Deine körperlichen und energetischen Muster. Jederzeit kündbar.' },
  { key: 'family',           label: 'Familienanalyse', price: '9 € / Monat', desc: 'Dynamiken und Themen in deiner Familie. Jederzeit kündbar.' },
  { key: 'selfexpression',   label: 'Selbstausdruck-Analyse', price: '9 € / Monat', desc: 'Deine Gaben und authentische Ausdrucksweise. Jederzeit kündbar.' },
  { key: 'finance',          label: 'Finanzanalyse', price: '9 € / Monat', desc: 'Deine Beziehung zu Geld und Wohlstand. Jederzeit kündbar.' },
  { key: 'career',           label: 'Karriere-Analyse', price: '9 € / Monat', desc: 'Berufung, Timing und optimale Karriereschritte. Jederzeit kündbar.' },
  { key: 'lifephases',       label: 'Lebensphasen-Analyse', price: '9 € / Monat', desc: 'Deine aktuellen und kommenden Lebensphasen. Jederzeit kündbar.' },
  { key: 'relationship',     label: 'Beziehungsmuster', price: '9 € / Monat', desc: 'Eigene Bindungsstile und Beziehungsmuster. Jederzeit kündbar.' },
  { key: 'partnership',      label: 'Partnerschaftsanalyse', price: '9 € / Monat', desc: 'Du und dein Partner, Kompatibilität und Dynamik. Jederzeit kündbar.' },
  { key: 'events',           label: 'Ereignis-Analysen', price: '9 € / Monat', desc: 'Wichtige Daten in deinem Leben verstehen und einordnen. Jederzeit kündbar.' },
]

export default function Checkout() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { profile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const productKey = params.get('product')
  const product = PRODUCTS.find(p => p.key === productKey)

  useEffect(() => {
    if (!productKey) return
    const priceId = PRICES[productKey]
    if (!priceId) setError('Produkt nicht verfügbar. Bitte wende dich an den Support.')
  }, [productKey])

  async function handleCheckout() {
    const priceId = PRICES[productKey]
    if (!priceId) return setError('Produkt-ID nicht konfiguriert. Bitte wende dich an den Support.')
    setLoading(true)
    setError('')
    try {
      await redirectToCheckout(priceId)
    } catch (e) {
      setError(e.message)
      setLoading(false)
    }
  }

  if (!productKey || !product) {
    return (
      <div style={{ padding: '48px 40px', maxWidth: '600px' }}>
        <h1 style={{ color: 'var(--accent)', fontWeight: 300, fontSize: '1.8rem', marginBottom: '24px' }}>Produkt nicht gefunden</h1>
        <button onClick={() => navigate('/analysen')} style={{ border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-2)', padding: '10px 24px', borderRadius: '40px', cursor: 'pointer', fontSize: '0.88rem' }}>
          Zurück zu den Analysen
        </button>
      </div>
    )
  }

  return (
    <div style={{ padding: '48px 40px', maxWidth: '480px' }}>
      <div style={{ fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--accent)', marginBottom: '8px' }}>
        Checkout
      </div>
      <h1 style={{ fontFamily: '"Playfair Display", serif', fontWeight: 400, fontSize: '2rem', color: 'var(--text-1)', marginBottom: '8px', lineHeight: 1.3 }}>
        {product.label}
      </h1>
      <p style={{ color: 'var(--text-2)', fontSize: '0.9rem', marginBottom: '32px', lineHeight: 1.75 }}>
        {product.desc}
      </p>

      <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '24px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'var(--text-1)', fontWeight: 500 }}>{product.label}</span>
          <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{product.price}</span>
        </div>
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
        disabled={loading || !!error}
        style={{
          width: '100%',
          backgroundColor: loading || error ? 'transparent' : 'var(--accent)',
          color: loading || error ? 'var(--accent)' : '#000',
          border: loading || error ? '1px solid var(--accent)' : 'none',
          borderRadius: '40px',
          padding: '16px 32px',
          fontWeight: 600,
          fontSize: '1rem',
          cursor: loading || error ? 'not-allowed' : 'pointer',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        {loading ? 'Weiterleitung zu Stripe...' : 'Jetzt sicher bezahlen →'}
      </button>

      <p style={{ color: 'var(--text-2)', fontSize: '0.78rem', marginTop: '16px', textAlign: 'center', lineHeight: 1.6 }}>
        Sichere Zahlung über Stripe. Du wirst auf die Stripe-Zahlungsseite weitergeleitet.
      </p>
    </div>
  )
}
