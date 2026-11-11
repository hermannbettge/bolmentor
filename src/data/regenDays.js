// App-authored pause suggestions; not universal medical or traditional Maya rules.
// Original 2026–2027 dates and all four levels preserved without inventing provenance.
// Only the wave=true spans can be verified mathematically as Dreamspell wave 7.
export const REGEN_PROVENANCE = {
  status: 'editorial-unverified',
  coverage: { from: '2026-10-04', to: '2027-12-26' },
  note: 'Herkunft und Ableitungsregel der einzelnen Ruhegrade sind im Export nicht dokumentiert. Keine Aussage zur körperlichen Regeneration. Fehlender Eintrag bedeutet keine Aussage.',
}
export const REGEN_DAYS = {
  '2026-10-04': { level: 2 },
  '2026-10-12': { level: 0 },
  '2026-10-24': { level: 0 },
  '2026-11-01': { level: 0 },
  // Sturmwelle (Dreamspell-Welle 7) 13.–25. Nov 2026
  '2026-11-13': { level: 0, wave: true },
  '2026-11-14': { level: 0, wave: true },
  '2026-11-15': { level: 0, wave: true },
  '2026-11-16': { level: 0, wave: true },
  '2026-11-17': { level: 0, wave: true },
  '2026-11-18': { level: 0, wave: true },
  '2026-11-19': { level: 0, wave: true },
  '2026-11-20': { level: 0, wave: true },
  '2026-11-21': { level: 0, wave: true },
  '2026-11-22': { level: 0, wave: true },
  '2026-11-23': { level: 0, wave: true },
  '2026-11-24': { level: 0, wave: true },
  '2026-11-25': { level: 0, wave: true },
  '2026-12-03': { level: 1 },
  '2026-12-11': { level: 0 },
  '2026-12-23': { level: 2 },
  '2026-12-31': { level: 0 },
  '2027-01-12': { level: 1 },
  '2027-01-20': { level: 0 },
  '2027-02-01': { level: 0 },
  '2027-02-09': { level: 0 },
  '2027-02-21': { level: 2 },
  '2027-03-01': { level: 0 },
  '2027-03-13': { level: 0 },
  '2027-03-21': { level: 1 },
  '2027-04-02': { level: 2 },
  '2027-04-22': { level: 2 },
  '2027-04-30': { level: 0 },
  '2027-05-02': { level: 3 },
  '2027-05-20': { level: 0 },
  '2027-06-01': { level: 2 },
  '2027-06-09': { level: 0 },
  '2027-06-21': { level: 2 },
  '2027-06-29': { level: 0 },
  '2027-07-11': { level: 0 },
  '2027-07-19': { level: 0 },
  // Sturmwelle (Dreamspell-Welle 7) 31.07–12.08 2027
  '2027-07-31': { level: 0, wave: true },
  '2027-08-01': { level: 0, wave: true },
  '2027-08-02': { level: 0, wave: true },
  '2027-08-03': { level: 0, wave: true },
  '2027-08-04': { level: 0, wave: true },
  '2027-08-05': { level: 0, wave: true },
  '2027-08-06': { level: 0, wave: true },
  '2027-08-07': { level: 0, wave: true },
  '2027-08-08': { level: 0, wave: true },
  '2027-08-09': { level: 0, wave: true },
  '2027-08-10': { level: 0, wave: true },
  '2027-08-11': { level: 0, wave: true },
  '2027-08-12': { level: 0, wave: true },
  '2027-08-20': { level: 1 },
  '2027-08-28': { level: 0 },
  '2027-09-09': { level: 2 },
  '2027-09-17': { level: 0 },
  '2027-09-29': { level: 1 },
  '2027-10-07': { level: 0 },
  '2027-10-19': { level: 0 },
  '2027-10-27': { level: 0 },
  '2027-11-08': { level: 2 },
  '2027-11-16': { level: 0 },
  '2027-11-28': { level: 0 },
  '2027-12-06': { level: 0 },
  '2027-12-18': { level: 2 },
  '2027-12-26': { level: 0 },
}

export function getRegenDay(dateStr) {
  return REGEN_DAYS[dateStr] || null
}

export function getRegenSymbol(regen) {
  if (!regen) return null
  if (regen.wave) return { symbol: '〰', label: 'Sturmwelle · App-Ruheimpuls', color: '#7B9ED9' }
  const symbols = ['✦', '✦✦', '✦✦✦', '✦✦✦✦']
  const labels = ['Ruheimpuls Stufe 0', 'Ruheimpuls Stufe 1', 'Ruheimpuls Stufe 2', 'Ruheimpuls Stufe 3']
  return { symbol: symbols[regen.level], label: labels[regen.level], color: '#C47A5A' }
}

export const REGEN_LEGEND = [
  { symbol: '✦', label: 'Ruheimpuls Stufe 0', desc: 'Kraft tanken, Tempo herausnehmen' },
  { symbol: '✦✦', label: 'Ruheimpuls Stufe 1', desc: 'Bewusst pausieren, wenig planen' },
  { symbol: '✦✦✦', label: 'Ruheimpuls Stufe 2', desc: 'Optional mehr Raum für Erholung schaffen' },
  { symbol: '✦✦✦✦', label: 'Ruheimpuls Stufe 3', desc: 'Freiwillig eine längere Pause erwägen' },
  { symbol: '〰', label: 'Sturmwelle · App-Ruheimpuls', desc: '13 Tage der Sturmwelle. Redaktionelle Einladung zur Reflexion und zu selbst gewählten Pausen.' },
]
