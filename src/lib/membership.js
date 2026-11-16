function berlinDate(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Berlin', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(now)
  const value = Object.fromEntries(parts.map(part => [part.type, part.value]))
  return `${value.year}-${value.month}-${value.day}`
}

export function hasMembership(profile, now = new Date()) {
  if (!profile) return false
  if (profile.is_admin === true || profile.membership_active === true) return true
  const until = profile.live_membership_until
  return typeof until === 'string' && /^20\d{2}-\d{2}-\d{2}$/.test(until) && until >= berlinDate(now)
}
