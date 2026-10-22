import { Router } from 'express'
import { supabase } from '../lib/supabase.js'

const router = Router()


async function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ error: 'Nicht angemeldet' })
  const token = authHeader.split(' ')[1]
  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) return res.status(401).json({ error: 'Ungültige Sitzung' })

  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
  if (!profile?.is_admin) return res.status(403).json({ error: 'Kein Admin-Zugang' })

  req.user = user
  next()
}

// Alle User auflisten
router.get('/users', requireAdmin, async (req, res) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, birth_date, membership_active, membership_start, membership_end, purchased_analyses, is_admin, created_at')
    .order('created_at', { ascending: false })
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

// Membership eines Users aktivieren/deaktivieren
router.patch('/users/:id/membership', requireAdmin, async (req, res) => {
  const { active, months } = req.body
  const now = new Date()
  const end = new Date(now)
  if (months) end.setMonth(end.getMonth() + months)

  const updates = {
    membership_active: active,
    membership_start: active ? now.toISOString() : null,
    membership_end: active && months ? end.toISOString() : null,
    updated_at: now.toISOString(),
  }

  const { data, error } = await supabase.from('profiles').update(updates).eq('id', req.params.id).select().single()
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

// Zusatzanalyse freischalten
router.patch('/users/:id/analyses', requireAdmin, async (req, res) => {
  const { type, grant } = req.body
  const { data: profile } = await supabase.from('profiles').select('purchased_analyses').eq('id', req.params.id).single()
  let list = profile?.purchased_analyses || []

  if (grant && !list.includes(type)) list = [...list, type]
  if (!grant) list = list.filter(t => t !== type)

  const { data, error } = await supabase.from('profiles').update({ purchased_analyses: list, updated_at: new Date().toISOString() }).eq('id', req.params.id).select().single()
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

// Admin-Flag setzen
router.patch('/users/:id/admin', requireAdmin, async (req, res) => {
  const { is_admin } = req.body
  const { data, error } = await supabase.from('profiles').update({ is_admin, updated_at: new Date().toISOString() }).eq('id', req.params.id).select().single()
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

// Max Events Override
router.patch('/users/:id/max-events', requireAdmin, async (req, res) => {
  const { max_events_override } = req.body
  const { data, error } = await supabase.from('profiles').update({ max_events_override, updated_at: new Date().toISOString() }).eq('id', req.params.id).select().single()
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

// E-Mail ändern
router.patch('/users/:id/email', requireAdmin, async (req, res) => {
  const { email } = req.body
  if (!email) return res.status(400).json({ error: 'E-Mail fehlt' })
  const { data, error } = await supabase.auth.admin.updateUserById(req.params.id, { email })
  if (error) return res.status(500).json({ error: error.message })
  res.json({ success: true })
})

// Passwort-Reset
router.post('/users/:id/reset-password', requireAdmin, async (req, res) => {
  const { data: profile } = await supabase.from('profiles').select('id').eq('id', req.params.id).single()
  if (!profile) return res.status(404).json({ error: 'Nutzer nicht gefunden' })
  const { data: authUser } = await supabase.auth.admin.getUserById(req.params.id)
  if (!authUser?.user?.email) return res.status(404).json({ error: 'E-Mail nicht gefunden' })
  const { error } = await supabase.auth.resetPasswordForEmail(authUser.user.email)
  if (error) return res.status(500).json({ error: error.message })
  res.json({ success: true })
})

// User löschen
router.delete('/users/:id', requireAdmin, async (req, res) => {
  const { error } = await supabase.auth.admin.deleteUser(req.params.id)
  if (error) return res.status(500).json({ error: error.message })
  res.json({ success: true })
})

// Analyses eines Users
router.get('/users/:id/analyses', requireAdmin, async (req, res) => {
  const { data, error } = await supabase
    .from('analyses')
    .select('id, type, analysis_date, month_year, created_at')
    .eq('user_id', req.params.id)
    .order('created_at', { ascending: false })
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

export default router
