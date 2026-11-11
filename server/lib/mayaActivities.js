import { calculateKin, parseCivilDate } from '../../src/lib/mayanCalendar.js'

const SEAL_KNOWLEDGE = [
  { seal: 'Roter Drache',         qualities: 'Geburt, Fürsorge, Empfang, Nähren',              tags: ['launch', 'angebot'],      avoidTags: ['abschluss', 'konfrontation'] },
  { seal: 'Weißer Wind',          qualities: 'Kommunikation, Geist, Botschaft, Klarheit',       tags: ['akquise', 'praesentation', 'netzwerk'],  avoidTags: ['einzelarbeit'] },
  { seal: 'Blaue Nacht',          qualities: 'Träume, Intuition, Fülle, Innenschau',             tags: ['strategie', 'kreativitaet', 'reflexion'], avoidTags: ['akquise', 'konfrontation'] },
  { seal: 'Gelbe Saat',           qualities: 'Zielsetzung, Blüte, Bewusstsein, Fokus',           tags: ['strategie', 'angebot', 'planung'],       avoidTags: [] },
  { seal: 'Rote Schlange',        qualities: 'Lebenskraft, Instinkt, Leidenschaft, Körper',      tags: ['praesentation', 'motivation', 'sport', 'gesundheit'], avoidTags: ['verhandlung', 'detailarbeit'] },
  { seal: 'Weißer Weltenwandler', qualities: 'Wandel, Loslassen, Gleichmut, Übergang',           tags: ['abschluss', 'neuausrichtung'],            avoidTags: ['akquise', 'launch'] },
  { seal: 'Blaue Hand',           qualities: 'Vollendung, Heilung, Leistung, Handeln',           tags: ['abschluss', 'verhandlung', 'lieferung'], avoidTags: [] },
  { seal: 'Gelber Stern',         qualities: 'Schönheit, Eleganz, Ausstrahlung, Kunst',          tags: ['praesentation', 'marketing', 'sichtbarkeit'], avoidTags: [] },
  { seal: 'Roter Mond',           qualities: 'Reinigung, Fließen, Empfang, Intuition',           tags: ['reflexion', 'gesundheit', 'sport'],       avoidTags: ['akquise', 'verhandlung'] },
  { seal: 'Weißer Hund',          qualities: 'Liebe, Loyalität, Treue, Verbindung',              tags: ['netzwerk', 'kooperation', 'teamarbeit'], avoidTags: [] },
  { seal: 'Blauer Affe',          qualities: 'Magie, Spiel, Humor, Leichtigkeit',                tags: ['kreativitaet', 'marketing', 'events'],   avoidTags: ['abschluss'] },
  { seal: 'Gelber Mensch',        qualities: 'Freier Wille, Einfluss, Weisheit, Führung',        tags: ['akquise', 'fuehrung', 'positionierung'], avoidTags: [] },
  { seal: 'Roter Himmelswanderer', qualities: 'Weltdienst, Raum, Ausdehnung, Prophetie',         tags: ['netzwerk', 'oeffentlich', 'praesentation'], avoidTags: [] },
  { seal: 'Weißer Zauberer',      qualities: 'Zeitlosigkeit, Empfang, Magie, Hingabe',           tags: ['strategie', 'vertrauen', 'netzwerk'],    avoidTags: ['zeitdruck'] },
  { seal: 'Blauer Adler',         qualities: 'Vision, Kreativität, Geist, Überblick',            tags: ['strategie', 'praesentation', 'planung'], avoidTags: ['detailarbeit'] },
  { seal: 'Gelber Krieger',       qualities: 'Intelligenz, Mut, Befragung, Furchtlosigkeit',     tags: ['akquise', 'verhandlung', 'konfrontation'], avoidTags: [] },
  { seal: 'Rote Erde',            qualities: 'Navigation, Synchronizität, Evolution, Erdung',    tags: ['planung', 'struktur', 'langfristig'],    avoidTags: [] },
  { seal: 'Weißer Spiegel',       qualities: 'Ordnung, Reflexion, Wahrheit, Klarheit',           tags: ['analyse', 'verhandlung', 'struktur'],    avoidTags: [] },
  { seal: 'Blauer Sturm',         qualities: 'Transformation, Energie, Selbst-Generation',       tags: ['veraenderung', 'sprint', 'restrukturierung', 'sport'], avoidTags: ['stabilitaet'] },
  { seal: 'Gelbe Sonne',          qualities: 'Erleuchtung, Feuer, Sichtbarkeit, Universalität',  tags: ['launch', 'sichtbarkeit', 'oeffentlich'], avoidTags: [] },
]

const TONE_KNOWLEDGE = [
  { toneNumber: 1,  tone: 'Magnetisch',      power: 'Vereint',      qualities: 'Anziehung, neuer Zyklus-Start, Zweck setzen',           tags: ['launch', 'akquise', 'angebot'] },
  { toneNumber: 2,  tone: 'Lunar',           power: 'Polarisiert', qualities: 'Polarität, Herausforderung, Analyse',                    tags: ['analyse', 'reflexion'] },
  { toneNumber: 3,  tone: 'Elektrisch',      power: 'Aktiviert',    qualities: 'Aktivierung, Service, Energie freisetzen',               tags: ['akquise', 'motivation', 'netzwerk', 'sport'] },
  { toneNumber: 4,  tone: 'Selbst-Existent', power: 'Definiert',    qualities: 'Form, Definition, Struktur, Messbarkeit',                tags: ['angebot', 'struktur', 'planung'] },
  { toneNumber: 5,  tone: 'Übertönend',      power: 'Befähigt',     qualities: 'Kernkraft, Ausstrahlung, Stärke',                        tags: ['praesentation', 'fuehrung', 'akquise'] },
  { toneNumber: 6,  tone: 'Rhythmisch',      power: 'Organisiert',  qualities: 'Gleichgewicht, Organisation, Ordnung',                   tags: ['struktur', 'planung'] },
  { toneNumber: 7,  tone: 'Resonant',        power: 'Kanalisiert',  qualities: 'Inspiration, Intuition, Abstimmung',                     tags: ['kreativitaet', 'strategie', 'reflexion'] },
  { toneNumber: 8,  tone: 'Galaktisch',      power: 'Harmonisiert', qualities: 'Integrität, Harmonie, Vorbildfunktion',                  tags: ['vertrauen', 'kooperation', 'netzwerk'] },
  { toneNumber: 9,  tone: 'Solar',           power: 'Pulsiert',     qualities: 'Intention, Realisierung, maximale Energie',              tags: ['akquise', 'sprint', 'abschluss', 'sport'] },
  { toneNumber: 10, tone: 'Planetar',        power: 'Vervollkommnet', qualities: 'Manifestation, Vollendung, sichtbar werden',             tags: ['abschluss', 'launch', 'lieferung'] },
  { toneNumber: 11, tone: 'Spektral',        power: 'Löst auf',     qualities: 'Auflösung, Loslassen, Befreiung',                        tags: ['abschluss', 'neuausrichtung', 'reflexion'] },
  { toneNumber: 12, tone: 'Kristallin',      power: 'Weiht',        qualities: 'Kooperation, Zusammenarbeit, Partnerschaft',             tags: ['kooperation', 'netzwerk', 'teamarbeit'] },
  { toneNumber: 13, tone: 'Kosmisch',        power: 'Überdauert',   qualities: 'Transzendenz, Präsenz, Zyklusabschluss',                 tags: ['abschluss', 'reflexion'] },
]

// Maps user-facing activity names to tags
const ACTIVITY_MAP = {
  akquise:       { label: 'Akquise / Kaltakquise',                requireAny: ['akquise'] },
  abschluss:     { label: 'Vertragsabschluss / Closing',          requireAny: ['abschluss'] },
  praesentation: { label: 'Präsentation / Pitch / Vortrag',       requireAny: ['praesentation', 'oeffentlich'] },
  netzwerk:      { label: 'Netzwerken / Kooperationen',           requireAny: ['netzwerk', 'kooperation'] },
  strategie:     { label: 'Strategie / Planung',                  requireAny: ['strategie', 'planung'] },
  launch:        { label: 'Launch / Neues starten',               requireAny: ['launch'] },
  marketing:     { label: 'Marketing / Sichtbarkeit',             requireAny: ['marketing', 'sichtbarkeit'] },
  kreativitaet:  { label: 'Kreativarbeit / Ideenfindung',         requireAny: ['kreativitaet'] },
  medienarbeit:  { label: 'Medienarbeit / Presse / Interviews',   requireAny: ['oeffentlich', 'sichtbarkeit', 'praesentation'] },
  sport:         { label: 'Sport / Bewegung / Körperarbeit',      requireAny: ['sport', 'motivation', 'sprint'] },
  gesundheit:    { label: 'Gesundheit / Regeneration',            requireAny: ['reflexion', 'gesundheit'] },
  teamarbeit:    { label: 'Teamarbeit / Meetings',                requireAny: ['teamarbeit', 'kooperation'] },
  reflexion:     { label: 'Reflexion / Meditation / Innenschau',  requireAny: ['reflexion'] },
  veraenderung:  { label: 'Veränderung / Transformation',         requireAny: ['veraenderung', 'neuausrichtung'] },
  fuehrung:      { label: 'Führung / Entscheidungen treffen',     requireAny: ['fuehrung', 'akquise'] },
  finanzen:      { label: 'Finanzen / Investitionen',             requireAny: ['analyse', 'struktur', 'abschluss'] },
  lesung:        { label: 'Lesung / Buchpräsentation / Verlag',   requireAny: ['oeffentlich', 'sichtbarkeit', 'praesentation'] },
  contentcreation: { label: 'Content Creation / Schreiben',       requireAny: ['kreativitaet', 'marketing'] },
}

// Keywords in user messages that map to activity keys
const ACTIVITY_KEYWORDS = {
  akquise:       ['akquise', 'kaltakquise', 'kunden gewinnen', 'kundenakquise', 'neukundengewinnung', 'verkaufen', 'vertrieb'],
  abschluss:     ['abschluss', 'vertrag', 'closing', 'deal abschließen', 'abschließen'],
  praesentation: ['präsentation', 'pitch', 'vorstellen', 'vortrag', 'keynote'],
  netzwerk:      ['netzwerk', 'netzwerken', 'kooperation', 'partner', 'kontakte knüpfen'],
  strategie:     ['strategie', 'planung', 'businessplan', 'planen'],
  launch:        ['launch', 'produktstart', 'auf den markt bringen'],
  marketing:     ['marketing', 'social media', 'werbung', 'branding', 'reichweite'],
  kreativitaet:  ['kreativität', 'kreativ', 'ideen entwickeln', 'content erstellen'],
  medienarbeit:  ['medienarbeit', 'presse', 'pressemitteilung', 'interview', 'journalist', 'zeitung', 'radio', 'tv', 'podcast'],
  sport:         ['sport', 'training', 'fitness', 'bewegung', 'workout', 'laufen', 'kraft'],
  gesundheit:    ['gesundheit', 'regeneration', 'heilung', 'arzt', 'therapie', 'erholung'],
  teamarbeit:    ['meeting', 'team', 'teamarbeit', 'besprechung', 'workshop'],
  reflexion:     ['meditation', 'reflexion', 'innenschau', 'rückzug', 'journaling', 'stille'],
  veraenderung:  ['veränderung', 'transformation', 'neustart', 'umschwung', 'restrukturierung'],
  fuehrung:      ['führung', 'entscheidung', 'management', 'leitung', 'chef'],
  finanzen:      ['finanzen', 'investition', 'geld anlegen', 'buchhaltung', 'steuer'],
  lesung:        ['lesung', 'buchpräsentation', 'buch', 'verlag', 'autor', 'autorin', 'veröffentlichung', 'buchvorstellung', 'signierstunde'],
  contentcreation: ['content', 'schreiben', 'texten', 'blog', 'newsletter', 'artikel schreiben'],
}

function getSealKnowledge(sealName) {
  return SEAL_KNOWLEDGE.find(s => s.seal === sealName) || null
}
function getToneKnowledge(toneNumber) {
  return TONE_KNOWLEDGE.find(t => t.toneNumber === toneNumber) || null
}

// Detect which activities the user is asking about (returns array, first = primary)
function detectActivity(messages) {
  const text = [...messages].reverse().find(m => m.role === 'user')?.content?.toLowerCase() || ''
  const found = []
  for (const [key, keywords] of Object.entries(ACTIVITY_KEYWORDS)) {
    if (keywords.some(kw => new RegExp(`(^|[^\\p{L}])${kw}([^\\p{L}]|$)`, 'u').test(text))) {
      found.push(key)
    }
  }
  return found.length > 0 ? found[0] : null
}

// Deterministically compute which days are good for a given activity
// App heuristic: seal OR tone match, unless seal avoidTags vetoes the activity.
function computeGoodDays(activityKey, today, endDate) {
  const activity = ACTIVITY_MAP[activityKey]
  if (!activity) return null
  const goodDays = []
  const cursor = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()))
  const end = new Date(Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth(), endDate.getUTCDate()))
  while (cursor <= end) {
    const dateStr = cursor.toISOString().split('T')[0]
    const k = calculateKin(dateStr)
    const sk = getSealKnowledge(k.seal)
    const tk = getToneKnowledge(k.toneNumber)
    if (!sk || !tk) { cursor.setUTCDate(cursor.getUTCDate() + 1); continue }
    const sealMatch = activity.requireAny.some(tag => sk.tags.includes(tag))
    const toneMatch = activity.requireAny.some(tag => tk.tags.includes(tag))
    // Day qualifies if seal OR tone has the activity tag (one is enough for a signal)
    const veto = activity.requireAny.some(tag => sk.avoidTags.includes(tag))
    if ((sealMatch || toneMatch) && !veto) {
      const display = cursor.toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' })
      const sealReason = sealMatch ? `${k.seal} (${sk.qualities})` : null
      const toneReason = toneMatch ? `Ton ${k.toneNumber} ${k.tone} (${tk.qualities})` : null
      const reason = `${k.seal} (${sk.qualities}) + Ton ${k.toneNumber} ${k.tone} (${tk.qualities}); App-Tag-Treffer: ${sealMatch ? 'Siegel' : ''}${sealMatch && toneMatch ? ' und ' : ''}${toneMatch ? 'Ton' : ''}`
      goodDays.push(`${display} = Kin ${k.kin} | ${reason}`)
    }
    cursor.setUTCDate(cursor.getUTCDate() + 1)
  }
  return { label: activity.label, days: goodDays }
}

// Resolve common explicit civil-date ranges without asking the language model to calculate.
function resolveActivityRange(messages, today, tableEnd) {
  const text = [...messages].reverse().find(m => m.role === 'user')?.content?.toLowerCase() || ''
  const rawDates = [...text.matchAll(/\b(\d{4}-\d{2}-\d{2}|\d{1,2}\.\d{1,2}\.\d{4})\b/g)]
  const dates = rawDates.map(m => {
    try { const c = parseCivilDate(m[1]); return new Date(Date.UTC(c.year,c.month-1,c.day)) } catch { return null }
  }).filter(Boolean)
  if (dates.length !== rawDates.length) return null
  if (dates.some(d => d.getUTCFullYear() < 1900 || d.getUTCFullYear() > 2100)) return null
  if (dates.length >= 2) {
    // Use first and last date in the list as range boundaries (F03: support > 2 dates)
    const sorted = [...dates].sort((a, b) => a - b)
    const start = sorted[0]
    const end = sorted[sorted.length - 1]
    if (end - start > 366 * 86400000) return null
    return start <= end ? { start, end } : null
  }
  if (dates.length === 1) {
    // "bis zum 15.12." or similar: single end date → range from today to that date (F02)
    const isBisPattern = /\bbis\b/.test(text)
    if (isBisPattern && dates[0] >= today) return { start: today, end: dates[0] }
    return { start: dates[0], end: dates[0] }
  }
  const months = ['januar','februar','märz','april','mai','juni','juli','august','september','oktober','november','dezember']
  const y = text.match(/\b(19\d{2}|20\d{2}|2100)\b/)
  const year = y ? Number(y[1]) : today.getUTCFullYear()
  const mentionedMonths = months.filter(m => new RegExp(`(^|[^\\p{L}])${m}([^\\p{L}]|$)`, 'u').test(text))
  if (mentionedMonths.length > 1) return null
  let month = mentionedMonths.length ? months.indexOf(mentionedMonths[0]) : -1
  let selectedYear = year
  if (/nächsten monat|kommenden monat/.test(text)) { month = (today.getUTCMonth() + 1) % 12; selectedYear = today.getUTCFullYear() + (month === 0 ? 1 : 0) }
  else if (/diesen monat|diesem monat/.test(text)) month = today.getUTCMonth()
  if (month >= 0) return { start: new Date(Date.UTC(selectedYear,month,1)), end: new Date(Date.UTC(selectedYear,month+1,0)) }
  if (y) return { start: new Date(Date.UTC(year,0,1)), end: new Date(Date.UTC(year,11,31)) }
  // F01: "jahresende" / "rest des jahres" → end of CURRENT year, not tableEnd
  if (/jahresende|rest des jahres/.test(text)) {
    const yearEnd = new Date(Date.UTC(today.getUTCFullYear(), 11, 31))
    return { start: today, end: yearEnd }
  }
  // F04: "heute und morgen" or "heute" alone
  if (/heute und morgen/.test(text)) {
    const tomorrow = new Date(today); tomorrow.setUTCDate(tomorrow.getUTCDate() + 1)
    return { start: today, end: tomorrow }
  }
  // F04: "übermorgen"
  if (/übermorgen/.test(text)) {
    const dayAfter = new Date(today); dayAfter.setUTCDate(dayAfter.getUTCDate() + 2)
    return { start: dayAfter, end: dayAfter }
  }
  if (/\bmorgen\b/.test(text)) { const next = new Date(today); next.setUTCDate(next.getUTCDate()+1); return { start: next, end: next } }
  if (/\bheute\b/.test(text)) return { start: today, end: today }
  // No unrequested default list for an unspecified week, relative span or arbitrary period.
  return null
}

// Generate Kin table from today through endDate (inclusive)
// Each row includes verifiable Dreamspell qualities for seal and tone
function generateKinTable(today, endDate) {
  const rows = []
  const cursor = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()))
  const end = new Date(Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth(), endDate.getUTCDate()))
  while (cursor <= end) {
    const dateStr = cursor.toISOString().split('T')[0]
    const k = calculateKin(dateStr)
    const display = cursor.toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' })
    const sk = getSealKnowledge(k.seal)
    const tk = getToneKnowledge(k.toneNumber)
    if (k.specialDay) { rows.push(`${display} = 0.0 Hunab Ku, kein reguläres Kin`); cursor.setUTCDate(cursor.getUTCDate() + 1); continue }
    const goodFor = sk && tk ? `Siegel-Qualität: ${sk.qualities} | App-Tags: ${sk.tags.join(", ")} | Ton-Qualität: ${tk.qualities}` : ''
    rows.push(`${display} = Kin ${k.kin} | ${k.tone} ${k.seal} | Ton ${k.toneNumber} (${k.tonePower}) | ${goodFor}`)
    cursor.setUTCDate(cursor.getUTCDate() + 1)
  }
  return rows
}

// Extract dates from text and return their Kin data
function extractAndCalculateDates(text, today) {
  const results = []
  const seen = new Set()

  // Patterns: DD.MM.YYYY, DD.MM.YY, YYYY-MM-DD
  const patterns = [
    /\b(\d{1,2})\.(\d{1,2})\.(\d{4})\b/g,
    /\b(\d{1,2})\.(\d{1,2})\.(\d{2})\b/g,
    /\b(\d{4})-(\d{2})-(\d{2})\b/g,
  ]

  for (const pattern of patterns) {
    let match
    while ((match = pattern.exec(text)) !== null) {
      let dateStr
      if (pattern.source.startsWith('\\b(\\d{4})')) {
        // YYYY-MM-DD
        dateStr = `${match[1]}-${match[2].padStart(2,'0')}-${match[3].padStart(2,'0')}`
      } else {
        // DD.MM.YYYY or DD.MM.YY
        const day = match[1].padStart(2,'0')
        const month = match[2].padStart(2,'0')
        let year = match[3]
        if (year.length === 2) year = (parseInt(year) >= 50 ? '19' : '20') + year
        dateStr = `${year}-${month}-${day}`
      }
      if (seen.has(dateStr)) continue
      // Validate
      const d = new Date(dateStr + 'T00:00:00Z')
      try { parseCivilDate(dateStr) } catch { continue }
      // Only include dates within a reasonable range (1900–2100)
      if (d.getFullYear() < 1900 || d.getFullYear() > 2100) continue
      seen.add(dateStr)
      const kin = calculateKin(dateStr)
      const display = d.toLocaleDateString('de-DE', { day:'2-digit', month:'2-digit', year:'numeric', timeZone:'UTC' })
      results.push({ display, kin })
    }
  }
  return results
}


export { SEAL_KNOWLEDGE, TONE_KNOWLEDGE, ACTIVITY_MAP, detectActivity, computeGoodDays, generateKinTable, extractAndCalculateDates, resolveActivityRange }
