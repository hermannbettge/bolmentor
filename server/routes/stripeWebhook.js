import { Router } from 'express'
import Stripe from 'stripe'
import { supabase } from '../lib/supabase.js'
import { PRICE_MAP } from './stripe.js'

const router = Router()

async function fulfillOrder(userId, priceId) {
  const mapping = PRICE_MAP[priceId]
  if (!mapping) {
    console.warn('Stripe: unbekannte priceId', priceId)
    return
  }

  if (mapping.type === 'membership') {
    await supabase.from('profiles').update({
      membership_active: true,
      membership_start: new Date().toISOString(),
      subscription_plan: mapping.plan,
      updated_at: new Date().toISOString(),
    }).eq('id', userId)
  } else if (mapping.type === 'analysis') {
    const { data: profile } = await supabase
      .from('profiles').select('purchased_analyses').eq('id', userId).single()
    const current = profile?.purchased_analyses || []
    if (!current.includes(mapping.key)) {
      await supabase.from('profiles').update({
        purchased_analyses: [...current, mapping.key],
        updated_at: new Date().toISOString(),
      }).eq('id', userId)
    }
  }
}

router.post('/', async (req, res) => {
  const sig = req.headers['stripe-signature']
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  let event
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret)
  } catch (err) {
    console.error('Stripe Webhook Signatur-Fehler:', err.message)
    return res.status(400).json({ error: `Webhook-Fehler: ${err.message}` })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        const userId = session.metadata?.user_id
        const priceId = session.metadata?.price_id
        const customerId = session.customer

        if (!userId) {
          console.warn('Stripe: keine user_id in metadata')
          break
        }

        // Store stripe customer ID
        if (customerId) {
          await supabase.from('profiles').update({
            stripe_customer_id: customerId,
            updated_at: new Date().toISOString(),
          }).eq('id', userId)
        }

        // For one-time payments, fulfill immediately
        if (session.mode === 'payment') {
          await fulfillOrder(userId, priceId)
        }
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object
        const customerId = subscription.customer
        const priceId = subscription.items?.data?.[0]?.price?.id

        // Find user by stripe_customer_id
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (!profile) {
          console.warn('Stripe: kein Nutzer für customer', customerId)
          break
        }

        if (subscription.status === 'active' || subscription.status === 'trialing') {
          await fulfillOrder(profile.id, priceId)
        } else if (subscription.status === 'canceled' || subscription.status === 'unpaid') {
          await supabase.from('profiles').update({
            membership_active: false,
            subscription_plan: null,
            updated_at: new Date().toISOString(),
          }).eq('id', profile.id)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object
        const customerId = subscription.customer

        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (profile) {
          await supabase.from('profiles').update({
            membership_active: false,
            subscription_plan: null,
            updated_at: new Date().toISOString(),
          }).eq('id', profile.id)
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object
        const customerId = invoice.customer
        const { data: profile } = await supabase
          .from('profiles').select('id').eq('stripe_customer_id', customerId).single()
        if (profile) {
          await supabase.from('profiles').update({
            membership_active: false,
            updated_at: new Date().toISOString(),
          }).eq('id', profile.id)
        }
        break
      }
    }

    res.json({ received: true })
  } catch (err) {
    console.error('Stripe Webhook Verarbeitungs-Fehler:', err)
    res.status(500).json({ error: 'Interner Fehler' })
  }
})

export default router
