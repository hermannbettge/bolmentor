import { Router } from 'express'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

const router = Router()

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

// Maya Calendar Engine (server-side copy)
const ANCHOR_DATE = new Date('1993-07-26T00:00:00Z')

const SEALS = [
  'Roter Drachen', 'Weißer Wind', 'Blaue Nacht', 'Gelbe Saat',
  'Rote Schlange', 'Weißer Weltenwandler', 'Blaue Hand', 'Gelber Stern',
  'Roter Mond', 'Weißer Hund', 'Blauer Affe', 'Gelber Mensch',
  'Rotes Schilf', 'Weißer Zauberer', 'Blauer Adler', 'Gelbe Eule',
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

function calculateKinFromDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00Z')
  const diffDays = Math.floor((d - ANCHOR_DATE) / 86400000)
  const kin = ((diffDays % 260) + 260) % 260
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

const GERMAN_MONTHS = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember']

// Auth middleware
async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Nicht angemeldet' })
  }
  const token = authHeader.split(' ')[1]
  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) return res.status(401).json({ error: 'Ungültige Sitzung' })
  req.user = user
  next()
}

// Load user profile
async function getProfile(userId) {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single()
  if (error) throw new Error('Profil nicht gefunden')
  return data
}

// Check membership
function checkMembership(profile) {
  if (!profile.membership_active) throw new Error('Keine aktive Mitgliedschaft')
}

// Check purchased analysis
function checkPurchased(profile, type) {
  if (!profile.purchased_analyses?.includes(type)) {
    throw new Error(`Diese Analyse wurde noch nicht gebucht`)
  }
}

// Save analysis
async function saveAnalysis(userId, type, content, analysisDate, monthYear = null) {
  await supabase.from('analyses').insert({
    user_id: userId,
    type,
    content,
    analysis_date: analysisDate,
    month_year: monthYear,
  })
}

// Call Claude
async function callClaude(prompt) {
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2000,
    messages: [{ role: 'user', content: prompt }],
  })
  return message.content[0].text
}

// Build prompts inline (server-side, no import from src/)
function buildDailyPrompt(profile, kinData, todayKin, todayStr) {
  return `Du bist ein Maya Kalender Experte mit tiefem Verständnis des Tzolkin-Systems. Erstelle eine persönliche Tagesenergie-Analyse auf Deutsch.

NUTZERDATEN:
Name: ${profile.name}
Geburtsdatum: ${profile.birth_date}
Geburts-Kin: Kin ${kinData.kin} – ${kinData.tone} ${kinData.seal}
Lebensthema: ${kinData.lifeTheme}
Galaktischer Ton: ${kinData.tone} (Kraft: ${kinData.tonePower})

HEUTIGE ENERGIE:
Datum: ${todayStr}
Heutiges Kin: Kin ${todayKin.kin} – ${todayKin.tone} ${todayKin.seal}
Ton-Energie: ${todayKin.tonePower}

Erstelle eine tiefe, persönliche Analyse mit diesen Abschnitten:

## HEUTIGE ENERGIE
## DEINE PERSÖNLICHE RESONANZ
## FOKUS DES TAGES
## KÖRPER & ENERGIE
## AFFIRMATION DES TAGES

Ton: Direkt, tiefgründig, persönlich. Kein generisches Horoskop-Deutsch. Sprich ${profile.name} direkt an.
Länge: 280–350 Wörter gesamt.`
}

function buildMonthlyPrompt(profile, kinData, monthName, year) {
  const today = new Date()
  const startKin = calculateKinFromDate(new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0])
  return `Du bist ein Maya Kalender Experte. Erstelle eine tiefe Monatsanalyse auf Deutsch.

NUTZERDATEN:
Name: ${profile.name}
Geburtsdatum: ${profile.birth_date}
Geburts-Kin: Kin ${kinData.kin} – ${kinData.tone} ${kinData.seal}
Lebensthema: ${kinData.lifeTheme}
Antipode: ${kinData.antipode}

MONATS-ENERGIE:
Monat: ${monthName} ${year}
Start-Kin: Kin ${startKin.kin} – ${startKin.tone} ${startKin.seal}

Erstelle eine umfassende Monatsanalyse:

## MONATSENERGIE ${monthName.toUpperCase()} ${year}
## DEINE PERSÖNLICHE RESONANZ
## DIE 3 HAUPTTHEMEN DIESES MONATS
## BEZIEHUNGEN & VERBINDUNGEN
## ARBEIT & AUSDRUCK
## SPIRITUELLE PRAXIS
## KRAFTTAGE IM ${monthName.toUpperCase()}
## MONATSAFFIRMATION

Ton: Tiefgründig, weitsichtig, persönlich. Keine generischen Aussagen.
Länge: 500–650 Wörter gesamt.`
}

function buildSpecialPrompt(type, profile, kinData, extraData) {
  const name = profile.name
  const kin = `Kin ${kinData.kin} – ${kinData.tone} ${kinData.seal}`
  const theme = kinData.lifeTheme

  const prompts = {
    business: `Du bist ein Maya Kalender Experte. Erstelle eine tiefe Business-Analyse auf Deutsch für ${name} (${kin}, Lebensthema: ${theme}).

## DEIN KOSMISCHER BUSINESS-AUFTRAG
## DEINE NATÜRLICHEN STÄRKEN IM BUSINESS
## HERAUSFORDERUNGEN & BLINDE FLECKEN
## DEIN FÜHRUNGSSTIL
## GELDENERGIE & ÜBERFLUSS
## EMPFOHLENE GESCHÄFTSMODELLE & ROLLEN
## DEIN BUSINESS-MANTRA

Persönlich, konkret, direkt. 450–550 Wörter.`,

    health: `Du bist ein Maya Kalender Experte. Erstelle eine Gesundheitsanalyse auf Deutsch für ${name} (${kin}).

## DEINE KÖRPERENERGIE-SIGNATUR
## ENERGIESYSTEME & SCHWACHSTELLEN
## REGENERATION & ERHOLUNG
## ERNÄHRUNG & KÖRPERPFLEGE
## BEWEGUNG & SPORT
## STRESSQUELLEN & HEILUNGSWEGE
## AFFIRMATION FÜR DEINE GESUNDHEIT

Sanft, heilend, konkret. 400–500 Wörter.`,

    family: `Du bist ein Maya Kalender Experte. Erstelle eine Familienanalyse auf Deutsch für ${name} (${kin}).

## DEINE ROLLE IN DER FAMILIE
## URSPRUNGSFAMILIE & PRÄGUNGEN
## ELTERNSCHAFT & FÜRSORGE
## GESCHWISTER & GLEICHRANGIGE
## FAMILIENTHEMEN & HEILUNG
## DEINE FAMILIE ERSCHAFFEN
## AFFIRMATION FÜR DEINE FAMILIE

400–500 Wörter.`,

    selfexpression: `Du bist ein Maya Kalender Experte. Erstelle eine Selbstausdruck-Analyse auf Deutsch für ${name} (${kin}, Lebensthema: ${theme}).

## DEINE KREATIVE ESSENZ
## DEINE STIMME IN DER WELT
## KREATIVE MEDIEN & FORMEN
## BLOCKADEN DES AUSDRUCKS
## DEIN PUBLIKUM & DEINE WIRKUNG
## ENTFALTUNG DEINES AUSDRUCKS
## AFFIRMATION DEINES AUSDRUCKS

400–500 Wörter.`,

    finance: `Du bist ein Maya Kalender Experte. Erstelle eine Finanzanalyse auf Deutsch für ${name} (${kin}).

## DEINE GELD-ENERGIE-SIGNATUR
## ÜBERFLUSS-MUSTER
## GELDBLOCKADEN & GLAUBENSSÄTZE
## INVESTITIONEN & WACHSTUM
## GEBEN & EMPFANGEN
## FINANZIELLE BEFREIUNG
## ÜBERFLUSS-AFFIRMATION

400–500 Wörter.`,

    career: `Du bist ein Maya Kalender Experte. Erstelle eine Karriere-Analyse auf Deutsch für ${name} (${kin}, Lebensthema: ${theme}).

## DEINE BERUFLICHE BERUFUNG
## NATÜRLICHE TALENTE & FÄHIGKEITEN
## IDEALE ARBEITSUMGEBUNG
## KARRIERE-HERAUSFORDERUNGEN
## WACHSTUMSPFADE
## TIMING & PHASEN
## KARRIERE-AFFIRMATION

450–550 Wörter.`,

    lifephases: `Du bist ein Maya Kalender Experte. Erstelle eine Lebensphasen-Analyse auf Deutsch für ${name} (${kin}, geboren: ${profile.birth_date}).
${extraData?.years ? `Spezifische Jahre: ${extraData.years.join(', ')}` : ''}

## DEIN LEBENSRHYTHMUS
## ANALYSE DER GEWÄHLTEN JAHRE
## VERGANGENE SCHLÜSSELPHASEN
## AKTUELLE LEBENSPHASE
## KOMMENDE ZYKLEN
## DEIN LEBENS-MANTRA FÜR DIESE PHASE

500–600 Wörter.`,

    partnership: `Du bist ein Maya Kalender Experte. Erstelle eine Partnerschaftsanalyse auf Deutsch für ${name} (${kin}).

## DEINE LIEBES-SIGNATUR
## WAS DU IN BEZIEHUNGEN BRINGST
## DEINE TIEFSTEN BEZIEHUNGSBEDÜRFNISSE
## BEZIEHUNGSMUSTER & HERAUSFORDERUNGEN
## DEIN IDEALER PARTNER AUS MAYA-SICHT
## INTIMITÄT & VERBINDUNG
## BEZIEHUNGS-AFFIRMATION

450–550 Wörter.`,

    compatibility: (() => {
      let partnerKin = null
      if (extraData?.birthDate) {
        try {
          const parts = extraData.birthDate.split('.')
          const iso = `${parts[2]}-${parts[1].padStart(2,'0')}-${parts[0].padStart(2,'0')}`
          partnerKin = calculateKinFromDate(iso)
        } catch {}
      }
      return `Du bist ein Maya Kalender Experte. Erstelle eine Partner-Kompatibilitäts-Analyse auf Deutsch.

PERSON 1:
Name: ${name}
Geburts-Kin: ${kin}

PERSON 2 (Partner):
Geburtsdatum: ${extraData?.birthDate || 'unbekannt'}
${partnerKin ? `Geburts-Kin: Kin ${partnerKin.kin} – ${partnerKin.tone} ${partnerKin.seal}` : ''}

## EURE KOMPATIBILITÄTS-ÜBERSICHT
## WAS EUCH VERBINDET
## WO IHR EUCH HERAUSFORDERT
## ENERGETISCHE DYNAMIK
## GEMEINSAMES THEMA ALS PAAR
## EMPFEHLUNGEN FÜR EURE BEZIEHUNG
## AFFIRMATION FÜR EUER PAAR

500–600 Wörter.`
    })(),
  }

  return prompts[type]
}

// --- ROUTES ---

router.post('/daily', requireAuth, async (req, res) => {
  try {
    const profile = await getProfile(req.user.id)
    checkMembership(profile)

    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]
    const kinData = calculateKinFromDate(profile.birth_date)
    const todayKin = calculateKinFromDate(todayStr)
    const monthName = GERMAN_MONTHS[today.getMonth()]

    const prompt = buildDailyPrompt(profile, kinData, todayKin, `${today.getDate()}. ${monthName} ${today.getFullYear()}`)
    const content = await callClaude(prompt)

    await saveAnalysis(req.user.id, 'daily', content, todayStr)
    res.json({ content })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

router.post('/monthly', requireAuth, async (req, res) => {
  try {
    const profile = await getProfile(req.user.id)
    checkMembership(profile)

    const today = new Date()
    const monthName = GERMAN_MONTHS[today.getMonth()]
    const year = today.getFullYear()
    const monthYear = `${year}-${String(today.getMonth() + 1).padStart(2, '0')}`

    const kinData = calculateKinFromDate(profile.birth_date)
    const prompt = buildMonthlyPrompt(profile, kinData, monthName, year)
    const content = await callClaude(prompt)

    await saveAnalysis(req.user.id, 'monthly', content, today.toISOString().split('T')[0], monthYear)
    res.json({ content })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// Special analyses
const SPECIAL_TYPES = ['business', 'health', 'family', 'selfexpression', 'finance', 'career', 'lifephases', 'partnership', 'compatibility']

SPECIAL_TYPES.forEach(type => {
  router.post(`/${type}`, requireAuth, async (req, res) => {
    try {
      const profile = await getProfile(req.user.id)
      checkMembership(profile)
      checkPurchased(profile, type)

      const kinData = calculateKinFromDate(profile.birth_date)
      const prompt = buildSpecialPrompt(type, profile, kinData, req.body.extraData)
      if (!prompt) return res.status(400).json({ error: 'Unbekannter Analysetyp' })

      const content = await callClaude(prompt)
      const today = new Date().toISOString().split('T')[0]
      await saveAnalysis(req.user.id, type, content, today)
      res.json({ content })
    } catch (err) {
      res.status(400).json({ error: err.message })
    }
  })
})

export default router
