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
  const { data: profile } = await supabase.from('profiles').select('subscription_plan, purchased_analyses').eq('id', req.user.id).single()
  if (!profile) return res.status(400).json({ error: 'Profil nicht gefunden' })

  const isAdmin = profile.is_admin === true
  const plan = profile.subscription_plan || 'monthly'
  const purchased = profile.purchased_analyses || []
  const limit = isAdmin ? null : getDailyLimit(plan, purchased)
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
    const limit = isAdmin ? Infinity : getDailyLimit(plan, purchased)
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
Heutiges Kin: Kin ${todayKin.kin} – ${todayKin.tone} ${todayKin.seal}
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
- Sei warm, weise und direkt`

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
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
