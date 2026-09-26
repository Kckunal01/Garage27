import type { AnalyticsEvent } from '@/lib/analytics'

export interface NavItem {
  href: string
  label: string
  event: AnalyticsEvent
  /** Extra routes on which this item reads as active (the home page is the Garage). */
  alsoActiveOn?: string[]
}

/** The one and only primary navigation. Every nav surface reads this list. */
export const PRIMARY_NAV: NavItem[] = [
  { href: '/garage', label: 'GARAGE', event: 'nav_garage', alsoActiveOn: ['/'] },
  { href: '/build', label: 'BUILD', event: 'nav_build' },
  { href: '/parts', label: 'PARTS', event: 'nav_parts' },
  { href: '/service', label: 'SERVICE', event: 'nav_service' },
  { href: '/about', label: 'ABOUT', event: 'nav_about' },
]

export const RACK_SECONDARY = [
  { href: '/cart', label: 'CART' },
  { href: '/build?saved=1', label: 'SAVED BUILD' },
  { href: '/service#request', label: 'BOOK A SERVICE' },
  { href: '/about#contact', label: 'CONTACT' },
]

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
 * Routes whose environment image *is* the page: no logo bar, no cart link,
 * no footer — just the brand statement, the rack control and the floating nav.
 */
export const IMMERSIVE_ROUTES = ['/']
export const isImmersive = (pathname: string) => IMMERSIVE_ROUTES.includes(pathname)
