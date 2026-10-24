import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import { supabase } from '../lib/supabase.js'
import AnalysisDisplay from '../components/AnalysisDisplay.jsx'
import { getRegenDay, getRegenSymbol, REGEN_LEGEND } from '../data/regenDays.js'

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
  const { user, profile } = useAuth()
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
    <div style={{ backgroundColor: 'var(--bg-deep)', minHeight: '100vh', padding: 'clamp(16px, 4vw, 40px) clamp(12px, 3vw, 32px)', fontFamily: 'Inter, sans-serif' }}>
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

        {/* Legend — Energietypen (Punkte) */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '10px', flexWrap: 'wrap' }}>
          {Object.entries(ENERGY).map(([k, e]) => (
            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: e.color }} />
              <span style={{ color: 'var(--text-2)', fontSize: '0.75rem' }}>{e.label}</span>
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#FFD700' }} />
            <span style={{ color: 'var(--text-2)', fontSize: '0.75rem' }}>Kraft-Tag</span>
          </div>
        </div>

        {/* Legend — Rahmenfarben */}
        <div style={{ display: 'flex', gap: '14px', marginBottom: '10px', flexWrap: 'wrap' }}>
          {[
            { border: '2px solid #FFD700', label: 'Geburtstags-Resonanz' },
            { border: '2px solid var(--accent)', label: 'Siegel-Resonanz' },
            { border: '2px solid #7B9ED9', label: 'Ton-Resonanz' },
            { border: '1px dashed var(--accent)', label: 'Wellen-Resonanz' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
              <div style={{ width: '18px', height: '14px', borderRadius: '3px', border: item.border }} />
              <span style={{ color: 'var(--text-2)', fontSize: '0.72rem' }}>{item.label}</span>
            </div>
          ))}
        </div>

        {/* Legend — Regenerationstage */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {REGEN_LEGEND.map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ fontSize: '0.75rem', color: item.symbol === '〰' ? '#7B9ED9' : '#C47A5A' }}>{item.symbol}</span>
              <span style={{ color: 'var(--text-2)', fontSize: '0.72rem' }}>{item.label}</span>
            </div>
          ))}
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
          <DayDetail day={selected} onClose={() => setSelected(null)} navigate={navigate} profile={profile} />
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
            const regen = getRegenDay(day.date)
            const regenInfo = getRegenSymbol(regen)
            return (
              <div
                key={di}
                onClick={() => setSelected(day)}
                style={{
                  border: isSel ? '2px solid var(--accent)' : isToday ? '2px solid rgba(255,255,255,0.7)' : regen?.wave ? '1px solid rgba(123,158,217,0.6)' : regen ? `1px solid rgba(196,122,90,0.4)` : res.border,
                  borderRadius: '6px',
                  padding: '8px 6px',
                  backgroundColor: isSel ? 'rgba(var(--accent-rgb,184,151,90),0.15)' : isToday ? 'rgba(var(--accent-rgb,184,151,90),0.1)' : regen?.wave ? 'rgba(123,158,217,0.18)' : regen ? `${e.bg}` : e.bg,
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
                  <span style={{
                    fontSize: '0.82rem', fontWeight: isToday ? 700 : 400,
                    color: isToday ? 'var(--bg-deep)' : 'var(--text-1)',
                    backgroundColor: isToday ? 'var(--accent)' : 'transparent',
                    borderRadius: isToday ? '50%' : '0',
                    width: isToday ? '20px' : 'auto', height: isToday ? '20px' : 'auto',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    lineHeight: 1,
                  }}>{day.day}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                    {regenInfo && (
                      <span style={{ fontSize: '0.72rem', color: regenInfo.color, lineHeight: 1, fontWeight: 600 }}>
                        {regenInfo.symbol}
                      </span>
                    )}
                    <div style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: day.resonance === 'birthday' ? '#FFD700' : e.color }} />
                  </div>
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
        const regen = getRegenDay(day.date)
        const regenInfo = getRegenSymbol(regen)
        return (
          <div key={day.date} onClick={() => setSelected(day)} style={{
            display: 'grid', gridTemplateColumns: '48px 1fr auto',
            alignItems: 'center', gap: '12px',
            padding: '12px 16px',
            borderRadius: '6px',
            border: isSel ? '2px solid var(--accent)' : regen?.wave ? '1px solid rgba(123,158,217,0.6)' : regen ? '1px solid rgba(196,122,90,0.4)' : res.border,
            backgroundColor: isToday ? 'rgba(var(--accent-rgb,184,151,90),0.08)' : regen?.wave ? 'rgba(123,158,217,0.1)' : e.bg,
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
            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px' }}>
              <div style={{ fontSize: '0.72rem', color: e.color, fontWeight: 500 }}>{e.label}</div>
              {day.resonance !== 'none' && <div style={{ fontSize: '0.65rem', color: 'var(--accent)' }}>{res.label}</div>}
              {regenInfo && <div style={{ fontSize: '0.82rem', color: regenInfo.color, fontWeight: 600 }}>{regenInfo.symbol}</div>}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function DayDetail({ day, onClose, navigate, profile }) {
  const en = ENERGY[day.energyType]
  const res = RESONANCE_STYLE[day.resonance]
  const dateObj = new Date(day.date + 'T00:00:00')
  const weekday = ['Sonntag','Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag'][dateObj.getDay()]
  const todayDate = new Date().toISOString().split('T')[0]
  const isToday = day.date === todayDate
  const canCreateForDate = profile?.is_admin || profile?.subscription_plan === 'annual' || isToday

  const regen = getRegenDay(day.date)
  const regenInfo = getRegenSymbol(regen)

  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)
  const [checked, setChecked] = useState(false)
  const [showAnalysis, setShowAnalysis] = useState(false)

  const checkExisting = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch(`/api/analysis/daily?date=${day.date}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      const data = await res.json()
      if (data.content) { setAnalysis(data.content); setShowAnalysis(true) }
    } catch {}
    finally { setChecked(true) }
  }, [day.date])

  useEffect(() => { checkExisting() }, [checkExisting])

  async function createAnalysis() {
    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/analysis/daily', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ date: day.date }),
      })
      const data = await res.json()
      setAnalysis(data.content)
      setShowAnalysis(true)
    } catch {}
    finally { setLoading(false) }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      backgroundColor: 'rgba(0,0,0,0.55)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px',
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        backgroundColor: 'var(--bg-deep)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: '28px 28px 32px',
        width: '100%', maxWidth: '560px',
        maxHeight: '90vh', overflowY: 'auto',
        animation: 'fadeIn 0.2s ease',
      }}>
        <style>{`@keyframes fadeIn { from { opacity: 0; transform: scale(0.97); } to { opacity: 1; transform: scale(1); } }`}</style>

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

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
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

        <div style={{ padding: '14px 16px', borderRadius: '8px', backgroundColor: en.bg, border: `1px solid ${en.color}30`, marginBottom: '12px' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 600, color: en.color, marginBottom: '4px' }}>{en.label}energie</div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-1)' }}>{en.desc}</div>
        </div>

        {day.resonance !== 'none' && (
          <div style={{ padding: '12px 16px', borderRadius: '8px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', marginBottom: '16px' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--accent)', marginBottom: '2px' }}>{res.label}</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-1)' }}>Dieser Tag resoniert besonders mit deiner Geburtsenergie.</div>
          </div>
        )}

        {/* Regenerationstag */}
        {regenInfo && (
          <div style={{ padding: '12px 16px', borderRadius: '8px', backgroundColor: regen.wave ? 'rgba(123,158,217,0.08)' : 'rgba(196,122,90,0.08)', border: `1px solid ${regen.wave ? 'rgba(123,158,217,0.3)' : 'rgba(196,122,90,0.3)'}`, marginBottom: '16px' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: regenInfo.color, marginBottom: '4px' }}>
              {regenInfo.symbol} {regenInfo.label}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-2)', lineHeight: 1.6 }}>
              {regen.wave
                ? 'Sturmwelle · Heilwelle: Ideale Zeit für Urlaub, Regeneration und Heilungsprozesse. Diese 13-tägige Periode gilt für alle Menschen.'
                : [
                  'Leichter Ruhetag. Tempo ein wenig herausnehmen, unnötige Termine vermeiden. Der Körper dankt kurze Pausen.',
                  'Bewusster Pausentag. Weniger planen, mehr sein lassen. Wichtige Entscheidungen und intensive Gespräche auf morgen verschieben.',
                  'Starker Regenerationstag. Rückzug empfohlen. Kein Stress, kein voller Terminkalender. Körper und Geist brauchen heute echte Stille.',
                  'Maximaler Regenerationstag. Unbedingt Ruhe einplanen. Wer heute gegen den Strom schwimmt, zahlt einen hohen Preis. Vollständiger Rückzug ist keine Schwäche, sondern Intelligenz.',
                ][regen.level] || 'Leichter Ruhetag. Tempo ein wenig herausnehmen.'}
            </div>
          </div>
        )}

        {/* Tagesanalyse */}
        {checked && (
          <div style={{ marginTop: '20px', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
            {showAnalysis && analysis ? (
              <>
                <div style={{ fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--accent)', marginBottom: '12px' }}>
                  Tagesanalyse
                </div>
                <AnalysisDisplay content={analysis} />
                <button
                  onClick={() => { setAnalysis(null); setShowAnalysis(false); createAnalysis() }}
                  style={{ marginTop: '16px', border: '1px solid var(--border)', color: 'var(--text-2)', background: 'transparent', borderRadius: '40px', padding: '9px 20px', fontSize: '0.8rem', cursor: 'pointer' }}
                >
                  Neu erstellen
                </button>
              </>
            ) : canCreateForDate ? (
              <button
                onClick={createAnalysis}
                disabled={loading}
                style={{ width: '100%', backgroundColor: 'var(--accent)', color: 'var(--bg-deep)', border: 'none', borderRadius: '40px', padding: '13px', fontWeight: 500, fontSize: '0.88rem', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
              >
                {loading ? 'Analyse wird erstellt…' : `Tagesanalyse für ${dateObj.toLocaleDateString('de-DE')} erstellen`}
              </button>
            ) : (
              <div style={{ padding: '14px 16px', borderRadius: '8px', backgroundColor: 'rgba(184,151,90,0.06)', border: '1px solid rgba(184,151,90,0.2)', fontSize: '0.82rem', color: 'var(--text-2)', lineHeight: 1.6 }}>
                Tagesanalysen für vergangene und zukünftige Daten sind im{' '}
                <strong style={{ color: 'var(--accent)' }}>Jahrestarif</strong> verfügbar.
                Heute kannst du jederzeit eine Analyse erstellen.
              </div>
            )}
          </div>
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
