import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'

const ANALYSIS_TYPES = [
  { key: 'business', label: 'Business' },
  { key: 'health', label: 'Gesundheit' },
  { key: 'family', label: 'Familie' },
  { key: 'selfexpression', label: 'Selbstausdruck' },
  { key: 'finance', label: 'Finanzen' },
  { key: 'career', label: 'Karriere' },
  { key: 'lifephases', label: 'Lebensphasen' },
  { key: 'partnership', label: 'Partnerschaftsanalyse' },
  { key: 'relationship', label: 'Beziehungsmuster' },
  { key: 'events', label: 'Ereignis-Analysen' },
  { key: 'yearly_select', label: 'Jahres-Auswahl' },
]

async function apiCall(path, method = 'GET', body = null) {
  const { data: { session } } = await supabase.auth.getSession()
  const res = await fetch(`/api/admin${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session?.access_token}`,
    },
    body: body ? JSON.stringify(body) : null,
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Fehler')
  }
  return res.json()
}

function Badge({ active }) {
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 10px',
      borderRadius: '20px',
      fontSize: '0.72rem',
      fontWeight: 600,
      backgroundColor: active ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
      color: active ? '#22c55e' : '#ef4444',
    }}>
      {active ? 'Aktiv' : 'Inaktiv'}
    </span>
  )
}

function ConfirmModal({ message, confirmLabel = 'Bestätigen', danger = false, onConfirm, onCancel }) {
  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '24px' }}>
      <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '4px', padding: '32px', maxWidth: '420px', width: '100%' }}>
        <p style={{ color: 'var(--text-1)', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '28px' }}>{message}</p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={onCancel}
            style={{ flex: 1, padding: '12px', backgroundColor: 'var(--bg-deep)', border: '1px solid var(--border)', color: 'var(--text-2)', cursor: 'pointer', borderRadius: '2px', fontSize: '0.88rem' }}
          >
            Abbrechen
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1, padding: '12px', cursor: 'pointer', borderRadius: '2px', fontSize: '0.88rem', fontWeight: 600,
              backgroundColor: danger ? 'rgba(239,68,68,0.15)' : 'rgba(var(--accent-rgb,184,151,90),0.15)',
              border: danger ? '1px solid rgba(239,68,68,0.4)' : '1px solid rgba(var(--accent-rgb,184,151,90),0.4)',
              color: danger ? '#ef4444' : 'var(--accent)',
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

function InputModal({ label, onConfirm, onCancel }) {
  const [value, setValue] = useState('')
  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '24px' }}>
      <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '4px', padding: '32px', maxWidth: '420px', width: '100%' }}>
        <p style={{ color: 'var(--text-1)', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '16px' }}>{label}</p>
        <input
          autoFocus
          type="text"
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && value.trim()) onConfirm(value.trim()); if (e.key === 'Escape') onCancel() }}
          style={{ width: '100%', padding: '10px 12px', backgroundColor: 'var(--bg-deep)', border: '1px solid var(--border)', borderRadius: '2px', color: 'var(--text-1)', fontSize: '0.9rem', marginBottom: '20px', boxSizing: 'border-box' }}
        />
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onCancel} style={{ flex: 1, padding: '12px', backgroundColor: 'var(--bg-deep)', border: '1px solid var(--border)', color: 'var(--text-2)', cursor: 'pointer', borderRadius: '2px', fontSize: '0.88rem' }}>
            Abbrechen
          </button>
          <button
            onClick={() => value.trim() && onConfirm(value.trim())}
            style={{ flex: 1, padding: '12px', backgroundColor: 'rgba(var(--accent-rgb,184,151,90),0.15)', border: '1px solid rgba(var(--accent-rgb,184,151,90),0.4)', color: 'var(--accent)', cursor: 'pointer', borderRadius: '2px', fontSize: '0.88rem', fontWeight: 600 }}
          >
            Speichern
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Admin() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('users') // 'users' | 'trash'
  const [users, setUsers] = useState([])
  const [trashedUsers, setTrashedUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState(null)
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')
  const [modal, setModal] = useState(null) // { type: 'confirm'|'input', ... }

  useEffect(() => {
    if (profile && !profile.is_admin) navigate('/')
  }, [profile])

  useEffect(() => {
    loadAll()
  }, [])

  async function loadAll() {
    setLoading(true)
    try {
      const [activeData, trashData] = await Promise.all([
        apiCall('/users'),
        apiCall('/users/trash'),
      ])
      setUsers(activeData)
      setTrashedUsers(trashData)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  function showConfirm(message, onConfirm, { danger = false, confirmLabel = 'Bestätigen' } = {}) {
    setModal({ type: 'confirm', message, onConfirm, danger, confirmLabel })
  }

  function showInput(label, onConfirm) {
    setModal({ type: 'input', label, onConfirm })
  }

  function closeModal() { setModal(null) }

  async function setPlan(userId, plan) {
    try {
      const updated = await apiCall(`/users/${userId}/plan`, 'PATCH', { plan })
      setMsg(`Tarif auf ${plan === 'annual' ? 'Jahrestarif' : 'Monatstarif'} gesetzt.`)
      await loadAll()
      if (selectedUser?.id === userId) setSelectedUser(u => ({ ...u, subscription_plan: plan }))
    } catch (e) {
      setError(e.message)
    }
  }

  async function toggleMembership(userId, active) {
    try {
      await apiCall(`/users/${userId}/membership`, 'PATCH', { active, months: active ? 1 : null })
      setMsg(active ? 'Mitgliedschaft aktiviert.' : 'Mitgliedschaft deaktiviert.')
      await loadAll()
      if (selectedUser?.id === userId) setSelectedUser(u => ({ ...u, membership_active: active }))
    } catch (e) {
      setError(e.message)
    }
  }

  async function toggleAnalysis(userId, type, grant) {
    try {
      const updated = await apiCall(`/users/${userId}/analyses`, 'PATCH', { type, grant })
      setMsg(`${type} ${grant ? 'freigeschaltet' : 'entfernt'}.`)
      await loadAll()
      if (selectedUser?.id === userId) setSelectedUser(updated)
    } catch (e) {
      setError(e.message)
    }
  }

  async function toggleAdmin(userId, is_admin) {
    showConfirm(
      `Admin-Status ${is_admin ? 'vergeben' : 'entziehen'}?`,
      async () => {
        closeModal()
        try {
          await apiCall(`/users/${userId}/admin`, 'PATCH', { is_admin })
          setMsg('Admin-Status geändert.')
          await loadAll()
        } catch (e) {
          setError(e.message)
        }
      },
      { confirmLabel: is_admin ? 'Vergeben' : 'Entziehen' }
    )
  }

  async function setMaxEvents(userId, value) {
    try {
      await apiCall(`/users/${userId}/max-events`, 'PATCH', { max_events_override: value === '' ? null : Number(value) })
      setMsg('Max. Ereignisse gesetzt.')
      await loadAll()
      if (selectedUser?.id === userId) setSelectedUser(u => ({ ...u, max_events_override: value === '' ? null : Number(value) }))
    } catch (e) {
      setError(e.message)
    }
  }

  function changeEmail(userId) {
    showInput('Neue E-Mail-Adresse:', async (newEmail) => {
      closeModal()
      try {
        await apiCall(`/users/${userId}/email`, 'PATCH', { email: newEmail })
        setMsg('E-Mail geändert.')
        await loadAll()
      } catch (e) {
        setError(e.message)
      }
    })
  }

  function resetPassword(userId) {
    showConfirm(
      'Passwort-Reset-Link an den Nutzer senden?',
      async () => {
        closeModal()
        try {
          await apiCall(`/users/${userId}/reset-password`, 'POST')
          setMsg('Reset-Link wurde gesendet.')
        } catch (e) {
          setError(e.message)
        }
      },
      { confirmLabel: 'Link senden' }
    )
  }

  function softDeleteUser(u) {
    showConfirm(
      `Nutzer "${u.name || u.id.slice(0, 8)}" in den Papierkorb verschieben? Der Zugang wird gesperrt, die Daten bleiben erhalten.`,
      async () => {
        closeModal()
        try {
          await apiCall(`/users/${u.id}`, 'DELETE')
          setMsg('Nutzer in den Papierkorb verschoben.')
          setSelectedUser(null)
          await loadAll()
        } catch (e) {
          setError(e.message)
        }
      },
      { danger: true, confirmLabel: 'In Papierkorb' }
    )
  }

  async function restoreUser(u) {
    showConfirm(
      `Nutzer "${u.name || u.id.slice(0, 8)}" wiederherstellen? Der Zugang wird wieder aktiviert.`,
      async () => {
        closeModal()
        try {
          await apiCall(`/users/${u.id}/restore`, 'POST')
          setMsg('Nutzer wiederhergestellt.')
          await loadAll()
        } catch (e) {
          setError(e.message)
        }
      },
      { confirmLabel: 'Wiederherstellen' }
    )
  }

  function permanentDeleteUser(u) {
    showConfirm(
      `Nutzer "${u.name || u.id.slice(0, 8)}" endgültig löschen? Alle Daten werden unwiderruflich entfernt.`,
      async () => {
        closeModal()
        try {
          await apiCall(`/users/${u.id}/permanent`, 'DELETE')
          setMsg('Nutzer endgültig gelöscht.')
          await loadAll()
        } catch (e) {
          setError(e.message)
        }
      },
      { danger: true, confirmLabel: 'Endgültig löschen' }
    )
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-deep)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
      Laden…
    </div>
  )

  return (
    <>
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-deep)', color: 'var(--text-1)', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ marginBottom: '32px' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.18em', color: 'var(--accent)', textTransform: 'uppercase', marginBottom: '8px' }}>
            Admin
          </div>
          <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 300, color: 'var(--text-1)' }}>Nutzer & Mitgliedschaften</h1>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', borderBottom: '1px solid var(--border)', paddingBottom: '0' }}>
          {[
            { key: 'users', label: `Nutzer (${users.length})` },
            { key: 'trash', label: `Papierkorb (${trashedUsers.length})` },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); setSelectedUser(null) }}
              style={{
                padding: '10px 20px',
                background: 'none',
                border: 'none',
                borderBottom: tab === t.key ? '2px solid var(--accent)' : '2px solid transparent',
                color: tab === t.key ? 'var(--accent)' : 'var(--text-2)',
                cursor: 'pointer',
                fontSize: '0.88rem',
                fontWeight: tab === t.key ? 600 : 400,
                marginBottom: '-1px',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {msg && (
          <div style={{ backgroundColor: 'rgba(var(--accent-rgb,184,151,90),0.1)', border: '1px solid rgba(var(--accent-rgb,184,151,90),0.3)', borderRadius: '4px', padding: '12px 16px', marginBottom: '20px', fontSize: '0.88rem', color: 'var(--accent)', cursor: 'pointer' }}
            onClick={() => setMsg('')}>
            {msg}
          </div>
        )}
        {error && (
          <div style={{ backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '4px', padding: '12px 16px', marginBottom: '20px', fontSize: '0.88rem', color: '#ef4444', cursor: 'pointer' }}
            onClick={() => setError('')}>
            {error}
          </div>
        )}

        {/* Nutzer-Tab */}
        {tab === 'users' && (
          <div style={{ display: 'grid', gridTemplateColumns: selectedUser ? '1fr 400px' : '1fr', gap: '24px' }}>

            <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '4px', border: '1px solid var(--border)', overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text-1)' }}>{users.length} aktive Nutzer</span>
                <button onClick={loadAll} style={{ background: 'none', border: 'none', color: 'var(--text-2)', cursor: 'pointer', fontSize: '0.8rem' }}>
                  Aktualisieren
                </button>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['Name', 'ID', 'Mitgliedschaft', 'Analysen', 'Registriert', ''].map(h => (
                      <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 500, color: 'var(--text-2)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} style={{ borderBottom: '1px solid var(--border)', backgroundColor: selectedUser?.id === u.id ? 'rgba(var(--accent-rgb,184,151,90),0.05)' : 'transparent' }}>
                      <td style={{ padding: '12px 16px', color: 'var(--text-1)' }}>
                        {u.name || '—'}
                        {u.is_admin && <span style={{ marginLeft: '6px', fontSize: '0.68rem', color: 'var(--accent)' }}>ADMIN</span>}
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-2)', fontSize: '0.82rem' }}>
                        {u.id.slice(0, 8)}…
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <Badge active={u.membership_active} />
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-2)' }}>
                        {(u.purchased_analyses?.filter(k => k !== 'compatibility') || []).length}
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-2)', fontSize: '0.8rem' }}>
                        {new Date(u.created_at).toLocaleDateString('de-DE')}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <button
                          onClick={() => setSelectedUser(selectedUser?.id === u.id ? null : u)}
                          style={{ background: 'none', border: '1px solid rgba(var(--accent-rgb,184,151,90),0.3)', color: 'var(--accent)', cursor: 'pointer', padding: '4px 12px', fontSize: '0.78rem', borderRadius: '2px' }}
                        >
                          {selectedUser?.id === u.id ? 'Schließen' : 'Bearbeiten'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Detail-Panel */}
            {selectedUser && (
              <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '4px', border: '1px solid var(--border)', padding: '24px' }}>
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 400, color: 'var(--text-1)', marginBottom: '4px' }}>{selectedUser.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-2)' }}>{selectedUser.birth_date || 'Kein Geburtsdatum'}</div>
                </div>

                <div style={{ marginBottom: '28px' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-2)', marginBottom: '12px' }}>
                    Mitgliedschaft
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <button
                      onClick={() => toggleMembership(selectedUser.id, true)}
                      style={{ flex: 1, padding: '10px', backgroundColor: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e', cursor: 'pointer', borderRadius: '2px', fontSize: '0.82rem', fontWeight: selectedUser.membership_active ? 600 : 400 }}
                    >
                      Aktivieren
                    </button>
                    <button
                      onClick={() => toggleMembership(selectedUser.id, false)}
                      style={{ flex: 1, padding: '10px', backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', cursor: 'pointer', borderRadius: '2px', fontSize: '0.82rem', fontWeight: !selectedUser.membership_active ? 600 : 400 }}
                    >
                      Deaktivieren
                    </button>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-2)', marginBottom: '6px' }}>Tarif</div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => setPlan(selectedUser.id, 'monthly')}
                      style={{ flex: 1, padding: '9px', backgroundColor: selectedUser.subscription_plan === 'monthly' ? 'rgba(var(--accent-rgb,184,151,90),0.2)' : 'var(--bg-deep)', border: selectedUser.subscription_plan === 'monthly' ? '1px solid rgba(var(--accent-rgb,184,151,90),0.6)' : '1px solid var(--border)', color: selectedUser.subscription_plan === 'monthly' ? 'var(--accent)' : 'var(--text-2)', cursor: 'pointer', borderRadius: '2px', fontSize: '0.82rem', fontWeight: selectedUser.subscription_plan === 'monthly' ? 600 : 400 }}
                    >
                      Monatstarif
                    </button>
                    <button
                      onClick={() => setPlan(selectedUser.id, 'annual')}
                      style={{ flex: 1, padding: '9px', backgroundColor: selectedUser.subscription_plan === 'annual' ? 'rgba(var(--accent-rgb,184,151,90),0.2)' : 'var(--bg-deep)', border: selectedUser.subscription_plan === 'annual' ? '1px solid rgba(var(--accent-rgb,184,151,90),0.6)' : '1px solid var(--border)', color: selectedUser.subscription_plan === 'annual' ? 'var(--accent)' : 'var(--text-2)', cursor: 'pointer', borderRadius: '2px', fontSize: '0.82rem', fontWeight: selectedUser.subscription_plan === 'annual' ? 600 : 400 }}
                    >
                      Jahrestarif
                    </button>
                  </div>
                </div>

                <div style={{ marginBottom: '28px' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-2)', marginBottom: '12px' }}>
                    Zusatzanalysen
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                    {ANALYSIS_TYPES.map(({ key, label }) => {
                      const has = selectedUser.purchased_analyses?.includes(key)
                      return (
                        <button
                          key={key}
                          onClick={() => toggleAnalysis(selectedUser.id, key, !has)}
                          style={{
                            padding: '8px 10px',
                            fontSize: '0.78rem',
                            cursor: 'pointer',
                            borderRadius: '2px',
                            textAlign: 'left',
                            backgroundColor: has ? 'rgba(var(--accent-rgb,184,151,90),0.1)' : 'var(--bg-deep)',
                            border: has ? '1px solid rgba(var(--accent-rgb,184,151,90),0.4)' : '1px solid var(--border)',
                            color: has ? 'var(--accent)' : 'var(--text-2)',
                          }}
                        >
                          {has ? '✓ ' : '+ '}{label}
                        </button>
                      )
                    })}
                  </div>

                  <div style={{ marginTop: '12px', padding: '12px', backgroundColor: 'var(--bg-deep)', borderRadius: '2px', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-2)', marginBottom: '8px' }}>Max. Ereignisse (Override)</div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        placeholder="Auto"
                        defaultValue={selectedUser.max_events_override ?? ''}
                        onBlur={e => setMaxEvents(selectedUser.id, e.target.value)}
                        style={{ flex: 1, padding: '7px 10px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '2px', color: 'var(--text-1)', fontSize: '0.82rem' }}
                      />
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-2)' }}>leer = Auto</span>
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: '28px' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-2)', marginBottom: '12px' }}>
                    Konto
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
                    <button
                      onClick={() => changeEmail(selectedUser.id)}
                      style={{ padding: '10px', backgroundColor: 'var(--bg-deep)', border: '1px solid var(--border)', color: 'var(--text-2)', cursor: 'pointer', borderRadius: '2px', fontSize: '0.82rem', textAlign: 'left' }}
                    >
                      E-Mail ändern…
                    </button>
                    <button
                      onClick={() => resetPassword(selectedUser.id)}
                      style={{ padding: '10px', backgroundColor: 'var(--bg-deep)', border: '1px solid var(--border)', color: 'var(--text-2)', cursor: 'pointer', borderRadius: '2px', fontSize: '0.82rem', textAlign: 'left' }}
                    >
                      Passwort-Reset senden
                    </button>
                    <button
                      onClick={() => softDeleteUser(selectedUser)}
                      style={{ padding: '10px', backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', cursor: 'pointer', borderRadius: '2px', fontSize: '0.82rem', textAlign: 'left' }}
                    >
                      In Papierkorb verschieben
                    </button>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-2)', marginBottom: '12px' }}>
                    Rechte
                  </div>
                  <button
                    onClick={() => toggleAdmin(selectedUser.id, !selectedUser.is_admin)}
                    style={{ width: '100%', padding: '10px', backgroundColor: 'var(--bg-deep)', border: '1px solid var(--border)', color: selectedUser.is_admin ? '#ef4444' : 'var(--text-2)', cursor: 'pointer', borderRadius: '2px', fontSize: '0.82rem' }}
                  >
                    {selectedUser.is_admin ? 'Admin-Rechte entziehen' : 'Admin-Rechte vergeben'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Papierkorb-Tab */}
        {tab === 'trash' && (
          <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '4px', border: '1px solid var(--border)', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-2)' }}>
                Gelöschte Nutzer können wiederhergestellt oder endgültig entfernt werden.
              </span>
            </div>
            {trashedUsers.length === 0 ? (
              <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-2)', fontSize: '0.88rem' }}>
                Der Papierkorb ist leer.
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['Name', 'ID', 'Registriert', 'Gelöscht am', ''].map(h => (
                      <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 500, color: 'var(--text-2)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {trashedUsers.map(u => (
                    <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '12px 16px', color: 'var(--text-1)' }}>{u.name || '—'}</td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-2)', fontSize: '0.82rem' }}>{u.id.slice(0, 8)}…</td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-2)', fontSize: '0.8rem' }}>
                        {new Date(u.created_at).toLocaleDateString('de-DE')}
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-2)', fontSize: '0.8rem' }}>
                        {new Date(u.deleted_at).toLocaleDateString('de-DE')}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => restoreUser(u)}
                            style={{ background: 'none', border: '1px solid rgba(34,197,94,0.4)', color: '#22c55e', cursor: 'pointer', padding: '5px 14px', fontSize: '0.78rem', borderRadius: '2px' }}
                          >
                            Wiederherstellen
                          </button>
                          <button
                            onClick={() => permanentDeleteUser(u)}
                            style={{ background: 'none', border: '1px solid rgba(239,68,68,0.4)', color: '#ef4444', cursor: 'pointer', padding: '5px 14px', fontSize: '0.78rem', borderRadius: '2px' }}
                          >
                            Endgültig löschen
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>

    {modal?.type === 'confirm' && (
      <ConfirmModal
        message={modal.message}
        confirmLabel={modal.confirmLabel}
        danger={modal.danger}
        onConfirm={modal.onConfirm}
        onCancel={closeModal}
      />
    )}
    {modal?.type === 'input' && (
      <InputModal
        label={modal.label}
        onConfirm={modal.onConfirm}
        onCancel={closeModal}
      />
    )}
    </>
  )
}
