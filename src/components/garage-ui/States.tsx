import type { ReactNode } from 'react'

/** Loading / empty / error states in the garage voice. */
export function LoadingState({ message = 'LOADING…' }: { message?: string }) {
  return (
    <div className="state state--loading" role="status" aria-live="polite">
      <span className="state__lamp" aria-hidden="true" />
      <p className="label label--amber">{message}</p>
    </div>
  )
}

export function EmptyState({ title = 'THIS SHELF IS EMPTY.', children }: { title?: string; children?: ReactNode }) {
  return (
    <div className="state state--empty">
      <p className="title">{title}</p>
      {children && <div className="state__body">{children}</div>}
    </div>
  )
}

export function ErrorState({ title = 'SOMETHING MISFIRED. TRY AGAIN.', children, onRetry }: { title?: string; children?: ReactNode; onRetry?: () => void }) {
  return (
    <div className="state state--error" role="alert">
      <p className="title">{title}</p>
      {children && <div className="state__body">{children}</div>}
      {onRetry && (
        <button type="button" className="btn btn--sm" onClick={onRetry}>
          TRY AGAIN
        </button>
      )}
    </div>
  )
}
