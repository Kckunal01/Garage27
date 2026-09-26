import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'

interface Base {
  label: string
  error?: string
  hint?: string
  className?: string
}

function Shell({ id, label, error, hint, className = '', children }: Base & { id: string; children: ReactNode }) {
  return (
    <div className={`field${error ? ' has-error' : ''} ${className}`}>
      <label className="field__label" htmlFor={id}>
        {label}
      </label>
      {children}
      {hint && !error && (
        <p className="field__hint" id={`${id}-hint`}>
          {hint}
        </p>
      )}
      {error && (
        <p className="field__error" id={`${id}-err`} role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

const describedBy = (id: string, error?: string, hint?: string) => (error ? `${id}-err` : hint ? `${id}-hint` : undefined)

export function TextField({ label, error, hint, className, ...props }: Base & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId()
  return (
    <Shell id={id} label={label} error={error} hint={hint} className={className}>
      <input id={id} className="field__input" aria-invalid={!!error || undefined} aria-describedby={describedBy(id, error, hint)} {...props} />
    </Shell>
  )
}

export function TextArea({ label, error, hint, className, ...props }: Base & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const id = useId()
  return (
    <Shell id={id} label={label} error={error} hint={hint} className={className}>
      <textarea id={id} className="field__input field__input--area" aria-invalid={!!error || undefined} aria-describedby={describedBy(id, error, hint)} {...props} />
    </Shell>
  )
}

export function SelectField({ label, error, hint, className, children, ...props }: Base & SelectHTMLAttributes<HTMLSelectElement>) {
  const id = useId()
  return (
    <Shell id={id} label={label} error={error} hint={hint} className={className}>
      <div className="field__select">
        <select id={id} className="field__input" aria-invalid={!!error || undefined} aria-describedby={describedBy(id, error, hint)} {...props}>
          {children}
        </select>
      </div>
    </Shell>
  )
}

/** Hidden honeypot. Bots fill it; people never see it. */
export function Honeypot({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="hp" aria-hidden="true">
      <label>
        Website
        <input tabIndex={-1} autoComplete="off" value={value} onChange={(e) => onChange(e.target.value)} />
      </label>
    </div>
  )
}
