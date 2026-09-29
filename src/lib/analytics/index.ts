/**
 * Vendor-independent analytics. Call `track()` everywhere; adapters decide
 * where events go (GTM dataLayer, a beacon endpoint, the dev console…).
 * PII is stripped before any adapter sees the payload.
 */

export type AnalyticsEvent =
  // navigation
  | 'nav_garage' | 'nav_build' | 'nav_parts' | 'nav_service' | 'nav_about' | 'rack_open' | 'rack_close'
  // build
  | 'build_started' | 'build_bike_selected' | 'build_colour_selected' | 'build_category_opened'
  | 'build_option_selected' | 'build_option_blocked' | 'build_configuration_changed'
  | 'build_quote_started' | 'build_quote_submitted' | 'build_saved' | 'build_3d_failed'
  // parts & commerce
  | 'parts_bike_filter_selected' | 'parts_category_opened' | 'product_viewed' | 'add_to_cart' | 'buy_now'
  | 'cart_viewed' | 'checkout_started' | 'payment_started' | 'payment_success' | 'payment_failed'
  // service
  | 'service_viewed' | 'service_selected' | 'service_form_started' | 'service_reference_uploaded' | 'service_request_submitted'
  // platform
  | 'cta_clicked' | 'web_vital' | 'page_view'

export type AnalyticsProps = Record<string, string | number | boolean | null | undefined>

export interface AnalyticsAdapter {
  name: string
  send(event: AnalyticsEvent, props: AnalyticsProps): void
}

const PII = /(email|phone|name|address|pincode|line1|line2|card|password|token|secret|signature)/i

export function scrub(props: AnalyticsProps): AnalyticsProps {
  const out: AnalyticsProps = {}
  for (const [k, v] of Object.entries(props)) {
    if (PII.test(k) || v === undefined) continue
    // Drop anything that looks like an email or phone number sneaking in as a value.
    if (typeof v === 'string' && (/@/.test(v) || /\b[6-9]\d{9}\b/.test(v))) continue
    out[k] = v
  }
  return out
}

declare global {
  interface Window {
    dataLayer?: unknown[]
  }
}

const adapters: Record<string, AnalyticsAdapter> = {
  console: {
    name: 'console',
    send: (e, p) => console.info('%c[track]', 'color:#c1272d', e, p),
  },
  datalayer: {
    name: 'datalayer',
    send: (e, p) => {
      window.dataLayer = window.dataLayer ?? []
      window.dataLayer.push({ event: e, ...p })
    },
  },
  beacon: {
    name: 'beacon',
    send: (e, p) => {
      const url = process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT
      if (!url || !navigator.sendBeacon) return
      navigator.sendBeacon(url, JSON.stringify({ event: e, ...p }))
    },
  },
}

let active: AnalyticsAdapter[] | null = null
function resolveAdapters(): AnalyticsAdapter[] {
  if (active) return active
  const names = (process.env.NEXT_PUBLIC_ANALYTICS_ADAPTERS || 'datalayer').split(',').map((s) => s.trim())
  if (process.env.NODE_ENV === 'development' && !names.includes('console')) names.push('console')
  active = names.map((n) => adapters[n]).filter((a): a is AnalyticsAdapter => !!a)
  return active
}

/** Register a vendor adapter at runtime (e.g. from a consent manager). */
export function registerAnalyticsAdapter(adapter: AnalyticsAdapter) {
  resolveAdapters().push(adapter)
}

export function track(event: AnalyticsEvent, props: AnalyticsProps = {}) {
  if (typeof window === 'undefined') return
  const payload = scrub({ route: window.location.pathname, ...props })
  for (const a of resolveAdapters()) {
    try {
      a.send(event, payload)
    } catch {
      /* analytics must never break the garage */
    }
  }
  window.dispatchEvent(new CustomEvent('g27:track', { detail: { event, ...payload } }))
}
