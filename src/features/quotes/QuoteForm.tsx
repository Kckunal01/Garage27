'use client'

import { useEffect, useRef, useState } from 'react'
import { Honeypot, TextArea, TextField } from '@/components/forms/FormField'
import { UploadReference, type ReferenceImage } from '@/components/forms/UploadReference'
import { GarageButton } from '@/components/garage-ui/GarageButton'
import { track } from '@/lib/analytics'
import { postForm } from '@/lib/http-client'
import { valueBand } from '@/lib/pricing/money'
import { fieldErrors, quoteRequestSchema } from '@/lib/validation/schemas'
import type { BuildConfiguration } from '@/types/catalogue'

/**
 * REQUEST CUSTOM QUOTE. Sends the full configuration JSON; the server
 * re-validates it and stores its own price snapshot with a unique reference.
 */
export function QuoteForm({ configuration, estimate, onDone }: { configuration: BuildConfiguration; estimate: number; onDone(reference: string): void }) {
  const [v, setV] = useState({ name: '', email: '', phone: '', city: '', notes: '' })
  const [files, setFiles] = useState<ReferenceImage[]>([])
  const [hp, setHp] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string>()
  const [busy, setBusy] = useState(false)
  const started = useRef(false)

  useEffect(() => {
    if (!started.current) {
      started.current = true
      track('build_quote_started', { bike: configuration.bikeId, value_band: valueBand(estimate) })
    }
  }, [configuration.bikeId, estimate])

  const set = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setV((p) => ({ ...p, [k]: e.target.value }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      configuration,
      contact: { name: v.name, email: v.email, phone: v.phone },
      city: v.city,
      notes: v.notes,
      clientEstimate: estimate,
      website: hp || undefined,
    }
    const local = quoteRequestSchema.safeParse(payload)
    if (!local.success) {
      setErrors(fieldErrors(local.error))
      return
    }
    setErrors({})
    setFormError(undefined)
    setBusy(true)
    const r = await postForm<{ reference: string; estimatedTotal: number }>(
      '/api/quotes',
      payload,
      files.map((f) => f.file),
    )
    setBusy(false)
    if (!r.ok) {
      setErrors(r.fields ?? {})
      setFormError(r.error)
      return
    }
    track('build_quote_submitted', { bike: configuration.bikeId, value_band: valueBand(r.data.estimatedTotal), references: files.length })
    onDone(r.data.reference)
  }

  return (
    <form className="quote-form" onSubmit={submit} noValidate>
      <UploadReference value={files} onChange={setFiles} error={errors.files} />
      <TextArea label="Notes for the builder (optional)" placeholder="Inspiration, riding style, budget, deadline…" rows={3} value={v.notes} onChange={set('notes')} error={errors.notes} />
      <div className="form-grid form-grid--2">
        <TextField label="Name" autoComplete="name" value={v.name} onChange={set('name')} error={errors['contact.name']} className="span-2" />
        <TextField label="Email" type="email" inputMode="email" autoComplete="email" value={v.email} onChange={set('email')} error={errors['contact.email']} />
        <TextField label="Mobile" type="tel" inputMode="tel" autoComplete="tel-national" value={v.phone} onChange={set('phone')} error={errors['contact.phone']} />
        <TextField label="City" autoComplete="address-level2" value={v.city} onChange={set('city')} error={errors.city} className="span-2" />
      </div>
      <Honeypot value={hp} onChange={setHp} />
      {formError && (
        <p className="form-error" role="alert">
          {formError}
        </p>
      )}
      <GarageButton type="submit" variant="ignite" block busy={busy}>
        REQUEST CUSTOM QUOTE
      </GarageButton>
      <p className="muted quote-form__note">No payment now. A builder reviews your configuration and sends a confirmed quote.</p>
    </form>
  )
}
