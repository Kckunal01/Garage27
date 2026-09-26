'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { track } from '@/lib/analytics'
import { isActive, PRIMARY_NAV } from './nav-config'

/**
 * The universal Garage 27 navigation.
 * - `pill`: floating mobile capsule fixed above the bottom edge.
 * - `bar`:  desktop header row.
 * Same items, same active language (red label, underline glow, indicator dot).
 */
export function GarageNav({ variant }: { variant: 'pill' | 'bar' }) {
  const pathname = usePathname() ?? '/'
  return (
    <nav className={`gnav gnav--${variant}`} aria-label={variant === 'pill' ? 'Primary (mobile)' : 'Primary'}>
      <ul className="gnav__list">
        {PRIMARY_NAV.map((item) => {
          const active = isActive(pathname, item.href)
          return (
            <li key={item.href} className="gnav__item">
              <Link
                href={item.href}
                className="gnav__link"
                aria-current={active ? 'page' : undefined}
                onClick={() => track(item.event, { surface: variant })}
              >
                <span className="gnav__text">{item.label}</span>
                <span className="gnav__dot" aria-hidden="true" />
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
