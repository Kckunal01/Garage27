'use client'

import type { ReactNode } from 'react'
import { useReportWebVitals } from 'next/web-vitals'
import { CartProvider } from '@/features/checkout/cart-store'
import { ToastProvider } from '@/components/garage-ui/Toast'
import { track } from '@/lib/analytics'

function WebVitals() {
  // LCP / INP / CLS / TTFB / FCP → the analytics abstraction.
  useReportWebVitals((m) => track('web_vital', { metric: m.name, value: Math.round(m.name === 'CLS' ? m.value * 1000 : m.value), rating: m.rating }))
  return null
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      <ToastProvider>
        <WebVitals />
        {children}
      </ToastProvider>
    </CartProvider>
  )
}
