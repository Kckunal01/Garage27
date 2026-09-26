import 'server-only'
import { randomUUID } from 'node:crypto'
import { getAdminSupabase } from '@/lib/supabase/admin'
import type { AcceptedFile } from '@/lib/server/http'

/**
 * Store customer reference images in a PRIVATE Supabase bucket. Returns
 * storage paths (not public URLs); staff view them via signed URLs.
 * In local development without Supabase, files are acknowledged but not kept.
 */
export async function storeReferenceImages(kind: 'quotes' | 'services', reference: string, files: AcceptedFile[]): Promise<string[]> {
  if (!files.length) return []
  const sb = getAdminSupabase()
  const bucket = process.env.SUPABASE_UPLOADS_BUCKET || 'references'
  const paths = files.map((f) => `${kind}/${reference}/${randomUUID()}.${f.ext}`)
  if (!sb) return paths.map((p) => `memory://${p}`)
  await Promise.all(
    files.map(async (f, i) => {
      const { error } = await sb.storage.from(bucket).upload(paths[i]!, f.bytes, { contentType: f.type, upsert: false })
      if (error) throw new Error(`storage.upload: ${error.message}`)
    }),
  )
  return paths
}
