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

/** Garage 27's contact details (supplied by Garage 27). One source for the whole site. */
export const CONTACT = {
  email: 'support@garage27.in',
  phone: '+91 99841 02518',
  /** tel: / wa.me form of the same number. */
  phoneE164: '+919984102518',
  whatsapp: 'https://wa.me/919984102518',
  instagram: 'https://instagram.com/garage27',
  hours: 'TUE–SUN · 10:00–19:00',
}

/** The global footer: three equal columns. No hours, addresses, cart or cards. */
const TRACK_ORDER = { href: '/track-order', label: 'Track Order' }

export const FOOTER = {
  trackOrder: TRACK_ORDER,
  pages: PRIMARY_NAV.map((n) => ({ href: n.href, label: n.label[0] + n.label.slice(1).toLowerCase() })),
  quickLinks: [
    { href: '/legal/privacy', label: 'Privacy Policy' },
    { href: '/legal/shipping', label: 'Shipping' },
    { href: '/legal/refunds', label: 'Returns & Cancellation' },
    { href: '/legal/terms', label: 'Terms & Conditions' },
    TRACK_ORDER,
  ],
}

export function isActive(pathname: string, href: string) {
  const base = href.split(/[?#]/)[0]!
  return pathname === base || pathname.startsWith(`${base}/`)
}

export function isNavItemActive(pathname: string, item: NavItem) {
  return isActive(pathname, item.href) || !!item.alsoActiveOn?.includes(pathname)
}

/**
 * Routes whose environment image *is* the page: the header floats over it.
 * The footer follows after the page, as everywhere. (GarageNav is
 * identical on every route, immersive or not.)
 */
export const IMMERSIVE_ROUTES = ['/']
export const isImmersive = (pathname: string) => IMMERSIVE_ROUTES.includes(pathname)
