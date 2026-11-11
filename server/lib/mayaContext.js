import { REGEN_DAYS, REGEN_PROVENANCE } from '../../src/data/regenDays.js'
import { calculateKin } from '../../src/lib/mayanCalendar.js'

import { INTERPRETATION_RULES } from '../../src/lib/dreamspellReference.js'
export { INTERPRETATION_RULES }

export function calendarFacts(year, month = null) {
  if (!Number.isInteger(year) || year < 1900 || year > 2100 || (month !== null && (!Number.isInteger(month) || month < 1 || month > 12))) throw new RangeError('Kalenderzeitraum muss zwischen 1900 und 2100 liegen.')
  const rows = ['BERECHNETE KALENDERDATEN. Nur diese Zahlen verwenden. Deutungen sind symbolisch.']
  for (let m = month || 1; m <= (month || 12); m++) {
    const last = new Date(Date.UTC(year, m, 0)).getUTCDate()
    for (let d = 1; d <= last; d++) {
      const date = `${year}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`
      const k = calculateKin(date)
      rows.push(k.specialDay ? `${date}: 0.0 Hunab Ku, kein reguläres Kin.` : `${date}: Kin ${k.kin}, ${k.seal}, Ton ${k.toneNumber} ${k.tone}, Welle ${k.wavespell}.`)
    }
  }
  return rows.join('\n')
}

export const REGEN_CONTEXT = `REGENERATIONSDATEN DER APP
Status: ${REGEN_PROVENANCE.note}
Einzelne Stufen sind redaktionell, nicht aus Dreamspell verifiziert. wave=true bezeichnet die berechnete Sturmwelle. Ein fehlender Eintrag ist keine Aussage über Erholung oder Belastbarkeit.
Kin 207 hat in der gelieferten Liste unterschiedliche Stufen am 21.03.2027 und 06.12.2027. Keine dieser Stufen als objektive Wahrheit darstellen.
${Object.entries(REGEN_DAYS).map(([date, value]) => `${date}: Kin ${calculateKin(date).kin}, redaktionelle Stufe ${value.level}${value.wave ? ', Dreamspell-Sturmwelle 7' : ''}`).join('\n')}`
