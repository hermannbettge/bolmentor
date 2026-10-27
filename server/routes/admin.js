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

// Alle aktiven User auflisten (ohne soft-deleted)
router.get('/users', requireAdmin, async (req, res) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, birth_date, membership_active, membership_start, membership_end, purchased_analyses, is_admin, created_at, max_events_override, chat_messages_limit, subscription_plan')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

// Papierkorb: soft-deleted User auflisten
router.get('/users/trash', requireAdmin, async (req, res) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, birth_date, membership_active, membership_start, created_at, deleted_at, deleted_snapshot')
    .not('deleted_at', 'is', null)
    .order('deleted_at', { ascending: false })
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

// Tarif eines Users setzen (monthly / annual)
router.patch('/users/:id/plan', requireAdmin, async (req, res) => {
  const { plan } = req.body // 'monthly' | 'annual'
  if (!['monthly', 'annual'].includes(plan)) return res.status(400).json({ error: 'Ungültiger Tarif' })
  const { data, error } = await supabase.from('profiles').update({
    subscription_plan: plan,
    updated_at: new Date().toISOString(),
  }).eq('id', req.params.id).select().single()
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

// Chat-Nachrichten-Limit
router.patch('/users/:id/chat-limit', requireAdmin, async (req, res) => {
  const { chat_messages_limit } = req.body
  const { data, error } = await supabase.from('profiles').update({ chat_messages_limit, updated_at: new Date().toISOString() }).eq('id', req.params.id).select().single()
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

// Soft-Delete: User in Papierkorb verschieben (Zugang sperren, Daten behalten)
router.delete('/users/:id', requireAdmin, async (req, res) => {
  const id = req.params.id
  try {
    // Load current profile as snapshot
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', id).single()
    if (!profile) return res.status(404).json({ error: 'Nutzer nicht gefunden' })

    // Ban the auth user so they cannot log in
    const { error: banError } = await supabase.auth.admin.updateUserById(id, { ban_duration: '876600h' })
    if (banError) return res.status(500).json({ error: banError.message || JSON.stringify(banError) })

    // Mark as soft-deleted in profile
    const { error: updateError } = await supabase.from('profiles').update({
      deleted_at: new Date().toISOString(),
      deleted_snapshot: profile,
      membership_active: false,
      updated_at: new Date().toISOString(),
    }).eq('id', id)
    if (updateError) return res.status(500).json({ error: updateError.message })

    res.json({ success: true })
  } catch (e) {
    res.status(500).json({ error: e.message || 'Unbekannter Fehler beim Löschen' })
  }
})

// Restore: User aus Papierkorb wiederherstellen
router.post('/users/:id/restore', requireAdmin, async (req, res) => {
  const id = req.params.id
  try {
    const { data: profile } = await supabase.from('profiles').select('deleted_snapshot').eq('id', id).single()
    if (!profile?.deleted_snapshot) return res.status(404).json({ error: 'Kein Snapshot gefunden' })

    const snap = profile.deleted_snapshot

    // Unban the auth user
    const { error: unbanError } = await supabase.auth.admin.updateUserById(id, { ban_duration: 'none' })
    if (unbanError) return res.status(500).json({ error: unbanError.message || JSON.stringify(unbanError) })

    // Restore profile from snapshot
    const { error: restoreError } = await supabase.from('profiles').update({
      deleted_at: null,
      deleted_snapshot: null,
      membership_active: snap.membership_active ?? false,
      membership_start: snap.membership_start ?? null,
      subscription_plan: snap.subscription_plan ?? null,
      purchased_analyses: snap.purchased_analyses ?? [],
      updated_at: new Date().toISOString(),
    }).eq('id', id)
    if (restoreError) return res.status(500).json({ error: restoreError.message })

    res.json({ success: true })
  } catch (e) {
    res.status(500).json({ error: e.message || 'Unbekannter Fehler beim Wiederherstellen' })
  }
})

// Permanent-Delete: endgültig löschen (nur aus Papierkorb heraus)
router.delete('/users/:id/permanent', requireAdmin, async (req, res) => {
  const id = req.params.id
  try {
    await supabase.from('analyses').delete().eq('user_id', id)
    await supabase.from('maya_chats').delete().eq('user_id', id)
    await supabase.from('events').delete().eq('user_id', id)
    await supabase.from('profiles').delete().eq('id', id)

    const { error } = await supabase.auth.admin.deleteUser(id)
    if (error) return res.status(500).json({ error: error.message || JSON.stringify(error) })
    res.json({ success: true })
  } catch (e) {
    res.status(500).json({ error: e.message || 'Unbekannter Fehler beim endgültigen Löschen' })
  }
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

// Backup: alle Daten exportieren
router.get('/backup', requireAdmin, async (req, res) => {
  try {
    const [profilesRes, eventsRes, analysesRes, chatsRes] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: true }),
      supabase.from('events').select('*').order('created_at', { ascending: true }),
      supabase.from('analyses').select('*').order('created_at', { ascending: true }),
      supabase.from('maya_chats').select('*').order('created_at', { ascending: true }),
    ])

    if (profilesRes.error) return res.status(500).json({ error: profilesRes.error.message })

    const now = new Date()
    const pad = n => String(n).padStart(2, '0')
    const datePart = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
    const timePart = `${pad(now.getHours())}-${pad(now.getMinutes())}`

    const backup = {
      schema_version: 2,
      created_at: now.toISOString(),
      tables: {
        profiles: profilesRes.data || [],
        events: eventsRes.data || [],
        analyses: analysesRes.data || [],
        maya_chats: chatsRes.data || [],
      },
      stats: {
        profiles: (profilesRes.data || []).length,
        events: (eventsRes.data || []).length,
        analyses: (analysesRes.data || []).length,
        maya_chats: (chatsRes.data || []).length,
      },
    }

    const filename = `backup_v${backup.schema_version}_${datePart}_${timePart}.json`
    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    res.json(backup)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// Restore: Backup-Datei hochladen und einspielen (nur profiles)
router.post('/restore', requireAdmin, async (req, res) => {
  try {
    const { backup, confirm } = req.body
    if (!backup?.tables?.profiles) return res.status(400).json({ error: 'Ungültiges Backup-Format' })
    if (!confirm) return res.status(400).json({ error: 'Bestätigung fehlt' })

    const profiles = backup.tables.profiles
    if (!Array.isArray(profiles) || profiles.length === 0) {
      return res.status(400).json({ error: 'Keine Profile im Backup gefunden' })
    }

    const results = { restored: 0, errors: [] }
    for (const profile of profiles) {
      const { error } = await supabase.from('profiles').upsert(profile, { onConflict: 'id' })
      if (error) {
        results.errors.push({ id: profile.id, error: error.message })
      } else {
        results.restored++
      }
    }

    res.json(results)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

export default router
