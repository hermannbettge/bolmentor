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
    const updateData = {
      membership_active: true,
      membership_start: new Date().toISOString(),
      subscription_plan: mapping.plan,
      updated_at: new Date().toISOString(),
    }
    // Annual plan includes all analyses
    if (mapping.plan === 'annual') {
      updateData.purchased_analyses = ['business', 'health', 'family', 'selfexpression', 'finance', 'career', 'lifephases', 'partnership', 'relationship', 'events']
    }
    await supabase.from('profiles').update(updateData).eq('id', userId)
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

async function revokeAnalysis(userId, priceId) {
  const mapping = PRICE_MAP[priceId]
  if (!mapping || mapping.type !== 'analysis') return
  const { data: profile } = await supabase
    .from('profiles').select('purchased_analyses').eq('id', userId).single()
  const current = profile?.purchased_analyses || []
  await supabase.from('profiles').update({
    purchased_analyses: current.filter(k => k !== mapping.key),
    updated_at: new Date().toISOString(),
  }).eq('id', userId)
}

router.post('/', async (req, res) => {
  const sig = req.headers['stripe-signature']
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

  let event
  try {
    // Parse raw body first to detect event format
    const rawBody = Buffer.isBuffer(req.body) ? req.body.toString('utf8') : req.body
    let parsed
    try {
      parsed = typeof rawBody === 'string' ? JSON.parse(rawBody) : rawBody
    } catch {
      return res.status(400).json({ error: 'Ungültiger JSON-Body' })
    }

    if (parsed?.object === 'v2.core.event') {
      // Thin (v2) event format - fetch the full related object via Stripe API
      if (!parsed?.related_object?.id || !parsed?.type) {
        return res.status(400).json({ error: 'Unbekanntes Thin-Event-Format' })
      }

      const eventType = parsed.type.replace(/^v1\./, '')
      const relatedId = parsed.related_object.id
      const relatedType = parsed.related_object.type

      let fullObject = {}
      try {
        if (relatedType === 'checkout.session') {
          fullObject = await stripe.checkout.sessions.retrieve(relatedId, { expand: ['line_items'] })
        } else if (relatedType === 'invoice') {
          fullObject = await stripe.invoices.retrieve(relatedId, { expand: ['lines'] })
        } else if (relatedType === 'subscription') {
          fullObject = await stripe.subscriptions.retrieve(relatedId)
        }
      } catch (fetchErr) {
        console.error('Stripe: Fehler beim Abrufen des Objekts:', fetchErr.message)
      }

      event = { type: eventType, data: { object: fullObject } }
    } else {
      // Classic snapshot format - verify signature
      try {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret)
      } catch (err) {
        console.error('Stripe Webhook Signatur-Fehler:', err.message)
        return res.status(400).json({ error: `Webhook-Fehler: ${err.message}` })
      }
    }
  } catch (err) {
    console.error('Stripe Webhook Fehler:', err.message)
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

        // Fulfill immediately for payment mode; for subscription mode also fulfill
        // directly so the user sees the result without waiting for subscription events
        if (session.mode === 'payment') {
          await fulfillOrder(userId, priceId)
        } else if (session.mode === 'subscription' && userId) {
          const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
          const fullSession = await stripe.checkout.sessions.retrieve(session.id, { expand: ['line_items'] })
          const itemPriceId = fullSession.line_items?.data?.[0]?.price?.id
          if (itemPriceId) await fulfillOrder(userId, itemPriceId)

          // If this was an annual upgrade, cancel the old monthly membership + analysis subs
          if (session.metadata?.upgrade_from_monthly === 'true' && customerId) {
            const allSubs = await stripe.subscriptions.list({ customer: customerId, status: 'active', limit: 20 })
            const newSubId = fullSession.subscription
            for (const sub of allSubs.data) {
              if (sub.id === newSubId) continue
              const pid = sub.items?.data?.[0]?.price?.id
              const m = PRICE_MAP[pid]
              if (m?.type === 'membership' || m?.type === 'analysis') {
                await stripe.subscriptions.cancel(sub.id, { prorate: true })
              }
            }
          }
        }
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object
        const customerId = subscription.customer
        const items = subscription.items?.data || []

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
          for (const item of items) {
            await fulfillOrder(profile.id, item.price?.id)
          }
          // If upgraded to annual, cancel any remaining analysis subscriptions (included in annual)
          const isNowAnnual = items.some(item => {
            const m = PRICE_MAP[item.price?.id]
            return m?.type === 'membership' && m?.plan === 'annual'
          })
          if (isNowAnnual) {
            const stripe = new (await import('stripe')).default(process.env.STRIPE_SECRET_KEY)
            const allSubs = await stripe.subscriptions.list({ customer: customerId, status: 'active', limit: 20 })
            for (const sub of allSubs.data) {
              if (sub.id === subscription.id) continue
              const pid = sub.items?.data?.[0]?.price?.id
              if (PRICE_MAP[pid]?.type === 'analysis') {
                await stripe.subscriptions.cancel(sub.id, { prorate: true })
              }
            }
          }
        } else if (subscription.status === 'canceled' || subscription.status === 'unpaid') {
          const mapping = PRICE_MAP[items[0]?.price?.id]
          if (mapping?.type === 'membership') {
            await supabase.from('profiles').update({
              membership_active: false,
              subscription_plan: null,
              updated_at: new Date().toISOString(),
            }).eq('id', profile.id)
          } else if (mapping?.type === 'analysis') {
            await revokeAnalysis(profile.id, items[0]?.price?.id)
          }
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object
        const customerId = subscription.customer
        const items = subscription.items?.data || []

        const { data: profile } = await supabase
          .from('profiles')
          .select('id, purchased_analyses')
          .eq('stripe_customer_id', customerId)
          .single()

        if (!profile) break

        const mapping = PRICE_MAP[items[0]?.price?.id]
        if (mapping?.type === 'membership') {
          await supabase.from('profiles').update({
            membership_active: false,
            subscription_plan: null,
            updated_at: new Date().toISOString(),
          }).eq('id', profile.id)
        } else if (mapping?.type === 'analysis') {
          await revokeAnalysis(profile.id, items[0]?.price?.id)
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object
        const customerId = invoice.customer
        const { data: profile } = await supabase
          .from('profiles').select('id').eq('stripe_customer_id', customerId).single()
        if (profile) {
          // Only deactivate membership for membership subscription failures, not analysis ones
          const failedPriceId = invoice.lines?.data?.[0]?.price?.id
          const failedMapping = PRICE_MAP[failedPriceId]
          if (!failedMapping || failedMapping.type === 'membership') {
            await supabase.from('profiles').update({
              membership_active: false,
              updated_at: new Date().toISOString(),
            }).eq('id', profile.id)
          }
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
