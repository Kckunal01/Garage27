'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useId, useRef, useState, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import { track } from '@/lib/analytics'
import { DRAWER_LINKS, isActive, isNavItemActive, PRIMARY_NAV } from './nav-config'

const FOCUSABLE = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'

/**
 * Top-right "rack": a metal drawer that slides in from the right.
 * Escape / outside click close it, focus is trapped inside while open,
 * the page behind stops scrolling, and focus returns to the trigger.
 */
export function GarageRack() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname() ?? '/'
  const panelRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const titleId = useId()
  // Portal target only exists on the client (the header's backdrop-filter
  // would otherwise trap a position:fixed drawer inside it).
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )

  const close = useCallback((reason: string) => {
    setOpen(false)
    track('rack_close', { reason })
    triggerRef.current?.focus()
  }, [])

  // Route change closes the rack. Adjusting state during render is the
  // React-recommended way to reset on a prop change.
  const [lastPath, setLastPath] = useState(pathname)
  if (lastPath !== pathname) {
    setLastPath(pathname)
    setOpen(false)
  }

  useEffect(() => {
    if (!open) return
    const html = document.documentElement
    const prevOverflow = html.style.overflow
    const scrollbar = window.innerWidth - html.clientWidth
    html.style.overflow = 'hidden'
    html.style.paddingRight = `${scrollbar}px`
    const first = panelRef.current?.querySelector<HTMLElement>(FOCUSABLE)
    first?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        close('escape')
        return
      }
      if (e.key !== 'Tab' || !panelRef.current) return
      const nodes = [...panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((n) => n.offsetParent !== null)
      if (!nodes.length) return
      const firstNode = nodes[0]!
      const lastNode = nodes[nodes.length - 1]!
      if (e.shiftKey && document.activeElement === firstNode) {
        e.preventDefault()
        lastNode.focus()
      } else if (!e.shiftKey && document.activeElement === lastNode) {
        e.preventDefault()
        firstNode.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      html.style.overflow = prevOverflow
      html.style.paddingRight = ''
    }
  }, [open, close])

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={`rack-trigger${open ? ' is-open' : ''}`}
        aria-expanded={open}
        aria-controls="garage-rack"
        aria-label={open ? 'Close menu' : 'Open menu'}
        onClick={() => {
          if (open) close('toggle')
          else {
            setOpen(true)
            track('rack_open')
          }
        }}
      >
        <span className="rack-trigger__bars" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
      </button>

      {mounted &&
        createPortal(
          <div className={`rack${open ? ' is-open' : ''}`} aria-hidden={!open} inert={!open}>
            <div className="rack__scrim" onClick={() => close('outside')} />
            <div ref={panelRef} id="garage-rack" className="rack__panel" role="dialog" aria-modal="true" aria-labelledby={titleId}>
              <div className="rack__head">
                <p id={titleId} className="rack__title">
                  MENU
                </p>
                <button type="button" className="rack__close" onClick={() => close('button')} aria-label="Close menu">
                  <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
                    <path d="M5 5l14 14M19 5L5 19" />
                  </svg>
                </button>
              </div>

              <ul className="rack__primary">
                {DRAWER_LINKS.map((item, i) => {
                  const primary = PRIMARY_NAV.find((n) => n.href === item.href)
                  const active = primary ? isNavItemActive(pathname, primary) : isActive(pathname, item.href)
                  return (
                    <li key={item.href} style={{ ['--i' as string]: i }}>
                      <Link
                        href={item.href}
                        className="rack__link"
                        aria-current={active ? 'page' : undefined}
                        onClick={() => item.event && track(item.event, { surface: 'rack' })}
                      >
                        <span className="rack__num">{String(i + 1).padStart(2, '0')}</span>
                        <span className="rack__text">{item.label}</span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}
