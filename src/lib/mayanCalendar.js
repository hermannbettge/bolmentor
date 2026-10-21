// Maya Tzolkin Calendar Engine (Dreamspell)
// Anchor: 26 July 1993 = Kin 144 (Yellow Crystal Seed)
// Leap days (Feb 29) do NOT advance the Dreamspell Kin count

const ANCHOR_DATE = new Date('1993-07-26T00:00:00Z')
const ANCHOR_KIN_0 = 143 // Kin 144, zero-indexed

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
  { name: 'Roter Drachen', color: 'rot', english: 'Red Dragon' },
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
  { name: 'Rotes Schilf', color: 'rot', english: 'Red Skywalker' },
  { name: 'Weißer Zauberer', color: 'weiß', english: 'White Wizard' },
  { name: 'Blauer Adler', color: 'blau', english: 'Blue Eagle' },
  { name: 'Gelber Krieger', color: 'gelb', english: 'Yellow Warrior' },
  { name: 'Rote Erde', color: 'rot', english: 'Red Earth' },
  { name: 'Weißes Spiegelmesser', color: 'weiß', english: 'White Mirror' },
  { name: 'Blauer Sturm', color: 'blau', english: 'Blue Storm' },
  { name: 'Gelbe Sonne', color: 'gelb', english: 'Yellow Sun' },
]

const TONES = [
  { name: 'Magnetisch', number: 1, power: 'Vereint', action: 'Anzieht', essence: 'Zweck' },
  { name: 'Lunar', number: 2, power: 'Stabilisiert', action: 'Herausfordert', essence: 'Herausforderung' },
  { name: 'Elektrisch', number: 3, power: 'Aktiviert', action: 'Bindet', essence: 'Dienst' },
  { name: 'Selbst-Existent', number: 4, power: 'Definiert', action: 'Misst', essence: 'Form' },
  { name: 'Übertönend', number: 5, power: 'Befähigt', action: 'Strahlt aus', essence: 'Zentrum' },
  { name: 'Rhythmisch', number: 6, power: 'Organisiert', action: 'Gleicht aus', essence: 'Gleichgewicht' },
  { name: 'Resonant', number: 7, power: 'Kanalisiert', action: 'Inspiriert', essence: 'Abstimmung' },
  { name: 'Galaktisch', number: 8, power: 'Harmonisiert', action: 'Modelliert', essence: 'Integrität' },
  { name: 'Solar', number: 9, power: 'Pulsiert', action: 'Verwirklicht', essence: 'Intention' },
  { name: 'Planetar', number: 10, power: 'Manifestiert', action: 'Vollkommen macht', essence: 'Manifestation' },
  { name: 'Spektral', number: 11, power: 'Löst auf', action: 'Befreit', essence: 'Befreiung' },
  { name: 'Kristallin', number: 12, power: 'Weiht', action: 'Kooperiert', essence: 'Kooperation' },
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
  'Reflektion und Ordnung',
  'Transformation und Selbst-Generation',
  'Erleuchtung und universelles Feuer',
]

// Guide calculation: based on tone quartile, same color family
const GUIDE_MAP = {
  1: 0,   // tone 1 → same seal
  2: 0,
  3: 4,   // tone 3 → 5th seal in same color
  4: 8,
  5: 12,
  6: 16,
  7: 4,
  8: 8,
  9: 12,
  10: 16,
  11: 4,
  12: 8,
  13: 12,
}

function getSameColorSealOffset(sealIndex, offset) {
  const color = SEALS[sealIndex].color
  const sealsOfColor = SEALS
    .map((s, i) => ({ ...s, index: i }))
    .filter(s => s.color === color)
  const posInColor = sealsOfColor.findIndex(s => s.index === sealIndex)
  const targetPos = (posInColor + offset) % sealsOfColor.length
  return sealsOfColor[targetPos].index
}

export function calculateKin(birthDateString) {
  const parts = birthDateString.split('.')
  let birthDate
  if (parts.length === 3) {
    // DD.MM.YYYY format
    birthDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}T00:00:00Z`)
  } else {
    birthDate = new Date(birthDateString + 'T00:00:00Z')
  }

  const rawDiff = Math.floor((birthDate - ANCHOR_DATE) / 86400000)
  const leapDays = countLeapDaysBetween(birthDate, ANCHOR_DATE)
  const adjustedDiff = rawDiff + (rawDiff < 0 ? leapDays : -leapDays)
  const kin = ((ANCHOR_KIN_0 + adjustedDiff) % 260 + 260) % 260

  const sealIndex = kin % 20
  const toneIndex = kin % 13

  const seal = SEALS[sealIndex]
  const tone = TONES[toneIndex]

  // Antipode: 10 seals away
  const antipodeIndex = (sealIndex + 10) % 20

  // Occult: tones that sum to 14 (1+13, 2+12, 3+11, 4+10, 5+9, 6+8, 7+7)
  const occultToneIndex = (13 - toneIndex) % 13
  // Occult seal: complementary (10 away from antipode's position)
  const occultSealIndex = (sealIndex + 10) % 20

  // Analog: same tone, same color family, different seal
  const analogIndex = getSameColorSealOffset(sealIndex, 1)

  // Guide: depends on tone number
  const toneNumber = toneIndex + 1
  let guideIndex = sealIndex
  if (toneNumber === 1 || toneNumber === 2) {
    guideIndex = sealIndex
  } else if (toneNumber === 3 || toneNumber === 7 || toneNumber === 11) {
    guideIndex = getSameColorSealOffset(sealIndex, 1)
  } else if (toneNumber === 4 || toneNumber === 8 || toneNumber === 12) {
    guideIndex = getSameColorSealOffset(sealIndex, 2)
  } else if (toneNumber === 5 || toneNumber === 9 || toneNumber === 13) {
    guideIndex = getSameColorSealOffset(sealIndex, 3)
  } else if (toneNumber === 6 || toneNumber === 10) {
    guideIndex = getSameColorSealOffset(sealIndex, 4)
  }

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
    analog: SEALS[analogIndex].name,
    analogIndex,
    antipode: SEALS[antipodeIndex].name,
    antipodeIndex,
    occult: SEALS[occultSealIndex].name,
    occultTone: TONES[occultToneIndex].name,
    occultSealIndex,
    guide: SEALS[guideIndex].name,
    guideIndex,
    wavespell,
    lifeTheme: LIFE_THEMES[sealIndex],
  }
}

export function calculateTodayKin() {
  const today = new Date()
  const dateStr = today.toISOString().split('T')[0]
  return calculateKin(dateStr)
}

export function getGermanDate(date = new Date()) {
  const weekdays = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag']
  const months = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember']
  return {
    weekday: weekdays[date.getDay()],
    day: date.getDate(),
    month: months[date.getMonth()],
    monthIndex: date.getMonth(),
    year: date.getFullYear(),
    formatted: `${weekdays[date.getDay()]}, ${date.getDate()}. ${months[date.getMonth()]} ${date.getFullYear()}`,
    shortFormatted: `${date.getDate()}. ${months[date.getMonth()]} ${date.getFullYear()}`,
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
