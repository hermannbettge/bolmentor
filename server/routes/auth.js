import { Router } from 'express'
import { supabase } from '../lib/supabase.js'

const router = Router()


router.post('/register', async (req, res) => {
  const { email, password, name, birthDate } = req.body
  if (!email || !password || !name || !birthDate) {
    return res.status(400).json({ error: 'Alle Felder sind erforderlich.' })
  }

  // Nutzer anlegen (service key = kein E-Mail-Bestätigungszwang)
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // direkt bestätigt, kein E-Mail nötig
  })
  if (authError) {
    if (authError.message?.includes('already registered') || authError.message?.includes('already been registered')) {
      return res.status(400).json({ error: 'Diese E-Mail-Adresse ist bereits registriert.' })
    }
    return res.status(400).json({ error: authError.message })
  }

  // Profil anlegen mit Service Key (bypasses RLS)
  const { error: profileError } = await supabase.from('profiles').insert({
    id: authData.user.id,
    name,
    birth_date: birthDate,
    membership_active: false,
    purchased_analyses: [],
  })
  if (profileError) {
    // User wieder löschen wenn Profil fehlschlägt
    await supabase.auth.admin.deleteUser(authData.user.id)
    return res.status(500).json({ error: 'Profil konnte nicht erstellt werden.' })
  }

  res.json({ success: true })
})

export default router
