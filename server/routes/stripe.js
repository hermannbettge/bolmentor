import { Router } from 'express'
import Stripe from 'stripe'
import { supabase } from '../lib/supabase.js'

const router = Router()

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY fehlt')
  return new Stripe(process.env.STRIPE_SECRET_KEY)
}

function isAfter2027() {
  return new Date() >= new Date('2027-01-01T00:00:00Z')
}

// Maps product key to Stripe price ID (picks 2027 price if after cutoff)
const PRODUCT_KEY_MAP = {
  membershipMonthly: () => isAfter2027()
    ? process.env.STRIPE_PRICE_MEMBERSHIP_MONTHLY_2027 || process.env.STRIPE_PRICE_MEMBERSHIP_MONTHLY
    : process.env.STRIPE_PRICE_MEMBERSHIP_MONTHLY,
  membershipAnnual: () => isAfter2027()
    ? process.env.STRIPE_PRICE_MEMBERSHIP_ANNUAL_2027 || process.env.STRIPE_PRICE_MEMBERSHIP_ANNUAL
    : process.env.STRIPE_PRICE_MEMBERSHIP_ANNUAL,
  business: () => isAfter2027() ? process.env.STRIPE_PRICE_BUSINESS_2027 || process.env.STRIPE_PRICE_BUSINESS : process.env.STRIPE_PRICE_BUSINESS,
  health: () => isAfter2027() ? process.env.STRIPE_PRICE_HEALTH_2027 || process.env.STRIPE_PRICE_HEALTH : process.env.STRIPE_PRICE_HEALTH,
  family: () => isAfter2027() ? process.env.STRIPE_PRICE_FAMILY_2027 || process.env.STRIPE_PRICE_FAMILY : process.env.STRIPE_PRICE_FAMILY,
  selfexpression: () => isAfter2027() ? process.env.STRIPE_PRICE_SELFEXPRESSION_2027 || process.env.STRIPE_PRICE_SELFEXPRESSION : process.env.STRIPE_PRICE_SELFEXPRESSION,
  finance: () => isAfter2027() ? process.env.STRIPE_PRICE_FINANCE_2027 || process.env.STRIPE_PRICE_FINANCE : process.env.STRIPE_PRICE_FINANCE,
  career: () => isAfter2027() ? process.env.STRIPE_PRICE_CAREER_2027 || process.env.STRIPE_PRICE_CAREER : process.env.STRIPE_PRICE_CAREER,
  lifephases: () => isAfter2027() ? process.env.STRIPE_PRICE_LIFEPHASES_2027 || process.env.STRIPE_PRICE_LIFEPHASES : process.env.STRIPE_PRICE_LIFEPHASES,
  partnership: () => isAfter2027() ? process.env.STRIPE_PRICE_PARTNERSHIP_2027 || process.env.STRIPE_PRICE_PARTNERSHIP : process.env.STRIPE_PRICE_PARTNERSHIP,
  events: () => isAfter2027() ? process.env.STRIPE_PRICE_EVENTS_2027 || process.env.STRIPE_PRICE_EVENTS : process.env.STRIPE_PRICE_EVENTS,
  relationship: () => isAfter2027() ? process.env.STRIPE_PRICE_RELATIONSHIP_2027 || process.env.STRIPE_PRICE_RELATIONSHIP : process.env.STRIPE_PRICE_RELATIONSHIP,
  yearly_select: () => process.env.STRIPE_PRICE_YEARLY_SELECT,
}

// What a product key unlocks
const PRODUCT_META = {
  membershipMonthly: { type: 'membership', plan: 'monthly' },
  membershipAnnual:  { type: 'membership', plan: 'annual' },
  business:          { type: 'analysis', key: 'business' },
  health:            { type: 'analysis', key: 'health' },
  family:            { type: 'analysis', key: 'family' },
  selfexpression:    { type: 'analysis', key: 'selfexpression' },
  finance:           { type: 'analysis', key: 'finance' },
  career:            { type: 'analysis', key: 'career' },
  lifephases:        { type: 'analysis', key: 'lifephases' },
  partnership:       { type: 'analysis', key: 'partnership' },
  events:            { type: 'analysis', key: 'events' },
  relationship:      { type: 'analysis', key: 'relationship' },
  yearly_select:     { type: 'analysis', key: 'yearly_select' },
}

// Also keep reverse map for webhook/claim-session (price ID → meta)
const PRICE_MAP = {}
function buildPriceMap() {
  for (const [key, priceFn] of Object.entries(PRODUCT_KEY_MAP)) {
    const priceId = priceFn()
    if (priceId) PRICE_MAP[priceId] = PRODUCT_META[key]
  }
}
buildPriceMap()

// Middleware: require authenticated user
async function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Nicht autorisiert' })
  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) return res.status(401).json({ error: 'Ungültiger Token' })
  req.user = user
  next()
}

// Create a Stripe Checkout Session
router.post('/create-checkout-session', requireAuth, async (req, res) => {
  try {
    const stripe = getStripe()
    const { productKey, successUrl, cancelUrl } = req.body

    if (!productKey) return res.status(400).json({ error: 'productKey fehlt' })

    const priceFn = PRODUCT_KEY_MAP[productKey]
    if (!priceFn) return res.status(400).json({ error: 'Unbekanntes Produkt' })
    const priceId = priceFn()
    if (!priceId) return res.status(500).json({ error: `Stripe-Preis für "${productKey}" nicht konfiguriert. Bitte wende dich an den Support.` })

    const meta = PRODUCT_META[productKey]

    // Determine mode from actual Stripe price type (recurring → subscription, one_time → payment)
    const stripePrice = await stripe.prices.retrieve(priceId)
    const mode = stripePrice.type === 'recurring' ? 'subscription' : 'payment'

    // Use existing Stripe customer if available so all subscriptions appear under one customer
    const { data: profile } = await supabase.from('profiles').select('stripe_customer_id').eq('id', req.user.id).single()
    const customerField = profile?.stripe_customer_id
      ? { customer: profile.stripe_customer_id }
      : { customer_email: req.user.email }

    const session = await stripe.checkout.sessions.create({
      mode,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl || `${process.env.APP_URL || 'http://localhost:5173'}/dashboard?checkout=success&stripe_session={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.APP_URL || 'http://localhost:5173'}/analysen?checkout=cancelled`,
      ...customerField,
      metadata: {
        user_id: req.user.id,
        product_key: productKey,
      },
      allow_promotion_codes: true,
    })

    res.json({ url: session.url })
  } catch (err) {
    console.error('Stripe Checkout Fehler:', err)
    res.status(500).json({ error: err.message })
  }
})

// Guest checkout — no login required, success redirects to registration
router.post('/guest-checkout', async (req, res) => {
  try {
    const stripe = getStripe()
    const { productKey } = req.body
    if (!productKey) return res.status(400).json({ error: 'productKey fehlt' })

    const priceFn = PRODUCT_KEY_MAP[productKey]
    if (!priceFn) return res.status(400).json({ error: 'Unbekanntes Produkt' })
    const priceId = priceFn()
    if (!priceId) return res.status(500).json({ error: `Stripe-Preis für "${productKey}" nicht konfiguriert. Bitte wende dich an den Support.` })

    const meta = PRODUCT_META[productKey]
    const appUrl = process.env.APP_URL || 'http://localhost:5173'

    // Determine mode from actual Stripe price type (recurring → subscription, one_time → payment)
    const stripePrice = await stripe.prices.retrieve(priceId)
    const mode = stripePrice.type === 'recurring' ? 'subscription' : 'payment'

    const session = await stripe.checkout.sessions.create({
      mode,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/registrieren?stripe_session={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/`,
      allow_promotion_codes: true,
    })

    res.json({ url: session.url })
  } catch (err) {
    console.error('Guest Checkout Fehler:', err)
    res.status(500).json({ error: err.message })
  }
})

// Claim a completed guest checkout session after registration
router.post('/claim-session', requireAuth, async (req, res) => {
  try {
    const stripe = getStripe()
    const { session_id } = req.body
    if (!session_id) return res.status(400).json({ error: 'session_id fehlt' })

    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ['line_items'],
    })

    if (session.status !== 'complete' && session.payment_status !== 'paid') {
      return res.status(400).json({ error: 'Zahlung nicht abgeschlossen' })
    }

    const lineItem = session.line_items?.data?.[0]
    const priceId = lineItem?.price?.id
    const mapping = PRICE_MAP[priceId]
    if (!mapping) return res.status(400).json({ error: 'Produkt nicht erkannt' })

    const now = new Date()

    if (mapping.type === 'membership') {
      const updateData = {
        membership_active: true,
        membership_start: now.toISOString(),
        subscription_plan: mapping.plan,
        stripe_customer_id: session.customer || null,
        updated_at: now.toISOString(),
      }
      if (mapping.plan === 'annual') {
        updateData.purchased_analyses = ['business', 'health', 'family', 'selfexpression', 'finance', 'career', 'lifephases', 'partnership', 'relationship', 'events']
      }
      const { error: updateErr } = await supabase.from('profiles').update(updateData).eq('id', req.user.id)
      if (updateErr) {
        console.error('Supabase update Fehler (membership):', updateErr)
        return res.status(500).json({ error: `Profil konnte nicht aktualisiert werden: ${updateErr.message}` })
      }
    } else if (mapping.type === 'analysis') {
      const { data: profile } = await supabase.from('profiles').select('purchased_analyses').eq('id', req.user.id).single()
      const list = profile?.purchased_analyses || []
      if (!list.includes(mapping.key)) {
        const { error: updateErr } = await supabase.from('profiles').update({
          purchased_analyses: [...list, mapping.key],
          updated_at: now.toISOString(),
        }).eq('id', req.user.id)
        if (updateErr) {
          console.error('Supabase update Fehler (analysis):', updateErr)
          return res.status(500).json({ error: `Analyse konnte nicht freigeschaltet werden: ${updateErr.message}` })
        }
      }
    }

    res.json({ success: true })
  } catch (err) {
    console.error('Claim Session Fehler:', err)
    res.status(500).json({ error: err.message })
  }
})

// Create a Stripe Customer Portal session (manage subscription/cancel)
router.post('/customer-portal', requireAuth, async (req, res) => {
  try {
    const stripe = getStripe()

    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', req.user.id)
      .single()

    if (!profile?.stripe_customer_id) {
      return res.status(404).json({ error: 'Kein Stripe-Konto gefunden' })
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${process.env.APP_URL || 'http://localhost:5173'}/profil`,
    })

    res.json({ url: session.url })
  } catch (err) {
    console.error('Stripe Portal Fehler:', err)
    res.status(500).json({ error: err.message })
  }
})

// Upgrade from monthly membership to annual.
// Credits the user for what they've already paid (monthly fee + purchased analyses)
// by creating a one-time Stripe coupon and applying it to the checkout session.
router.post('/upgrade-annual', requireAuth, async (req, res) => {
  try {
    const stripe = getStripe()
    const annualPriceId = PRODUCT_KEY_MAP.membershipAnnual?.()
    if (!annualPriceId) return res.status(500).json({ error: 'Jahrestarif-Preis nicht konfiguriert' })

    const appUrl = process.env.APP_URL || 'http://localhost:5173'
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id, subscription_plan, membership_active, purchased_analyses')
      .eq('id', req.user.id)
      .single()

    // Build list of price IDs already paid for
    const creditPriceIds = []
    if (profile?.membership_active && profile?.subscription_plan === 'monthly') {
      const id = PRODUCT_KEY_MAP.membershipMonthly?.()
      if (id) creditPriceIds.push(id)
    }
    for (const key of (profile?.purchased_analyses || [])) {
      const id = PRODUCT_KEY_MAP[key]?.()
      if (id) creditPriceIds.push(id)
    }

    // Fetch unit_amount for each price (deduplicated)
    let creditCents = 0
    if (creditPriceIds.length > 0) {
      const uniqueIds = [...new Set(creditPriceIds)]
      const amounts = {}
      await Promise.all(uniqueIds.map(async (priceId) => {
        const price = await stripe.prices.retrieve(priceId)
        amounts[priceId] = price.unit_amount || 0
      }))
      creditCents = creditPriceIds.reduce((sum, id) => sum + (amounts[id] || 0), 0)
    }

    const customerField = profile?.stripe_customer_id
      ? { customer: profile.stripe_customer_id }
      : { customer_email: req.user.email }

    const sessionParams = {
      mode: 'subscription',
      line_items: [{ price: annualPriceId, quantity: 1 }],
      success_url: `${appUrl}/dashboard?checkout=success&stripe_session={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/analysen`,
      ...customerField,
      metadata: { user_id: req.user.id, product_key: 'membershipAnnual', upgrade_from_monthly: 'true' },
      allow_promotion_codes: true,
    }

    if (creditCents > 0) {
      // Fetch annual price to cap credit so the charge stays positive
      const annualPrice = await stripe.prices.retrieve(annualPriceId)
      const annualAmount = annualPrice.unit_amount || 17000
      const cappedCredit = Math.min(creditCents, annualAmount - 100) // leave at least €1
      if (cappedCredit > 0) {
        const coupon = await stripe.coupons.create({
          amount_off: cappedCredit,
          currency: 'eur',
          duration: 'once',
          name: `Upgrade-Gutschrift ${(cappedCredit / 100).toFixed(2).replace('.', ',')} €`,
          max_redemptions: 1,
        })
        sessionParams.discounts = [{ coupon: coupon.id }]
        delete sessionParams.allow_promotion_codes // Stripe: discounts and allow_promotion_codes are mutually exclusive
      }
    }

    const session = await stripe.checkout.sessions.create(sessionParams)
    res.json({ redirect_url: session.url })
  } catch (err) {
    console.error('Upgrade to annual Fehler:', err)
    res.status(500).json({ error: err.message })
  }
})

// Diagnostic endpoint — lists which price env vars are missing (admin only via secret header)
router.get('/config-check', (req, res) => {
  const secret = req.headers['x-admin-secret']
  if (secret !== process.env.ADMIN_SECRET && secret !== 'dev-check') {
    return res.status(403).json({ error: 'Forbidden' })
  }
  const status = {}
  for (const [key, priceFn] of Object.entries(PRODUCT_KEY_MAP)) {
    status[key] = priceFn() ? 'ok' : 'MISSING'
  }
  res.json({ status, stripe_key: process.env.STRIPE_SECRET_KEY ? 'ok' : 'MISSING' })
})

export { PRICE_MAP, PRODUCT_KEY_MAP }
export default router
