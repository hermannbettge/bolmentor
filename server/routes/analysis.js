import { Router } from 'express'
import Anthropic from '@anthropic-ai/sdk'
import { supabase } from '../lib/supabase.js'

const router = Router()

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})


// Maya Calendar Engine — Dreamspell
// Anchor: 26 July 1993 = Kin 144 (Yellow Crystal Seed)
// Feb 29 (leap day) does NOT advance the Dreamspell Kin count
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

function calculateKinFromDate(dateStr) {
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

function checkAnnualPlan(profile) {
  if (profile.subscription_plan !== 'annual') {
    throw new Error('Die Jahresanalyse ist nur im Jahrestarif verfügbar')
  }
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
async function callClaude(prompt, maxTokens = 8000) {
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: maxTokens,
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

const SYSTEM_RULES = `
ABSOLUT VERBOTENE STILMITTEL (streng einhalten):
- KEIN Meta-Kommentar ("Hier ist deine Analyse...", "Ich hoffe das hilft...", etc.)
- Beginne SOFORT mit dem ersten ## Abschnitt, ohne Einleitung
- Keine horizontalen Trennlinien (---)
- Keine einzelne # Überschrift am Anfang
- KEINE Gedankenstriche oder Bindestriche als Satzzeichen (– oder —). Nur normale Satzzeichen.
- KEINE Doppelpunkte am Ende eines Satzes oder Absatzes
- Kein Satzanfang mit "Und"
- Schreibe fehlerfreies, korrektes Deutsch mit korrekter Groß- und Kleinschreibung
- Alle Substantive MÜSSEN großgeschrieben sein (z.B. Partnerschaftsanalyse, Energie, Analyse, Krieger, Ton)
- Eigennamen, Titel und Analysebezeichnungen immer mit Großbuchstaben beginnen
- Verwende AUSSCHLIESSLICH korrekte deutsche Rechtschreibung: "intellektuell" (NICHT "intellectuell"), "Qualität" (NICHT "Qualitaet"), etc.
- Keine eingedeutschten Anglizismen in der Schreibweise
- Jeder Satz MUSS mit einem Satzzeichen enden (Punkt, Ausrufezeichen oder Fragezeichen)
- Kein Satz darf nahtlos in den nächsten übergehen ohne Satzzeichen dazwischen
STIL:
- Sprich die Person immer direkt mit Vornamen an
- Jeder Abschnitt mindestens 4-6 ausführliche Absätze
- Konkret, tiefgründig, persönlich - kein generisches Horoskop-Deutsch
- Nutze das Maya-System als Tiefenpsychologie, nicht als Wahrsagerei
`

function buildSpecialPrompt(type, profile, kinData, extraData) {
  const name = profile.name
  const kin = `Kin ${kinData.kin} – ${kinData.tone} ${kinData.seal}`
  const tone = kinData.tone
  const seal = kinData.seal
  const theme = kinData.lifeTheme
  const antipode = kinData.antipode
  const guide = kinData.guide || ''
  const toneNumber = kinData.toneNumber
  const tonePower = kinData.tonePower

  const base = `PROFIL VON ${name.toUpperCase()}:
Kin: ${kin}
Galaktischer Ton ${toneNumber}: ${tone} – Kraft: ${tonePower}
Siegel: ${seal}
Lebensthema: ${theme}
Antipode (Herausforderung): ${antipode}
Geburtsdatum: ${profile.birth_date}
`

  const prompts = {
    business: `Du bist ein weltklasse Maya-Kalender-Experte und Business-Coach. Erstelle eine vollständige, tiefe Business-Analyse auf Deutsch für ${name}.
${base}
${SYSTEM_RULES}

Erstelle eine umfassende Business-Analyse mit diesen Abschnitten. Jeder Abschnitt soll 4–6 Absätze haben und konkrete, handlungsorientierte Erkenntnisse liefern:

## DEIN KOSMISCHER BUSINESS-AUFTRAG
## DEINE NATÜRLICHEN STÄRKEN & SUPERKRÄFTE IM BUSINESS
## DEIN EINZIGARTIGER WERTBEITRAG FÜR KUNDEN
## DEIN FÜHRUNGSSTIL & TEAMDYNAMIK
## IDEALE GESCHÄFTSMODELLE & ANGEBOTSSTRUKTUR
## MARKETING & SICHTBARKEIT AUS DEINER ENERGIE
## VERKAUF & ÜBERZEUGUNGSKRAFT
## GELDENERGIE & FINANZIELLE ÜBERZEUGUNGEN
## DEINE TYPISCHEN SABOTAGE-MUSTER IM BUSINESS
## IDEALE KUNDEN & ZIELGRUPPE
## PARTNERSHIP & KOOPERATIONEN
## WACHSTUM & SKALIERUNG
## TIMING: WANN ANGREIFEN, WANN ZURÜCKHALTEN
## DEINE 5-JAHRES-BUSINESS-VISION
## TÄGLICHE BUSINESS-PRAXIS & RITUALE
## DEIN BUSINESS-MANTRA

Gesamtlänge: mindestens 3000 Wörter. Sei außergewöhnlich konkret und tiefgründig.`,

    health: `Du bist ein weltklasse Maya-Kalender-Experte und Gesundheitsberater. Erstelle eine vollständige Gesundheitsanalyse auf Deutsch für ${name}.
${base}
${SYSTEM_RULES}

Erstelle eine tiefe Gesundheitsanalyse. Jeder Abschnitt 4–6 Absätze:

## DEINE KÖRPERENERGIE-SIGNATUR
## DEINE ENERGIESYSTEME & ORGANE IM FOKUS
## SCHWACHSTELLEN & ANFÄLLIGKEITEN
## WIE DU ENERGIE VERLIERST UND GEWINNST
## SCHLAF, REGENERATION & ERHOLUNG
## ERNÄHRUNG AUS DEINER MAYA-ENERGIE
## BEWEGUNG, SPORT & KÖRPERPRAKTIKEN
## CHRONISCHE MUSTER & KÖRPERSIGNALE
## STRESSQUELLEN & WIE DU DAMIT UMGEHST
## EMOTIONEN & KÖRPER – DIE VERBINDUNG
## HEILUNGSWEG & TIEFE TRANSFORMATION
## DEIN IMMUNSYSTEM & SCHUTZENERGIE
## ZYKLUS, RHYTHMUS & NATURVERBINDUNG
## HEILSAME UMGEBUNGEN & ORTE
## TÄGLICHE GESUNDHEITSPRAXIS
## DEINE GESUNDHEITS-AFFIRMATION

Mindestens 3000 Wörter.`,

    family: `Du bist ein weltklasse Maya-Kalender-Experte und Familientherapeut. Erstelle eine vollständige Familienanalyse auf Deutsch für ${name}.
${base}
${SYSTEM_RULES}

Tiefe Familienanalyse, jeder Abschnitt 4–6 Absätze:

## DEINE ENERGETISCHE ROLLE IN DER FAMILIE
## DEINE URSPRUNGSFAMILIE & TIEFE PRÄGUNGEN
## DIE WUNDEN, DIE DU TRÄGST
## DIE GESCHENKE DEINER HERKUNFT
## DEIN BEZIEHUNGSMUSTER ZU MUTTER & VATER
## GESCHWISTERDYNAMIK & GLEICHRANGIGE
## ELTERNSCHAFT & WIE DU FÜHRST & PFLEGST
## GENERATIONENMUSTER & ERBSCHAFTEN
## KONFLIKTE IN DER FAMILIE – DEIN MUSTER
## DEINE SEELENFAMILIE & WAHLVERWANDTSCHAFT
## HEILUNG DER FAMILIENSYSTEM
## WIE DU EINE NEUE FAMILIENKULTUR ERSCHAFFST
## DEIN ZUHAUSE ALS ENERGETISCHER RAUM
## FAMILIENRITUALE & VERBINDUNG
## GRENZEN SETZEN IN DER FAMILIE
## DEINE FAMILIEN-AFFIRMATION

Mindestens 3000 Wörter.`,

    selfexpression: `Du bist ein weltklasse Maya-Kalender-Experte und Kreativcoach. Erstelle eine vollständige Selbstausdruck-Analyse auf Deutsch für ${name}.
${base}
${SYSTEM_RULES}

Umfassende Selbstausdruck-Analyse, jeder Abschnitt 4–6 Absätze:

## DEINE KREATIVE ESSENZ & EINZIGARTIGKEIT
## DEINE STIMME IN DER WELT
## WIE DU WIRKLICH KOMMUNIZIERST
## DEINE KREATIVMEDIEN & AUSDRUCKSFORMEN
## DEIN KREATIVPROZESS – WIE DU ARBEITEST
## BLOCKADEN & INNERE ZENSUR
## ANGST VOR SICHTBARKEIT & URTEILEN
## DEIN PUBLIKUM & DEINE NATURLICHE WIRKUNG
## BÜHNE, SCHREIBEN, SPRECHEN – WAS PASST
## DEINE PERSÖNLICHE MARKE & AUFTRITT
## KREATIVE FÜLLE & INSPIRATION
## KOLLABORATION & CO-KREATION
## MONETARISIERUNG DEINES AUSDRUCKS
## VON DER IDEE ZUR MANIFESTATION
## DEIN EINZIGARTIGER BEITRAG ZUR WELT
## DEINE SELBSTAUSDRUCK-AFFIRMATION

Mindestens 3000 Wörter.`,

    finance: `Du bist ein weltklasse Maya-Kalender-Experte und Financial Coach. Erstelle eine vollständige Finanzanalyse auf Deutsch für ${name}.
${base}
${SYSTEM_RULES}

Tiefe Finanzanalyse, jeder Abschnitt 4–6 Absätze:

## DEINE GELD-ENERGIE-SIGNATUR
## DEINE TIEFSTEN GLAUBENSSÄTZE ÜBER GELD
## WIE DU GELD WIRKLICH ERLEBST
## DEINE ÜBERFLUSS-MUSTER & BLOCKADEN
## GELD VERDIENEN – DEIN NATÜRLICHER WEG
## GELD AUSGEBEN – DEINE MUSTER
## SPAREN, INVESTIEREN & VERMÖGEN AUFBAUEN
## RISIKO & SICHERHEIT – DEINE BALANCE
## DEINE BEZIEHUNG ZU REICHEN MENSCHEN
## GEBEN & EMPFANGEN – DIE ENERGETIK
## GELD ALS WERKZEUG DER FREIHEIT
## FINANZIELLE SELBSTSABOTAGE ERKENNEN
## DEIN WEG ZU ECHTER FINANZIELLER FREIHEIT
## KONKRETE SCHRITTE FÜR DEINEN WOHLSTAND
## GELD & SINN – WAS DU WIRKLICH WILLST
## DEINE ÜBERFLUSS-AFFIRMATION

Mindestens 3000 Wörter.`,

    career: `Du bist ein weltklasse Maya-Kalender-Experte und Karriere-Coach. Erstelle eine vollständige Karriere-Analyse auf Deutsch für ${name}.
${base}
${SYSTEM_RULES}

Umfassende Karriereanalyse, jeder Abschnitt 4–6 Absätze:

## DEINE BERUFLICHE BERUFUNG & SEELENMISSION
## DEINE NATÜRLICHEN TALENTE & SUPERKRÄFTE
## DEIN EINZIGARTIGER KARRIERE-FINGERABDRUCK
## IDEALE ARBEITSUMGEBUNG & STRUKTUREN
## DEIN FÜHRUNGSPOTENZIAL
## KOLLEGEN & TEAMDYNAMIK
## KARRIERE-HERAUSFORDERUNGEN & BLOCKADEN
## SELBSTÄNDIGKEIT VS. ANSTELLUNG
## DEINE BESTEN BRANCHEN & FELDER
## NETWORKING & KARRIEREBEZIEHUNGEN
## SICHTBARKEIT & REPUTATION AUFBAUEN
## WACHSTUMSPFADE & NÄCHSTE STUFEN
## WORK-LIFE-INTEGRATION AUS DEINER ENERGIE
## KARRIERE-TIMING & GÜNSTIGE PHASEN
## DEIN LANGFRISTIGES BERUFLICHES VERMÄCHTNIS
## DEINE KARRIERE-AFFIRMATION

Mindestens 3000 Wörter.`,

    lifephases: `Du bist ein weltklasse Maya-Kalender-Experte. Erstelle eine vollständige Lebensphasen-Analyse auf Deutsch für ${name}.
${base}
${SYSTEM_RULES}

Tiefe Lebensphasen-Analyse, jeder Abschnitt 4–6 Absätze:

## DEIN KOSMISCHER LEBENSRHYTHMUS
## DIE ERSTE LEBENSPHASE (KINDHEIT & JUGEND)
## DIE PRÄGUNGSPHASE (20ER JAHRE)
## DIE AUFBAUPHASE (30ER JAHRE)
## DIE REIFEPHASE (40ER JAHRE)
## DIE ERNTE- UND WEISHEITSPHASE (50ER+)
## DEINE AKTUELLE LEBENSPHASE – TIEFANALYSE
## SCHLÜSSELEREIGNISSE AUS DEINER VERGANGENHEIT
## WAS DIESE EREIGNISSE DIR SAGEN
## KOMMENDE ZYKLEN & ENERGIEFELDER
## DIE NÄCHSTEN 3 JAHRE IM DETAIL
## LANGFRISTIGE LEBENSTHEMEN
## SEELISCHE AUFGABEN DIESER INKARNATION
## TRANSFORMATION & WANDEL – DEIN MUSTER
## WIE DU JEDE LEBENSPHASE NUTZT
## DEIN LEBENSPHASEN-MANTRA

Mindestens 3000 Wörter.`,

    partnership: `Du bist ein weltklasse Maya-Kalender-Experte und Beziehungscoach. Erstelle eine vollständige Partnerschaftsanalyse auf Deutsch für ${name}.
${base}
${SYSTEM_RULES}

Tiefe Partnerschaftsanalyse, jeder Abschnitt 4–6 Absätze:

## DEINE LIEBES-SIGNATUR & BEZIEHUNGSENERGIE
## WAS DU IN BEZIEHUNGEN WIRKLICH SUCHST
## WAS DU IN BEZIEHUNGEN BRINGST
## DEINE TIEFSTEN BEZIEHUNGSBEDÜRFNISSE
## ANZIEHUNG & CHEMIE – WER ZIEHT DICH AN
## BINDUNGSMUSTER & ANHÄNGLICHKEIT
## KOMMUNIKATION IN DER PARTNERSCHAFT
## KONFLIKTE & WIE DU SIE LÖST
## SEXUALITÄT & INTIMITÄT AUS DEINER ENERGIE
## BEZIEHUNGSSABOTAGE – DEINE MUSTER
## DEIN IDEALER PARTNER AUS MAYA-SICHT
## KOMPATIBLE KIN-TYPEN
## BEZIEHUNGSREIFE & WACHSTUM
## LIEBE, FREIHEIT & BINDUNG – DEINE BALANCE
## DER WEG ZUR TRAUMPARTNERSCHAFT
## DEINE BEZIEHUNGS-AFFIRMATION

Mindestens 3000 Wörter.`,

    relationship: `Du bist ein weltklasse Maya-Kalender-Experte und Beziehungscoach. Erstelle eine vollständige Beziehungsanalyse auf Deutsch für ${name} — fokussiert auf ihre/seine eigenen Beziehungsmuster, Bindungsstile und wie sie/er in Beziehungen agiert.
${base}
${SYSTEM_RULES}

Tiefe Beziehungsanalyse der eigenen Muster, jeder Abschnitt 4–6 Absätze:

## DEINE BEZIEHUNGSENERGIE-SIGNATUR
## DEIN BINDUNGSSTIL & ATTACHMENT-MUSTER
## DEINE TIEFSTEN BEZIEHUNGSBEDÜRFNISSE
## WIE DU LIEBE GIBST UND EMPFÄNGST
## DEINE KOMMUNIKATION IN BEZIEHUNGEN
## DEINE TYPISCHEN BEZIEHUNGSMUSTER & ZYKLEN
## DEINE BEZIEHUNGSSABOTAGE — UNBEWUSSTE MUSTER
## VERTRAUEN, NÄHE & VERLETZLICHKEIT
## KONFLIKTE & WIE DU SIE ERLEBST
## DEINE GRENZEN IN BEZIEHUNGEN
## WAS DICH IN BEZIEHUNGEN WACHSEN LÄSST
## DEINE IDEALE BEZIEHUNGSDYNAMIK
## HEILUNG ALTER BEZIEHUNGSWUNDEN
## DEINE BEZIEHUNGS-AFFIRMATION

Mindestens 3000 Wörter.`,

  }

  return prompts[type]
}

function buildYearlyPrompt(type, profile, kinData, year) {
  const name = profile.name
  const kin = `Kin ${kinData.kin} – ${kinData.tone} ${kinData.seal}`
  const theme = kinData.lifeTheme

  const typeLabels = {
    business: 'Business', health: 'Gesundheit', family: 'Familie',
    selfexpression: 'Selbstausdruck', finance: 'Finanzen', career: 'Karriere',
    lifephases: 'Lebensphasen', partnership: 'Partnerschaft',
  }
  const label = typeLabels[type] || type

  return `Du bist ein weltklasse Maya-Kalender-Experte. Erstelle eine vollständige Jahresanalyse ${year} für den Bereich ${label} auf Deutsch für ${name}.

PROFIL:
Name: ${name}
Kin: ${kin}
Lebensthema: ${theme}
Jahr: ${year}

${SYSTEM_RULES}

Erstelle zunächst eine Jahresübersicht, dann für JEDEN der 12 Monate einen eigenen Abschnitt:

## JAHRESÜBERSICHT ${year} – ${label.toUpperCase()}
(Gesamtthema des Jahres, wichtige Energien, was ${name} erwartet)

## JANUAR ${year}
## FEBRUAR ${year}
## MÄRZ ${year}
## APRIL ${year}
## MAI ${year}
## JUNI ${year}
## JULI ${year}
## AUGUST ${year}
## SEPTEMBER ${year}
## OKTOBER ${year}
## NOVEMBER ${year}
## DEZEMBER ${year}

## JAHRESRESÜMEE ${year} – GESAMTBEWERTUNG & EMPFEHLUNGEN
(Gesamtfazit des Jahres: die 3 wichtigsten Chancen, die 3 größten Herausforderungen, die kraftvollsten Monate, die ruhigsten Monate, konkrete Empfehlungen für ${name} für den Bereich ${label})

Für jeden der 12 Monate verwende EXAKT diese Struktur:

**Gesamtenergie des Monats:** (2–3 Sätze zur übergeordneten Energiequalität)

**Woche 1** (1.–7.): Energiebeschreibung, was jetzt ideal ist, was du besser lassen solltest
**Woche 2** (8.–14.): Energiebeschreibung, was jetzt ideal ist, was du besser lassen solltest
**Woche 3** (15.–21.): Energiebeschreibung, was jetzt ideal ist, was du besser lassen solltest
**Woche 4** (22.–Monatsende): Energiebeschreibung, was jetzt ideal ist, was du besser lassen solltest

**Fazit ${label}:** Konkrete Handlungsempfehlung für den Monat im Bereich ${label}

Jeder Monatsabschnitt mindestens 300 Wörter.
Das Jahresresümee am Ende mindestens 400 Wörter.
Gesamtlänge: mindestens 6000 Wörter.`
}

// Energy classification by tone
function getEnergyType(toneNumber) {
  if ([3, 5, 9, 10].includes(toneNumber)) return 'action'    // high energy, sport, decisions
  if ([7, 8, 12].includes(toneNumber)) return 'creative'     // ideas, creativity, social
  if ([4, 6, 1].includes(toneNumber)) return 'balance'       // structure, routine, intention
  return 'rest'                                               // 2, 11, 13 = reflect, release
}

// Month calendar endpoint — returns all days of a month with Kin data
router.get('/calendar/:year/:month', requireAuth, async (req, res) => {
  try {
    const profile = await getProfile(req.user.id)
    checkMembership(profile)

    const year = parseInt(req.params.year)
    const month = parseInt(req.params.month) // 1-12
    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      return res.status(400).json({ error: 'Ungültiges Datum' })
    }

    const userKin = profile.birth_date ? calculateKinFromDate(profile.birth_date) : null
    const daysInMonth = new Date(year, month, 0).getDate()
    const days = []

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month).padStart(2,'0')}-${String(d).padStart(2,'0')}`
      const kin = calculateKinFromDate(dateStr)
      const energyType = getEnergyType(kin.toneNumber)

      // Personal resonance: same seal, same tone, same wavespell as birth kin
      let resonance = 'none'
      if (userKin) {
        if (kin.kin === userKin.kin) resonance = 'birthday'          // exact kin = power day
        else if (kin.seal === userKin.seal) resonance = 'seal'       // same seal = identity day
        else if (kin.toneNumber === userKin.toneNumber) resonance = 'tone'  // same tone = rhythm day
        else if (kin.wavespell === userKin.wavespell) resonance = 'wavespell' // same wave
      }

      days.push({ date: dateStr, day: d, ...kin, energyType, resonance })
    }

    res.json({ year, month, days, userKin })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// --- ROUTES ---

router.get('/daily', requireAuth, async (req, res) => {
  try {
    const dateStr = req.query.date || new Date().toISOString().split('T')[0]
    const { data } = await supabase
      .from('analyses')
      .select('content, created_at')
      .eq('user_id', req.user.id)
      .eq('type', `daily_${dateStr}`)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    res.json({ content: data?.content || null })
  } catch {
    res.json({ content: null })
  }
})

router.post('/daily', requireAuth, async (req, res) => {
  try {
    const profile = await getProfile(req.user.id)
    checkMembership(profile)

    const dateStr = req.body.date || new Date().toISOString().split('T')[0]
    const dateObj = new Date(dateStr + 'T00:00:00')
    const monthName = GERMAN_MONTHS[dateObj.getMonth()]
    const dateLabel = `${dateObj.getDate()}. ${monthName} ${dateObj.getFullYear()}`

    const kinData = calculateKinFromDate(profile.birth_date)
    const dayKin = calculateKinFromDate(dateStr)

    const prompt = buildDailyPrompt(profile, kinData, dayKin, dateLabel)
    const content = await callClaude(prompt)

    await saveAnalysis(req.user.id, `daily_${dateStr}`, content, dateStr)
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
const SPECIAL_TYPES = ['business', 'health', 'family', 'selfexpression', 'finance', 'career', 'lifephases', 'partnership', 'relationship']

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

// Domain-specific daily energy analyses
const DOMAIN_LABELS = {
  business: 'Business & Unternehmertum',
  health: 'Gesundheit & Körper',
  family: 'Familie & Beziehungen',
  selfexpression: 'Selbstausdruck & Kreativität',
  finance: 'Finanzen & Wohlstand',
  career: 'Karriere & Beruf',
  lifephases: 'Lebensphasen & Entwicklung',
  partnership: 'Partnerschaft & Liebe',
}

function buildDomainDailyPrompt(type, profile, kinData, todayKin, todayStr) {
  const domainLabel = DOMAIN_LABELS[type] || type
  return `Du bist ein Maya Kalender Experte. Erstelle eine fokussierte Tagesenergie-Analyse speziell für den Bereich "${domainLabel}" auf Deutsch.

NUTZERDATEN:
Name: ${profile.name}
Geburtsdatum: ${profile.birth_date}
Geburts-Kin: Kin ${kinData.kin} – ${kinData.tone} ${kinData.seal}
Lebensthema: ${kinData.lifeTheme}
Galaktischer Ton: ${kinData.toneNumber} – ${kinData.tone} (Kraft: ${kinData.tonePower})

HEUTIGE ENERGIE:
Datum: ${todayStr}
Heutiges Kin: Kin ${todayKin.kin} – ${todayKin.tone} ${todayKin.seal}
Heutiger Ton: ${todayKin.toneNumber} – ${todayKin.tone} (Kraft: ${todayKin.tonePower})
Lebensthema des Tages: ${todayKin.lifeTheme}

FOKUSBEREICH: ${domainLabel}

Erstelle eine präzise, bereichsspezifische Tagesanalyse mit diesen Abschnitten:

## ENERGIE DES TAGES FÜR ${domainLabel.toUpperCase()}
Wie wirkt die heutige Kin-Energie konkret auf diesen Lebensbereich?

## DEINE PERSÖNLICHE RESONANZ
Wie verbindet sich deine Geburtsenergie mit der heutigen Energie in Bezug auf ${domainLabel}?

## KONKRETER FOKUS HEUTE
3 spezifische, praktische Impulse für ${domainLabel} heute.

## TIMING & EMPFEHLUNG
Wann und wie sollte ${profile.name} heute im Bereich ${domainLabel} aktiv werden oder Pause machen?

## AFFIRMATION
Eine kraftvolle Affirmation speziell für ${domainLabel}.

Ton: Direkt, konkret, praxisnah. Kein Allgemeinplatz. Sprich ${profile.name} direkt an.
Länge: 300–380 Wörter gesamt.`
}

const DAILY_DOMAIN_TYPES = ['business', 'health', 'family', 'selfexpression', 'finance', 'career', 'lifephases', 'partnership', 'relationship']

DAILY_DOMAIN_TYPES.forEach(type => {
  // GET: check if a domain daily exists for a given date (default: today)
  router.get(`/${type}/daily`, requireAuth, async (req, res) => {
    try {
      const dateStr = req.query.date || new Date().toISOString().split('T')[0]
      const { data } = await supabase
        .from('analyses')
        .select('content, created_at')
        .eq('user_id', req.user.id)
        .eq('type', `${type}_daily_${dateStr}`)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      res.json({ content: data?.content || null })
    } catch {
      res.json({ content: null })
    }
  })

  // POST: generate domain daily for a given date (default: today)
  router.post(`/${type}/daily`, requireAuth, async (req, res) => {
    try {
      const profile = await getProfile(req.user.id)
      checkMembership(profile)
      checkPurchased(profile, type)

      const dateStr = req.body.date || new Date().toISOString().split('T')[0]
      const dateObj = new Date(dateStr + 'T00:00:00')
      const monthName = GERMAN_MONTHS[dateObj.getMonth()]
      const dateLabel = `${dateObj.getDate()}. ${monthName} ${dateObj.getFullYear()}`

      const kinData = calculateKinFromDate(profile.birth_date)
      const dayKin = calculateKinFromDate(dateStr)

      const prompt = buildDomainDailyPrompt(type, profile, kinData, dayKin, dateLabel)
      const content = await callClaude(prompt, 4000)

      await saveAnalysis(req.user.id, `${type}_daily_${dateStr}`, content, dateStr)
      res.json({ content })
    } catch (err) {
      res.status(400).json({ error: err.message })
    }
  })
})

// Yearly analyses
const YEARLY_TYPES = ['business', 'health', 'family', 'selfexpression', 'finance', 'career', 'lifephases', 'partnership', 'relationship']

YEARLY_TYPES.forEach(type => {
  router.post(`/${type}/yearly`, requireAuth, async (req, res) => {
    try {
      const profile = await getProfile(req.user.id)
      checkMembership(profile)
      checkAnnualPlan(profile)
      checkPurchased(profile, type)

      const year = req.body.year || new Date().getFullYear()
      const kinData = calculateKinFromDate(profile.birth_date)
      const prompt = buildYearlyPrompt(type, profile, kinData, year)

      const content = await callClaude(prompt, 16000)
      const today = new Date().toISOString().split('T')[0]
      await saveAnalysis(req.user.id, `${type}_yearly_${year}`, content, today)
      res.json({ content })
    } catch (err) {
      res.status(400).json({ error: err.message })
    }
  })
})

// Partner compatibility analysis (uses partner data from user profile)
router.post('/partnership/partner-compatibility', requireAuth, async (req, res) => {
  try {
    const profile = await getProfile(req.user.id)
    checkMembership(profile)
    checkPurchased(profile, 'partnership')

    if (!profile.partner_birth_date) {
      return res.status(400).json({ error: 'Bitte trage zuerst die Geburtsdaten deines Partners im Profil ein.' })
    }

    const kinData = calculateKinFromDate(profile.birth_date)
    const partnerKin = calculateKinFromDate(profile.partner_birth_date)
    const partnerName = [profile.partner_first_name, profile.partner_last_name].filter(Boolean).join(' ') || 'Partner/in'
    const name = profile.name

    const prompt = `Du bist ein weltklasse Maya-Kalender-Experte und Beziehungscoach. Erstelle eine vollständige Partner-Kompatibilitätsanalyse auf Deutsch.
${SYSTEM_RULES}

PERSON 1: ${name}
Kin: Kin ${kinData.kin} – ${kinData.tone} ${kinData.seal}
Galaktischer Ton ${kinData.toneNumber}: ${kinData.tone} – Kraft: ${kinData.tonePower}
Lebensthema: ${kinData.lifeTheme}
Antipode: ${kinData.antipode}
Geburtsdatum: ${profile.birth_date}

PERSON 2: ${partnerName}
Kin: Kin ${partnerKin.kin} – ${partnerKin.tone} ${partnerKin.seal}
Galaktischer Ton ${partnerKin.toneNumber}: ${partnerKin.tone} – Kraft: ${partnerKin.tonePower}
Lebensthema: ${partnerKin.lifeTheme}
Antipode: ${partnerKin.antipode}
Geburtsdatum: ${profile.partner_birth_date}

Erstelle eine tiefe Paar-Kompatibilitätsanalyse. Jeder Abschnitt 4–6 Absätze:

## EURE ENERGETISCHE GRUNDKOMPATIBILITÄT
## WAS EUCH MAGISCH ANZIEHT
## EURE ENERGETISCHE WECHSELWIRKUNG
## EURE KOMMUNIKATIONSDYNAMIK
## HERAUSFORDERUNGEN & WACHSTUMSBEREICHE
## KOMPLEMENTÄRE KRÄFTE & SYNERGIEN
## EURE TIEFSTEN GEMEINSAMKEITEN
## POTENZIELLE KONFLIKTMUSTER
## SEXUALITÄT & KÖRPERLICHE INTIMITÄT
## EMOTIONALE SICHERHEIT & BINDUNG
## GEMEINSAME LEBENSZIELE & VISIONEN
## WACHSTUM DURCH DIESE BEZIEHUNG
## EURE GEMEINSAME SEELENMISSION
## ALLTAGSKOMPATIBILITÄT & LEBENSGESTALTUNG
## LANGZEITPOTENZIAL
## EMPFEHLUNGEN FÜR EURE PARTNERSCHAFT
## INDIVIDUELLE RATSCHLÄGE FÜR ${name.toUpperCase()}
## INDIVIDUELLE RATSCHLÄGE FÜR ${partnerName.toUpperCase()}
## AFFIRMATION FÜR EUER PAAR

Mindestens 3500 Wörter. Sei außergewöhnlich konkret und nenne beide Partner bei ihren Namen.`

    const content = await callClaude(prompt, 10000)
    const today = new Date().toISOString().split('T')[0]
    await saveAnalysis(req.user.id, 'partnership_compatibility', content, today)
    res.json({ content })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

function getEventLimit(profile) {
  if (profile.is_admin) return Infinity
  if (profile.subscription_plan === 'annual') return 12
  if ((profile.purchased_analyses || []).includes('events')) return 12
  const start = profile.membership_start || profile.created_at
  const months = start ? Math.floor((Date.now() - new Date(start).getTime()) / (1000 * 60 * 60 * 24 * 30.44)) : 0
  return Math.min(11, months + 1)
}

// Event analysis — analyse any entity by its "birth date" (country, job, relationship, etc.)
router.post('/event/:eventId', requireAuth, async (req, res) => {
  try {
    const profile = await getProfile(req.user.id)
    checkMembership(profile)

    // Check event slot limit
    const limit = getEventLimit(profile)
    const { count } = await supabase
      .from('user_events')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', req.user.id)
    if (count >= limit) {
      return res.status(403).json({ error: `Du hast dein Limit von ${limit} Ereignis${limit === 1 ? '' : 'sen'} erreicht.` })
    }

    const { eventId } = req.params
    const { data: event, error: evErr } = await supabase
      .from('user_events')
      .select('*')
      .eq('id', eventId)
      .eq('user_id', req.user.id)
      .single()
    if (evErr || !event) return res.status(404).json({ error: 'Ereignis nicht gefunden' })

    const userKin = calculateKinFromDate(profile.birth_date)
    const eventKin = calculateKinFromDate(event.event_date)

    const categoryLabels = {
      land: 'Land / Nation',
      job: 'Job / Karriere',
      beziehung: 'Beziehung / Partnerschaft',
      unternehmen: 'Unternehmen / Projekt',
      kauf: 'Kauf / Besitz',
      sonstiges: 'Ereignis',
    }
    const catLabel = categoryLabels[event.category] || 'Ereignis'

    const prompt = `Du bist ein weltklasse Maya-Kalender-Experte. Erstelle eine vollständige Energie-Analyse für ein ${catLabel} auf Deutsch.
${SYSTEM_RULES}

PERSON: ${profile.name}
Kin: Kin ${userKin.kin} – ${userKin.tone} ${userKin.seal}
Galaktischer Ton ${userKin.toneNumber}: ${userKin.tone} – Kraft: ${userKin.tonePower}
Lebensthema: ${userKin.lifeTheme}
Antipode: ${userKin.antipode}
Geburtsdatum: ${profile.birth_date}

EREIGNIS: "${event.name}"
Kategorie: ${catLabel}
Gründungs-/Startdatum: ${event.event_date}
Ereignis-Kin: Kin ${eventKin.kin} – ${eventKin.tone} ${eventKin.seal}
Galaktischer Ton des Ereignisses: ${eventKin.toneNumber} – ${eventKin.tone} (Kraft: ${eventKin.tonePower})
Lebensthema des Ereignisses: ${eventKin.lifeTheme}
${event.description ? `Kontext: ${event.description}` : ''}

Erstelle eine tiefe Analyse der Energie dieses Ereignisses und wie es mit ${profile.name} resoniert. Jeder Abschnitt 4–6 ausführliche Absätze:

## DIE GRUNDENERGIE VON "${event.name.toUpperCase()}"
## WAS DIESES KIN ÜBER ${catLabel === 'Ereignis' ? 'DAS EREIGNIS' : catLabel.toUpperCase()} AUSSAGT
## DIE KRAFT UND DAS POTENZIAL
## HERAUSFORDERUNGEN UND WACHSTUMSBEREICHE
## RESONANZ ZWISCHEN ${profile.name.toUpperCase()} UND "${event.name.toUpperCase()}"
## HARMONIEN UND SYNERGIEPUNKTE
## SPANNUNGSFELDER UND LERNBEREICHE
## TIMING UND ZYKLEN
## PRAKTISCHE EMPFEHLUNGEN FÜR ${profile.name.toUpperCase()}
## DAS LANGZEITPOTENZIAL
## AFFIRMATION

Mindestens 2500 Wörter. Sei außergewöhnlich konkret. Sprich ${profile.name} direkt an.`

    const content = await callClaude(prompt, 8000)
    const today = new Date().toISOString().split('T')[0]
    await saveAnalysis(req.user.id, `event_${eventId}`, content, today)
    res.json({ content })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// Get existing event analysis
router.get('/event/:eventId', requireAuth, async (req, res) => {
  try {
    const { eventId } = req.params
    const { data } = await supabase
      .from('analyses')
      .select('content, analysis_date')
      .eq('user_id', req.user.id)
      .eq('type', `event_${eventId}`)
      .order('analysis_date', { ascending: false })
      .limit(1)
      .single()
    if (!data) return res.status(404).json({ error: 'Keine Analyse gefunden' })
    res.json(data)
  } catch {
    res.status(404).json({ error: 'Keine Analyse gefunden' })
  }
})

export default router
