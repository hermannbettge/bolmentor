import { createClient } from '@supabase/supabase-js'
import ws from 'ws'

const options = {
  realtime: { transport: ws },
}

export const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  options
)
