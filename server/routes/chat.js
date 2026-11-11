import { Router } from 'express'
import Anthropic from '@anthropic-ai/sdk'
import { supabase } from '../lib/supabase.js'

const router = Router()
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

import { calculateKin, civilDateISO, parseCivilDate } from '../../src/lib/mayanCalendar.js'
import { INTERPRETATION_RULES, REGEN_CONTEXT } from '../lib/mayaContext.js'
import { KNOWLEDGE_BASE } from '../../src/lib/knowledgeBase.js'

// App-authored interpretive qualities and activity heuristics; not validated timing predictions.
// Source: Dreamspell / José Argüelles system
// Structured Dreamspell knowledge base with machine-readable activity tags
// Tags control the deterministic app selection; they are not historical or empirical truth.
import { SEAL_KNOWLEDGE, TONE_KNOWLEDGE, detectActivity, computeGoodDays, generateKinTable, extractAndCalculateDates, resolveActivityRange } from '../lib/mayaActivities.js'

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
  const { data: profile } = await supabase.from('profiles').select('subscription_plan, purchased_analyses, is_admin, chat_messages_limit, maya_ki_enabled').eq('id', req.user.id).single()
  if (!profile) return res.status(400).json({ error: 'Profil nicht gefunden' })

  const isAdmin = profile.is_admin === true
  const kiEnabled = isAdmin || profile.maya_ki_enabled === true
  if (!kiEnabled) return res.status(403).json({ error: 'MAYA_KI_LOCKED', message: 'MAYA KI ist für deinen Account noch nicht freigeschaltet.' })

  const plan = profile.subscription_plan || 'monthly'
  const purchased = profile.purchased_analyses || []
  // Admin-set limit overrides plan-based limit; admins themselves have no limit
  const limit = isAdmin ? null : (profile.chat_messages_limit ?? getDailyLimit(plan, purchased))
  const allowedTopics = isAdmin ? Object.keys(TOPIC_META) : getAllowedTopics(plan, purchased)

  const todayStr = civilDateISO()
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
    if (!Array.isArray(messages) || !messages.length || messages.length > 100 || messages.some(m => !['user', 'assistant'].includes(m.role) || typeof m.content !== 'string' || m.content.length > 20000)) {
      return res.status(400).json({ error: 'Keine Nachrichten' })
    }

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', req.user.id).single()
    if (!profile) return res.status(400).json({ error: 'Profil nicht gefunden' })

    const isAdmin = profile.is_admin === true
    const kiEnabled = isAdmin || profile.maya_ki_enabled === true
    if (!kiEnabled) return res.status(403).json({ error: 'MAYA_KI_LOCKED', message: 'MAYA KI ist für deinen Account noch nicht freigeschaltet.' })

    const plan = profile.subscription_plan || 'monthly'
    const purchased = profile.purchased_analyses || []
    const limit = isAdmin ? Infinity : (profile.chat_messages_limit ?? getDailyLimit(plan, purchased))
    const allowedTopics = isAdmin ? Object.keys(TOPIC_META) : getAllowedTopics(plan, purchased)

    // Check daily usage
    const todayStr = civilDateISO()
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
    const today = new Date(`${todayStr}T00:00:00Z`)
    const todayKin = calculateKin(todayStr)

    // Extract dates mentioned in the conversation and pre-calculate their Kins
    const allText = messages.map(m => m.content).join(' ')
    const dateKins = extractAndCalculateDates(allText, today)

    // Pre-compute full Kin table: today through end of 2027
    const tableEnd = new Date(Date.UTC(Math.max(2027, today.getUTCFullYear()), 11, 31))
    const kinTableRows = generateKinTable(today, tableEnd)

    // Detect activity and pre-compute verified good days (server-side, not LLM-decided)
    const detectedActivity = detectActivity(messages)
    const activityRange = resolveActivityRange(messages, today, tableEnd)
    const goodDaysResult = detectedActivity && activityRange ? computeGoodDays(detectedActivity, activityRange.start, activityRange.end) : null

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
      ? `\nZUSÄTZLICH GENANNTE DATEN (separat berechnet, auch außerhalb des Tabellenzeitraums):
${dateKins.map(({ display, kin }) =>
  `${display} = Kin ${kin.kin} – ${kin.tone} ${kin.seal}`
).join('\n')}`
      : ''

    const systemPrompt = `${INTERPRETATION_RULES}

${KNOWLEDGE_BASE}

${REGEN_CONTEXT}

Du bist MAYA, eine tiefgründige KI-Beraterin, spezialisiert auf den Maya Tzolkin-Kalender (Dreamspell-System). Du kennst das vollständige Profil des Nutzers und gibst persönliche, präzise Antworten auf Deutsch.

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
Datum: ${todayStr}
Heutiges Kin: Kin ${todayKin.kin} – ${todayKin.tone} ${todayKin.seal}${dateKinSection}

VOLLSTÄNDIGE KIN-TABELLE (${todayStr} bis ${tableEnd.toISOString().slice(0,10)}) – EXAKT UND VERBINDLICH:
WICHTIG: Diese Tabelle wurde mathematisch berechnet. Verwende ausschließlich diese Werte. Niemals schätzen. Identische Kalenderdaten müssen dieselben Zahlen ergeben.
${kinTableRows.join('\n')}
${goodDaysResult ? `
VORAB BERECHNETE AKTIVITÄTS-TAGE – NUR DIESE LISTE VERWENDEN:
Der Server hat nach redaktionellen App-Tags berechnet, welche Tage als Reflexionsimpuls passen zu "${goodDaysResult.label}" sind.
Nutze nur diese Liste für den ausdrücklich angefragten Zeitraum. Stelle die Auswahl als App-Deutung dar, nicht als Erfolgsprognose. Wenn die vollständige Liste verlangt wird, gib alle Einträge aus.
Begründe jeden Tag mit den angegebenen Siegel- und Ton-Qualitäten.

${goodDaysResult.days.length > 0
  ? goodDaysResult.days.join('\n')
  : 'Keine Tage im ausgewählten Zeitraum erfüllen die App-Kriterien.'}
` : ''}
DREAMSPELL-REFERENZ (nur zur Erklärung der Qualitäten):
${SEAL_KNOWLEDGE.map(s => `${s.seal}: ${s.qualities}`).join(' | ')}
TÖNE: ${TONE_KNOWLEDGE.map(t => `Ton ${t.toneNumber} ${t.tone}: ${t.qualities}`).join(' | ')}
${topicRules}
${detectedActivity && !activityRange ? "ZEITRAUM FEHLT ODER IST NICHT EINDEUTIG ERKANNT. Frage nach einem konkreten Monat, Jahr oder zwei vollständigen Datumsangaben. Keine Aktivitätstage selbst auswählen." : ""}

GESPRÄCHSREGELN:
- Sprich ${profile.name || 'den Nutzer'} immer mit Vornamen an
- Sei tiefgründig, persönlich und konkret – kein generisches Horoskop
- Nutze Dreamspell als symbolischen Reflexionsrahmen, nicht als wissenschaftlich validierte Tiefenpsychologie oder Wahrsagerei
- Antworte auf Deutsch, klar und verständlich
- Keine Gedankenstriche oder em-Dashes als Satzzeichen
- Keine meta-Kommentare ("Gerne erkläre ich dir...")
- Beginne direkt mit der Antwort
- Halte Antworten fokussiert: 150–400 Wörter, außer der Nutzer fragt nach einer Analyse
- Sei warm, weise und direkt
- WICHTIG: Nenne niemals ein Kin aus dem Gedächtnis oder durch Schätzen. Nutze nur die übergebenen Tabellen und separat berechneten Daten. Für nicht enthaltene Daten keine Zahlen erfinden.
- Wenn nach mehreren Tagen gefragt wird (z.B. "alle Akquise-Tage bis Jahresende"), liste jeden relevanten Tag mit Datum, Kin, Siegel und kurzer Begründung auf. Die berechnete Tagesauswahl bleibt bei identischem Datum, Zeitraum und Regelstand gleich. Freie KI-Formulierungen können variieren.
- AKTIVITÄTS-TAGE: Wenn eine "VORAB BERECHNETE AKTIVITÄTS-TAGE"-Liste oben erscheint, darfst du AUSSCHLIESSLICH die dort aufgeführten Tage nennen. Du entscheidest nicht selbst, welche Tage gut sind . Du erklärst die vorberechnete Auswahl für den angefragten Zeitraum.
- BEGRÜNDUNGSPFLICHT: Erkläre bei jedem genannten Tag immer die konkreten Siegel- und Ton-Qualitäten aus der Referenz. Beispiel: "Der 03.11.2026 ist Kin 76, Gelber Krieger – Intelligenz, Mut, Furchtlosigkeit. Ton 11 Spektral steht für Auflösung. Das kann in der App als Reflexionsimpuls für direkte Ansprache dienen, garantiert aber keinen Erfolg."`

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: goodDaysResult ? 16000 : 4000,
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

