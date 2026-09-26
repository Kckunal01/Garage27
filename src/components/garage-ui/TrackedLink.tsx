'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'
import { track, type AnalyticsEvent, type AnalyticsProps } from '@/lib/analytics'

/** A Link that reports a CTA click. Lets server pages stay server components. */
export function TrackedLink({ href, className, event, props, children }: { href: string; className?: string; event: AnalyticsEvent; props?: AnalyticsProps; children: ReactNode }) {
  return (
    <Link href={href} className={className} onClick={() => track(event, props)}>
      {children}
    </Link>
  )
}
