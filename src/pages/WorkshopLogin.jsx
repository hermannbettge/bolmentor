import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'

export default function WorkshopLogin() {
  const navigate = useNavigate()
  const [error, setError] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.slice(1))
    const token = params.get('token_hash')
    window.history.replaceState({}, '', '/workshop-login')
    if (!token) { setError('Der Anmeldelink fehlt oder ist abgelaufen.'); return }
    let cancelled = false
    supabase.auth.verifyOtp({ token_hash: token, type: 'email' }).then(({ error: authError }) => {
      if (cancelled) return
      if (authError) setError('Die Anmeldung ist abgelaufen. Öffne MAYA erneut über dein Workshop-Profil.')
      else navigate('/dashboard', { replace: true })
    }).catch(() => {
      if (!cancelled) setError('Die Anmeldung ist gerade nicht möglich. Bitte versuche es erneut.')
    })
    return () => { cancelled = true }
  }, [navigate])

  return <main style={{ minHeight: '60vh', padding: '4rem 1.5rem', textAlign: 'center' }}>
    <h1>MAYA Anmeldung</h1>
    {error ? <><p>{error}</p><a href="https://hermannbettge.de/login/?view=maya">Zurück zum Workshop-Profil</a></> :
      <p>Dein Zugang wird geöffnet …</p>}
  </main>
}
