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
  { key: 'partnership', label: 'Partnerschaft' },
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

export default function Admin() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState(null)
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (profile && !profile.is_admin) navigate('/')
  }, [profile])

  useEffect(() => {
    loadUsers()
  }, [])

  async function loadUsers() {
    try {
      const data = await apiCall('/users')
      setUsers(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function toggleMembership(userId, active) {
    try {
      await apiCall(`/users/${userId}/membership`, 'PATCH', { active, months: active ? 1 : null })
      setMsg(active ? 'Mitgliedschaft aktiviert.' : 'Mitgliedschaft deaktiviert.')
      await loadUsers()
      if (selectedUser?.id === userId) setSelectedUser(u => ({ ...u, membership_active: active }))
    } catch (e) {
      setError(e.message)
    }
  }

  async function toggleAnalysis(userId, type, grant) {
    try {
      const updated = await apiCall(`/users/${userId}/analyses`, 'PATCH', { type, grant })
      setMsg(`${type} ${grant ? 'freigeschaltet' : 'entfernt'}.`)
      await loadUsers()
      if (selectedUser?.id === userId) setSelectedUser(updated)
    } catch (e) {
      setError(e.message)
    }
  }

  async function toggleAdmin(userId, is_admin) {
    if (!window.confirm(`Admin-Status ${is_admin ? 'vergeben' : 'entziehen'}?`)) return
    try {
      await apiCall(`/users/${userId}/admin`, 'PATCH', { is_admin })
      setMsg('Admin-Status geändert.')
      await loadUsers()
    } catch (e) {
      setError(e.message)
    }
  }

  const dark = '#0d1b2a'
  const mid = '#112240'
  const gold = '#B8975A'
  const text = '#E8E8E8'
  const muted = '#8899AA'

  if (loading) return (
    <div style={{ minHeight: '100vh', backgroundColor: dark, display: 'flex', alignItems: 'center', justifyContent: 'center', color: gold }}>
      Laden…
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', backgroundColor: dark, color: text, fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ marginBottom: '40px' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.18em', color: gold, textTransform: 'uppercase', marginBottom: '8px' }}>
            Admin
          </div>
          <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 300 }}>Nutzer & Mitgliedschaften</h1>
        </div>

        {msg && (
          <div style={{ backgroundColor: 'rgba(184,151,90,0.1)', border: '1px solid rgba(184,151,90,0.3)', borderRadius: '4px', padding: '12px 16px', marginBottom: '20px', fontSize: '0.88rem', color: gold }}
            onClick={() => setMsg('')}>
            {msg}
          </div>
        )}
        {error && (
          <div style={{ backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '4px', padding: '12px 16px', marginBottom: '20px', fontSize: '0.88rem', color: '#ef4444' }}
            onClick={() => setError('')}>
            {error}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: selectedUser ? '1fr 380px' : '1fr', gap: '24px' }}>

          {/* Nutzerliste */}
          <div style={{ backgroundColor: mid, borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 500 }}>{users.length} Nutzer</span>
              <button onClick={loadUsers} style={{ background: 'none', border: 'none', color: muted, cursor: 'pointer', fontSize: '0.8rem' }}>
                Aktualisieren
              </button>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {['Name', 'E-Mail', 'Mitgliedschaft', 'Analysen', 'Registriert', ''].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 500, color: muted, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', backgroundColor: selectedUser?.id === u.id ? 'rgba(184,151,90,0.05)' : 'transparent' }}>
                    <td style={{ padding: '12px 16px' }}>
                      {u.name || '—'}
                      {u.is_admin && <span style={{ marginLeft: '6px', fontSize: '0.68rem', color: gold }}>ADMIN</span>}
                    </td>
                    <td style={{ padding: '12px 16px', color: muted, fontSize: '0.82rem' }}>
                      {u.id.slice(0, 8)}…
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <Badge active={u.membership_active} />
                    </td>
                    <td style={{ padding: '12px 16px', color: muted }}>
                      {u.purchased_analyses?.length || 0}
                    </td>
                    <td style={{ padding: '12px 16px', color: muted, fontSize: '0.8rem' }}>
                      {new Date(u.created_at).toLocaleDateString('de-DE')}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <button
                        onClick={() => setSelectedUser(selectedUser?.id === u.id ? null : u)}
                        style={{ background: 'none', border: `1px solid rgba(184,151,90,0.3)`, color: gold, cursor: 'pointer', padding: '4px 12px', fontSize: '0.78rem', borderRadius: '2px' }}
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
            <div style={{ backgroundColor: mid, borderRadius: '4px', padding: '24px' }}>
              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 400, marginBottom: '4px' }}>{selectedUser.name}</div>
                <div style={{ fontSize: '0.8rem', color: muted }}>{selectedUser.birth_date || 'Kein Geburtsdatum'}</div>
              </div>

              <div style={{ marginBottom: '28px' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: muted, marginBottom: '12px' }}>
                  Mitgliedschaft
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => toggleMembership(selectedUser.id, true)}
                    style={{ flex: 1, padding: '10px', backgroundColor: selectedUser.membership_active ? 'rgba(34,197,94,0.1)' : 'rgba(34,197,94,0.2)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e', cursor: 'pointer', borderRadius: '2px', fontSize: '0.82rem' }}
                  >
                    Aktivieren
                  </button>
                  <button
                    onClick={() => toggleMembership(selectedUser.id, false)}
                    style={{ flex: 1, padding: '10px', backgroundColor: !selectedUser.membership_active ? 'rgba(239,68,68,0.1)' : 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', cursor: 'pointer', borderRadius: '2px', fontSize: '0.82rem' }}
                  >
                    Deaktivieren
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: '28px' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: muted, marginBottom: '12px' }}>
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
                          backgroundColor: has ? 'rgba(184,151,90,0.1)' : 'rgba(255,255,255,0.03)',
                          border: has ? '1px solid rgba(184,151,90,0.4)' : '1px solid rgba(255,255,255,0.1)',
                          color: has ? gold : muted,
                        }}
                      >
                        {has ? '✓ ' : '+ '}{label}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: muted, marginBottom: '12px' }}>
                  Rechte
                </div>
                <button
                  onClick={() => toggleAdmin(selectedUser.id, !selectedUser.is_admin)}
                  style={{ width: '100%', padding: '10px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: selectedUser.is_admin ? '#ef4444' : muted, cursor: 'pointer', borderRadius: '2px', fontSize: '0.82rem' }}
                >
                  {selectedUser.is_admin ? 'Admin-Rechte entziehen' : 'Admin-Rechte vergeben'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
