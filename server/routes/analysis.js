import { Router } from 'express'
import Anthropic from '@anthropic-ai/sdk'
import { supabase } from '../lib/supabase.js'

const router = Router()

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})


import { calculateKin as calculateKinFromDate, civilDateISO, parseCivilDate } from '../../src/lib/mayanCalendar.js'
import { KNOWLEDGE_BASE } from '../../src/lib/knowledgeBase.js'
import { INTERPRETATION_RULES, calendarFacts, REGEN_CONTEXT } from '../lib/mayaContext.js'

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
  if (
    profile.is_admin ||
    profile.subscription_plan === 'annual' ||
    (profile.purchased_analyses || []).includes('yearly_select')
  ) return
  throw new Error('Die Jahresanalyse ist nur im Jahrestarif verfügbar')
}

// Monthly plan may only request today's date; annual and admin may request any date
function checkDateAccess(profile, dateStr) {
  if (profile.is_admin || profile.subscription_plan === 'annual') return
  const today = civilDateISO()
  if (dateStr !== today) {
    throw new Error('Vergangene und zukünftige Tage sind nur im Jahrestarif verfügbar.')
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
  const { error } = await supabase.from('analyses').insert({
    user_id: userId,
    type,
    content,
    analysis_date: analysisDate,
    month_year: monthYear,
  })
  if (error) throw new Error('Die Analyse konnte nicht gespeichert werden. Bitte erneut versuchen.')
}

// Call Claude
async function callClaude(prompt, maxTokens = 8000) {
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: maxTokens,
    system: `${INTERPRETATION_RULES}\n\n${KNOWLEDGE_BASE}\n\n${REGEN_CONTEXT}`,
    messages: [{ role: 'user', content: prompt }],
  })
  return message.content[0].text
}

// Stream a Claude response as SSE — keeps Railway connection alive for long responses
async function streamClaude(res, prompt, maxTokens, onComplete) {
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('X-Accel-Buffering', 'no') // disable nginx/Railway proxy buffering
  res.flushHeaders()

  // Keepalive pings every 5s force Railway's proxy to flush the buffer
  const keepalive = setInterval(() => {
    try { res.write(': ping\n\n') } catch {}
  }, 5000)

  let fullContent = ''
  try {
    const stream = anthropic.messages.stream({
      model: 'claude-sonnet-4-6',
      max_tokens: maxTokens,
      system: `${INTERPRETATION_RULES}\n\n${KNOWLEDGE_BASE}\n\n${REGEN_CONTEXT}`,
    messages: [{ role: 'user', content: prompt }],
    })
    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && chunk.delta?.type === 'text_delta') {
        fullContent += chunk.delta.text
        res.write(`data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`)
      }
    }
    const finalMessage = await stream.finalMessage()
    if (finalMessage.stop_reason === 'max_tokens') throw new Error('Die Analyse wurde wegen der Ausgabelänge abgebrochen und nicht gespeichert. Bitte erneut versuchen.')
    await onComplete(fullContent)
    res.write(`data: ${JSON.stringify({ done: true, content: fullContent })}\n\n`)
  } catch (err) {
    const msg = err.message || ''
    const userMsg = msg.startsWith('<') || msg.includes('<!DOCTYPE')
      ? 'KI-Dienst vorübergehend nicht erreichbar — bitte erneut versuchen.'
      : msg
    res.write(`data: ${JSON.stringify({ error: userMsg })}\n\n`)
  } finally {
    clearInterval(keepalive)
    res.end()
  }
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
  const month = GERMAN_MONTHS.indexOf(monthName) + 1
  const startISO = `${year}-${String(month).padStart(2, '0')}-01`
  const startKin = calculateKinFromDate(startISO)
  const monthFacts = calendarFacts(year, month)
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
${monthFacts}

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
- SIEGELNAMEN EXAKT VERWENDEN: Nutze den Siegelnamen immer genau so wie angegeben (z.B. "Weißer Spiegel", "Blauer Sturm"). Erfinde KEINE Komposita oder Abwandlungen wie "Spiegelmesser", "Sturmkraft" o.ä.
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
- Jeder Abschnitt 2–3 prägnante Absätze
- Konkret, tiefgründig, persönlich - kein generisches Horoskop-Deutsch
- Nutze Dreamspell als symbolischen Reflexionsrahmen, nicht als wissenschaftlich validierte Tiefenpsychologie oder Wahrsagerei
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

  const analog = kinData.analog || ''
  const occult = kinData.occult || ''

  const base = `PROFIL VON ${name.toUpperCase()}:
Kin: ${kin}
Galaktischer Ton ${toneNumber}: ${tone} – Kraft: ${tonePower}
Siegel: ${seal}
Lebensthema: ${theme}
Antipode (Herausforderung): ${antipode}
Analog (Unterstützer): ${analog}
Okkult (Verborgene Kraft): ${occult}
Guide (Wegweiser): ${guide}
Geburtsdatum: ${profile.birth_date}
`

  const prompts = {
    business: `Du bist ein weltklasse Maya-Kalender-Experte und Business-Coach. Erstelle eine vollständige, tiefe Business-Analyse auf Deutsch für ${name}.
${base}
${SYSTEM_RULES}

Erstelle eine prägnante Business-Analyse mit diesen Abschnitten. Jeder Abschnitt soll 1–2 kompakte Absätze haben und konkrete, handlungsorientierte Erkenntnisse liefern:

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

Gesamtlänge: ca. 1200–1500 Wörter. Sei konkret und tiefgründig, aber prägnant.`,

    health: `Du bist ein weltklasse Maya-Kalender-Experte und Gesundheitsberater. Erstelle eine vollständige Gesundheitsanalyse auf Deutsch für ${name}.
${base}
${SYSTEM_RULES}

Erstelle eine prägnante Gesundheitsanalyse. Jeder Abschnitt 1–2 kompakte Absätze:

## DEINE KÖRPERENERGIE-SIGNATUR
## DEINE KÖRPERWAHRNEHMUNG IM FOKUS
## SELBSTBEOBACHTUNG & WOHLBEFINDEN
## WIE DU ENERGIE VERLIERST UND GEWINNST
## SCHLAF, REGENERATION & ERHOLUNG
## ERNÄHRUNG AUS DEINER MAYA-ENERGIE
## BEWEGUNG, SPORT & KÖRPERPRAKTIKEN
## CHRONISCHE MUSTER & KÖRPERSIGNALE
## STRESSQUELLEN & WIE DU DAMIT UMGEHST
## EMOTIONEN & KÖRPER – DIE VERBINDUNG
## HEILUNGSWEG & TIEFE TRANSFORMATION
## DEINE ALLTÄGLICHE SELBSTFÜRSORGE
## ZYKLUS, RHYTHMUS & NATURVERBINDUNG
## HEILSAME UMGEBUNGEN & ORTE
## TÄGLICHE GESUNDHEITSPRAXIS
## DEINE GESUNDHEITS-AFFIRMATION

Gesamtlänge: ca. 1200–1500 Wörter.`,

    family: `Du bist ein weltklasse Maya-Kalender-Experte und Familientherapeut. Erstelle eine vollständige Familienanalyse auf Deutsch für ${name}.
${base}
${SYSTEM_RULES}

Tiefe Familienanalyse, jeder Abschnitt 1–2 kompakte Absätze:

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
## HEILUNG DES FAMILIENSYSTEMS
## WIE DU EINE NEUE FAMILIENKULTUR ERSCHAFFST
## DEIN ZUHAUSE ALS ENERGETISCHER RAUM
## FAMILIENRITUALE & VERBINDUNG
## GRENZEN SETZEN IN DER FAMILIE
## DEINE FAMILIEN-AFFIRMATION

Gesamtlänge: ca. 1200–1500 Wörter.`,

    selfexpression: `Du bist ein weltklasse Maya-Kalender-Experte und Kreativcoach. Erstelle eine vollständige Selbstausdruck-Analyse auf Deutsch für ${name}.
${base}
${SYSTEM_RULES}

Umfassende Selbstausdruck-Analyse, jeder Abschnitt 1–2 kompakte Absätze:

## DEINE KREATIVE ESSENZ & EINZIGARTIGKEIT
## DEINE STIMME IN DER WELT
## WIE DU WIRKLICH KOMMUNIZIERST
## DEINE KREATIVMEDIEN & AUSDRUCKSFORMEN
## DEIN KREATIVPROZESS – WIE DU ARBEITEST
## BLOCKADEN & INNERE ZENSUR
## ANGST VOR SICHTBARKEIT & URTEILEN
## DEIN PUBLIKUM & DEINE NATÜRLICHE WIRKUNG
## BÜHNE, SCHREIBEN, SPRECHEN – WAS PASST
## DEINE PERSÖNLICHE MARKE & AUFTRITT
## KREATIVE FÜLLE & INSPIRATION
## KOLLABORATION & CO-KREATION
## MONETARISIERUNG DEINES AUSDRUCKS
## VON DER IDEE ZUR MANIFESTATION
## DEIN EINZIGARTIGER BEITRAG ZUR WELT
## DEINE SELBSTAUSDRUCK-AFFIRMATION

Gesamtlänge: ca. 1200–1500 Wörter.`,

    finance: `Du bist ein weltklasse Maya-Kalender-Experte und Financial Coach. Erstelle eine vollständige Finanzanalyse auf Deutsch für ${name}.
${base}
${SYSTEM_RULES}

Tiefe Finanzanalyse, jeder Abschnitt 1–2 kompakte Absätze:

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

Gesamtlänge: ca. 1200–1500 Wörter.`,

    career: `Du bist ein weltklasse Maya-Kalender-Experte und Karriere-Coach. Erstelle eine vollständige Karriere-Analyse auf Deutsch für ${name}.
${base}
${SYSTEM_RULES}

Umfassende Karriereanalyse, jeder Abschnitt 1–2 kompakte Absätze:

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

Gesamtlänge: ca. 1200–1500 Wörter.`,

    lifephases: `Du bist ein weltklasse Maya-Kalender-Experte. Erstelle eine vollständige Lebensphasen-Analyse auf Deutsch für ${name}.
${base}
${SYSTEM_RULES}

Tiefe Lebensphasen-Analyse, jeder Abschnitt 1–2 kompakte Absätze:

## DEIN KOSMISCHER LEBENSRHYTHMUS
## DIE ERSTE LEBENSPHASE (KINDHEIT & JUGEND)
## DIE PRÄGUNGSPHASE (20ER JAHRE)
## DIE AUFBAUPHASE (30ER JAHRE)
## DIE REIFEPHASE (40ER JAHRE)
## DIE ERNTE- UND WEISHEITSPHASE (50ER+)
## DEINE AKTUELLE LEBENSPHASE – TIEFANALYSE
## VON DIR GENANNTE SCHLÜSSELEREIGNISSE AUS DEINER VERGANGENHEIT
## WAS DIESE EREIGNISSE DIR SAGEN
## KOMMENDE ZYKLEN & ENERGIEFELDER
## DIE NÄCHSTEN 3 JAHRE IM DETAIL
## LANGFRISTIGE LEBENSTHEMEN
## SEELISCHE AUFGABEN DIESER INKARNATION
## TRANSFORMATION & WANDEL – DEIN MUSTER
## WIE DU JEDE LEBENSPHASE NUTZT
## DEIN LEBENSPHASEN-MANTRA

Gesamtlänge: ca. 1200–1500 Wörter.`,

    partnership: `Du bist ein weltklasse Maya-Kalender-Experte und Beziehungscoach. Erstelle eine vollständige Partnerschaftsanalyse auf Deutsch für ${name}.
${base}
${SYSTEM_RULES}

Tiefe Partnerschaftsanalyse, jeder Abschnitt 1–2 kompakte Absätze:

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

Gesamtlänge: ca. 1200–1500 Wörter.`,

    relationship: `Du bist ein weltklasse Maya-Kalender-Experte und Beziehungscoach. Erstelle eine vollständige Beziehungsanalyse auf Deutsch für ${name} — fokussiert auf ihre/seine eigenen Beziehungsmuster, Bindungsstile und wie sie/er in Beziehungen agiert.
${base}
${SYSTEM_RULES}

Tiefe Beziehungsanalyse der eigenen Muster, jeder Abschnitt 1–2 kompakte Absätze:

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

Gesamtlänge: ca. 1200–1500 Wörter.`,

  }

  return prompts[type]
}

const MONTHS_DE = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember']

function buildMonthlyDeepPrompt(type, profile, kinData, month) {
  const name = profile.name
  const kin = `Kin ${kinData.kin} – ${kinData.tone} ${kinData.seal}`
  const theme = kinData.lifeTheme

  const typeLabels = {
    business: 'Business', health: 'Gesundheit', family: 'Familie',
    selfexpression: 'Selbstausdruck', finance: 'Finanzen', career: 'Karriere',
    lifephases: 'Lebensphasen', partnership: 'Partnerschaft', relationship: 'Beziehungsmuster',
  }
  const label = typeLabels[type] || type

  const [yearStr, monthStr] = month.split('-')
  const year = Number(yearStr)
  const monthIdx = Number(monthStr) - 1
  const monthName = MONTHS_DE[monthIdx] || monthStr

  return `Du bist ein weltklasse Maya-Kalender-Experte. Erstelle eine tiefe Monatsanalyse für ${monthName} ${year} im Bereich ${label} auf Deutsch für ${name}.

PROFIL:
Name: ${name}
Kin: ${kin}
Lebensthema: ${theme}
Monat: ${monthName} ${year}
${calendarFacts(year)}

${SYSTEM_RULES}

## ${monthName.toUpperCase()} ${year} – ${label.toUpperCase()}

Schreibe zunächst eine Monatsübersicht (3–4 Sätze zur übergeordneten Energie und dem Kernthema des Monats im Bereich ${label} für ${name}).

Dann analysiere jede Woche einzeln:

**Woche 1** (1.–7. ${monthName}): Detaillierte Energiebeschreibung, konkrete Chancen, worauf achten, was jetzt ideal ist
**Woche 2** (8.–14. ${monthName}): Detaillierte Energiebeschreibung, konkrete Chancen, worauf achten, was jetzt ideal ist
**Woche 3** (15.–21. ${monthName}): Detaillierte Energiebeschreibung, konkrete Chancen, worauf achten, was jetzt ideal ist
**Woche 4** (22.–Monatsende): Detaillierte Energiebeschreibung, konkrete Chancen, worauf achten, was jetzt ideal ist

## FAZIT & EMPFEHLUNGEN – ${label.toUpperCase()}
Die 3 wichtigsten Chancen dieses Monats, die 2 größten Herausforderungen, und 3 konkrete Handlungsempfehlungen für ${name} im Bereich ${label} für ${monthName} ${year}.

Jede Woche etwa 120–160 Wörter. Fazit etwa 200–250 Wörter. Gesamtlänge: etwa 800–1100 Wörter.`
}

// Legacy: kept for backward compatibility if ever needed
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
${calendarFacts(year)}

${SYSTEM_RULES}

Erstelle zunächst eine Jahresübersicht, dann für JEDEN der 12 Monate einen eigenen Abschnitt.
Jeder Monatsabschnitt etwa 180–240 Wörter. Gesamtlänge: etwa 2800–3500 Wörter.`
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
    if (!/^\d{4}$/.test(req.params.year) || !/^\d{1,2}$/.test(req.params.month) || year < 1900 || year > 2100 || month < 1 || month > 12) {
      return res.status(400).json({ error: 'Ungültiges Datum' })
    }

    const userKin = profile.birth_date ? calculateKinFromDate(profile.birth_date) : null
    const daysInMonth = new Date(year, month, 0).getDate()
    const days = []

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month).padStart(2,'0')}-${String(d).padStart(2,'0')}`
      const kin = calculateKinFromDate(dateStr)
      const energyType = kin.specialDay ? 'balance' : getEnergyType(kin.toneNumber)

      // Personal resonance: same seal, same tone, same wavespell as birth kin
      let resonance = 'none'
      if (userKin && !userKin.specialDay && !kin.specialDay) {
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
    const dateStr = req.query.date || civilDateISO()
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
  let profile, prompt, dateStr
  try {
    profile = await getProfile(req.user.id)
    checkMembership(profile)
    dateStr = req.body.date || civilDateISO()
    checkDateAccess(profile, dateStr)
    const dateObj = new Date(dateStr + 'T00:00:00')
    const monthName = GERMAN_MONTHS[dateObj.getMonth()]
    const dateLabel = `${dateObj.getDate()}. ${monthName} ${dateObj.getFullYear()}`
    const kinData = calculateKinFromDate(profile.birth_date)
    const dayKin = calculateKinFromDate(dateStr)
    prompt = buildDailyPrompt(profile, kinData, dayKin, dateLabel)
  } catch (err) {
    return res.status(400).json({ error: err.message })
  }
  await streamClaude(res, prompt, 8000, async (content) => {
    await saveAnalysis(req.user.id, `daily_${dateStr}`, content, dateStr)
  })
})

router.post('/monthly', requireAuth, async (req, res) => {
  let profile, prompt, todayStr, monthYear
  try {
    profile = await getProfile(req.user.id)
    checkMembership(profile)
    const today = new Date()
    const civil = parseCivilDate(civilDateISO(today))
    const monthName = GERMAN_MONTHS[civil.month - 1]
    const year = civil.year
    todayStr = civilDateISO(today)
    monthYear = `${year}-${String(civil.month).padStart(2, '0')}`
    const kinData = calculateKinFromDate(profile.birth_date)
    prompt = buildMonthlyPrompt(profile, kinData, monthName, year)
  } catch (err) {
    return res.status(400).json({ error: err.message })
  }
  await streamClaude(res, prompt, 8000, async (content) => {
    await saveAnalysis(req.user.id, 'monthly', content, todayStr, monthYear)
  })
})

// Special analyses — streamed via SSE to avoid Railway gateway timeout
const SPECIAL_TYPES = ['business', 'health', 'family', 'selfexpression', 'finance', 'career', 'lifephases', 'partnership', 'relationship']

SPECIAL_TYPES.forEach(type => {
  router.post(`/${type}`, requireAuth, async (req, res) => {
    // Validate before opening stream so we can return JSON errors for auth/access issues
    let profile, prompt
    try {
      profile = await getProfile(req.user.id)
      checkMembership(profile)
      checkPurchased(profile, type)
      const kinData = calculateKinFromDate(profile.birth_date)
      prompt = buildSpecialPrompt(type, profile, kinData, req.body.extraData)
      if (!prompt) return res.status(400).json({ error: 'Unbekannter Analysetyp' })
    } catch (err) {
      return res.status(400).json({ error: err.message })
    }

    const userId = req.user.id
    await streamClaude(res, prompt, 6000, async (content) => {
      const today = civilDateISO()
      await saveAnalysis(userId, type, content, today)
    })
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
      const dateStr = req.query.date || civilDateISO()
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
    let profile, prompt, dateStr
    try {
      profile = await getProfile(req.user.id)
      checkMembership(profile)
      checkPurchased(profile, type)
      dateStr = req.body.date || civilDateISO()
      checkDateAccess(profile, dateStr)
      const dateObj = new Date(dateStr + 'T00:00:00')
      const monthName = GERMAN_MONTHS[dateObj.getMonth()]
      const dateLabel = `${dateObj.getDate()}. ${monthName} ${dateObj.getFullYear()}`
      const kinData = calculateKinFromDate(profile.birth_date)
      const dayKin = calculateKinFromDate(dateStr)
      prompt = buildDomainDailyPrompt(type, profile, kinData, dayKin, dateLabel)
    } catch (err) {
      return res.status(400).json({ error: err.message })
    }
    const userId = req.user.id
    await streamClaude(res, prompt, 4000, async (content) => {
      await saveAnalysis(userId, `${type}_daily_${dateStr}`, content, dateStr)
    })
  })
})

// Yearly analyses
const YEARLY_TYPES = ['business', 'health', 'family', 'selfexpression', 'finance', 'career', 'lifephases', 'partnership', 'relationship']

YEARLY_TYPES.forEach(type => {
  router.post(`/${type}/yearly`, requireAuth, async (req, res) => {
    let prompt, month, userId
    try {
      const profile = await getProfile(req.user.id)
      checkMembership(profile)
      checkAnnualPlan(profile)
      checkPurchased(profile, type)
      // Accept month (YYYY-MM) for per-month analyses
      if (req.body.month && /^\d{4}-\d{2}$/.test(req.body.month)) {
        month = req.body.month
      } else if (req.body.year) {
        // legacy fallback: year → current month of that year
        const now = new Date()
        month = `${req.body.year}-${String(now.getMonth() + 1).padStart(2, '0')}`
      } else {
        const now = new Date()
        month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
      }
      const kinData = calculateKinFromDate(profile.birth_date)
      prompt = buildMonthlyDeepPrompt(type, profile, kinData, month)
      userId = req.user.id
    } catch (err) {
      return res.status(400).json({ error: err.message })
    }
    await streamClaude(res, prompt, 6000, async (content) => {
      const today = civilDateISO()
      await saveAnalysis(userId, `${type}_yearly_${month}`, content, today)
    })
  })
})

// Partner compatibility analysis (uses partner data from user profile)
router.post('/partnership/partner-compatibility', requireAuth, async (req, res) => {
  let prompt, userId
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

    prompt = `Du bist ein weltklasse Maya-Kalender-Experte und Beziehungscoach. Erstelle eine vollständige Partner-Kompatibilitätsanalyse auf Deutsch.
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

Gesamtlänge: ca. 1500–1800 Wörter. Sei konkret und nenne beide Partner bei ihren Namen.`

    userId = req.user.id
  } catch (err) {
    return res.status(400).json({ error: err.message })
  }
  await streamClaude(res, prompt, 10000, async (content) => {
    const today = civilDateISO()
    await saveAnalysis(userId, 'partnership_compatibility', content, today)
  })
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
  let prompt, userId, eventId
  try {
    const profile = await getProfile(req.user.id)
    checkMembership(profile)

    const limit = getEventLimit(profile)
    const { count } = await supabase
      .from('user_events')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', req.user.id)
    if (count >= limit) {
      return res.status(403).json({ error: `Du hast dein Limit von ${limit} Ereignis${limit === 1 ? '' : 'sen'} erreicht.` })
    }

    eventId = req.params.eventId
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

    prompt = `Du bist ein weltklasse Maya-Kalender-Experte. Erstelle eine vollständige Energie-Analyse für "${event.name}" (${catLabel}) auf Deutsch. Das Ereignis selbst steht im Mittelpunkt der Analyse.
${SYSTEM_RULES}

EREIGNIS: "${event.name}"
Kategorie: ${catLabel}
Gründungs-/Startdatum: ${event.event_date}
Ereignis-Kin: Kin ${eventKin.kin} – ${eventKin.tone} ${eventKin.seal}
Galaktischer Ton: ${eventKin.toneNumber} – ${eventKin.tone} (Kraft: ${eventKin.tonePower})
Lebensthema des Ereignisses: ${eventKin.lifeTheme}
${event.description ? `Kontext: ${event.description}` : ''}

BEOBACHTER: ${profile.name}
Kin: Kin ${userKin.kin} – ${userKin.tone} ${userKin.seal} | Lebensthema: ${userKin.lifeTheme}

Analysiere die Energie von "${event.name}" als eigenständige Kraft. Jeder Abschnitt 4–6 ausführliche Absätze:

## DIE GRUNDENERGIE VON "${event.name.toUpperCase()}"
Welche Wesensenergie trägt dieses Ereignis durch sein Kin? Was ist der Kern seiner Ausstrahlung und seines Charakters?

## STÄRKEN UND POTENZIALE
Was kann "${event.name}" von Natur aus gut? Welche Kräfte, Talente und Möglichkeiten trägt es in sich?

## HERAUSFORDERUNGEN UND WACHSTUMSBEREICHE
Wo liegen die energetischen Spannungsfelder für "${event.name}"? Was sind seine blinden Flecken oder Entwicklungsthemen?

## WAS STIMMT – WAS NICHT STIMMT
Was läuft für "${event.name}" im Einklang mit seiner Energie? Was kostet es Kraft, wenn es dagegen arbeitet?

## ZYKLEN UND TIMING
Welche Phasen und Rhythmen sind für "${event.name}" prägend? Wann ist seine Energie besonders stark?

## RESONANZ MIT ${profile.name.toUpperCase()}
Wie verbindet sich ${profile.name}s eigene Kin-Energie mit der von "${event.name}"? Wo gibt es Harmonie, wo Reibung, was kann ${profile.name} durch diese Verbindung besonders gut sehen oder nutzen?

## LANGZEITPOTENZIAL
Wohin entwickelt sich "${event.name}" auf dem langen Weg seiner Energie?

## AFFIRMATION FÜR "${event.name.toUpperCase()}"
Eine kraftvolle Affirmation, die das Wesen dieses Ereignisses beschreibt.

Gesamtlänge: ca. 1200–1500 Wörter. Das Ereignis ist das Subjekt jedes Abschnitts.`

    userId = req.user.id
  } catch (err) {
    return res.status(400).json({ error: err.message })
  }
  await streamClaude(res, prompt, 8000, async (content) => {
    const today = civilDateISO()
    await saveAnalysis(userId, `event_${eventId}`, content, today)
  })
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

// ── Event sub-analyses (daily / monthly / yearly) ──────────────────────────

function buildEventDailyPrompt(profile, event, userKin, dayKin, eventKin, dateLabel) {
  return `Du bist ein weltklasse Maya-Kalender-Experte. Analysiere die Energie des ${dateLabel} für "${event.name}". Das Ereignis selbst steht im Mittelpunkt. Schreibe auf Deutsch.
${SYSTEM_RULES}

EREIGNIS: "${event.name}"
Kin des Ereignisses: Kin ${eventKin.kin} – ${eventKin.tone} ${eventKin.seal} | Ton ${eventKin.toneNumber} | Lebensthema: ${eventKin.lifeTheme}

ENERGIE DES TAGES (${dateLabel}):
Tages-Kin: Kin ${dayKin.kin} – ${dayKin.tone} ${dayKin.seal} | Ton ${dayKin.toneNumber} | Lebensthema: ${dayKin.lifeTheme}

BEOBACHTER: ${profile.name}
Geburts-Kin: Kin ${userKin.kin} – ${userKin.tone} ${userKin.seal} | Ton ${userKin.toneNumber} | Lebensthema: ${userKin.lifeTheme}

## ENERGIE DES TAGES FÜR "${event.name.toUpperCase()}"
Was prägt "${event.name}" energetisch an diesem Tag? Was ist für "${event.name}" heute besonders relevant, was zieht es an, was stößt es ab?

## WAS JETZT STIMMT – WAS JETZT NICHT STIMMT
Was sollte "${event.name}" heute tun oder nutzen? Was sollte es heute besser lassen oder meiden?

## BLICK VON ${profile.name.toUpperCase()}
Wie sieht ${profile.name} diesen Tag für "${event.name}" durch die eigene Kin-Brille? Welchen besonderen Einblick ermöglicht die eigene Energie?

## AFFIRMATION FÜR DIESEN TAG
Eine kraftvolle Affirmation, die "${event.name}" für diesen Tag beschreibt.

Länge: 280–340 Wörter. Ton: präzise, klar, auf das Ereignis fokussiert.`
}

function buildEventMonthlyPrompt(profile, event, userKin, eventKin, monthName, year) {
  return `Du bist ein weltklasse Maya-Kalender-Experte. Analysiere die Monatsenergie des ${monthName} ${year} für "${event.name}". Das Ereignis selbst steht im Mittelpunkt. Schreibe auf Deutsch.
${SYSTEM_RULES}

EREIGNIS: "${event.name}"
Kin des Ereignisses: Kin ${eventKin.kin} – ${eventKin.tone} ${eventKin.seal} | Lebensthema: ${eventKin.lifeTheme}
${calendarFacts(year, GERMAN_MONTHS.indexOf(monthName) + 1)}

BEOBACHTER: ${profile.name}
Geburts-Kin: Kin ${userKin.kin} – ${userKin.tone} ${userKin.seal} | Lebensthema: ${userKin.lifeTheme}

## MONATSENERGIE FÜR "${event.name.toUpperCase()}" – ${monthName.toUpperCase()} ${year}
Was prägt "${event.name}" in diesem Monat energetisch? Welche Themen, Strömungen und Dynamiken sind für "${event.name}" im ${monthName} ${year} bestimmend?

## WAS JETZT STIMMT FÜR "${event.name.toUpperCase()}"
Welche Chancen und Potenziale öffnen sich für "${event.name}" in diesem Monat? Was sollte "${event.name}" jetzt nutzen, anstoßen oder stärken?

## WAS JETZT NICHT STIMMT FÜR "${event.name.toUpperCase()}"
Welche Risiken, Spannungen oder blinden Flecken trägt dieser Monat für "${event.name}"? Was sollte "${event.name}" in dieser Zeit meiden oder aufschieben?

## WOCHE FÜR WOCHE
4 kurze wöchentliche Schwerpunkte speziell für "${event.name}" im ${monthName}: Was ist in jeder Woche besonders prägend?

## BLICK VON ${profile.name.toUpperCase()}
Welchen besonderen Blickwinkel bringt ${profile.name} durch die eigene Kin-Energie auf diesen Monat für "${event.name}"?

## AFFIRMATION FÜR DEN ${monthName.toUpperCase()}
Eine kraftvolle Affirmation, die die Energie des Monats für "${event.name}" auf den Punkt bringt.

Länge: 450–530 Wörter. Das Ereignis ist das Subjekt der Analyse, nicht die Person.`
}

function buildEventYearlyPrompt(profile, event, userKin, eventKin, year) {
  return `Du bist ein weltklasse Maya-Kalender-Experte. Erstelle eine Jahresanalyse ${year} für das Ereignis "${event.name}" für ${profile.name}. Schreibe auf Deutsch.
${SYSTEM_RULES}

PERSON: ${profile.name}
Geburts-Kin: Kin ${userKin.kin} – ${userKin.tone} ${userKin.seal} | Lebensthema: ${userKin.lifeTheme}

EREIGNIS: "${event.name}"
Kin des Ereignisses: Kin ${eventKin.kin} – ${eventKin.tone} ${eventKin.seal} | Lebensthema: ${eventKin.lifeTheme}

${calendarFacts(year)}

## JAHRESÜBERBLICK ${year} FÜR "${event.name.toUpperCase()}"
Die übergreifende Energie des Jahres für dieses Ereignis.

Dann für jeden Monat ein eigener Abschnitt (Januar bis Dezember ${year}):
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

## JAHRESFAZIT UND EMPFEHLUNG
## AFFIRMATION FÜR ${year}

Jeder Monatsabschnitt 3–4 Sätze. Gesamtlänge: 900–1100 Wörter. Sprich ${profile.name} direkt an.`
}

function checkEventDateAccess(profile, dateStr) {
  if (profile.is_admin) return
  const today = civilDateISO()
  if (profile.subscription_plan === 'annual') return
  if (dateStr !== today) throw new Error('Mit dem Monatstarif ist nur der heutige Tag verfügbar.')
}

function checkEventMonthAccess(profile, year, month) {
  if (profile.is_admin) return
  if (profile.subscription_plan === 'annual') return
  const now = new Date()
  if (year !== now.getFullYear() || month !== now.getMonth() + 1) {
    throw new Error('Mit dem Monatstarif ist nur der aktuelle Monat verfügbar.')
  }
}

function checkEventYearAccess(profile, year) {
  if (profile.is_admin) return
  if (profile.subscription_plan !== 'annual') {
    throw new Error('Die Jahresanalyse ist nur im Jahrestarif verfügbar.')
  }
  const now = new Date()
  const maxYear = now.getFullYear() + 1
  if (year < 2020 || year > maxYear) {
    throw new Error(`Bitte wähle ein Jahr zwischen 2020 und ${maxYear}.`)
  }
}

async function getEventForUser(eventId, userId) {
  const { data: event, error } = await supabase
    .from('user_events').select('*').eq('id', eventId).eq('user_id', userId).single()
  if (error || !event) throw new Error('Ereignis nicht gefunden')
  return event
}

// Event daily
router.get('/event/:eventId/daily', requireAuth, async (req, res) => {
  try {
    const dateStr = req.query.date || civilDateISO()
    const { data } = await supabase.from('analyses')
      .select('content, created_at')
      .eq('user_id', req.user.id)
      .eq('type', `event_${req.params.eventId}_daily_${dateStr}`)
      .order('created_at', { ascending: false }).limit(1).single()
    res.json({ content: data?.content || null })
  } catch { res.json({ content: null }) }
})

router.post('/event/:eventId/daily', requireAuth, async (req, res) => {
  let prompt, userId, eventId, dateStr
  try {
    const profile = await getProfile(req.user.id)
    checkMembership(profile)
    eventId = req.params.eventId
    dateStr = req.body.date || civilDateISO()
    checkEventDateAccess(profile, dateStr)
    const event = await getEventForUser(eventId, req.user.id)
    const dateObj = new Date(dateStr + 'T00:00:00')
    const dateLabel = `${dateObj.getDate()}. ${GERMAN_MONTHS[dateObj.getMonth()]} ${dateObj.getFullYear()}`
    const userKin = calculateKinFromDate(profile.birth_date)
    const dayKin = calculateKinFromDate(dateStr)
    const eventKin = calculateKinFromDate(event.event_date)
    prompt = buildEventDailyPrompt(profile, event, userKin, dayKin, eventKin, dateLabel)
    userId = req.user.id
  } catch (err) {
    return res.status(400).json({ error: err.message })
  }
  await streamClaude(res, prompt, 4000, async (content) => {
    await saveAnalysis(userId, `event_${eventId}_daily_${dateStr}`, content, dateStr)
  })
})

// Event monthly
router.get('/event/:eventId/monthly', requireAuth, async (req, res) => {
  try {
    const monthYear = req.query.monthYear || civilDateISO().slice(0, 7)
    const { data } = await supabase.from('analyses')
      .select('content, created_at')
      .eq('user_id', req.user.id)
      .eq('type', `event_${req.params.eventId}_monthly_${monthYear}`)
      .order('created_at', { ascending: false }).limit(1).single()
    res.json({ content: data?.content || null })
  } catch { res.json({ content: null }) }
})

router.post('/event/:eventId/monthly', requireAuth, async (req, res) => {
  let prompt, userId, eventId, monthYear
  try {
    const profile = await getProfile(req.user.id)
    checkMembership(profile)
    eventId = req.params.eventId
    const now = new Date()
    const year = req.body.year || now.getFullYear()
    const month = req.body.month || (now.getMonth() + 1)
    checkEventMonthAccess(profile, year, month)
    monthYear = `${year}-${String(month).padStart(2, '0')}`
    const event = await getEventForUser(eventId, req.user.id)
    const userKin = calculateKinFromDate(profile.birth_date)
    const eventKin = calculateKinFromDate(event.event_date)
    prompt = buildEventMonthlyPrompt(profile, event, userKin, eventKin, GERMAN_MONTHS[month - 1], year)
    userId = req.user.id
  } catch (err) {
    return res.status(400).json({ error: err.message })
  }
  await streamClaude(res, prompt, 5000, async (content) => {
    const today = civilDateISO()
    await saveAnalysis(userId, `event_${eventId}_monthly_${monthYear}`, content, today)
  })
})

// Event yearly
router.get('/event/:eventId/yearly', requireAuth, async (req, res) => {
  try {
    const year = req.query.year || new Date().getFullYear()
    const { data } = await supabase.from('analyses')
      .select('content, created_at')
      .eq('user_id', req.user.id)
      .eq('type', `event_${req.params.eventId}_yearly_${year}`)
      .order('created_at', { ascending: false }).limit(1).single()
    res.json({ content: data?.content || null })
  } catch { res.json({ content: null }) }
})

router.post('/event/:eventId/yearly', requireAuth, async (req, res) => {
  let prompt, userId, eventId, year
  try {
    const profile = await getProfile(req.user.id)
    checkMembership(profile)
    eventId = req.params.eventId
    year = req.body.year || new Date().getFullYear()
    checkEventYearAccess(profile, year)
    const event = await getEventForUser(eventId, req.user.id)
    const userKin = calculateKinFromDate(profile.birth_date)
    const eventKin = calculateKinFromDate(event.event_date)
    prompt = buildEventYearlyPrompt(profile, event, userKin, eventKin, year)
    userId = req.user.id
  } catch (err) {
    return res.status(400).json({ error: err.message })
  }
  await streamClaude(res, prompt, 10000, async (content) => {
    const today = civilDateISO()
    await saveAnalysis(userId, `event_${eventId}_yearly_${year}`, content, today)
  })
})

export default router
