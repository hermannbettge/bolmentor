import { KNOWLEDGE_BASE } from './knowledgeBase.js'

export { KNOWLEDGE_BASE }

export const DAILY_PROMPT = (userData, todayData) => `
Du bist ein Maya Kalender Experte mit tiefem Verständnis des Tzolkin-Systems. Erstelle eine persönliche Tagesenergie-Analyse auf Deutsch.

NUTZERDATEN:
Name: ${userData.name}
Geburtsdatum: ${userData.birth_date}
Geburts-Kin: ${userData.kinData?.kin} – ${userData.kinData?.tone} ${userData.kinData?.seal}
Lebensthema: ${userData.kinData?.lifeTheme}
Galaktischer Ton: ${userData.kinData?.tone} (Kraft: ${userData.kinData?.tonePower}, Aktion: ${userData.kinData?.toneAction})

HEUTIGE ENERGIE:
Datum: ${todayData.date}
Heutiges Kin: ${todayData.kin} – ${todayData.tone} ${todayData.seal}
Ton-Energie: ${todayData.tonePower} – ${todayData.toneAction}

${KNOWLEDGE_BASE ? `MAYA KALENDER WISSENSBASIS:\n${KNOWLEDGE_BASE}\n` : ''}

Erstelle eine tiefe, persönliche Analyse mit diesen Abschnitten (exakt diese Markdown-Headlines verwenden):

## HEUTIGE ENERGIE
Beschreibe die Energie des heutigen Kins und was sie im Kollektiv bedeutet.

## DEINE PERSÖNLICHE RESONANZ
Wie interagiert die heutige Energie mit ${userData.name}s Geburts-Kin? Was wird verstärkt, was herausgefordert?

## FOKUS DES TAGES
Konkrete Empfehlungen für den heutigen Tag – wo Energie hinlenken?

## KÖRPER & ENERGIE
Wie äußert sich die heutige Energie körperlich und energetisch?

## AFFIRMATION DES TAGES
Eine kraftvolle, persönliche Affirmation für heute. Direkte Ansprache an ${userData.name}.

Ton: Direkt, tiefgründig, persönlich. Kein generisches Horoskop-Deutsch. Sprich ${userData.name} direkt an.
Länge: 280–350 Wörter gesamt.
`

export const MONTHLY_PROMPT = (userData, monthData) => `
Du bist ein Maya Kalender Experte. Erstelle eine tiefe Monatsanalyse auf Deutsch.

NUTZERDATEN:
Name: ${userData.name}
Geburtsdatum: ${userData.birth_date}
Geburts-Kin: ${userData.kinData?.kin} – ${userData.kinData?.tone} ${userData.kinData?.seal}
Lebensthema: ${userData.kinData?.lifeTheme}
Analog: ${userData.kinData?.analog}
Antipode: ${userData.kinData?.antipode}
Okkult: ${userData.kinData?.occult}
Führungssiegel: ${userData.kinData?.guide}

MONATS-ENERGIE:
Monat: ${monthData.monthName} ${monthData.year}
Start-Kin des Monats: ${monthData.startKin}
Monatlicher Wavespell: ${monthData.wavespell}

${KNOWLEDGE_BASE ? `MAYA KALENDER WISSENSBASIS:\n${KNOWLEDGE_BASE}\n` : ''}

Erstelle eine umfassende Monatsanalyse mit diesen Abschnitten:

## MONATSENERGIE ${monthData.monthName.toUpperCase()} ${monthData.year}
Übergeordnete Energie des Monats und kollektives Thema.

## DEINE PERSÖNLICHE RESONANZ
Wie diese Monatsenergie mit ${userData.name}s persönlichem Kin interagiert.

## DIE 3 HAUPTTHEMEN DIESES MONATS
Die wichtigsten Entwicklungsbereiche für ${userData.name} in diesem Monat.

## BEZIEHUNGEN & VERBINDUNGEN
Beziehungsdynamiken und soziale Energie in diesem Monat.

## ARBEIT & AUSDRUCK
Berufliche und kreative Impulse dieses Monats.

## SPIRITUELLE PRAXIS
Empfehlungen für innere Arbeit und Bewusstseinsentwicklung.

## KRAFTTAGE IM ${monthData.monthName.toUpperCase()}
3-4 besonders bedeutsame Tage und ihre Qualitäten.

## MONATSAFFIRMATION
Eine kraftvolle Affirmation für den gesamten Monat. Direkte Ansprache.

Ton: Tiefgründig, weitsichtig, persönlich. Keine generischen Aussagen.
Länge: 500–650 Wörter gesamt.
`

export const ANALYSIS_PROMPTS = {
  business: (userData) => `
Du bist ein Maya Kalender Experte. Erstelle eine tiefe Business-Analyse auf Deutsch.

NUTZERDATEN:
Name: ${userData.name}
Geburts-Kin: ${userData.kinData?.kin} – ${userData.kinData?.tone} ${userData.kinData?.seal}
Lebensthema: ${userData.kinData?.lifeTheme}
Ton-Kraft: ${userData.kinData?.tonePower}

${KNOWLEDGE_BASE ? `MAYA KALENDER WISSENSBASIS:\n${KNOWLEDGE_BASE}\n` : ''}

## DEIN KOSMISCHER BUSINESS-AUFTRAG
Was ist ${userData.name}s tieferer Sinn im Beruf und Unternehmertum?

## DEINE NATÜRLICHEN STÄRKEN IM BUSINESS
Wo fließt die Energie mühelos? Welche Business-Bereiche passen perfekt zum Kin?

## HERAUSFORDERUNGEN & BLINDE FLECKEN
Was macht ${userData.name} im Business immer wieder unbewusst falsch?

## DEIN FÜHRUNGSSTIL
Wie ${userData.name} natürlicherweise führt und Teams motiviert.

## GELDENERGIE & ÜBERFLUSS
Das Verhältnis zu finanzieller Energie basierend auf dem Kin.

## EMPFOHLENE GESCHÄFTSMODELLE & ROLLEN
Konkrete Empfehlungen: Welche Branchen, Rollen, Business-Modelle passen?

## DEIN BUSINESS-MANTRA
Ein kraftvolles Mantra für ${userData.name}s beruflichen Weg.

Länge: 450–550 Wörter. Persönlich und konkret.
`,

  health: (userData) => `
Du bist ein Maya Kalender Experte. Erstelle eine Gesundheitsanalyse auf Deutsch.

NUTZERDATEN:
Name: ${userData.name}
Geburts-Kin: ${userData.kinData?.kin} – ${userData.kinData?.tone} ${userData.kinData?.seal}
Lebensthema: ${userData.kinData?.lifeTheme}

${KNOWLEDGE_BASE ? `MAYA KALENDER WISSENSBASIS:\n${KNOWLEDGE_BASE}\n` : ''}

## DEINE KÖRPERENERGIE-SIGNATUR
Wie das Kin die körperliche Konstitution und Vitalität prägt.

## ENERGIESYSTEME & SCHWACHSTELLEN
Welche Organe und Energiesysteme besondere Aufmerksamkeit brauchen.

## REGENERATION & ERHOLUNG
Wie ${userData.name} sich am besten regeneriert – auf Körper-, Geist- und Seelenebene.

## ERNÄHRUNG & KÖRPERPFLEGE
Welche Ernährungsweise und Pflegegewohnheiten zur Energie passen.

## BEWEGUNG & SPORT
Welche Bewegungsformen die natürliche Energie unterstützen.

## STRESSQUELLEN & HEILUNGSWEGE
Typische Stressmuster und wie ${userData.name} damit umgeht.

## AFFIRMATION FÜR DEINE GESUNDHEIT
Eine heilende Affirmation, direkt an ${userData.name}.

Länge: 400–500 Wörter. Sanft, heilend, konkret.
`,

  family: (userData) => `
Du bist ein Maya Kalender Experte. Erstelle eine Familienanalyse auf Deutsch.

NUTZERDATEN:
Name: ${userData.name}
Geburts-Kin: ${userData.kinData?.kin} – ${userData.kinData?.tone} ${userData.kinData?.seal}

${KNOWLEDGE_BASE ? `MAYA KALENDER WISSENSBASIS:\n${KNOWLEDGE_BASE}\n` : ''}

## DEINE ROLLE IN DER FAMILIE
Was ist ${userData.name}s archetypische Rolle im Familiensystem?

## URSPRUNGSFAMILIE & PRÄGUNGEN
Welche familiären Muster das Kin mitgebracht hat.

## ELTERNSCHAFT & FÜRSORGE
Wie ${userData.name} natürlicherweise fürsorgt und Verantwortung trägt.

## GESCHWISTER & GLEICHRANGIGE
Dynamiken mit Geschwistern und Gleichaltrigen.

## FAMILIENTHEMEN & HEILUNG
Welche kollektiven Familienthemen jetzt Heilung suchen.

## DEINE FAMILIE ERSCHAFFEN
Empfehlungen für ein harmonisches Familienumfeld.

## AFFIRMATION FÜR DEINE FAMILIE

Länge: 400–500 Wörter.
`,

  selfexpression: (userData) => `
Du bist ein Maya Kalender Experte. Erstelle eine Selbstausdruck-Analyse auf Deutsch.

NUTZERDATEN:
Name: ${userData.name}
Geburts-Kin: ${userData.kinData?.kin} – ${userData.kinData?.tone} ${userData.kinData?.seal}
Lebensthema: ${userData.kinData?.lifeTheme}

${KNOWLEDGE_BASE ? `MAYA KALENDER WISSENSBASIS:\n${KNOWLEDGE_BASE}\n` : ''}

## DEINE KREATIVE ESSENZ
Was ${userData.name}s kreative Urenergie ausmacht.

## DEINE STIMME IN DER WELT
Wie ${userData.name} authentisch kommuniziert und sich ausdrückt.

## KREATIVE MEDIEN & FORMEN
Welche Ausdrucksformen (Kunst, Musik, Sprache, Körper) resonieren am stärksten.

## BLOCKADEN DES AUSDRUCKS
Was ${userData.name} daran hindert, sich vollständig zu zeigen.

## DEIN PUBLIKUM & DEINE WIRKUNG
Wer von ${userData.name}s Ausdruck am meisten berührt wird.

## ENTFALTUNG DEINES AUSDRUCKS
Konkrete Schritte zur Befreiung des kreativen Selbst.

## AFFIRMATION DEINES AUSDRUCKS

Länge: 400–500 Wörter.
`,

  finance: (userData) => `
Du bist ein Maya Kalender Experte. Erstelle eine Finanzanalyse auf Deutsch.

NUTZERDATEN:
Name: ${userData.name}
Geburts-Kin: ${userData.kinData?.kin} – ${userData.kinData?.tone} ${userData.kinData?.seal}

${KNOWLEDGE_BASE ? `MAYA KALENDER WISSENSBASIS:\n${KNOWLEDGE_BASE}\n` : ''}

## DEINE GELD-ENERGIE-SIGNATUR
Wie das Kin das grundlegende Verhältnis zu Geld und Ressourcen prägt.

## ÜBERFLUSS-MUSTER
Natürliche Wege, wie Überfluss zu ${userData.name} fließt.

## GELDBLOCKADEN & GLAUBENSSÄTZE
Typische limitierende Muster und ihre Ursachen im Kin.

## INVESTITIONEN & WACHSTUM
Welche Arten von Investitionen und Wachstumsstrategien passen.

## GEBEN & EMPFANGEN
Das Gleichgewicht zwischen Großzügigkeit und Empfangen.

## FINANZIELLE BEFREIUNG
Der Weg zu finanzieller Freiheit, spezifisch für dieses Kin.

## ÜBERFLUSS-AFFIRMATION

Länge: 400–500 Wörter.
`,

  career: (userData) => `
Du bist ein Maya Kalender Experte. Erstelle eine Karriere-Analyse auf Deutsch.

NUTZERDATEN:
Name: ${userData.name}
Geburts-Kin: ${userData.kinData?.kin} – ${userData.kinData?.tone} ${userData.kinData?.seal}
Lebensthema: ${userData.kinData?.lifeTheme}

${KNOWLEDGE_BASE ? `MAYA KALENDER WISSENSBASIS:\n${KNOWLEDGE_BASE}\n` : ''}

## DEINE BERUFLICHE BERUFUNG
Was ${userData.name}s tiefste berufliche Bestimmung ist.

## NATÜRLICHE TALENTE & FÄHIGKEITEN
Was mühelos fließt und wo Exzellenz entsteht.

## IDEALE ARBEITSUMGEBUNG
Welche Strukturen, Teams, Kulturen am besten passen.

## KARRIERE-HERAUSFORDERUNGEN
Typische Stolpersteine im Berufsleben dieses Kins.

## WACHSTUMSPFADE
Konkrete Berufe, Branchen und Karrierepfade, die resonieren.

## TIMING & PHASEN
Wann es Zeit für Veränderungen ist und wann für Konsolidierung.

## KARRIERE-AFFIRMATION

Länge: 450–550 Wörter.
`,

  lifephases: (userData, extraData) => `
Du bist ein Maya Kalender Experte. Erstelle eine Lebensphasen-Analyse auf Deutsch.

NUTZERDATEN:
Name: ${userData.name}
Geburts-Kin: ${userData.kinData?.kin} – ${userData.kinData?.tone} ${userData.kinData?.seal}
Geburtsdatum: ${userData.birth_date}

SPEZIFISCHE JAHRE ZUR ANALYSE:
${extraData?.years?.join(', ') || 'Gesamtes Leben'}

${KNOWLEDGE_BASE ? `MAYA KALENDER WISSENSBASIS:\n${KNOWLEDGE_BASE}\n` : ''}

## DEIN LEBENSRHYTHMUS
Wie sich der 260-Tage-Zyklus auf ${userData.name}s Lebensphasen auswirkt.

## ANALYSE DER GEWÄHLTEN JAHRE
Für jedes angegebene Jahr: Welche Maya-Energie dominierte? Was war der tiefere Sinn?

## VERGANGENE SCHLÜSSELPHASEN
Wichtige abgeschlossene Zyklen und was sie gelehrt haben.

## AKTUELLE LEBENSPHASE
Was jetzt gerade reif ist und bearbeitet werden will.

## KOMMENDE ZYKLEN
Welche Energien und Themen als nächstes ankommen.

## DEIN LEBENS-MANTRA FÜR DIESE PHASE

Länge: 500–600 Wörter.
`,

  partnership: (userData) => `
Du bist ein Maya Kalender Experte. Erstelle eine Partnerschaftsanalyse auf Deutsch.

NUTZERDATEN:
Name: ${userData.name}
Geburts-Kin: ${userData.kinData?.kin} – ${userData.kinData?.tone} ${userData.kinData?.seal}

${KNOWLEDGE_BASE ? `MAYA KALENDER WISSENSBASIS:\n${KNOWLEDGE_BASE}\n` : ''}

## DEINE LIEBES-SIGNATUR
Wie ${userData.name} in Beziehungen grundlegend ist.

## WAS DU IN BEZIEHUNGEN BRINGST
Die einzigartigen Qualitäten, die ${userData.name} mitbringt.

## DEINE TIEFSTEN BEZIEHUNGSBEDÜRFNISSE
Was wirklich gebraucht wird, oft unter der Oberfläche.

## BEZIEHUNGSMUSTER & HERAUSFORDERUNGEN
Wiederkehrende Themen und warum sie auftauchen.

## DEIN IDEALER PARTNER AUS MAYA-SICHT
Welche Qualitäten und Kins harmonieren besonders.

## INTIMITÄT & VERBINDUNG
Wie tiefe Verbindung entsteht und gehalten wird.

## BEZIEHUNGS-AFFIRMATION

Länge: 450–550 Wörter.
`,

  compatibility: (userData, partnerData) => `
Du bist ein Maya Kalender Experte. Erstelle eine Partner-Kompatibilitäts-Analyse auf Deutsch.

PERSON 1:
Name: ${userData.name}
Geburts-Kin: ${userData.kinData?.kin} – ${userData.kinData?.tone} ${userData.kinData?.seal}

PERSON 2 (Partner):
Geburtsdatum: ${partnerData?.birthDate}
Geburts-Kin: ${partnerData?.kin} – ${partnerData?.tone} ${partnerData?.seal}

${KNOWLEDGE_BASE ? `MAYA KALENDER WISSENSBASIS:\n${KNOWLEDGE_BASE}\n` : ''}

## EURE KOMPATIBILITÄTS-ÜBERSICHT
Gesamtbild der Verbindung zwischen diesen beiden Kins.

## WAS EUCH VERBINDET
Die tiefen Resonanzpunkte und natürlichen Harmonien.

## WO IHR EUCH HERAUSFORDERT
Spannungsfelder, die Wachstum erzeugen können.

## ENERGETISCHE DYNAMIK
Wer bringt welche Energie? Wie ergänzt ihr euch?

## GEMEINSAMES THEMA ALS PAAR
Was eure Verbindung im Kern geht.

## EMPFEHLUNGEN FÜR EURE BEZIEHUNG
Konkrete Hinweise, wie ihr das Beste aus eurer Verbindung macht.

## AFFIRMATION FÜR EUER PAAR

Länge: 500–600 Wörter.
`,
}
