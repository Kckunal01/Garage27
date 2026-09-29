'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { track } from '@/lib/analytics'
import { isNavItemActive, PRIMARY_NAV } from './nav-config'

/**
 * THE Garage 27 navigation — the only primary navigation in the app.
 *
 * Rendered once, by the root layout, for every route (including 404).
 * Always the floating pill fixed above the bottom edge, at every width.
 * No variants, no per-route positioning, no top-bar fallback: pages must
 * never render their own navigation.
 */
export function GarageNav() {
  const pathname = usePathname() ?? '/'
  return (
    <nav className="gnav" aria-label="Primary">
      <ul className="gnav__list">
        {PRIMARY_NAV.map((item) => {
          const active = isNavItemActive(pathname, item)
          return (
            <li key={item.href} className="gnav__item">
              <Link href={item.href} className="gnav__link" aria-current={active ? 'page' : undefined} onClick={() => track(item.event, { surface: 'nav' })}>
                <span className="gnav__text">{item.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
