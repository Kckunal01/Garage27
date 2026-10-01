'use client'

import { useEffect, useRef, useState } from 'react'
import { Honeypot, SelectField, TextArea, TextField } from '@/components/forms/FormField'
import { UploadReference, type ReferenceImage } from '@/components/forms/UploadReference'
import { GarageButton } from '@/components/garage-ui/GarageButton'
import { WorkStandardNote } from '@/components/garage-ui/WorkStandardNote'
import { track } from '@/lib/analytics'
import { postForm } from '@/lib/http-client'
import { fieldErrors, serviceRequestSchema } from '@/lib/validation/schemas'
import type { ServiceOffering } from '@/types/catalogue'
import type { BikeChoiceGroup } from './bikeChoices'

const STEP_FIELDS: Record<number, string[]> = {
  1: ['serviceId', 'bike', 'requirement'],
  2: ['location', 'contact.name', 'contact.email', 'contact.phone', 'files'],
  3: ['notes'],
}

/**
 * Progressive request: (1) service + bike + need, (2) references + location +
 * contact, (3) optional notes → submit → confirmation with a reference.
 */
export function ServiceRequestForm({ services, bikes, selected, onSelect, compact }: { services: ServiceOffering[]; bikes: BikeChoiceGroup[]; selected: string; onSelect: (id: string) => void; compact?: boolean }) {
  const [step, setStep] = useState(1)
  const [v, setV] = useState({ bike: '', requirement: '', location: '', name: '', email: '', phone: '', notes: '' })
  const [files, setFiles] = useState<ReferenceImage[]>([])
  const [hp, setHp] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string>()
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState<string | null>(null)
  const started = useRef(false)
  const headingRef = useRef<HTMLHeadingElement>(null)

  // Move focus to the new step for screen-reader/keyboard users — but not on first render.
  const firstRender = useRef(true)
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    headingRef.current?.focus({ preventScroll: false })
  }, [step, done])

  const set = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!started.current) {
      started.current = true
      track('service_form_started', { service: selected || 'none' })
    }
    setV((p) => ({ ...p, [k]: e.target.value }))
  }

  const payload = () => ({
    serviceId: selected,
    bike: v.bike,
    requirement: v.requirement,
    location: v.location,
    contact: { name: v.name, email: v.email, phone: v.phone },
    notes: v.notes,
    website: hp || undefined,
  })

  /** Validate only the fields that belong to steps up to `upTo`. */
  const check = (upTo: number) => {
    const r = serviceRequestSchema.safeParse(payload())
    if (r.success) return {}
    const all = fieldErrors(r.error)
    const keys = Object.entries(STEP_FIELDS)
      .filter(([s]) => Number(s) <= upTo)
      .flatMap(([, k]) => k)
    return Object.fromEntries(Object.entries(all).filter(([k]) => keys.includes(k)))
  }

  const next = () => {
    const errs = check(step)
    if (!selected) errs.serviceId = 'Pick a service.'
    setErrors(errs)
    if (!Object.keys(errs).length) setStep((s) => s + 1)
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (step < 3) return next()
    const errs = check(3)
    if (Object.keys(errs).length) {
      setErrors(errs)
      setStep(Object.keys(errs).some((k) => STEP_FIELDS[1]!.includes(k)) ? 1 : 2)
      return
    }
    setBusy(true)
    setFormError(undefined)
    const r = await postForm<{ reference: string }>(
      '/api/service-requests',
      payload(),
      files.map((f) => f.file),
    )
    setBusy(false)
    if (!r.ok) {
      setErrors(r.fields ?? {})
      setFormError(r.error)
      return
    }
    track('service_request_submitted', { service: selected, references: files.length })
    setDone(r.data.reference)
  }

  if (done) {
    return (
      <div className="sf sform sform--done" role="status">
        <p className="label label--amber">REQUEST RECEIVED</p>
        <h3 className="headline" tabIndex={-1} ref={headingRef}>
          We’ll call you back.
        </h3>
        <p className="lede">A Garage 27 builder will reach out within one working day to talk it through.</p>
        <p className="confirm__ref">
          <span className="label">REFERENCE</span> <strong>{done}</strong>
        </p>
        <GarageButton
          onClick={() => {
            setDone(null)
            setStep(1)
            setFiles([])
            setV({ bike: '', requirement: '', location: '', name: '', email: '', phone: '', notes: '' })
            started.current = false
          }}
        >
          ANOTHER REQUEST
        </GarageButton>
      </div>
    )
  }

  return (
    <form className={`sf sform${compact ? ' sform--compact' : ''}`} onSubmit={submit} noValidate>
      <ol className="steps" aria-label="Progress">
        {['THE JOB', 'THE DETAILS', 'ANYTHING ELSE'].map((label, i) => (
          <li key={label} className={step === i + 1 ? 'is-current' : step > i + 1 ? 'is-done' : ''} aria-current={step === i + 1 ? 'step' : undefined}>
            <span>{String(i + 1).padStart(2, '0')}</span> {label}
          </li>
        ))}
      </ol>
      <h3 className="title sr-only" tabIndex={-1} ref={headingRef}>
        Step {step} of 3
      </h3>

      {step === 1 && (
        <div className="form-grid">
          <SelectField
            label="Service"
            value={selected}
            onChange={(e) => {
              onSelect(e.target.value)
              track('service_selected', { service: e.target.value, surface: 'form' })
            }}
            error={errors.serviceId}
          >
            <option value="">Choose a service</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </SelectField>
          <SelectField label="Your bike" value={v.bike} onChange={set('bike')} error={errors.bike} className="sf-bike">
            <option value="">Choose your motorcycle</option>
            {bikes.map((g) => (
              <optgroup key={g.brand} label={g.brand}>
                {g.options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </SelectField>
          <TextArea label="What do you need?" placeholder="A line or two is plenty." value={v.requirement} onChange={set('requirement')} error={errors.requirement} rows={3} />
        </div>
      )}

      {step === 2 && (
        <div className="form-grid form-grid--2">
          <div className="span-2">
            <UploadReference value={files} onChange={setFiles} error={errors.files} onAdded={(n) => track('service_reference_uploaded', { service: selected, count: n })} />
          </div>
          <TextField label="Location / area" placeholder="City, area" value={v.location} onChange={set('location')} error={errors.location} autoComplete="address-level2" className="span-2" />
          <TextField label="Name" value={v.name} onChange={set('name')} error={errors['contact.name']} autoComplete="name" className="span-2" />
          <TextField label="Email" type="email" inputMode="email" value={v.email} onChange={set('email')} error={errors['contact.email']} autoComplete="email" />
          <TextField label="Mobile" type="tel" inputMode="tel" value={v.phone} onChange={set('phone')} error={errors['contact.phone']} autoComplete="tel-national" />
        </div>
      )}

      {step === 3 && (
        <div className="form-grid">
          <TextArea label="Notes (optional)" placeholder="Timelines, budget, anything we should know." value={v.notes} onChange={set('notes')} error={errors.notes} rows={4} />
          <WorkStandardNote kind="service" />
        </div>
      )}

      <Honeypot value={hp} onChange={setHp} />
      {formError && (
        <p className="form-error" role="alert">
          {formError}
        </p>
      )}
      <div className="sform__actions">
        {step > 1 && (
          <GarageButton type="button" variant="ghost" onClick={() => setStep((s) => s - 1)} disabled={busy}>
            ← BACK
          </GarageButton>
        )}
        <GarageButton type="submit" variant={step === 3 ? 'ignite' : 'amber'} busy={busy}>
          {step === 3 ? 'SUBMIT REQUEST' : 'NEXT'}
        </GarageButton>
      </div>
    </form>
  )
}
