/** Public, browser-safe configuration. */
export const publicEnv = {
  siteUrl: (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, ''),
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  analyticsAdapters: (process.env.NEXT_PUBLIC_ANALYTICS_ADAPTERS || 'datalayer')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
}

export const isSupabaseConfigured = () => !!(publicEnv.supabaseUrl && publicEnv.supabaseAnonKey)
