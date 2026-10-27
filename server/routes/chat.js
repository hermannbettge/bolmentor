import { Router } from 'express'
import Anthropic from '@anthropic-ai/sdk'
import { supabase } from '../lib/supabase.js'

const router = Router()
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SEALS = [
  'Roter Drachen', 'Weißer Wind', 'Blaue Nacht', 'Gelbe Saat',
  'Rote Schlange', 'Weißer Weltenwandler', 'Blaue Hand', 'Gelber Stern',
  'Roter Mond', 'Weißer Hund', 'Blauer Affe', 'Gelber Mensch',
  'Rotes Schilf', 'Weißer Zauberer', 'Blauer Adler', 'Gelber Krieger',
  'Rote Erde', 'Weißes Spiegelmesser', 'Blauer Sturm', 'Gelbe Sonne',
]
const TONES = [
  'Magnetisch', 'Lunar', 'Elektrisch', 'Selbst-Existent', 'Übertönend',
  'Rhythmisch', 'Resonant', 'Galaktisch', 'Solar', 'Planetar',
  'Spektral', 'Kristallin', 'Kosmisch',
]
const TONE_POWERS = [
  'Vereint', 'Stabilisiert', 'Aktiviert', 'Definiert', 'Befähigt',
  'Organisiert', 'Kanalisiert', 'Harmonisiert', 'Pulsiert', 'Manifestiert',
  'Löst auf', 'Weiht', 'Überdauert',
]
const LIFE_THEMES = [
  'Pflege und Geburt des Neuen', 'Kommunikation und Geist', 'Träumen und Intuition',
  'Blühen und Zielen', 'Lebenskraft und Bewegung', 'Tod und Wandel',
  'Heilen und Vollenden', 'Kunst und Schönheit', 'Reinigung und Fließen',
  'Liebe und Loyalität', 'Magie und Spielen', 'Freier Wille und Weisheit',
  'Weltdienst und Erkundung', 'Zauberei und Zeitlosigkeit', 'Vision und Kreativität',
  'Intelligenz und Furchtlosigkeit', 'Navigation und Synchronizität', 'Reflektion und Ordnung',
  'Transformation und Selbst-Generation', 'Erleuchtung und universelles Feuer',
]

// Structured knowledge base: verifiable meanings for each seal and tone
// Source: Dreamspell / José Argüelles system
// Structured Dreamspell knowledge base with machine-readable activity tags
// Tags are the single source of truth — MAYA never decides this itself
const SEAL_KNOWLEDGE = [
  { seal: 'Roter Drachen',        qualities: 'Geburt, Fürsorge, Empfang, Nähren',              tags: ['launch', 'angebot'],      avoidTags: ['abschluss', 'konfrontation'] },
  { seal: 'Weißer Wind',          qualities: 'Kommunikation, Geist, Botschaft, Klarheit',       tags: ['akquise', 'praesentation', 'netzwerk'],  avoidTags: ['einzelarbeit'] },
  { seal: 'Blaue Nacht',          qualities: 'Träume, Intuition, Fülle, Innenschau',             tags: ['strategie', 'kreativitaet', 'reflexion'], avoidTags: ['akquise', 'konfrontation'] },
  { seal: 'Gelbe Saat',           qualities: 'Zielsetzung, Blüte, Bewusstsein, Fokus',           tags: ['strategie', 'angebot', 'planung'],       avoidTags: [] },
  { seal: 'Rote Schlange',        qualities: 'Lebenskraft, Instinkt, Leidenschaft, Körper',      tags: ['praesentation', 'motivation'],           avoidTags: ['verhandlung', 'detailarbeit'] },
  { seal: 'Weißer Weltenwandler', qualities: 'Wandel, Loslassen, Gleichmut, Übergang',           tags: ['abschluss', 'neuausrichtung'],            avoidTags: ['akquise', 'launch'] },
  { seal: 'Blaue Hand',           qualities: 'Vollendung, Heilung, Leistung, Handeln',           tags: ['abschluss', 'verhandlung', 'lieferung'], avoidTags: [] },
  { seal: 'Gelber Stern',         qualities: 'Schönheit, Eleganz, Ausstrahlung, Kunst',          tags: ['praesentation', 'marketing', 'sichtbarkeit'], avoidTags: [] },
  { seal: 'Roter Mond',           qualities: 'Reinigung, Fließen, Empfang, Intuition',           tags: ['reflexion', 'gesundheit'],               avoidTags: ['akquise', 'verhandlung'] },
  { seal: 'Weißer Hund',          qualities: 'Liebe, Loyalität, Treue, Verbindung',              tags: ['netzwerk', 'kooperation', 'teamarbeit'], avoidTags: [] },
  { seal: 'Blauer Affe',          qualities: 'Magie, Spiel, Humor, Leichtigkeit',                tags: ['kreativitaet', 'marketing', 'events'],   avoidTags: ['abschluss'] },
  { seal: 'Gelber Mensch',        qualities: 'Freier Wille, Einfluss, Weisheit, Führung',        tags: ['akquise', 'fuehrung', 'positionierung'], avoidTags: [] },
  { seal: 'Rotes Schilf',         qualities: 'Weltdienst, Raum, Ausdehnung, Prophetie',          tags: ['netzwerk', 'oeffentlich', 'praesentation'], avoidTags: [] },
  { seal: 'Weißer Zauberer',      qualities: 'Zeitlosigkeit, Empfang, Magie, Hingabe',           tags: ['strategie', 'vertrauen', 'netzwerk'],    avoidTags: ['zeitdruck'] },
  { seal: 'Blauer Adler',         qualities: 'Vision, Kreativität, Geist, Überblick',            tags: ['strategie', 'praesentation', 'planung'], avoidTags: ['detailarbeit'] },
  { seal: 'Gelber Krieger',       qualities: 'Intelligenz, Mut, Befragung, Furchtlosigkeit',     tags: ['akquise', 'verhandlung', 'konfrontation'], avoidTags: [] },
  { seal: 'Rote Erde',            qualities: 'Navigation, Synchronizität, Evolution, Erdung',    tags: ['planung', 'struktur', 'langfristig'],    avoidTags: [] },
  { seal: 'Weißes Spiegelmesser', qualities: 'Ordnung, Reflexion, Wahrheit, Klarheit',           tags: ['analyse', 'verhandlung', 'struktur'],    avoidTags: [] },
  { seal: 'Blauer Sturm',         qualities: 'Transformation, Energie, Selbst-Generation',       tags: ['veraenderung', 'sprint', 'restrukturierung'], avoidTags: ['stabilitaet'] },
  { seal: 'Gelbe Sonne',          qualities: 'Erleuchtung, Feuer, Sichtbarkeit, Universalität',  tags: ['launch', 'sichtbarkeit', 'oeffentlich'], avoidTags: [] },
]

const TONE_KNOWLEDGE = [
  { toneNumber: 1,  tone: 'Magnetisch',      power: 'Vereint',      qualities: 'Anziehung, neuer Zyklus-Start, Zweck setzen',           tags: ['launch', 'akquise', 'angebot'] },
  { toneNumber: 2,  tone: 'Lunar',           power: 'Stabilisiert', qualities: 'Polarität, Herausforderung, Analyse',                    tags: ['analyse', 'reflexion'] },
  { toneNumber: 3,  tone: 'Elektrisch',      power: 'Aktiviert',    qualities: 'Aktivierung, Service, Energie freisetzen',               tags: ['akquise', 'motivation', 'netzwerk'] },
  { toneNumber: 4,  tone: 'Selbst-Existent', power: 'Definiert',    qualities: 'Form, Definition, Struktur, Messbarkeit',                tags: ['angebot', 'struktur', 'planung'] },
  { toneNumber: 5,  tone: 'Übertönend',      power: 'Befähigt',     qualities: 'Kernkraft, Ausstrahlung, Stärke',                        tags: ['praesentation', 'fuehrung', 'akquise'] },
  { toneNumber: 6,  tone: 'Rhythmisch',      power: 'Organisiert',  qualities: 'Gleichgewicht, Organisation, Ordnung',                   tags: ['struktur', 'planung'] },
  { toneNumber: 7,  tone: 'Resonant',        power: 'Kanalisiert',  qualities: 'Inspiration, Intuition, Abstimmung',                     tags: ['kreativitaet', 'strategie', 'reflexion'] },
  { toneNumber: 8,  tone: 'Galaktisch',      power: 'Harmonisiert', qualities: 'Integrität, Harmonie, Vorbildfunktion',                  tags: ['vertrauen', 'kooperation', 'netzwerk'] },
  { toneNumber: 9,  tone: 'Solar',           power: 'Pulsiert',     qualities: 'Intention, Realisierung, maximale Energie',              tags: ['akquise', 'sprint', 'abschluss'] },
  { toneNumber: 10, tone: 'Planetar',        power: 'Manifestiert', qualities: 'Manifestation, Vollendung, sichtbar werden',             tags: ['abschluss', 'launch', 'lieferung'] },
  { toneNumber: 11, tone: 'Spektral',        power: 'Löst auf',     qualities: 'Auflösung, Loslassen, Befreiung',                        tags: ['abschluss', 'neuausrichtung', 'reflexion'] },
  { toneNumber: 12, tone: 'Kristallin',      power: 'Weiht',        qualities: 'Kooperation, Zusammenarbeit, Partnerschaft',             tags: ['kooperation', 'netzwerk', 'teamarbeit'] },
  { toneNumber: 13, tone: 'Kosmisch',        power: 'Überdauert',   qualities: 'Transzendenz, Präsenz, Zyklusabschluss',                 tags: ['abschluss', 'reflexion'] },
]

// Maps user-facing activity names to tags (both seal AND tone must have at least one matching tag)
const ACTIVITY_MAP = {
  akquise:       { label: 'Akquise / Kaltakquise',          requireAny: ['akquise'],       avoidAny: [] },
  abschluss:     { label: 'Vertragsabschluss / Closing',    requireAny: ['abschluss'],     avoidAny: [] },
  praesentation: { label: 'Präsentation / Pitch',           requireAny: ['praesentation'], avoidAny: [] },
  netzwerk:      { label: 'Netzwerken / Kooperationen',     requireAny: ['netzwerk', 'kooperation'], avoidAny: [] },
  strategie:     { label: 'Strategie / Planung',            requireAny: ['strategie', 'planung'],    avoidAny: [] },
  launch:        { label: 'Launch / Neues starten',         requireAny: ['launch'],        avoidAny: [] },
  marketing:     { label: 'Marketing / Sichtbarkeit',       requireAny: ['marketing', 'sichtbarkeit'], avoidAny: [] },
  kreativitaet:  { label: 'Kreativarbeit',                  requireAny: ['kreativitaet'],  avoidAny: [] },
}

// Keywords in user messages that map to activity keys
const ACTIVITY_KEYWORDS = {
  akquise:       ['akquise', 'kaltakquise', 'kunden gewinnen', 'kundenakquise', 'neukundengewinnung', 'verkaufen', 'vertrieb'],
  abschluss:     ['abschluss', 'vertrag', 'closing', 'deal abschließen', 'abschließen'],
  praesentation: ['präsentation', 'pitch', 'vorstellen', 'vortrag', 'keynote'],
  netzwerk:      ['netzwerk', 'netzwerken', 'kooperation', 'partner', 'kontakte knüpfen'],
  strategie:     ['strategie', 'planung', 'businessplan', 'planen'],
  launch:        ['launch', 'start', 'produktstart', 'auf den markt', 'veröffentlichung'],
  marketing:     ['marketing', 'sichtbarkeit', 'social media', 'werbung', 'branding'],
  kreativitaet:  ['kreativität', 'kreativ', 'ideen', 'content erstellen'],
}

function getSealKnowledge(sealName) {
  return SEAL_KNOWLEDGE.find(s => s.seal === sealName) || null
}
function getToneKnowledge(toneNumber) {
  return TONE_KNOWLEDGE.find(t => t.toneNumber === toneNumber) || null
}

// Detect which activity the user is asking about
function detectActivity(messages) {
  const text = messages.map(m => m.content).join(' ').toLowerCase()
  for (const [key, keywords] of Object.entries(ACTIVITY_KEYWORDS)) {
    if (keywords.some(kw => text.includes(kw))) return key
  }
  return null
}

// Deterministically compute which days are good for a given activity
// A day qualifies if its seal AND tone both have at least one tag matching the activity's requireAny list
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
    if (sealMatch || toneMatch) {
      const display = cursor.toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' })
      const sealReason = sealMatch ? `${k.seal} (${sk.qualities})` : null
      const toneReason = toneMatch ? `Ton ${k.toneNumber} ${k.tone} (${tk.qualities})` : null
      const reason = [sealReason, toneReason].filter(Boolean).join(' + ')
      goodDays.push(`${display} = Kin ${k.kin} | ${reason}`)
    }
    cursor.setUTCDate(cursor.getUTCDate() + 1)
  }
  return { label: activity.label, days: goodDays }
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
    const goodFor = sk && tk ? `Gut für: ${sk.goodFor} | Ton-Qualität: ${tk.qualities}` : ''
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
      if (isNaN(d.getTime())) continue
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

const ANCHOR_DATE = new Date('1993-07-26T00:00:00Z')
const ANCHOR_KIN_0 = 143

function isLeapYear(y) {
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0
}
function countLeapDaysBetween(d1, d2) {
  const [from, to] = d1 <= d2 ? [d1, d2] : [d2, d1]
  let count = 0
  for (let y = from.getUTCFullYear(); y <= to.getUTCFullYear(); y++) {
    if (isLeapYear(y)) {
      const feb29 = new Date(Date.UTC(y, 1, 29))
      if (feb29 > from && feb29 <= to) count++
    }
  }
  return count
}
function calculateKin(dateStr) {
  const d = new Date(dateStr + 'T00:00:00Z')
  const rawDiff = Math.floor((d - ANCHOR_DATE) / 86400000)
  const leapDays = countLeapDaysBetween(d, ANCHOR_DATE)
  const adjustedDiff = rawDiff + (rawDiff < 0 ? leapDays : -leapDays)
  const kin = ((ANCHOR_KIN_0 + adjustedDiff) % 260 + 260) % 260
  const sealIndex = kin % 20
  const toneIndex = kin % 13
  return {
    kin: kin + 1,
    seal: SEALS[sealIndex],
    tone: TONES[toneIndex],
    toneNumber: toneIndex + 1,
    tonePower: TONE_POWERS[toneIndex],
    antipode: SEALS[(sealIndex + 10) % 20],
    lifeTheme: LIFE_THEMES[sealIndex],
    wavespell: Math.floor(kin / 13) + 1,
  }
}

// Topic labels for display and system prompt
const TOPIC_META = {
  base:         { label: 'Persönliches Profil & Tagesenergie',    keywords: ['profil', 'siegel', 'ton', 'kin', 'tagesenergie', 'kalender', 'wellenform', 'lebensthema', 'persönlich'] },
  business:     { label: 'Business & Beruf',                       keywords: ['business', 'unternehmen', 'beruf', 'arbeit', 'karriere', 'erfolg', 'strategie', 'kunden', 'umsatz', 'chef', 'kollegen', 'führung'] },
  health:       { label: 'Gesundheit',                             keywords: ['gesundheit', 'körper', 'krankheit', 'energie', 'regeneration', 'schlaf', 'ernährung', 'schmerz', 'wellness', 'heilung'] },
  family:       { label: 'Familie',                                keywords: ['familie', 'eltern', 'kind', 'kinder', 'geschwister', 'mutter', 'vater', 'herkunft', 'kindheit', 'erziehung'] },
  selfexpression: { label: 'Selbstausdruck & Kreativität',         keywords: ['ausdruck', 'kreativität', 'kreativ', 'authentisch', 'sichtbarkeit', 'gaben', 'talente', 'stimme', 'kunst'] },
  finance:      { label: 'Finanzen & Geld',                        keywords: ['finanzen', 'geld', 'einkommen', 'wohlstand', 'reichtum', 'schulden', 'investition', 'vermögen', 'arm', 'reich'] },
  career:       { label: 'Karriere & Berufung',                    keywords: ['karriere', 'berufung', 'job', 'wechsel', 'beförderung', 'studium', 'ausbildung', 'sinn', 'orientierung'] },
  lifephases:   { label: 'Lebensphasen',                           keywords: ['lebensphase', 'übergang', 'veränderung', 'abschnitt', 'zukunft', 'vergangenheit', 'transformation', 'neuanfang'] },
  partnership:  { label: 'Beziehung & Partnerschaft',              keywords: ['beziehung', 'partner', 'partnerschaft', 'liebe', 'ehe', 'trennung', 'romantik', 'intimität', 'bindung'] },
}

// Daily question limits
function getDailyLimit(plan, purchasedAnalyses) {
  if (plan === 'annual') return 10
  // monthly: 2 base + 2 per purchased analysis
  const baseLimit = 2
  const extras = (purchasedAnalyses || []).length * 2
  return baseLimit + extras
}

// Which topics the user may ask about
function getAllowedTopics(plan, purchasedAnalyses) {
  const topics = ['base']
  if (plan === 'annual') {
    // Annual gets all topics
    topics.push(...Object.keys(TOPIC_META).filter(k => k !== 'base'))
  } else {
    // Monthly: only purchased analyses
    for (const a of (purchasedAnalyses || [])) {
      if (TOPIC_META[a]) topics.push(a)
    }
  }
  return topics
}

async function requireAuth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'Nicht angemeldet' })
  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) return res.status(401).json({ error: 'Ungültige Sitzung' })
  req.user = user
  next()
}

// GET /api/chat/status — returns limit, used, remaining, allowedTopics
router.get('/status', requireAuth, async (req, res) => {
  const { data: profile } = await supabase.from('profiles').select('subscription_plan, purchased_analyses, is_admin, chat_messages_limit').eq('id', req.user.id).single()
  if (!profile) return res.status(400).json({ error: 'Profil nicht gefunden' })

  const isAdmin = profile.is_admin === true
  const plan = profile.subscription_plan || 'monthly'
  const purchased = profile.purchased_analyses || []
  // Admin-set limit overrides plan-based limit; admins themselves have no limit
  const limit = isAdmin ? null : (profile.chat_messages_limit ?? getDailyLimit(plan, purchased))
  const allowedTopics = isAdmin ? Object.keys(TOPIC_META) : getAllowedTopics(plan, purchased)

  const todayStr = new Date().toISOString().split('T')[0]
  const { data: usage } = await supabase.from('maya_chat_usage').select('count').eq('user_id', req.user.id).eq('usage_date', todayStr).single()
  const used = usage?.count || 0

  res.json({
    limit,
    used,
    remaining: isAdmin ? null : Math.max(0, limit - used),
    allowedTopics,
    allowedTopicLabels: allowedTopics.map(t => TOPIC_META[t].label),
    plan,
    isAdmin,
  })
})

router.post('/', requireAuth, async (req, res) => {
  try {
    const { messages } = req.body
    if (!Array.isArray(messages) || !messages.length) {
      return res.status(400).json({ error: 'Keine Nachrichten' })
    }

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', req.user.id).single()
    if (!profile) return res.status(400).json({ error: 'Profil nicht gefunden' })

    const isAdmin = profile.is_admin === true
    const plan = profile.subscription_plan || 'monthly'
    const purchased = profile.purchased_analyses || []
    const limit = isAdmin ? Infinity : (profile.chat_messages_limit ?? getDailyLimit(plan, purchased))
    const allowedTopics = isAdmin ? Object.keys(TOPIC_META) : getAllowedTopics(plan, purchased)

    // Check daily usage
    const todayStr = new Date().toISOString().split('T')[0]
    const { data: usage } = await supabase.from('maya_chat_usage').select('count').eq('user_id', req.user.id).eq('usage_date', todayStr).single()
    const usedToday = usage?.count || 0

    if (!isAdmin && usedToday >= limit) {
      return res.status(429).json({
        error: 'DAILY_LIMIT_REACHED',
        limit,
        used: usedToday,
        message: plan === 'annual'
          ? `Du hast heute bereits ${limit} Fragen gestellt. Dein Tageslimit ist erreicht. Morgen stehen dir wieder ${limit} Fragen zur Verfügung.`
          : `Du hast heute dein Limit von ${limit} Frage${limit === 1 ? '' : 'n'} erreicht. Mit jeder gebuchten Analyse erhältst du 2 zusätzliche Fragen pro Tag. Beim Jahrestarif sind es 10 Fragen täglich.`,
      })
    }

    const kinData = profile.birth_date ? calculateKin(profile.birth_date) : null
    const today = new Date()
    const todayKin = calculateKin(today.toISOString().split('T')[0])

    // Extract dates mentioned in the conversation and pre-calculate their Kins
    const allText = messages.map(m => m.content).join(' ')
    const dateKins = extractAndCalculateDates(allText, today)

    // Pre-compute full Kin table: today through 2 months ahead
    const tableEnd = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + 2, today.getUTCDate()))
    const kinTableRows = generateKinTable(today, tableEnd)

    // Detect activity and pre-compute verified good days (server-side, not LLM-decided)
    const detectedActivity = detectActivity(messages)
    const goodDaysResult = detectedActivity ? computeGoodDays(detectedActivity, today, tableEnd) : null

    // Build topic restriction rules for the system prompt
    const allowedLabels = allowedTopics.map(t => TOPIC_META[t].label)
    const blockedTopics = Object.entries(TOPIC_META)
      .filter(([k]) => !allowedTopics.includes(k))
      .map(([, v]) => v.label)

    const topicRules = blockedTopics.length > 0
      ? `\nINHALTLICHE GRENZEN (strikt einzuhalten):
Du darfst NUR zu diesen Themen antworten: ${allowedLabels.join(', ')}.
Zu diesen Themen darfst du NICHT antworten: ${blockedTopics.join(', ')}.
Wenn eine Frage ein gesperrtes Thema berührt, erkläre kurz und freundlich, dass dieses Thema nicht im aktuellen Paket enthalten ist, und nenne das konkrete gebuchte Paket, das es freischalten würde. Mache keine inhaltliche Aussage zu dem Thema.

PROFIL-GRENZEN (strikt einzuhalten):
Du analysierst AUSSCHLIESSLICH ${profile.name || 'den Nutzer'} und deren/dessen Profil.
Wenn nach dem Profil, dem Kin oder der Energie einer anderen Person gefragt wird (z.B. "Mein Freund hat Kin 56...", "Was ist mit meiner Mutter..."), antworte: Du bist ausschließlich auf das Profil von ${profile.name || 'dem Nutzer'} ausgerichtet und gibst keine Einschätzungen zu anderen Personen.`
      : `\nPROFIL-GRENZEN (strikt einzuhalten):
Du analysierst AUSSCHLIESSLICH ${profile.name || 'den Nutzer'} und deren/dessen Profil.
Wenn nach dem Profil, dem Kin oder der Energie einer anderen Person gefragt wird, antworte: Du bist ausschließlich auf das Profil von ${profile.name || 'dem Nutzer'} ausgerichtet und gibst keine Einschätzungen zu anderen Personen.`

    const dateKinSection = dateKins.length > 0
      ? `\nZUSÄTZLICH GENANNTE DATEN (bereits in der Tabelle enthalten, zur Hervorhebung):
${dateKins.map(({ display, kin }) =>
  `${display} = Kin ${kin.kin} – ${kin.tone} ${kin.seal}`
).join('\n')}`
      : ''

    const systemPrompt = `Du bist MAYA, eine tiefgründige KI-Beraterin, spezialisiert auf den Maya Tzolkin-Kalender (Dreamspell-System). Du kennst das vollständige Profil des Nutzers und gibst persönliche, präzise Antworten auf Deutsch.

PROFIL VON ${profile.name?.toUpperCase() || 'DEM NUTZER'}:
${kinData ? `
Kin: Kin ${kinData.kin}
Galaktisches Siegel: ${kinData.seal}
Galaktischer Ton ${kinData.toneNumber}: ${kinData.tone}
Kraft des Tons: ${kinData.tonePower}
Lebensthema: ${kinData.lifeTheme}
Antipode (Herausforderung): ${kinData.antipode}
Wellenform: Welle ${kinData.wavespell}
Geburtsdatum: ${profile.birth_date}
` : 'Kein Geburtsdatum hinterlegt.'}

HEUTIGE ENERGIE:
Datum: ${today.toISOString().split('T')[0]}
Heutiges Kin: Kin ${todayKin.kin} – ${todayKin.tone} ${todayKin.seal}${dateKinSection}

VOLLSTÄNDIGE KIN-TABELLE (heute + 2 Monate) – EXAKT UND VERBINDLICH:
WICHTIG: Diese Tabelle wurde mathematisch berechnet. Verwende ausschließlich diese Werte. Niemals schätzen. Dieselbe Frage muss immer dieselbe Antwort ergeben.
${kinTableRows.join('\n')}
${goodDaysResult ? `
VORAB BERECHNETE AKTIVITÄTS-TAGE – NUR DIESE LISTE VERWENDEN:
Der Server hat deterministisch berechnet, welche Tage gut für "${goodDaysResult.label}" sind.
Du darfst AUSSCHLIESSLICH diese Tage nennen. Keinen einzigen anderen Tag hinzufügen oder weglassen.
Begründe jeden Tag mit den angegebenen Siegel- und Ton-Qualitäten.

${goodDaysResult.days.length > 0
  ? goodDaysResult.days.join('\n')
  : 'Keine Tage in den nächsten 2 Monaten erfüllen die Kriterien.'}
` : ''}
DREAMSPELL-REFERENZ (nur zur Erklärung der Qualitäten):
${SEAL_KNOWLEDGE.map(s => `${s.seal}: ${s.qualities}`).join(' | ')}
TÖNE: ${TONE_KNOWLEDGE.map(t => `Ton ${t.toneNumber} ${t.tone}: ${t.qualities}`).join(' | ')}
${topicRules}

GESPRÄCHSREGELN:
- Sprich ${profile.name || 'den Nutzer'} immer mit Vornamen an
- Sei tiefgründig, persönlich und konkret – kein generisches Horoskop
- Nutze das Maya-System als Tiefenpsychologie, nicht als Wahrsagerei
- Antworte auf Deutsch, klar und verständlich
- Keine Gedankenstriche oder em-Dashes als Satzzeichen
- Keine meta-Kommentare ("Gerne erkläre ich dir...")
- Beginne direkt mit der Antwort
- Halte Antworten fokussiert: 150–400 Wörter, außer der Nutzer fragt nach einer Analyse
- Sei warm, weise und direkt
- WICHTIG: Nenne niemals ein Kin aus dem Gedächtnis oder durch Schätzen. Die KIN-TABELLE oben enthält exakte Werte für die nächsten 2 Monate. Nutze ausschließlich diese Werte. Für Daten außerhalb der Tabelle: erkläre, dass du nur für die nächsten 2 Monate exakte Daten hast.
- Wenn nach mehreren Tagen gefragt wird (z.B. "alle Akquise-Tage bis Jahresende"), liste jeden relevanten Tag mit Datum, Kin, Siegel und kurzer Begründung auf. Die Antwort muss bei wiederholter identischer Frage exakt gleich sein.
- AKTIVITÄTS-TAGE: Wenn eine "VORAB BERECHNETE AKTIVITÄTS-TAGE"-Liste oben erscheint, darfst du AUSSCHLIESSLICH die dort aufgeführten Tage nennen. Du entscheidest nicht selbst, welche Tage gut sind – du liest die vorberechnete Liste vor und erklärst die genannten Siegel- und Ton-Qualitäten. Kein Tag darf hinzugefügt oder weggelassen werden.
- BEGRÜNDUNGSPFLICHT: Erkläre bei jedem genannten Tag immer die konkreten Siegel- und Ton-Qualitäten aus der Referenz. Beispiel: "Der 03.11.2026 ist Kin 76, Gelber Krieger – Intelligenz, Mut, Furchtlosigkeit. Ton 11 Spektral steht für Auflösung. Das macht ihn geeignet für direkte Ansprache."`

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4000,
      system: systemPrompt,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
    })

    // Increment daily usage (upsert)
    await supabase.from('maya_chat_usage').upsert({
      user_id: req.user.id,
      usage_date: todayStr,
      count: usedToday + 1,
    }, { onConflict: 'user_id,usage_date' })

    res.json({
      reply: response.content[0].text,
      remaining: Math.max(0, limit - usedToday - 1),
      limit,
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
