'use client'

import { useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { Honeypot } from '@/components/forms/FormField'
import { postForm } from '@/lib/http-client'
import { ENQUIRY_ACCEPT, enquiryPhoneSchema, enquirySchema, fieldErrors, UPLOAD_LIMITS } from '@/lib/validation/schemas'

/**
 * LET'S TALK: a reference (images / PDF), what's on your mind, a
 * name and one way to reach you. Posts to /api/enquiries; the server
 * re-validates everything and answers with a reference.
 * `contact="phone"` (Service → LET'S TALK) asks for a phone number instead of
 * "WhatsApp / Email".
 */
export function EnquiryForm({ initialMessage = '', contact = 'reach' }: { initialMessage?: string; contact?: 'reach' | 'phone' } = {}) {
  const phoneOnly = contact === 'phone'
  const [v, setV] = useState({ name: '', reach: '', message: initialMessage, link: '' })
  const [files, setFiles] = useState<File[]>([])
  const [hp, setHp] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string>()
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState<string | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)

  const set = (k: keyof typeof v) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setV((p) => ({ ...p, [k]: e.target.value }))
    // A field's error goes as soon as it is edited; submit re-checks everything.
    setErrors((p) => {
      if (!p[k]) return p
      const next = { ...p }
      delete next[k]
      return next
    })
  }

  const pick = (e: ChangeEvent<HTMLInputElement>) => {
    const chosen = [...(e.target.files ?? [])]
    const bad = chosen.find((f) => !(ENQUIRY_ACCEPT as readonly string[]).includes(f.type))
    const big = chosen.find((f) => f.size > UPLOAD_LIMITS.maxBytesPerFile)
    const error = chosen.length > UPLOAD_LIMITS.maxFiles ? `Up to ${UPLOAD_LIMITS.maxFiles} files.` : bad ? 'Use JPG, PNG, WebP or PDF.' : big ? 'Each file must be under 3 MB.' : undefined
    setErrors((p) => {
      const next = { ...p }
      if (error) next.files = error
      else delete next.files
      return next
    })
    if (!error) setFiles(chosen)
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setFormError(undefined)
    const payload = { name: v.name, reach: v.reach, message: v.message, link: v.link, website: hp || undefined }
    const r = (phoneOnly ? enquiryPhoneSchema : enquirySchema).safeParse(payload)
    const errs = r.success ? {} : fieldErrors(r.error)
    if (errors.files) errs.files = errors.files
    setErrors(errs)
    if (Object.keys(errs).length) return
    setBusy(true)
    const res = await postForm<{ reference: string }>('/api/enquiries', payload, files)
    setBusy(false)
    if (res.ok) setDone(res.data.reference)
    else {
      setFormError(res.error)
      if (res.fields) setErrors(res.fields)
    }
  }

  if (done) {
    return (
      <div className="abt-form abt-form--done" role="status">
        <p className="abt-form__done-title">REQUEST SENT.</p>
        <p className="abt-form__done-text">
          Your reference is <strong>{done}</strong>. We’ll get back with ideas, possibilities and next steps.
        </p>
      </div>
    )
  }

  const err = (k: string) => (errors[k] ? { 'aria-invalid': true as const, 'aria-describedby': `abt-err-${k}` } : {})
  const msg = (k: string) =>
    errors[k] ? (
      <span className="abt-form__error" id={`abt-err-${k}`}>
        {errors[k]}
      </span>
    ) : null

  return (
    <form className="abt-form" onSubmit={submit} noValidate>
      <div className={`abt-upload${files.length ? ' has-files' : ''}`}>
        <button type="button" className="abt-upload__pick" onClick={() => fileInput.current?.click()} {...err('files')}>
          <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 8h3l2-2.5h6L17 8h3v11H4z" />
            <circle cx="12" cy="13" r="3.4" />
          </svg>
          <span className="abt-upload__title">Upload Reference</span>
          <span className="abt-upload__hint">{files.length ? files.map((f) => f.name).join(', ') : '(Image or PDF)'}</span>
        </button>
        <input ref={fileInput} className="abt-upload__input" type="file" multiple accept={ENQUIRY_ACCEPT.join(',')} onChange={pick} tabIndex={-1} aria-hidden="true" />
        {msg('files')}
      </div>

      <div className="abt-form__message">
        <textarea className="abt-field abt-field--area" aria-label="What you're looking for" placeholder={'Tell us what you’re looking for…\n(e.g. bike model, style, parts, custom idea)'} value={v.message} onChange={set('message')} rows={4} {...err('message')} />
        {msg('message')}
      </div>

      <div className="abt-form__name">
        <input className="abt-field" aria-label="Your name" placeholder="Your Name" autoComplete="name" value={v.name} onChange={set('name')} {...err('name')} />
        {msg('name')}
      </div>
      <div className="abt-form__reach">
        {phoneOnly ? (
          <input className="abt-field" type="tel" inputMode="tel" aria-label="Phone number" placeholder="Phone Number" autoComplete="tel-national" value={v.reach} onChange={set('reach')} {...err('reach')} />
        ) : (
          <input className="abt-field" aria-label="Your WhatsApp or email" placeholder="Your WhatsApp / Email" autoComplete="email" value={v.reach} onChange={set('reach')} {...err('reach')} />
        )}
        {msg('reach')}
      </div>
      <button type="submit" className="abt-send" disabled={busy}>
        {busy ? 'SENDING…' : 'SEND REQUEST'}
        <svg viewBox="0 0 22 12" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1 6h19M15 1l5 5-5 5" />
        </svg>
      </button>
      <Honeypot value={hp} onChange={setHp} />
      {formError && (
        <p className="abt-form__fail" role="alert">
          {formError}
        </p>
      )}
    </form>
  )
}
