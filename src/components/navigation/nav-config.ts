import type { AnalyticsEvent } from '@/lib/analytics'

export interface NavItem {
  href: string
  label: string
  event: AnalyticsEvent
  /** Extra routes on which this item reads as active. (`/` has no active item.) */
  alsoActiveOn?: string[]
}

/** The one and only primary navigation. Every nav surface reads this list. */
export const PRIMARY_NAV: NavItem[] = [
  { href: '/garage', label: 'GARAGE', event: 'nav_garage' },
  { href: '/build', label: 'BUILD', event: 'nav_build' },
  { href: '/parts', label: 'PARTS', event: 'nav_parts' },
  { href: '/service', label: 'SERVICE', event: 'nav_service' },
  { href: '/about', label: 'ABOUT', event: 'nav_about' },
]

/** The global drawer: the five pages + HELP. Nothing else. */
export const DRAWER_LINKS: { href: string; label: string; event?: AnalyticsEvent }[] = [
  ...PRIMARY_NAV,
  { href: '/help', label: 'HELP' },
]

/** Universal footer. No hours, addresses, cart or duplicate primary nav. */
export const FOOTER = {
  trackOrder: { href: '/track-order', label: 'TRACK ORDER' },
  legal: [
    { href: '/legal/privacy', label: 'Privacy Policy' },
    { href: '/legal/terms', label: 'Terms & Conditions' },
    { href: '/legal/shipping', label: 'Shipping Policy' },
    { href: '/legal/refunds', label: 'Refund / Cancellation Policy' },
  ],
  help: { href: '/help', label: 'HELP' },
  instagram: 'https://instagram.com/garage27',
}

export const CONTACT = {
  phone: '+91 00000 00000',
  email: 'hello@garage27.in',
  instagram: 'https://instagram.com/garage27',
  hours: 'TUE–SUN · 10:00–19:00',
}

export function isActive(pathname: string, href: string) {
  const base = href.split(/[?#]/)[0]!
  return pathname === base || pathname.startsWith(`${base}/`)
}

export function isNavItemActive(pathname: string, item: NavItem) {
  return isActive(pathname, item.href) || !!item.alsoActiveOn?.includes(pathname)
}

/**
 * Routes whose environment image *is* the page: transparent header (logo +
 * rack control), no footer. (GarageNav is
 * identical on every route, immersive or not.)
 */
export const IMMERSIVE_ROUTES = ['/']
export const isImmersive = (pathname: string) => IMMERSIVE_ROUTES.includes(pathname)
