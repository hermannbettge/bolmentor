import { Router } from 'express'
import { supabase } from '../lib/supabase.js'

const router = Router()
const exchangeUrl = 'https://hermannbettge.de/live-maya-exchange.php'
const datePattern = /^20\d{2}-(0[1-9]|1[0-2])-([0-2]\d|3[01])$/

router.get('/workshop-sso', async (req, res) => {
  res.set('Cache-Control', 'no-store')
  res.set('Referrer-Policy', 'no-referrer')
  const ticket = typeof req.query.ticket === 'string' ? req.query.ticket : ''
  const secret = process.env.BOL_MAYA_BRIDGE_SECRET || ''
  if (!/^[a-f0-9]{64}$/.test(ticket) || secret.length < 32) return res.redirect(303, '/login?workshop=error')

  try {
    const response = await fetch(exchangeUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-BOL-Maya-Bridge': secret },
      body: JSON.stringify({ ticket }),
      signal: AbortSignal.timeout(8000),
    })
    if (!response.ok) throw new Error('exchange rejected')
    const claim = await response.json()
    if (!claim || typeof claim.email !== 'string' || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(claim.email) ||
        !datePattern.test(claim.birth_date) || !datePattern.test(claim.access_until) ||
        typeof claim.first_name !== 'string' || typeof claim.last_name !== 'string') {
      throw new Error('invalid exchange response')
    }

    const { data: link, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'magiclink', email: claim.email,
    })
    if (linkError || !link?.user?.id || !link?.properties?.hashed_token ||
        link.user.email?.toLowerCase() !== claim.email.toLowerCase()) {
      throw new Error('MAYA login link failed')
    }
    const userId = link.user.id
    const { data: profile, error: readError } = await supabase.from('profiles')
      .select('id,deleted_at,live_membership_until').eq('id', userId).maybeSingle()
    if (readError || profile?.deleted_at) throw new Error('MAYA profile unavailable')
    const until = profile?.live_membership_until && profile.live_membership_until > claim.access_until
      ? profile.live_membership_until : claim.access_until

    if (profile) {
      const { error } = await supabase.from('profiles').update({
        live_membership_until: until, updated_at: new Date().toISOString(),
      }).eq('id', userId)
      if (error) throw error
    } else {
      const { error } = await supabase.from('profiles').insert({
        id: userId,
        name: `${claim.first_name} ${claim.last_name}`.trim(),
        birth_date: claim.birth_date,
        membership_active: false,
        subscription_plan: 'monthly',
        purchased_analyses: [],
        live_membership_until: until,
      })
      if (error) throw error
    }
    const token = encodeURIComponent(link.properties.hashed_token)
    return res.redirect(303, `/workshop-login#token_hash=${token}`)
  } catch (error) {
    console.error('MAYA workshop SSO:', error.message)
    return res.redirect(303, '/login?workshop=error')
  }
})

export default router
