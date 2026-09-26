'use client'

import { useEffect } from 'react'
import { ErrorState } from '@/components/garage-ui/States'

export default function RouteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Digest only — never the message, which may carry internals.
    console.error('[route-error]', error.digest ?? 'client')
  }, [error])
  return (
    <div className="wrap section">
      <ErrorState onRetry={reset}>
        <p>A part came loose on our side. Give it another go.</p>
      </ErrorState>
    </div>
  )
}
