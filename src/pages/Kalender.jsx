import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import { supabase } from '../lib/supabase.js'

const GERMAN_MONTHS = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember']
const WEEKDAYS = ['Mo','Di','Mi','Do','Fr','Sa','So']

const ENERGY = {
  action:   { label: 'Aktion',    color: '#4CAF7D', bg: 'rgba(76,175,125,0.12)',  desc: 'Ideal für Sport, Entscheidungen, Meetings' },
  creative: { label: 'Kreativ',   color: '#7B9ED9', bg: 'rgba(123,158,217,0.12)', desc: 'Ideal für Ideen, kreative Arbeit, soziale Kontakte' },
  balance:  { label: 'Balance',   color: '#E6B84A', bg: 'rgba(230,184,74,0.12)',  desc: 'Ideal für Routinen, Struktur, Planung' },
  rest:     { label: 'Ruhe',      color: '#C47A5A', bg: 'rgba(196,122,90,0.12)',  desc: 'Ideal für Rückzug, Meditation, Loslassen' },
}

const RESONANCE_STYLE = {
  birthday:  { border: '2px solid #FFD700', label: '⭐ Kraft-Tag' },
  seal:      { border: '2px solid var(--accent)', label: '◆ Siegel-Tag' },
  tone:      { border: '2px solid #7B9ED9', label: '◇ Ton-Tag' },
  wavespell: { border: '1px dashed var(--accent)', label: '~ Wellen-Tag' },
  none:      { border: '1px solid var(--border)', label: '' },
}

export default function Kalender() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [days, setDays] = useState([])
  const [userKin, setUserKin] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [view, setView] = useState('month') // 'month' | 'list'

  useEffect(() => {
    load()
  }, [year, month, user])

  async function load() {
    if (!user) return
    setLoading(true)
    setSelected(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch(`/api/analysis/calendar/${year}/${month}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setDays(data.days)
      setUserKin(data.userKin)
    } catch {}
    finally { setLoading(false) }
  }

  function prevMonth() {
    if (month === 1) { setYear(y => y - 1); setMonth(12) }
    else setMonth(m => m - 1)
  }
  function nextMonth() {
    if (month === 12) { setYear(y => y + 1); setMonth(1) }
    else setMonth(m => m + 1)
  }
  function goToday() { setYear(now.getFullYear()); setMonth(now.getMonth() + 1) }

  // First weekday of month (0=Mon … 6=Sun)
  const firstDay = days.length > 0 ? ((new Date(year, month - 1, 1).getDay() + 6) % 7) : 0

  const todayStr = now.toISOString().split('T')[0]

  return (
    <div style={{ backgroundColor: 'var(--bg-deep)', minHeight: '100vh', padding: '40px 32px', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: '960px' }}>

        {/* Header */}
        <div style={{ fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--accent)', marginBottom: '6px' }}>
          Maya Energiekalender
        </div>
        <h1 style={{ fontFamily: '"Playfair Display", serif', fontWeight: 400, fontSize: '2rem', color: 'var(--text-1)', margin: '0 0 28px' }}>
          Deine Energien im Überblick
        </h1>

        {/* Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <button onClick={prevMonth} style={navBtn}>‹</button>
          <span style={{ color: 'var(--text-1)', fontWeight: 500, fontSize: '1.05rem', minWidth: '180px', textAlign: 'center' }}>
            {GERMAN_MONTHS[month - 1]} {year}
          </span>
          <button onClick={nextMonth} style={navBtn}>›</button>
          <button onClick={goToday} style={{ ...navBtn, fontSize: '0.78rem', padding: '6px 16px', borderRadius: '20px', marginLeft: '8px' }}>
            Heute
          </button>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '6px' }}>
            {['month','list'].map(v => (
              <button key={v} onClick={() => setView(v)} style={{ ...navBtn, backgroundColor: view === v ? 'var(--accent)' : 'transparent', color: view === v ? 'var(--bg-deep)' : 'var(--text-2)', fontSize: '0.78rem', padding: '6px 14px', borderRadius: '20px' }}>
                {v === 'month' ? 'Kalender' : 'Liste'}
              </button>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {Object.entries(ENERGY).map(([k, e]) => (
            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: e.color }} />
              <span style={{ color: 'var(--text-2)', fontSize: '0.75rem' }}>{e.label}</span>
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#FFD700' }} />
            <span style={{ color: 'var(--text-2)', fontSize: '0.75rem' }}>Persönlicher Kraft-Tag</span>
          </div>
        </div>

        {loading ? (
          <div style={{ color: 'var(--text-2)', padding: '40px 0' }}>Wird geladen…</div>
        ) : view === 'month' ? (
          <MonthView days={days} firstDay={firstDay} todayStr={todayStr} selected={selected} setSelected={setSelected} userKin={userKin} navigate={navigate} />
        ) : (
          <ListView days={days} todayStr={todayStr} selected={selected} setSelected={setSelected} navigate={navigate} />
        )}

        {/* Day detail panel */}
        {selected && (
          <DayDetail day={selected} onClose={() => setSelected(null)} navigate={navigate} />
        )}
      </div>
    </div>
  )
}

function MonthView({ days, firstDay, todayStr, selected, setSelected }) {
  const cells = [...Array(firstDay).fill(null), ...days]
  const weeks = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))
  while (weeks[weeks.length - 1]?.length < 7) weeks[weeks.length - 1].push(null)

  return (
    <div>
      {/* Weekday headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '4px' }}>
        {WEEKDAYS.map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: '0.72rem', color: 'var(--text-2)', fontWeight: 600, padding: '4px 0', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{d}</div>
        ))}
      </div>
      {/* Day cells */}
      {weeks.map((week, wi) => (
        <div key={wi} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '4px' }}>
          {week.map((day, di) => {
            if (!day) return <div key={di} />
            const e = ENERGY[day.energyType]
            const res = RESONANCE_STYLE[day.resonance]
            const isToday = day.date === todayStr
            const isSel = selected?.date === day.date
            return (
              <div
                key={di}
                onClick={() => setSelected(day)}
                style={{
                  border: isSel ? '2px solid var(--accent)' : res.border,
                  borderRadius: '6px',
                  padding: '8px 6px',
                  backgroundColor: isSel ? 'rgba(var(--accent-rgb,184,151,90),0.15)' : e.bg,
                  cursor: 'pointer',
                  minHeight: '72px',
                  display: 'flex', flexDirection: 'column', gap: '3px',
                  position: 'relative',
                  transition: 'transform 0.1s',
                }}
                onMouseEnter={el => el.currentTarget.style.transform = 'scale(1.03)'}
                onMouseLeave={el => el.currentTarget.style.transform = 'scale(1)'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: isToday ? 700 : 400, color: isToday ? 'var(--accent)' : 'var(--text-1)' }}>{day.day}</span>
                  <div style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: day.resonance === 'birthday' ? '#FFD700' : e.color, flexShrink: 0 }} />
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-2)', lineHeight: 1.2 }}>
                  {day.toneNumber} {day.seal.split(' ')[1] || day.seal}
                </div>
                <div style={{ fontSize: '0.6rem', color: e.color, fontWeight: 500 }}>{e.label}</div>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}

function ListView({ days, todayStr, selected, setSelected }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {days.map(day => {
        const e = ENERGY[day.energyType]
        const res = RESONANCE_STYLE[day.resonance]
        const isToday = day.date === todayStr
        const isSel = selected?.date === day.date
        const dateObj = new Date(day.date + 'T00:00:00')
        const weekday = ['So','Mo','Di','Mi','Do','Fr','Sa'][dateObj.getDay()]
        return (
          <div key={day.date} onClick={() => setSelected(day)} style={{
            display: 'grid', gridTemplateColumns: '48px 1fr auto auto',
            alignItems: 'center', gap: '12px',
            padding: '12px 16px',
            borderRadius: '6px',
            border: isSel ? '2px solid var(--accent)' : res.border,
            backgroundColor: isToday ? 'rgba(var(--accent-rgb,184,151,90),0.08)' : e.bg,
            cursor: 'pointer',
          }}>
            <div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-2)' }}>{weekday}</div>
              <div style={{ fontSize: '1rem', fontWeight: isToday ? 700 : 400, color: isToday ? 'var(--accent)' : 'var(--text-1)' }}>{day.day}.</div>
            </div>
            <div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-1)', fontWeight: 400 }}>
                Kin {day.kin} · {day.tone} {day.seal}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-2)', marginTop: '2px' }}>
                Ton {day.toneNumber} · {day.tonePower} · Thema: {day.lifeTheme}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.72rem', color: e.color, fontWeight: 500 }}>{e.label}</div>
              {day.resonance !== 'none' && <div style={{ fontSize: '0.65rem', color: '#FFD700', marginTop: '2px' }}>{res.label}</div>}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function DayDetail({ day, onClose, navigate }) {
  const e = ENERGY[day.energyType]
  const res = RESONANCE_STYLE[day.resonance]
  const dateObj = new Date(day.date + 'T00:00:00')
  const weekday = ['Sonntag','Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag'][dateObj.getDay()]
  const isToday = day.date === new Date().toISOString().split('T')[0]

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        backgroundColor: 'var(--bg-deep)',
        border: '1px solid var(--border)',
        borderRadius: '16px 16px 0 0',
        padding: '28px 28px 36px',
        width: '100%', maxWidth: '520px',
        animation: 'slideUp 0.2s ease',
      }}>
        <style>{`@keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>
              {weekday}, {dateObj.toLocaleDateString('de-DE')}
              {isToday && <span style={{ color: 'var(--accent)', marginLeft: '8px' }}>· Heute</span>}
            </div>
            <h2 style={{ fontFamily: '"Playfair Display", serif', fontWeight: 400, fontSize: '1.4rem', color: 'var(--text-1)', margin: 0 }}>
              Kin {day.kin} · {day.tone} {day.seal}
            </h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-2)', cursor: 'pointer', fontSize: '1.2rem', padding: '4px' }}>✕</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
          {[
            ['Galaktischer Ton', `${day.toneNumber} – ${day.tone}`],
            ['Kraft', day.tonePower],
            ['Lebensthema', day.lifeTheme],
            ['Antipode', day.antipode],
          ].map(([label, value]) => (
            <div key={label} style={{ padding: '12px', backgroundColor: 'var(--bg-card)', borderRadius: '6px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>{label}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-1)' }}>{value}</div>
            </div>
          ))}
        </div>

        <div style={{ padding: '14px 16px', borderRadius: '8px', backgroundColor: ENERGY[day.energyType].bg, border: `1px solid ${ENERGY[day.energyType].color}30`, marginBottom: '16px' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 600, color: ENERGY[day.energyType].color, marginBottom: '4px' }}>
            {ENERGY[day.energyType].label}energie
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-1)' }}>{ENERGY[day.energyType].desc}</div>
        </div>

        {day.resonance !== 'none' && (
          <div style={{ padding: '12px 16px', borderRadius: '8px', backgroundColor: 'rgba(255,215,0,0.08)', border: '1px solid rgba(255,215,0,0.3)', marginBottom: '16px' }}>
            <div style={{ fontSize: '0.82rem', color: '#FFD700' }}>{res.label} — dieser Tag resoniert besonders mit deiner Geburtsenergie.</div>
          </div>
        )}

        {isToday && (
          <button
            onClick={() => { onClose(); navigate('/tagesenergie') }}
            style={{ width: '100%', backgroundColor: 'var(--accent)', color: 'var(--bg-deep)', border: 'none', borderRadius: '40px', padding: '13px', fontWeight: 500, fontSize: '0.88rem', cursor: 'pointer' }}
          >
            Vollständige Tagesenergie-Analyse öffnen
          </button>
        )}
      </div>
    </div>
  )
}

const navBtn = {
  backgroundColor: 'transparent',
  border: '1px solid var(--border)',
  color: 'var(--text-1)',
  borderRadius: '6px',
  padding: '6px 14px',
  cursor: 'pointer',
  fontSize: '1rem',
}
