import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { supabase } from '../lib/supabase.js'

const TRIAL_DAYS = 3

export function getTrialMs(membershipStart) {
  if (!membershipStart) return 0
  const trialEnd = new Date(membershipStart).getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000
  return Math.max(0, trialEnd - Date.now())
}

export function formatCountdown(ms) {
  if (ms <= 0) return null
  const totalSec = Math.floor(ms / 1000)
  const days = Math.floor(totalSec / 86400)
  const hours = Math.floor((totalSec % 86400) / 3600)
  const mins = Math.floor((totalSec % 3600) / 60)
  const parts = []
  if (days > 0) parts.push(`${days} ${days === 1 ? 'Tag' : 'Tage'}`)
  if (hours > 0) parts.push(`${hours} Std`)
  parts.push(`${mins} Min`)
  return parts.join(' ')
}

export function useTrialCountdown(membershipStart) {
  const [ms, setMs] = useState(() => getTrialMs(membershipStart))
  useEffect(() => {
    if (!membershipStart) return
    const id = setInterval(() => {
      const remaining = getTrialMs(membershipStart)
      setMs(remaining)
      if (remaining <= 0) clearInterval(id)
    }, 60000)
    return () => clearInterval(id)
  }, [membershipStart])
  return ms
}

export function TrialModal({ countdown, onClose, onSkipTrial }) {
  const [step, setStep] = useState('info')
  const [checked, setChecked] = useState(false)
  const [amount, setAmount] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSkipRequest() {
    setStep('loading')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/stripe/skip-trial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
        body: JSON.stringify({ confirm: false }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Fehler')
      setAmount(data.amount)
      setStep('confirm2')
    } catch (err) {
      setErrorMsg(err.message)
      setStep('error')
    }
  }

  async function handleConfirm() {
    setStep('loading')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/stripe/skip-trial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
        body: JSON.stringify({ confirm: true }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Fehler')
      setStep('done')
      setTimeout(() => { onSkipTrial?.(); onClose() }, 1500)
    } catch (err) {
      setErrorMsg(err.message)
      setStep('error')
    }
  }

  const overlayStyle = { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 9999, padding: 'max(env(safe-area-inset-top, 16px), 16px) 24px 24px' }
  const boxStyle = { backgroundColor: 'var(--color-bg-card)', border: '1px solid rgba(139,110,62,0.3)', borderRadius: '8px', padding: '32px 28px', maxWidth: '400px', width: '100%' }
  const btnGold = { width: '100%', backgroundColor: 'var(--color-gold)', color: '#000', border: 'none', borderRadius: '4px', padding: '12px', fontWeight: 500, fontSize: '0.9rem', cursor: 'pointer', marginTop: '8px' }
  const btnGhost = { width: '100%', backgroundColor: 'transparent', color: 'var(--color-text-muted)', border: '1px solid rgba(139,110,62,0.3)', borderRadius: '4px', padding: '12px', fontWeight: 400, fontSize: '0.85rem', cursor: 'pointer', marginTop: '8px', fontFamily: 'Inter, sans-serif' }

  let content
  if (step === 'info') {
    content = (
      <>
        <div style={{ fontSize: '1.6rem', marginBottom: '16px', textAlign: 'center' }}>⏳</div>
        <h3 style={{ color: 'var(--color-gold)', fontWeight: 400, fontSize: '1.1rem', marginBottom: '12px', textAlign: 'center' }}>
          Noch {countdown} kostenlose Testphase
        </h3>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem', lineHeight: 1.7, textAlign: 'center', marginBottom: '24px' }}>
          Die Analysen und Ereignisse stehen dir nach Ablauf deiner Testphase automatisch zur Verfügung. Du musst nichts weiter tun.
        </p>
        <button onClick={onClose} style={btnGold}>Verstanden</button>
        <button onClick={() => setStep('confirm1')} style={btnGhost}>Sofort freischalten</button>
      </>
    )
  } else if (step === 'confirm1') {
    content = (
      <>
        <div style={{ fontSize: '1.6rem', marginBottom: '16px', textAlign: 'center' }}>💳</div>
        <h3 style={{ color: 'var(--color-gold)', fontWeight: 400, fontSize: '1.1rem', marginBottom: '16px', textAlign: 'center' }}>
          Testphase sofort beenden
        </h3>
        <div style={{ backgroundColor: 'rgba(220,53,69,0.08)', border: '1px solid rgba(220,53,69,0.25)', borderRadius: '6px', padding: '16px', marginBottom: '20px' }}>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.86rem', lineHeight: 1.7, margin: 0 }}>
            Wenn du die Testphase überspringst, wird der <strong style={{ color: 'var(--color-text-primary)' }}>volle Jahresbeitrag sofort abgebucht</strong>. Du erhältst dafür sofortigen Zugang zu allen Analysen und Funktionen.
          </p>
        </div>
        <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer', marginBottom: '24px' }}>
          <input
            type="checkbox"
            checked={checked}
            onChange={e => setChecked(e.target.checked)}
            style={{ marginTop: '2px', accentColor: 'var(--color-gold)', width: '16px', height: '16px', flexShrink: 0, cursor: 'pointer' }}
          />
          <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', lineHeight: 1.6 }}>
            Ich verstehe, dass der Jahresbeitrag sofort und vollständig abgebucht wird.
          </span>
        </label>
        <button onClick={handleSkipRequest} disabled={!checked} style={{ ...btnGold, opacity: checked ? 1 : 0.4, cursor: checked ? 'pointer' : 'default' }}>
          Sofort freischalten
        </button>
        <button onClick={() => setStep('info')} style={btnGhost}>Zurück</button>
      </>
    )
  } else if (step === 'confirm2') {
    content = (
      <>
        <div style={{ fontSize: '1.6rem', marginBottom: '16px', textAlign: 'center' }}>⚠️</div>
        <h3 style={{ color: 'var(--color-gold)', fontWeight: 400, fontSize: '1.1rem', marginBottom: '16px', textAlign: 'center' }}>
          Letzte Bestätigung
        </h3>
        <div style={{ backgroundColor: 'rgba(139,110,62,0.08)', border: '1px solid rgba(139,110,62,0.3)', borderRadius: '6px', padding: '20px', marginBottom: '24px', textAlign: 'center' }}>
          <div style={{ color: 'var(--color-text-muted)', fontSize: '0.82rem', marginBottom: '6px' }}>Jetzt fälliger Betrag</div>
          <div style={{ color: 'var(--color-gold)', fontSize: '1.8rem', fontWeight: 300 }}>{amount}</div>
        </div>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', lineHeight: 1.6, textAlign: 'center', marginBottom: '24px' }}>
          Dieser Betrag wird sofort von deiner hinterlegten Zahlungsmethode abgebucht.
        </p>
        <button onClick={handleConfirm} style={btnGold}>Ja, ich bin damit einverstanden</button>
        <button onClick={() => setStep('info')} style={btnGhost}>Abbrechen</button>
      </>
    )
  } else if (step === 'loading') {
    content = (
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <div style={{ color: 'var(--color-gold)', fontSize: '0.95rem' }} className="pulse-gold">Wird verarbeitet…</div>
      </div>
    )
  } else if (step === 'done') {
    content = (
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <div style={{ fontSize: '2rem', marginBottom: '12px' }}>✓</div>
        <p style={{ color: 'var(--color-gold)', fontSize: '0.95rem' }}>Freigeschaltet. Willkommen!</p>
      </div>
    )
  } else if (step === 'error') {
    content = (
      <>
        <p style={{ color: '#ff6b6b', fontSize: '0.88rem', textAlign: 'center', marginBottom: '20px' }}>{errorMsg}</p>
        <button onClick={onClose} style={btnGhost}>Schließen</button>
      </>
    )
  }

  return createPortal(
    <div style={overlayStyle} onClick={step === 'loading' || step === 'done' ? undefined : onClose}>
      <div style={boxStyle} onClick={e => e.stopPropagation()}>
        {content}
      </div>
    </div>,
    document.body
  )
}
