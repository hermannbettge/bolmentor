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

async function requireAuth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'Nicht angemeldet' })
  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) return res.status(401).json({ error: 'Ungültige Sitzung' })
  req.user = user
  next()
}

router.post('/', requireAuth, async (req, res) => {
  try {
    const { messages } = req.body
    if (!Array.isArray(messages) || !messages.length) {
      return res.status(400).json({ error: 'Keine Nachrichten' })
    }

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', req.user.id).single()
    if (!profile) return res.status(400).json({ error: 'Profil nicht gefunden' })

    const kinData = profile.birth_date ? calculateKin(profile.birth_date) : null

    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]
    const todayKin = calculateKin(todayStr)

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
Datum: ${todayStr}
Heutiges Kin: Kin ${todayKin.kin} – ${todayKin.tone} ${todayKin.seal}

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

    res.json({ reply: response.content[0].text })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
