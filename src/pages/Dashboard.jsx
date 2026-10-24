import { useEffect, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import { supabase } from '../lib/supabase.js'
import { calculateKin, getGermanDate } from '../lib/mayanCalendar.js'

export default function Dashboard() {
  const { profile, refreshProfile } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const claimedRef = useRef(false)

  useEffect(() => {
    if (searchParams.get('checkout') !== 'success') return
    const stripeSession = searchParams.get('stripe_session')
    setSearchParams({}, { replace: true })

    if (!stripeSession || claimedRef.current) return
    claimedRef.current = true

    async function claimAndRefresh() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.access_token) return
        await fetch('/api/stripe/claim-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ session_id: stripeSession }),
        })
      } catch {}
      // Refresh once immediately, then once more after 3s as safety net
      await refreshProfile()
      setTimeout(async () => { await refreshProfile() }, 3000)
    }

    claimAndRefresh()
  }, []) // eslint-disable-line
  const today = getGermanDate()
  const isFirstOfMonth = new Date().getDate() === 1

  let kinData = null
  if (profile?.birth_date) {
    try {
      kinData = calculateKin(profile.birth_date)
    } catch {}
  }

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Guten Morgen'
    if (h < 17) return 'Guten Tag'
    return 'Guten Abend'
  }

  return (
    <div className="app-page">
      <div style={{ marginBottom: '48px' }}>
        <h1 style={{ color: 'var(--color-gold)', fontWeight: 300, fontSize: '2rem', marginBottom: '8px' }}>
          {greeting()}, {profile?.name || 'willkommen'}.
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', margin: 0 }}>
          Heute ist {today.formatted}.
          {kinData && (
            <span> Dein Kin: <span style={{ color: 'var(--color-gold)' }}>Kin {kinData.kin} – {kinData.tone} {kinData.seal}</span></span>
          )}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
        {/* Tagesenergie Card */}
        <Link to="/tagesenergie" style={{ textDecoration: 'none' }}>
          <div style={{
            backgroundColor: 'var(--color-bg-card)',
            border: '1px solid rgba(139,110,62,0.2)',
            borderRadius: '4px',
            padding: '28px 24px',
            transition: 'border-color 0.15s',
            cursor: 'pointer',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(184,151,90,0.5)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(139,110,62,0.2)'}
          >
            <div style={{ fontSize: '2rem', marginBottom: '16px' }}>🌅</div>
            <h3 style={{ color: 'var(--color-gold)', fontWeight: 400, fontSize: '1.1rem', marginBottom: '8px' }}>
              Tagesenergie
            </h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', margin: 0, lineHeight: 1.6 }}>
              Was trägt dieser Tag? Deine persönliche Energie für heute.
            </p>
          </div>
        </Link>

        {/* Monatsanalyse Card */}
        <Link to="/monatsanalyse" style={{ textDecoration: 'none' }}>
          <div style={{
            backgroundColor: 'var(--color-bg-card)',
            border: '1px solid rgba(139,110,62,0.2)',
            borderRadius: '4px',
            padding: '28px 24px',
            position: 'relative',
            transition: 'border-color 0.15s',
            cursor: 'pointer',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(184,151,90,0.5)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(139,110,62,0.2)'}
          >
            {isFirstOfMonth && (
              <div style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                backgroundColor: 'var(--color-gold)',
                color: '#000',
                fontSize: '0.7rem',
                fontWeight: 600,
                padding: '3px 8px',
                borderRadius: '2px',
                letterSpacing: '0.05em',
              }}>
                NEU
              </div>
            )}
            <div style={{ fontSize: '2rem', marginBottom: '16px' }}>📅</div>
            <h3 style={{ color: 'var(--color-gold)', fontWeight: 400, fontSize: '1.1rem', marginBottom: '8px' }}>
              Monatsanalyse
            </h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', margin: 0, lineHeight: 1.6 }}>
              Deine tiefe Analyse für den aktuellen Monat.
            </p>
          </div>
        </Link>
      </div>

      {kinData && (
        <div style={{ marginTop: '48px', padding: '24px', backgroundColor: 'var(--color-bg-card)', borderRadius: '4px', border: '1px solid rgba(139,110,62,0.2)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--color-gold-muted)', marginBottom: '16px' }}>
            Dein kosmischer Fingerabdruck
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
            {[
              { label: 'Kin', value: `Kin ${kinData.kin}` },
              { label: 'Leitsiegel', value: `${kinData.tone} ${kinData.seal}` },
              { label: 'Lebensthema', value: kinData.lifeTheme },
              { label: 'Ton', value: `${kinData.toneNumber} – ${kinData.tone}` },
            ].map(item => (
              <div key={item.label}>
                <div style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', marginBottom: '4px' }}>{item.label}</div>
                <div style={{ color: 'var(--color-text-primary)', fontSize: '0.9rem', fontWeight: 400 }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
