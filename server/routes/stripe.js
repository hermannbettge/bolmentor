import { Router } from 'express'
import Stripe from 'stripe'
import { supabase } from '../lib/supabase.js'

const router = Router()

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY fehlt')
  return new Stripe(process.env.STRIPE_SECRET_KEY)
}

// Maps Stripe price IDs to what they unlock
// Set these env vars with your actual Stripe price IDs
const PRICE_MAP = {
  [process.env.STRIPE_PRICE_MEMBERSHIP_MONTHLY]: { type: 'membership', plan: 'monthly' },
  [process.env.STRIPE_PRICE_MEMBERSHIP_ANNUAL]:  { type: 'membership', plan: 'annual' },
  [process.env.STRIPE_PRICE_BUSINESS]:           { type: 'analysis', key: 'business' },
  [process.env.STRIPE_PRICE_HEALTH]:             { type: 'analysis', key: 'health' },
  [process.env.STRIPE_PRICE_FAMILY]:             { type: 'analysis', key: 'family' },
  [process.env.STRIPE_PRICE_SELFEXPRESSION]:     { type: 'analysis', key: 'selfexpression' },
  [process.env.STRIPE_PRICE_FINANCE]:            { type: 'analysis', key: 'finance' },
  [process.env.STRIPE_PRICE_CAREER]:             { type: 'analysis', key: 'career' },
  [process.env.STRIPE_PRICE_LIFEPHASES]:         { type: 'analysis', key: 'lifephases' },
  [process.env.STRIPE_PRICE_PARTNERSHIP]:        { type: 'analysis', key: 'partnership' },
}

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
    const { priceId, successUrl, cancelUrl } = req.body

    if (!priceId) return res.status(400).json({ error: 'priceId fehlt' })

    const mapping = PRICE_MAP[priceId]
    if (!mapping) return res.status(400).json({ error: 'Unbekanntes Produkt' })

    const isSubscription = mapping.plan === 'monthly'

    const session = await stripe.checkout.sessions.create({
      mode: isSubscription ? 'subscription' : 'payment',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl || `${process.env.APP_URL || 'http://localhost:5173'}/dashboard?checkout=success`,
      cancel_url: cancelUrl || `${process.env.APP_URL || 'http://localhost:5173'}/profil?checkout=cancelled`,
      customer_email: req.user.email,
      metadata: {
        user_id: req.user.id,
        price_id: priceId,
      },
      allow_promotion_codes: true,
    })

    res.json({ url: session.url })
  } catch (err) {
    console.error('Stripe Checkout Fehler:', err)
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

export { PRICE_MAP }
export default router
