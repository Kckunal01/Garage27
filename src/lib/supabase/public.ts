import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { isSupabaseConfigured, publicEnv } from '@/lib/env'

let client: SupabaseClient | null = null

/** Anon client — catalogue reads only. RLS limits it to published rows. */
export function getPublicSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null
  client ??= createClient(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey, {
    auth: { persistSession: false },
  })
  return client
}
