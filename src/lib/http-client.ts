/** Tiny typed client for the Garage 27 route handlers. */

export type ApiResult<T> = { ok: true; data: T } | { ok: false; status: number; error: string; fields?: Record<string, string> }

const FALLBACK = 'SOMETHING MISFIRED. TRY AGAIN.'

async function parse<T>(res: Response): Promise<ApiResult<T>> {
  const body = (await res.json().catch(() => ({}))) as { error?: string; fields?: Record<string, string> } & T
  if (res.ok) return { ok: true, data: body as T }
  return { ok: false, status: res.status, error: body.error ?? FALLBACK, fields: body.fields }
}

export async function postJson<T>(url: string, payload: unknown): Promise<ApiResult<T>> {
  try {
    return await parse<T>(await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }))
  } catch {
    return { ok: false, status: 0, error: 'No signal. Check your connection and try again.' }
  }
}

/** Multipart post: JSON payload + optional image files. */
export async function postForm<T>(url: string, payload: unknown, files: File[] = []): Promise<ApiResult<T>> {
  const form = new FormData()
  form.set('payload', JSON.stringify(payload))
  for (const f of files) form.append('files', f)
  try {
    return await parse<T>(await fetch(url, { method: 'POST', body: form }))
  } catch {
    return { ok: false, status: 0, error: 'No signal. Check your connection and try again.' }
  }
}
