'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useId, useRef, useState, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import { track } from '@/lib/analytics'
import { useCart } from '@/features/checkout/cart-store'
import { CONTACT, isActive, PRIMARY_NAV, RACK_SECONDARY } from './nav-config'

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
  const { count } = useCart()
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
                <p id={titleId} className="label label--amber">
                  THE RACK
                </p>
                <button type="button" className="rack__close" onClick={() => close('button')} aria-label="Close menu">
                  <span aria-hidden="true">×</span>
                </button>
              </div>

              <ul className="rack__primary">
                {PRIMARY_NAV.map((item, i) => {
                  const active = isActive(pathname, item.href)
                  return (
                    <li key={item.href} style={{ ['--i' as string]: i }}>
                      <Link
                        href={item.href}
                        className="rack__link"
                        aria-current={active ? 'page' : undefined}
                        onClick={() => track(item.event, { surface: 'rack' })}
                      >
                        <span className="rack__num">0{i + 1}</span>
                        <span className="rack__text">{item.label}</span>
                      </Link>
                    </li>
                  )
                })}
              </ul>

              <hr className="rule" />

              <ul className="rack__secondary">
                {RACK_SECONDARY.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="neon-link">
                      {item.label}
                      {item.href === '/cart' && count > 0 ? ` (${count})` : ''}
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="rack__foot">
                <p className="label">{CONTACT.hours}</p>
                <a className="muted" href={`mailto:${CONTACT.email}`}>
                  {CONTACT.email}
                </a>
                <p className="rack__sign neon" aria-hidden="true">
                  Garage 27
                </p>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}
