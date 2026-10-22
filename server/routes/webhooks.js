import { Router } from 'express'
import crypto from 'crypto'
import { supabase } from '../lib/supabase.js'

const router = Router()


const PRODUCT_MAP = {
  membership: { type: 'membership' },
  business: { type: 'analysis', key: 'business' },
  health: { type: 'analysis', key: 'health' },
  family: { type: 'analysis', key: 'family' },
  selfexpression: { type: 'analysis', key: 'selfexpression' },
  finance: { type: 'analysis', key: 'finance' },
  career: { type: 'analysis', key: 'career' },
  lifephases: { type: 'analysis', key: 'lifephases' },
  partnership: { type: 'analysis', key: 'partnership' },
}

function verifySignature(payload, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret)
  hmac.update(payload)
  const digest = hmac.digest('hex')
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature))
}

router.post('/thrivecart', async (req, res) => {
  try {
    const secret = process.env.THRIVECART_WEBHOOK_SECRET
    const signature = req.headers['x-thrivecart-signature'] || ''

    if (secret && signature) {
      const payload = req.body
      const isValid = verifySignature(payload, signature, secret)
      if (!isValid) {
        return res.status(401).json({ error: 'Ungültige Signatur' })
      }
    }

    const body = JSON.parse(req.body.toString())
    const { customer, product_id, event } = body

    // Support lookup via product tags array or direct product_id string
    const tags = body.product?.tags || body.tags || []
    const lookupKey = tags.find(t => PRODUCT_MAP[t]) || product_id

    if (event !== 'order.success' && event !== 'subscription.new') {
      return res.json({ received: true })
    }

    // Find user by email
    const { data: users } = await supabase.auth.admin.listUsers()
    const user = users?.users?.find(u => u.email === customer?.email)

    if (!user) {
      console.warn('ThriveCart: Benutzer nicht gefunden für', customer?.email)
      return res.json({ received: true })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!profile) return res.json({ received: true })

    const mapping = PRODUCT_MAP[lookupKey]
    if (!mapping) {
      console.warn('ThriveCart: Unbekanntes Produkt', product_id)
      return res.json({ received: true })
    }

    if (mapping.type === 'membership') {
      await supabase.from('profiles').update({
        membership_active: true,
        membership_start: new Date().toISOString(),
        thrivecart_customer_id: customer?.id,
        updated_at: new Date().toISOString(),
      }).eq('id', user.id)
    } else if (mapping.type === 'analysis') {
      const current = profile.purchased_analyses || []
      if (!current.includes(mapping.key)) {
        await supabase.from('profiles').update({
          purchased_analyses: [...current, mapping.key],
          updated_at: new Date().toISOString(),
        }).eq('id', user.id)
      }
    }

    res.json({ received: true })
  } catch (err) {
    console.error('Webhook-Fehler:', err)
    res.status(500).json({ error: 'Interner Fehler' })
  }
})

export default router
