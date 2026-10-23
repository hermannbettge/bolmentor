import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'

const isIntro = new Date() < new Date('2027-01-01T00:00:00Z')
const SINGLE_PRICE = isIntro ? 7 : 9
const ANNUAL_PRICE = isIntro ? 170 : 270
const ANNUAL_MONTHLY = isIntro ? '14,17' : '22,50'

const ALL_ANALYSES = [
  { key: 'business', label: 'Business-Analyse' },
  { key: 'health', label: 'Gesundheitsanalyse' },
  { key: 'family', label: 'Familienanalyse' },
  { key: 'selfexpression', label: 'Selbstausdruck-Analyse' },
  { key: 'finance', label: 'Finanzanalyse' },
  { key: 'career', label: 'Karriere-Analyse' },
  { key: 'lifephases', label: 'Lebensphasen-Analyse' },
  { key: 'relationship', label: 'Beziehungsmuster' },
  { key: 'partnership', label: 'Partnerschaftsanalyse' },
  { key: 'events', label: 'Ereignis-Analysen' },
]

export default function CheckoutModal({ onClose, preselected = null, mode = 'analysis' }) {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const hasMembership = profile?.membership_active || profile?.is_admin
  const [selected, setSelected] = useState(new Set(preselected ? [preselected] : []))
  const [tab, setTab] = useState(mode === 'annual' ? 'annual' : 'monthly')

  function toggle(key) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(key)) { next.delete(key) } else { next.add(key) }
      return next
    })
  }

  function handleBuy() {
    onClose()
    if (tab === 'annual') {
      navigate(`/checkout?product=membershipAnnual`)
    } else {
      if (selected.size === 0) return
      const key = [...selected][0]
      navigate(`/checkout?product=${key}`)
    }
  }

  const MEMBERSHIP_PRICE = isIntro ? 17 : 27
  const analysisTotal = selected.size * SINGLE_PRICE
  const membershipRequired = !hasMembership && selected.size > 0
  const total = membershipRequired ? analysisTotal + MEMBERSHIP_PRICE : analysisTotal
  const annualSaving = Math.round(total * 12 - ANNUAL_PRICE)

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed', inset: 0, backgroundColor: 'rgba(26,20,16,0.72)', zIndex: 1000,
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      }}
    >
      <div style={{
        backgroundColor: '#F4EFE6', width: '100%', maxWidth: '560px', borderRadius: '16px 16px 0 0',
        padding: '32px 28px 40px', maxHeight: '92vh', overflowY: 'auto',
        fontFamily: 'Inter, sans-serif',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#A0522D' }}>
            {tab === 'annual' ? 'Jahrespaket' : 'Analyse buchen'}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8C7E72', fontSize: '1.4rem', lineHeight: 1, padding: '0 4px' }}>×</button>
        </div>

        {/* Tab switcher */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '28px' }}>
          {[['monthly', 'Einzeln buchen'], ['annual', 'Jahrespaket']].map(([t, label]) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', fontWeight: 500,
                backgroundColor: tab === t ? '#A0522D' : 'rgba(160,82,45,0.1)',
                color: tab === t ? '#FFF8F2' : '#5A4E42',
                transition: 'all 0.15s',
              }}
            >{label}</button>
          ))}
        </div>

        {tab === 'monthly' ? (
          <>
            <p style={{ fontSize: '0.82rem', color: '#5A4E42', marginBottom: '16px', lineHeight: 1.6 }}>
              Wähle die Analysen, die du buchen möchtest. Jede kostet {SINGLE_PRICE} € / Monat, jederzeit kündbar.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '24px' }}>
              {ALL_ANALYSES.map(({ key, label }) => (
                <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', borderRadius: '8px', backgroundColor: selected.has(key) ? 'rgba(160,82,45,0.1)' : 'rgba(42,32,24,0.04)', cursor: 'pointer', border: selected.has(key) ? '1px solid rgba(160,82,45,0.3)' : '1px solid transparent' }}>
                  <input type="checkbox" checked={selected.has(key)} onChange={() => toggle(key)} style={{ accentColor: '#A0522D', width: '16px', height: '16px', cursor: 'pointer' }} />
                  <span style={{ fontSize: '0.88rem', color: '#2A2018', fontWeight: selected.has(key) ? 500 : 400 }}>{label}</span>
                  <span style={{ marginLeft: 'auto', fontSize: '0.78rem', color: '#8C7E72' }}>{SINGLE_PRICE} €/Mon.</span>
                </label>
              ))}
            </div>

            {/* Total */}
            <div style={{ backgroundColor: 'rgba(42,32,24,0.06)', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
              {membershipRequired && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px solid rgba(42,32,24,0.1)' }}>
                  <span style={{ fontSize: '0.82rem', color: '#5A4E42' }}>Monatsmitgliedschaft (erforderlich)</span>
                  <span style={{ fontSize: '0.82rem', color: '#5A4E42' }}>{MEMBERSHIP_PRICE} € / Mon.</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: membershipRequired ? '8px' : '6px' }}>
                <span style={{ fontSize: '0.85rem', color: '#5A4E42' }}>{selected.size} Analyse{selected.size !== 1 ? 'n' : ''} gewählt</span>
                <span style={{ fontSize: '0.85rem', color: '#5A4E42' }}>{analysisTotal} € / Mon.</span>
              </div>
              {membershipRequired && (
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid rgba(42,32,24,0.1)' }}>
                  <span style={{ fontSize: '0.92rem', fontWeight: 600, color: '#2A2018' }}>Gesamt</span>
                  <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#2A2018' }}>{total} € / Monat</span>
                </div>
              )}
              {!membershipRequired && selected.size > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.92rem', fontWeight: 600, color: '#2A2018' }}>Gesamt</span>
                  <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#2A2018' }}>{total} € / Monat</span>
                </div>
              )}
              {selected.size >= 2 && (
                <div style={{ fontSize: '0.75rem', color: '#A0522D', fontWeight: 500, marginTop: '8px' }}>
                  Tipp: Mit dem Jahrespaket sparst du ca. {annualSaving > 0 ? `${annualSaving} €` : 'deutlich'} im Jahr und erhältst alle 10 Analysen.
                </div>
              )}
            </div>

            <button
              onClick={handleBuy}
              disabled={selected.size === 0}
              style={{
                width: '100%', padding: '16px', borderRadius: '40px', border: 'none', cursor: selected.size === 0 ? 'not-allowed' : 'pointer',
                backgroundColor: selected.size === 0 ? 'rgba(160,82,45,0.3)' : '#A0522D',
                color: '#FFF8F2', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '0.95rem',
              }}
            >
              {selected.size === 0 ? 'Analyse auswählen' : `Jetzt kaufen · ${total} € / Monat →`}
            </button>
            {selected.size > 1 && (
              <p style={{ fontSize: '0.72rem', color: '#8C7E72', textAlign: 'center', marginTop: '10px', lineHeight: 1.5 }}>
                Mehrere Analysen werden nacheinander gebucht. Alternativ: Jahrespaket für alle 10.
              </p>
            )}
          </>
        ) : (
          <>
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <div style={{ fontFamily: '"Playfair Display", serif', fontSize: '3rem', fontWeight: 400, color: '#2A2018', lineHeight: 1 }}>{ANNUAL_PRICE} €</div>
              <div style={{ fontSize: '0.82rem', color: '#8C7E72', marginTop: '4px' }}>pro Jahr · {ANNUAL_MONTHLY} € / Monat · 2 Monate geschenkt</div>
              {isIntro && <div style={{ fontSize: '0.72rem', color: '#A0522D', fontWeight: 600, marginTop: '6px' }}>Einführungspreis bis 31.12.2026</div>}
            </div>

            <div style={{ backgroundColor: 'rgba(42,32,24,0.06)', borderRadius: '8px', padding: '18px', marginBottom: '24px' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#A0522D', marginBottom: '14px' }}>
                Alle 10 Analysen inklusive
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 12px' }}>
                {ALL_ANALYSES.map(({ key, label }) => (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: '#2A2018' }}>
                    <span style={{ color: '#A0522D', fontSize: '0.55rem' }}>◆</span> {label}
                  </div>
                ))}
              </div>
              <div style={{ borderTop: '1px solid rgba(42,32,24,0.1)', marginTop: '16px', paddingTop: '12px', fontSize: '0.8rem', color: '#5A4E42', lineHeight: 1.6 }}>
                Jahresanalyse für jeden Bereich · Vollständiger Energiekalender · Maya KI · Jederzeit kündbar
              </div>
            </div>

            <button
              onClick={handleBuy}
              style={{
                width: '100%', padding: '16px', borderRadius: '40px', border: 'none', cursor: 'pointer',
                backgroundColor: '#A0522D', color: '#FFF8F2',
                fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '0.95rem',
              }}
            >
              Jahrespaket kaufen · {ANNUAL_PRICE} € / Jahr →
            </button>
          </>
        )}
      </div>
    </div>
  )
}
