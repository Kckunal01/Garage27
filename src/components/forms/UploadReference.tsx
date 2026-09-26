'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { UPLOAD_LIMITS } from '@/lib/validation/schemas'

export interface ReferenceImage {
  id: string
  file: File
  url: string
}

/**
 * Downscale on the device before upload: phone photos are 4–12 MB; the bay
 * only needs ~1600px. Saves data on Indian mobile networks and keeps requests
 * under serverless body limits.
 */
async function downscale(file: File, max = 1600): Promise<File> {
  if (!file.type.startsWith('image/') || typeof createImageBitmap !== 'function') return file
  try {
    const bmp = await createImageBitmap(file)
    const scale = Math.min(1, max / Math.max(bmp.width, bmp.height))
    if (scale === 1 && file.size <= UPLOAD_LIMITS.maxBytesPerFile) return file
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(bmp.width * scale)
    canvas.height = Math.round(bmp.height * scale)
    canvas.getContext('2d')?.drawImage(bmp, 0, 0, canvas.width, canvas.height)
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/jpeg', 0.84))
    if (!blob) return file
    return new File([blob], file.name.replace(/\.\w+$/, '') + '.jpg', { type: 'image/jpeg' })
  } catch {
    return file
  }
}

export function UploadReference({ value, onChange, error, onAdded }: { value: ReferenceImage[]; onChange: (v: ReferenceImage[]) => void; error?: string; onAdded?: (n: number) => void }) {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [localError, setLocalError] = useState<string>()
  const latest = useRef(value)
  useEffect(() => {
    latest.current = value
  }, [value])
  // Revoke preview object URLs on unmount.
  useEffect(() => () => latest.current.forEach((v) => URL.revokeObjectURL(v.url)), [])

  const add = async (list: FileList | null) => {
    if (!list?.length) return
    setLocalError(undefined)
    const room = UPLOAD_LIMITS.maxFiles - value.length
    const picked = [...list].slice(0, room)
    if (list.length > room) setLocalError(`Up to ${UPLOAD_LIMITS.maxFiles} images.`)
    const bad = picked.find((f) => !(UPLOAD_LIMITS.accept as readonly string[]).includes(f.type))
    if (bad) {
      setLocalError('Use JPG, PNG or WebP images.')
      return
    }
    setBusy(true)
    const processed = await Promise.all(picked.map((f) => downscale(f)))
    setBusy(false)
    const tooBig = processed.find((f) => f.size > UPLOAD_LIMITS.maxBytesPerFile)
    if (tooBig) {
      setLocalError('Each image must be under 3 MB.')
      return
    }
    const next = processed.map((file) => ({ id: `${file.name}-${file.size}-${Math.random().toString(36).slice(2, 7)}`, file, url: URL.createObjectURL(file) }))
    onChange([...value, ...next])
    onAdded?.(next.length)
    if (inputRef.current) inputRef.current.value = ''
  }

  const remove = (id: string) => {
    const gone = value.find((v) => v.id === id)
    if (gone) URL.revokeObjectURL(gone.url)
    onChange(value.filter((v) => v.id !== id))
  }

  const message = error ?? localError
  return (
    <div className={`upload${message ? ' has-error' : ''}`}>
      <p className="field__label" id={`${inputId}-label`}>
        REFERENCE IMAGES <span className="muted">(OPTIONAL · UP TO {UPLOAD_LIMITS.maxFiles})</span>
      </p>
      <div className="upload__grid">
        {value.map((img) => (
          <figure key={img.id} className="upload__thumb">
            {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview */}
            <img src={img.url} alt={`Reference: ${img.file.name}`} />
            <button type="button" className="upload__remove" onClick={() => remove(img.id)} aria-label={`Remove ${img.file.name}`}>
              ×
            </button>
          </figure>
        ))}
        {value.length < UPLOAD_LIMITS.maxFiles && (
          <label className="upload__add" htmlFor={inputId}>
            <span aria-hidden="true">+</span>
            <span className="label">{busy ? 'PREPARING…' : 'ADD PHOTO'}</span>
            <input
              ref={inputRef}
              id={inputId}
              className="sr-only"
              type="file"
              accept={UPLOAD_LIMITS.accept.join(',')}
              multiple
              aria-labelledby={`${inputId}-label`}
              onChange={(e) => add(e.target.files)}
            />
          </label>
        )}
      </div>
      {message && (
        <p className="field__error" role="alert">
          {message}
        </p>
      )}
    </div>
  )
}
