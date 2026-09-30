'use client'

import Link from 'next/link'
import { useState } from 'react'
import { QuoteForm } from '@/features/quotes/QuoteForm'
import type { BuildConfiguration } from '@/types/catalogue'

/** The build request form on /service/request; on success, the reference and the way back. */
export function BuildRequest({ configuration, value }: { configuration: BuildConfiguration; value: number }) {
  const [reference, setReference] = useState<string | null>(null)
  if (reference) {
    return (
      <div className="sreq__done" role="status">
        <p className="sreq__label">REQUEST SENT</p>
        <p className="sreq__done-title">Your build is on the board.</p>
        <p className="sreq__text">A Garage 27 builder will review your configuration and come back to you — usually within two working days.</p>
        <p className="sreq__ref">
          REFERENCE <strong>{reference}</strong>
        </p>
        <Link className="sreq__back" href="/build">
          BACK TO BUILD
        </Link>
      </div>
    )
  }
  return <QuoteForm configuration={configuration} estimate={value} onDone={setReference} />
}
