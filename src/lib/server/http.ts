import 'server-only'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { fieldErrors, UPLOAD_LIMITS } from '@/lib/validation/schemas'
import { StoreUnavailableError } from './store'
import { reportError } from './monitoring'

export const NO_STORE = { 'Cache-Control': 'no-store, max-age=0' }

export function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: NO_STORE })
}

export function misfire(scope: string, err: unknown, context: Record<string, unknown> = {}) {
  reportError(scope, err, context)
  const status = err instanceof StoreUnavailableError ? 503 : 500
  return json({ error: 'SOMETHING MISFIRED. TRY AGAIN.' }, status)
}

export function invalid(error: z.ZodError) {
  return json({ error: 'Check the highlighted fields.', fields: fieldErrors(error) }, 422)
}

/** Only accept same-origin browser posts (defence in depth behind Cloudflare). */
export function isSameOrigin(req: Request): boolean {
  const origin = req.headers.get('origin')
  if (!origin) return true // non-browser clients; rate limit + validation still apply
  try {
    return new URL(origin).host === new URL(req.url).host || origin === process.env.NEXT_PUBLIC_SITE_URL
  } catch {
    return false
  }
}

export function clientIp(req: Request): string {
  return (
    req.headers.get('cf-connecting-ip') ??
    req.headers.get('x-real-ip') ??
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    'unknown'
  )
}

/**
 * Best-effort per-instance limiter. Cloudflare rate-limiting rules are the
 * primary control (see docs/INFRASTRUCTURE.md); this catches bursts that slip
 * through to a single warm function instance.
 */
const buckets = new Map<string, { count: number; reset: number }>()
export function rateLimited(key: string, limit = 5, windowMs = 60_000): boolean {
  const now = Date.now()
  const b = buckets.get(key)
  if (!b || b.reset < now) {
    buckets.set(key, { count: 1, reset: now + windowMs })
    if (buckets.size > 5000) for (const [k, v] of buckets) if (v.reset < now) buckets.delete(k)
    return false
  }
  b.count++
  return b.count > limit
}

const MAGIC: Record<string, (b: Uint8Array) => boolean> = {
  'image/jpeg': (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  'image/png': (b) => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47,
  'image/webp': (b) => b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b[8] === 0x57 && b[9] === 0x45,
}
const PDF_MAGIC = (b: Uint8Array) => b[0] === 0x25 && b[1] === 0x50 && b[2] === 0x44 && b[3] === 0x46 // %PDF

export interface AcceptedFile {
  bytes: Uint8Array
  type: string
  ext: string
}

/** Validate uploaded reference images by size, declared type AND magic bytes. */
export async function readImageFiles(files: File[]): Promise<{ ok: true; files: AcceptedFile[] } | { ok: false; error: string }> {
  if (files.length > UPLOAD_LIMITS.maxFiles) return { ok: false, error: `Up to ${UPLOAD_LIMITS.maxFiles} images.` }
  const out: AcceptedFile[] = []
  for (const f of files) {
    if (f.size > UPLOAD_LIMITS.maxBytesPerFile) return { ok: false, error: 'Each image must be under 3 MB.' }
    const check = MAGIC[f.type]
    if (!check) return { ok: false, error: 'Use JPG, PNG or WebP images.' }
    const bytes = new Uint8Array(await f.arrayBuffer())
    if (!check(bytes)) return { ok: false, error: 'That file isn’t a real image.' }
    out.push({ bytes, type: f.type, ext: f.type.split('/')[1]!.replace('jpeg', 'jpg') })
  }
  return { ok: true, files: out }
}

/** Enquiry references: images as above, or a PDF (checked by its %PDF header). */
export async function readReferenceFiles(files: File[]): Promise<{ ok: true; files: AcceptedFile[] } | { ok: false; error: string }> {
  if (files.length > UPLOAD_LIMITS.maxFiles) return { ok: false, error: `Up to ${UPLOAD_LIMITS.maxFiles} files.` }
  const out: AcceptedFile[] = []
  for (const f of files) {
    if (f.size > UPLOAD_LIMITS.maxBytesPerFile) return { ok: false, error: 'Each file must be under 3 MB.' }
    const check = f.type === 'application/pdf' ? PDF_MAGIC : MAGIC[f.type]
    if (!check) return { ok: false, error: 'Use JPG, PNG, WebP or PDF.' }
    const bytes = new Uint8Array(await f.arrayBuffer())
    if (!check(bytes)) return { ok: false, error: 'That file isn’t what it says it is.' }
    out.push({ bytes, type: f.type, ext: f.type === 'application/pdf' ? 'pdf' : f.type.split('/')[1]!.replace('jpeg', 'jpg') })
  }
  return { ok: true, files: out }
}
