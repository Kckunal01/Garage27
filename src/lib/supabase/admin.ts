import 'server-only'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { publicEnv } from '@/lib/env'

let admin: SupabaseClient | null = null

/**
 * Service-role client. SERVER ONLY — the `server-only` import makes any
 * accidental client-bundle import a build error.
 */
export function getAdminSupabase(): SupabaseClient | null {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!publicEnv.supabaseUrl || !key) return null
  admin ??= createClient(publicEnv.supabaseUrl, key, { auth: { persistSession: false } })
  return admin
}
