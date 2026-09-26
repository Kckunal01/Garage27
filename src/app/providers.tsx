'use client'

import { useLayoutEffect, useRef, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { useReportWebVitals } from 'next/web-vitals'
import { CartProvider } from '@/features/checkout/cart-store'
import { ToastProvider } from '@/components/garage-ui/Toast'
import { track } from '@/lib/analytics'

function WebVitals() {
  // LCP / INP / CLS / TTFB / FCP → the analytics abstraction.
  useReportWebVitals((m) => track('web_vital', { metric: m.name, value: Math.round(m.name === 'CLS' ? m.value * 1000 : m.value), rating: m.rating }))
  return null
}

/**
 * The page-entry fade (.bay-enter) is for moving between bays, not for the
 * first load: server-rendered HTML must paint immediately. Flag the document
 * on the first client-side navigation (layout effect → before paint).
 */
function NavigationFlag() {
  const pathname = usePathname()
  const first = useRef(pathname)
  useLayoutEffect(() => {
    if (pathname !== first.current) document.documentElement.dataset.navigated = 'true'
  }, [pathname])
  return null
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      <ToastProvider>
        <WebVitals />
        <NavigationFlag />
        {children}
      </ToastProvider>
    </CartProvider>
  )
}
