import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// ─── Mock mode detection ──────────────────────────────────────────────────────
export const IS_MOCK_MODE =
  !supabaseUrl || supabaseUrl === 'your_supabase_project_url'

// ─── Supabase client ──────────────────────────────────────────────────────────
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

if (IS_MOCK_MODE) {
  console.info(
    '🎭 Running in MOCK mode — no Supabase credentials found.\n' +
    'Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.'
  )
}
