'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { track } from '@/lib/analytics'

/** The chosen bike lives in the URL (?bike=), so it carries between /parts and its categories. */
export function useBikeFilter() {
  const router = useRouter()
  const pathname = usePathname()
  const bike = useSearchParams().get('bike') ?? ''
  const setBike = (id: string) => {
    router.replace(id ? `${pathname}?bike=${encodeURIComponent(id)}` : pathname, { scroll: false })
    track('parts_bike_filter_selected', { bike: id || 'all' })
  }
  return { bike, setBike }
}
