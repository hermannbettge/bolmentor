// Maya Tzolkin Calendar Engine (Dreamspell)
// Anchor: 26 July 1993 = Kin 144 (Yellow Magnetic Seed)
// Leap days (Feb 29) do NOT advance the Dreamspell Kin count

// One shared civil-date engine for browser and server. No local-midnight/DST arithmetic.
const mod = (n, m) => ((n % m) + m) % m
export function isLeapYear(y) {
  return y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0)
}
export function parseCivilDate(value) {
  if (typeof value !== 'string') throw new RangeError('Datum muss YYYY-MM-DD oder DD.MM.YYYY sein.')
  let match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  let y, m, d
  if (match) [, y, m, d] = match.map(Number)
  else {
    match = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(value)
    if (!match) throw new RangeError('Ungültiges Datumsformat.')
    d = Number(match[1]); m = Number(match[2]); y = Number(match[3])
  }
  if (y < 1 || y > 9999 || m < 1 || m > 12) throw new RangeError('Ungültiges Datum.')
  const lengths = [31, isLeapYear(y) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  if (d < 1 || d > lengths[m - 1]) throw new RangeError('Ungültiges Datum.')
  return { year: y, month: m, day: d }
}
export function civilDateISO(date = new Date(), timeZone = 'Europe/Berlin') {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-CA', {
    timeZone, year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(date).map(p => [p.type, p.value]))
  return `${parts.year}-${parts.month}-${parts.day}`
}
function serial365({ year, month, day }) {
  const starts = [0,31,59,90,120,151,181,212,243,273,304,334]
  return (year - 1) * 365 + starts[month - 1] + day - 1
}
const ANCHOR_SERIAL = serial365({ year: 1993, month: 7, day: 26 })
const ANCHOR_KIN_0 = 143

const SEALS = [
  { name: 'Roter Drache', color: 'rot', english: 'Red Dragon' },
  { name: 'Weißer Wind', color: 'weiß', english: 'White Wind' },
  { name: 'Blaue Nacht', color: 'blau', english: 'Blue Night' },
  { name: 'Gelbe Saat', color: 'gelb', english: 'Yellow Seed' },
  { name: 'Rote Schlange', color: 'rot', english: 'Red Serpent' },
  { name: 'Weißer Weltenwandler', color: 'weiß', english: 'White World-Bridger' },
  { name: 'Blaue Hand', color: 'blau', english: 'Blue Hand' },
  { name: 'Gelber Stern', color: 'gelb', english: 'Yellow Star' },
  { name: 'Roter Mond', color: 'rot', english: 'Red Moon' },
  { name: 'Weißer Hund', color: 'weiß', english: 'White Dog' },
  { name: 'Blauer Affe', color: 'blau', english: 'Blue Monkey' },
  { name: 'Gelber Mensch', color: 'gelb', english: 'Yellow Human' },
  { name: 'Roter Himmelswanderer', color: 'rot', english: 'Red Skywalker' },
  { name: 'Weißer Zauberer', color: 'weiß', english: 'White Wizard' },
  { name: 'Blauer Adler', color: 'blau', english: 'Blue Eagle' },
  { name: 'Gelber Krieger', color: 'gelb', english: 'Yellow Warrior' },
  { name: 'Rote Erde', color: 'rot', english: 'Red Earth' },
  { name: 'Weißer Spiegel', color: 'weiß', english: 'White Mirror' },
  { name: 'Blauer Sturm', color: 'blau', english: 'Blue Storm' },
  { name: 'Gelbe Sonne', color: 'gelb', english: 'Yellow Sun' },
]

const TONES = [
  { name: 'Magnetisch', number: 1, power: 'Vereint', action: 'Zieht an', essence: 'Zweck' },
  { name: 'Lunar', number: 2, power: 'Polarisiert', action: 'Stabilisiert', essence: 'Herausforderung' },
  { name: 'Elektrisch', number: 3, power: 'Aktiviert', action: 'Bindet', essence: 'Dienst' },
  { name: 'Selbst-Existent', number: 4, power: 'Definiert', action: 'Misst', essence: 'Form' },
  { name: 'Übertönend', number: 5, power: 'Befähigt', action: 'Gebietet', essence: 'Ausstrahlung' },
  { name: 'Rhythmisch', number: 6, power: 'Organisiert', action: 'Gleicht aus', essence: 'Gleichgewicht' },
  { name: 'Resonant', number: 7, power: 'Kanalisiert', action: 'Inspiriert', essence: 'Abstimmung' },
  { name: 'Galaktisch', number: 8, power: 'Harmonisiert', action: 'Modelliert', essence: 'Integrität' },
  { name: 'Solar', number: 9, power: 'Pulsiert', action: 'Verwirklicht', essence: 'Intention' },
  { name: 'Planetar', number: 10, power: 'Vervollkommnet', action: 'Produziert', essence: 'Manifestation' },
  { name: 'Spektral', number: 11, power: 'Löst auf', action: 'Befreit', essence: 'Befreiung' },
  { name: 'Kristallin', number: 12, power: 'Weiht', action: 'Universalisiert', essence: 'Kooperation' },
  { name: 'Kosmisch', number: 13, power: 'Überdauert', action: 'Transzendiert', essence: 'Präsenz' },
]

// Life themes based on seal index
const LIFE_THEMES = [
  'Pflege und Geburt des Neuen',
  'Kommunikation und Geist',
  'Träumen und Intuition',
  'Blühen und Zielen',
  'Lebenskraft und Bewegung',
  'Tod und Wandel',
  'Heilen und Vollenden',
  'Kunst und Schönheit',
  'Reinigung und Fließen',
  'Liebe und Loyalität',
  'Magie und Spielen',
  'Freier Wille und Weisheit',
  'Weltdienst und Erkundung',
  'Zauberei und Zeitlosigkeit',
  'Vision und Kreativität',
  'Intelligenz und Furchtlosigkeit',
  'Navigation und Synchronizität',
  'Reflexion und Ordnung',
  'Transformation und Selbst-Generation',
  'Erleuchtung und universelles Feuer',
]

// Offsets in the full 20-seal sequence, not positions in a filtered color array.
const GUIDE_OFFSETS = [0,12,4,16,8,0,12,4,16,8,0,12,4]
export function kinFromSealTone(sealIndex, toneNumber) {
  if (!Number.isInteger(sealIndex) || sealIndex < 0 || sealIndex > 19 ||
      !Number.isInteger(toneNumber) || toneNumber < 1 || toneNumber > 13) throw new RangeError('Ungültiges Siegel oder Ton.')
  for (let k = sealIndex; k < 260; k += 20) if (k % 13 + 1 === toneNumber) return k + 1
}
export function calculateKin(birthDateString, options = {}) {
  const date = parseCivilDate(birthDateString)
  if (date.month === 2 && date.day === 29) {
    // Foundation convention for births: before noon -> Feb 28, after noon -> Mar 1.
    // Unknown time and exactly noon remain unresolved; never invent a birth signature.
    if (options.leapDayBirth === 'before-noon') return calculateKin(`${date.year}-02-28`)
    if (options.leapDayBirth === 'after-noon') return calculateKin(`${date.year}-03-01`)
    return {
      kin: '0.0', specialDay: 'hunab-ku', seal: 'Hunab Ku', sealColor: 'neutral',
      sealIndex: null, toneIndex: null, tone: 'Außerhalb der Kin-Zählung', toneNumber: null,
      tonePower: '', toneAction: '', toneEssence: '', analog: '', analogIndex: null,
      antipode: '', antipodeIndex: null, occult: '', occultTone: '', occultSealIndex: null,
      guide: '', guideIndex: null, wavespell: null,
      lifeTheme: '29. Februar. Für die Geburtssignatur wird die lokale Geburtszeit benötigt. Vor Mittag gilt der 28. Februar, nach Mittag der 1. März. Genau Mittag ist in der Quelle nicht geregelt.',
    }
  }
  const kin = mod(ANCHOR_KIN_0 + serial365(date) - ANCHOR_SERIAL, 260)
  const sealIndex = kin % 20
  const toneIndex = kin % 13
  const toneNumber = toneIndex + 1
  const seal = SEALS[sealIndex]
  const tone = TONES[toneIndex]
  const antipodeIndex = mod(sealIndex + 10, 20)
  const occultToneIndex = 12 - toneIndex
  const occultSealIndex = 19 - sealIndex
  const analogIndex = mod(17 - sealIndex, 20)
  const guideIndex = mod(sealIndex + GUIDE_OFFSETS[toneIndex], 20)

  // Wavespell: which 13-day wavespell this kin belongs to
  const wavespell = Math.floor(kin / 13) + 1

  return {
    kin: kin + 1, // Kins are 1-260
    sealIndex,
    toneIndex,
    seal: seal.name,
    sealColor: seal.color,
    tone: tone.name,
    toneNumber: tone.number,
    tonePower: tone.power,
    toneAction: tone.action,
    toneEssence: tone.essence,
    analogKin: kinFromSealTone(analogIndex, toneNumber),
    analog: SEALS[analogIndex].name,
    analogIndex,
    antipodeKin: kinFromSealTone(antipodeIndex, toneNumber),
    antipode: SEALS[antipodeIndex].name,
    antipodeIndex,
    occultKin: 260 - kin,
    occult: SEALS[occultSealIndex].name,
    occultTone: TONES[occultToneIndex].name,
    occultSealIndex,
    guideKin: kinFromSealTone(guideIndex, toneNumber),
    guide: SEALS[guideIndex].name,
    guideIndex,
    wavespell,
    lifeTheme: LIFE_THEMES[sealIndex],
  }
}

export function calculateTodayKin() {
  const today = new Date()
  const dateStr = civilDateISO(today)
  return calculateKin(dateStr)
}

export function getGermanDate(date = new Date()) {
  const civil = parseCivilDate(civilDateISO(date))
  date = new Date(0)
  date.setUTCFullYear(civil.year, civil.month - 1, civil.day)
  date.setUTCHours(12, 0, 0, 0)
  const weekdays = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag']
  const months = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember']
  return {
    weekday: weekdays[date.getUTCDay()],
    day: date.getUTCDate(),
    month: months[date.getUTCMonth()],
    monthIndex: date.getUTCMonth(),
    year: date.getUTCFullYear(),
    formatted: `${weekdays[date.getUTCDay()]}, ${date.getUTCDate()}. ${months[date.getUTCMonth()]} ${date.getUTCFullYear()}`,
    shortFormatted: `${date.getUTCDate()}. ${months[date.getUTCMonth()]} ${date.getUTCFullYear()}`,
  }
}

export function daysUntilFirstOfNextMonth() {
  const now = new Date()
  const firstOfNext = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  const diff = firstOfNext - now
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  return { days, hours }
}

export function isFirstOfMonth() {
  return new Date().getDate() === 1
}

export { SEALS, TONES }
